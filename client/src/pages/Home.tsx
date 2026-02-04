import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Heart, Clock, Users, CheckCircle, Phone, MapPin, Clock3, LogOut, Menu, X } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                س
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">{APP_TITLE}</h1>
                <p className="text-xs text-slate-600">منصة الحجز الإلكترونية</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/website">
                <Button variant="ghost" className="text-slate-700 hover:text-blue-600">
                  الموقع الإلكتروني
                </Button>
              </Link>
              <Link href="/website/about">
                <Button variant="ghost" className="text-slate-700 hover:text-blue-600">
                  عن المستشفى
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <span className="text-sm text-slate-600 border-l border-slate-200 pl-6">
                    {user?.name}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut size={16} className="ml-2" />
                    تسجيل الخروج
                  </Button>
                </>
              )}
              {!isAuthenticated && (
                <Link href={getLoginUrl()}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 flex flex-col gap-3 pb-4 border-t border-slate-200 pt-4">
              <Link href="/website">
                <Button variant="ghost" className="w-full justify-start text-slate-700">
                  الموقع الإلكتروني
                </Button>
              </Link>
              <Link href="/website/about">
                <Button variant="ghost" className="w-full justify-start text-slate-700">
                  عن المستشفى
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <div className="px-4 py-2 text-sm text-slate-600 border-t border-slate-200">
                    {user?.name}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <LogOut size={16} className="ml-2" />
                    تسجيل الخروج
                  </Button>
                </>
              )}
              {!isAuthenticated && (
                <Link href={getLoginUrl()}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-3">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  احجز موعدك الآن
                </h2>
                <p className="text-xl text-blue-600 font-semibold">
                  مع المستشفى السعودي الألماني - صنعاء
                </p>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                نقدم لكم خدمات طبية متميزة بأحدث التقنيات الطبية والكوادر الطبية المتخصصة. احجز موعدك بسهولة وسرعة من خلال منصتنا الإلكترونية.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/booking-types">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    ابدأ الحجز الآن
                  </Button>
                </Link>
                <Link href="/website/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    اتصل بنا
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg p-8 h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🏥</div>
                  <p className="text-slate-600">صورة المستشفى</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              لماذا تختار المستشفى السعودي الألماني؟
            </h3>
            <p className="text-lg text-slate-600">نقدم أفضل الخدمات الطبية بأسعار منافسة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: "رعاية متخصصة", description: "فريق طبي متخصص وذو خبرة عالية" },
              { icon: Clock, title: "حجز سريع", description: "احجز موعدك في دقائق معدودة" },
              { icon: Users, title: "خدمة العملاء", description: "فريق دعم جاهز لمساعدتك 24/7" },
              { icon: CheckCircle, title: "ضمان الجودة", description: "أحدث التقنيات الطبية والمعايير العالمية" },
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px]">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-blue-600 mb-3" />
                  <CardTitle className="text-lg text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
            <div>
              <div className="text-4xl font-bold mb-2">+500</div>
              <p className="text-blue-100">موعد محجوز يومياً</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">+50</div>
              <p className="text-blue-100">طبيب متخصص</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">+20</div>
              <p className="text-blue-100">قسم طبي</p>
            </div>
          </div>
        </div>
      </section>

      {/* Website Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-12 text-white text-center shadow-lg">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">استكشف موقعنا الإلكتروني</h3>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              تعرف على المزيد عن المستشفى السعودي الألماني - صنعاء، أقسامنا الطبية، الأطباء المتخصصين، والخدمات الصحية المتميزة
            </p>
            <Link href="/website">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                زيارة الموقع الإلكتروني
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">معلومات التواصل</h3>
            <p className="text-slate-600">المستشفى السعودي الألماني - صنعاء</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle>العنوان</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  الجمهورية اليمنية - صنعاء<br />
                  شارع الستين الشمالي<br />
                  بالقرب من جولة الجمنة
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <CardTitle>الهاتف</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600 text-lg font-semibold">+967 1 441 441</p>
                <p className="text-slate-500 text-sm mt-2">للاستفسارات والحجوزات</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <Clock3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <CardTitle>ساعات العمل</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-slate-600">
                  من الأحد إلى الخميس<br />
                  8:00 صباحاً - 8:00 مساءً<br />
                  <span className="text-sm text-slate-500">الجمعة والسبت مغلق</span>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">هل أنت مستعد للحجز؟</h3>
          <p className="text-lg text-slate-600 mb-8">
            احجز موعدك الآن وتمتع بخدمات طبية متميزة
          </p>
          <Link href="/booking-types">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
              ابدأ الحجز الآن
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">عن المستشفى</h4>
              <p className="text-slate-400 text-sm">
                المستشفى السعودي الألماني - صنعاء توفر خدمات طبية متميزة بأحدث التقنيات والكوادر المتخصصة.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/website"><a className="text-slate-400 hover:text-white">الموقع الإلكتروني</a></Link></li>
                <li><Link href="/website/about"><a className="text-slate-400 hover:text-white">عن المستشفى</a></Link></li>
                <li><Link href="/website/contact"><a className="text-slate-400 hover:text-white">اتصل بنا</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">معلومات التواصل</h4>
              <p className="text-slate-400 text-sm mb-2">الهاتف: +967 1 441 441</p>
              <p className="text-slate-400 text-sm">البريد الإلكتروني: info@sgh.com</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
