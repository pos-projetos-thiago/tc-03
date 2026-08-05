import { useEffect, useState } from 'react';

/**
 * Retorna o valor após o delay em ms (padrão 400ms).
 * Útil para evitar chamadas excessivas em campos de busca/filtro.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
