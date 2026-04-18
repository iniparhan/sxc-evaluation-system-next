import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { unstable_cache } from "next/cache";

/**
 * GET /api/evaluations/[id]?evaluatee_id={evaluateeId}
 *
 * Get evaluation detail with scores and KPIs based on kpi_type enum
 */

// Cache function for evaluation details
const getEvaluationDetailCached = unstable_cache(
  async (evaluationId: number, evaluateeId: number, sessionId: number) => {
    // Get evaluation with scores in one query
    const evaluation = await prisma.evaluations.findUnique({
      where: { id: evaluationId },
      include: {
        evaluation_scores: true,
        members_evaluations_evaluatee_idTomembers: true, // evaluatee
        members_evaluations_evaluator_idTomembers: true, // evaluator
      },
    });

    if (!evaluation) {
      throw new Error("Evaluation not found");
    }

    if (evaluation.evaluator_id !== sessionId) {
      throw new Error("Unauthorized");
    }

    if (evaluateeId !== evaluation.evaluatee_id) {
      throw new Error("Invalid evaluatee_id for this evaluation");
    }

    const evaluatee = evaluation.members_evaluations_evaluatee_idTomembers;
    const evaluatorRoleId = evaluation.members_evaluations_evaluator_idTomembers.role_id;
    const evaluateeRoleId = evaluatee.role_id;

    if (!evaluatorRoleId || !evaluateeRoleId) {
      throw new Error("Invalid role configuration");
    }

    // Determine if evaluating superior or subordinate
    const isEvaluatingSuperior = evaluatorRoleId > evaluateeRoleId;

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

    return {
      evaluation,
      scores: evaluation.evaluation_scores,
      kpis: normalizedKpis,
      global_feedback: globalFeedback,
    };
  },
  ["evaluation-detail"], // Cache key prefix
  {
    revalidate: 300, // Cache for 5 minutes
    tags: ["evaluation-detail"], // For manual revalidation if needed
  }
);

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

    const { searchParams } = new URL(req.url);
    const evaluateeIdFromQuery = Number.parseInt(
      searchParams.get("evaluatee_id") || "",
      10
    );

    // Get evaluation to validate and get evaluatee_id
    const basicEvaluation = await prisma.evaluations.findUnique({
      where: { id: evaluationId },
      select: { evaluatee_id: true, evaluator_id: true },
    });

    if (!basicEvaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
      );
    }

    if (basicEvaluation.evaluator_id !== session.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const evaluateeId =
      Number.isInteger(evaluateeIdFromQuery) && evaluateeIdFromQuery > 0
        ? evaluateeIdFromQuery
        : basicEvaluation.evaluatee_id;

    if (evaluateeId !== basicEvaluation.evaluatee_id) {
      return NextResponse.json(
        { message: "Invalid evaluatee_id for this evaluation" },
        { status: 400 }
      );
    }

    // Use cached function for the heavy lifting
    const result = await getEvaluationDetailCached(evaluationId, evaluateeId, session.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    if (error instanceof Error) {
      if (error.message === "Evaluation not found") {
        return NextResponse.json({ message: error.message }, { status: 404 });
      }
      if (error.message === "Unauthorized") {
        return NextResponse.json({ message: error.message }, { status: 401 });
      }
      if (error.message === "Invalid evaluatee_id for this evaluation") {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
      if (error.message === "Invalid role configuration") {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
