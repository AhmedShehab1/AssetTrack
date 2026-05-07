// src/pages/AxiosSandboxPage.jsx
// ─── DEV ONLY ─────────────────────────────────────────────────────────────────
// Add to App.jsx routes (inside a DEV guard):
//   { path: '/__sandbox/axios', element: <AxiosSandboxPage /> }
// ─────────────────────────────────────────────────────────────────────────────
/* eslint-disable react-hooks/purity */

import { useState, useEffect, useRef } from 'react';
import MockAdapter from 'axios-mock-adapter';
import axiosInstance from '../lib/axios';
import useAuthStore from '../store/useAuthStore';

// Install a mock adapter on the real axiosInstance.
// passThrough: true means unregistered routes fall through to the network,
// so if your backend IS running, real calls still work.
const mock = new MockAdapter(axiosInstance, { onNoMatch: 'passthrough' });

// ─── Scenario definitions ─────────────────────────────────────────────────────
// Each scenario fires a real call through axiosInstance (with mock intercept)
// and documents what the interceptors should do.

const SCENARIOS = [
  {
    id: 'get-assets-200',
    label: 'GET /assets → 200 OK',
    description: 'Happy path. Response interceptor passes data through unchanged.',
    tag: 'request',
    run: () => {
      mock.onGet('/assets').replyOnce(200, [
        { id: 1, name: 'Dell XPS 15', status: 'AVAILABLE' },
        { id: 2, name: 'MacBook Pro M3', status: 'ALLOCATED' },
      ]);
      return axiosInstance.get('/assets');
    },
  },
  {
    id: 'post-asset-201',
    label: 'POST /assets → 201 Created',
    description: 'Write operation. Request interceptor attaches JWT if present.',
    tag: 'request',
    run: () => {
      mock.onPost('/assets').replyOnce(201, { id: 99, name: 'ThinkPad X1' });
      return axiosInstance.post('/assets', { name: 'ThinkPad X1', serialNumber: 'TP-001' });
    },
  },
  {
    id: 'get-401',
    label: 'GET /profile → 401 Unauthorized',
    description: 'Response interceptor calls logout() and navigateTo("/login"). Promise still rejects.',
    tag: 'auth',
    run: () => {
      mock.onGet('/profile').replyOnce(401, { message: 'Token expired' });
      return axiosInstance.get('/profile');
    },
  },
  {
    id: 'get-403',
    label: 'GET /admin → 403 Forbidden',
    description: 'Response interceptor does NOT call logout(). Only 401 triggers that.',
    tag: 'auth',
    run: () => {
      mock.onGet('/admin').replyOnce(403, { message: 'Insufficient role' });
      return axiosInstance.get('/admin');
    },
  },
  {
    id: 'get-404',
    label: 'GET /assets/999 → 404 Not Found',
    description: 'Interceptor is silent. Promise rejects — caller must handle.',
    tag: 'error',
    run: () => {
      mock.onGet('/assets/999').replyOnce(404, { message: 'Asset not found' });
      return axiosInstance.get('/assets/999');
    },
  },
  {
    id: 'get-500',
    label: 'GET /assets → 500 Server Error',
    description: 'Interceptor is silent. Promise rejects — caller must handle.',
    tag: 'error',
    run: () => {
      mock.onGet('/assets').replyOnce(500, { message: 'Internal server error' });
      return axiosInstance.get('/assets');
    },
  },
  {
    id: 'network-error',
    label: 'Network Error (no response)',
    description: 'Simulates the backend being unreachable. error.response is undefined.',
    tag: 'error',
    run: () => {
      mock.onGet('/health').networkErrorOnce();
      return axiosInstance.get('/health');
    },
  },
];

const TAG_STYLES = {
  request: { bg: '#EEF2FF', color: '#3F51B5', label: 'request' },
  auth:    { bg: '#FFF7ED', color: '#C2410C', label: 'auth'    },
  error:   { bg: '#FEF2F2', color: '#B91C1C', label: 'error'   },
};

