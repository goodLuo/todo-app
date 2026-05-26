import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TodoItem, Category, Priority, SortBy, ThemeMode } from '../types';
import {
  loadTodos, saveTodos,
  loadCategories, saveCategories,
  loadTheme, saveTheme,
  loadNotificationsEnabled, saveNotificationsEnabled,
  defaultCategories,
} from '../utils/storage';

interface DeletedItem {
  todo: TodoItem;
  timeoutId: ReturnType<typeof setTimeout>;
}

export function useTodoStore() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [notificationsEnabled, setNotificationsEnabledState] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('createdTime');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Undo delete state
  const [pendingDelete, setPendingDelete] = useState<DeletedItem | null>(null);
  const [pendingBatchDelete, setPendingBatchDelete] = useState<{ todos: TodoItem[]; timeoutId: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(() => {
    setTodos(loadTodos());
    setCategories(loadCategories());
    setThemeModeState(loadTheme());
    setNotificationsEnabledState(loadNotificationsEnabled());
  }, []);

  useEffect(() => { saveTodos(todos); }, [todos]);
  useEffect(() => { saveCategories(categories); }, [categories]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    saveTheme(mode);
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    saveNotificationsEnabled(enabled);
  }, []);

  const addTodo = useCallback((data: {
    title: string; content: string; priority: Priority;
    categoryId: string; dueTime: number | null; reminderTime: number | null;
  }) => {
    const now = Date.now();
    const todo: TodoItem = {
      id: uuidv4(), ...data,
      isCompleted: false, createdTime: now, updatedTime: now,
    };
    setTodos(prev => [todo, ...prev]);
    return todo;
  }, []);

  const updateTodo = useCallback((id: string, data: Partial<TodoItem>) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, ...data, updatedTime: Date.now() } : t
    ));
  }, []);

  // Delete with undo support
  const deleteTodo = useCallback((id: string): { message: string; onUndo: () => void } => {
    // Cancel any existing pending delete
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
    }

    // Find the todo to delete
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) {
      return { message: '', onUndo: () => {} };
    }

    // Immediately remove from UI
    setTodos(prev => prev.filter(t => t.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    // Set up delayed permanent deletion
    const timeoutId = setTimeout(() => {
      setPendingDelete(null);
    }, 4000);

    const deletedItem: DeletedItem = { todo: todoToDelete, timeoutId };
    setPendingDelete(deletedItem);

    // Return undo function
    return {
      message: `已删除 "${todoToDelete.title}"`,
      onUndo: () => {
        clearTimeout(timeoutId);
        setTodos(prev => [todoToDelete, ...prev]);
        setPendingDelete(null);
      }
    };
  }, [todos, pendingDelete]);

  // Batch delete with undo support
  const deleteTodos = useCallback((ids: string[]): { message: string; onUndo: () => void } => {
    // Cancel any existing pending batch delete
    if (pendingBatchDelete) {
      clearTimeout(pendingBatchDelete.timeoutId);
    }

    // Find todos to delete
    const todosToDelete = todos.filter(t => ids.includes(t.id));
    if (todosToDelete.length === 0) {
      return { message: '', onUndo: () => {} };
    }

    // Immediately remove from UI
    setTodos(prev => prev.filter(t => !ids.includes(t.id)));
    setSelectedIds(new Set());

    // Set up delayed permanent deletion
    const timeoutId = setTimeout(() => {
      setPendingBatchDelete(null);
    }, 4000);

    setPendingBatchDelete({ todos: todosToDelete, timeoutId });

    // Return undo function
    return {
      message: `已删除 ${todosToDelete.length} 项待办`,
      onUndo: () => {
        clearTimeout(timeoutId);
        setTodos(prev => [...todosToDelete, ...prev]);
        setPendingBatchDelete(null);
      }
    };
  }, [todos, pendingBatchDelete]);

  const toggleComplete = useCallback((id: string) => {
    setTodos(prev => prev.map(t =>
      t.id === id ? { ...t, isCompleted: !t.isCompleted, updatedTime: Date.now() } : t
    ));
  }, []);

  const toggleCompleteTodos = useCallback((ids: string[], completed: boolean) => {
    setTodos(prev => prev.map(t =>
      ids.includes(t.id) ? { ...t, isCompleted: completed, updatedTime: Date.now() } : t
    ));
    setSelectedIds(new Set());
  }, []);

  const toggleSelectId = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelectedIds = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAllVisible = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const addCategory = useCallback((name: string, color: string) => {
    const cat: Category = { id: uuidv4(), name, color };
    setCategories(prev => [...prev, cat]);
    return cat;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTodos(prev => prev.map(t =>
      t.categoryId === id ? { ...t, categoryId: defaultCategories[0].id } : t
    ));
  }, []);

  const updateCategory = useCallback((id: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);

  const priorityValue = (p: Priority) => p === 'high' ? 3 : p === 'medium' ? 2 : 1;

  const sortedFilteredTodos = useMemo(() => {
    let filtered = [...todos];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) || t.content.toLowerCase().includes(q)
      );
    }
    if (selectedCategoryId) {
      filtered = filtered.filter(t => t.categoryId === selectedCategoryId);
    }
    filtered.sort((a, b) => {
      if (sortBy === 'priority') return priorityValue(b.priority) - priorityValue(a.priority);
      if (sortBy === 'dueTime') {
        if (!a.dueTime && !b.dueTime) return b.createdTime - a.createdTime;
        if (!a.dueTime) return 1;
        if (!b.dueTime) return -1;
        return a.dueTime - b.dueTime;
      }
      return b.createdTime - a.createdTime;
    });
    return filtered;
  }, [todos, searchQuery, selectedCategoryId, sortBy]);

  const todayTodos = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 86400000;
    return todos.filter(t => !t.isCompleted && t.dueTime && t.dueTime >= startOfDay && t.dueTime < endOfDay);
  }, [todos]);

  const completedCount = useMemo(() => todos.filter(t => t.isCompleted).length, [todos]);
  const activeCount = useMemo(() => todos.filter(t => !t.isCompleted).length, [todos]);

  return {
    todos, categories, themeMode, notificationsEnabled, sortBy, searchQuery, selectedCategoryId, selectedIds,
    sortedFilteredTodos, todayTodos, completedCount, activeCount,
    addTodo, updateTodo, deleteTodo, deleteTodos, toggleComplete, toggleCompleteTodos,
    addCategory, deleteCategory, updateCategory,
    setThemeMode, setNotificationsEnabled, setSortBy, setSearchQuery, setSelectedCategoryId,
    toggleSelectId, clearSelectedIds, selectAllVisible,
  };
}
