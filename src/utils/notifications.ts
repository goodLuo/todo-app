/**
 * 通知服务 - 支持 Web 和 Capacitor 原生通知
 * Capacitor 插件会在运行时动态加载
 */

// 全局类型声明
declare global {
  interface Window {
    Capacitor?: {
      getPlatform: () => string;
      isNativePlatform: () => boolean;
      Plugins?: {
        LocalNotifications?: any;
        Haptics?: any;
      };
    };
  }
}

// 检测是否在 Capacitor 环境中运行
export const isCapacitor = (): boolean => {
  return !!window.Capacitor?.isNativePlatform?.();
};

// 检测是否在 Android 上运行
export const isAndroid = (): boolean => {
  return window.Capacitor?.getPlatform?.() === 'android';
};

// 获取 LocalNotifications 插件
const getLocalNotifications = () => {
  return window.Capacitor?.Plugins?.LocalNotifications;
};

// 获取 Haptics 插件
const getHaptics = () => {
  return window.Capacitor?.Plugins?.Haptics;
};

// 请求通知权限
export const requestNotificationPermission = async (): Promise<boolean> => {
  const LocalNotifications = getLocalNotifications();
  
  if (LocalNotifications) {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (e) {
      console.warn('Capacitor notification permission error:', e);
    }
  }
  
  // Web Notification API fallback
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// 检查通知权限状态
export const checkNotificationPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
  const LocalNotifications = getLocalNotifications();
  
  if (LocalNotifications) {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display as 'granted' | 'denied' | 'default';
    } catch {
      return 'default';
    }
  }
  
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
};

// 调度本地通知
export const scheduleNotification = async (
  id: number,
  title: string,
  body: string,
  scheduledAt: Date
): Promise<boolean> => {
  const LocalNotifications = getLocalNotifications();
  
  if (LocalNotifications) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id,
            title,
            body,
            schedule: { at: scheduledAt },
            sound: 'default',
            smallIcon: 'ic_stat_icon',
            iconColor: '#3B82F6',
          },
        ],
      });
      return true;
    } catch (e) {
      console.warn('Failed to schedule notification:', e);
    }
  }
  
  // Web fallback - use setTimeout
  const delay = scheduledAt.getTime() - Date.now();
  if (delay > 0 && delay < 86400000) {
    setTimeout(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/favicon.svg' });
      }
    }, delay);
    return true;
  }
  return false;
};

// 取消通知
export const cancelNotification = async (id: number): Promise<void> => {
  const LocalNotifications = getLocalNotifications();
  
  if (LocalNotifications) {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (e) {
      console.warn('Failed to cancel notification:', e);
    }
  }
};

// 取消所有通知
export const cancelAllNotifications = async (): Promise<void> => {
  const LocalNotifications = getLocalNotifications();
  
  if (LocalNotifications) {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (e) {
      console.warn('Failed to cancel all notifications:', e);
    }
  }
};

// 触发震动反馈
export const vibrate = async (duration: number = 50): Promise<void> => {
  const Haptics = getHaptics();
  
  if (Haptics) {
    try {
      await Haptics.impact({ style: 'Medium' });
      return;
    } catch {
      // Fall through to web API
    }
  }
  
  // Web vibration API fallback
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

// 生成通知 ID (基于待办 ID 的哈希)
export const generateNotificationId = (todoId: string): number => {
  let hash = 0;
  for (let i = 0; i < todoId.length; i++) {
    const char = todoId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};
