import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2, Edit2, Plus, Search, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
  });

  // جلب المستخدمين من قاعدة البيانات
  const { data: usersData, isLoading: isLoadingUsers, refetch: refetchUsers } = trpc.auth.getAllUsers.useQuery();

  // بيانات المستخدمين
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  // تصفية المستخدمين
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
    });
    setIsAddingUser(false);
    setIsDialogOpen(true);
  };

  const updateUserMutation = trpc.auth.updateUser.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المستخدم بنجاح");
      refetchUsers();
      setIsDialogOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث المستخدم");
    },
  });

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        name: formData.name,
        email: formData.email,
        role: formData.role as "admin" | "user",
      });
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUserMutation = trpc.auth.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      refetchUsers();
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء حذف المستخدم");
    },
  });

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      await deleteUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleAddNewUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
    });
    setIsAddingUser(true);
    setIsDialogOpen(true);
  };

  const createUserMutation = trpc.auth.createUser.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المستخدم بنجاح");
      refetchUsers();
      setIsDialogOpen(false);
      setIsAddingUser(false);
      setFormData({ name: "", email: "", role: "user" });
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة المستخدم");
    },
  });

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      await createUserMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        role: formData.role as "admin" | "user",
      });
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";
  };

  const getRoleLabel = (role: string) => {
    return role === "admin" ? "مسؤول" : "مستخدم";
  };

  if (isLoadingUsers) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">جاري تحميل المستخدمين...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 rtl p-4 md:p-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 pb-4 md:pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                  className="hover:bg-slate-100"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl md:text-4xl font-bold text-slate-900">إدارة المستخدمين</h1>
              </div>
              <p className="text-sm md:text-base text-slate-600 mt-2">إدارة المستخدمين والصلاحيات</p>
            </div>
          </div>
        </div>

        {/* شريط البحث والفلترة */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث عن مستخدم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الدور" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="admin">مسؤول</SelectItem>
                  <SelectItem value="user">مستخدم</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Dialog open={isDialogOpen && isAddingUser} onOpenChange={(open) => {
                  if (!open) {
                    setIsAddingUser(false);
                  }
                  setIsDialogOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleAddNewUser}
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة مستخدم جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rtl">
                    <DialogHeader>
                      <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                      <DialogDescription>
                        أضف مستخدم جديد إلى النظام
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-name">الاسم *</Label>
                        <Input
                          id="new-name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="أدخل اسم المستخدم"
                          className="text-right mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-email">البريد الإلكتروني *</Label>
                        <Input
                          id="new-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="أدخل البريد الإلكتروني"
                          className="text-right mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-role">الدور *</Label>
                        <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">مستخدم</SelectItem>
                            <SelectItem value="admin">مسؤول</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={handleCreateUser}
                        >
                          إضافة المستخدم
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setIsDialogOpen(false);
                            setIsAddingUser(false);
                          }}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول المستخدمين */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة المستخدمين</CardTitle>
            <CardDescription>
              عدد المستخدمين: {filteredUsers.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد مستخدمين</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">الاسم</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">البريد الإلكتروني</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">الدور</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">طريقة الدخول</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">تاريخ الإنشاء</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-semibold text-blue-600">
                                {u.name?.[0] || "U"}
                              </span>
                            </div>
                            {u.name}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(u.role)}`}>
                            {getRoleLabel(u.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {u.loginMethod === "google" ? "Google" : "البريد الإلكتروني"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-SA") : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Dialog open={isDialogOpen && editingUser?.id === u.id} onOpenChange={(open) => {
                              if (!open) {
                                setEditingUser(null);
                              }
                              setIsDialogOpen(open);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(u)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="rtl">
                                <DialogHeader>
                                  <DialogTitle>تعديل المستخدم</DialogTitle>
                                  <DialogDescription>
                                    تحديث معلومات المستخدم والصلاحيات
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="name">الاسم</Label>
                                    <Input
                                      id="name"
                                      value={formData.name}
                                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                      className="text-right"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="email">البريد الإلكتروني</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      value={formData.email}
                                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                      className="text-right"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="role">الدور</Label>
                                    <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="user">مستخدم</SelectItem>
                                        <SelectItem value="admin">مسؤول</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={handleSaveUser}
                                  >
                                    حفظ التغييرات
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
