import Pusher from 'pusher-js';

// يجب أن تكون مفاتيح Pusher في متغيرات البيئة
const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

if (!PUSHER_KEY || !PUSHER_CLUSTER) {
  console.warn("[Pusher] Client configuration missing. Real-time notifications will be disabled.");
}

export const pusherClient = new Pusher(PUSHER_KEY || 'dummy_key', {
  cluster: PUSHER_CLUSTER || 'mt1',
  // يجب أن يكون التوثيق عبر الخادم
  authEndpoint: '/api/pusher/auth', 
});

// قناة الإشعارات العامة للوحة التحكم
export const dashboardChannel = pusherClient.subscribe('dashboard-channel');

// مثال على كيفية استخدام الإشعارات في المكونات
// import { dashboardChannel } from "../pusher";
// useEffect(() => {
//   dashboardChannel.bind('new-booking', (data: { message: string, bookingId: number }) => {
//     alert(data.message);
//   });
//   return () => {
//     dashboardChannel.unbind('new-booking');
//   };
// }, []);
