import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET /api/super_admin/stats
 * Get dashboard statistics for super admin
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Super Admin (role_id: 1)
    if (session.role_id !== 1) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get stats
    const totalMembers = await prisma.members.count();
    const totalRoles = await prisma.roles.count();
    const totalDivisions = await prisma.divisions.count();
    const totalEvaluations = await prisma.evaluations.count();
    const submittedEvaluations = await prisma.evaluations.count({
      where: { submitted_at: { not: null } },
    });

    return NextResponse.json({
      totalMembers,
      totalRoles,
      totalDivisions,
      totalEvaluations,
      submittedEvaluations,
    });
  } catch (error) {
    console.error("Error fetching super admin stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
