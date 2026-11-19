"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";

import type { Store } from "@/types/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type StoreTableProps = {
  stores: Store[];
  isLoading?: boolean;
  onDelete: (id: string) => void;
};

const PAGE_SIZE = 13;
const ALL = "all";

type StatusFilter = typeof ALL | "active" | "inactive";
type FeatureFilter = typeof ALL | "atm" | "cam";

export default function StoreTable({
  stores,
  isLoading = false,
  onDelete,
}: StoreTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState<string>(ALL);
  const [status, setStatus] = useState<StatusFilter>(ALL);
  const [feature, setFeature] = useState<FeatureFilter>(ALL);

  const provinces = useMemo(
    () =>
      Array.from(new Set(stores.map((store) => store.province).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b)),
    [stores],
  );

  const filteredStores = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);

    return stores.filter((store) => {
      if (province !== ALL && store.province !== province) return false;
      if (status === "active" && !store.isActive) return false;
      if (status === "inactive" && store.isActive) return false;
      if (feature === "atm" && !store.hasATM) return false;
      if (feature === "cam" && !store.hasCAM) return false;

      if (!terms.length) return true;

      const haystack = [
        store.name,
        store.slug,
        store.addressLine1,
        store.suburb,
        store.city,
        store.province,
        store.postalCode,
        store.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return terms.every((term) => haystack.includes(term));
    });
  }, [stores, query, province, status, feature]);

  const hasActiveFilters =
    query.trim() !== "" ||
    province !== ALL ||
    status !== ALL ||
    feature !== ALL;

  const resetFilters = () => {
    setQuery("");
    setProvince(ALL);
    setStatus(ALL);
    setFeature(ALL);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedStores = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredStores.slice(start, start + PAGE_SIZE);
  }, [filteredStores, safeCurrentPage]);

  const startIndex = filteredStores.length
    ? (safeCurrentPage - 1) * PAGE_SIZE + 1
    : 0;
  const endIndex = filteredStores.length
    ? Math.min(safeCurrentPage * PAGE_SIZE, filteredStores.length)
    : 0;

  if (isLoading) {
    return (
      <div className="rounded-md bg-[#efefef] p-4 text-[14px] font-light text-[#112768]">
        Loading admin stores...
      </div>
    );
  }

  if (!stores.length) {
    return (
      <div className="space-y-4 rounded-md bg-[#efefef] p-4">
        <p className="text-[14px] font-light text-[#112768]">
          No stores added yet.
        </p>

        <Button asChild className="bg-[#5dc300] text-white hover:bg-[#4eaa00]">
          <Link href="/admin/stores/new">
            <Plus className="mr-2 h-4 w-4" />
            Add first store
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-md bg-[#efefef] p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#112768]" />
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, address, suburb, city, postal code or phone"
            aria-label="Search stores"
            className="h-10 border-[#b7b7b7] bg-white pl-10 text-[14px] font-light text-[#112768] placeholder:text-[#112768]/60"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={province}
            onValueChange={(value) => {
              setProvince(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger
              aria-label="Filter by province"
              className="h-10 min-w-44 border-[#b7b7b7] bg-white text-[#112768] data-[size=default]:h-10"
            >
              <SelectValue placeholder="Province" />
            </SelectTrigger>
            <SelectContent className="bg-white text-[#112768]">
              <SelectItem value={ALL}>All provinces</SelectItem>
              {provinces.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as StatusFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger
              aria-label="Filter by status"
              className="h-10 min-w-36 border-[#b7b7b7] bg-white text-[#112768] data-[size=default]:h-10"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white text-[#112768]">
              <SelectItem value={ALL}>All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={feature}
            onValueChange={(value) => {
              setFeature(value as FeatureFilter);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger
              aria-label="Filter by facility"
              className="h-10 min-w-36 border-[#b7b7b7] bg-white text-[#112768] data-[size=default]:h-10"
            >
              <SelectValue placeholder="Facilities" />
            </SelectTrigger>
            <SelectContent className="bg-white text-[#112768]">
              <SelectItem value={ALL}>All facilities</SelectItem>
              <SelectItem value="atm">Has ATM</SelectItem>
              <SelectItem value="cam">Has CAM</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="h-10 text-[#112768]"
            >
              <X className="mr-1 h-4 w-4" />
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {!filteredStores.length ? (
        <div className="flex flex-col items-start gap-3 rounded-md bg-[#efefef] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14px] font-light text-[#112768]">
            No stores match your search.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="border-[#b7b7b7] text-[#112768]"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md bg-[#efefef]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#112768]">Store</TableHead>
                <TableHead className="text-[#112768]">Province</TableHead>
                <TableHead className="text-[#112768]">City</TableHead>
                <TableHead className="text-[#112768]">ATM</TableHead>
                <TableHead className="text-[#112768]">CAM</TableHead>
                <TableHead className="text-[#112768]">Active</TableHead>
                <TableHead className="text-right text-[#112768]">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedStores.map((store) => {
                const storeId = String(store._id ?? "");

                return (
                  <TableRow key={storeId || store.slug}>
                    <TableCell className="font-medium text-[#112768]">
                      <div>
                        <p className="font-semibold">{store.name}</p>
                        <p className="text-[12px] font-light">{store.suburb}</p>
                      </div>
                    </TableCell>

                    <TableCell className="text-[#112768]">
                      {store.province}
                    </TableCell>
                    <TableCell className="text-[#112768]">{store.city}</TableCell>

                    <TableCell>
                      <Badge
                        className={
                          store.hasATM
                            ? "bg-[#5dc300] text-white"
                            : "bg-slate-500 text-white"
                        }
                      >
                        {store.hasATM ? "Yes" : "No"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          store.hasCAM
                            ? "bg-[#5dc300] text-white"
                            : "bg-slate-500 text-white"
                        }
                      >
                        {store.hasCAM ? "Yes" : "No"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          store.isActive
                            ? "bg-[#112768] text-white"
                            : "bg-slate-400 text-white"
                        }
                      >
                        {store.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="bg-[#5dc300] text-white hover:bg-[#4eaa00]"
                        >
                          <Link href={`/admin/stores/${storeId}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => onDelete(storeId)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-[#d8d8d8] bg-white px-4 py-3 text-[13px] text-[#112768]">
            <p className="font-light">
              Showing {startIndex}-{endIndex} of {filteredStores.length}
              {filteredStores.length !== stores.length
                ? ` (filtered from ${stores.length})`
                : ""}
            </p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className="border-[#b7b7b7] text-[#112768]"
              >
                Prev
              </Button>

              <span className="min-w-16 text-center font-medium">
                {safeCurrentPage} / {totalPages}
              </span>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="border-[#b7b7b7] text-[#112768]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
