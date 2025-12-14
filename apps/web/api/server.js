// Vercel serverless function entry point
import server from '../build/server/index.js';

export default async function handler(req, res) {
  return server.fetch(req, {
    waitUntil: () => {},
    passThroughOnException: () => {},
  });
}
