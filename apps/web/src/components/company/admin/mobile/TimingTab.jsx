import { useState } from "react";
import base from "../../../../styles/admin/base.module.css";
import timingStyles from "../../../../styles/admin/timing.module.css";

const s = {
  ...base,
  ...timingStyles,
};

export default function TimingTab({ timing = [], setTiming }) {
  const [viewMode, setViewMode] = useState("edit"); // 'edit' | 'preview'
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedDayId, setDraggedDayId] = useState(null);

  // Если timing пустой, инициализируем с примером
  const days = timing.length > 0 ? timing : [
    {
      id: 1,
      date: "12 Янв",
      isExpanded: true,
      items: [],
    },
  ];

  const setDays = (updater) => {
    if (typeof updater === 'function') {
      setTiming(updater(days));
    } else {
      setTiming(updater);
    }
  };

  const typeColors = {
    meeting: "text-emerald-400 bg-emerald-400/10",
    location: "text-blue-400 bg-blue-400/10",
    transfer: "text-cyan-400 bg-cyan-400/10",
    breakfast: "text-yellow-400 bg-yellow-400/10",
    lunch: "text-orange-400 bg-orange-400/10",
    dinner: "text-amber-400 bg-amber-400/10",
    excursion: "text-purple-400 bg-purple-400/10",
    hotel: "text-indigo-400 bg-indigo-400/10",
  };

  const previewColors = {
    meeting: "#10b981",  // emerald-500
    location: "#3b82f6", // blue-500
    transfer: "#06b6d4", // cyan-500
    breakfast: "#eab308", // yellow-500
    lunch: "#f97316",    // orange-500
    dinner: "#f59e0b",   // amber-500
    excursion: "#a855f7",// purple-500
    hotel: "#6366f1",    // indigo-500
  };

  const typeIcons = {
    meeting: "groups",
    departure: "flight_takeoff",
    location: "place",
    transfer: "directions_bus",
    flight: "flight",
    breakfast: "free_breakfast",
    lunch: "restaurant",
    dinner: "dinner_dining",
  };

  const getTypeLabel = (type) => {
    const labels = {
      meeting: "Встреча",
      location: "Место",
      transfer: "Трансфер",
      breakfast: "Завтрак",
      lunch: "Обед",
      dinner: "Ужин",
      excursion: "Экскурсия",
      hotel: "Отель",
    };
    return labels[type] || type;
  };

  const toggleDay = (dayId) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId ? { ...d, isExpanded: !d.isExpanded } : d
      )
    );
  };

  const addItemToDay = (dayId) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              items: [
                ...d.items,
                {
                  id: `item${Date.now()}`,
                  time: "12:00",
                  type: "meeting",
                  title: "",
                  comment: "",
                },
              ],
            }
          : d
      )
    );
  };

  const deleteItemFromDay = (dayId, itemId) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, items: d.items.filter((item) => item.id !== itemId) }
          : d
      )
    );
  };

  const duplicateItem = (dayId, itemId) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const itemIndex = d.items.findIndex((item) => item.id === itemId);
          if (itemIndex !== -1) {
            const itemToDuplicate = d.items[itemIndex];
            const newItem = {
              ...itemToDuplicate,
              id: `item${Date.now()}`,
            };
            const newItems = [...d.items];
            newItems.splice(itemIndex + 1, 0, newItem);
            return { ...d, items: newItems };
          }
        }
        return d;
      })
    );
  };

  const updateItem = (dayId, itemId, field, value) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              items: d.items.map((item) =>
                item.id === itemId ? { ...item, [field]: value } : item
              ),
            }
          : d
      )
    );
  };

  const deleteDay = (dayId) => {
    setDays((prev) => prev.filter((d) => d.id !== dayId));
  };

  const addNewDay = () => {
    const maxId = Math.max(...days.map((d) => d.id), 0);
    const monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
    const currentMonth = monthNames[0]; // Можно сделать динамически
    setDays([
      ...days,
      {
        id: maxId + 1,
        date: `${maxId + 11} ${currentMonth}`,
        isExpanded: false,
        items: [],
      },
    ]);
  };

  const handleDragStart = (dayId, itemId) => {
    setDraggedItem(itemId);
    setDraggedDayId(dayId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dayId, targetItemId) => {
    if (!draggedItem || draggedDayId !== dayId) return;

    setDays((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const items = [...d.items];
          const draggedIndex = items.findIndex((item) => item.id === draggedItem);
          const targetIndex = items.findIndex((item) => item.id === targetItemId);

          if (draggedIndex !== -1 && targetIndex !== -1) {
            const [draggedItemData] = items.splice(draggedIndex, 1);
            items.splice(targetIndex, 0, draggedItemData);
          }

          return { ...d, items };
        }
        return d;
      })
    );

    setDraggedItem(null);
    setDraggedDayId(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedDayId(null);
  };

  return (
    <div className={s.timingContainer}>
      {/* Toolbar */}
      <div className={s.timingToolbar}>
        <div>
          <h3 className={s.timingToolbarTitle}>Тайминг тура</h3>
          <p className={s.timingToolbarSubtitle}>
            Управление расписанием по дням
          </p>
        </div>
        <div className={s.timingToolbarActions}>
          <div className={s.timingViewToggle}>
            <button
              type="button"
              className={`${s.timingViewButton} ${
                viewMode === "edit" ? s.timingViewButtonActive : ""
              }`}
              onClick={() => setViewMode("edit")}
            >
              Редактор
            </button>
            <button
              type="button"
              className={`${s.timingViewButton} ${
                viewMode === "preview" ? s.timingViewButtonActive : ""
              }`}
              onClick={() => setViewMode("preview")}
            >
              Превью
            </button>
          </div>
          <button type="button" className={s.timingShiftButton}>
            <span className="material-symbols-outlined text-[18px]">
              schedule
            </span>
            Сдвинуть время
          </button>
          <button type="button" className={s.timingAddDayButton} onClick={addNewDay}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Добавить день
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className={s.timingGrid}>
        {/* Left Column: Editor */}
        <div className={s.timingEditor}>
          {days.map((day) => (
            <div key={day.id} className={s.timingDayCard}>
              {/* Day Header */}
              <div
                className={s.timingDayHeader}
                onClick={() => toggleDay(day.id)}
              >
                <div className={s.timingDayHeaderLeft}>
                  <span
                    className={`material-symbols-outlined ${
                      day.isExpanded ? "" : s.timingIconCollapsed
                    }`}
                  >
                    expand_more
                  </span>
                  <h4 className={s.timingDayTitle}>День {day.id} • {day.date}</h4>
                  <span
                    className={`${s.timingDayBadge} ${
                      day.items.length > 0 ? s.timingDayBadgeActive : ""
                    }`}
                  >
                    {day.items.length} {day.items.length === 1 ? 'событие' : day.items.length < 5 ? 'события' : 'событий'}
                  </span>
                </div>
                <div className={s.timingDayHeaderRight}>
                  <button
                    type="button"
                    className={s.timingDeleteDayButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDay(day.id);
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>

              {/* Day Content */}
              {day.isExpanded && (
                <>
                  <div className={s.timingDayContent}>
                    {/* Header Row Labels (Desktop only) */}
                    <div className={s.timingTableHeader}>
                      <div className={s.timingColDrag}></div>
                      <div className={s.timingColTime}>Время</div>
                      <div className={s.timingColType}>Тип</div>
                      <div className={s.timingColDetails}>Детали</div>
                      <div className={s.timingColActions}>Действия</div>
                    </div>

                    {/* Items */}
                    {day.items.map((item, itemIndex) => (
                      <div
                        key={item.id}
                        className={`${s.timingRow} ${
                          draggedItem === item.id ? "opacity-50" : ""
                        }`}
                        draggable
                        onDragStart={() => handleDragStart(day.id, item.id)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(day.id, item.id)}
                        onDragEnd={handleDragEnd}
                      >
                        {/* Drag Handle */}
                        <div className={`${s.timingRowDrag} cursor-grab active:cursor-grabbing`}>
                          <span className="material-symbols-outlined text-[20px]">
                            drag_indicator
                          </span>
                        </div>

                        {/* Time Input */}
                        <div className={s.timingRowTime}>
                          <div className={s.timingTimeInput}>
                            <span className="sm:hidden material-symbols-outlined text-[20px]">
                              schedule
                            </span>
                            <input
                              type="time"
                              className={s.timingInput}
                              value={item.time}
                              onChange={(e) =>
                                updateItem(day.id, item.id, "time", e.target.value)
                              }
                            />
                          </div>
                        </div>

                        {/* Type Select */}
                        <div className={s.timingRowType}>
                          <select
                            className={`${s.timingSelect} ${
                              typeColors[item.type] || ""
                            }`}
                            value={item.type}
                            onChange={(e) =>
                              updateItem(day.id, item.id, "type", e.target.value)
                            }
                          >
                            <option value="meeting">Встреча</option>
                            <option value="location">Место</option>
                            <option value="transfer">Трансфер</option>
                            <option value="breakfast">Завтрак</option>
                            <option value="lunch">Обед</option>
                            <option value="dinner">Ужин</option>
                            <option value="excursion">Экскурсия</option>
                            <option value="hotel">Отель</option>
                          </select>
                        </div>

                        {/* Title & Comment */}
                        <div className={s.timingRowDetails}>
                          <input
                            className={s.timingTitleInput}
                            placeholder="Название места или события"
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              updateItem(day.id, item.id, "title", e.target.value)
                            }
                          />
                          <input
                            className={s.timingCommentInput}
                            placeholder="Добавьте комментарий..."
                            type="text"
                            value={item.comment}
                            onChange={(e) =>
                              updateItem(day.id, item.id, "comment", e.target.value)
                            }
                          />
                        </div>

                        {/* Actions */}
                        <div className={s.timingRowActions}>
                          <button
                            type="button"
                            className={s.timingActionButton}
                            title="Дублировать"
                            onClick={() => duplicateItem(day.id, item.id)}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              content_copy
                            </span>
                          </button>
                          <button
                            type="button"
                            className={s.timingDeleteButton}
                            title="Удалить"
                            onClick={() => deleteItemFromDay(day.id, item.id)}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Item Footer */}
                  <div className={s.timingDayFooter}>
                    <button
                      type="button"
                      className={s.timingAddItemButton}
                      onClick={() => addItemToDay(day.id)}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        add
                      </span>
                      Добавить событие в День {day.id}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add New Day */}
          <div className={s.timingAddDayCard} onClick={addNewDay}>
            <div className={s.timingAddDayIcon}>
              <span className="material-symbols-outlined">
                calendar_add_on
              </span>
            </div>
            <p className={s.timingAddDayText}>Добавить День {days.length + 1}</p>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className={s.timingPreview}>
          <div className={s.timingPreviewSticky}>
            <h3 className={s.timingPreviewTitle}>Предпросмотр тайминга</h3>
            <div className={s.timingPreviewCard}>
              <div className={s.timingPreviewScroll}>
                {days.map((day, dayIndex) => (
                  <div key={day.id} className={s.timingPreviewDay}>
                    {/* Date Header */}
                    <div className={s.timingPreviewDateHeader}>
                      <h4 className={s.timingPreviewDate}>
                        {day.date}
                      </h4>
                      <p className={s.timingPreviewDayLabel}>День {day.id}</p>
                    </div>

                    {/* Timeline Container */}
                    {day.items.length > 0 && (
                      <div className={s.timingPreviewTimeline}>
                        {day.items.map((item) => (
                          <div key={item.id} className={s.timingPreviewItem}>
                            <div
                              className={s.timingPreviewDot}
                              style={{
                                backgroundColor: previewColors[item.type] || "#6b7280",
                              }}
                            ></div>
                            <div className={s.timingPreviewContent}>
                              <span
                                className={s.timingPreviewMeta}
                                style={{
                                  color: previewColors[item.type] || "#6b7280",
                                }}
                              >
                                {item.time} • {getTypeLabel(item.type)}
                              </span>
                              <h5 className={s.timingPreviewItemTitle}>
                                {item.title || "Без названия"}
                              </h5>
                              {item.comment && (
                                <p className={s.timingPreviewComment}>
                                  {item.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Next Day Teaser */}
                        {dayIndex < days.length - 1 && (
                          <div className={s.timingPreviewNextDay}>
                            <p className={s.timingPreviewNextDayLabel}>
                              Следующий день
                            </p>
                            <div className={s.timingPreviewNextDayItem}>
                              <div
                                className={s.timingPreviewDot}
                                style={{ backgroundColor: "#6b7280" }}
                              ></div>
                              <h5 className={s.timingPreviewItemTitle}>
                                День {days[dayIndex + 1].id} начинается...
                              </h5>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
