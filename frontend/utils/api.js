export const resolveApiBaseUrl = () => {
  const apiConfigurada = import.meta.env.VITE_API_URL?.trim();

  if (apiConfigurada) {
    return apiConfigurada.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.hostname) {
    const protocolo = window.location.protocol?.startsWith('http') ? window.location.protocol : 'http:';
    return `${protocolo}//${window.location.hostname}:5000`;
  }

  return 'http://localhost:5000';
};