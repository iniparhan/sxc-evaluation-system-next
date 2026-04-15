import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET /api/kpis?evaluatee_id={id}&evaluator_role_id={roleId}
 * 
 * Get KPI indicators based on evaluation context
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const evaluateeId = parseInt(searchParams.get("evaluatee_id") || "0");
    const evaluatorRoleId = parseInt(
      searchParams.get("evaluator_role_id") || "0"
    );

    if (!evaluateeId) {
      return NextResponse.json(
        { message: "Missing evaluatee_id" },
        { status: 400 }
      );
    }

    // Get evaluatee info
    const evaluatee = await prisma.members.findUnique({
      where: { id: evaluateeId },
    });

    if (!evaluatee || !evaluatee.role_id) {
      return NextResponse.json(
        { message: "Evaluatee not found" },
        { status: 404 }
      );
    }

    const evaluateeRoleId = evaluatee.role_id;

    // Determine if evaluating superior or subordinate
    const isEvaluatingSuperior = evaluatorRoleId < evaluateeRoleId;

    let kpis;
    if (isEvaluatingSuperior) {
      // Only global KPIs (5 indicators)
      kpis = await prisma.kpis.findMany({
        where: {
          division_id: null,
          is_active: true,
        },
        orderBy: { id: "asc" },
        take: 5,
      });
    } else {
      // Global KPIs (5) + division-specific KPIs
      const globalKpis = await prisma.kpis.findMany({
        where: {
          division_id: null,
          is_active: true,
        },
        orderBy: { id: "asc" },
        take: 5,
      });

      const divisionKpis =
        evaluatee.division_id !== null
          ? await prisma.kpis.findMany({
              where: {
                division_id: evaluatee.division_id,
                is_active: true,
              },
              orderBy: { id: "asc" },
            })
          : [];

      kpis = [...globalKpis, ...divisionKpis];
    }

    return NextResponse.json({ kpis });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
