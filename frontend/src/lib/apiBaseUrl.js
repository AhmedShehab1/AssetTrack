let apiBaseUrl;

try {
  // eslint-disable-next-line no-eval
  const meta = eval('import.meta');
  apiBaseUrl = meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';
} catch {
  // Jest environment - use process.env
  apiBaseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
}

export default apiBaseUrl;
