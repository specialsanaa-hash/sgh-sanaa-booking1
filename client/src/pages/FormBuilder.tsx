import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface FormFieldData {
  fieldName: string;
  fieldType: "text" | "email" | "phone" | "number" | "select" | "textarea" | "date";
  label: string;
  isRequired: number;
  placeholder: string;
  options: string;
  order: number;
}

export default function FormBuilder() {
  const params = useParams();
  const formId = params.formId ? parseInt(params.formId) : null;

  const [newField, setNewField] = useState<FormFieldData>({
    fieldName: "",
    fieldType: "text",
    label: "",
    isRequired: 1,
    placeholder: "",
    options: "",
    order: 0,
  });

  // Queries
  const { data: form, isLoading: formLoading } = trpc.forms.getById.useQuery(formId || 0, {
    enabled: !!formId,
  });

  const { data: fields, isLoading: fieldsLoading } = trpc.formFields.list.useQuery(formId || 0, {
    enabled: !!formId,
  });

  // Mutations
  const createFieldMutation = trpc.formFields.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الحقل بنجاح");
      setNewField({
        fieldName: "",
        fieldType: "text",
        label: "",
        isRequired: 1,
        placeholder: "",
        options: "",
        order: (fields?.length || 0) + 1,
      });
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const deleteFieldMutation = trpc.formFields.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحقل بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleAddField = async () => {
    if (!formId || !newField.fieldName || !newField.label) {
      toast.error("يرجى ملء الحقول المطلوبة");
      return;
    }

    await createFieldMutation.mutateAsync({
      formId,
      ...newField,
      order: fields?.length || 0,
    });
  };

  const handleDeleteField = async (fieldId: number) => {
    if (confirm("هل تريد حذف هذا الحقل؟")) {
      await deleteFieldMutation.mutateAsync(fieldId);
    }
  };

  if (formLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!form) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>خطأ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">لم يتم العثور على النموذج المطلوب.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{form.title}</h1>
            <p className="text-slate-600 mt-1">{form.description}</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            معاينة النموذج
          </Button>
        </div>

        {/* Add New Field */}
        <Card>
          <CardHeader>
            <CardTitle>إضافة حقل جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field-name">اسم الحقل</Label>
                <Input
                  id="field-name"
                  value={newField.fieldName}
                  onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })}
                  placeholder="مثال: patientAge"
                />
              </div>
              <div>
                <Label htmlFor="field-label">تسمية الحقل</Label>
                <Input
                  id="field-label"
                  value={newField.label}
                  onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  placeholder="مثال: العمر"
                />
              </div>
              <div>
                <Label htmlFor="field-type">نوع الحقل</Label>
                <Select value={newField.fieldType} onValueChange={(value: any) => setNewField({ ...newField, fieldType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">نص</SelectItem>
                    <SelectItem value="email">بريد إلكتروني</SelectItem>
                    <SelectItem value="phone">هاتف</SelectItem>
                    <SelectItem value="number">رقم</SelectItem>
                    <SelectItem value="date">تاريخ</SelectItem>
                    <SelectItem value="textarea">نص طويل</SelectItem>
                    <SelectItem value="select">قائمة اختيار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="field-placeholder">النص التوضيحي</Label>
                <Input
                  id="field-placeholder"
                  value={newField.placeholder}
                  onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                  placeholder="مثال: أدخل عمرك"
                />
              </div>
              {newField.fieldType === "select" && (
                <div className="md:col-span-2">
                  <Label htmlFor="field-options">الخيارات (مفصولة بفواصل)</Label>
                  <Input
                    id="field-options"
                    value={newField.options}
                    onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                    placeholder="مثال: خيار 1, خيار 2, خيار 3"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="field-required"
                  checked={newField.isRequired === 1}
                  onCheckedChange={(checked) => setNewField({ ...newField, isRequired: checked ? 1 : 0 })}
                />
                <Label htmlFor="field-required">حقل مطلوب</Label>
              </div>
              <Button
                onClick={handleAddField}
                disabled={createFieldMutation.isPending}
                className="md:col-span-2 gap-2"
              >
                <Plus className="h-4 w-4" />
                {createFieldMutation.isPending ? "جاري الإضافة..." : "إضافة الحقل"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fields List */}
        <Card>
          <CardHeader>
            <CardTitle>الحقول المضافة</CardTitle>
            <CardDescription>
              {fieldsLoading ? "جاري التحميل..." : `${fields?.length || 0} حقول`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fieldsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : fields && fields.length > 0 ? (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{field.label}</div>
                      <div className="text-sm text-slate-600">
                        النوع: {
                          field.fieldType === "text" ? "نص" :
                          field.fieldType === "email" ? "بريد إلكتروني" :
                          field.fieldType === "phone" ? "هاتف" :
                          field.fieldType === "number" ? "رقم" :
                          field.fieldType === "date" ? "تاريخ" :
                          field.fieldType === "textarea" ? "نص طويل" :
                          field.fieldType === "select" ? "قائمة اختيار" : field.fieldType
                        }
                        {field.isRequired === 1 && " • مطلوب"}
                      </div>
                      {field.placeholder && (
                        <div className="text-sm text-slate-500">النص التوضيحي: {field.placeholder}</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteField(field.id)}
                      disabled={deleteFieldMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">لا توجد حقول حالياً. أضف حقلاً جديداً للبدء.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
