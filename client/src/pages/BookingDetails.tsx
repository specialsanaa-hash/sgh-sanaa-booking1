import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Mail, Phone, Calendar, User, Hash, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { useParams, Link } from "wouter";
import { toast } from "sonner";

// Helper function to get status badge style
const getStatusBadge = (status: string) => {
  let colorClass = "";
  let text = "";
  switch (status) {
    case "confirmed":
      colorClass = "bg-green-100 text-green-800";
      text = "✓ مؤكد";
      break;
    case "pending":
      colorClass = "bg-yellow-100 text-yellow-800";
      text = "⏱ قيد الانتظار";
      break;
    case "cancelled":
      colorClass = "bg-red-100 text-red-800";
      text = "✕ ملغى";
      break;
    case "completed":
      colorClass = "bg-purple-100 text-purple-800";
      text = "✓ مكتمل";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
      text = "غير معروف";
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${colorClass}`}>
      {text}
    </span>
  );
};

export default function BookingDetails() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const bookingId = parseInt(params.id as string);

  // Queries
  const { data: booking, isLoading: bookingLoading } = trpc.bookings.getById.useQuery(bookingId, {
    enabled: !isNaN(bookingId),
  });
  
  if (booking === undefined && !bookingLoading) {
    toast.error("حدث خطأ أثناء جلب تفاصيل الحجز");
  }

  const { data: responses, isLoading: responsesLoading } = trpc.formResponses.getByBooking.useQuery(bookingId, {
    enabled: !isNaN(bookingId),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">غير مصرح</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">ليس لديك صلاحية للوصول إلى لوحة التحكم. يرجى التواصل مع المسؤول.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingLoading || responsesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold text-red-600">خطأ 404</h1>
          <p className="text-slate-600 mt-2">لم يتم العثور على الحجز المطلوب.</p>
          <Link href="/dashboard">
            <Button variant="link" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة إلى لوحة التحكم
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">تفاصيل الحجز #{booking.id}</h1>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              العودة
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Info Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">بيانات المريض الأساسية</CardTitle>
              <CardDescription>معلومات الاتصال وحالة الحجز.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    اسم المريض
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{booking.patientName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    رقم الحجز
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{booking.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    رقم الهاتف
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{booking.patientPhone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    البريد الإلكتروني
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{booking.patientEmail || "غير متوفر"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    تاريخ الحجز
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(booking.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    الحالة
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{getStatusBadge(booking.status)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Responses Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl">إجابات النموذج المخصص</CardTitle>
              <CardDescription>البيانات الإضافية التي تم إدخالها.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {responses && responses.length > 0 ? (
                responses.map((response) => (
                  <div key={response.id} className="border-b pb-3">
                    <p className="text-sm font-medium text-slate-500">{response.fieldId}</p>
                    <p className="text-lg font-semibold text-slate-900">{response.value}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-600">لا توجد إجابات إضافية لهذا الحجز.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
