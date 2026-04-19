"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import StoreForm from "@/components/admin/store-form";
import type { Store } from "@/types/store";

type StoreResponse = {
  success: boolean;
  store?: Store;
  message?: string;
};

export default function EditStorePage() {
  const params = useParams<{ id: string }>();
  const storeId = params.id;

  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(`/api/admin/${storeId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data: StoreResponse = await response.json();

        console.log("Edit store response:", data);

        if (!response.ok || !data.success || !data.store) {
          throw new Error(data.message || "Failed to fetch store.");
        }

        setStore(data.store);
      } catch (err) {
        console.error("Edit page fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch store.");
      } finally {
        setIsLoading(false);
      }
    };

    if (storeId) {
      fetchStore();
    }
  }, [storeId]);

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#112768] md:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-[18px] font-bold text-[#112768]">Edit store</h1>
          <p className="mt-1 text-[14px] font-light text-[#112768]">
            Update branch details.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-md bg-[#efefef] p-4 text-[14px] font-light text-[#112768]">
            Loading store...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md bg-red-50 p-4 text-[14px] font-light text-red-600">
            {error}
          </div>
        ) : null}

        {!isLoading && !error ? (
          <StoreForm mode="edit" storeId={storeId} initialStore={store} />
        ) : null}
      </section>
    </main>
  );
}
