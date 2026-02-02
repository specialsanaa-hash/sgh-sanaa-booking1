import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
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
          <nav className="flex items-center gap-6">
            <Link href="/website">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                الموقع الإلكتروني
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900">
                الرئيسية
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl text-slate-900">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-slate-900">قيد التطوير</p>
              <p className="text-slate-600">
                {description || "هذه الصفحة قيد التطوير حالياً. يرجى العودة لاحقاً."}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm text-slate-600">
                نعمل بجد لتقديم أفضل الخدمات لكم. شكراً لصبركم!
              </p>
            </div>

            <div className="flex gap-3">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Home className="h-4 w-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
              <Link href="/website" className="flex-1">
                <Button variant="outline" className="w-full">
                  الموقع الإلكتروني
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-8 px-4">
        <div className="container mx-auto text-center text-slate-600">
          <p>&copy; 2025 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}
