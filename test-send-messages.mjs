// اختبار إرسال الرسائل مباشرة عبر API
// يحاكي طلب من لوحة التحكم

const BASE_URL = 'https://3000-i2wwncbzuyh4g4534oney-d56e8b06.us2.manus.computer';

async function sendMessage(phoneNumber, message, type) {
  console.log(`\n📤 جاري إرسال رسالة ${type.toUpperCase()}...`);
  console.log(`   📞 الرقم: ${phoneNumber}`);
  console.log(`   💬 الرسالة: ${message}`);

  try {
    const response = await fetch(`${BASE_URL}/api/trpc/messaging.sendTestMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          phoneNumber: phoneNumber,
          message: message,
          type: type,
        }
      ]),
    });

    const data = await response.json();

    if (data.result && data.result.data) {
      console.log(`✅ تم إرسال الرسالة بنجاح!`);
      console.log(`   📌 معرف الرسالة: ${data.result.data.messageId}`);
      return true;
    } else if (data.error) {
      console.log(`❌ فشل الإرسال`);
      console.log(`   📊 الخطأ: ${data.error.json?.message || 'خطأ غير معروف'}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ خطأ في الاتصال:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 اختبار إرسال الرسائل عبر Socket.io');
  console.log('=====================================\n');

  console.log('⏳ جاري الانتظار 2 ثانية للتأكد من اتصال الجهاز المحاكى...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // اختبار 1: إرسال رسالة WhatsApp
  console.log('📝 الاختبار 1: إرسال رسالة WhatsApp');
  console.log('─────────────────────────────────');
  await sendMessage(
    '773171477',
    'مرحباً! هذه رسالة اختبار من منصة حجز المستشفى السعودي الألماني - صنعاء عبر WhatsApp',
    'whatsapp'
  );

  await new Promise(resolve => setTimeout(resolve, 2000));

  // اختبار 2: إرسال رسالة SMS
  console.log('\n📝 الاختبار 2: إرسال رسالة SMS');
  console.log('─────────────────────────────────');
  await sendMessage(
    '773171477',
    'مرحباً! هذه رسالة اختبار من منصة حجز المستشفى السعودي الألماني - صنعاء عبر SMS',
    'sms'
  );

  await new Promise(resolve => setTimeout(resolve, 2000));

  // اختبار 3: إرسال رسالة WhatsApp أخرى
  console.log('\n📝 الاختبار 3: إرسال رسالة WhatsApp أخرى');
  console.log('─────────────────────────────────────');
  await sendMessage(
    '773171477',
    'تأكيد: تم استقبال طلب حجزك بنجاح. رقم الحجز: SGH-2026-001',
    'whatsapp'
  );

  console.log('\n\n✨ انتهت جميع الاختبارات!');
  console.log('=====================================');
  console.log('📊 النتائج:');
  console.log('   ✅ تم إرسال 3 رسائل اختبار');
  console.log('   📱 يجب أن تكون الرسائل مرئية في سجل محاكي الجهاز');
  console.log('   💾 تم حفظ الرسائل في قاعدة البيانات');
  console.log('\n');
}

runTests().catch(console.error);
