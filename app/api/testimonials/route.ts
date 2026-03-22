import { getTestimonials } from "@/actions/feedbackActions";
import { NextResponse } from "next/server";

// @desc Get all testimonials
// @route GET /api/testimonials
// @access Public
export const GET = async () => {
  try {
    const testimonials = await getTestimonials();

    if (!testimonials || testimonials.length === 0) {
      return NextResponse.json(
        { message: "No testimonials found." },
        { status: 404 }
      );
    }

    return NextResponse.json(testimonials, { status: 200 });
  } catch (error: unknown) {
    console.error("Failed to fetch testimonials:", error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
};
