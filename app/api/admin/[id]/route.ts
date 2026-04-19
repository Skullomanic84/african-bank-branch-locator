import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import StoreModel from "@/lib/models/store.model";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueSlug(name: string, currentId: string) {
  const baseSlug = slugify(name);
  let slug = baseSlug || `store-${Date.now()}`;
  let counter = 1;

  while (await StoreModel.exists({ slug, _id: { $ne: currentId } })) {
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

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid store id.",
        },
        { status: 400 },
      );
    }

    const store = await StoreModel.findById(id).lean();

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        store,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch store.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid store id.",
        },
        { status: 400 },
      );
    }

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

    const existingStore = await StoreModel.findById(id);

    if (!existingStore) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found.",
        },
        { status: 404 },
      );
    }

    const slug =
      existingStore.name !== name
        ? await buildUniqueSlug(name, id)
        : existingStore.slug;

    const updatedStore = await StoreModel.findByIdAndUpdate(
      id,
      {
        $set: {
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
        },
      },
      {
        new: true,
      },
    ).lean();

    return NextResponse.json(
      {
        success: true,
        message: "Store updated successfully.",
        store: updatedStore,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /api/admin/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update store.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    await connectToDatabase();

    const { id } = await context.params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid store id.",
        },
        { status: 400 },
      );
    }

    const deletedStore = await StoreModel.findByIdAndDelete(id).lean();

    if (!deletedStore) {
      return NextResponse.json(
        {
          success: false,
          message: "Store not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Store deleted successfully.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/admin/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete store.",
      },
      { status: 500 },
    );
  }
}
