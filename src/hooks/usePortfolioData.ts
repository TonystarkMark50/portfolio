import { useState, useEffect } from 'react';

export function useData<T>(loader: () => Promise<T | null>, fallback: T): T {
  const [data, setData] = useState<T>(fallback);

  useEffect(() => {
    let cancelled = false;
    loader()
      .then((result) => {
        if (!cancelled && result !== null) {
          setData(result);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
