import { Suspense } from "react";

import HomePageClient from "@/app/home-page-client";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen bg-white text-[#112768]">
          <section className="mx-auto flex h-full max-w-7xl items-center justify-center px-4 py-6 md:px-6 lg:px-8">
            <p className="text-[14px] font-light">Loading store locator...</p>
          </section>
        </main>
      }
    >
      <HomePageClient />
    </Suspense>
  );
}
