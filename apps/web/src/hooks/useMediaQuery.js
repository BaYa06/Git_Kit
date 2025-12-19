import { useState, useEffect } from 'react';

/**
 * Hook для определения соответствия media query
 * @param {string} query - Media query строка (например: '(min-width: 768px)')
 * @returns {boolean} - true если media query соответствует
 * 
 * @example
 * const isDesktop = useMediaQuery('(min-width: 768px)');
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Проверка что мы на клиенте
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);
    
    // Устанавливаем начальное значение
    setMatches(media.matches);

    // Обработчик изменений
    const listener = (event) => {
      setMatches(event.matches);
    };

    // Поддержка старых браузеров
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Предустановленные breakpoints
 */
export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

/**
 * Хуки для часто используемых breakpoints
 */
export const useIsDesktop = () => useMediaQuery(breakpoints.md);
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
