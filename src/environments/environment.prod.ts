/**
 * Production environment (Render static site). The Angular build swaps this
 * file in for `environment.ts` via angular.json `fileReplacements`, so the
 * deployed frontend talks to the Render backend over CORS.
 */
export const environment = {
  production: true,
  apiUrl: 'https://backend-calistenic.onrender.com/api'
};
