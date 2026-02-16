import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowRight, Save } from "lucide-react";

export default function MessageSettings() {
  const [, setLocation] = useLocation();
  const [settings, setSettings] = useState({
    platformUrl: "https://platform.example.com",
    socketUrl: "https://socket.example.com",
    apiKey: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!settings.platformUrl || !settings.socketUrl || !settings.apiKey) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSaving(true);
    try {
      localStorage.setItem("messageSettings", JSON.stringify(settings));
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى لوحة التحكم
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">إعدادات الرسائل</h1>
          <p className="text-muted-foreground">
            قم بربط تطبيق الرسائل (WhatsApp و SMS) بالمنصة
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>بيانات الاتصال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                رابط المنصة (Platform URL)
              </label>
              <Input
                type="url"
                placeholder="https://platform.example.com"
                value={settings.platformUrl}
                onChange={(e) =>
                  setSettings({ ...settings, platformUrl: e.target.value })
                }
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                الرابط الذي سيتم استخدامه لربط تطبيق الرسائل بالمنصة
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                رابط Socket.io
              </label>
              <Input
                type="url"
                placeholder="https://socket.example.com"
                value={settings.socketUrl}
                onChange={(e) =>
                  setSettings({ ...settings, socketUrl: e.target.value })
                }
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground mt-1">
                رابط Socket.io للاتصال الفوري مع التطبيق
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                مفتاح API
              </label>
              <Input
                type="password"
                placeholder="أدخل مفتاح API"
                value={settings.apiKey}
                onChange={(e) =>
                  setSettings({ ...settings, apiKey: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                مفتاح API الخاص بتطبيق الرسائل
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">ملاحظات مهمة:</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>تأكد من أن رابط Socket.io صحيح وآمن (HTTPS)</li>
                <li>سيتم حفظ الرابط محلياً على الجهاز</li>
                <li>التطبيق سيعمل في الخلفية بعد الاتصال</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
              >
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
