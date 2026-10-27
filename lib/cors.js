const METODOS = 'GET, POST, PUT, DELETE, OPTIONS';

/**
 * Aplica os headers de CORS. Retorna true quando a requisição já foi
 * respondida (preflight OPTIONS) e o handler deve parar.
 */
export function aplicarCors(req, res) {
  const origem = process.env.FRONTEND_URL || '*';

  res.setHeader('Access-Control-Allow-Origin', origem);
  res.setHeader('Access-Control-Allow-Methods', METODOS);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (origem !== '*') res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }

  return false;
}
