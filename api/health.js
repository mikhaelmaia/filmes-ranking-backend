import { aplicarCors } from '../lib/cors.js';

export default function handler(req, res) {
  if (aplicarCors(req, res)) return;

  if (req.method !== 'GET') {
    res.status(405).json({ erro: 'Método não permitido' });
    return;
  }

  res.status(200).json({ ok: true, hora: new Date().toISOString() });
}
