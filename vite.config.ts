import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { GoogleGenAI, Type, Schema } from '@google/genai';

function backendApiPlugin(): Plugin {
  return {
    name: 'backend-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/pdf/parse' && req.method === 'POST') {
          // Increase payload limit for large PDFs
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              if (!data.base64) {
                throw new Error("Missing base64 data");
              }

              const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
              
              const schema: Schema = {
                type: Type.ARRAY,
                description: "List of reading tasks and assignments extracted from the material",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "Title of the reading or task" },
                    description: { type: Type.STRING, description: "Description or notes" },
                    dueDate: { type: Type.STRING, description: "ISO 8601 date string, or empty string if optional/no strict deadline" },
                    estimatedMinutes: { type: Type.INTEGER, description: "Estimated time in minutes" }
                  },
                  required: ["title", "description", "dueDate", "estimatedMinutes"]
                }
              };

              const interaction = await ai.interactions.create({
                model: 'gemini-3.6-flash',
                input: [
                  {
                    type: "document",
                    data: data.base64,
                    mime_type: 'application/pdf',
                  },
                  {
                    type: "text",
                    text: "Extract all required readings, assignments, and tasks from this document. Return them as a structured list. If a task does not have a strict deadline, set the dueDate to an empty string."
                  }
                ],
                response_format: schema,
              });

              let jsonStr = '[]';
              const lastStep = interaction.steps?.at(-1);
              if (lastStep?.type === 'model_output') {
                const textContent = lastStep.content?.find((c: any) => c.type === 'text');
                if (textContent && textContent.text) {
                  jsonStr = textContent.text.trim();
                }
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, tasks: JSON.parse(jsonStr) }));
            } catch (err: any) {
              console.error('PDF parsing error:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

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
              const isLoggedIn = data.isLoggedIn !== false;

              if (!isLoggedIn) {
                res.statusCode = 401;
                res.end(
                  JSON.stringify({
                    success: false,
                    error:
                      'You are not logged in to uOttawa Brightspace. Please sign in to authenticate your uOttawa Brightspace session before exploring coursework.',
                  })
                );
                return;
              }

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
    plugins: [react(), tailwindcss(), backendApiPlugin()],
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
