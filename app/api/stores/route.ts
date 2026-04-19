import { NextRequest, NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import StoreModel from "@/lib/models/store.model";

function parseBoolean(value: string | null) {
  if (!value) return undefined;

  const normalized = value.toLowerCase();

  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return undefined;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);

    const province = searchParams.get("province")?.trim();
    const city = searchParams.get("city")?.trim();
    const town = searchParams.get("town")?.trim();
    const suburb = searchParams.get("suburb")?.trim();
    const atm = parseBoolean(searchParams.get("atm"));

    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius");

    const hasLat = latParam !== null && latParam !== "";
    const hasLng = lngParam !== null && lngParam !== "";

    if ((hasLat && !hasLng) || (!hasLat && hasLng)) {
      return NextResponse.json(
        {
          success: false,
          message: "Both lat and lng are required for nearby search.",
        },
        { status: 400 },
      );
    }

    const query: Record<string, unknown> = {
      isActive: true,
    };

    if (province) {
      query.province = {
        $regex: new RegExp(`^${escapeRegex(province)}$`, "i"),
      };
    }

    if (city) {
      query.city = { $regex: new RegExp(`^${escapeRegex(city)}$`, "i") };
    }

    const townOrSuburb = town || suburb;
    if (townOrSuburb) {
      query.suburb = {
        $regex: new RegExp(escapeRegex(townOrSuburb), "i"),
      };
    }

    if (typeof atm === "boolean") {
      query.hasATM = atm;
    }

    let sort: Record<string, 1 | -1> = { name: 1 };

    if (hasLat && hasLng) {
      const latitude = Number(latParam);
      const longitude = Number(lngParam);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return NextResponse.json(
          {
            success: false,
            message: "lat and lng must be valid numbers.",
          },
          { status: 400 },
        );
      }

      const radiusInMeters = radiusParam ? Number(radiusParam) : 50000;

      if (Number.isNaN(radiusInMeters) || radiusInMeters <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "radius must be a valid positive number.",
          },
          { status: 400 },
        );
      }

      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusInMeters,
        },
      };

      // $near already sorts by nearest first
      sort = {};
    }

    const stores = await StoreModel.find(query).sort(sort).lean();

    return NextResponse.json(
      {
        success: true,
        count: stores.length,
        stores,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/stores error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch stores.",
      },
      { status: 500 },
    );
  }
}
