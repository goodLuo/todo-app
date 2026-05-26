export type Priority = 'high' | 'medium' | 'low';

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface TodoItem {
  id: string;
  title: string;
  content: string;
  isCompleted: boolean;
  priority: Priority;
  categoryId: string;
  dueTime: number | null;
  reminderTime: number | null;
  createdTime: number;
  updatedTime: number;
}

export type SortBy = 'createdTime' | 'dueTime' | 'priority';
export type TabType = 'home' | 'category' | 'completed' | 'settings';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface QuickTime {
  id: string;
  label: string;
  minutes: number;
  isCustom?: boolean;
}
