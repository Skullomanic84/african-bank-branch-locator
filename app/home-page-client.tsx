"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import StoreFilters from "@/components/store-locator/store-filters";
import StoreResults from "@/components/store-locator/store-results";
import StoreMap from "@/components/map/store-map";
import type { Store } from "@/types/store";

type StoresApiResponse = {
  success: boolean;
  count: number;
  stores: Store[];
  message?: string;
};

export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  const currentProvince = searchParams.get("province") ?? "";
  const currentCity = searchParams.get("city") ?? "";
  const currentTown = searchParams.get("town") ?? "";
  const currentAtmOnly = searchParams.get("atm") === "true";
  const currentLat = searchParams.get("lat");
  const currentLng = searchParams.get("lng");
  const isNearMeMode = Boolean(currentLat && currentLng);

  const [stores, setStores] = useState<Store[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = queryString ? `/api/stores?${queryString}` : "/api/stores";

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

        const data: StoresApiResponse = await response.json();

        console.log("Filtered stores API response:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load stores");
        }

        setStores(data.stores);
      } catch (err) {
        console.error("Failed to fetch filtered stores:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong loading stores",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [queryString]);

  useEffect(() => {
    const fetchAllStores = async () => {
      try {
        const response = await fetch("/api/stores", {
          method: "GET",
          cache: "no-store",
        });

        const data: StoresApiResponse = await response.json();

        console.log("All stores for filter options:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load filter options");
        }

        setAllStores(data.stores);
      } catch (err) {
        console.error("Failed to fetch all stores:", err);
      }
    };

    fetchAllStores();
  }, []);

  const provinceOptions = useMemo(() => {
    return [...new Set(allStores.map((store) => store.province))].sort((a, b) =>
      a.localeCompare(b),
    );
  }, [allStores]);

  const applyFilters = ({
    province,
    city,
    area,
    atmOnly,
  }: {
    province: string;
    city: string;
    area: string;
    atmOnly: boolean;
  }) => {
    setLocationMessage(null);
    const params = new URLSearchParams();

    if (province) {
      params.set("province", province);
    }

    if (city) {
      params.set("city", city);
    }

    if (area.trim()) {
      params.set("town", area.trim());
    }

    if (atmOnly) {
      params.set("atm", "true");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `/?${nextQuery}` : "/");
  };

  const clearFilters = () => {
    setLocationMessage(null);
    router.replace("/");
  };

  const useMyLocation = (atmOnly = currentAtmOnly) => {
    setLocationMessage(null);

    if (!("geolocation" in navigator)) {
      setLocationMessage("Location is not supported by this browser.");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams();
        params.set("lat", String(position.coords.latitude));
        params.set("lng", String(position.coords.longitude));
        params.set("radius", "50000");
        if (atmOnly) {
          params.set("atm", "true");
        }

        setLocationMessage("Showing branches near your current location.");
        setIsLocating(false);
        router.replace(`/?${params.toString()}`);
      },
      (geoError) => {
        setIsLocating(false);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLocationMessage(
            "Location access is blocked. Please enable location permissions in your browser settings.",
          );
          return;
        }

        if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          setLocationMessage(
            "Your location is currently unavailable. Please try again.",
          );
          return;
        }

        if (geoError.code === geoError.TIMEOUT) {
          setLocationMessage("Location request timed out. Please try again.");
          return;
        }

        setLocationMessage("Unable to retrieve your location right now.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return (
    <main className="h-screen overflow-hidden bg-white text-[#112768]">
      <section className="mx-auto flex h-full max-w-7xl flex-col px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-4 shrink-0 px-4">
          <h1 className="text-[18px] font-bold text-[#112768]">
            Store Locator
          </h1>
          <p className="mt-1 text-[14px] font-light text-[#112768]">
            Find branches near you and view available services.
          </p>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-stretch">
          <div className="flex min-h-0 flex-col gap-4">
            <StoreFilters
              key={`${currentProvince}|${currentCity}|${currentTown}|${currentAtmOnly ? "atm" : "all"}`}
              initialProvince={currentProvince}
              initialCity={currentCity}
              initialArea={currentTown}
              initialAtmOnly={currentAtmOnly}
              allStores={allStores}
              provinceOptions={provinceOptions}
              onSearch={applyFilters}
              onClear={clearFilters}
              onUseMyLocation={useMyLocation}
              isLocating={isLocating}
              locationMessage={locationMessage}
            />

            <div className="min-h-0 flex-1">
              <StoreResults
                stores={stores}
                isLoading={isLoading}
                error={error}
                isNearMeMode={isNearMeMode}
              />
            </div>
          </div>

          <div className="min-h-0">
            <StoreMap stores={stores} isLoading={isLoading} />
          </div>
        </div>
      </section>
    </main>
  );
}
