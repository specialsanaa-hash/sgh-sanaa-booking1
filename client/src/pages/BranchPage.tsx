import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function BranchPage() {
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
              <Link href="/website/doctors" className="text-gray-700 hover:text-blue-600">الأطباء</Link>
              <Link href="/website/news" className="text-gray-700 hover:text-blue-600">الأخبار</Link>
              <Link href="/website/contact" className="text-gray-700 hover:text-blue-600">اتصل بنا</Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الفرع</h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">هذا القسم قيد التطوير حالياً</p>
          <p className="text-base md:text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            نعمل على تطوير هذا القسم لتقديم معلومات شاملة عن فروعنا. يرجى العودة قريباً.
          </p>
          <Link href="/website">
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 font-bold">
              العودة للصفحة الرئيسية
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4 mt-12">
        <div className="container mx-auto">
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
