import { useState } from 'react';

const defaultTasks = [
  { id: 1, text: 'Утвердить бюджет на Январь', completed: false },
  { id: 2, text: 'Позвонить партнерам в Ташкент', completed: true },
  { id: 3, text: 'Разобрать жалобу по туру #881', completed: false },
];

export default function FocusTasks({ initialTasks = defaultTasks, onAddTask }) {
  const [tasks, setTasks] = useState(initialTasks);
  
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };
  
  return (
    <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#f0f0f4] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#111118] text-lg font-bold">Фокус дня</h3>
        <button 
          onClick={onAddTask}
          className="text-[#1313ec] text-xs font-bold hover:underline"
        >
          + Задача
        </button>
      </div>
      
      <ul className="flex flex-col gap-3 flex-1">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-3">
            <div className="mt-0.5 relative flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="peer h-4 w-4 rounded border-gray-300 text-[#1313ec] focus:ring-[#1313ec]/20 cursor-pointer"
              />
            </div>
            <span className={`text-sm ${
              task.completed 
                ? 'text-gray-400 line-through' 
                : 'text-[#111118]'
            }`}>
              {task.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
