import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

// Route handler for GET request
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    console.log("Query Param - userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId query parameter" },
        { status: 400 }
      );
    }

    // Fetch user from Clerk
    const user = await clerkClient.users.getUser(userId);
    console.log("Fetched User:", user);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0]?.emailAddress,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
