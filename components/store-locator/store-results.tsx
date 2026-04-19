import type { Store } from "@/types/store";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import StoreCard from "./store-card";

type StoreResultsProps = {
  stores: Store[];
  isLoading?: boolean;
  error?: string | null;
  isNearMeMode?: boolean;
};

export default function StoreResults({
  stores,
  isLoading = false,
  error = null,
  isNearMeMode = false,
}: StoreResultsProps) {
  if (isLoading) {
    return (
      <Card className="h-full border-0 bg-white text-[#112768] shadow-none ring-0">
        <CardContent className="p-6 text-[14px] font-light">
          Loading stores...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full border-0 bg-red-50 text-red-700 shadow-none ring-0">
        <CardContent className="p-6 text-[14px] font-light">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!stores.length) {
    return (
      <Card className="h-full border-0 bg-white text-[#112768] shadow-none ring-0">
        <CardContent className="p-6 text-[14px] font-light">
          No stores found.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-0 bg-white text-[#112768] shadow-none ring-0">
      <CardContent className="flex h-full min-h-0 flex-col p-4">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
          <div className="text-[14px] font-light text-[#112768]">
            Showing {stores.length} store{stores.length === 1 ? "" : "s"}
          </div>
          {isNearMeMode ? (
            <span className="rounded-full bg-[#e8f7d9] px-2 py-1 text-[12px] font-medium text-[#2f6d00]">
              Near me
            </span>
          ) : null}
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4">
            {stores.map((store) => (
              <StoreCard key={store._id ?? store.slug} store={store} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
