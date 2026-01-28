import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Phone, Mail, Award } from "lucide-react";

export default function Doctors() {
  const { data: doctors, isLoading } = trpc.doctors.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">أطباؤنا المتخصصون</h1>
          <p className="text-blue-100 text-lg">فريق طبي متميز مع خبرات عملية عالية</p>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="container mx-auto px-4 py-12">
        {doctors && doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {doctor.image && (
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <CardTitle>{doctor.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-semibold">
                    {doctor.specialty}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.bio && (
                    <p className="text-sm text-gray-600">{doctor.bio}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    {doctor.experience && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Award className="w-4 h-4" />
                        <span>{doctor.experience} سنة خبرة</span>
                      </div>
                    )}
                    {doctor.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${doctor.phone}`} className="hover:text-blue-600">
                          {doctor.phone}
                        </a>
                      </div>
                    )}
                    {doctor.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${doctor.email}`} className="hover:text-blue-600">
                          {doctor.email}
                        </a>
                      </div>
                    )}
                  </div>

                  <Link href={`/doctors/${doctor.slug}`}>
                    <Button className="w-full mt-4" variant="default">
                      عرض التفاصيل والحجز
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد أطباء متاحون حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
