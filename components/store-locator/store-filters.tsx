"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Store } from "@/types/store";

type StoreFiltersProps = {
  initialProvince: string;
  initialCity: string;
  initialArea: string;
  initialAtmOnly: boolean;
  allStores: Store[];
  provinceOptions: string[];
  onSearch: (values: {
    province: string;
    city: string;
    area: string;
    atmOnly: boolean;
  }) => void;
  onClear: () => void;
  onUseMyLocation: (atmOnly: boolean) => void;
  isLocating?: boolean;
  locationMessage?: string | null;
};

const triggerClassName =
  "h-[42px] w-full justify-between rounded-full border border-[#b7b7b7] bg-[#efefef] px-3 text-[14px] font-light text-[#112768] shadow-none opacity-100 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[placeholder]:text-[#112768] [&>span]:line-clamp-1 [&>span]:text-left";

export default function StoreFilters({
  initialProvince,
  initialCity,
  initialArea,
  initialAtmOnly,
  allStores,
  provinceOptions,
  onSearch,
  onClear,
  onUseMyLocation,
  isLocating = false,
  locationMessage = null,
}: StoreFiltersProps) {
  const [province, setProvince] = useState(initialProvince);
  const [city, setCity] = useState(initialCity);
  const [area, setArea] = useState(initialArea);
  const [atmOnly, setAtmOnly] = useState(initialAtmOnly);

  const cityOptions = useMemo(() => {
    const filteredCities = province
      ? allStores
          .filter((store) => store.province === province)
          .map((store) => store.city)
      : allStores.map((store) => store.city);

    return [...new Set(filteredCities)].sort((a, b) => a.localeCompare(b));
  }, [allStores, province]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch({ province, city, area, atmOnly });
      }}
      className="space-y-3 p-4"
    >
      <div className="flex items-center justify-between px-1">
        <p className="text-[12px] font-medium text-[#b30000]">
          Advanced Search
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onUseMyLocation(atmOnly)}
            disabled={isLocating}
            className="cursor-pointer text-[12px] font-medium text-[#112768] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? "Locating..." : "Use my location"}
          </button>

          <button
            type="button"
            onClick={() => {
              setProvince("");
              setCity("");
              setArea("");
              setAtmOnly(false);
              onClear();
            }}
            className="cursor-pointer text-[12px] font-medium text-[#b30000]"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {locationMessage ? (
        <p className="px-1 text-[12px] font-light text-[#112768]">
          {locationMessage}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="w-full">
          <Select
            value={province || "all"}
            onValueChange={(value) => {
              setProvince(value === "all" ? "" : value);
              setCity("");
            }}
          >
            <SelectTrigger className={triggerClassName}>
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent className="border border-[#b7b7b7] bg-white text-[#112768]">
              <SelectGroup>
                <SelectLabel>Province</SelectLabel>
                <SelectItem value="all">All provinces</SelectItem>
                {provinceOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select
            value={city || "all"}
            onValueChange={(value) => setCity(value === "all" ? "" : value)}
          >
            <SelectTrigger className={triggerClassName}>
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent className="border border-[#b7b7b7] bg-white text-[#112768]">
              <SelectGroup>
                <SelectLabel>City</SelectLabel>
                <SelectItem value="all">All cities</SelectItem>
                {cityOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-full bg-[#efefef] px-3 py-2">
        <p className="text-[13px] font-medium text-[#112768]">
          Branches with ATM
        </p>
        <Switch
          checked={atmOnly}
          onCheckedChange={(checked) => {
            setAtmOnly(checked);
            onSearch({
              province,
              city,
              area,
              atmOnly: checked,
            });
          }}
        />
      </div>

      <div className="grid grid-cols-10 gap-3">
        <Input
          value={area}
          onChange={(event) => setArea(event.target.value)}
          placeholder="Area"
          className="col-span-7 h-10.5 rounded-full border border-[#b7b7b7] bg-[#efefef] px-3 text-[14px] font-light text-[#112768] placeholder:text-[#112768] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Button
          type="submit"
          className="col-span-3 h-10.5 cursor-pointer rounded-full bg-[#5dc300] px-4 text-[14px] font-semibold text-white shadow-none hover:bg-[#4eaa00] focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
