import { useState, useEffect } from 'react';

/**
 * Hook para adicionar um delay na atualização de um valor.
 * Útil para não executar buscas em tempo real a cada tecla digitada (debouncing).
 * @param {any} value O valor que será monitorado
 * @param {number} delay O tempo em milissegundos para esperar antes de atualizar o valor debounced
 * @returns {any} O valor atualizado somente após o delay especificado
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Atualiza o debouncedValue após o tempo especificado
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Se o valor mudar (ou o componente desmontar) antes do delay terminar,
    // nós cancelamos o timeout anterior para que não atualize ainda.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Só recria se value ou delay mudarem

  return debouncedValue;
}
