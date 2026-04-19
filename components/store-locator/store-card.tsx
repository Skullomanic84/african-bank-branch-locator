import Link from "next/link";
import { CreditCard, MapPin, MapPinned, Phone } from "lucide-react";

import type { Store } from "@/types/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StoreCardProps = {
  store: Store;
};

export default function StoreCard({ store }: StoreCardProps) {
  const [longitude, latitude] = store.location.coordinates;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <Card className="gap-0 border-0 bg-[#f0efef] shadow-none ring-0 outline-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-[16px] font-black text-[#112768]">
              {store.name}
            </CardTitle>

            <p className="mt-1 text-[14px] font-medium text-[#112768]">
              {store.suburb}, {store.city}, {store.province}
            </p>
          </div>

          {store.hasATM ? (
            <Badge className="flex items-center gap-1 rounded-full border-0 bg-white px-3 py-1 text-[#5dc300] shadow-none hover:bg-white">
              <CreditCard className="h-4 w-4" />
              ATM
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0 pb-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#5dc300]" />
            <p className="text-[13px] font-medium text-[#112768]">
              {store.addressLine1}
            </p>
          </div>

          {store.phone ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[#5dc300]" />
              <p className="text-[13px] font-medium text-[#112768]">
                {store.phone}
              </p>
            </div>
          ) : null}
        </div>

        {store.services?.length ? (
          <div>
            <h4 className="mb-2 text-[14px] font-bold text-[#112768]">
              Amenities available
            </h4>

            <ul className="list-disc space-y-1 pl-5">
              {store.services.map((service) => (
                <li
                  key={service}
                  className="text-[13px] font-light text-[#112768]"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col justify-between pt-4 sm:flex-row">
        <Button
          asChild
          className="w-full cursor-pointer border-0 bg-[#5dc300] text-white shadow-none no-underline hover:bg-[#4eaa00] focus-visible:ring-0 focus-visible:ring-offset-0 sm:w-auto"
        >
          <Link href={`/stores/${store.slug}`}>View store</Link>
        </Button>

        <Button
          asChild
          className="w-full cursor-pointer border-0 bg-[#5dc300] text-white shadow-none no-underline hover:bg-[#4eaa00] focus-visible:ring-0 focus-visible:ring-offset-0 sm:w-auto"
        >
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <MapPinned className="mr-2 h-4 w-4" />
            Get directions
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
