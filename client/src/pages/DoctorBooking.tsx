import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Clock, MapPin } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
  experience: string;
  location: string;
}

const doctors: Doctor[] = [
  {
    id: 1,
    name: "د. محمد علي",
    specialty: "جراح القلب",
    image: "https://via.placeholder.com/300x300?text=د.+محمد+علي",
    experience: "15 سنة خبرة",
    location: "عيادة القلب - الطابق الثالث",
  },
  {
    id: 2,
    name: "د. فاطمة أحمد",
    specialty: "طبيبة الأسنان",
    image: "https://via.placeholder.com/300x300?text=د.+فاطمة+أحمد",
    experience: "10 سنوات خبرة",
    location: "عيادة الأسنان - الطابق الأول",
  },
];

export default function DoctorBooking() {
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
          <h1 className="text-2xl font-bold text-slate-900">حجز الأطباء</h1>
          <div></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{doctor.name}</CardTitle>
                  <CardDescription className="text-base text-blue-600 font-semibold">{doctor.specialty}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{doctor.experience}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{doctor.location}</span>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled>
                    قريباً
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Coming Soon Message */}
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">قيد التطوير</CardTitle>
                <CardDescription className="text-blue-700">
                  سيتم إضافة المزيد من الأطباء والخدمات قريباً
                </CardDescription>
              </CardHeader>
            </Card>
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
