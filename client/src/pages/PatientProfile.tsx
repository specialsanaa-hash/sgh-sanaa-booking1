import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PatientProfile() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const profileQuery = trpc.patients.getProfile.useQuery();
  const updateProfileMutation = trpc.patients.updateProfile.useMutation();

  const [formData, setFormData] = useState({
    phone: profileQuery.data?.phone || "",
    nationalId: profileQuery.data?.nationalId || "",
    dateOfBirth: profileQuery.data?.dateOfBirth ? new Date(profileQuery.data.dateOfBirth).toISOString().split("T")[0] : "",
    gender: profileQuery.data?.gender || "",
    bloodType: profileQuery.data?.bloodType || "",
    address: profileQuery.data?.address || "",
    city: profileQuery.data?.city || "",
    emergencyContact: profileQuery.data?.emergencyContact || "",
    emergencyPhone: profileQuery.data?.emergencyPhone || "",
    insuranceProvider: profileQuery.data?.insuranceProvider || "",
    insuranceNumber: profileQuery.data?.insuranceNumber || "",
    allergies: profileQuery.data?.allergies || "",
  });

  if (!isAuthenticated) {
    setLocation("/patient/auth");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateProfileMutation.mutateAsync({
        phone: formData.phone,
        nationalId: formData.nationalId || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: (formData.gender as "male" | "female" | "other") || undefined,
        bloodType: formData.bloodType || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        insuranceNumber: formData.insuranceNumber || undefined,
        allergies: formData.allergies || undefined,
      });

      toast.success("تم تحديث البيانات الشخصية بنجاح!");
      setIsEditing(false);
      profileQuery.refetch();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("حدث خطأ أثناء تحديث البيانات");
    } finally {
      setIsSaving(false);
    }
  };

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* رأس الصفحة */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
              <p className="text-gray-600 mt-1">تحديث بيانات المريض الشخصية</p>
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* البيانات الأساسية */}
          <Card>
            <CardHeader>
              <CardTitle>البيانات الأساسية</CardTitle>
              <CardDescription>المعلومات الشخصية الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="967XXXXXXXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="nationalId">رقم الهوية الوطنية</Label>
                  <Input
                    id="nationalId"
                    name="nationalId"
                    placeholder="رقم الهوية"
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">تاريخ الميلاد</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">الجنس</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)} disabled={!isEditing}>
                    <SelectTrigger disabled={!isEditing}>
                      <SelectValue placeholder="اختر الجنس" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">ذكر</SelectItem>
                      <SelectItem value="female">أنثى</SelectItem>
                      <SelectItem value="other">آخر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bloodType">فصيلة الدم</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => handleSelectChange("bloodType", value)} disabled={!isEditing}>
                    <SelectTrigger disabled={!isEditing}>
                      <SelectValue placeholder="اختر فصيلة الدم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بيانات الاتصال والعنوان */}
          <Card>
            <CardHeader>
              <CardTitle>بيانات الاتصال والعنوان</CardTitle>
              <CardDescription>معلومات الاتصال والعنوان الحالي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="العنوان الكامل"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-right"
                />
              </div>

              <div>
                <Label htmlFor="city">المدينة</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="اسم المدينة"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="text-right"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">جهة الاتصال الطارئة</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    placeholder="اسم الشخص"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone">رقم جهة الاتصال الطارئة</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="tel"
                    placeholder="رقم الهاتف"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="text-right"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بيانات التأمين */}
          <Card>
            <CardHeader>
              <CardTitle>بيانات التأمين الصحي</CardTitle>
              <CardDescription>معلومات التأمين الصحي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceProvider">شركة التأمين</Label>
                  <Input
                    id="insuranceProvider"
                    name="insuranceProvider"
                    placeholder="اسم شركة التأمين"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="insuranceNumber">رقم الوثيقة</Label>
                  <Input
                    id="insuranceNumber"
                    name="insuranceNumber"
                    placeholder="رقم الوثيقة"
                    value={formData.insuranceNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="text-right"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* السجل الطبي */}
          <Card>
            <CardHeader>
              <CardTitle>السجل الطبي</CardTitle>
              <CardDescription>معلومات طبية مهمة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">


              <div>
                <Label htmlFor="allergies">الحساسيات والأدوية</Label>
                <Textarea
                  id="allergies"
                  name="allergies"
                  placeholder="الحساسيات من الأدوية أو المواد الأخرى..."
                  value={formData.allergies}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="min-h-24 text-right"
                />
              </div>
            </CardContent>
          </Card>

          {/* الأزرار */}
          <div className="flex gap-4 justify-end">
            {!isEditing ? (
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsEditing(true)}
              >
                تعديل البيانات
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="ml-2 h-4 w-4" />
                      حفظ التغييرات
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
