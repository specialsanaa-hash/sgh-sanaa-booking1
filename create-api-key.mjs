import crypto from 'crypto';
import mysql from 'mysql2/promise';

// توليد مفتاح API فريد
function generateApiKey() {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
}

// توليد سر المفتاح
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function createApiKey() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ خطأ: DATABASE_URL غير محدد');
    process.exit(1);
  }

  try {
    // تحليل DATABASE_URL
    const url = new URL(databaseUrl);
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
    });

    const apiKey = generateApiKey();
    const secret = generateSecret();
    
    // إدراج المفتاح في قاعدة البيانات
    const [result] = await connection.execute(
      'INSERT INTO apiKeys (userId, name, `key`, secret, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [1, 'Mobile App - Live Test', apiKey, secret, 1]
    );

    console.log('\n✅ تم إنشاء مفتاح API بنجاح!\n');
    console.log('📋 تفاصيل المفتاح:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔑 API Key: ${apiKey}`);
    console.log(`🔐 Secret: ${secret}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🔗 رابط الاتصال الكامل:\n');
    console.log(`wss://sghsanaa-ba99upcz.manus.space/socket.io/?apiKey=${apiKey}\n`);
    
    console.log('📝 تعليمات الاستخدام:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('1. انسخ الرابط أعلاه');
    console.log('2. الصقه في تطبيق الموبايل في حقل Socket.io Connection URL');
    console.log('3. اضغط على زر "الاتصال" (Connect)');
    console.log('4. سيظهر "متصل" عند نجاح الاتصال\n');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إنشاء المفتاح:', error.message);
    process.exit(1);
  }
}

createApiKey();
