
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
  Calendar, CheckCircle, Clock, XCircle, BarChart3, FileText, Settings, Stethoscope, BookOpen,
  ArrowUpRight, ArrowDownRight, AlertCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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
      <div className="space-y-6 md:space-y-8 p-4 md:p-6" dir="rtl">
        {/* Header Section */}
        <div className="flex flex-col gap-4 pb-4 md:pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="text-sm md:text-base text-slate-600 mt-2">مرحباً {user?.name}، إدارة الحملات والحجوزات</p>
          </div>
          <Dialog open={showNewCampaignForm} onOpenChange={setShowNewCampaignForm}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg w-full md:w-auto">
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

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/doctors">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <Stethoscope className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">الأطباء</h3>
                <p className="text-sm text-slate-600 mt-1">عرض قائمة الأطباء</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/manage-doctors">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border-0 bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">إدارة الأطباء</h3>
                <p className="text-sm text-slate-600 mt-1">إضافة وتعديل الأطباء</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/manage-pages">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">إدارة الصفحات</h3>
                <p className="text-sm text-slate-600 mt-1">إنشاء صفحات ثابتة</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/bookings">
            <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] border-0 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900">الحجوزات</h3>
                <p className="text-sm text-slate-600 mt-1">عرض جميع الحجوزات</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-slate-50 to-slate-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                إجمالي الحجوزات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalBookings}</div>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" />
                +20.1% من الشهر الماضي
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                الحجوزات المؤكدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{confirmedBookings}</div>
              <p className="text-xs text-slate-500 mt-2">من إجمالي {totalBookings}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                قيد الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingBookings}</div>
              <p className="text-xs text-slate-500 mt-2">تحتاج إلى متابعة</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                الحجوزات المكتملة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{completedBookings}</div>
              <p className="text-xs text-slate-500 mt-2">تمت خدمتهم</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-red-50 to-red-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                الحجوزات الملغاة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{cancelledBookings}</div>
              <p className="text-xs text-slate-500 mt-2">تم الإلغاء</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>توزيع حالات الحجوزات</CardTitle>
              <CardDescription>نسبة الحجوزات حسب الحالة</CardDescription>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-slate-500">
                  لا توجد بيانات للعرض
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>الحجوزات حسب الحملات</CardTitle>
              <CardDescription>عدد الحجوزات لكل حملة</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="الحجوزات" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-80 text-slate-500">
                  لا توجد بيانات للعرض
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-100">
            <TabsTrigger value="campaigns" className="gap-2"><Calendar className="h-4 w-4" /> الحملات</TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2"><Users className="h-4 w-4" /> الحجوزات</TabsTrigger>
            <TabsTrigger value="reports" className="gap-2"><BarChart3 className="h-4 w-4" /> التقارير</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="h-4 w-4" /> الإعدادات</TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4 mt-6">
            {campaignsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <Card
                    key={campaign.id}
                    className={`cursor-pointer transition-all hover:shadow-lg border-0 ${
                      selectedCampaign === campaign.id
                        ? "bg-green-50 ring-2 ring-green-500 shadow-lg"
                        : "bg-slate-50"
                    }`}
                    onClick={() => setSelectedCampaign(campaign.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-slate-900">{campaign.name}</CardTitle>
                          <CardDescription className="mt-2 line-clamp-2">
                            {campaign.description || "بدون وصف"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">الحجوزات:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {bookings?.filter(b => b.campaignId === campaign.id).length || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-600">لا توجد حملات حالياً</p>
                <p className="text-sm text-slate-500 mt-1">قم بإنشاء حملة جديدة للبدء</p>
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4 mt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="ابحث عن المريض أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
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

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900">المريض</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900">الهاتف</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900">التاريخ</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900">الحالة</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-900">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-900 font-medium">{booking.patientName}</td>
                        <td className="px-4 py-3 text-slate-600">{booking.patientPhone}</td>
                        <td className="px-4 py-3 text-slate-600">{new Date(booking.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'مؤكدة' :
                             booking.status === 'pending' ? 'قيد الانتظار' :
                             booking.status === 'completed' ? 'مكتملة' :
                             'ملغاة'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">⋯</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'confirmed')}>
                                تأكيد
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'completed')}>
                                إكمال
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'cancelled')}>
                                إلغاء
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteBooking(booking.id)} className="text-red-600">
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-slate-300 mb-4" />
                <p className="text-slate-600">لا توجد حجوزات تطابق البحث</p>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>التقارير الشاملة</CardTitle>
                <CardDescription>ملخص الأداء والإحصائيات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">معدل التأكيد</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">معدل الإكمال</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>الإعدادات</CardTitle>
                <CardDescription>إدارة إعدادات لوحة التحكم</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">سيتم إضافة المزيد من الإعدادات قريباً</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
