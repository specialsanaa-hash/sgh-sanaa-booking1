import { useParams } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Phone, Mail, Award, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function DoctorDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: doctor, isLoading } = trpc.doctors.getBySlug.useQuery({ slug: slug || "" });
  const createBooking = trpc.doctorBookings.create.useMutation();

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!doctor) return;

    try {
      await createBooking.mutateAsync({
        doctorId: doctor.id,
        ...formData,
      });

      toast.success("تم تقديم طلب الحجز بنجاح! سيتم التواصل معك قريباً.");
      setFormData({
        patientName: "",
        patientEmail: "",
        patientPhone: "",
        notes: "",
      });
    } catch (error) {
      toast.error("حدث خطأ في تقديم الحجز. يرجى المحاولة مرة أخرى.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">لم يتم العثور على الطبيب</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            العودة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/doctors" className="hover:text-blue-600">الأطباء</a>
            <ArrowRight className="w-4 h-4" />
            <span>{doctor.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctor Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                {doctor.image && (
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <CardTitle className="text-2xl">{doctor.name}</CardTitle>
                <CardDescription className="text-blue-600 text-base font-semibold">
                  {doctor.specialty}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctor.experience && (
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span>{doctor.experience} سنة خبرة</span>
                  </div>
                )}
                {doctor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <a href={`tel:${doctor.phone}`} className="hover:text-blue-600">
                      {doctor.phone}
                    </a>
                  </div>
                )}
                {doctor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <a href={`mailto:${doctor.email}`} className="hover:text-blue-600">
                      {doctor.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Doctor Bio & Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {doctor.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>نبذة عن الطبيب</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{doctor.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Qualifications */}
            {doctor.qualifications && (
              <Card>
                <CardHeader>
                  <CardTitle>المؤهلات العلمية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {doctor.qualifications}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle>احجز موعداً مع الطبيب</CardTitle>
                <CardDescription>
                  يرجى ملء البيانات أدناه وسيتم التواصل معك لتأكيد الموعد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                    <Input
                      type="text"
                      placeholder="أدخل اسمك الكامل"
                      value={formData.patientName}
                      onChange={(e) =>
                        setFormData({ ...formData, patientName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">البريد الإلكتروني</label>
                    <Input
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={formData.patientEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, patientEmail: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                    <Input
                      type="tel"
                      placeholder="أدخل رقم هاتفك"
                      value={formData.patientPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, patientPhone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                    <Textarea
                      placeholder="أضف أي ملاحظات تراها مهمة"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري التقديم...
                      </>
                    ) : (
                      "تقديم طلب الحجز"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
