import StoreForm from "@/components/admin/store-form";

export default function NewStorePage() {
  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#112768] md:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-[18px] font-bold text-[#112768]">New store</h1>
          <p className="mt-1 text-[14px] font-light text-[#112768]">
            Add a new branch to the store locator.
          </p>
        </div>

        <StoreForm mode="create" />
      </section>
    </main>
  );
}
