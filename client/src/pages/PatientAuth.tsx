import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PatientAuth() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [formData, setFormData] = useState({
    phone: "",
    nationalId: "",
    dateOfBirth: "",
    gender: "",
    bloodType: "",
    address: "",
    city: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const getProfileMutation = trpc.patients.getProfile.useQuery();
  const createProfileMutation = trpc.patients.createProfile.useMutation();

  // إذا كان المستخدم مسجل دخول بالفعل وله ملف مريض، أعد التوجيه
  if (isAuthenticated && getProfileMutation.data) {
    setLocation("/patient/dashboard");
    return null;
  }

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createProfileMutation.mutateAsync({
        phone: formData.phone,
        nationalId: formData.nationalId || undefined,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: (formData.gender as "male" | "female" | "other") || undefined,
        bloodType: formData.bloodType || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        emergencyContact: formData.emergencyContact || undefined,
        emergencyPhone: formData.emergencyPhone || undefined,
      });

      toast.success("تم إنشاء ملف المريض بنجاح!");
      setLocation("/patient/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("حدث خطأ أثناء إنشاء الملف الشخصي");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4 rtl">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">بوابة المريض</CardTitle>
            <CardDescription>الوصول إلى ملفك الطبي والمواعيد</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">
                يرجى تسجيل الدخول للوصول إلى بوابة المريض
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // سيتم التعامل مع تسجيل الدخول عبر OAuth
                  window.location.href = `/api/oauth/login`;
                }}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
                تسجيل الدخول
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 rtl">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">إنشاء ملف المريض</CardTitle>
            <CardDescription>
              أكمل بيانات ملفك الطبي للوصول إلى جميع الخدمات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProfile} className="space-y-6">
              {/* البيانات الأساسية */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">البيانات الأساسية</h3>

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
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">الجنس</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger>
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
                    <Select value={formData.bloodType} onValueChange={(value) => handleSelectChange("bloodType", value)}>
                      <SelectTrigger>
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
              </div>

              {/* بيانات الاتصال والعنوان */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">بيانات الاتصال والعنوان</h3>

                <div>
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="العنوان الكامل"
                    value={formData.address}
                    onChange={handleInputChange}
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
                      className="text-right"
                    />
                  </div>
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isLoading || !formData.phone}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    "إنشاء الملف الشخصي"
                  )}
                </Button>
              </div>

              <p className="text-sm text-gray-600 text-center">
                يمكنك تحديث بيانات إضافية لاحقاً من لوحة التحكم
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
