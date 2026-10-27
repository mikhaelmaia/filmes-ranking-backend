/**
 * O runtime da Vercel costuma entregar req.body já parseado, mas pode vir
 * como string. Retorna null quando o JSON é inválido.
 */
export function lerCorpo(req) {
  if (req.body == null) return null;

  if (typeof req.body === 'string') {
    if (!req.body.trim()) return null;
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  if (Buffer.isBuffer(req.body)) {
    try {
      return JSON.parse(req.body.toString('utf8'));
    } catch {
      return null;
    }
  }

  return req.body;
}
