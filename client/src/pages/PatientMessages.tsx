import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, AlertCircle, Search, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PatientMessages() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = trpc.patients.getMessages.useQuery({ limit: 100 });
  const sendMessageMutation = trpc.patients.sendMessage.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/patient/auth");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) {
      toast.error("الرجاء إدخال الرسالة");
      return;
    }

    if (!selectedDoctorId) {
      toast.error("الرجاء اختيار طبيب");
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        doctorId: selectedDoctorId,
        subject: "رسالة من المريض",
        content: messageText,
      });

      toast.success("تم إرسال الرسالة بنجاح");
      setMessageText("");
      messagesQuery.refetch();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة");
    }
  };

  // تجميع الرسائل حسب الطبيب
  const messagesByDoctor = messagesQuery.data?.reduce((acc: any, msg: any): any => {
    const key = msg.doctorId || "unknown";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(msg);
    return acc;
  }, {}) || {};

  const doctors = Object.keys(messagesByDoctor).map((doctorId) => ({
    id: parseInt(doctorId),
    messages: messagesByDoctor[doctorId],
  }));

  const selectedDoctor = selectedDoctorId ? doctors.find((d) => d.id === selectedDoctorId) : null;
  const selectedMessages = selectedDoctor?.messages || [];

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* رأس الصفحة */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">الرسائل</h1>
              <p className="text-gray-600 mt-1">التواصل مع الأطباء</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation("/patient/dashboard")}
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* قائمة الأطباء */}
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">الأطباء</CardTitle>
              <div className="mt-3 relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن طبيب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-3 pr-9"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {messagesQuery.isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : doctors.length > 0 ? (
                <div className="space-y-2 p-4">
                  {doctors.map((doctor) => (
                    <button
                      key={doctor.id}
                      onClick={() => setSelectedDoctorId(doctor.id)}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        selectedDoctorId === doctor.id
                          ? "bg-blue-100 border-2 border-blue-500"
                          : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">الطبيب #{doctor.id}</p>
                          <p className="text-xs text-gray-600">
                            {doctor.messages.length} رسالة
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>لا توجد رسائل</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* منطقة الرسائل */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            {selectedDoctor ? (
              <>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-lg">الطبيب #{selectedDoctor.id}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedMessages.length > 0 ? (
                    <>
                      {selectedMessages.map((message: any) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderType === "patient" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.senderType === "patient"
                                ? "bg-blue-100 text-blue-900"
                                : "bg-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.createdAt).toLocaleTimeString("ar-SA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>لا توجد رسائل مع هذا الطبيب</p>
                    </div>
                  )}
                </CardContent>

                {/* نموذج الرسالة */}
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <Textarea
                      placeholder="اكتب رسالتك..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="min-h-20 resize-none"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={sendMessageMutation.isPending || !messageText.trim()}
                    >
                      {sendMessageMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          إرسال
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>اختر طبيباً لبدء المحادثة</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
