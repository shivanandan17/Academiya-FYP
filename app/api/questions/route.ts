import { NextResponse } from "next/server";
import { structured_output } from "@/lib/gpt";
import { z, ZodError } from "zod";

// Validation schema for request body
const quizCreationSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Topic must be at least 4 characters long" })
    .max(50, { message: "Topic must be at most 50 characters long" }),
});

// Your POST handler
export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { title } = quizCreationSchema.parse(body);

    // Generate 5 prompts related to the quiz title
    const prompts = new Array(5).fill(
      `Generate a hard multiple-choice question about ${title}`
    );

    // Call the structured_output function using the schema
    const result = await structured_output(
      "You are a helpful AI that creates MCQ questions and answers. Limit each option and answer to a max of 15 words.",
      prompts
    );

    return NextResponse.json({ questions: result }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error("Internal error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
