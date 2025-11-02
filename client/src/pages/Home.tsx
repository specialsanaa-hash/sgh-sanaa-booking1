import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Heart, Clock, Users, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{APP_TITLE}</h1>
              <p className="text-xs text-slate-600">نرعاكم كأهالينا</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">لوحة التحكم</Button>
                </Link>
                <span className="text-sm text-slate-600">{user?.name}</span>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button>تسجيل الدخول</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                  احجز موعدك الآن
                </h2>
                <p className="text-xl text-slate-600">
                  مع المستشفى السعودي الألماني - صنعاء
                </p>
              </div>
              <p className="text-lg text-slate-700 leading-relaxed">
                نقدم لكم خدمات طبية متميزة بأحدث التقنيات الطبية والكوادر الطبية المتخصصة. احجز موعدك بسهولة وسرعة من خلال منصتنا الإلكترونية.
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="/booking/1">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    ابدأ الحجز الآن
                  </Button>
                </Link>
                <Button size="lg" variant="outline">
                  اتصل بنا
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/صورةالغلاف.jpg" 
                alt="المستشفى السعودي الألماني" 
                className="rounded-lg shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">لماذا تختار المستشفى السعودي الألماني؟</h3>
            <p className="text-lg text-slate-600">نقدم أفضل الخدمات الطبية بأسعار منافسة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: "رعاية متخصصة", description: "فريق طبي متخصص وذو خبرة عالية" },
              { icon: Clock, title: "حجز سريع", description: "احجز موعدك في دقائق معدودة" },
              { icon: Users, title: "خدمة العملاء", description: "فريق دعم جاهز لمساعدتك 24/7" },
              { icon: CheckCircle, title: "ضمان الجودة", description: "أحدث التقنيات الطبية والمعايير العالمية" },
            ].map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-green-600 mb-2" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">معلومات التواصل</CardTitle>
              <CardDescription>المستشفى السعودي الألماني - صنعاء</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="font-semibold text-slate-900 mb-2">العنوان</p>
                <p className="text-slate-600">
                  الجمهورية اليمنية - صنعاء<br />
                  شارع الستين الشمالي<br />
                  بالقرب من جولة الجمنة
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">الهاتف</p>
                <p className="text-slate-600 text-lg">920007997</p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 mb-2">ساعات العمل</p>
                <p className="text-slate-600">
                  من الأحد إلى الخميس<br />
                  8:00 صباحاً - 8:00 مساءً
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 py-8 px-4">
        <div className="container mx-auto text-center text-slate-600">
          <p>&copy; 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
