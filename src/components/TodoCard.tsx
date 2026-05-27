import { useState, useRef } from 'react';
import { Check, Trash2, Edit3, Clock, Flag, ChevronRight } from 'lucide-react';
import { TodoItem, Category } from '../types';
import { vibrate } from '../utils/notifications';

interface Props {
  todo: TodoItem;
  category?: Category;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: TodoItem) => void;
  onLongPress?: (id: string) => void;
  onSelect?: (id: string) => void;
}

const priorityConfig = {
  high: { label: '高', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800' },
  medium: { label: '中', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950', border: 'border-yellow-200 dark:border-yellow-800' },
  low: { label: '低', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800' },
};

function formatDate(ts: number | null) {
  if (!ts) return null;
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (isToday) return `今天 ${time}`;
  if (isTomorrow) return `明天 ${time}`;
  return `${d.getMonth()+1}/${d.getDate()} ${time}`;
}

function isOverdue(ts: number | null, isCompleted: boolean) {
  if (!ts || isCompleted) return false;
  return ts < Date.now();
}

export default function TodoCard({ 
  todo, category, isSelected, isSelectionMode, 
  onToggle, onDelete, onEdit, onLongPress, onSelect 
}: Props) {
  const [swipeX, setSwipeX] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSelectionMode) return;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    isLongPress.current = false;

    // Long press detection
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      if (onLongPress) {
        onLongPress(todo.id);
        // Vibration feedback
        vibrate(50);
      }
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isSelectionMode) return;
    // Cancel long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    setSwipeX(Math.max(-120, Math.min(80, dx)));
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isSelectionMode) return;
    isDragging.current = false;
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    if (swipeX < -60) {
      setShowActions(true);
      setSwipeX(-120);
    } else if (swipeX > 40) {
      onToggle(todo.id);
      setSwipeX(0);
      setShowActions(false);
    } else {
      setSwipeX(0);
      setShowActions(false);
    }
  };

  const handleClick = () => {
    if (isSelectionMode && onSelect) {
      onSelect(todo.id);
    }
  };

  const pConfig = priorityConfig[todo.priority];
  const overdue = isOverdue(todo.dueTime, todo.isCompleted);
  const dueStr = formatDate(todo.dueTime);

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3 group">
      {/* Swipe background actions */}
      {!isSelectionMode && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden select-none">
          {/* 向右滑动露出绿色“完成”背景 */}
          {swipeX > 0 && (
            <div className="absolute inset-y-0 left-0 w-full bg-green-500 flex items-center pl-5">
              <Check size={24} className="text-white animate-fade-in" />
              <span className="text-white text-sm ml-2 font-medium animate-fade-in">完成</span>
            </div>
          )}
          
          {/* 向左滑动露出右侧修改与删除按钮面板 */}
          {swipeX < 0 && (
            <div className="absolute inset-y-0 right-0 w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-end pr-2.5 gap-1.5">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(todo); setSwipeX(0); setShowActions(false); }}
                className="p-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all shadow-md shadow-blue-500/25 flex items-center justify-center"
              >
                <Edit3 size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(todo.id); setSwipeX(0); setShowActions(false); }}
                className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all shadow-md shadow-red-500/25 flex items-center justify-center"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main card */}
      <div
        className={`relative bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-out border rounded-2xl ${
          isSelected 
            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
            : 'border-gray-100 dark:border-gray-700'
        } ${todo.isCompleted ? 'opacity-60' : ''}`}
        style={{ transform: isSelectionMode ? 'none' : `translateX(${swipeX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {/* Selection checkbox or completion checkbox */}
          {isSelectionMode ? (
            <button
              onClick={(e) => { e.stopPropagation(); if (onSelect) onSelect(todo.id); }}
              className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 dark:border-gray-500 hover:border-blue-400'
              }`}
            >
              {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
            </button>
          ) : (
            <button
              onClick={() => onToggle(todo.id)}
              className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                todo.isCompleted
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300 dark:border-gray-500 hover:border-blue-400'
              }`}
            >
              {todo.isCompleted && <Check size={14} className="text-white" strokeWidth={3} />}
            </button>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`text-base font-medium leading-snug ${
                todo.isCompleted
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {todo.title}
              </h3>
              {/* 待办快捷操作按钮：在移动触控屏上直接显示以供轻松点击，在桌面端保持悬浮 hover 显示 */}
              {!isSelectionMode && (
                <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit3 size={15} className="text-gray-400 hover:text-blue-500" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
                    className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  >
                    <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              )}
            </div>

            {todo.content && (
              <p className={`text-sm mt-1 leading-relaxed ${
                todo.isCompleted ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {todo.content}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              {/* Category badge */}
              {category && (
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-medium text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              )}

              {/* Priority */}
              <span className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${pConfig.bg} ${pConfig.color}`}>
                <Flag size={10} />
                {pConfig.label}
              </span>

              {/* Due time */}
              {dueStr && (
                <span className={`text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  overdue
                    ? 'bg-red-50 dark:bg-red-950 text-red-500'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  <Clock size={10} />
                  {dueStr}
                  {overdue && ' 已过期'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile swipe hint */}
        {showActions && !isSelectionMode && (
          <button
            onClick={() => { setSwipeX(0); setShowActions(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 sm:hidden"
          >
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
