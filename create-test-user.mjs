// إنشاء مستخدم اختبار عبر API

const BASE_URL = 'https://3000-i2wwncbzuyh4g4534oney-d56e8b06.us2.manus.computer';

async function createTestUser() {
  console.log('🚀 إنشاء مستخدم اختبار');
  console.log('================================\n');

  try {
    const response = await fetch(`${BASE_URL}/api/trpc/auth.createTestUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'مستخدم اختبار',
        email: 'test@sgh-sanaa.local',
      }),
    });

    const data = await response.json();

    if (data.result && data.result.data && data.result.data.success) {
      console.log('✅ تم إنشاء المستخدم بنجاح!');
      console.log(`\n📊 بيانات المستخدم:`);
      console.log(`   👤 الاسم: ${data.result.data.message}`);
      console.log(`\n💡 الخطوات التالية:`);
      console.log(`   1. افتح المتصفح وانتقل إلى: ${BASE_URL}`);
      console.log(`   2. انقر على "تسجيل الدخول"`);
      console.log(`   3. سيتم إنشاء حساب جديد لك تلقائياً\n`);
      return true;
    } else if (data.error) {
      console.log(`❌ فشل الإنشاء`);
      console.log(`   📊 الخطأ: ${JSON.stringify(data.error)}\n`);
      return false;
    }
  } catch (error) {
    console.error(`❌ خطأ في الاتصال:`, error.message);
    return false;
  }
}

createTestUser();
