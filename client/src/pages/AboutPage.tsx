import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Award, Users, Zap, Menu, X } from "lucide-react";
import { useState } from "react";

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const values = [
    {
      icon: Heart,
      title: "الرعاية الشاملة",
      description: "نقدم رعاية صحية متكاملة تركز على احتياجات المريض",
    },
    {
      icon: Award,
      title: "الجودة والتميز",
      description: "نلتزم بأعلى معايير الجودة في الخدمات الطبية",
    },
    {
      icon: Users,
      title: "الفريق المتخصص",
      description: "فريق طبي متميز بخبرة عالية وكفاءة مهنية",
    },
    {
      icon: Zap,
      title: "التكنولوجيا الحديثة",
      description: "استخدام أحدث التقنيات الطبية والمعدات",
    },
  ];

  const achievements = [
    { number: "500+", label: "طبيب متخصص" },
    { number: "50+", label: "قسم طبي" },
    { number: "100,000+", label: "مريض سنوياً" },
    { number: "24/7", label: "خدمة طوارئ" },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Top Bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-2 px-4 text-xs md:text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <a href="#" className="text-gray-600 hover:text-blue-600 font-medium">
              العربية
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              English
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/website">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  س
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">السعودي الألماني</div>
                  <div className="text-xs text-gray-600">الصحية</div>
                </div>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-6 items-center text-sm">
              <Link href="/website" className="text-gray-700 hover:text-blue-600">
                الرئيسية
              </Link>
              <Link href="/website/about" className="text-blue-600 font-medium">
                عن المستشفى
              </Link>
              <Link href="/website/specialties" className="text-gray-700 hover:text-blue-600">
                الأقسام
              </Link>
              <Link href="/website/doctors" className="text-gray-700 hover:text-blue-600">
                الأطباء
              </Link>
              <Link href="/website/news" className="text-gray-700 hover:text-blue-600">
                الأخبار
              </Link>
              <Link href="/website/contact" className="text-gray-700 hover:text-blue-600">
                اتصل بنا
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-gray-200 pt-4">
              <Link href="/website" className="text-gray-700 hover:text-blue-600">
                الرئيسية
              </Link>
              <Link href="/website/about" className="text-blue-600 font-medium">
                عن المستشفى
              </Link>
              <Link href="/website/specialties" className="text-gray-700 hover:text-blue-600">
                الأقسام
              </Link>
              <Link href="/website/doctors" className="text-gray-700 hover:text-blue-600">
                الأطباء
              </Link>
              <Link href="/website/news" className="text-gray-700 hover:text-blue-600">
                الأخبار
              </Link>
              <Link href="/website/contact" className="text-gray-700 hover:text-blue-600">
                اتصل بنا
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">عن المستشفى السعودي الألماني</h1>
          <p className="text-base md:text-lg text-blue-100">
            رحلة من التميز والابتكار في الرعاية الصحية
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <img
              src="/صورةالغلاف.jpg"
              alt="المستشفى"
              className="rounded-lg shadow-lg w-full h-auto"
            />
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                رؤيتنا ورسالتنا
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                المستشفى السعودي الألماني - صنعاء تأسست برؤية واضحة لتقديم أفضل الخدمات الطبية في المنطقة. نحن نسعى لأن نكون الخيار الأول للمرضى الذين يبحثون عن رعاية صحية متميزة وموثوقة.
              </p>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                رسالتنا هي تقديم خدمات طبية عالية الجودة بأسعار معقولة، مع الاهتمام الكامل برفاهية المريض وراحته النفسية والجسدية.
              </p>
              <Button className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">
                اعرف المزيد
              </Button>
            </div>
          </div>

          {/* Achievements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
            {achievements.map((achievement, idx) => (
              <Card key={idx} className="text-center border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="text-2xl md:text-4xl font-bold text-blue-600 mb-2">
                    {achievement.number}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">{achievement.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
              قيمنا الأساسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => (
                <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <value.icon className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle className="text-base md:text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* History */}
          <div className="bg-gray-50 rounded-lg p-6 md:p-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
              تاريخنا
            </h2>
            <div className="space-y-6">
              <div className="border-r-4 border-blue-600 pr-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">2025</h3>
                <p className="text-gray-700">
                  تأسيس المستشفى السعودي الألماني - صنعاء بهدف تقديم خدمات طبية متميزة
                </p>
              </div>
              <div className="border-r-4 border-green-600 pr-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">2025</h3>
                <p className="text-gray-700">
                  افتتاح أقسام متخصصة وتجهيزها بأحدث المعدات الطبية
                </p>
              </div>
              <div className="border-r-4 border-blue-600 pr-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">2025</h3>
                <p className="text-gray-700">
                  توسع الخدمات وإضافة تخصصات طبية جديدة
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">احجز موعدك الآن</h2>
          <p className="text-base md:text-lg mb-8 text-blue-100">
            تواصل معنا للحصول على أفضل الخدمات الطبية
          </p>
          <Link href="/booking-types">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 md:px-8 py-2 md:py-3 font-bold text-sm md:text-base">
              ابدأ الحجز
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 text-sm md:text-base">عن المستشفى</h3>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    نبذة عنا
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الرؤية والرسالة
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الفريق
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm md:text-base">الخدمات</h3>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    الأقسام
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الأطباء
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الحجز
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm md:text-base">المعلومات</h3>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    الأخبار
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    المقالات
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    الأسئلة الشائعة
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-sm md:text-base">تابعنا</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  f
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  i
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  in
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  tw
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-xs md:text-sm">
            <p>&copy; 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
