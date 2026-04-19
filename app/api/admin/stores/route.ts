import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import StoreModel from "@/lib/models/store.model";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueSlug(name: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug || `store-${Date.now()}`;
  let counter = 1;

  while (await StoreModel.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

function normalizeServices(input: unknown) {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export async function GET() {
  try {
    await connectToDatabase();

    const stores = await StoreModel.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        count: stores.length,
        stores,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/stores error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin stores.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const addressLine1 = String(body.addressLine1 ?? "").trim();
    const suburb = String(body.suburb ?? "").trim();
    const city = String(body.city ?? "").trim();
    const province = String(body.province ?? "").trim();
    const postalCode = String(body.postalCode ?? "").trim();
    const phone = String(body.phone ?? "").trim();

    const longitude = Number(body.longitude);
    const latitude = Number(body.latitude);

    const hasATM = Boolean(body.hasATM);
    const isActive =
      body.isActive !== undefined ? Boolean(body.isActive) : true;

    const services = normalizeServices(body.services);

    if (!name || !addressLine1 || !suburb || !city || !province) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, address, suburb, city, and province are required.",
        },
        { status: 400 },
      );
    }

    if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid longitude and latitude are required.",
        },
        { status: 400 },
      );
    }

    const slug = await buildUniqueSlug(name);

    const createdStore = await StoreModel.create({
      name,
      slug,
      addressLine1,
      suburb,
      city,
      province,
      postalCode,
      phone,
      hasATM,
      isActive,
      services,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Store created successfully.",
        store: createdStore,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/admin/stores error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create store.",
      },
      { status: 500 },
    );
  }
}
