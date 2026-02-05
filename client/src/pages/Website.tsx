import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Heart,
  Clock,
  Users,
  CheckCircle,
  Menu,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Search,
  Phone,
  MapPin,
} from "lucide-react";

export default function Website() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const specialties = [
    { id: "cardiology", name: "طب القلب", icon: "❤️" },
    { id: "orthopedics", name: "العظام", icon: "🦴" },
    { id: "neurology", name: "الأعصاب", icon: "🧠" },
    { id: "pediatrics", name: "الأطفال", icon: "👶" },
    { id: "dentistry", name: "الأسنان", icon: "😁" },
    { id: "dermatology", name: "الجلدية", icon: "🩹" },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Top Bar - Light Gray Background */}
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
          <div className="flex gap-3 items-center">
            <a href="#" className="text-gray-600 hover:text-blue-600">
              <Facebook size={16} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              <Youtube size={16} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              <Twitter size={16} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              <Linkedin size={16} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              <Instagram size={16} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-600">
              <Facebook size={16} />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Bar - White Background */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                س
              </div>
              <div>
                <div className="font-bold text-gray-800 text-sm">السعودي الألماني</div>
                <div className="text-xs text-gray-600">الصحية</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex gap-6 items-center text-sm">
              <a href="/website" className="text-gray-700 hover:text-blue-600 font-medium">
                الرئيسية
              </a>
              <a href="/website/patients" className="text-gray-700 hover:text-blue-600">
                المرضى والزوار
              </a>
              <a href="/website/branch" className="text-gray-700 hover:text-blue-600">
                الفرع
              </a>
              <a href="/website/specialties" className="text-gray-700 hover:text-blue-600">
                التخصصات الطبية
              </a>
              <a href="/website/doctors" className="text-gray-700 hover:text-blue-600">
                الأطباء
              </a>
              <a href="/website/news" className="text-gray-700 hover:text-blue-600">
                الأخبار
              </a>
              <a href="/website/offers" className="text-gray-700 hover:text-blue-600">
                العروض
              </a>
              <a href="/website/team" className="text-gray-700 hover:text-blue-600">
                أهالينا
              </a>
              <a href="/website/podcast" className="text-gray-700 hover:text-blue-600">
                البودكاست
              </a>
              <a href="/website/events" className="text-gray-700 hover:text-blue-600">
                الفعاليات
              </a>
              <a href="/website/home-health" className="text-gray-700 hover:text-blue-600">
                خدمات الرعاية المنزلية
              </a>
              <a href="/website/investors" className="text-gray-700 hover:text-blue-600">
                علاقات المستثمرين
              </a>
              <a href="/website/about" className="text-gray-700 hover:text-blue-600">
                عن المستشفى
              </a>
              <a href="/website/contact" className="text-gray-700 hover:text-blue-600">
                اتصل بنا
              </a>
            </div>

            {/* Phone & Search */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600 font-bold text-sm border border-green-600 rounded-full px-4 py-2">
                <Phone size={16} />
                <span>+967 1 441 441</span>
              </div>
              <button className="text-gray-600 hover:text-blue-600">
                <Search size={20} />
              </button>
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
              <a href="/website" className="text-gray-700 hover:text-blue-600 font-medium">
                الرئيسية
              </a>
              <a href="/website/patients" className="text-gray-700 hover:text-blue-600">
                المرضى والزوار
              </a>
              <a href="/website/branch" className="text-gray-700 hover:text-blue-600">
                الفرع
              </a>
              <a href="/website/specialties" className="text-gray-700 hover:text-blue-600">
                التخصصات الطبية
              </a>
              <a href="/website/doctors" className="text-gray-700 hover:text-blue-600">
                الأطباء
              </a>
              <a href="/website/news" className="text-gray-700 hover:text-blue-600">
                الأخبار
              </a>
              <a href="/website/offers" className="text-gray-700 hover:text-blue-600">
                العروض
              </a>
              <a href="/website/team" className="text-gray-700 hover:text-blue-600">
                أهالينا
              </a>
              <a href="/website/podcast" className="text-gray-700 hover:text-blue-600">
                البودكاست
              </a>
              <a href="/website/events" className="text-gray-700 hover:text-blue-600">
                الفعاليات
              </a>
              <a href="/website/home-health" className="text-gray-700 hover:text-blue-600">
                خدمات الرعاية المنزلية
              </a>
              <a href="/website/investors" className="text-gray-700 hover:text-blue-600">
                علاقات المستثمرين
              </a>
              <a href="/website/about" className="text-gray-700 hover:text-blue-600">
                عن المستشفى
              </a>
              <a href="/website/contact" className="text-gray-700 hover:text-blue-600">
                اتصل بنا
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* App Banner - Blue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm md:text-base">
          <span>احصل على تطبيق السعودي الألماني الصحية الآن!</span>
          <Button variant="ghost" className="text-white hover:bg-blue-500 text-xs md:text-sm">
            حمل التطبيق الآن
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                نقدم لك رعاية متكاملة تصل إليك أينما كنت
              </h1>
              <p className="text-base md:text-lg text-gray-700">
                خدمات طبية متميزة بأحدث التقنيات والكوادر الطبية المتخصصة
              </p>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6 md:px-8 py-2 md:py-3 text-sm md:text-base">
                حمل التطبيق الآن
              </Button>
            </div>
            <div className="relative">
              <img
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663116724066/MVrgPgySxftKOnUp.jpg"
                alt="المستشفى السعودي الألماني - صنعاء"
                className="rounded-lg shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Where Does It Hurt Section - Blue Background */}
      <section className="py-12 md:py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">أين موضع الألم؟</h2>
            <p className="text-blue-100 text-sm md:text-base">
              حدد الجزء الذي يؤلمك لتحصل على استشارة من القسم المناسب
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {specialties.map((specialty) => (
              <button
                key={specialty.id}
                className="p-3 md:p-4 rounded-lg transition-all bg-blue-500 text-white hover:bg-white hover:text-blue-600 border-2 border-transparent hover:border-white"
              >
                <div className="text-2xl md:text-3xl mb-2">{specialty.icon}</div>
                <div className="text-xs md:text-sm font-medium">{specialty.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Search Doctors Section */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 md:p-8 text-white">
            <h2 className="text-xl md:text-2xl font-bold mb-6">ابحث عن طبيبك</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">ابحث عن طبيب</label>
                <input
                  type="text"
                  placeholder="أدخل اسم الطبيب"
                  className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">اختر التخصص</label>
                <select className="w-full px-4 py-2 rounded-lg text-gray-900 text-sm">
                  <option>جميع التخصصات</option>
                  {specialties.map((s) => (
                    <option key={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-sm md:text-base">
                  ابحث
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Image */}
      <section className="py-12 md:py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663116724066/teGNsOSbIedzRKvE.jpg"
              alt="عن المستشفى السعودي الألماني - صنعاء"
              className="rounded-lg shadow-lg w-full h-auto object-cover order-2 md:order-1"
            />
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900">
                الرعاية الصحية تتمحور حولكم
              </h2>
              <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                بناءً على إرثها العائلي الطويل في ريادة المجال الطبي، أنشأت المستشفى السعودي الألماني - صنعاء لتصبح أفضل مزود خاص للرعاية الصحية. نحن نضم فريقاً من الأطباء المؤهلين والممرضين والأخصائيين في المجال الصحي.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">2025</div>
                    <div className="text-xs md:text-sm text-gray-600">تأسست في</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">صنعاء</div>
                    <div className="text-xs md:text-sm text-gray-600">الموقع الرئيسي</div>
                  </CardContent>
                </Card>
              </div>

              <Button className="bg-green-600 hover:bg-green-700 text-white text-sm md:text-base">
                عرض المزيد ←
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              لماذا تختار المستشفى السعودي الألماني؟
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              نقدم أفضل الخدمات الطبية بأسعار منافسة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: "رعاية متخصصة",
                description: "فريق طبي متخصص وذو خبرة عالية",
              },
              {
                icon: Clock,
                title: "حجز سريع",
                description: "احجز موعدك في دقائق معدودة",
              },
              {
                icon: Users,
                title: "خدمة العملاء",
                description: "فريق دعم جاهز لمساعدتك 24/7",
              },
              {
                icon: CheckCircle,
                title: "ضمان الجودة",
                description: "أحدث التقنيات الطبية والمعايير العالمية",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-blue-600 mb-2" />
                  <CardTitle className="text-base md:text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
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

      {/* Contact Section */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
              معلومات التواصل
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-base md:text-lg">الهاتف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">+967 1 441 441</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-base md:text-lg">العنوان</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  صنعاء - شارع الستين الشمالي
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-sm">
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle className="text-base md:text-lg">ساعات العمل</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  من الأحد إلى الخميس<br />
                  8:00 صباحاً - 8:00 مساءً
                </p>
              </CardContent>
            </Card>
          </div>
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
                  <Facebook size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Twitter size={20} />
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
