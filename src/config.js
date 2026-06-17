// Dynamic configuration for API endpoints
// In development, requests are proxied via Vite (empty string target).
// In production (Vercel deployment), requests are sent to the cPanel Node app.
export const API_BASE = import.meta.env.DEV ? '' : 'https://amigowebster.in/resturatant';
