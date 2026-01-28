import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowRight } from "lucide-react";
import { Streamdown } from "streamdown";

export default function StaticPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = trpc.staticPages.getBySlug.useQuery({ slug: slug || "" });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">لم يتم العثور على الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="/" className="hover:text-blue-600">الرئيسية</a>
            <ArrowRight className="w-4 h-4" />
            <span>{page.title}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{page.title}</h1>
          {page.excerpt && (
            <p className="text-blue-100 text-lg">{page.excerpt}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          {page.image && (
            <img
              src={page.image}
              alt={page.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <div className="prose prose-lg max-w-none">
            <Streamdown>{page.content}</Streamdown>
          </div>

          <div className="mt-8 pt-8 border-t text-sm text-gray-500">
            <p>آخر تحديث: {new Date(page.updatedAt).toLocaleDateString("ar-SA")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
