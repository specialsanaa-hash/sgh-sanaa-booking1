import { Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Loader2, Eye, Edit2, Trash2, Plus, Search, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function FormsManagementPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Queries
  const { data: forms, isLoading, refetch } = trpc.forms.listByCampaign.useQuery(1, {
    enabled: !!user,
  });

  // Mutations
  const deleteFormMutation = trpc.forms.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف النموذج بنجاح");
      setShowDeleteDialog(false);
      setSelectedFormId(null);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const updateFormMutation = trpc.forms.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث النموذج بنجاح");
      setEditingForm(null);
      refetch();
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const handleDelete = (id: number) => {
    setSelectedFormId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedFormId) {
      deleteFormMutation.mutate(selectedFormId);
    }
  };

  const handleEdit = (form: any) => {
    setEditingForm(form);
    setEditTitle(form.title);
    setEditDescription(form.description || "");
  };

  const handleSaveEdit = () => {
    if (editingForm) {
      updateFormMutation.mutate({
        id: editingForm.id,
        title: editTitle,
        description: editDescription,
      });
    }
  };

  const filteredForms = forms?.filter((form: any) =>
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">إدارة النماذج</h1>
            <p className="text-gray-600">إنشاء وتحرير وإدارة نماذج الحجز</p>
          </div>
          <Link href="/dashboard/forms/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              نموذج جديد
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث عن النماذج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.length > 0 ? (
            filteredForms.map((form: any) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{form.title}</CardTitle>
                      <CardDescription className="mt-1">{form.description}</CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      form.isActive === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {form.isActive === 1 ? "نشط" : "غير نشط"}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">رقم النموذج:</span> #{form.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">التاريخ:</span> {new Date(form.createdAt).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/forms/${form.id}/preview`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        معاينة
                      </Button>
                    </Link>
                    <Dialog open={editingForm?.id === form.id} onOpenChange={(open) => {
                      if (!open) setEditingForm(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(form)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          تحرير
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>تحرير النموذج</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">العنوان</label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="عنوان النموذج"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">الوصف</label>
                            <Input
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="وصف النموذج"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setEditingForm(null)}
                            >
                              إلغاء
                            </Button>
                            <Button
                              onClick={handleSaveEdit}
                              disabled={updateFormMutation.isPending}
                            >
                              {updateFormMutation.isPending ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  جاري الحفظ...
                                </>
                              ) : (
                                "حفظ"
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(form.id)}
                      disabled={deleteFormMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <p className="text-lg">لا توجد نماذج</p>
              <p className="text-sm">ابدأ بإنشاء نموذج جديد</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تأكيد الحذف</DialogTitle>
              <DialogDescription>
                هل أنت متأكد من أنك تريد حذف هذا النموذج؟ سيتم حذف جميع الحقول والبيانات المرتبطة به.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteFormMutation.isPending}
              >
                {deleteFormMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  "حذف"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
