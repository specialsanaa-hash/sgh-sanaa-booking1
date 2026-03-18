import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, MessageSquare, Send, Smartphone } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * قوالب الرسائل الافتراضية
 */
const messageTemplates = [
  {
    id: "booking_confirmed",
    name: "تأكيد الحجز",
    category: "booking",
    template:
      "مرحباً {patientName}، تم تأكيد حجزك مع المستشفى السعودي الألماني - صنعاء للموعد في {appointmentDate}. رقم الحجز: {bookingId}",
    variables: ["patientName", "appointmentDate", "bookingId"],
  },
  {
    id: "booking_cancelled",
    name: "إلغاء الحجز",
    category: "booking",
    template:
      "مرحباً {patientName}، تم إلغاء حجزك مع المستشفى السعودي الألماني - صنعاء. رقم الحجز: {bookingId}",
    variables: ["patientName", "bookingId"],
  },
  {
    id: "booking_completed",
    name: "اكتمال الحجز",
    category: "booking",
    template:
      "شكراً {patientName} على زيارتك المستشفى السعودي الألماني - صنعاء. نتمنى لك الشفاء العاجل. رقم الحجز: {bookingId}",
    variables: ["patientName", "bookingId"],
  },
  {
    id: "booking_reminder",
    name: "تذكير الموعد",
    category: "reminder",
    template:
      "تذكير: لديك موعد مع المستشفى السعودي الألماني - صنعاء في {appointmentDate}. رقم الحجز: {bookingId}",
    variables: ["appointmentDate", "bookingId"],
  },
];

export default function AutoMessages() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<string>("");
  const [testPhone, setTestPhone] = useState("");
  const [testVariables, setTestVariables] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const currentTemplate = messageTemplates.find((t) => t.id === selectedTemplate);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = messageTemplates.find((t) => t.id === templateId);
    if (template) {
      setEditedTemplate(template.template);
      // Initialize test variables
      const vars: Record<string, string> = {};
      template.variables.forEach((v) => {
        vars[v] = "";
      });
      setTestVariables(vars);
    }
  };

  const replaceVariables = (text: string, variables: Record<string, string>) => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    });
    return result;
  };

  const previewMessage = currentTemplate
    ? replaceVariables(editedTemplate, testVariables)
    : "";

  const sendTestMutation = trpc.messaging.sendTestMessage.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "فشل إرسال الرسالة");
    },
  });

  const handleSendTest = async () => {
    if (!testPhone || !currentTemplate) return;

    sendTestMutation.mutate({
      phoneNumber: testPhone,
      message: previewMessage,
      type: "whatsapp",
    });
  };

  const sendQuickTestMutation = trpc.messaging.sendTestMessage.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message || "فشل إرسال الرسالة");
    },
  });

  const handleSendQuickTest = (messageType: "whatsapp" | "sms") => {
    const phoneNumber = "773171477";
    const testMessage = `رسالة اختبار ${messageType === "whatsapp" ? "واتس آب" : "SMS"} من منصة حجز المستشفى السعودي الألماني - صنعاء`;

    sendQuickTestMutation.mutate({
      phoneNumber: phoneNumber,
      message: testMessage,
      type: messageType,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">الرسائل التلقائية</h1>
        <p className="text-gray-600 mt-2">إدارة قوالب الرسائل التلقائية للحجوزات والتنبيهات</p>
      </div>

      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertDescription>
          يتم إرسال الرسائل التلقائية تلقائياً عند تغيير حالة الحجز. يمكنك تخصيص محتوى الرسائل هنا.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة القوالب */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">القوالب المتاحة</CardTitle>
              <CardDescription>اختر قالب لتعديله</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {messageTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`w-full text-right p-3 rounded-lg border-2 transition-all ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                    {selectedTemplate === template.id && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* محرر القالب */}
        <div className="lg:col-span-2 space-y-6">
          {currentTemplate ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>{currentTemplate.name}</CardTitle>
                  <CardDescription>تعديل محتوى الرسالة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      محتوى الرسالة
                    </label>
                    <Textarea
                      value={editedTemplate}
                      onChange={(e) => setEditedTemplate(e.target.value)}
                      placeholder="أدخل محتوى الرسالة"
                      rows={6}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المتغيرات المتاحة
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {currentTemplate.variables.map((variable) => (
                        <Badge key={variable} variant="secondary">
                          {"{" + variable + "}"}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="w-full"
                  >
                    {showPreview ? "إخفاء المعاينة" : "عرض المعاينة"}
                  </Button>
                </CardContent>
              </Card>

              {/* قسم الاختبار */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">اختبار الرسالة</CardTitle>
                  <CardDescription>أدخل بيانات الاختبار لمعاينة الرسالة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* حقول المتغيرات */}
                  <div className="space-y-3">
                    {currentTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {variable}
                        </label>
                        <Input
                          type="text"
                          placeholder={`أدخل قيمة ${variable}`}
                          value={testVariables[variable] || ""}
                          onChange={(e) =>
                            setTestVariables({
                              ...testVariables,
                              [variable]: e.target.value,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* رقم الهاتف للاختبار */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهاتف للاختبار
                    </label>
                    <Input
                      type="tel"
                      placeholder="+967123456789"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                    />
                  </div>

                  {/* معاينة الرسالة */}
                  {showPreview && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">معاينة الرسالة:</p>
                      <p className="text-sm text-gray-900 leading-relaxed">{previewMessage}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        عدد الأحرف: {previewMessage.length}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleSendTest}
                    disabled={!testPhone || sendTestMutation.isPending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 ml-2" />
                    {sendTestMutation.isPending ? "جاري الإرسال..." : "إرسال رسالة اختبار"}
                  </Button>
                </CardContent>
              </Card>

              {/* قسم الاختبار السريع */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    اختبار سريع - الرقم اليمني 773171477
                  </CardTitle>
                  <CardDescription>إرسال رسائل اختبار فورية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleSendQuickTest("whatsapp")}
                      disabled={sendQuickTestMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 ml-2" />
                      {sendQuickTestMutation.isPending ? "جاري..." : "إرسال WhatsApp"}
                    </Button>
                    <Button
                      onClick={() => handleSendQuickTest("sms")}
                      disabled={sendQuickTestMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 ml-2" />
                      {sendQuickTestMutation.isPending ? "جاري..." : "إرسال SMS"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* معلومات إضافية */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>ملاحظة:</strong> التغييرات التي تجريها هنا ستؤثر على جميع الرسائل المرسلة
                  مستقبلاً. تأكد من صحة المحتوى قبل الحفظ.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-gray-500">اختر قالب من القائمة لتعديله</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
