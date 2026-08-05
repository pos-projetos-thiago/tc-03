export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'E-mail é obrigatório';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'E-mail inválido';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Senha é obrigatória';
  if (password.length < 6) return 'A senha deve ter no mínimo 6 caracteres';
  if (password.length > 128) return 'A senha deve ter no máximo 128 caracteres';
  return null;
}

export function validateAmount(amount: number | string): string | null {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num <= 0) return 'O valor deve ser maior que zero';
  return null;
}
