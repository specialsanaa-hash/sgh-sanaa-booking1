import { useParams, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FormPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const formId = parseInt(id || "0");
  const [showPreview, setShowPreview] = useState(true);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Queries
  const { data: form, isLoading: formLoading } = trpc.forms.getById.useQuery(formId, {
    enabled: !!formId,
  });

  const { data: fields, isLoading: fieldsLoading } = trpc.formFields.list.useQuery(formId, {
    enabled: !!formId,
  });

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const renderField = (field: any) => {
    const value = formData[field.fieldName] || "";
    const commonProps = {
      id: field.fieldName,
      value,
      onChange: (e: any) => handleInputChange(field.fieldName, e.target.value),
      placeholder: field.placeholder,
      required: field.isRequired === 1,
    };

    switch (field.fieldType) {
      case "text":
        return <Input {...commonProps} type="text" />;
      case "email":
        return <Input {...commonProps} type="email" />;
      case "phone":
        return <Input {...commonProps} type="tel" />;
      case "number":
        return <Input {...commonProps} type="number" />;
      case "date":
        return <Input {...commonProps} type="date" />;
      case "textarea":
        return <Textarea {...commonProps} />;
      case "select":
        const options = field.options ? field.options.split(",").map((opt: string) => opt.trim()) : [];
        return (
          <Select value={value} onValueChange={(val) => handleInputChange(field.fieldName, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "اختر خياراً"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  if (formLoading || fieldsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!form) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">لم يتم العثور على النموذج</h2>
            <Link href="/dashboard">
              <Button>العودة</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">معاينة النموذج</h1>
              <p className="text-gray-600">{form.title}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                إخفاء المعاينة
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                عرض المعاينة
              </>
            )}
          </Button>
        </div>

        {/* Form Preview */}
        {showPreview && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">معاينة النموذج</CardTitle>
              <CardDescription>هذا هو شكل النموذج كما سيراه المستخدمون</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 p-6 bg-white rounded-lg border">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{form.title}</h2>
                  {form.description && <p className="text-gray-600">{form.description}</p>}
                </div>

                <div className="space-y-4">
                  {fields && fields.length > 0 ? (
                    fields.map((field: any) => (
                      <div key={field.id}>
                        <Label htmlFor={field.fieldName}>
                          {field.label}
                          {field.isRequired === 1 && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="mt-2">
                          {renderField(field)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>لا توجد حقول في هذا النموذج</p>
                    </div>
                  )}
                </div>

                <Button className="w-full">إرسال</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات النموذج</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">عنوان النموذج</label>
                <p className="text-lg font-semibold">{form.title}</p>
              </div>
              {form.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">الوصف</label>
                  <p className="text-lg">{form.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600">عدد الحقول</label>
                <p className="text-lg font-semibold">{fields?.length || 0} حقل</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">الحالة</label>
                <p className={`text-lg font-semibold ${form.isActive === 1 ? "text-green-600" : "text-red-600"}`}>
                  {form.isActive === 1 ? "نشط" : "غير نشط"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
