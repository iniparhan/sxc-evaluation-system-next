import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * POST /api/super_admin/members
 * Create a new member
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Super Admin (role_id: 1)
    if (session.role_id !== 1) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role_id, division_id, sub_division_id } = body;

    // Validation
    if (!name || !email || !password || !role_id) {
      return NextResponse.json(
        { message: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.members.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    // Create member
    const member = await prisma.members.create({
      data: {
        name,
        email,
        password, // In production, this should be hashed
        role_id,
        division_id: division_id || null,
        sub_division_id: sub_division_id || null,
      },
    });

    return NextResponse.json({
      message: "Member created successfully",
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
      },
    });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
