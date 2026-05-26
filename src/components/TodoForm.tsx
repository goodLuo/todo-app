import { useState, useEffect } from 'react';
import { X, Flag, Calendar, Bell, Tag, Clock, Plus, Settings2 } from 'lucide-react';
import { TodoItem, Category, Priority, QuickTime } from '../types';
import { loadQuickTimes, saveQuickTimes, defaultQuickTimes } from '../utils/storage';

interface Props {
  categories: Category[];
  editTodo?: TodoItem | null;
  onSave: (data: {
    title: string; content: string; priority: Priority;
    categoryId: string; dueTime: number | null; reminderTime: number | null;
  }) => void;
  onClose: () => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '高', color: 'bg-red-500' },
  { value: 'medium', label: '中', color: 'bg-yellow-500' },
  { value: 'low', label: '低', color: 'bg-green-500' },
];

function formatDatetimeLocal(ts: number | null): string {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getTimeFromNow(minutes: number): string {
  const d = new Date(Date.now() + minutes * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function TodoForm({ categories, editTodo, onSave, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [dueTime, setDueTime] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  
  // Quick times
  const [quickTimes, setQuickTimes] = useState<QuickTime[]>([]);
  const [showQuickTimeSettings, setShowQuickTimeSettings] = useState(false);
  const [newQuickLabel, setNewQuickLabel] = useState('');
  const [newQuickMinutes, setNewQuickMinutes] = useState('');

  useEffect(() => {
    setQuickTimes(loadQuickTimes());
  }, []);

  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title);
      setContent(editTodo.content);
      setPriority(editTodo.priority);
      setCategoryId(editTodo.categoryId);
      setDueTime(formatDatetimeLocal(editTodo.dueTime));
      setReminderTime(formatDatetimeLocal(editTodo.reminderTime));
    }
  }, [editTodo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim(),
      priority,
      categoryId,
      dueTime: dueTime ? new Date(dueTime).getTime() : null,
      reminderTime: reminderTime ? new Date(reminderTime).getTime() : null,
    });
    onClose();
  };

  const applyQuickTime = (minutes: number, target: 'due' | 'reminder') => {
    const timeStr = getTimeFromNow(minutes);
    if (target === 'due') {
      setDueTime(timeStr);
    } else {
      setReminderTime(timeStr);
    }
  };

  const addCustomQuickTime = () => {
    if (!newQuickLabel.trim() || !newQuickMinutes) return;
    const minutes = parseInt(newQuickMinutes);
    if (isNaN(minutes) || minutes <= 0) return;
    
    const newTime: QuickTime = {
      id: `qt-custom-${Date.now()}`,
      label: newQuickLabel.trim(),
      minutes,
      isCustom: true,
    };
    const updated = [...quickTimes, newTime];
    setQuickTimes(updated);
    saveQuickTimes(updated);
    setNewQuickLabel('');
    setNewQuickMinutes('');
  };

  const deleteQuickTime = (id: string) => {
    const updated = quickTimes.filter(t => t.id !== id);
    setQuickTimes(updated);
    saveQuickTimes(updated);
  };

  const resetQuickTimes = () => {
    setQuickTimes(defaultQuickTimes);
    saveQuickTimes(defaultQuickTimes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {editTodo ? '编辑待办' : '新建待办'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              标题 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="输入待办标题..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base"
              autoFocus
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">备注</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="添加备注..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-base resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Flag size={15} /> 优先级
            </label>
            <div className="flex gap-2">
              {priorityOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    priority === opt.value
                      ? `${opt.color} text-white shadow-md scale-105`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag size={15} /> 分类
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    categoryId === cat.id
                      ? 'text-white shadow-md scale-105'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                  style={categoryId === cat.id ? { backgroundColor: cat.color } : {}}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Due Time */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Calendar size={15} /> 截止时间
            </label>
            <input
              type="datetime-local"
              value={dueTime}
              onChange={e => setDueTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {/* Quick time buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickTimes.map(qt => (
                <button
                  key={qt.id}
                  type="button"
                  onClick={() => applyQuickTime(qt.minutes, 'due')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors flex items-center gap-1"
                >
                  <Clock size={10} />
                  {qt.label}
                </button>
              ))}
              {dueTime && (
                <button
                  type="button"
                  onClick={() => setDueTime('')}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              <Bell size={15} /> 提醒时间
            </label>
            <input
              type="datetime-local"
              value={reminderTime}
              onChange={e => setReminderTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            {/* Quick time buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickTimes.map(qt => (
                <button
                  key={qt.id}
                  type="button"
                  onClick={() => applyQuickTime(qt.minutes, 'reminder')}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900 transition-colors flex items-center gap-1"
                >
                  <Clock size={10} />
                  {qt.label}
                </button>
              ))}
              {reminderTime && (
                <button
                  type="button"
                  onClick={() => setReminderTime('')}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          {/* Quick Time Settings */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => setShowQuickTimeSettings(!showQuickTimeSettings)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <Settings2 size={14} />
              {showQuickTimeSettings ? '收起快捷时间设置' : '自定义快捷时间'}
            </button>

            {showQuickTimeSettings && (
              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                {/* Current quick times */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">当前快捷时间</div>
                  <div className="flex flex-wrap gap-2">
                    {quickTimes.map(qt => (
                      <div
                        key={qt.id}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{qt.label}</span>
                        <span className="text-gray-400 text-xs">({qt.minutes}分钟)</span>
                        {qt.isCustom && (
                          <button
                            type="button"
                            onClick={() => deleteQuickTime(qt.id)}
                            className="p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add new quick time */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">添加自定义</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuickLabel}
                      onChange={e => setNewQuickLabel(e.target.value)}
                      placeholder="名称，如：2小时后"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={newQuickMinutes}
                      onChange={e => setNewQuickMinutes(e.target.value)}
                      placeholder="分钟"
                      min="1"
                      className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addCustomQuickTime}
                      disabled={!newQuickLabel.trim() || !newQuickMinutes}
                      className="px-3 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Reset button */}
                <button
                  type="button"
                  onClick={resetQuickTimes}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  恢复默认设置
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold text-base transition-all shadow-lg shadow-blue-500/25 disabled:shadow-none"
          >
            {editTodo ? '保存修改' : '创建待办'}
          </button>
        </form>
      </div>
    </div>
  );
}
