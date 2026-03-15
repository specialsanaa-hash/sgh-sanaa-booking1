import { getDb } from '../db';
import { apiKeys } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * توليد مفتاح API فريد
 */
function generateApiKey(): string {
  return 'sk_' + crypto.randomBytes(32).toString('hex');
}

/**
 * توليد سر المفتاح
 */
function generateSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * إنشاء مفتاح API جديد
 */
export async function createApiKey(
  userId: number,
  name: string,
  description?: string
) {
  try {
    const db = await getDb();
    if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

    const key = generateApiKey();
    const secret = generateSecret();

    await db.insert(apiKeys).values({
      userId,
      name,
      key,
      secret,
      description,
      isActive: 1,
    });

    console.log(`✓ تم إنشاء مفتاح API جديد: ${name}`);

    return {
      key,
      secret,
      name,
      description,
      isActive: true,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error(`✗ خطأ في إنشاء مفتاح API:`, error);
    throw error;
  }
}

/**
 * الحصول على جميع مفاتيح المستخدم
 */
export async function getUserApiKeys(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

    const keys = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId));

    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      key: k.key.substring(0, 10) + '...',
      description: k.description,
      isActive: k.isActive === 1,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  } catch (error) {
    console.error(`✗ خطأ في الحصول على مفاتيح المستخدم:`, error);
    throw error;
  }
}

/**
 * تفعيل/تعطيل مفتاح API
 */
export async function toggleApiKey(keyId: number, isActive: boolean) {
  try {
    const db = await getDb();
    if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

    await db
      .update(apiKeys)
      .set({ isActive: isActive ? 1 : 0 })
      .where(eq(apiKeys.id, keyId));

    console.log(`✓ تم ${isActive ? 'تفعيل' : 'تعطيل'} مفتاح API رقم ${keyId}`);

    return { success: true };
  } catch (error) {
    console.error(`✗ خطأ في تغيير حالة مفتاح API:`, error);
    throw error;
  }
}

/**
 * حذف مفتاح API
 */
export async function deleteApiKey(keyId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

    await db.delete(apiKeys).where(eq(apiKeys.id, keyId));

    console.log(`✓ تم حذف مفتاح API رقم ${keyId}`);

    return { success: true };
  } catch (error) {
    console.error(`✗ خطأ في حذف مفتاح API:`, error);
    throw error;
  }
}

/**
 * إعادة تعيين مفتاح API (توليد مفتاح جديد)
 */
export async function regenerateApiKey(keyId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error('خطأ في الاتصال بقاعدة البيانات');

    const newKey = generateApiKey();
    const newSecret = generateSecret();

    await db
      .update(apiKeys)
      .set({
        key: newKey,
        secret: newSecret,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, keyId));

    console.log(`✓ تم إعادة تعيين مفتاح API رقم ${keyId}`);

    return {
      id: keyId,
      key: newKey,
      secret: newSecret,
    };
  } catch (error) {
    console.error(`✗ خطأ في إعادة تعيين مفتاح API:`, error);
    throw error;
  }
}

/**
 * التحقق من صحة مفتاح API
 */
export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const result = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.key, key))
      .limit(1);

    if (!result || result.length === 0) return false;

    return result[0].isActive === 1;
  } catch (error) {
    console.error(`✗ خطأ في التحقق من مفتاح API:`, error);
    return false;
  }
}
