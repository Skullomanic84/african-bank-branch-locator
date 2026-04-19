"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";

import type { Store } from "@/types/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function StoreTable({
  stores,
  isLoading = false,
  onDelete,
}: StoreTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(stores.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedStores = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return stores.slice(start, start + PAGE_SIZE);
  }, [stores, safeCurrentPage]);

  const startIndex = stores.length ? (safeCurrentPage - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = stores.length
    ? Math.min(safeCurrentPage * PAGE_SIZE, stores.length)
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
    <div className="overflow-hidden rounded-md bg-[#efefef]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[#112768]">Store</TableHead>
            <TableHead className="text-[#112768]">Province</TableHead>
            <TableHead className="text-[#112768]">City</TableHead>
            <TableHead className="text-[#112768]">ATM</TableHead>
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
          Showing {startIndex}-{endIndex} of {stores.length}
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
  );
}
