import { clerkClient } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
 
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
 
    console.log("Received userId:", userId)
 
    if (!userId) {
      return NextResponse.json({ error: "UserId is required" }, { status: 400 })
    }
 
    const user = await clerkClient.users.getUser(userId)
 
    if (!user) {
      console.log("User not found for ID:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
 
    const username =
      user.username ||
      user.firstName ||
      user.emailAddresses?.[0]?.emailAddress ||
      "Unknown User"
 
    const profileImage = user.imageUrl || null
 
    console.log("Fetched user details:", {
      username,
      profileImage,
    })
 
    return NextResponse.json({ username, profileImage }, { status: 200 })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}