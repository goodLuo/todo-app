import { TodoItem, Category, ThemeMode, QuickTime } from '../types';

const TODOS_KEY = 'todo_app_todos';
const CATEGORIES_KEY = 'todo_app_categories';
const THEME_KEY = 'todo_app_theme';
const NOTIFICATIONS_KEY = 'todo_app_notifications';

export const defaultCategories: Category[] = [
  { id: 'cat-work', name: '工作', color: '#3B82F6', isDefault: true },
  { id: 'cat-study', name: '学习', color: '#8B5CF6', isDefault: true },
  { id: 'cat-life', name: '生活', color: '#10B981', isDefault: true },
];

export function loadTodos(): TodoItem[] {
  try {
    const data = localStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTodos(todos: TodoItem[]) {
  localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
}

export function loadCategories(): Category[] {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    saveCategories(defaultCategories);
    return defaultCategories;
  } catch {
    return defaultCategories;
  }
}

export function saveCategories(categories: Category[]) {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function loadTheme(): ThemeMode {
  try {
    const data = localStorage.getItem(THEME_KEY);
    return (data as ThemeMode) || 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(theme: ThemeMode) {
  localStorage.setItem(THEME_KEY, theme);
}

export function loadNotificationsEnabled(): boolean {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data === 'true';
  } catch {
    return false;
  }
}

export function saveNotificationsEnabled(enabled: boolean) {
  localStorage.setItem(NOTIFICATIONS_KEY, String(enabled));
}

const QUICK_TIMES_KEY = 'todo_app_quick_times';

export const defaultQuickTimes: QuickTime[] = [
  { id: 'qt-1h', label: '1小时后', minutes: 60 },
  { id: 'qt-3h', label: '3小时后', minutes: 180 },
  { id: 'qt-6h', label: '半天后', minutes: 360 },
  { id: 'qt-1d', label: '明天', minutes: 1440 },
  { id: 'qt-2d', label: '后天', minutes: 2880 },
];

export function loadQuickTimes(): QuickTime[] {
  try {
    const data = localStorage.getItem(QUICK_TIMES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return defaultQuickTimes;
  } catch {
    return defaultQuickTimes;
  }
}

export function saveQuickTimes(times: QuickTime[]) {
  localStorage.setItem(QUICK_TIMES_KEY, JSON.stringify(times));
}
