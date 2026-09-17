const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.interactions.create({
  model: 'gemini-3.8-flash',
  input: [
    { type: "text", text: "Hello" }
  ]
}).then(console.log).catch(err => console.error(err.message));
