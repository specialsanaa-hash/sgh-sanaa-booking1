import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface FormField {
  id: number;
  fieldName: string;
  fieldType: string;
  label: string;
  isRequired: number;
  placeholder: string | null;
  options: string | null;
  order: number;
  formId: number;
  createdAt: Date;
}

export default function Booking() {
  const params = useParams();
  const formId = params.formId ? parseInt(params.formId) : null;
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { data: form, isLoading: formLoading } = trpc.forms.getById.useQuery(formId || 0, {
    enabled: !!formId,
  });

  const { data: fields, isLoading: fieldsLoading } = trpc.formFields.list.useQuery(formId || 0, {
    enabled: !!formId,
  });

  const createBooking = trpc.bookings.create.useMutation();
  const createResponse = trpc.formResponses.create.useMutation();

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formId || !form) {
      toast.error("خطأ: لم يتم العثور على النموذج");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking
      const bookingResult = await createBooking.mutateAsync({
        formId,
        campaignId: form.campaignId,
        patientName: formData.patientName || "",
        patientEmail: formData.patientEmail || "",
        patientPhone: formData.patientPhone || "",
      });

      const bookingId = (bookingResult as any).id || (bookingResult as any).insertId || 0;

      // Create form responses
      if (fields) {
        for (const field of fields) {
          if (formData[field.fieldName]) {
            await createResponse.mutateAsync({
              bookingId,
              fieldId: field.id,
              value: formData[field.fieldName],
            });
          }
        }
      }

      setIsSuccess(true);
      toast.success("تم تقديم الحجز بنجاح! سيتم التواصل معك قريباً.");
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({});
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("حدث خطأ أثناء تقديم الحجز. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formLoading || fieldsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">لم يتم العثور على النموذج المطلوب.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-2xl">
        {isSuccess ? (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-900">تم تقديم الحجز بنجاح!</CardTitle>
              <CardDescription className="text-green-700">
                شكراً لك على اختيارك المستشفى السعودي الألماني. سيتم التواصل معك قريباً لتأكيد موعدك.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{form.title}</CardTitle>
              {form.description && (
                <CardDescription>{form.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {fields && fields.length > 0 ? (
                  fields
                    .sort((a, b) => a.order - b.order)
                    .map((field: FormField) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.fieldName}>
                          {field.label}
                          {field.isRequired === 1 && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        
                        {field.fieldType === "text" && (
                          <Input
                            id={field.fieldName}
                            type="text"
                            placeholder={field.placeholder || ""}
                            value={formData[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            required={field.isRequired === 1}
                          />
                        )}
                        
                        {field.fieldType === "email" && (
                          <Input
                            id={field.fieldName}
                            type="email"
                            placeholder={field.placeholder || ""}
                            value={formData[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            required={field.isRequired === 1}
                          />
                        )}
                        
                        {field.fieldType === "phone" && (
                          <Input
                            id={field.fieldName}
                            type="tel"
                            placeholder={field.placeholder || ""}
                            value={formData[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            required={field.isRequired === 1}
                          />
                        )}
                        
                        {field.fieldType === "number" && (
                          <Input
                            id={field.fieldName}
                            type="number"
                            placeholder={field.placeholder || ""}
                            value={formData[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            required={field.isRequired === 1}
                          />
                        )}
                        
                        {field.fieldType === "date" && (
                          <Input
                            id={field.fieldName}
                            type="date"
                            value={formData[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            required={field.isRequired === 1}
                          />
                        )}
                        
                        {field.fieldType === "textarea" && (
                          <Textarea
                            id={field.fieldName}
                            placeholder={field.placeholder || ""}
                            value={formData[field.fieldName] || ""}
                            onChange={(e) => handleInputChange(field.fieldName, e.target.value)}
                            required={field.isRequired === 1}
                            rows={4}
                          />
                        )}
                        
                        {field.fieldType === "select" && field.options && (
                          <Select value={formData[field.fieldName] || ""} onValueChange={(value) => handleInputChange(field.fieldName, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder={field.placeholder || "اختر خياراً"} />
                            </SelectTrigger>
                            <SelectContent>
                              {JSON.parse(field.options).map((option: string) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))
                ) : (
                  <p className="text-slate-600">لا توجد حقول في هذا النموذج.</p>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التقديم...
                    </>
                  ) : (
                    "تقديم الحجز"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
