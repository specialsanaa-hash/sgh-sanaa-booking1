import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotificationStore } from '@/hooks/useNotifications';
import { Bell, Volume2, Monitor, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NotificationSettings() {
  const [, setLocation] = useLocation();
  const { settings, updateSettings, playSound } = useNotificationStore();
  const [localSettings, setLocalSettings] = React.useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleToggle = (key: keyof typeof settings) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('تم حفظ إعدادات الإشعارات بنجاح');
  };

  const handleTestSound = () => {
    playSound();
    toast.success('تم تشغيل صوت الاختبار');
  };

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        toast.success('لديك بالفعل إذن الإشعارات');
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast.success('تم منح إذن الإشعارات');
          new Notification('إشعارات المنصة', {
            body: 'تم تفعيل إشعارات سطح المكتب بنجاح',
            icon: '/logo.svg',
          });
        } else {
          toast.error('تم رفض إذن الإشعارات');
        }
      }
    } else {
      toast.error('المتصفح الحالي لا يدعم الإشعارات');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إعدادات الإشعارات</h1>
            <p className="text-gray-600 mt-2">تحكم في كيفية تلقيك للإشعارات والتنبيهات</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setLocation('/dashboard')}
          >
            العودة
          </Button>
        </div>

        {/* بطاقات الإعدادات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* الإشعارات الصوتية */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Volume2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">الإشعارات الصوتية</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    تشغيل صوت عند وصول رسائل أو إشعارات جديدة
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={() => handleToggle('soundEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {localSettings.soundEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSound}
                className="mt-4 w-full"
              >
                اختبر الصوت
              </Button>
            )}
          </Card>

          {/* إشعارات سطح المكتب */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Monitor className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">إشعارات سطح المكتب</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    إظهار إشعارات في أعلى الشاشة حتى عند إغلاق التطبيق
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.desktopNotificationsEnabled}
                  onChange={() => handleToggle('desktopNotificationsEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            {localSettings.desktopNotificationsEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestNotificationPermission}
                className="mt-4 w-full"
              >
                طلب الإذن
              </Button>
            )}
          </Card>

          {/* إشعارات التطبيق */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">إشعارات التطبيق</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    إظهار إشعارات داخل التطبيق عند وصول رسائل جديدة
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.toastNotificationsEnabled}
                  onChange={() => handleToggle('toastNotificationsEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </Card>

          {/* معلومات إضافية */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">نصائح</h3>
                <ul className="text-sm text-gray-600 mt-2 space-y-2">
                  <li>• تأكد من تفعيل الصوت على جهازك</li>
                  <li>• قد تحتاج إلى تحديث إذن الإشعارات في إعدادات المتصفح</li>
                  <li>• الإشعارات الفورية تتطلب اتصال إنترنت مستقر</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* أزرار الإجراء */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => setLocalSettings(settings)}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
          >
            حفظ الإعدادات
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
