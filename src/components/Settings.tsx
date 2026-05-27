import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Download, Info, Bell, Trash2, BellOff } from 'lucide-react';
import { ThemeMode, TodoItem, Category } from '../types';
import { notificationHelper } from '../utils/notificationHelper';

interface Props {
  themeMode: ThemeMode;
  onSetTheme: (mode: ThemeMode) => void;
  todos: TodoItem[];
  categories: Category[];
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
}

export default function Settings({ 
  themeMode, onSetTheme, todos, categories, 
  notificationsEnabled, onToggleNotifications 
}: Props) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    notificationHelper.getPermissionStatus().then(permission => {
      setNotificationPermission(permission);
    });
  }, []);

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { value: 'system', label: '跟随系统', icon: <Monitor size={18} /> },
    { value: 'light', label: '浅色', icon: <Sun size={18} /> },
    { value: 'dark', label: '深色', icon: <Moon size={18} /> },
  ];

  const handleExport = () => {
    const data = { todos, categories, exportTime: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCompleted = () => {
    if (confirm('确定要清除所有已完成的待办吗？')) {
      const remaining = todos.filter(t => !t.isCompleted);
      localStorage.setItem('todo_app_todos', JSON.stringify(remaining));
      window.location.reload();
    }
  };
  const handleToggleNotifications = async () => {
    const isSupported = await notificationHelper.isSupported();
    if (!isSupported) {
      alert('您的设备不支持通知功能');
      return;
    }

    const currentPermission = await notificationHelper.getPermissionStatus();

    if (!notificationsEnabled) {
      if (currentPermission === 'default') {
        const permission = await notificationHelper.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          onToggleNotifications(true);
          await notificationHelper.sendInstantNotification('待办清单', '通知提醒已成功启用！');
        }
      } else if (currentPermission === 'granted') {
        onToggleNotifications(true);
        await notificationHelper.sendInstantNotification('待办清单', '通知提醒已成功启用！');
      } else {
        alert('通知权限已被禁用，请在系统设置中开启本应用的通知权限');
      }
    } else {
      onToggleNotifications(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">设置</h2>

      {/* Theme */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Sun size={18} className="text-yellow-500" />
            外观模式
          </h3>
        </div>
        <div className="p-3">
          <div className="flex gap-2">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => onSetTheme(opt.value)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                  themeMode === opt.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-orange-500" />
            通知提醒
          </h3>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                启用通知提醒
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {notificationPermission === 'denied' 
                  ? '通知权限已被浏览器禁用' 
                  : '待办到期时发送系统通知'}
              </div>
            </div>
            <button
              onClick={handleToggleNotifications}
              disabled={notificationPermission === 'denied'}
              className={`relative w-14 h-8 rounded-full transition-all ${
                notificationsEnabled && notificationPermission !== 'denied'
                  ? 'bg-blue-500'
                  : 'bg-gray-200 dark:bg-gray-600'
              } ${notificationPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                notificationsEnabled && notificationPermission !== 'denied' ? 'left-7' : 'left-1'
              }`}>
                {notificationsEnabled && notificationPermission !== 'denied' ? (
                  <Bell size={14} className="text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                ) : (
                  <BellOff size={14} className="text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Info size={18} className="text-blue-500" />
            数据统计
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-blue-500">{todos.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">总待办</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-green-500">{todos.filter(t => t.isCompleted).length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">已完成</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-yellow-500">{todos.filter(t => !t.isCompleted).length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">进行中</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="text-2xl font-bold text-purple-500">{categories.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">分类数</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Download size={18} className="text-green-500" />
            数据管理
          </h3>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download size={18} className="text-blue-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">导出数据</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">导出为 JSON 文件</div>
            </div>
          </button>
          <button
            onClick={handleClearCompleted}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Trash2 size={18} className="text-red-500" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">清除已完成</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">删除所有已完成的待办</div>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center">
        <div className="text-3xl mb-2">✅</div>
        <h3 className="font-bold text-gray-900 dark:text-white">待办清单</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">V1.0 · 轻量高效的待办管理</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">数据仅保存在本地浏览器中</p>
      </div>
    </div>
  );
}