const STATUS_COLOR = (status) => {
  if (!status) return '#6C757D';
  if (status < 300) return '#28A745';
  if (status < 400) return '#17A2B8';
  if (status === 401) return '#C2410C';
  if (status < 500) return '#FFC107';
  return '#DC3545';
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AxiosSandboxPage() {
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(null);
  const [token, setToken] = useState('');
  const logEndRef = useRef(null);

  const storeToken = useAuthStore((s) => s.token);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  // Auto-scroll log panel
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (entry) =>
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), ...entry }]);

  const runScenario = async (scenario) => {
    setRunning(scenario.id);

    const startedAt = performance.now();
    const currentToken = useAuthStore.getState().token;

    addLog({
        type: 'request',
        scenarioLabel: scenario.label,
        message: `→ Firing: ${scenario.label}`,
        detail: currentToken
        ? `Request interceptor will attach: Authorization: Bearer ${currentToken.slice(0, 20)}...`
        : 'No token in store — Authorization header will be omitted.',
        ts: new Date().toISOString(),
    });

    try {
        const response = await scenario.run();
        addLog({
        type: 'success',
        scenarioLabel: scenario.label,
        message: `✓ ${response.status} ${response.statusText || 'OK'}`,
        detail: JSON.stringify(response.data, null, 2),
        status: response.status,
        duration: Math.round(performance.now() - startedAt),
        ts: new Date().toISOString(),
        });
    } catch (err) {
        const status = err.response?.status;

        const interceptorNote = !err.response
        ? 'No response received (network error). error.response is undefined.'
        : status === 401
            ? `⚡ Interceptor fired: logout() called + navigateTo("/login") called. Token now: ${useAuthStore.getState().token ?? 'null'}`
            : `Interceptor was silent on ${status}. Promise rejected — caller must handle.`;

        addLog({
        type: 'error',
        scenarioLabel: scenario.label,
        message: status
            ? `✕ ${status} ${err.response?.statusText || 'Error'}`
            : '✕ Network Error',
        detail: err.response?.data
            ? JSON.stringify(err.response.data, null, 2)
            : err.message,
        interceptorNote,
        status,
        duration: Math.round(performance.now() - startedAt),
        ts: new Date().toISOString(),
        });
    } finally {
        setRunning(null);
    }
    };

  const handleSetToken = () => {
    if (token.trim()) {
      login({ id: 1, email: 'dev@assettrack.io', role: 'ADMIN' }, token.trim());
      addLog({
        type: 'info',
        message: `Token set in Zustand store`,
        detail: `Bearer ${token.trim().slice(0, 30)}...`,
        ts: Date.now(),
      });
    }
  };

  const handleClearToken = () => {
    logout();
    addLog({
      type: 'info',
      message: 'Token cleared from Zustand store',
      detail: 'Subsequent requests will not have an Authorization header.',
      ts: Date.now(),
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E9ECEF', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28A745' }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#6C757D', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Dev Tool</span>
        <span style={{ color: '#DEE2E6' }}>·</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#212529' }}>Axios Interceptor Sandbox</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#ADB5BD' }}>src/lib/axios.js</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 0, height: 'calc(100vh - 57px)' }}>

        {/* Left Panel — Controls */}
        <div style={{ background: '#fff', borderRight: '1px solid #E9ECEF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Auth State */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E9ECEF' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#ADB5BD', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 10px' }}>Auth State</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: storeToken ? '#28A745' : '#DEE2E6', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: storeToken ? '#212529' : '#ADB5BD' }}>
                {storeToken ? `Token: ${storeToken.slice(0, 24)}…` : 'No token — unauthenticated'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste a JWT..."
                style={{ flex: 1, fontSize: 12, padding: '6px 10px', border: '1px solid #DEE2E6', borderRadius: 6, outline: 'none', color: '#212529', background: '#F8F9FA' }}
              />
              <button
                onClick={handleSetToken}
                style={{ padding: '6px 12px', fontSize: 12, fontWeight: 500, background: '#3F51B5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Set
              </button>
            </div>

            {storeToken && (
              <button
                onClick={handleClearToken}
                style={{ marginTop: 8, width: '100%', padding: '6px', fontSize: 12, color: '#DC3545', background: 'transparent', border: '1px solid #F5C6CB', borderRadius: 6, cursor: 'pointer' }}
              >
                Clear token (simulate logout)
              </button>
            )}

            <div style={{ marginTop: 10, padding: '6px 10px', background: '#F8F9FA', borderRadius: 6, fontSize: 11, color: '#6C757D' }}>
              <strong style={{ color: '#212529' }}>Tip:</strong> Use the fake JWT below to test the authed path — it won't validate on a real server but the interceptor just reads from the store and attaches it.
              <button
                onClick={() => setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNTE2MjM5MDIyfQ.fake_sig')}
                style={{ display: 'block', marginTop: 6, fontSize: 11, color: '#3F51B5', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Use fake JWT
              </button>
            </div>
          </div>

          {/* Scenarios */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#ADB5BD', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '4px 0 12px' }}>Scenarios</p>

            {SCENARIOS.map((s) => {
              const tagStyle = TAG_STYLES[s.tag];
              const isRunning = running === s.id;
              return (
                <div
                  key={s.id}
                  style={{ marginBottom: 8, padding: '10px 12px', border: '1px solid #E9ECEF', borderRadius: 8, background: isRunning ? '#F8F9FA' : '#fff', transition: 'background 0.15s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: tagStyle.bg, color: tagStyle.color }}>
                          {tagStyle.label}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: '#212529' }}>{s.label}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#6C757D', lineHeight: 1.4 }}>{s.description}</p>
                    </div>
                    <button
                      onClick={() => runScenario(s)}
                      disabled={!!running}
                      style={{ flexShrink: 0, padding: '5px 12px', fontSize: 12, fontWeight: 500, background: isRunning ? '#E9ECEF' : '#3F51B5', color: isRunning ? '#6C757D' : '#fff', border: 'none', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer', opacity: running && !isRunning ? 0.5 : 1 }}
                    >
                      {isRunning ? '…' : 'Run'}
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              onClick={() => {
                setLogs([]);
              }}
              style={{ width: '100%', marginTop: 4, padding: '8px', fontSize: 12, color: '#ADB5BD', background: 'transparent', border: '1px dashed #DEE2E6', borderRadius: 6, cursor: 'pointer' }}
            >
              Clear log
            </button>
          </div>
        </div>

        {/* Right Panel — Live Log */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #E9ECEF', background: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#ADB5BD', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Request Log</span>
            <span style={{ fontSize: 11, color: '#ADB5BD' }}>— interceptors annotated inline</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {logs.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 60, color: '#ADB5BD' }}>
                <p style={{ fontSize: 14, margin: 0 }}>No requests yet.</p>
                <p style={{ fontSize: 12, margin: '4px 0 0' }}>Run a scenario to see your interceptors in action.</p>
              </div>
            )}

            {logs.map((log) => {
              const borderColor =
                log.type === 'success' ? '#D1FAE5' :
                log.type === 'error'   ? '#FEE2E2' :
                log.type === 'request' ? '#E0E7FF' :
                                         '#F3F4F6';
              const labelColor =
                log.type === 'success' ? '#28A745' :
                log.type === 'error'   ? '#DC3545' :
                log.type === 'request' ? '#3F51B5' :
                                         '#6C757D';

              return (
                <div
                  key={log.id}
                  style={{ marginBottom: 10, padding: '12px 14px', background: '#fff', border: `1px solid ${borderColor}`, borderLeft: `3px solid ${labelColor}`, borderRadius: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: log.detail ? 6 : 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#212529' }}>{log.message}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {log.status !== undefined && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLOR(log.status) }}>
                          {log.status}
                        </span>
                      )}
                      {log.duration !== undefined && (
                        <span style={{ fontSize: 11, color: '#ADB5BD' }}>{log.duration}ms</span>
                      )}
                      <span style={{ fontSize: 11, color: '#ADB5BD' }}>
                        {new Date(log.ts).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {log.detail && (
                    <pre style={{ margin: '4px 0 0', fontSize: 11, color: '#495057', background: '#F8F9FA', padding: '6px 8px', borderRadius: 4, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {log.detail}
                    </pre>
                  )}

                  {log.interceptorNote && (
                    <div style={{ marginTop: 6, padding: '6px 10px', background: '#FFF7ED', borderRadius: 4, fontSize: 11, color: '#C2410C', fontWeight: 500 }}>
                      ⚡ {log.interceptorNote}
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}