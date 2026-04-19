"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import StoreTable from "@/components/admin/store-table";
import { Button } from "@/components/ui/button";
import type { Store } from "@/types/store";

type AdminStoresResponse = {
  success: boolean;
  count: number;
  stores: Store[];
  message?: string;
};

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/admin/stores", {
        method: "GET",
        cache: "no-store",
      });

      const data: AdminStoresResponse = await response.json();

      console.log("Admin stores response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch stores.");
      }

      setStores(data.stores);
    } catch (err) {
      console.error("Admin fetch stores error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch stores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadInitialStores = async () => {
      try {
        const response = await fetch("/api/admin/stores", {
          method: "GET",
          cache: "no-store",
        });

        const data: AdminStoresResponse = await response.json();

        console.log("Admin stores response:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch stores.");
        }

        if (!cancelled) {
          setStores(data.stores);
          setError("");
        }
      } catch (err) {
        console.error("Admin fetch stores error:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch stores.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialStores();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this store?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      console.log("Delete store response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete store.");
      }

      await fetchStores();
    } catch (err) {
      console.error("Delete store error:", err);
      alert(err instanceof Error ? err.message : "Failed to delete store.");
    }
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#112768] md:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[18px] font-bold text-[#112768]">
              Admin/Stores
            </h1>
            <p className="mt-1 text-[14px] font-light text-[#112768]">
              Manage branches shown on the store locator.
            </p>
          </div>

          <Button
            asChild
            className="bg-[#5dc300] text-white hover:bg-[#4eaa00]"
          >
            <Link href="/admin/stores/new">
              <Plus className="mr-2 h-4 w-4" />
              New store
            </Link>
          </Button>
        </div>

        {error ? (
          <div className="rounded-md bg-red-50 p-4 text-[14px] font-light text-red-600">
            {error}
          </div>
        ) : null}

        <StoreTable
          stores={stores}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
      </section>
    </main>
  );
}
