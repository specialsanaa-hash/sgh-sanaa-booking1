import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";
import { Heart, Clock, Users, CheckCircle, Phone, MapPin, Clock3, Search, Download, AlertCircle } from "lucide-react";

export default function Website() {
  const { user, isAuthenticated } = useAuth();

  const specialties = [
    "الأمراض الجلدية والتجميل",
    "التخدير وإدارة الألم",
    "الجراحة العامة والتخصصية",
    "الطب الباطني",
    "الطب البديل",
    "الطب النفسي والصحة السلوكية",
    "خدمات الرعاية المنزلية",
    "رعاية الأمراض الصدرية والرئة",
  ];

  const latestArticles = [
    {
      title: "أحدث التقنيات في الرعاية الصحية",
      date: "كانون الأول 18, 2025",
      description: "نفخر بمشاركة إنجاز هام في مسيرتنا في مجال الرعاية الصحية، حيث تم تطبيق أحدث التقنيات الطبية في جميع أقسام المستشفى.",
    },
    {
      title: "الصيام المتقطع والصحة",
      date: "كانون الأول 10, 2025",
      description: "الصيام المتقطع هو نمط غذائي ينظّم فترات الأكل والصيام بحيث يمتنع الشخص عن تناول السعرات خلال فترات محددة.",
    },
    {
      title: "علاج القلق والخوف",
      date: "كانون الأول 10, 2025",
      description: "القلق هو استجابة طبيعية للجسم تجاه التوتر والضغوطات. تعرف على أحدث طرق العلاج المتاحة.",
    },
    {
      title: "أنواع الغسيل الكلوي",
      date: "كانون الأول 9, 2025",
      description: "الغسيل الكلوي هو إجراء طبي يُستخدم لتعويض وظائف الكلى عندما تفشل في أداء دورها الطبيعي.",
    },
  ];

  const latestNews = [
    {
      date: "تشرين الأول 1",
      title: "المستشفى السعودي الألماني تُعزِّز مكانتها كأفضل مزود للرعاية الصحية",
    },
    {
      date: "آذار 24",
      title: "عيادة اضطرابات النوم – تشخيص وعلاج متكامل",
    },
    {
      date: "كانون الثاني 9",
      title: "استئصال ورم يهدد حياة مريضة بنجاح",
    },
    {
      date: "تشرين الثاني 3",
      title: "أمل جديد لمريضة فقدت قدرتها على المشي",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4" />
              <span>+967 1 441 441</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <Link href="#" className="text-slate-600 hover:text-slate-900">
                English
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-slate-900 font-medium">العربية</span>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={APP_LOGO} alt={APP_TITLE} className="h-12 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-slate-900">{APP_TITLE}</h1>
                <p className="text-xs text-slate-600">نرعاكم كأهالينا</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/website" className="text-slate-900 font-medium hover:text-green-600">
                الصفحة الرئيسية
              </Link>
              <Link href="/website/about" className="text-slate-600 hover:text-slate-900">
                عن المستشفى
              </Link>
              <Link href="/website/specialties" className="text-slate-600 hover:text-slate-900">
                الأقسام
              </Link>
              <Link href="/website/doctors" className="text-slate-600 hover:text-slate-900">
                الأطباء
              </Link>
              <Link href="/website/news" className="text-slate-600 hover:text-slate-900">
                الأخبار
              </Link>
              <Link href="/website/contact" className="text-slate-600 hover:text-slate-900">
                اتصل بنا
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <span className="text-sm text-slate-600">{user?.name}</span>
              )}
              <Link href="/booking">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  احجز موعد
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white overflow-hidden">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 z-10">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                احصل على رعاية صحية متميزة
              </h2>
              <p className="text-lg text-blue-100">
                نقدم لكم خدمات طبية متميزة بأحدث التقنيات الطبية والكوادر الطبية المتخصصة
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="/booking">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                    احجز موعدك الآن
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  اتصل بنا
                </Button>
              </div>
            </div>

            <div className="relative z-0">
              <img 
                src="/صورةالغلاف.jpg" 
                alt="المستشفى السعودي الألماني" 
                className="rounded-lg shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="absolute top-8 left-8 bg-white p-4 rounded-lg shadow-lg hidden lg:block">
          <div className="text-center text-slate-900 text-sm font-medium mb-2">تحميل التطبيق</div>
          <div className="w-24 h-24 bg-slate-200 rounded flex items-center justify-center">
            <span className="text-xs text-slate-500">QR Code</span>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 px-4 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200">
              <Search className="h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث عن طبيب..." 
                className="flex-1 outline-none text-sm"
              />
            </div>
            <select className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
              <option>اختر التخصص</option>
              {specialties.map((spec, idx) => (
                <option key={idx}>{spec}</option>
              ))}
            </select>
            <Button className="bg-green-600 hover:bg-green-700 w-full">
              ابحث
            </Button>
          </div>
        </div>
      </section>

      {/* "أين موضع الألم؟" Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">أين موضع الألم؟</h3>
            <p className="text-lg text-blue-100">
              حدد الجزء الذي يؤلمك لتحصل على استشارة من القسم المناسب
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex justify-center">
              <div className="text-6xl">👤</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {specialties.slice(0, 8).map((spec, idx) => (
                <Button 
                  key={idx}
                  variant="outline" 
                  className="border-white text-white hover:bg-white/20 justify-start text-right"
                >
                  {spec}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Medical Departments Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <img 
              src="/صورةالغلاف.jpg" 
              alt="الأقسام الطبية" 
              className="rounded-lg shadow-lg w-full h-auto"
            />
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-slate-900">أقسامنا الطبية</h3>
              <p className="text-lg text-slate-600">
                توفّر جميع أقسامنا خدمات الرعاية الصحية وفق المعايير الدولية في مجموعة متنوعة من التخصصات.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {specialties.map((spec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{spec}</span>
                  </div>
                ))}
              </div>
              <Button className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                عرض جميع الأقسام ←
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-slate-900">الرعاية الصحية تتمحور حولكم</h3>
              <p className="text-lg text-slate-600 leading-relaxed">
                بناءً على إرثها العائلي الطويل في ريادة المجال الطبي، أنشأت المستشفى السعودي الألماني - صنعاء لتصبح أفضل مزود خاص للرعاية الصحية. نحن نضم فريقاً من الأطباء المؤهلين والممرضين والأخصائيين في المجال الصحي.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">2025</div>
                    <div className="text-sm text-slate-600">تأسست في</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">صنعاء</div>
                    <div className="text-sm text-slate-600">الموقع الرئيسي</div>
                  </CardContent>
                </Card>
              </div>

              <Button className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
                عرض المزيد ←
              </Button>
            </div>

            <img 
              src="/صورةالغلاف.jpg" 
              alt="عن المستشفى" 
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-slate-900">أحدث المقالات</h3>
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              عرض المزيد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestArticles.map((article, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="text-xs">{article.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-4">{article.description}</p>
                  <Link href="#" className="text-green-600 hover:text-green-700 text-sm font-medium">
                    اقرأ المزيد ←
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl font-bold text-slate-900">أحدث الأخبار</h3>
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              عرض المزيد
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestNews.map((news, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="text-center min-w-fit">
                      <div className="text-2xl font-bold text-green-600">{news.date.split(' ')[0]}</div>
                      <div className="text-xs text-slate-600">{news.date.split(' ')[1]}</div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">{news.title}</h4>
                      <Link href="#" className="text-green-600 hover:text-green-700 text-sm font-medium">
                        اقرأ المزيد ←
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-12 border border-green-200">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-2">احصل على أفضل العروض اليوم!</h3>
              <p className="text-lg text-slate-600">استفد من عروضنا الخاصة والمميزة</p>
            </div>
            <div className="flex justify-center">
              <Button className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg">
                عرض جميع العروض
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Download App Section */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">احصل على تطبيق المستشفى</h3>
          <p className="text-lg text-slate-600 mb-8">حمّل التطبيق الآن واستمتع بخدمات أفضل</p>
          <div className="flex justify-center gap-4">
            <Button className="bg-slate-900 hover:bg-slate-800 px-6 py-6 flex items-center gap-2">
              <Download className="h-5 w-5" />
              حمّل من App Store
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 px-6 py-6 flex items-center gap-2">
              <Download className="h-5 w-5" />
              حمّل من Google Play
            </Button>
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
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900 mb-2">العنوان</p>
                <p className="text-slate-600 text-sm">
                  الجمهورية اليمنية - صنعاء<br />
                  شارع الستين الشمالي<br />
                  بالقرب من جولة الجمنة
                </p>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900 mb-2">الهاتف</p>
                <p className="text-slate-600 text-lg">+967 1 441 441</p>
              </div>
              <div className="text-center">
                <Clock3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900 mb-2">ساعات العمل</p>
                <p className="text-slate-600 text-sm">
                  من الأحد إلى الخميس<br />
                  8:00 صباحاً - 8:00 مساءً
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 px-4 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">اشترك في نشرتنا الإخبارية</h3>
          <p className="text-slate-600 mb-6">احصل على أحدث الأخبار والعروض مباشرة إلى بريدك الإلكتروني</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="أدخل بريدك الإلكتروني" 
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <Button className="bg-green-600 hover:bg-green-700">
              اشترك
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">الروابط السريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/website" className="hover:text-green-400">الصفحة الرئيسية</Link></li>
                <li><Link href="#" className="hover:text-green-400">عن المستشفى</Link></li>
                <li><Link href="#" className="hover:text-green-400">الأقسام</Link></li>
                <li><Link href="#" className="hover:text-green-400">الأطباء</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">الخدمات</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/booking" className="hover:text-green-400">احجز موعد</Link></li>
                <li><Link href="#" className="hover:text-green-400">البحث عن طبيب</Link></li>
                <li><Link href="#" className="hover:text-green-400">الأخبار</Link></li>
                <li><Link href="#" className="hover:text-green-400">الوظائف</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">المعلومات</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-green-400">سياسة الخصوصية</Link></li>
                <li><Link href="#" className="hover:text-green-400">شروط الاستخدام</Link></li>
                <li><Link href="#" className="hover:text-green-400">اتصل بنا</Link></li>
                <li><Link href="#" className="hover:text-green-400">الأسئلة الشائعة</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">تابعنا</h4>
              <div className="flex gap-4">
                <Link href="#" className="hover:text-green-400">Facebook</Link>
                <Link href="#" className="hover:text-green-400">Instagram</Link>
                <Link href="#" className="hover:text-green-400">Twitter</Link>
                <Link href="#" className="hover:text-green-400">LinkedIn</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
