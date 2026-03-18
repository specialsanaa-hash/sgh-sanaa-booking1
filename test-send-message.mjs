// استخدام fetch المدمج في Node.js 18+

const BASE_URL = 'https://3000-i0fiz5orq7hw1j5umznmg-f06edb92.us2.manus.computer';

async function testSendMessage() {
  console.log('🚀 اختبار إرسال رسالة عبر Socket.io');
  console.log('================================\n');

  try {
    // إرسال رسالة WhatsApp
    console.log('📤 جاري إرسال رسالة WhatsApp...');
    const response = await fetch(`${BASE_URL}/api/trpc/messaging.sendTestMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: '773171477',
        message: 'رسالة اختبار من منصة حجز المستشفى السعودي الألماني - صنعاء',
        type: 'whatsapp',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ تم إرسال الرسالة بنجاح!');
      console.log('📊 البيانات:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ فشل الإرسال');
      console.log('📊 الخطأ:', error);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }

  console.log('\n================================');
  console.log('✨ انتهى الاختبار');
}

testSendMessage();
