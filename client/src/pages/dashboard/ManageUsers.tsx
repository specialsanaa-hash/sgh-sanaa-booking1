import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Trash2, Edit2, Plus, Search, Shield, User } from "lucide-react";
import { toast } from "sonner";

// بيانات وهمية للمستخدمين
const MOCK_USERS = [
  {
    id: 1,
    name: "أحمد محمد",
    email: "ahmed@hospital.com",
    role: "admin" as const,
    createdAt: new Date("2025-10-28"),
    loginMethod: "google",
  },
  {
    id: 2,
    name: "فاطمة علي",
    email: "fatima@hospital.com",
    role: "user" as const,
    createdAt: new Date("2025-11-15"),
    loginMethod: "email",
  },
  {
    id: 3,
    name: "محمود حسن",
    email: "mahmoud@hospital.com",
    role: "user" as const,
    createdAt: new Date("2025-12-01"),
    loginMethod: "google",
  },
  {
    id: 4,
    name: "نور الدين",
    email: "nour@hospital.com",
    role: "admin" as const,
    createdAt: new Date("2025-09-20"),
    loginMethod: "email",
  },
];

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState(MOCK_USERS);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "admin" | "user",
  });

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
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      // محاكاة تحديث المستخدم
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData }
          : u
      ));
      
      toast.success("تم تحديث المستخدم بنجاح");
      setIsDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("حدث خطأ أثناء تحديث المستخدم");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      setUsers(users.filter(u => u.id !== userId));
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("حدث خطأ أثناء حذف المستخدم");
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
    });
    setIsDialogOpen(true);
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";
  };

  const getRoleLabel = (role: string) => {
    return role === "admin" ? "مسؤول" : "مستخدم";
  };

  return (
    <div className="space-y-6 rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-gray-600 mt-2">إدارة المستخدمين والصلاحيات</p>
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
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleAddUser}
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستخدم جديد
              </Button>
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
                          <Dialog open={isDialogOpen && editingUser?.id === u.id} onOpenChange={setIsDialogOpen}>
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
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <>
                                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                                      جاري الحفظ...
                                    </>
                                  ) : (
                                    "حفظ التغييرات"
                                  )}
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
  );
}
