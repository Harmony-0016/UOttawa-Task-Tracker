import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function backendApiPlugin(): Plugin {
  return {
    name: 'backend-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        // Original Brightspace endpoints
        if (req.url === '/api/brightspace/whoami') {
          const isLoggedOut = req.headers['x-session-status'] === 'logged_out';

          if (isLoggedOut) {
            res.statusCode = 401;
            res.end(
              JSON.stringify({
                isLoggedIn: false,
                error:
                  'You are not logged in to uOttawa Brightspace. Please sign in to authenticate your uOttawa Brightspace session before exploring coursework.',
              })
            );
            return;
          }

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              isLoggedIn: true,
              user: {
                studentName: 'Gee-Gee Student',
                studentEmail: 'student@uottawa.ca',
                studentId: '300298144',
                institution: "University of Ottawa / Université d'Ottawa",
                sessionActive: true,
              },
            })
          );
          return;
        }

        if (req.url === '/api/brightspace/explore' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = body ? JSON.parse(body) : {};

              if (data.feedUrl && typeof data.feedUrl === 'string' && data.feedUrl.startsWith('http')) {
                try {
                  const feedRes = await fetch(data.feedUrl, {
                    headers: {
                      'User-Agent': 'uOttawa-Desktop-TaskSync/1.0',
                    },
                  });
                  if (feedRes.ok) {
                    const text = await feedRes.text();
                    res.statusCode = 200;
                    res.end(
                      JSON.stringify({
                        success: true,
                        rawIcs: text,
                        source: 'brightspace_calendar_feed',
                      })
                    );
                    return;
                  }
                } catch (feedErr) {
                  console.warn('Direct feed fetch failed, falling back to portal discovery:', feedErr);
                }
              }

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  source: 'uottawa_brightspace_portal',
                  portalEndpoint: 'https://uottawa.brightspace.com/d2l/api/lp/1.43',
                })
              );
            } catch (err: unknown) {
              res.statusCode = 500;
              res.end(
                JSON.stringify({
                  success: false,
                  error: err instanceof Error ? err.message : 'Exploration failed',
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      backendApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
        manifest: {
          id: '/',
          name: 'uOttawa Brightspace Tasks',
          short_name: 'uO Tasks',
          description: 'uOttawa Brightspace Offline Tasks and Sync.',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icon.svg',
              sizes: '192x192 512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/d2l-proxy': {
          target: 'https://uottawa.brightspace.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/d2l-proxy/, ''),
          headers: {
            Origin: 'https://uottawa.brightspace.com',
            Referer: 'https://uottawa.brightspace.com/',
          },
        },
      },
    },
  };
});
