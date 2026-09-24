import { Event } from "@/database";
import { connectToDatabase } from "@/lib/mongodb";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const normalizedSlug = slug?.trim().toLowerCase();

    if (!normalizedSlug || !slugPattern.test(normalizedSlug)) {
      return NextResponse.json(
        { message: "A valid event slug is required." },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const event = await Event.findOne({ slug: normalizedSlug }).lean();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch event by slug:", error);

    return NextResponse.json(
      { message: "Unable to fetch event." },
      { status: 500 },
    );
  }
}
