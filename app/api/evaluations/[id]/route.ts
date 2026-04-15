import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * GET /api/evaluations/[id]?evaluatee_id={evaluateeId}
 *
 * Get evaluation detail with scores and KPIs based on kpi_type enum
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const evaluationId = Number.parseInt(id, 10);
    if (!Number.isInteger(evaluationId) || evaluationId <= 0) {
      return NextResponse.json(
        { message: "Invalid evaluation id" },
        { status: 400 }
      );
    }

    // Get evaluation
    const evaluation = await prisma.evaluations.findUnique({
      where: { id: evaluationId },
      include: {
        evaluation_scores: true,
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
      );
    }

    if (evaluation.evaluator_id !== session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const evaluateeIdFromQuery = Number.parseInt(
      searchParams.get("evaluatee_id") || "",
      10
    );
    const evaluateeId =
      Number.isInteger(evaluateeIdFromQuery) && evaluateeIdFromQuery > 0
        ? evaluateeIdFromQuery
        : evaluation.evaluatee_id;

    if (evaluateeId !== evaluation.evaluatee_id) {
      return NextResponse.json(
        { message: "Invalid evaluatee_id for this evaluation" },
        { status: 400 }
      );
    }

    // Get evaluatee info to determine KPIs
    const evaluatee = await prisma.members.findUnique({
      where: { id: evaluateeId },
    });

    if (!evaluatee) {
      return NextResponse.json(
        { message: "Evaluatee not found" },
        { status: 404 }
      );
    }

    const evaluatorRoleId = session.role_id;
    const evaluateeRoleId = evaluatee.role_id;

    if (!evaluatorRoleId || !evaluateeRoleId) {
      return NextResponse.json(
        { message: "Invalid role configuration" },
        { status: 400 }
      );
    }

    // Determine if evaluating superior or subordinate
    // Lower ID = higher position (1=Super Admin, 6=Officer)
    const isEvaluatingSuperior = evaluatorRoleId > evaluateeRoleId; // upward

    let kpis: Array<{
      id: number;
      indicator_name: string;
      definition: string;
      type: string;
      division_id: number | null;
      weight: number | null;
      max_score: number | null;
      is_active: boolean | null;
    }>;

    if (isEvaluatingSuperior) {
      // UPWARD evaluation: Only UPWARD KPIs
      kpis = await prisma.kpis.findMany({
        where: {
          type: "UPWARD",
          is_active: true,
        },
        orderBy: { id: "asc" },
      });
    } else {
      // DOWNWARD evaluation: DOWNWARD_GENERAL + DOWNWARD_DEPARTMENT (if evaluatee has division)
      const whereConditions: Array<{
        type: "DOWNWARD_GENERAL" | "DOWNWARD_DEPARTMENT";
        division_id?: number;
      }> = [{ type: "DOWNWARD_GENERAL" }];

      // Add division-specific KPIs if evaluatee has a division
      if (evaluatee.division_id) {
        whereConditions.push({
          type: "DOWNWARD_DEPARTMENT",
          division_id: evaluatee.division_id,
        });
      }

      kpis = await prisma.kpis.findMany({
        where: {
          is_active: true,
          OR: whereConditions,
        },
        orderBy: [
          { type: "asc" },
          { id: "asc" },
        ],
      });
    }

    const kpiIds = kpis.map((kpi) => kpi.id);
    const descriptionMap = new Map<number, string[]>();

    if (kpiIds.length > 0) {
      try {
        const indicatorRows = await prisma.$queryRaw<
          Array<{ kpi_id: number; description: string }>
        >(Prisma.sql`
          SELECT kpi_id, description
          FROM kpi_indicators
          WHERE kpi_id IN (${Prisma.join(kpiIds)})
          ORDER BY id ASC
        `);

        for (const row of indicatorRows) {
          const existing = descriptionMap.get(row.kpi_id) || [];
          existing.push(row.description);
          descriptionMap.set(row.kpi_id, existing);
        }
      } catch {
        // `kpi_indicators` may not exist in every deployed DB version.
      }
    }

    const normalizedKpis = kpis.map((kpi) => ({
      id: kpi.id,
      // Keep old keys for existing frontend compatibility
      name: kpi.indicator_name,
      indicator: kpi.definition,
      // New keys that match current DB schema
      indicator_name: kpi.indicator_name,
      definition: kpi.definition,
      type: kpi.type,
      division_id: kpi.division_id,
      weight: kpi.weight,
      max_score: kpi.max_score,
      is_active: kpi.is_active,
      descriptions: descriptionMap.get(kpi.id) || [],
    }));

    const globalFeedback =
      evaluation.evaluation_scores.find((score) => score.notes?.trim())?.notes || null;

    return NextResponse.json({
      evaluation,
      scores: evaluation.evaluation_scores,
      kpis: normalizedKpis,
      global_feedback: globalFeedback,
    });
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
