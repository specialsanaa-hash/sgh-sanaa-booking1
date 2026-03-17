import { io } from 'socket.io-client';

// بيانات الاتصال
const apiKey = 'sk_8f4860da58325ac2e8860e24057ccf5b5881088acf9a8acf3a4e7955c4';
const socketUrl = `wss://sghsanaa-ba99upcz.manus.space/socket.io/?apiKey=${apiKey}`;

console.log('🔗 محاولة الاتصال بـ Socket.io...');
console.log('URL:', socketUrl);

const socket = io(socketUrl, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('✅ تم الاتصال بنجاح بـ Socket.io!');
  console.log('Socket ID:', socket.id);

  // إرسال رسالة اختبار
  const testMessage = {
    id: `msg-${Date.now()}`,
    type: 'whatsapp',
    phoneNumber: '773171477',
    message: 'مرحباً! هذه رسالة اختبار من منصة حجز المستشفى السعودي الألماني - صنعاء',
    timestamp: Date.now(),
  };

  console.log('\n📨 إرسال رسالة اختبار...');
  console.log(JSON.stringify(testMessage, null, 2));

  socket.emit('send_message', testMessage, (response) => {
    console.log('\n✅ استجابة السيرفر:', response);
  });

  // الاستماع لتقرير حالة الرسالة
  socket.on('message_response', (data) => {
    console.log('\n📊 تقرير حالة الرسالة:', data);
  });

  // الاستماع لحالة الجهاز
  socket.on('device_status', (data) => {
    console.log('\n📱 حالة الجهاز:', data);
  });

  // إغلاق الاتصال بعد 5 ثواني
  setTimeout(() => {
    console.log('\n🔌 إغلاق الاتصال...');
    socket.disconnect();
    process.exit(0);
  }, 5000);
});

socket.on('error', (error) => {
  console.error('❌ خطأ في الاتصال:', error);
  process.exit(1);
});

socket.on('disconnect', () => {
  console.log('⚠️ تم قطع الاتصال');
});
