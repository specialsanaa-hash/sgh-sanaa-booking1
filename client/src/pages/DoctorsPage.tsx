import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, X, Star } from "lucide-react";
import { useState } from "react";

export default function DoctorsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const doctors = [
    { name: "د. أحمد محمد", specialty: "طب القلب", rating: 4.8, image: "/doctor1.jpg" },
    { name: "د. فاطمة علي", specialty: "الأطفال", rating: 4.9, image: "/doctor2.jpg" },
    { name: "د. محمود حسن", specialty: "العظام", rating: 4.7, image: "/doctor3.jpg" },
    { name: "د. سارة إبراهيم", specialty: "الجلدية", rating: 4.8, image: "/doctor4.jpg" },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/website">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold">س</div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">السعودي الألماني</div>
                  <div className="text-xs text-gray-600">الصحية</div>
                </div>
              </div>
            </Link>
            <div className="hidden lg:flex gap-6 items-center text-sm">
              <Link href="/website" className="text-gray-700 hover:text-blue-600">الرئيسية</Link>
              <Link href="/website/about" className="text-gray-700 hover:text-blue-600">عن المستشفى</Link>
              <Link href="/website/specialties" className="text-gray-700 hover:text-blue-600">الأقسام</Link>
              <Link href="/website/doctors" className="text-blue-600 font-medium">الأطباء</Link>
              <Link href="/website/news" className="text-gray-700 hover:text-blue-600">الأخبار</Link>
              <Link href="/website/contact" className="text-gray-700 hover:text-blue-600">اتصل بنا</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">أطباؤنا المتخصصون</h1>
          <p className="text-base md:text-lg text-blue-100">فريق طبي متميز بخبرة عالية وكفاءة مهنية</p>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                <img src={doctor.image} alt={doctor.name} className="w-full h-48 object-cover" />
                <CardHeader>
                  <CardTitle className="text-base">{doctor.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 text-sm">{doctor.specialty}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">احجز الآن</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">احجز موعدك الآن</h2>
          <Link href="/booking-types">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-bold">ابدأ الحجز</Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
