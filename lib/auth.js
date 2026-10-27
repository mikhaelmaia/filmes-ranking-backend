import jwt from 'jsonwebtoken';

export const PERFIS = {
  mik: { id: 'mik', name: 'Mik', envSenha: 'MIK_PASSWORD_HASH' },
  vit: { id: 'vit', name: 'Vit', envSenha: 'VIT_PASSWORD_HASH' },
};

const EXPIRACAO = '30d';

export function perfilValido(perfil) {
  return typeof perfil === 'string' && Object.hasOwn(PERFIS, perfil);
}

export function gerarToken(perfil) {
  return jwt.sign({ sub: perfil }, obterSegredo(), { expiresIn: EXPIRACAO });
}

/**
 * Valida o header "Authorization: Bearer <token>".
 * Responde 401 e retorna null quando o token falta ou é inválido/expirado.
 */
export function autenticar(req, res) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');

  if (esquema !== 'Bearer' || !token) {
    res.status(401).json({ erro: 'Não autorizado' });
    return null;
  }

  try {
    const payload = jwt.verify(token, obterSegredo());

    if (!perfilValido(payload.sub)) {
      res.status(401).json({ erro: 'Não autorizado' });
      return null;
    }

    return PERFIS[payload.sub];
  } catch {
    res.status(401).json({ erro: 'Não autorizado' });
    return null;
  }
}

function obterSegredo() {
  const segredo = process.env.JWT_SECRET;
  if (!segredo) throw new Error('JWT_SECRET não definida');
  return segredo;
}
