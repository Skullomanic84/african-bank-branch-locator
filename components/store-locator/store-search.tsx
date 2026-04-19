"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type StoreSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function StoreSearch({
  value,
  onChange,
  onSubmit,
}: StoreSearchProps) {
  return (
    <Card className="border-0 bg-white shadow-none ring-0">
      <CardContent className="p-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#112768]" />
            <Input
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Search by town or suburb"
              className="h-11 border-0 bg-[#bebebe] pl-10 text-[14px] font-light text-[#112768] placeholder:text-[#112768]/70 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <Button
            type="submit"
            className="h-11 cursor-pointer bg-[#5dc300] px-5 text-white shadow-none hover:bg-[#4eaa00] focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Search
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}