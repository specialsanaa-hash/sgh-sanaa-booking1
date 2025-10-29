import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDesc, setNewCampaignDesc] = useState("");

  // Queries
  const { data: campaigns, isLoading: campaignsLoading } = trpc.campaigns.list.useQuery();
  const { data: bookings, isLoading: bookingsLoading } = trpc.bookings.list.useQuery({
    campaignId: selectedCampaign || undefined,
  });

  // Mutations
  const createCampaignMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحملة بنجاح");
      setNewCampaignName("");
      setNewCampaignDesc("");
      setShowNewCampaignForm(false);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

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

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>غير مصرح</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">ليس لديك صلاحية للوصول إلى لوحة التحكم.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
            <p className="text-slate-600 mt-1">مرحباً {user?.name}</p>
          </div>
          <Button onClick={() => setShowNewCampaignForm(!showNewCampaignForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            حملة جديدة
          </Button>
        </div>

        {/* New Campaign Form */}
        {showNewCampaignForm && (
          <Card>
            <CardHeader>
              <CardTitle>إنشاء حملة جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="campaign-name">اسم الحملة</Label>
                  <Input
                    id="campaign-name"
                    value={newCampaignName}
                    onChange={(e) => setNewCampaignName(e.target.value)}
                    placeholder="مثال: حملة الصيف 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-desc">الوصف (اختياري)</Label>
                  <Input
                    id="campaign-desc"
                    value={newCampaignDesc}
                    onChange={(e) => setNewCampaignDesc(e.target.value)}
                    placeholder="وصف الحملة"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={createCampaignMutation.isPending}
                    className="flex-1"
                  >
                    {createCampaignMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإنشاء...
                      </>
                    ) : (
                      "إنشاء"
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
            </CardContent>
          </Card>
        )}

        {/* Campaigns Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCampaign(null)}>
            <CardHeader>
              <CardTitle className="text-lg">جميع الحملات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{campaigns?.length || 0}</p>
            </CardContent>
          </Card>
          {campaigns?.slice(0, 3).map((campaign) => (
            <Card
              key={campaign.id}
              className={`cursor-pointer transition-all ${
                selectedCampaign === campaign.id
                  ? "border-green-500 bg-green-50"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedCampaign(campaign.id)}
            >
              <CardHeader>
                <CardTitle className="text-lg truncate">{campaign.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  {campaign.description?.substring(0, 50)}...
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings Section */}
        <Card>
          <CardHeader>
            <CardTitle>الحجوزات</CardTitle>
            <CardDescription>
              {selectedCampaign
                ? `الحجوزات للحملة المختارة`
                : "جميع الحجوزات"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-right py-3 px-4">اسم المريض</th>
                      <th className="text-right py-3 px-4">الهاتف</th>
                      <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
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
                            {booking.status === "confirmed" && "مؤكد"}
                            {booking.status === "pending" && "قيد الانتظار"}
                            {booking.status === "cancelled" && "ملغى"}
                            {booking.status === "completed" && "مكتمل"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(booking.createdAt).toLocaleDateString("ar-SA")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Link href={`/booking-details/${booking.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">لا توجد حجوزات حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
