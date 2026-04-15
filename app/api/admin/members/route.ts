import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET /api/admin/members
 * Get all members with their roles and divisions
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (role_id: 1=Super Admin, 2=Admin)
    if (!session.role_id || session.role_id > 2) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const members = await prisma.members.findMany({
      include: {
        roles: true,
        divisions: true,
        sub_divisions: true,
      },
      orderBy: { name: "asc" },
    });

    const formatted = members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      role_id: m.role_id,
      role_name: m.roles?.name || null,
      division_id: m.division_id,
      division_name: m.divisions?.name || null,
      sub_division_id: m.sub_division_id,
      sub_division_name: m.sub_divisions?.name || null,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
