import { useParams, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Edit2, Trash2, CheckCircle, Clock, XCircle, AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const bookingId = parseInt(id || "0");
  const [newStatus, setNewStatus] = useState<"pending" | "confirmed" | "cancelled" | "completed" | "">("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Queries
  const { data: booking, isLoading, refetch } = trpc.bookings.getById.useQuery(bookingId, {
    enabled: !!bookingId,
  });

  const { data: formResponses } = trpc.formResponses.getByBooking.useQuery(bookingId, {
    enabled: !!bookingId && !!booking,
  });

  // Mutations
  const updateStatusMutation = trpc.bookings.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الحجز بنجاح");
      setNewStatus("");
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteBookingMutation = trpc.bookings.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحجز بنجاح");
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleUpdateStatus = () => {
    if (newStatus && newStatus !== "") {
      updateStatusMutation.mutate({ id: bookingId, status: newStatus as any });
    }
  };

  const handleDelete = () => {
    if (window.confirm("هل أنت متأكد من أنك تريد حذف هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteBookingMutation.mutate(bookingId);
    }
  };

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
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusInfo.color}`}>
        <Icon className="w-4 h-4" />
        <span className="font-medium">{statusInfo.label}</span>
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

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">لم يتم العثور على الحجز</h2>
            <p className="text-gray-600 mb-4">الحجز الذي تبحث عنه غير موجود</p>
            <Link href="/dashboard">
              <Button>العودة إلى لوحة التحكم</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">تفاصيل الحجز #{booking.id}</h1>
              <p className="text-gray-600">تم الإنشاء: {new Date(booking.createdAt).toLocaleDateString("ar-SA")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  تحديث الحالة
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>تحديث حالة الحجز</DialogTitle>
                  <DialogDescription>اختر الحالة الجديدة للحجز</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة الجديدة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">قيد الانتظار</SelectItem>
                      <SelectItem value="confirmed">مؤكد</SelectItem>
                      <SelectItem value="cancelled">ملغى</SelectItem>
                      <SelectItem value="completed">مكتمل</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleUpdateStatus} disabled={!newStatus || updateStatusMutation.isPending}>
                    {updateStatusMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري التحديث...
                      </>
                    ) : (
                      "تحديث"
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteBookingMutation.isPending}>
              <Trash2 className="w-4 h-4 mr-2" />
              حذف
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>حالة الحجز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>{getStatusBadge(booking.status)}</div>
              <div className="text-sm text-gray-600">
                آخر تحديث: {new Date(booking.updatedAt).toLocaleDateString("ar-SA")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>معلومات الحجز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">رقم الحجز</label>
                <p className="text-lg font-semibold">{booking.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">الحملة</label>
                <p className="text-lg font-semibold">{booking.campaignId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">النموذج</label>
                <p className="text-lg font-semibold">{booking.formId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</label>
                <p className="text-lg font-semibold">{new Date(booking.createdAt).toLocaleDateString("ar-SA")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Responses */}
        {formResponses && formResponses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>إجابات النموذج</CardTitle>
              <CardDescription>بيانات المريض والإجابات المدخلة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formResponses.map((response: any) => (
                  <div key={response.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <label className="text-sm font-medium text-gray-600">{response.fieldName}</label>
                        <p className="text-lg mt-1">{response.value}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(response.createdAt).toLocaleDateString("ar-SA")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
