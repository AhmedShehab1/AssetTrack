/**
 * Thin wrapper around browser navigation.
 *
 * Why this exists:
 * window.location.href cannot be spied on in Jest — jsdom marks it as
 * non-configurable. By routing all navigation through this function, tests
 * can mock the entire module and assert navigateTo('/login') was called.
 *
 * Usage in app:  navigateTo('/login')
 * Usage in test: jest.mock('../lib/navigation') → expect(navigateTo).toHaveBeenCalledWith('/login')
 */
export const navigateTo = (path) => {
  window.location.href = path;
};