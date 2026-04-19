import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, MapPin, MapPinned, Phone } from "lucide-react";

import { connectToDatabase } from "@/lib/db";
import StoreModel from "@/lib/models/store.model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StoreRouteProps = {
  params: Promise<{ slug: string }>;
};

type StoreDetails = {
  name: string;
  slug: string;
  addressLine1: string;
  suburb: string;
  city: string;
  province: string;
  phone?: string;
  hasATM: boolean;
  services: string[];
  location: {
    coordinates: [number, number];
  };
};

export default async function StoreDetailsPage({ params }: StoreRouteProps) {
  const { slug } = await params;

  await connectToDatabase();

  const store = await StoreModel.findOne({
    slug: slug.toLowerCase(),
    isActive: true,
  }).lean<StoreDetails | null>();

  if (!store) {
    notFound();
  }

  const [longitude, latitude] = store.location.coordinates;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#112768] md:px-6">
      <div className="mx-auto max-w-3xl">
        <Button
          asChild
          variant="outline"
          className="mb-6 border-[#5dc300] text-[#112768] hover:bg-[#f2ffe6]"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to store locator
          </Link>
        </Button>

        <Card className="border-0 bg-[#f0efef] shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-2xl font-black">{store.name}</CardTitle>
              {store.hasATM ? (
                <Badge className="flex items-center gap-1 rounded-full border-0 bg-white px-3 py-1 text-[#5dc300] hover:bg-white">
                  <CreditCard className="h-4 w-4" />
                  ATM
                </Badge>
              ) : null}
            </div>
            <p className="mt-2 text-sm font-medium">
              {store.suburb}, {store.city}, {store.province}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#5dc300]" />
                <p className="text-sm font-medium">{store.addressLine1}</p>
              </div>

              {store.phone ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[#5dc300]" />
                  <p className="text-sm font-medium">{store.phone}</p>
                </div>
              ) : null}
            </div>

            {store.services?.length ? (
              <div>
                <h2 className="mb-2 text-base font-bold">Amenities available</h2>
                <ul className="list-disc space-y-1 pl-5">
                  {store.services.map((service) => (
                    <li key={service} className="text-sm font-light">
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Button
              asChild
              className="cursor-pointer border-0 bg-[#5dc300] text-white shadow-none hover:bg-[#4eaa00]"
            >
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <MapPinned className="mr-2 h-4 w-4" />
                Get directions
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
