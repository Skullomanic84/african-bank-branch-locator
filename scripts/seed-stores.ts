import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

async function seedStores() {
  try {
    const [{ connectToDatabase }, { default: StoreModel }, { storesSeed }] =
      await Promise.all([
        import("@/lib/db"),
        import("@/lib/models/store.model"),
        import("@/lib/seed/stores.seed"),
      ]);

    await connectToDatabase();

    for (const store of storesSeed) {
      await StoreModel.updateOne(
        { slug: store.slug },
        { $set: store },
        { upsert: true },
      );
    }

    console.log(`Seeded ${storesSeed.length} stores successfully.`);
  } catch (error) {
    console.error("Failed to seed stores:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedStores();
