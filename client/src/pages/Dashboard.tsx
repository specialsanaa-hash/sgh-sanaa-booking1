import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, Plus, Edit2, Trash2, Eye, Download, TrendingUp, Users, 
  Calendar, CheckCircle, Clock, XCircle, BarChart3, FileText
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Queries
  const { data: campaigns, isLoading: campaignsLoading, refetch: refetchCampaigns } = trpc.campaigns.list.useQuery();
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.bookings.list.useQuery({
    campaignId: selectedCampaign || undefined,
  });
  const { data: forms, isLoading: formsLoading, refetch: refetchForms } = trpc.forms.listByCampaign.useQuery(selectedCampaign || 0, {
    enabled: !!selectedCampaign,
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

  const createCampaignMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحملة بنجاح");
      setNewCampaignName("");
      setNewCampaignDesc("");
      setShowNewCampaignForm(false);
      refetchCampaigns();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  // Handlers
  const handleCreateCampaign = async () => {
    if (!newCampaignName.trim()) {
      toast.error("يرجى إدخال اسم الحملة");
      return;
    }
    createCampaignMutation.mutate({
      name: newCampaignName,
      description: newCampaignDesc,
    });
  };

  const handleDeleteBooking = (bookingId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الحجز؟")) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

  const handleExportBookings = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("لا توجد حجوزات للتصدير");
      return;
    }
    toast.success("جاري تصدير البيانات...");
  };

  // Statistics
  const totalBookings = bookings?.length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === "confirmed").length || 0;
  const pendingBookings = bookings?.filter(b => b.status === "pending").length || 0;
  const completedBookings = bookings?.filter(b => b.status === "completed").length || 0;
  const cancelledBookings = bookings?.filter(b => b.status === "cancelled").length || 0;

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-lg text-slate-600">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="text-slate-600 mt-2">إدارة الحملات والحجوزات والنماذج</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">إجمالي الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-slate-900">{totalBookings}</span>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">مؤكدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-green-600">{confirmedBookings}</span>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">قيد الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-yellow-600">{pendingBookings}</span>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">مكتملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-purple-600">{completedBookings}</span>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">ملغاة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-red-600">{cancelledBookings}</span>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="campaigns" className="gap-2">
              <Calendar className="h-4 w-4" />
              الحملات
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <FileText className="h-4 w-4" />
              الحجوزات
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              التقارير
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">إدارة الحملات</h2>
              <Dialog open={showNewCampaignForm} onOpenChange={setShowNewCampaignForm}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4" />
                    حملة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إنشاء حملة جديدة</DialogTitle>
                    <DialogDescription>أضف حملة إعلانية جديدة للمستشفى</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaign-name">اسم الحملة</Label>
                      <Input
                        id="campaign-name"
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        placeholder="مثال: المخيم الخيري الأول"
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaign-desc">الوصف</Label>
                      <Input
                        id="campaign-desc"
                        value={newCampaignDesc}
                        onChange={(e) => setNewCampaignDesc(e.target.value)}
                        placeholder="وصف الحملة"
                      />
                    </div>
                    <Button
                      onClick={handleCreateCampaign}
                      disabled={createCampaignMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {createCampaignMutation.isPending ? "جاري الإنشاء..." : "إنشاء الحملة"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

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
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="البحث عن حجز..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
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
              <Button onClick={handleExportBookings} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4" />
                تصدير
              </Button>
            </div>

            {bookingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : bookings && bookings.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">اسم المريض</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">الهاتف</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">الحالة</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">التاريخ</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b hover:bg-slate-50">
                            <td className="px-6 py-3 text-sm text-slate-900">{booking.patientName}</td>
                            <td className="px-6 py-3 text-sm text-slate-600">{booking.patientPhone}</td>
                            <td className="px-6 py-3 text-sm">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                                booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                booking.status === "completed" ? "bg-blue-100 text-blue-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {booking.status === "confirmed" ? "مؤكدة" :
                                 booking.status === "pending" ? "قيد الانتظار" :
                                 booking.status === "completed" ? "مكتملة" :
                                 "ملغاة"}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-sm text-slate-600">
                              {new Date(booking.createdAt).toLocaleDateString("ar-SA")}
                            </td>
                            <td className="px-6 py-3 text-sm">
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => handleDeleteBooking(booking.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-slate-600 text-lg">لا توجد حجوزات</p>
                  <p className="text-slate-500 text-sm mt-2">لم يتم العثور على حجوزات مطابقة</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع الحالات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">مؤكدة</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-green-600">{confirmedBookings}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">قيد الانتظار</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{ width: `${totalBookings > 0 ? (pendingBookings / totalBookings) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-yellow-600">{pendingBookings}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">مكتملة</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-purple-600">{completedBookings}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">ملغاة</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{ width: `${totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="font-bold text-red-600">{cancelledBookings}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الإحصائيات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-600 text-sm">نسبة الإتمام</p>
                      <p className="text-2xl font-bold text-purple-900 mt-2">
                        {totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">معدل التأكيد</p>
                      <p className="text-2xl font-bold text-green-900 mt-2">
                        {totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100) : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">الحجوزات المعلقة</p>
                      <p className="text-2xl font-bold text-yellow-900 mt-2">
                        {pendingBookings}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
