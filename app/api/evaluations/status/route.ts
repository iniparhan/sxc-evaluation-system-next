import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET /api/evaluations/status?evaluator_id={id}
 *
 * Get completion status for all evaluatees
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const evaluatorId = parseInt(searchParams.get("evaluator_id") || "0");

    if (!evaluatorId || evaluatorId !== session.id) {
      return NextResponse.json({ message: "Invalid evaluator ID" }, { status: 400 });
    }

    // Get evaluator's role
    const evaluator = await prisma.members.findUnique({
      where: { id: evaluatorId },
    });

    if (!evaluator || !evaluator.role_id) {
      return NextResponse.json({ message: "Evaluator not found" }, { status: 404 });
    }

    // Get all active policies for this evaluator role
    const policies = await prisma.evaluation_policies.findMany({
      where: {
        evaluator_role_id: evaluator.role_id,
        is_active: true,
      },
    });

    // FIXED: Batch query instead of N+1 COUNT queries
    const whereOrConditions: any[] = [];

    for (const policy of policies) {
      const condition: any = { role_id: policy.evaluatee_role_id };

      if (policy.division_scope === "SAME_DIVISION") {
        condition.division_id = evaluator.division_id;
      } else if (policy.division_scope === "SAME_SUBDIVISION") {
        condition.sub_division_id = evaluator.sub_division_id;
      }

      whereOrConditions.push(condition);
    }

    // Single query to get all evaluatees
    const allEvaluatees = await prisma.members.findMany({
      where: {
        id: { not: evaluatorId },
        OR: whereOrConditions,
      },
      select: { id: true }, // Only need IDs for deduplication
    });

    // Deduplicate with Set
    const uniqueEvaluateeIds = new Set(allEvaluatees.map((m) => m.id));
    const totalEvaluatees = uniqueEvaluateeIds.size;

    // Get active period
    const activePeriod = await prisma.evaluation_periods.findFirst({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });

    // Count submitted evaluations
    const submittedCount = await prisma.evaluations.count({
      where: {
        evaluator_id: evaluatorId,
        period_id: activePeriod?.id || undefined,
        submitted_at: { not: null },
      },
    });

    const pending = totalEvaluatees - submittedCount;

    return NextResponse.json({
      total_evaluatees: totalEvaluatees,
      completed: submittedCount,
      pending: pending,
      is_all_complete: pending === 0 && totalEvaluatees > 0,
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
