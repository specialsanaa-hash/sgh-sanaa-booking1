import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Copy, Eye, EyeOff, Plus, Trash2, RotateCcw, Wifi, WifiOff, Battery } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function SocketIOManagement() {
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyDescription, setKeyDescription] = useState('');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [newKeyData, setNewKeyData] = useState<any>(null);

  // Queries
  const { data: apiKeys, isLoading: keysLoading, refetch: refetchKeys } = trpc.socketio.getMyApiKeys.useQuery();
  const { data: connections, isLoading: connectionsLoading, refetch: refetchConnections } = trpc.socketio.getActiveConnections.useQuery();
  const { data: stats } = trpc.socketio.getMessageStats.useQuery();

  // Mutations
  const createKeyMutation = trpc.socketio.createApiKey.useMutation({
    onSuccess: (result) => {
      setNewKeyData(result.data);
      setKeyName('');
      setKeyDescription('');
      toast.success('تم إنشاء مفتاح API بنجاح');
      refetchKeys();
    },
    onError: (error) => {
      toast.error('فشل إنشاء المفتاح: ' + error.message);
    },
  });

  const deleteKeyMutation = trpc.socketio.deleteApiKey.useMutation({
    onSuccess: () => {
      toast.success('تم حذف المفتاح بنجاح');
      refetchKeys();
    },
    onError: (error) => {
      toast.error('فشل حذف المفتاح: ' + error.message);
    },
  });

  const toggleKeyMutation = trpc.socketio.toggleApiKey.useMutation({
    onSuccess: () => {
      toast.success('تم تحديث حالة المفتاح');
      refetchKeys();
    },
    onError: (error) => {
      toast.error('فشل تحديث المفتاح: ' + error.message);
    },
  });

  const regenerateKeyMutation = trpc.socketio.regenerateApiKey.useMutation({
    onSuccess: (result) => {
      setNewKeyData(result.data);
      toast.success('تم إعادة تعيين المفتاح بنجاح');
      refetchKeys();
    },
    onError: (error) => {
      toast.error('فشل إعادة تعيين المفتاح: ' + error.message);
    },
  });

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      toast.error('اسم المفتاح مطلوب');
      return;
    }
    createKeyMutation.mutate({ name: keyName, description: keyDescription });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label}`);
  };

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة Socket.io</h1>
        <p className="text-gray-600 mt-2">إدارة مفاتيح API والاتصالات مع تطبيق الرسائل</p>
      </div>

      {/* رابط الاتصال */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">رابط الاتصال</CardTitle>
          <CardDescription>استخدم هذا الرابط في تطبيق الرسائل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <code className="text-sm text-gray-800 break-all">
              wss://{window.location.host}/socket.io/?apiKey=YOUR_API_KEY
            </code>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() =>
                copyToClipboard(
                  `wss://${window.location.host}/socket.io/?apiKey=YOUR_API_KEY`,
                  'رابط الاتصال'
                )
              }
            >
              <Copy className="h-4 w-4 ml-2" />
              نسخ الرابط
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي الرسائل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.data.total}</div>
              <p className="text-xs text-gray-500 mt-1">منذ البداية</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">الرسائل المرسلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.data.sent}</div>
              <p className="text-xs text-gray-500 mt-1">نجحت بنجاح</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">الرسائل الفاشلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.data.failed}</div>
              <p className="text-xs text-gray-500 mt-1">تحتاج إلى إعادة محاولة</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* الاتصالات النشطة */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>الاتصالات النشطة</CardTitle>
              <CardDescription>الأجهزة المتصلة حالياً</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetchConnections()}>
              تحديث
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connectionsLoading ? (
            <p className="text-gray-500">جاري التحميل...</p>
          ) : connections && connections.data.length > 0 ? (
            <div className="space-y-3">
              {connections.data.map((conn: any) => (
                <div key={conn.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wifi className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-sm">{conn.platform || 'غير معروف'}</p>
                      <p className="text-xs text-gray-500">{conn.socketId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {conn.batteryLevel && (
                      <div className="flex items-center gap-1">
                        <Battery className="h-4 w-4" />
                        <span>{conn.batteryLevel}%</span>
                      </div>
                    )}
                    <Badge variant="secondary">{conn.networkType || 'غير معروف'}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <WifiOff className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد اتصالات نشطة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* مفاتيح API */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>مفاتيح API</CardTitle>
              <CardDescription>إدارة مفاتيح الوصول إلى Socket.io</CardDescription>
            </div>
            <Dialog open={showNewKeyForm} onOpenChange={setShowNewKeyForm}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  مفتاح جديد
                </Button>
              </DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader>
                  <DialogTitle>إنشاء مفتاح API جديد</DialogTitle>
                  <DialogDescription>
                    أنشئ مفتاح جديد لربط تطبيق الرسائل
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">اسم المفتاح</label>
                    <Input
                      placeholder="مثال: تطبيق الرسائل الرئيسي"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">الوصف (اختياري)</label>
                    <Textarea
                      placeholder="وصف استخدام هذا المفتاح"
                      value={keyDescription}
                      onChange={(e) => setKeyDescription(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleCreateKey}
                    disabled={createKeyMutation.isPending}
                    className="w-full"
                  >
                    {createKeyMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء المفتاح'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {keysLoading ? (
            <p className="text-gray-500">جاري التحميل...</p>
          ) : apiKeys && apiKeys.data.length > 0 ? (
            <div className="space-y-3">
              {apiKeys.data.map((key: any) => (
                <div key={key.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{key.name}</p>
                      {key.description && (
                        <p className="text-sm text-gray-500">{key.description}</p>
                      )}
                    </div>
                    <Badge variant={key.isActive ? 'default' : 'secondary'}>
                      {key.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                  </div>

                  <div className="bg-gray-50 p-3 rounded mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">المفتاح:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-white px-2 py-1 rounded">{key.key}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.key, 'المفتاح')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleKeyMutation.mutate({
                          keyId: key.id,
                          isActive: !key.isActive,
                        })
                      }
                    >
                      {key.isActive ? 'تعطيل' : 'تفعيل'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenerateKeyMutation.mutate({ keyId: key.id })}
                    >
                      <RotateCcw className="h-3 w-3 ml-1" />
                      إعادة تعيين
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('هل أنت متأكد من حذف هذا المفتاح؟')) {
                          deleteKeyMutation.mutate({ keyId: key.id });
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">لم تنشئ أي مفاتيح بعد</p>
          )}
        </CardContent>
      </Card>

      {/* عرض المفتاح الجديد */}
      {newKeyData && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-3">
              <p className="font-semibold">✓ تم إنشاء المفتاح بنجاح</p>
              <p className="text-sm">
                احفظ هذه البيانات في مكان آمن. لن تتمكن من رؤية السر مرة أخرى.
              </p>
              <div className="bg-white p-3 rounded space-y-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">المفتاح:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                      {newKeyData.key}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(newKeyData.key, 'المفتاح')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">السر:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 break-all">
                      {newKeyData.secret}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(newKeyData.secret, 'السر')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setNewKeyData(null)}
                className="w-full"
              >
                تم الحفظ
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
