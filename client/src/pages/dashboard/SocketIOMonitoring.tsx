import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Wifi, Zap, Smartphone, MessageSquare, Activity } from 'lucide-react';

interface Connection {
  id: number;
  socketId: string;
  platform: string | null;
  batteryLevel: number | null;
  networkType: string | null;
  lastHeartbeat: Date | null;
  connectedAt: Date | null;
}

interface MessageLog {
  id: number;
  type: string;
  direction: string;
  status: string;
  payload: unknown;
  createdAt: Date;
}

interface Stats {
  total: number;
  sent: number;
  received: number;
  pending: number;
  delivered: number;
  failed: number;
}

export default function SocketIOMonitoring() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch active connections
  const { data: connectionsData, refetch: refetchConnections } = trpc.socketio.getActiveConnections.useQuery(undefined, {
    enabled: true,
  });

  // Fetch message logs
  const { data: logsData, refetch: refetchLogs } = trpc.socketio.getMessageLogs.useQuery(
    { limit: 100, offset: 0, type: filterType as any },
    { enabled: true }
  );

  // Fetch stats
  const { data: statsData, refetch: refetchStats } = trpc.socketio.getMessageStats.useQuery(undefined, {
    enabled: true,
  });

  // Update state when data changes
  useEffect(() => {
    if (connectionsData?.data) {
      setConnections(connectionsData.data);
    }
  }, [connectionsData]);

  useEffect(() => {
    if (logsData?.data) {
      setMessageLogs(logsData.data);
    }
  }, [logsData]);

  useEffect(() => {
    if (statsData?.data) {
      setStats(statsData.data);
    }
  }, [statsData]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchConnections();
      refetchLogs();
      refetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchConnections, refetchLogs, refetchStats]);

  const handleRefresh = () => {
    refetchConnections();
    refetchLogs();
    refetchStats();
  };

  const filteredConnections = connections.filter((conn) =>
    conn.socketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conn.platform?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getBatteryColor = (level: number) => {
    if (level > 0.5) return 'text-green-600';
    if (level > 0.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'sent' ? '📤' : '📥';
  };

  const renderPayload = (payload: unknown): string => {
    try {
      if (typeof payload === 'string') {
        return JSON.stringify(JSON.parse(payload), null, 2);
      }
      return JSON.stringify(payload, null, 2);
    } catch {
      return 'خطأ في تحليل البيانات';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مراقبة Socket.io</h1>
          <p className="text-gray-600 mt-1">مراقبة الاتصالات والرسائل والأجهزة المتصلة</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {autoRefresh ? 'إيقاف' : 'تشغيل'} التحديث التلقائي
          </Button>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            تحديث الآن
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الرسائل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مرسلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مستقبلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.received}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">تم التسليم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">فشلت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="connections" className="flex items-center gap-2">
            <Wifi className="w-4 h-4" />
            الاتصالات النشطة
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            سجل الرسائل
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            النشاط
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الاتصالات النشطة ({filteredConnections.length})</CardTitle>
              <CardDescription>
                الأجهزة المتصلة حالياً بخادم Socket.io
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="ابحث عن Socket ID أو النظام الأساسي..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {filteredConnections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Smartphone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد اتصالات نشطة حالياً</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredConnections.map((conn) => (
                    <div
                      key={conn.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Socket ID</p>
                          <p className="font-mono text-sm break-all">{conn.socketId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">النظام الأساسي</p>
                          <Badge variant="outline">{conn.platform || 'N/A'}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className={`w-4 h-4 ${getBatteryColor(conn.batteryLevel || 0)}`} />
                          <div>
                            <p className="text-sm text-gray-600">البطارية</p>
                            <p className="font-semibold">
                              {conn.batteryLevel ? Math.round(conn.batteryLevel * 100) : 'N/A'}%
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">نوع الشبكة</p>
                          <Badge variant="secondary">{conn.networkType || 'N/A'}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">آخر نبض</p>
                          <p className="text-sm">
                            {conn.lastHeartbeat ? new Date(conn.lastHeartbeat).toLocaleTimeString('ar-SA') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">وقت الاتصال</p>
                          <p className="text-sm">
                            {conn.connectedAt ? new Date(conn.connectedAt).toLocaleString('ar-SA') : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل الرسائل</CardTitle>
              <CardDescription>
                آخر 100 رسالة من وإلى تطبيق الموبايل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={!filterType ? 'default' : 'outline'}
                  onClick={() => setFilterType(undefined)}
                  size="sm"
                >
                  الكل
                </Button>
                <Button
                  variant={filterType === 'send_message' ? 'default' : 'outline'}
                  onClick={() => setFilterType('send_message')}
                  size="sm"
                >
                  إرسال الرسائل
                </Button>
                <Button
                  variant={filterType === 'device_status' ? 'default' : 'outline'}
                  onClick={() => setFilterType('device_status')}
                  size="sm"
                >
                  حالة الجهاز
                </Button>
                <Button
                  variant={filterType === 'message_response' ? 'default' : 'outline'}
                  onClick={() => setFilterType('message_response')}
                  size="sm"
                >
                  استجابة الرسالة
                </Button>
              </div>

              {messageLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>لا توجد رسائل</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {messageLogs.map((log) => (
                    <div
                      key={log.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 transition text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getDirectionIcon(log.direction)}</span>
                            <Badge variant="outline">{log.type}</Badge>
                            <Badge className={getStatusColor(log.status)}>
                              {log.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600">
                            {new Date(log.createdAt).toLocaleString('ar-SA')}
                          </p>
                          {log.payload ? (
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto max-w-full">
                              {renderPayload(log.payload)}
                            </pre>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ملخص النشاط</CardTitle>
              <CardDescription>
                إحصائيات الاتصالات والرسائل
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">الاتصالات</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">الاتصالات النشطة:</span>
                      <span className="font-semibold">{connections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">أنظمة أساسية:</span>
                      <span className="font-semibold">
                        {new Set(connections.map((c) => c.platform)).size}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">الرسائل</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">إجمالي الرسائل:</span>
                      <span className="font-semibold">{stats?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">معدل النجاح:</span>
                      <span className="font-semibold text-green-600">
                        {stats?.total ? Math.round((stats.delivered / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">معلومات الاتصال</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">رابط الاتصال الموصى به:</span>
                  </p>
                  <code className="block text-xs bg-white p-2 rounded border break-all">
                    wss://3000-i0fiz5orq7hw1j5umznmg-f06edb92.us2.manus.computer/socket.io/?apiKey=sk_b099b0f8f4860da58325ac2e8860e24057ccf5b588108acf9a8acf3a4e7955c4
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    استخدم هذا الرابط في تطبيق الموبايل للاتصال بخادم Socket.io
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
