"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Store } from "@/types/store";

type StoreFormProps = {
  mode?: "create" | "edit";
  storeId?: string;
  initialStore?: Store | null;
};

type FormState = {
  name: string;
  addressLine1: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  longitude: string;
  latitude: string;
  servicesText: string;
  hasATM: boolean;
  isActive: boolean;
};

function buildInitialState(store?: Store | null): FormState {
  return {
    name: store?.name ?? "",
    addressLine1: store?.addressLine1 ?? "",
    suburb: store?.suburb ?? "",
    city: store?.city ?? "",
    province: store?.province ?? "",
    postalCode: store?.postalCode ?? "",
    phone: store?.phone ?? "",
    longitude: String(store?.location?.coordinates?.[0] ?? ""),
    latitude: String(store?.location?.coordinates?.[1] ?? ""),
    servicesText: store?.services?.join(", ") ?? "",
    hasATM: store?.hasATM ?? false,
    isActive: store?.isActive ?? true,
  };
}

export default function StoreForm({
  mode = "create",
  storeId,
  initialStore = null,
}: StoreFormProps) {
  const router = useRouter();

  const initialState = useMemo(
    () => buildInitialState(initialStore),
    [initialStore],
  );

  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      addressLine1: form.addressLine1.trim(),
      suburb: form.suburb.trim(),
      city: form.city.trim(),
      province: form.province.trim(),
      postalCode: form.postalCode.trim(),
      phone: form.phone.trim(),
      longitude: Number(form.longitude),
      latitude: Number(form.latitude),
      hasATM: form.hasATM,
      isActive: form.isActive,
      services: form.servicesText
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    };

    console.log("Submitting store payload:", payload);

    try {
      const endpoint =
        mode === "edit" && storeId
          ? `/api/admin/${storeId}`
          : "/api/admin/stores";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      console.log("Store form response:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save store.");
      }

      router.push("/admin/stores");
      router.refresh();
    } catch (err) {
      console.error("Store form submit error:", err);
      setError(err instanceof Error ? err.message : "Failed to save store.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 bg-white shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-[18px] font-bold text-[#112768]">
          {mode === "edit" ? "Edit store" : "Create new store"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={form.name}
              onChange={(event) => handleChange("name", event.target.value)}
              placeholder="Store name"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />

            <Input
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              placeholder="Phone number"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />

            <Input
              value={form.addressLine1}
              onChange={(event) =>
                handleChange("addressLine1", event.target.value)
              }
              placeholder="Address line 1"
              className="h-10.5 bg-[#efefef] text-[#112768] md:col-span-2"
            />

            <Input
              value={form.suburb}
              onChange={(event) => handleChange("suburb", event.target.value)}
              placeholder="Suburb / Area"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />

            <Input
              value={form.city}
              onChange={(event) => handleChange("city", event.target.value)}
              placeholder="City"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />

            <Input
              value={form.province}
              onChange={(event) => handleChange("province", event.target.value)}
              placeholder="Province"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />

            <Input
              value={form.postalCode}
              onChange={(event) =>
                handleChange("postalCode", event.target.value)
              }
              placeholder="Postal code"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />

            <Input
              value={form.longitude}
              onChange={(event) =>
                handleChange("longitude", event.target.value)
              }
              placeholder="Longitude"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />

            <Input
              value={form.latitude}
              onChange={(event) => handleChange("latitude", event.target.value)}
              placeholder="Latitude"
              className="h-10.5 bg-[#efefef] text-[#112768]"
            />
          </div>

          <Textarea
            value={form.servicesText}
            onChange={(event) =>
              handleChange("servicesText", event.target.value)
            }
            placeholder="Amenities / services, separated by commas"
            className="min-h-30 bg-[#efefef] text-[#112768]"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-md bg-[#efefef] px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold text-[#112768]">
                  ATM available
                </p>
                <p className="text-[12px] font-light text-[#112768]">
                  Toggle if this branch has an ATM
                </p>
              </div>

              <Switch
                checked={form.hasATM}
                onCheckedChange={(checked) => handleChange("hasATM", checked)}
                className="data-[state=checked]:bg-[#5dc300] data-[state=unchecked]:bg-[#112768]/30"
              />
            </div>

            <div className="flex items-center justify-between rounded-md bg-[#efefef] px-4 py-3">
              <div>
                <p className="text-[14px] font-semibold text-[#112768]">
                  Active store
                </p>
                <p className="text-[12px] font-light text-[#112768]">
                  Toggle store visibility in the locator
                </p>
              </div>

              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => handleChange("isActive", checked)}
                className="data-[state=checked]:bg-[#5dc300] data-[state=unchecked]:bg-[#112768]/30"
              />
            </div>
          </div>

          {error ? (
            <p className="text-[14px] font-light text-red-600">{error}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#5dc300] text-white hover:bg-[#4eaa00]"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update store"
                  : "Create store"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/stores")}
              className="border-[#112768] text-[#112768]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
