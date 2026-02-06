import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Loader2, Eye, Edit2, Trash2, Plus, Search, Filter, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function BookingsManagementPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formIdFilter, setFormIdFilter] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Queries
  const { data: bookings, isLoading, refetch } = trpc.bookings.list.useQuery(
    {
      formId: formIdFilter ? parseInt(formIdFilter) : undefined,
    },
    {
      enabled: !!user,
    }
  );

  const { data: forms } = trpc.forms.listByCampaign.useQuery(1, {
    enabled: !!user,
  });

  // Mutations
  const deleteBookingMutation = trpc.bookings.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحجز بنجاح");
      setShowDeleteDialog(false);
      setSelectedBookingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleDelete = (id: number) => {
    setSelectedBookingId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedBookingId) {
      deleteBookingMutation.mutate(selectedBookingId);
    }
  };

  const filteredBookings = bookings?.filter((booking: any) => {
    const matchesSearch =
      booking.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.patientPhone?.includes(searchTerm) ||
      booking.patientEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "قيد الانتظار" },
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "مؤكد" },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "ملغى" },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "مكتمل" },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    const Icon = statusInfo.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusInfo.color}`}>
        <Icon className="w-4 h-4" />
        <span>{statusInfo.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">إدارة الحجوزات</h1>
            <p className="text-gray-600">إدارة وتتبع جميع الحجوزات</p>
          </div>
          <Link href="/dashboard/bookings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              حجز جديد
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">البحث والتصفية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">البحث</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن الاسم أو الهاتف أو البريد..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">الحالة</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="cancelled">ملغى</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">النموذج</label>
                <Select value={formIdFilter} onValueChange={setFormIdFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع النماذج" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع النماذج</SelectItem>
                    {forms?.map((form: any) => (
                      <SelectItem key={form.id} value={form.id.toString()}>
                        {form.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الحجوزات</CardTitle>
                <CardDescription>عدد الحجوزات: {filteredBookings.length}</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                تصدير
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 font-semibold">رقم الحجز</th>
                      <th className="text-right py-3 px-4 font-semibold">اسم المريض</th>
                      <th className="text-right py-3 px-4 font-semibold">الهاتف</th>
                      <th className="text-right py-3 px-4 font-semibold">الحالة</th>
                      <th className="text-right py-3 px-4 font-semibold">التاريخ</th>
                      <th className="text-center py-3 px-4 font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking: any) => (
                      <tr key={booking.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">#{booking.id}</td>
                        <td className="py-3 px-4 font-medium">{booking.patientName}</td>
                        <td className="py-3 px-4">{booking.patientPhone}</td>
                        <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/dashboard/bookings/${booking.id}`}>
                              <Button variant="ghost" size="sm" title="عرض التفاصيل">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="حذف"
                              onClick={() => handleDelete(booking.id)}
                              disabled={deleteBookingMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>لا توجد حجوزات</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من أنك تريد حذف هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteBookingMutation.isPending}
              >
                {deleteBookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  "حذف"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
