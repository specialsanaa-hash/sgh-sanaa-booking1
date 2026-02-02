
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, Plus, Edit2, Trash2, Eye, Download, TrendingUp, Users, 
  Calendar, CheckCircle, Clock, XCircle, BarChart3, FileText, Settings, Stethoscope, BookOpen
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { dashboardChannel } from "../pusher";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [newCampaignStartDate, setNewCampaignStartDate] = useState("");
  const [newCampaignEndDate, setNewCampaignEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // تحقق من المصادقة والدور في البداية
  const isAdmin = isAuthenticated && user?.role === "admin";

  // Queries - تعطيل الـ queries إذا لم يكن المستخدم admin
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = trpc.campaigns.list.useQuery(undefined, {
    enabled: isAdmin,
  });
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.bookings.list.useQuery({}, {
    enabled: isAdmin,
  });

  const { data: forms, isLoading: formsLoading, refetch: refetchForms } = trpc.forms.listByCampaign.useQuery(selectedCampaign || 0, {
    enabled: isAdmin && !!selectedCampaign,
  });

  // Mutations
  const deleteBookingMutation = trpc.bookings.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحجز بنجاح");
      refetchBookings();
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء حذف الحجز: " + error.message);
    },
  });

  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الحجز بنجاح");
      refetchBookings();
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء تحديث الحالة: " + error.message);
    },
  });

  const createCampaignMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحملة بنجاح");
      setNewCampaignName("");
      setNewCampaignDesc("");
      setNewCampaignStartDate("");
      setNewCampaignEndDate("");
      setShowNewCampaignForm(false);
      refetchCampaigns();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleUpdateStatus = (id: number, status: "pending" | "confirmed" | "cancelled" | "completed") => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDeleteBooking = (id: number) => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteBookingMutation.mutate(id);
    }
  };

  const deleteFormMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف النموذج بنجاح");
      refetchForms();
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء حذف النموذج: " + error.message);
    },
  });

  const handleDeleteForm = (id: number) => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذا النموذج؟ سيتم حذف جميع الحقول المرتبطة به.")) {
      deleteFormMutation.mutate(id);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error("يرجى إدخال اسم الحملة");
      return;
    }
    await createCampaignMutation.mutateAsync({
      name: newCampaignName,
      description: newCampaignDesc,
    });
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings?.filter((booking) => {
    const matchesSearch = 
      booking.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.patientPhone.includes(searchQuery);
    const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate statistics
  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  const completedBookings = bookings?.filter(b => b.status === "completed").length || 0;
  const cancelledBookings = bookings?.filter(b => b.status === "cancelled").length || 0;

  const statusData = [
    { name: 'مؤكدة', value: confirmedBookings, color: '#10B981' }, // Green
    { name: 'قيد الانتظار', value: pendingBookings, color: '#F59E0B' }, // Yellow
    { name: 'مكتملة', value: completedBookings, color: '#8B5CF6' }, // Purple
    { name: 'ملغاة', value: cancelledBookings, color: '#EF4444' }, // Red
  ].filter(item => item.value > 0);

  const campaignsData = campaigns?.map(campaign => ({
    name: campaign.name,
    'الحجوزات': bookings?.filter(b => b.campaignId === campaign.id).length || 0,
  })) || [];

  // Pusher Real-time Notifications
  useEffect(() => {
    dashboardChannel.bind('new-booking', (data: { message: string, bookingId: number }) => {
      toast.info(data.message, {
        action: {
          label: "عرض",
          onClick: () => window.location.href = `/booking-details/${data.bookingId}`,
        },
      });
      refetchBookings();
    });

    return () => {
      dashboardChannel.unbind('new-booking');
    };
  }, [refetchBookings]);

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="text-slate-600 mt-2">مرحباً {user?.name}، إدارة الحملات والحجوزات</p>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/doctors">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Stethoscope className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold">الأطباء</h3>
                <p className="text-sm text-muted-foreground">عرض قائمة الأطباء</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/manage-doctors">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold">إدارة الأطباء</h3>
                <p className="text-sm text-muted-foreground">إضافة وتعديل الأطباء</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/manage-pages">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold">إدارة الصفحات</h3>
                <p className="text-sm text-muted-foreground">إنشاء صفحات ثابتة</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/bookings">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <BookOpen className="h-8 w-8 text-orange-600 mb-2" />
                <h3 className="font-semibold">الحجوزات</h3>
                <p className="text-sm text-muted-foreground">عرض جميع الحجوزات</p>
              </CardContent>
            </Card>
          </Link>
        </div>
        {/* Campaigns Section */}
        <div>
          <Dialog open={showNewCampaignForm} onOpenChange={setShowNewCampaignForm}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-5 w-5" />
                حملة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إنشاء حملة إعلانية جديدة</DialogTitle>
                <DialogDescription>
                  أضف حملة جديدة لاستقبال الحجوزات من المرضى
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">اسم الحملة *</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="مثال: المخيم الخيري الأول"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-desc">الوصف</Label>
                  <Input
                    id="campaign-desc"
                    value={newCampaignDesc}
                    onChange={(e) => setNewCampaignDesc(e.target.value)}
                    placeholder="وصف الحملة والخدمات المقدمة"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign-start">تاريخ البداية</Label>
                    <Input
                      id="campaign-start"
                      type="date"
                      value={newCampaignStartDate}
                      onChange={(e) => setNewCampaignStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaign-end">تاريخ النهاية</Label>
                    <Input
                      id="campaign-end"
                      type="date"
                      value={newCampaignEndDate}
                      onChange={(e) => setNewCampaignEndDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={createCampaignMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {createCampaignMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      "إنشاء الحملة"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowNewCampaignForm(false)}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">إجمالي الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalBookings}</div>
              <p className="text-xs text-slate-500 mt-1">+20.1% من الشهر الماضي</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">الحجوزات المؤكدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{confirmedBookings}</div>
              <p className="text-xs text-slate-500 mt-1">من إجمالي {totalBookings}</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">قيد الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{pendingBookings}</div>
              <p className="text-xs text-slate-500 mt-1">تحتاج إلى متابعة</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">الحجوزات المكتملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{completedBookings}</div>
              <p className="text-xs text-slate-500 mt-1">تمت خدمتهم</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">الحجوزات الملغاة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{cancelledBookings}</div>
              <p className="text-xs text-slate-500 mt-1">تم الإلغاء</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns" className="gap-2"><Calendar className="h-4 w-4" /> الحملات</TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2"><Users className="h-4 w-4" /> الحجوزات</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4" /> التقارير</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> الإعدادات</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCampaign === campaign.id
                        ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                        : ""
                    }`}
                    onClick={() => setSelectedCampaign(campaign.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">
                            {campaign.description || "بدون وصف"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">الحجوزات:</span>
                        <span className="font-bold text-green-600">
                          {bookings?.filter(b => b.campaignId === campaign.id).length || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-600 text-lg">لا توجد حملات حالياً</p>
                  <p className="text-slate-500 text-sm mt-2">ابدأ بإنشاء حملة جديدة</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>إدارة الحجوزات</CardTitle>
                    <CardDescription>
                      {selectedCampaign ? "الحجوزات للحملة المختارة" : "جميع الحجوزات"}
                    </CardDescription>
                  </div>
                  <Link href="/export-bookings">
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                      <Download className="h-4 w-4" />
                      تصدير Excel
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="ابحث عن اسم أو هاتف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="تصفية حسب الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكدة</SelectItem>
                      <SelectItem value="completed">مكتملة</SelectItem>
                      <SelectItem value="cancelled">ملغاة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bookings Table */}
                {bookingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                  </div>
                ) : filteredBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-slate-200 bg-slate-50">
                          <th className="text-right py-4 px-4 font-semibold text-slate-700">اسم المريض</th>
                          <th className="text-right py-4 px-4 font-semibold text-slate-700">الهاتف</th>
                          <th className="text-right py-4 px-4 font-semibold text-slate-700">البريد</th>
                          <th className="text-right py-4 px-4 font-semibold text-slate-700">الحالة</th>
                          <th className="text-right py-4 px-4 font-semibold text-slate-700">التاريخ</th>
                          <th className="text-right py-4 px-4 font-semibold text-slate-700">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-4 font-medium text-slate-900">{booking.patientName}</td>
                            <td className="py-4 px-4 text-slate-600">{booking.patientPhone}</td>
                            <td className="py-4 px-4 text-slate-600 text-xs">{booking.patientEmail || "-"}</td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}>
                                {booking.status === "confirmed" && "✓ مؤكد"}
                                {booking.status === "pending" && "⏱ قيد الانتظار"}
                                {booking.status === "cancelled" && "✕ ملغى"}
                                {booking.status === "completed" && "✓ مكتمل"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600 text-sm">
                              {new Date(booking.createdAt).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                <Link href={`/booking-details/${booking.id}`}>
                                  <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>تغيير الحالة</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "confirmed")}>
                                      ✓ مؤكدة
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "pending")}>
                                      ⏱ قيد الانتظار
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "completed")}>
                                      ✓ مكتملة
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, "cancelled")}>
                                      ✕ ملغاة
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => handleDeleteBooking(booking.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg">لا توجد حجوزات</p>
                    <p className="text-slate-500 text-sm mt-2">لم يتم العثور على حجوزات مطابقة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">توزيع الحجوزات حسب الحالة</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} حجز`, name]} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الإحصائيات السريعة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium">إجمالي الحملات</p>
                      <p className="text-2xl font-bold text-blue-900 mt-2">{campaigns?.length || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-green-600 font-medium">إجمالي النماذج</p>
                      <p className="text-2xl font-bold text-green-900 mt-2">{forms?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>إدارة إعدادات لوحة التحكم</CardDescription>
              </CardHeader>
              <CardContent>
                <p>سيتم إضافة المزيد من الإعدادات قريباً.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
