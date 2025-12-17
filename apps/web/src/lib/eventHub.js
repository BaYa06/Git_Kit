/**
 * EventHub — простой in-memory pub/sub для SSE событий.
 * 
 * Позволяет подписываться на каналы (tour:123, company:456)
 * и публиковать события, которые рассылаются всем подписчикам.
 * 
 * Важно: работает только в рамках одного процесса Node.js.
 * Для масштабирования на несколько серверов нужен Redis Pub/Sub.
 */

import { EventEmitter } from 'events';

class EventHub extends EventEmitter {
  constructor() {
    super();
    // Увеличиваем лимит слушателей (по умолчанию 10)
    this.setMaxListeners(1000);
    
    // Храним активные SSE-соединения по каналам
    // channel -> Set<{ res, userId }>
    this.channels = new Map();
  }

  /**
   * Подписать SSE-соединение на канал
   * @param {string} channel - например "tour:123" или "company:456"
   * @param {object} res - response объект Next.js
   * @param {string} userId - ID пользователя для авторизации
   */
  subscribe(channel, res, userId) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    const subscriber = { res, userId, subscribedAt: Date.now() };
    this.channels.get(channel).add(subscriber);
    
    console.log(`[EventHub] +1 subscriber to ${channel}, total: ${this.channels.get(channel).size}`);
    
    return subscriber;
  }

  /**
   * Отписать SSE-соединение от канала
   */
  unsubscribe(channel, subscriber) {
    const subs = this.channels.get(channel);
    if (subs) {
      subs.delete(subscriber);
      console.log(`[EventHub] -1 subscriber from ${channel}, remaining: ${subs.size}`);
      if (subs.size === 0) {
        this.channels.delete(channel);
      }
    }
  }

  /**
   * Опубликовать событие в канал
   * @param {string} channel - канал (например "tour:123")
   * @param {string} eventType - тип события (например "guests_updated")
   * @param {object} data - данные события
   * @param {string} [excludeUserId] - исключить пользователя (не отправлять автору изменений)
   */
  publish(channel, eventType, data = {}, excludeUserId = null) {
    const subs = this.channels.get(channel);
    if (!subs || subs.size === 0) {
      console.log(`[EventHub] No subscribers for ${channel}`);
      return 0;
    }

    const message = this.formatSSE(eventType, {
      ...data,
      timestamp: Date.now(),
    });

    let sentCount = 0;
    const deadConnections = [];

    for (const sub of subs) {
      // Пропускаем автора изменений
      if (excludeUserId && sub.userId === excludeUserId) {
        continue;
      }

      try {
        sub.res.write(message);
        sentCount++;
      } catch (err) {
        console.error(`[EventHub] Failed to send to subscriber:`, err.message);
        deadConnections.push(sub);
      }
    }

    // Удаляем мёртвые соединения
    for (const dead of deadConnections) {
      subs.delete(dead);
    }

    console.log(`[EventHub] Published "${eventType}" to ${channel}, sent to ${sentCount} subscribers`);
    return sentCount;
  }

  /**
   * Опубликовать событие во все каналы компании
   * Полезно для событий типа "новый тур создан"
   */
  publishToCompany(companyId, eventType, data = {}, excludeUserId = null) {
    return this.publish(`company:${companyId}`, eventType, data, excludeUserId);
  }

  /**
   * Опубликовать событие в канал тура
   */
  publishToTour(tourId, eventType, data = {}, excludeUserId = null) {
    return this.publish(`tour:${tourId}`, eventType, data, excludeUserId);
  }

  /**
   * Форматировать SSE-сообщение
   */
  formatSSE(event, data) {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  }

  /**
   * Отправить heartbeat всем подписчикам (чтобы соединение не закрылось)
   */
  heartbeat() {
    const message = this.formatSSE('heartbeat', { time: Date.now() });
    let total = 0;
    
    for (const [channel, subs] of this.channels) {
      for (const sub of subs) {
        try {
          sub.res.write(message);
          total++;
        } catch (err) {
          // Соединение умерло, будет удалено при следующем publish
        }
      }
    }
    
    return total;
  }

  /**
   * Получить статистику
   */
  getStats() {
    const stats = {
      totalChannels: this.channels.size,
      totalSubscribers: 0,
      channels: {},
    };
    
    for (const [channel, subs] of this.channels) {
      stats.channels[channel] = subs.size;
      stats.totalSubscribers += subs.size;
    }
    
    return stats;
  }
}

// Singleton — один экземпляр на весь процесс
const eventHub = global.eventHub || new EventHub();

if (process.env.NODE_ENV !== 'production') {
  global.eventHub = eventHub;
}

// Heartbeat каждые 30 секунд
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    eventHub.heartbeat();
  }, 30000);
}

export default eventHub;

// Типы событий (для документации)
export const EVENT_TYPES = {
  // События туристов
  GUESTS_UPDATED: 'guests_updated',
  GUEST_ADDED: 'guest_added',
  GUEST_REMOVED: 'guest_removed',
  GUEST_PAYMENT: 'guest_payment',
  
  // События тура
  TOUR_UPDATED: 'tour_updated',
  TOUR_STATUS_CHANGED: 'tour_status_changed',
  
  // События компании
  TOUR_CREATED: 'tour_created',
  TOUR_DELETED: 'tour_deleted',
};
