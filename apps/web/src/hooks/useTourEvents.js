import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Хук для подписки на SSE-события тура
 * 
 * @param {string|number} tourId - ID тура для подписки
 * @param {Object} handlers - Обработчики событий
 * @param {Function} handlers.onGuestsUpdated - Вызывается при обновлении списка туристов
 * @param {Function} handlers.onTourUpdated - Вызывается при обновлении данных тура
 * @param {Function} handlers.onConnected - Вызывается при успешном подключении
 * @param {Function} handlers.onError - Вызывается при ошибке
 * @param {Object} options - Дополнительные опции
 * @param {boolean} options.enabled - Включить/выключить подписку (по умолчанию true)
 * @param {boolean} options.reconnect - Автоматически переподключаться (по умолчанию true)
 * @param {number} options.reconnectDelay - Задержка перед переподключением в мс (по умолчанию 3000)
 * 
 * @returns {Object} { isConnected, connectionState, reconnect }
 * 
 * @example
 * const { isConnected } = useTourEvents(tourId, {
 *   onGuestsUpdated: (data) => {
 *     console.log('Список туристов обновился:', data);
 *     refetchGuests(); // или mutate() для SWR
 *   },
 *   onTourUpdated: (data) => {
 *     console.log('Тур обновился:', data);
 *     refetchTour();
 *   },
 * });
 */
export function useTourEvents(tourId, handlers = {}, options = {}) {
  const {
    onGuestsUpdated,
    onTourUpdated,
    onConnected,
    onError,
    onDisconnected,
  } = handlers;

  const {
    enabled = true,
    reconnect = true,
    reconnectDelay = 3000,
  } = options;

  const [connectionState, setConnectionState] = useState('disconnected');
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const handlersRef = useRef(handlers);

  // Обновляем handlers ref чтобы не пересоздавать EventSource при изменении callbacks
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    if (!tourId || !enabled) return;

    // Закрываем существующее соединение
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Очищаем таймер реконнекта
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnectionState('connecting');

    const url = `/api/v1/events/tour?tour_id=${tourId}`;
    const eventSource = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = eventSource;

    // Успешное подключение
    eventSource.addEventListener('connected', (e) => {
      setConnectionState('connected');
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onConnected?.(data);
      } catch (err) {
        console.error('[useTourEvents] Failed to parse connected event:', err);
      }
    });

    // Обновление списка туристов
    eventSource.addEventListener('guests_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onGuestsUpdated?.(data);
      } catch (err) {
        console.error('[useTourEvents] Failed to parse guests_updated event:', err);
      }
    });

    // Добавлен один турист
    eventSource.addEventListener('guest_added', (e) => {
      try {
        const data = JSON.parse(e.data);
        // Для простоты просто вызываем onGuestsUpdated
        handlersRef.current.onGuestsUpdated?.(data);
      } catch (err) {
        console.error('[useTourEvents] Failed to parse guest_added event:', err);
      }
    });

    // Обновление тура
    eventSource.addEventListener('tour_updated', (e) => {
      try {
        const data = JSON.parse(e.data);
        handlersRef.current.onTourUpdated?.(data);
      } catch (err) {
        console.error('[useTourEvents] Failed to parse tour_updated event:', err);
      }
    });

    // Heartbeat (для отладки)
    eventSource.addEventListener('heartbeat', (e) => {
      // Можно логировать для отладки
      // console.debug('[useTourEvents] heartbeat');
    });

    // Ошибка соединения
    eventSource.onerror = (err) => {
      console.error('[useTourEvents] Connection error:', err);
      setConnectionState('error');
      handlersRef.current.onError?.(err);
      
      eventSource.close();
      eventSourceRef.current = null;

      // Автоматическое переподключение
      if (reconnect && enabled) {
        setConnectionState('reconnecting');
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[useTourEvents] Attempting to reconnect...');
          connect();
        }, reconnectDelay);
      }
    };

    // Соединение закрыто
    eventSource.onclose = () => {
      setConnectionState('disconnected');
      handlersRef.current.onDisconnected?.();
    };

  }, [tourId, enabled, reconnect, reconnectDelay]);

  // Подключаемся при монтировании или изменении tourId
  useEffect(() => {
    if (enabled && tourId) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [tourId, enabled, connect]);

  // Метод для ручного переподключения
  const manualReconnect = useCallback(() => {
    connect();
  }, [connect]);

  return {
    isConnected: connectionState === 'connected',
    connectionState,
    reconnect: manualReconnect,
  };
}

/**
 * Хук для подписки на события компании (более общие события)
 * Работает аналогично useTourEvents, но для всей компании
 */
export function useCompanyEvents(companyId, handlers = {}, options = {}) {
  // Аналогичная реализация для компании
  // Можно добавить позже при необходимости
  return { isConnected: false, connectionState: 'not-implemented' };
}

export default useTourEvents;
