import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// 将字符串 UUID 转换为 LocalNotifications 所需的 32 位无符号整数
function stringToIntegerId(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 转换为 32 位有符号整数
  }
  return Math.abs(hash); // 确保是正整数
}

export const notificationHelper = {
  // 检查是否为 Capacitor 原生应用环境
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  },

  // 检查通知是否可用
  async isSupported(): Promise<boolean> {
    if (this.isNative()) {
      return true;
    }
    return 'Notification' in window;
  },

  // 申请通知权限
  async requestPermission(): Promise<NotificationPermission> {
    if (this.isNative()) {
      try {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted' ? 'granted' : 'denied';
      } catch (e) {
        console.error('申请 Capacitor 通知权限失败:', e);
        return 'denied';
      }
    } else {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission;
      }
      return 'denied';
    }
  },

  // 获取当前的权限状态
  async getPermissionStatus(): Promise<NotificationPermission> {
    if (this.isNative()) {
      try {
        const status = await LocalNotifications.checkPermissions();
        return status.display === 'granted' ? 'granted' : 'denied';
      } catch (e) {
        console.error('获取 Capacitor 通知权限状态失败:', e);
        return 'default';
      }
    } else {
      if ('Notification' in window) {
        return Notification.permission;
      }
      return 'denied';
    }
  },

  // 发送即时通知
  async sendInstantNotification(title: string, body: string): Promise<void> {
    if (this.isNative()) {
      try {
        const hasPermission = (await LocalNotifications.checkPermissions()).display === 'granted';
        if (!hasPermission) {
          const requested = await LocalNotifications.requestPermissions();
          if (requested.display !== 'granted') return;
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              id: stringToIntegerId(`instant-${Date.now()}`),
              title,
              body,
              schedule: { at: new Date(Date.now() + 100) }, // 延迟 100ms 立刻触发
              sound: 'default',
            }
          ]
        });
      } catch (e) {
        console.error('发送 Capacitor 即时通知失败:', e);
      }
    } else {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: '✅' });
      }
    }
  },

  // 安排在未来某时间点的定时通知（核心特性，支持后台/进程杀死后提醒）
  async scheduleNotification(todoId: string, title: string, body: string, triggerAt: number): Promise<void> {
    if (triggerAt <= Date.now()) return; // 时间已过，不通知

    if (this.isNative()) {
      try {
        const hasPermission = (await LocalNotifications.checkPermissions()).display === 'granted';
        if (!hasPermission) return;

        const intId = stringToIntegerId(todoId);
        
        // 先取消该待办现有的通知，防止重复
        await this.cancelNotification(todoId);

        // 注册新定时通知
        await LocalNotifications.schedule({
          notifications: [
            {
              id: intId,
              title,
              body,
              schedule: { at: new Date(triggerAt) },
              sound: 'default',
            }
          ]
        });
        console.log(`[Notification] 成功为待办 ${todoId} 注册了定时通知，触发时间:`, new Date(triggerAt));
      } catch (e) {
        console.error('注册 Capacitor 定时通知失败:', e);
      }
    } else {
      // 网页端只能在前台通过 setTimeout 模拟定时通知（作为平滑回退）
      if ('Notification' in window && Notification.permission === 'granted') {
        const delay = triggerAt - Date.now();
        if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // 只为 24 小时内的待办进行前台模拟
          // 将定时器挂载在 window 对象上以备取消
          const timerIdName = `todo_timer_${todoId}`;
          if ((window as any)[timerIdName]) {
            clearTimeout((window as any)[timerIdName]);
          }
          (window as any)[timerIdName] = setTimeout(() => {
            new Notification(title, { body, icon: '✅' });
            delete (window as any)[timerIdName];
          }, delay);
        }
      }
    }
  },

  // 取消特定的定时通知
  async cancelNotification(todoId: string): Promise<void> {
    if (this.isNative()) {
      try {
        const intId = stringToIntegerId(todoId);
        await LocalNotifications.cancel({
          notifications: [{ id: intId }]
        });
        console.log(`[Notification] 成功取消了待办 ${todoId} 的通知`);
      } catch (e) {
        console.error('取消 Capacitor 通知失败:', e);
      }
    } else {
      // 网页端取消模拟的定时器
      const timerIdName = `todo_timer_${todoId}`;
      if ((window as any)[timerIdName]) {
        clearTimeout((window as any)[timerIdName]);
        delete (window as any)[timerIdName];
      }
    }
  }
};
