import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Heart, Users } from "lucide-react";

export default function BookingTypes() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">← العودة</Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">اختر نوع الحجز</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Medical Camps Card */}
            <Link href="/medical-camps">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-green-100 rounded-full">
                      <Heart className="w-12 h-12 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">المخيمات الطبية</CardTitle>
                  <CardDescription className="text-lg">احجز في أحد المخيمات الطبية المتخصصة</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-6">
                    اختر من بين مختلف المخيمات الطبية والخدمات المتخصصة
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    اختر مخيم طبي
                  </Button>
                </CardContent>
              </Card>
            </Link>

            {/* Doctor Booking Card */}
            <Link href="/doctor-booking">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <Users className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">حجز الأطباء</CardTitle>
                  <CardDescription className="text-lg">احجز موعداً مع أحد الأطباء المتخصصين</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-slate-600 mb-6">
                    اختر طبيبك المفضل وحدد الموعد المناسب لك
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    احجز مع طبيب
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-4">
        <div className="container mx-auto text-center text-slate-600 text-sm">
          <p>© 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
