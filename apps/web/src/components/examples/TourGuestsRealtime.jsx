/**
 * Пример использования real-time обновлений для списка туристов тура
 * 
 * Этот компонент показывает как интегрировать SSE-события
 * для автоматического обновления списка туристов.
 */

import { useState, useEffect, useCallback } from 'react';
import { useTourEvents } from '../../hooks/useTourEvents';

// Пример: Компонент списка туристов с real-time обновлениями
export function TourGuestsListExample({ tourId }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);

  // Функция загрузки туристов
  const fetchGuests = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/tours/guests/list?tour_id=${tourId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setGuests(data.guests || []);
    } catch (err) {
      console.error('Ошибка загрузки туристов:', err);
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  // Загружаем туристов при монтировании
  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Подключаем SSE для real-time обновлений
  const { isConnected, connectionState } = useTourEvents(tourId, {
    onGuestsUpdated: (data) => {
      console.log('Получено обновление туристов:', data);
      // Вариант 1: Показать уведомление и перезагрузить
      setShowUpdateNotice(true);
      fetchGuests();
      
      // Скрываем уведомление через 3 секунды
      setTimeout(() => setShowUpdateNotice(false), 3000);
    },
    onConnected: (data) => {
      console.log('Подключено к SSE:', data);
    },
    onError: (err) => {
      console.error('Ошибка SSE:', err);
    },
  });

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="tour-guests">
      {/* Индикатор подключения */}
      <div className="connection-status">
        <span 
          className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
          title={connectionState}
        />
        {isConnected ? 'Онлайн' : 'Оффлайн'}
      </div>

      {/* Уведомление об обновлении */}
      {showUpdateNotice && (
        <div className="update-notice">
          ✨ Список туристов обновлён
        </div>
      )}

      {/* Список туристов */}
      <ul className="guests-list">
        {guests.map((guest) => (
          <li key={guest.id} className="guest-item">
            <span className="guest-name">{guest.full_name}</span>
            {guest.phone && <span className="guest-phone">{guest.phone}</span>}
            <span className={`payment-status ${guest.is_paid ? 'paid' : 'unpaid'}`}>
              {guest.is_paid ? '✓ Оплачено' : 'Не оплачено'}
            </span>
          </li>
        ))}
      </ul>

      {guests.length === 0 && (
        <p className="no-guests">Туристов пока нет</p>
      )}

      <style jsx>{`
        .connection-status {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 12px;
          color: #666;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .status-dot.connected {
          background: #22c55e;
          box-shadow: 0 0 4px #22c55e;
        }
        
        .status-dot.disconnected {
          background: #ef4444;
        }
        
        .update-notice {
          background: #dbeafe;
          color: #1e40af;
          padding: 8px 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .guests-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .guest-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .guest-name {
          font-weight: 500;
          flex: 1;
        }
        
        .guest-phone {
          color: #6b7280;
          font-size: 14px;
        }
        
        .payment-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .payment-status.paid {
          background: #dcfce7;
          color: #166534;
        }
        
        .payment-status.unpaid {
          background: #fef3c7;
          color: #92400e;
        }
        
        .no-guests {
          text-align: center;
          color: #9ca3af;
          padding: 32px;
        }
      `}</style>
    </div>
  );
}

// Пример использования в странице тура
export default function TourPageExample() {
  const tourId = 'example-tour-id'; // В реальности из роутера

  return (
    <div>
      <h1>Туристы тура</h1>
      <TourGuestsListExample tourId={tourId} />
    </div>
  );
}
