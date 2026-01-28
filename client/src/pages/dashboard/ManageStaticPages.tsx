import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ManageStaticPages() {
  const { data: pages, isLoading, refetch } = trpc.staticPages.list.useQuery();
  const createPage = trpc.staticPages.create.useMutation();
  const updatePage = trpc.staticPages.update.useMutation();
  const deletePage = trpc.staticPages.delete.useMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    image: "",
    isPublished: 1,
    isVisible: 1,
    order: 0,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updatePage.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("تم تحديث الصفحة بنجاح");
      } else {
        await createPage.mutateAsync(formData);
        toast.success("تم إضافة الصفحة بنجاح");
      }

      setFormData({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        image: "",
        isPublished: 1,
        isVisible: 1,
        order: 0,
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        canonicalUrl: "",
      });
      setEditingId(null);
      setIsOpen(false);
      refetch();
    } catch (error) {
      toast.error("حدث خطأ في العملية");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الصفحة؟")) return;

    try {
      await deletePage.mutateAsync({ id });
      toast.success("تم حذف الصفحة بنجاح");
      refetch();
    } catch (error) {
      toast.error("حدث خطأ في الحذف");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إدارة الصفحات الثابتة</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              إضافة صفحة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "تعديل الصفحة" : "إضافة صفحة جديدة"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="العنوان"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                placeholder="URL Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
              <Textarea
                placeholder="المحتوى (يدعم Markdown)"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={6}
              />
              <Textarea
                placeholder="الملخص"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
              <Input
                placeholder="رابط الصورة"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">الترتيب</label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">الحالة</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: parseInt(e.target.value) })}
                  >
                    <option value={1}>منشورة</option>
                    <option value={0}>مسودة</option>
                  </select>
                </div>
              </div>
              <Input
                placeholder="SEO Meta Title"
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              />
              <Input
                placeholder="SEO Meta Description"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              />
              <Input
                placeholder="SEO Keywords"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
              />
              <Input
                placeholder="Canonical URL"
                value={formData.canonicalUrl}
                onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
              />
              <Button type="submit" className="w-full">
                {editingId ? "تحديث" : "إضافة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الصفحات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>الـ Slug</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages?.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>
                    {page.isPublished ? "منشورة" : "مسودة"}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          title: page.title,
                          slug: page.slug,
                          content: page.content,
                          excerpt: page.excerpt || "",
                          image: page.image || "",
                          isPublished: page.isPublished,
                          isVisible: page.isVisible,
                          order: page.order,
                          metaTitle: page.metaTitle || "",
                          metaDescription: page.metaDescription || "",
                          metaKeywords: page.metaKeywords || "",
                          canonicalUrl: page.canonicalUrl || "",
                        });
                        setEditingId(page.id);
                        setIsOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
