import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Heart, Users, Award, Building2, Stethoscope, Zap } from "lucide-react";

export default function About() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">عن المستشفى السعودي الألماني</h1>
          <p className="text-xl opacity-90">رعاية صحية متميزة بمعايير عالمية</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* About Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">نبذة عن المستشفى</h2>
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                المستشفى السعودي الألماني - صنعاء هو مؤسسة طبية رائدة تجمع بين الخبرة الألمانية والكفاءة السعودية لتقديم أفضل الخدمات الصحية للمرضى في صنعاء والمناطق المحيطة.
              </p>
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                نحن ملتزمون بتقديم رعاية صحية عالية الجودة باستخدام أحدث التقنيات الطبية والمعدات الحديثة، مع الحفاظ على أعلى معايير السلامة والنظافة.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                فريقنا الطبي المتخصص يعمل بكل إخلاص لضمان رضا المرضى وتحسين صحتهم بشكل مستمر.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-8 flex items-center justify-center h-96">
              <div className="text-center">
                <Building2 className="w-32 h-32 text-green-600 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">مستشفى حديث ومتطور</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">قيمنا الأساسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <Heart className="w-12 h-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">الرعاية والعناية</h3>
              <p className="text-gray-700">
                نضع صحة المريض في المقام الأول ونقدم رعاية شاملة وإنسانية لكل مريض.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <Stethoscope className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">الكفاءة الطبية</h3>
              <p className="text-gray-700">
                فريق طبي متخصص وذو خبرة عالية يستخدم أحدث الطرق العلاجية.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <Award className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">الجودة والتميز</h3>
              <p className="text-gray-700">
                نلتزم بأعلى معايير الجودة والسلامة في جميع خدماتنا الطبية.
              </p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">خدماتنا الطبية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start">
              <Zap className="w-8 h-8 text-green-600 mt-1 ml-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">جراحة القلب والقسطرة</h3>
                <p className="text-gray-700">خدمات متخصصة في تشخيص وعلاج أمراض القلب بأحدث التقنيات.</p>
              </div>
            </div>

            <div className="flex items-start">
              <Zap className="w-8 h-8 text-green-600 mt-1 ml-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">الجراحة العامة</h3>
                <p className="text-gray-700">فريق جراحي متخصص يقدم خدمات جراحية شاملة وآمنة.</p>
              </div>
            </div>

            <div className="flex items-start">
              <Zap className="w-8 h-8 text-green-600 mt-1 ml-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">الطب الباطني</h3>
                <p className="text-gray-700">تشخيص وعلاج الأمراض الداخلية بخبرة واختصاص عالي.</p>
              </div>
            </div>

            <div className="flex items-start">
              <Zap className="w-8 h-8 text-green-600 mt-1 ml-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">طب الأسنان</h3>
                <p className="text-gray-700">خدمات طب الأسنان الحديثة والعلاجات التجميلية.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">فريقنا الطبي</h2>
          <div className="flex items-center justify-center mb-6">
            <Users className="w-16 h-16 text-green-600" />
          </div>
          <p className="text-gray-700 text-lg text-center mb-6">
            يتكون فريقنا من أطباء متخصصين وممرضات ذوات خبرة عالية، مكرسات لتقديم أفضل رعاية صحية لمرضانا الكرام.
          </p>
          <p className="text-gray-700 text-center">
            جميع أعضاء الفريق يتمتعون بشهادات عالمية وخبرة عملية واسعة في مجالات تخصصهم.
          </p>
        </section>

        {/* Contact Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">تواصل معنا</h2>
          <p className="text-gray-700 text-lg mb-8">
            هل لديك أي استفسارات أو تريد حجز موعد؟ نحن هنا لمساعدتك.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate("/")}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
            >
              احجز موعدك الآن
            </Button>
            <Button 
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-lg font-semibold"
            >
              اتصل بنا: 967-1-XXX-XXX
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 المستشفى السعودي الألماني - صنعاء. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </div>
  );
}
