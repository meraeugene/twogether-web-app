import { franchiseMap } from "@/data/franchiseMap";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("franchise");

    if (!key) {
      return NextResponse.json(
        { error: "Missing required 'franchise' query parameter" },
        { status: 400 }
      );
    }

    const data = franchiseMap[key];

    if (!data) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ name: data.name, movies: data.movies });
  } catch (error) {
    console.error("[CHRONOLOGY_API_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to load chronology data" },
      { status: 500 }
    );
  }
}
