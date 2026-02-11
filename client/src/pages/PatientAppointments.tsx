import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Calendar, Clock, MapPin, User, Phone, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PatientAppointments() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [filterStatus, setFilterStatus] = useState<"all" | "scheduled" | "completed" | "cancelled" | "no-show">("all");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const appointmentsQuery = trpc.patients.getAppointments.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    limit: 50,
  });

  const cancelAppointmentMutation = trpc.patients.cancelAppointment.useMutation();

  if (!isAuthenticated) {
    setLocation("/patient/auth");
    return null;
  }

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await cancelAppointmentMutation.mutateAsync(appointmentId);
      toast.success("تم إلغاء الموعد بنجاح");
      setCancellingId(null);
      setIsDialogOpen(false);
      appointmentsQuery.refetch();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error("حدث خطأ أثناء إلغاء الموعد");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "مجدول";
      case "completed":
        return "مكتمل";
      case "cancelled":
        return "ملغى";
      case "no-show":
        return "لم يحضر";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* رأس الصفحة */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">المواعيد الطبية</h1>
              <p className="text-gray-600 mt-1">إدارة مواعيدك مع الأطباء</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/patient/dashboard")}
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* التصفية */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>تصفية المواعيد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواعيد</SelectItem>
                  <SelectItem value="scheduled">المجدولة</SelectItem>
                  <SelectItem value="completed">المكتملة</SelectItem>
                  <SelectItem value="cancelled">الملغاة</SelectItem>
                  <SelectItem value="no-show">لم يحضر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* قائمة المواعيد */}
        {appointmentsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : appointmentsQuery.data && appointmentsQuery.data.length > 0 ? (
          <div className="grid gap-6">
            {appointmentsQuery.data.map((appointment) => (
              <Card key={appointment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* معلومات الموعد */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {appointment.reason || "موعد طبي"}
                          </h3>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>
                      </div>

                      {/* تفاصيل الموعد */}
                      <div className="space-y-3 text-gray-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span>
                            {new Date(appointment.appointmentDate).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span>
                            {new Date(appointment.appointmentDate).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        {appointment.duration && (
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <span>المدة: {appointment.duration} دقيقة</span>
                          </div>
                        )}
                      </div>

                      {/* الملاحظات */}
                      {appointment.notes && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>ملاحظات الطبيب:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* الأزرار */}
                    <div className="flex flex-col gap-3 md:w-48">
                      {appointment.status === "scheduled" && (
                        <Dialog open={isDialogOpen && cancellingId === appointment.id} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              onClick={() => setCancellingId(appointment.id)}
                            >
                              <X className="ml-2 h-4 w-4" />
                              إلغاء الموعد
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>إلغاء الموعد</DialogTitle>
                              <DialogDescription>
                                هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-4 mt-6">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsDialogOpen(false);
                                  setCancellingId(null);
                                }}
                              >
                                إلغاء
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={cancelAppointmentMutation.isPending}
                              >
                                {cancelAppointmentMutation.isPending ? (
                                  <>
                                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                                    جاري الإلغاء...
                                  </>
                                ) : (
                                  "تأكيد الإلغاء"
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {appointment.status === "completed" && (
                        <Button variant="outline" disabled>
                          <span className="text-green-600">✓ مكتمل</span>
                        </Button>
                      )}

                      {appointment.status === "cancelled" && (
                        <Button variant="outline" disabled>
                          <span className="text-red-600">✗ ملغى</span>
                        </Button>
                      )}

                      {appointment.status === "no-show" && (
                        <Button variant="outline" disabled>
                          <span className="text-gray-600">- لم يحضر</span>
                        </Button>
                      )}

                      <Button variant="outline" className="w-full">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد مواعيد</p>
              <p className="text-gray-500 mt-2">لم تقم بحجز أي مواعيد حتى الآن</p>
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => setLocation("/booking")}>
                احجز موعداً الآن
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
