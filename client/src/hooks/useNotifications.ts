import { create } from 'zustand';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
  read: boolean;
}

interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotificationsEnabled: boolean;
  toastNotificationsEnabled: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  settings: NotificationSettings;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  playSound: () => void;
}

// استخدام Zustand لإدارة حالة الإشعارات
export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  settings: {
    soundEnabled: true,
    desktopNotificationsEnabled: true,
    toastNotificationsEnabled: true,
  },

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50), // احفظ آخر 50 إشعار فقط
    }));

    // عرض Toast notification
    if (notification.type === 'success') {
      toast.success(notification.message);
    } else if (notification.type === 'error') {
      toast.error(notification.message);
    } else if (notification.type === 'warning') {
      toast(notification.message, {
        icon: '⚠️',
      });
    } else {
      toast(notification.message);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  playSound: () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // تشغيل صوت تنبيه (نغمة بسيطة)
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  },
}));

// Hook مخصص لاستخدام الإشعارات
export const useNotifications = () => {
  const store = useNotificationStore();

  const notify = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    playSound = true
  ) => {
    store.addNotification({ title, message, type });

    // تشغيل الصوت إذا كان مفعلاً
    if (playSound && store.settings.soundEnabled) {
      store.playSound();
    }

    // عرض إشعار سطح المكتب إذا كان مفعلاً
    if (store.settings.desktopNotificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/logo.svg',
        });
      }
    }
  };

  return {
    ...store,
    notify,
  };
};
