import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, Download, Eye, AlertCircle, Calendar, DollarSign, Printer } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PatientInvoices() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue" | "cancelled">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const invoicesQuery = trpc.patients.getInvoices.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    limit: 50,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/patient/auth");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "مدفوعة";
      case "pending":
        return "معلقة";
      case "overdue":
        return "متأخرة";
      case "cancelled":
        return "ملغاة";
      default:
        return status;
    }
  };

  const handleDownload = (invoice: any) => {
    toast.success("جاري تحميل الفاتورة...");
  };

  const handlePrint = (invoice: any) => {
    window.print();
  };

  // حساب الإجمالي
  const totalAmount = invoicesQuery.data?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const paidAmount = invoicesQuery.data?.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const pendingAmount = invoicesQuery.data?.filter((inv) => inv.status === "pending" || inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* رأس الصفحة */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الفواتير</h1>
              <p className="text-gray-600 mt-1">إدارة الفواتير والدفعات</p>
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
        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">الإجمالي</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(totalAmount / 100).toFixed(2)} ريال
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">المدفوع</p>
                <p className="text-2xl font-bold text-green-600">
                  {(paidAmount / 100).toFixed(2)} ريال
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">المعلق</p>
                <p className="text-2xl font-bold text-red-600">
                  {(pendingAmount / 100).toFixed(2)} ريال
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التصفية */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>تصفية الفواتير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفواتير</SelectItem>
                  <SelectItem value="paid">المدفوعة</SelectItem>
                  <SelectItem value="pending">المعلقة</SelectItem>
                  <SelectItem value="overdue">المتأخرة</SelectItem>
                  <SelectItem value="cancelled">الملغاة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* قائمة الفواتير */}
        {invoicesQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : invoicesQuery.data && invoicesQuery.data.length > 0 ? (
          <div className="grid gap-6">
            {invoicesQuery.data.map((invoice: any) => (
              <Card key={invoice.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* معلومات الفاتورة */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h3>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusLabel(invoice.status)}
                          </span>
                        </div>
                      </div>

                      {/* تفاصيل الفاتورة */}
                      <div className="space-y-3 text-gray-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span>
                            {new Date(invoice.createdAt).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-lg font-bold text-gray-900">
                            {(invoice.amount / 100).toFixed(2)} {invoice.currency}
                          </span>
                        </div>
                      </div>

                      {/* الوصف */}
                      {invoice.description && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>الوصف:</strong> {invoice.description}
                          </p>
                        </div>
                      )}

                      {/* تاريخ الاستحقاق */}
                      {invoice.dueDate && (
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-sm text-orange-900">
                            <strong>تاريخ الاستحقاق:</strong>{" "}
                            {new Date(invoice.dueDate).toLocaleDateString("ar-SA")}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* الأزرار */}
                    <div className="flex flex-col gap-3 md:w-48">
                      <Dialog open={isDialogOpen && selectedInvoice?.id === invoice.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedInvoice(invoice)}
                          >
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{invoice.invoiceNumber}</DialogTitle>
                            <DialogDescription>
                              {new Date(invoice.createdAt).toLocaleDateString("ar-SA")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">الحالة</h4>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                                  {getStatusLabel(invoice.status)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">المبلغ</h4>
                                <p className="text-lg font-bold text-gray-900">
                                  {(invoice.amount / 100).toFixed(2)} {invoice.currency}
                                </p>
                              </div>
                            </div>

                            {invoice.description && (
                              <div>
                                <h4 className="font-semibold mb-2">الوصف</h4>
                                <p className="text-gray-700">{invoice.description}</p>
                              </div>
                            )}

                            {invoice.dueDate && (
                              <div>
                                <h4 className="font-semibold mb-2">تاريخ الاستحقاق</h4>
                                <p className="text-gray-700">
                                  {new Date(invoice.dueDate).toLocaleDateString("ar-SA")}
                                </p>
                              </div>
                            )}

                            {invoice.paidDate && (
                              <div>
                                <h4 className="font-semibold mb-2">تاريخ الدفع</h4>
                                <p className="text-gray-700">
                                  {new Date(invoice.paidDate).toLocaleDateString("ar-SA")}
                                </p>
                              </div>
                            )}

                            {invoice.status === "pending" || invoice.status === "overdue" ? (
                              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <DollarSign className="ml-2 h-4 w-4" />
                                دفع الآن
                              </Button>
                            ) : null}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        onClick={() => handleDownload(invoice)}
                      >
                        <Download className="ml-2 h-4 w-4" />
                        تحميل
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => handlePrint(invoice)}
                      >
                        <Printer className="ml-2 h-4 w-4" />
                        طباعة
                      </Button>

                      {(invoice.status === "pending" || invoice.status === "overdue") && (
                        <Button className="bg-green-600 hover:bg-green-700">
                          <DollarSign className="ml-2 h-4 w-4" />
                          دفع
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">لا توجد فواتير</p>
              <p className="text-gray-500 mt-2">لم يتم إنشاء أي فواتير حتى الآن</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
