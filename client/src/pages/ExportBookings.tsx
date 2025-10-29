import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function ExportBookings() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: campaigns } = trpc.campaigns.list.useQuery();
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.list.useQuery({
    campaignId: selectedCampaign ? parseInt(selectedCampaign) : undefined,
  });

  // Filter bookings based on selected criteria
  const filteredBookings = bookings?.filter((booking) => {
    if (selectedStatus && booking.status !== selectedStatus) return false;
    
    const bookingDate = new Date(booking.createdAt);
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      if (bookingDate < fromDate) return false;
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      if (bookingDate > toDate) return false;
    }
    
    return true;
  }) || [];

  const handleExportToExcel = async () => {
    if (filteredBookings.length === 0) {
      toast.error("لا توجد حجوزات لتصديرها");
      return;
    }

    setIsExporting(true);

    try {
      // Prepare CSV content
      const headers = ["اسم المريض", "الهاتف", "البريد الإلكتروني", "الحالة", "التاريخ"];
      const rows = filteredBookings.map((booking) => [
        booking.patientName,
        booking.patientPhone,
        booking.patientEmail || "-",
        getStatusArabic(booking.status),
        new Date(booking.createdAt).toLocaleDateString("ar-SA"),
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Create blob and download
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `bookings_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("تم تصدير الحجوزات بنجاح");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusArabic = (status: string) => {
    switch (status) {
      case "confirmed":
        return "مؤكد";
      case "pending":
        return "قيد الانتظار";
      case "cancelled":
        return "ملغى";
      case "completed":
        return "مكتمل";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">تصدير الحجوزات</h1>
          <p className="text-slate-600 mt-1">قم بتصدير الحجوزات إلى ملف Excel</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>خيارات التصفية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="campaign-filter">الحملة</Label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الحملات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحملات</SelectItem>
                    {campaigns?.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id.toString()}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter">الحالة</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                <Label htmlFor="date-from">من التاريخ</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date-to">إلى التاريخ</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>معاينة البيانات</CardTitle>
            <CardDescription>
              {bookingsLoading ? "جاري التحميل..." : `${filteredBookings.length} حجز`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-right py-3 px-4">اسم المريض</th>
                      <th className="text-right py-3 px-4">الهاتف</th>
                      <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.slice(0, 10).map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">{booking.patientName}</td>
                        <td className="py-3 px-4">{booking.patientPhone}</td>
                        <td className="py-3 px-4">{booking.patientEmail || "-"}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {getStatusArabic(booking.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(booking.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBookings.length > 10 && (
                  <p className="text-sm text-slate-600 mt-4">
                    ... و {filteredBookings.length - 10} حجز آخر
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">لا توجد حجوزات تطابق معايير البحث</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="flex gap-4">
          <Button
            onClick={handleExportToExcel}
            disabled={isExporting || filteredBookings.length === 0}
            className="gap-2 bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "جاري التصدير..." : "تصدير إلى Excel"}
          </Button>
          <Button variant="outline" size="lg">
            طباعة
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
