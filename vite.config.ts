import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'agricultural-assistant-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/classify-disease') && req.method === 'POST') {
              try {
                // Read base64 request content
                let rawBody = '';
                await new Promise((resolve, reject) => {
                  req.on('data', (chunk) => { rawBody += chunk; });
                  req.on('end', resolve);
                  req.on('error', reject);
                });

                const parsed = JSON.parse(rawBody);
                const { base64Image, mimeType } = parsed;

                if (!base64Image) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'No image provided' }));
                  return;
                }

                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
                  // Fallback simulation triggered gracefully
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    isSimulated: true,
                    message: "Using offline Machine Learning simulator (API Key not configured in Secrets panel)."
                  }));
                  return;
                }

                // Initialize GoogleGenAI SDK safely
                const ai = new GoogleGenAI({
                  apiKey: apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    }
                  }
                });

                const classificationPrompt = `Analyze this crop leaf image. Identify if it has any plant disease from the 38 standard plant disease classes. Provide:
1. Diseased or healthy label (e.g. "Tomato Bacterial Spot", "Potato Late Blight", "Apple scab", "Maize Common Rust", "Healthy Crop Leaf")
2. Confidence score as an integer percentage between 60 and 99.
3. Educational description of the pathogen or issue.
4. An array of 3 actionable primary treatments.
5. An array of 3 effective organic or biological preventative methods.

Ensure you return a strict JSON response.`;

                const imagePart = {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Image
                  }
                };

                const response = await ai.models.generateContent({
                  model: 'gemini-3.5-flash',
                  contents: [
                    imagePart,
                    { text: classificationPrompt }
                  ],
                  config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                        diseaseName: { type: Type.STRING },
                        confidence: { type: Type.INTEGER },
                        description: { type: Type.STRING },
                        treatment: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        prevention: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        }
                      },
                      required: ['diseaseName', 'confidence', 'description', 'treatment', 'prevention']
                    }
                  }
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(response.text);
              } catch (err: any) {
                clog('Error processing leaf diagnostic', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message || 'Pathology analysis failed' }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

function clog(msg: string, err: any) {
  console.error(`[AgriSmart Server] ${msg}:`, err);
}
