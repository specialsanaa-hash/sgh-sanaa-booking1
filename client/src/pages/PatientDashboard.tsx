import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Calendar, FileText, MessageSquare, DollarSign, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function PatientDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // جلب بيانات المريض
  const profileQuery = trpc.patients.getProfile.useQuery();
  const appointmentsQuery = trpc.patients.getAppointments.useQuery({ limit: 5 });
  const medicalRecordsQuery = trpc.patients.getMedicalRecords.useQuery({ limit: 5 });
  const messagesQuery = trpc.patients.getMessages.useQuery({ limit: 5 });
  const invoicesQuery = trpc.patients.getInvoices.useQuery({ limit: 5 });
  const prescriptionsQuery = trpc.patients.getPrescriptions.useQuery({ limit: 5 });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/patient/auth");
    }
  }, [isAuthenticated, setLocation]);

  useEffect(() => {
    if (!profileQuery.isLoading && !profileQuery.data) {
      setLocation("/patient/auth");
    }
  }, [profileQuery.isLoading, profileQuery.data, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profileQuery.data) {
    return null;
  }

  const patient = profileQuery.data;

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* رأس الصفحة */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">بوابة المريض</h1>
              <p className="text-gray-600 mt-1">أهلاً {user?.name || "المريض"}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* بطاقات الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">المواعيد المقبلة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointmentsQuery.data?.filter((a) => a.status === "scheduled").length || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">السجلات الطبية</p>
                <p className="text-2xl font-bold text-gray-900">
                  {medicalRecordsQuery.data?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">الرسائل</p>
                <p className="text-2xl font-bold text-gray-900">
                  {messagesQuery.data?.filter((m) => m.status === 'delivered').length || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">الفواتير المعلقة</p>
                <p className="text-2xl font-bold text-gray-900">
                  {invoicesQuery.data?.filter((i) => i.status === "pending").length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="appointments">المواعيد</TabsTrigger>
            <TabsTrigger value="medical">السجل الطبي</TabsTrigger>
            <TabsTrigger value="messages">الرسائل</TabsTrigger>
            <TabsTrigger value="invoices">الفواتير</TabsTrigger>
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات المريض</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm">رقم الهاتف</p>
                    <p className="text-lg font-semibold">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">فصيلة الدم</p>
                    <p className="text-lg font-semibold">{patient.bloodType || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">المدينة</p>
                    <p className="text-lg font-semibold">{patient.city || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">جهة الاتصال الطارئة</p>
                    <p className="text-lg font-semibold">{patient.emergencyContact || "غير محدد"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المواعيد القادمة</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsQuery.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : appointmentsQuery.data && appointmentsQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {appointmentsQuery.data.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{appointment.reason || "موعد طبي"}</p>
                            <p className="text-gray-600 text-sm">
                              {new Date(appointment.appointmentDate).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {appointment.status === "scheduled" ? "مجدول" : appointment.status === "completed" ? "مكتمل" : "ملغى"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">لا توجد مواعيد قادمة</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* المواعيد */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>جميع المواعيد</CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsQuery.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : appointmentsQuery.data && appointmentsQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {appointmentsQuery.data.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{appointment.reason || "موعد طبي"}</p>
                            <p className="text-gray-600 text-sm">
                              {new Date(appointment.appointmentDate).toLocaleDateString("ar-SA", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {appointment.notes && (
                              <p className="text-gray-600 text-sm mt-2">{appointment.notes}</p>
                            )}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                            appointment.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {appointment.status === "scheduled" ? "مجدول" : appointment.status === "completed" ? "مكتمل" : "ملغى"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">لا توجد مواعيد</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* السجل الطبي */}
          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>السجل الطبي</CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecordsQuery.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : medicalRecordsQuery.data && medicalRecordsQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecordsQuery.data.map((record) => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{record.title}</p>
                            <p className="text-gray-600 text-sm">
                              {new Date(record.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                            {record.description && (
                              <p className="text-gray-600 text-sm mt-2">{record.description}</p>
                            )}
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 whitespace-nowrap ml-4">
                            {record.recordType === "diagnosis"
                              ? "تشخيص"
                              : record.recordType === "prescription"
                              ? "وصفة"
                              : record.recordType === "lab_report"
                              ? "تقرير مخبري"
                              : record.recordType === "imaging"
                              ? "تصوير"
                              : record.recordType === "procedure"
                              ? "إجراء"
                              : "ملاحظة"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">لا توجد سجلات طبية</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* الرسائل */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>الرسائل</CardTitle>
              </CardHeader>
              <CardContent>
                {messagesQuery.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : messagesQuery.data && messagesQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {messagesQuery.data.map((message) => (
                      <div
                        key={message.id}
                        className={`border rounded-lg p-4 ${message.status === 'delivered' ? "bg-blue-50" : ""}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{message.messageType}</p>
                            <p className="text-gray-600 text-sm">
                              {new Date(message.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">{message.messageText.substring(0, 100)}...</p>
                          </div>
                          {message.status === 'delivered' && (
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 whitespace-nowrap ml-4">
                              جديد
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">لا توجد رسائل</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* الفواتير */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>الفواتير</CardTitle>
              </CardHeader>
              <CardContent>
                {invoicesQuery.isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {invoicesQuery.data.map((invoice) => (
                      <div key={invoice.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold">{invoice.invoiceNumber}</p>
                            <p className="text-gray-600 text-sm">
                              {new Date(invoice.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                            <p className="text-lg font-bold text-gray-900 mt-2">
                              {(invoice.amount / 100).toFixed(2)} {invoice.currency}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4 ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : invoice.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {invoice.status === "paid"
                              ? "مدفوعة"
                              : invoice.status === "pending"
                              ? "معلقة"
                              : invoice.status === "overdue"
                              ? "متأخرة"
                              : "ملغاة"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">لا توجد فواتير</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* الملف الشخصي */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>الملف الشخصي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 text-sm">رقم الهاتف</p>
                    <p className="text-lg font-semibold">{patient.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">رقم الهوية الوطنية</p>
                    <p className="text-lg font-semibold">{patient.nationalId || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">تاريخ الميلاد</p>
                    <p className="text-lg font-semibold">
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString("ar-SA")
                        : "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">الجنس</p>
                    <p className="text-lg font-semibold">
                      {patient.gender === "male"
                        ? "ذكر"
                        : patient.gender === "female"
                        ? "أنثى"
                        : "غير محدد"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">فصيلة الدم</p>
                    <p className="text-lg font-semibold">{patient.bloodType || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">المدينة</p>
                    <p className="text-lg font-semibold">{patient.city || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">العنوان</p>
                    <p className="text-lg font-semibold">{patient.address || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">جهة الاتصال الطارئة</p>
                    <p className="text-lg font-semibold">{patient.emergencyContact || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">رقم جهة الاتصال الطارئة</p>
                    <p className="text-lg font-semibold">{patient.emergencyPhone || "غير محدد"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">شركة التأمين</p>
                    <p className="text-lg font-semibold">{patient.insuranceProvider || "غير محدد"}</p>
                  </div>
                </div>

                <Button className="mt-6 bg-blue-600 hover:bg-blue-700">
                  <User className="ml-2 h-4 w-4" />
                  تحديث البيانات الشخصية
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
