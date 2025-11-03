import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Heart, Calendar, MapPin } from "lucide-react";

interface MedicalCamp {
  id: number;
  name: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  location: string;
  formId: number;
}

const camps: MedicalCamp[] = [
  {
    id: 1,
    name: "المخيم الخيري الأول في جراحة القلب والقسطرة",
    description: "خدمات متخصصة في جراحة القلب والقسطرة القلبية مع أحدث التقنيات الطبية",
    image: "https://via.placeholder.com/400x300?text=مخيم+القلب",
    startDate: "20 أكتوبر 2025",
    endDate: "10 نوفمبر 2025",
    location: "المستشفى السعودي الألماني - صنعاء",
    formId: 1,
  },
  {
    id: 2,
    name: "مخيم الجراحة العامة",
    description: "خدمات جراحية عامة متخصصة مع فريق طبي متمرس",
    image: "https://via.placeholder.com/400x300?text=مخيم+الجراحة",
    startDate: "15 نوفمبر 2025",
    endDate: "30 نوفمبر 2025",
    location: "المستشفى السعودي الألماني - صنعاء",
    formId: 2,
  },
];

export default function MedicalCamps() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/booking-types">
              <Button variant="ghost" size="sm">← العودة</Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">المخيمات الطبية</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {camps.map((camp) => (
              <Card key={camp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  <img 
                    src={camp.image} 
                    alt={camp.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg">{camp.name}</h3>
                  </div>
                </div>
                <CardHeader>
                  <CardDescription className="text-base">{camp.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{camp.startDate} إلى {camp.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{camp.location}</span>
                  </div>
                  <Link href={`/booking/${camp.formId}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      احجز الآن
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
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
