import { useState, useEffect, useMemo } from 'react';
import {
  Home, Grid3X3, CheckCircle2, Settings as SettingsIcon,
  Plus, Search, X, Clock, Flag, CalendarDays,
  ListFilter, ChevronDown, SlidersHorizontal, Trash2, Check, CheckSquare,
} from 'lucide-react';
import { useTodoStore } from './hooks/useTodoStore';
import { TabType, SortBy, TodoItem } from './types';
import TodoCard from './components/TodoCard';
import TodoForm from './components/TodoForm';
import CategoryManager from './components/CategoryManager';
import SettingsComponent from './components/Settings';
import Snackbar from './components/Snackbar';

interface SnackbarState {
  message: string;
  onUndo?: () => void;
}

function App() {
  const store = useTodoStore();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showForm, setShowForm] = useState(false);
  const [editTodo, setEditTodo] = useState<TodoItem | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTodaySection, setShowTodaySection] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);

  // Splash screen
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (store.themeMode === 'dark') {
      root.classList.add('dark');
    } else if (store.themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [store.themeMode]);

  // Notification reminder check
  useEffect(() => {
    if (!('Notification' in window)) return;
    if (!store.notificationsEnabled) return;

    const checkReminders = () => {
      const now = Date.now();
      store.todos.forEach(todo => {
        if (todo.reminderTime && !todo.isCompleted && Math.abs(todo.reminderTime - now) < 60000) {
          if (Notification.permission === 'granted') {
            new Notification('待办提醒', { body: todo.title, icon: '✅' });
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [store.todos, store.notificationsEnabled]);

  const handleSave = (data: Parameters<typeof store.addTodo>[0]) => {
    if (editTodo) {
      store.updateTodo(editTodo.id, data);
    } else {
      store.addTodo(data);
    }
    setEditTodo(null);
  };

  const handleEdit = (todo: TodoItem) => {
    setEditTodo(todo);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const result = store.deleteTodo(id);
    if (result.message) {
      setSnackbar({
        message: result.message,
        onUndo: result.onUndo,
      });
    }
  };

  const handleLongPress = (id: string) => {
    setIsSelectionMode(true);
    store.toggleSelectId(id);
  };

  const handleExitSelectionMode = () => {
    setIsSelectionMode(false);
    store.clearSelectedIds();
  };

  const handleBatchDelete = () => {
    if (store.selectedIds.size === 0) return;
    const result = store.deleteTodos(Array.from(store.selectedIds));
    handleExitSelectionMode();
    if (result.message) {
      setSnackbar({
        message: result.message,
        onUndo: result.onUndo,
      });
    }
  };

  const handleBatchComplete = () => {
    if (store.selectedIds.size === 0) return;
    store.toggleCompleteTodos(Array.from(store.selectedIds), true);
    handleExitSelectionMode();
    setSnackbar({
      message: `已完成 ${store.selectedIds.size} 项待办`,
    });
  };

  const handleSelectAll = () => {
    const visibleIds = activeTodos.map(t => t.id);
    store.selectAllVisible(visibleIds);
  };

  const activeTodos = useMemo(() =>
    store.sortedFilteredTodos.filter(t => !t.isCompleted),
    [store.sortedFilteredTodos]
  );

  const completedTodos = useMemo(() =>
    store.sortedFilteredTodos.filter(t => t.isCompleted),
    [store.sortedFilteredTodos]
  );

  const sortOptions: { value: SortBy; label: string; icon: React.ReactNode }[] = [
    { value: 'createdTime', label: '创建时间', icon: <Clock size={16} /> },
    { value: 'dueTime', label: '截止时间', icon: <CalendarDays size={16} /> },
    { value: 'priority', label: '优先级', icon: <Flag size={16} /> },
  ];

  const getCategoryById = (id: string) => store.categories.find(c => c.id === id);

  // Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center z-50">
        <div className="text-center animate-fade-in">
          <div className="text-7xl mb-4 animate-bounce-slow">✅</div>
          <h1 className="text-3xl font-bold text-white mb-2">待办清单</h1>
          <p className="text-blue-200 text-sm">轻量 · 高效 · 打开即用</p>
          <div className="mt-8 flex justify-center">
            <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full animate-loading-bar" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-lg mx-auto px-4 py-3">
          {isSelectionMode ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExitSelectionMode}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} className="text-gray-500" />
                </button>
                <span className="text-base font-medium text-gray-900 dark:text-white">
                  已选择 {store.selectedIds.size} 项
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <CheckSquare size={14} />
                  全选
                </button>
                <button
                  onClick={handleBatchComplete}
                  disabled={store.selectedIds.size === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check size={16} />
                  完成
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={store.selectedIds.size === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={16} />
                  删除
                </button>
              </div>
            </div>
          ) : showSearch ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={store.searchQuery}
                  onChange={e => store.setSearchQuery(e.target.value)}
                  placeholder="搜索待办..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => { setShowSearch(false); store.setSearchQuery(''); }}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  ✅ 待办清单
                </h1>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {store.activeCount} 项待办 · {store.completedCount} 项已完成
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Search size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <SlidersHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 w-40 z-20">
                        {sortOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => { store.setSortBy(opt.value); setShowSortMenu(false); }}
                            className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                              store.sortBy === opt.value
                                ? 'text-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {activeTab === 'home' && (
          <div>
            {/* Selection mode hint */}
            {!isSelectionMode && store.todos.length > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-3">
                💡 长按待办可进入多选模式
              </p>
            )}

            {/* Today section */}
            {store.todayTodos.length > 0 && !isSelectionMode && (
              <div className="mb-6">
                <button
                  onClick={() => setShowTodaySection(!showTodaySection)}
                  className="flex items-center gap-2 mb-3"
                >
                  <CalendarDays size={18} className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">今日待办</span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    {store.todayTodos.length}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${showTodaySection ? '' : '-rotate-90'}`} />
                </button>
                {showTodaySection && (
                  <div>
                    {store.todayTodos.map(todo => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        category={getCategoryById(todo.categoryId)}
                        isSelected={store.selectedIds.has(todo.id)}
                        isSelectionMode={isSelectionMode}
                        onToggle={store.toggleComplete}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onLongPress={handleLongPress}
                        onSelect={store.toggleSelectId}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active todos */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ListFilter size={18} className="text-gray-400" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {store.searchQuery ? '搜索结果' : '全部待办'}
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                  {activeTodos.length}
                </span>
                {store.selectedCategoryId && (
                  <button
                    onClick={() => store.setSelectedCategoryId(null)}
                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
                  >
                    清除筛选 <X size={12} />
                  </button>
                )}
              </div>

              {activeTodos.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">🎉</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {store.searchQuery ? '没有找到匹配的待办' : '没有待办事项'}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    {store.searchQuery ? '试试其他关键词' : '点击下方 + 按钮创建'}
                  </p>
                </div>
              ) : (
                activeTodos.map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    category={getCategoryById(todo.categoryId)}
                    isSelected={store.selectedIds.has(todo.id)}
                    isSelectionMode={isSelectionMode}
                    onToggle={store.toggleComplete}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onLongPress={handleLongPress}
                    onSelect={store.toggleSelectId}
                  />
                ))
              )}
            </div>

            {/* Completed in home view */}
            {completedTodos.length > 0 && !store.searchQuery && !isSelectionMode && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-green-500" />
                  <span className="text-sm font-bold text-gray-900 dark:text-white">已完成</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                    {completedTodos.length}
                  </span>
                </div>
                {completedTodos.slice(0, 5).map(todo => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    category={getCategoryById(todo.categoryId)}
                    isSelected={store.selectedIds.has(todo.id)}
                    isSelectionMode={isSelectionMode}
                    onToggle={store.toggleComplete}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onLongPress={handleLongPress}
                    onSelect={store.toggleSelectId}
                  />
                ))}
                {completedTodos.length > 5 && (
                  <button
                    onClick={() => setActiveTab('completed')}
                    className="w-full text-center text-sm text-blue-500 hover:text-blue-600 py-2 font-medium"
                  >
                    查看全部 {completedTodos.length} 项已完成
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'category' && (
          <CategoryManager
            categories={store.categories}
            todos={store.todos}
            onAdd={store.addCategory}
            onDelete={store.deleteCategory}
            onUpdate={store.updateCategory}
            onSelectCategory={(id) => {
              store.setSelectedCategoryId(id);
              if (id !== null) setActiveTab('home');
            }}
            selectedCategoryId={store.selectedCategoryId}
          />
        )}

        {activeTab === 'completed' && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={20} className="text-green-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">已完成</h2>
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-2.5 py-0.5 rounded-full font-medium">
                {completedTodos.length}
              </span>
            </div>
            {completedTodos.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">还没有已完成的待办</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">完成待办后会显示在这里</p>
              </div>
            ) : (
              completedTodos.map(todo => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  category={getCategoryById(todo.categoryId)}
                  isSelected={store.selectedIds.has(todo.id)}
                  isSelectionMode={isSelectionMode}
                  onToggle={store.toggleComplete}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onLongPress={handleLongPress}
                  onSelect={store.toggleSelectId}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsComponent
            themeMode={store.themeMode}
            onSetTheme={store.setThemeMode}
            todos={store.todos}
            categories={store.categories}
            notificationsEnabled={store.notificationsEnabled}
            onToggleNotifications={store.setNotificationsEnabled}
          />
        )}
      </main>

      {/* FAB */}
      {activeTab !== 'settings' && !isSelectionMode && (
        <button
          onClick={() => { setEditTodo(null); setShowForm(true); }}
          className="fixed right-4 bottom-24 sm:right-[calc(50%-14rem)] z-20 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-lg mx-auto flex">
          {([
            { id: 'home' as TabType, label: '首页', icon: Home },
            { id: 'category' as TabType, label: '分类', icon: Grid3X3 },
            { id: 'completed' as TabType, label: '已完成', icon: CheckCircle2 },
            { id: 'settings' as TabType, label: '设置', icon: SettingsIcon },
          ]).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (isSelectionMode) handleExitSelectionMode(); }}
                className={`flex-1 flex flex-col items-center py-2.5 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-950' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {tab.id === 'home' && store.activeCount > 0 && (
                  <span className="absolute top-1.5 ml-5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                    {store.activeCount > 99 ? '99' : store.activeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Form Modal */}
      {showForm && (
        <TodoForm
          categories={store.categories}
          editTodo={editTodo}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTodo(null); }}
        />
      )}

      {/* Snackbar for undo */}
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          duration={4000}
          action={snackbar.onUndo ? { label: '撤销', onClick: snackbar.onUndo } : undefined}
          onClose={() => setSnackbar(null)}
        />
      )}
    </div>
  );
}

export default App;
