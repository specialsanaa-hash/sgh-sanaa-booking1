import React, { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CampBooking() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const campId = params.campId ? parseInt(params.campId) : null;

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "",
    patientNotes: "",
    medicalHistory: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: camp, isLoading: campLoading } = trpc.bookings.getById.useQuery(campId || 0, {
    enabled: !!campId,
  });

  const createBooking = trpc.bookings.create.useMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.patientName || !formData.patientEmail || !formData.patientPhone) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSubmitting(true);

    try {
      await createBooking.mutateAsync({
        formId: 0,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        campaignId: campId || 0,
      });

      setIsSuccess(true);
      toast.success("تم حفظ الحجز بنجاح! سيتم التواصل معك قريباً");

      setTimeout(() => {
        setLocation("/medical-camps");
      }, 2000);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("حدث خطأ أثناء حفظ الحجز");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (campLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              خطأ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">لم يتم العثور على المخيم الطبي</p>
            <Button 
              className="w-full mt-4" 
              onClick={() => setLocation("/medical-camps")}
            >
              العودة إلى المخيمات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              تم بنجاح!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">تم حفظ حجزك بنجاح. سيتم التواصل معك قريباً على الرقم المسجل.</p>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/medical-camps")}
            >
              العودة إلى المخيمات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/medical-camps")}
            className="mb-4"
          >
            ← العودة
          </Button>
        </div>

        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">نموذج التسجيل</CardTitle>
            <CardDescription className="text-blue-100">
              نموذج التسجيل في المخيم الطبي
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* معلومات المريض */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-900">معلومات المريض</h3>

                <div>
                  <Label htmlFor="patientName">اسم المريض *</Label>
                  <Input
                    id="patientName"
                    placeholder="أدخل اسم المريض"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange("patientName", e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientEmail">البريد الإلكتروني *</Label>
                    <Input
                      id="patientEmail"
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={formData.patientEmail}
                      onChange={(e) => handleInputChange("patientEmail", e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="patientPhone">رقم الهاتف *</Label>
                    <Input
                      id="patientPhone"
                      placeholder="رقم الهاتف"
                      value={formData.patientPhone}
                      onChange={(e) => handleInputChange("patientPhone", e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientAge">العمر</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      placeholder="العمر"
                      value={formData.patientAge}
                      onChange={(e) => handleInputChange("patientAge", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="patientGender">الجنس</Label>
                    <Select value={formData.patientGender} onValueChange={(value) => handleInputChange("patientGender", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="اختر الجنس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">ذكر</SelectItem>
                        <SelectItem value="female">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* المعلومات الطبية */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-lg text-slate-900">المعلومات الطبية</h3>

                <div>
                  <Label htmlFor="medicalHistory">السجل الطبي</Label>
                  <Textarea
                    id="medicalHistory"
                    placeholder="أدخل السجل الطبي (الأمراض السابقة، الأدوية الحالية، إلخ)"
                    value={formData.medicalHistory}
                    onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="patientNotes">ملاحظات إضافية</Label>
                  <Textarea
                    id="patientNotes"
                    placeholder="أي ملاحظات أو استفسارات إضافية"
                    value={formData.patientNotes}
                    onChange={(e) => handleInputChange("patientNotes", e.target.value)}
                    rows={3}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* الأزرار */}
              <div className="flex gap-4 pt-4 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    "تأكيد الحجز"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/medical-camps")}
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
