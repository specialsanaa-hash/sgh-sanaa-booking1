import mysql from 'mysql2/promise';

// بيانات الاتصال بقاعدة البيانات
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ba99upczdzklcyoaazttai',
};

async function addTestUser() {
  console.log('🚀 إضافة مستخدم اختبار');
  console.log('================================\n');

  try {
    const connection = await mysql.createConnection(connectionConfig);

    // بيانات المستخدم الاختبار
    const testUser = {
      openId: 'test-user-' + Date.now(),
      name: 'مستخدم اختبار',
      email: 'test@sgh-sanaa.local',
      loginMethod: 'test',
      role: 'admin', // إعطاء صلاحيات admin للاختبار
    };

    console.log('📝 بيانات المستخدم:');
    console.log(`   👤 الاسم: ${testUser.name}`);
    console.log(`   📧 البريد: ${testUser.email}`);
    console.log(`   🔑 معرف OpenID: ${testUser.openId}`);
    console.log(`   👑 الدور: ${testUser.role}\n`);

    // إدراج المستخدم
    const query = `
      INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())
    `;

    const [result] = await connection.execute(query, [
      testUser.openId,
      testUser.name,
      testUser.email,
      testUser.loginMethod,
      testUser.role,
    ]);

    console.log('✅ تم إضافة المستخدم بنجاح!');
    console.log(`   📌 معرف المستخدم: ${result.insertId}\n`);

    // الحصول على بيانات المستخدم المضافة
    const [users] = await connection.execute(
      'SELECT id, openId, name, email, role FROM users WHERE id = ?',
      [result.insertId]
    );

    if (users.length > 0) {
      const user = users[0];
      console.log('📊 بيانات المستخدم المضافة:');
      console.log(`   ID: ${user.id}`);
      console.log(`   OpenID: ${user.openId}`);
      console.log(`   الاسم: ${user.name}`);
      console.log(`   البريد: ${user.email}`);
      console.log(`   الدور: ${user.role}\n`);
    }

    await connection.end();

    console.log('✨ انتهت عملية الإضافة بنجاح!');
    console.log('================================');
    console.log('\n📝 ملاحظة:');
    console.log('   يمكنك الآن تسجيل الدخول باستخدام حسابك عبر Manus OAuth');
    console.log('   سيتم ربط حسابك بالمستخدم المضاف تلقائياً\n');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

addTestUser();
