import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, FileText, Download, Eye, AlertCircle, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PatientMedicalRecords() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [filterType, setFilterType] = useState<"all" | "diagnosis" | "prescription" | "lab_report" | "imaging" | "procedure" | "note">("all");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const medicalRecordsQuery = trpc.patients.getMedicalRecords.useQuery({
    recordType: filterType === "all" ? undefined : filterType,
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

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "diagnosis":
        return "bg-red-100 text-red-800";
      case "prescription":
        return "bg-blue-100 text-blue-800";
      case "lab_report":
        return "bg-green-100 text-green-800";
      case "imaging":
        return "bg-purple-100 text-purple-800";
      case "procedure":
        return "bg-orange-100 text-orange-800";
      case "note":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case "diagnosis":
        return "تشخيص";
      case "prescription":
        return "وصفة طبية";
      case "lab_report":
        return "تقرير مخبري";
      case "imaging":
        return "تصوير طبي";
      case "procedure":
        return "إجراء طبي";
      case "note":
        return "ملاحظة";
      default:
        return type;
    }
  };

  const handleDownload = (record: any) => {
    if (record.attachmentUrl) {
      window.open(record.attachmentUrl, "_blank");
      toast.success("جاري تحميل الملف...");
    } else {
      toast.error("لا توجد ملفات مرفقة");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* رأس الصفحة */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">السجل الطبي</h1>
              <p className="text-gray-600 mt-1">جميع التقارير والفحوصات الطبية</p>
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
            <CardTitle>تصفية السجلات الطبية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="اختر نوع السجل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع السجلات</SelectItem>
                  <SelectItem value="diagnosis">التشخيصات</SelectItem>
                  <SelectItem value="prescription">الوصفات الطبية</SelectItem>
                  <SelectItem value="lab_report">التقارير المخبرية</SelectItem>
                  <SelectItem value="imaging">التصوير الطبي</SelectItem>
                  <SelectItem value="procedure">الإجراءات الطبية</SelectItem>
                  <SelectItem value="note">الملاحظات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* قائمة السجلات */}
        {medicalRecordsQuery.isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : medicalRecordsQuery.data && medicalRecordsQuery.data.length > 0 ? (
          <div className="grid gap-6">
            {medicalRecordsQuery.data.map((record) => (
              <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row gap-6 p-6">
                    {/* معلومات السجل */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{record.title}</h3>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getRecordTypeColor(record.recordType)}`}>
                            {getRecordTypeLabel(record.recordType)}
                          </span>
                        </div>
                      </div>

                      {/* تفاصيل السجل */}
                      <div className="space-y-3 text-gray-600">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          <span>
                            {new Date(record.createdAt).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* الوصف */}
                      {record.description && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>الوصف:</strong> {record.description}
                          </p>
                        </div>
                      )}

                      {/* النتائج */}
                      {record.findings && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-900">
                            <strong>النتائج:</strong> {record.findings}
                          </p>
                        </div>
                      )}

                      {/* التوصيات */}
                      {record.recommendations && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-900">
                            <strong>التوصيات:</strong> {record.recommendations}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* الأزرار */}
                    <div className="flex flex-col gap-3 md:w-48">
                      <Dialog open={isDialogOpen && selectedRecord?.id === record.id} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedRecord(record)}
                          >
                            <Eye className="ml-2 h-4 w-4" />
                            عرض التفاصيل
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{record.title}</DialogTitle>
                            <DialogDescription>
                              {new Date(record.createdAt).toLocaleDateString("ar-SA")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-6">
                            <div>
                              <h4 className="font-semibold mb-2">النوع</h4>
                              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRecordTypeColor(record.recordType)}`}>
                                {getRecordTypeLabel(record.recordType)}
                              </span>
                            </div>

                            {record.description && (
                              <div>
                                <h4 className="font-semibold mb-2">الوصف</h4>
                                <p className="text-gray-700">{record.description}</p>
                              </div>
                            )}

                            {record.findings && (
                              <div>
                                <h4 className="font-semibold mb-2">النتائج</h4>
                                <p className="text-gray-700">{record.findings}</p>
                              </div>
                            )}

                            {record.recommendations && (
                              <div>
                                <h4 className="font-semibold mb-2">التوصيات</h4>
                                <p className="text-gray-700">{record.recommendations}</p>
                              </div>
                            )}

                            {record.attachmentUrl && (
                              <div>
                                <h4 className="font-semibold mb-2">المرفقات</h4>
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleDownload(record)}
                                >
                                  <Download className="ml-2 h-4 w-4" />
                                  تحميل الملف
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {record.attachmentUrl && (
                        <Button
                          variant="outline"
                          onClick={() => handleDownload(record)}
                        >
                          <Download className="ml-2 h-4 w-4" />
                          تحميل
                        </Button>
                      )}

                      <Button variant="outline" disabled>
                        <FileText className="ml-2 h-4 w-4" />
                        طباعة
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
              <p className="text-gray-600 text-lg">لا توجد سجلات طبية</p>
              <p className="text-gray-500 mt-2">لم يتم تحميل أي سجلات طبية حتى الآن</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
