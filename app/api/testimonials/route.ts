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
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    const errorDetails =
      error instanceof Error ? error.stack : JSON.stringify(error);

    return NextResponse.json(
      {
        message,
        error: errorDetails,
      },
      { status: 500 }
    );
  }
};
