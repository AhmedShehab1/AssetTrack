// src/__tests__/axios.test.js

import MockAdapter from 'axios-mock-adapter';
import axiosInstance from '../axios.js';
import * as navigation from '../navigation.js';

jest.mock('../navigation.js', () => ({
  navigateTo: jest.fn(),
}));

jest.mock('../apiBaseUrl.js', () => ({
  __esModule: true,
  default: 'http://localhost:8080/api',
}));


jest.mock('../../store/useAuthStore.js', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(),
  },
}));

// This import now correctly receives the mocked default export
import useAuthStore from '../../store/useAuthStore.js';

// ─── Shared test state ────────────────────────────────────────────────────────
let mock;
let logoutMock;

beforeEach(() => {
  // Fresh mock adapter on your real axiosInstance before every test.
  // Requests that don't match a registered handler will throw — good for
  // catching unexpected calls.
  mock = new MockAdapter(axiosInstance);

  // Fresh logout spy for each test
  logoutMock = jest.fn();

  // Default state: unauthenticated (no token)
  useAuthStore.getState.mockReturnValue({
    token: null,
    logout: logoutMock,
  });

  // Clear navigation call history
  navigation.navigateTo.mockClear();
});

afterEach(() => {
  // Detach mock adapter so the axiosInstance is clean for the next test file
  mock.restore();
});

// ─────────────────────────────────────────────────────────────────────────────
// INSTANCE CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

describe('instance configuration', () => {
  test('baseURL points to the Spring Boot API root', () => {
    expect(axiosInstance.defaults.baseURL).toBe('http://localhost:8080/api');
  });

  test('timeout is 10 000 ms', () => {
    expect(axiosInstance.defaults.timeout).toBe(10_000);
  });

  test('default Content-Type is application/json', () => {
    // axios v1+ stores instance-level headers under defaults.headers
    const ct =
      axiosInstance.defaults.headers['Content-Type'] ??
      axiosInstance.defaults.headers.common?.['Content-Type'];
    expect(ct).toBe('application/json');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST INTERCEPTOR
// ─────────────────────────────────────────────────────────────────────────────

describe('request interceptor', () => {
  test('attaches Authorization: Bearer <token> when a token exists in the store', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

    // Put an authenticated state in the store for this test
    useAuthStore.getState.mockReturnValue({
      token: fakeToken,
      logout: logoutMock,
    });

    mock.onGet('/assets').reply(200, []);

    // Add a secondary interceptor to capture the outgoing config AFTER the
    // primary interceptor has already run and added the Authorization header
    let capturedConfig;
    const spy = axiosInstance.interceptors.request.use((config) => {
      capturedConfig = config;
      return config;
    });

    await axiosInstance.get('/assets');

    expect(capturedConfig.headers.Authorization).toBe(`Bearer ${fakeToken}`);

    // Always clean up secondary interceptors so they don't bleed into other tests
    axiosInstance.interceptors.request.eject(spy);
  });

  test('does NOT add an Authorization header when no token is stored', async () => {
    // Store already returns token: null from beforeEach
    mock.onGet('/assets').reply(200, []);

    let capturedConfig;
    const spy = axiosInstance.interceptors.request.use((config) => {
      capturedConfig = config;
      return config;
    });

    await axiosInstance.get('/assets');

    expect(capturedConfig.headers.Authorization).toBeUndefined();

    axiosInstance.interceptors.request.eject(spy);
  });

  test('always sends Content-Type: application/json', async () => {
    mock.onPost('/assets').reply(201, { id: 1 });

    let capturedConfig;
    const spy = axiosInstance.interceptors.request.use((config) => {
      capturedConfig = config;
      return config;
    });

    await axiosInstance.post('/assets', { name: 'MacBook Pro' });

    const ct =
      capturedConfig.headers['Content-Type'] ??
      capturedConfig.headers.common?.['Content-Type'];

    expect(ct).toMatch(/application\/json/);

    axiosInstance.interceptors.request.eject(spy);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────────────────────

describe('response interceptor', () => {
  test('passes 2xx responses through to the caller unchanged', async () => {
    const payload = [{ id: 1, name: 'Dell XPS 15', status: 'AVAILABLE' }];
    mock.onGet('/assets').reply(200, payload);

    const response = await axiosInstance.get('/assets');

    expect(response.status).toBe(200);
    expect(response.data).toEqual(payload);
  });

  test('calls store.logout() when the server returns 401', async () => {
    mock.onGet('/profile').reply(401, { message: 'Unauthorized' });

    // rejects.toThrow() awaits the rejection — necessary because the
    // interceptor rejects the promise after calling logout
    await expect(axiosInstance.get('/profile')).rejects.toThrow();

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  test('redirects to /login when the server returns 401', async () => {
    mock.onGet('/profile').reply(401);

    await expect(axiosInstance.get('/profile')).rejects.toThrow();

    expect(navigation.navigateTo).toHaveBeenCalledWith('/login');
    expect(navigation.navigateTo).toHaveBeenCalledTimes(1);
  });

  test('does NOT call logout() on a 403 Forbidden response', async () => {
    mock.onDelete('/assets/99').reply(403, { message: 'Forbidden' });

    await expect(axiosInstance.delete('/assets/99')).rejects.toThrow();

    expect(logoutMock).not.toHaveBeenCalled();
  });

  test('does NOT call logout() on a 404 Not Found response', async () => {
    mock.onGet('/assets/999').reply(404);

    await expect(axiosInstance.get('/assets/999')).rejects.toThrow();

    expect(logoutMock).not.toHaveBeenCalled();
  });

  test('does NOT redirect on a 403 Forbidden response', async () => {
    mock.onGet('/assets').reply(403);

    await expect(axiosInstance.get('/assets')).rejects.toThrow();

    expect(navigation.navigateTo).not.toHaveBeenCalled();
  });

  test('rejects the promise on 5xx so callers can .catch() server errors', async () => {
    mock.onGet('/assets').reply(500, { message: 'Internal server error' });

    await expect(axiosInstance.get('/assets')).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  test('rejects the promise on 401 so callers still know the request failed', async () => {
    mock.onGet('/assets').reply(401);

    await expect(axiosInstance.get('/assets')).rejects.toMatchObject({
      response: { status: 401 },
    });
  });
});
