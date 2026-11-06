/**
 * Development environment. The `ng serve` dev-server proxies /api to the
 * local backend through proxy.conf.json; the absolute base is still used by
 * services that build full URLs.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/api'
};
