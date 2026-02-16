import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ArrowRight, Send, MessageCircle, Phone } from "lucide-react";

interface Message {
  id: string;
  phoneNumber: string;
  messageText: string;
  messageType: "SMS" | "WhatsApp";
  direction: "sent" | "received";
  status: string;
  createdAt: string;
}

export default function SendMessages() {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<"SMS" | "WhatsApp">("SMS");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<"all" | "sent" | "received">("all");

  // تحميل الرسائل من localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  const handleSendMessage = async () => {
    if (!phoneNumber || !messageText) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsSending(true);
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        phoneNumber,
        messageText,
        messageType,
        direction: "sent",
        status: "sent",
        createdAt: new Date().toISOString(),
      };

      const updatedMessages = [newMessage, ...messages];
      setMessages(updatedMessages);
      localStorage.setItem("messages", JSON.stringify(updatedMessages));

      toast.success(`تم إرسال الرسالة عبر ${messageType} بنجاح`);
      setPhoneNumber("");
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setIsSending(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === "all") return true;
    return msg.direction === filter;
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ArrowRight className="w-4 h-4" />
          العودة إلى لوحة التحكم
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">إرسال الرسائل</h1>
          <p className="text-muted-foreground">
            أرسل رسائل نصية عبر SMS أو WhatsApp
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نموذج الإرسال */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  إرسال رسالة جديدة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    رقم الهاتف
                  </label>
                  <Input
                    type="tel"
                    placeholder="966501234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    نوع الرسالة
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={messageType === "SMS" ? "default" : "outline"}
                      onClick={() => setMessageType("SMS")}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 ml-2" />
                      SMS
                    </Button>
                    <Button
                      variant={messageType === "WhatsApp" ? "default" : "outline"}
                      onClick={() => setMessageType("WhatsApp")}
                      className="flex-1"
                    >
                      <MessageCircle className="w-4 h-4 ml-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    نص الرسالة
                  </label>
                  <Textarea
                    placeholder="أدخل نص الرسالة هنا..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {messageText.length} / 160 حرف
                  </p>
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? "جاري الإرسال..." : "إرسال الرسالة"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* سجل الرسائل */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>سجل الرسائل</CardTitle>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                  >
                    الكل ({messages.length})
                  </Button>
                  <Button
                    variant={filter === "sent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("sent")}
                  >
                    مرسلة ({messages.filter((m) => m.direction === "sent").length})
                  </Button>
                  <Button
                    variant={filter === "received" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("received")}
                  >
                    واردة ({messages.filter((m) => m.direction === "received").length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      لا توجد رسائل
                    </p>
                  ) : (
                    filteredMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg border ${
                          msg.direction === "sent"
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-sm">
                              {msg.phoneNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {msg.messageType} • {msg.direction === "sent" ? "مرسلة" : "واردة"}
                            </p>
                          </div>
                          <span className="text-xs bg-white px-2 py-1 rounded">
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{msg.messageText}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
