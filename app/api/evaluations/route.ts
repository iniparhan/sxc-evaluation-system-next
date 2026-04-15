import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, getActivePeriod } from "@/lib/session";

/**
 * POST /api/evaluations
 * Get or create an evaluation record
 *
 * Body: { evaluator_id, evaluatee_id, period_id? }
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { evaluator_id, evaluatee_id, period_id } = body;

    if (!evaluator_id || !evaluatee_id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // No self-evaluation check
    if (evaluator_id === evaluatee_id) {
      return NextResponse.json(
        { message: "Cannot evaluate oneself" },
        { status: 400 }
      );
    }

    // Get active period if not provided
    const periodId = period_id || (await getActivePeriod())?.id;

    // Try to find existing evaluation
    let evaluation = await prisma.evaluations.findUnique({
      where: {
        evaluator_id_evaluatee_id_period_id: {
          evaluator_id,
          evaluatee_id,
          period_id: periodId || undefined,
        },
      },
    });

    // Return if exists
    if (evaluation) {
      return NextResponse.json({ evaluation });
    }

    // Create with upsert to handle race conditions
    try {
      evaluation = await prisma.evaluations.create({
        data: {
          evaluator_id,
          evaluatee_id,
          period_id: periodId || undefined,
        },
      });
    } catch (error: any) {
      // If unique constraint violation, fetch the existing record
      if (error.code === "P2002") {
        evaluation = await prisma.evaluations.findUnique({
          where: {
            evaluator_id_evaluatee_id_period_id: {
              evaluator_id,
              evaluatee_id,
              period_id: periodId || undefined,
            },
          },
        });

        if (!evaluation) {
          throw error;
        }
      } else {
        throw error;
      }
    }

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error("Error creating evaluation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/evaluations?id={evaluationId}&evaluatee_id={evaluateeId}
 *
 * Get evaluation detail with scores and KPIs
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const evaluationId = parseInt(searchParams.get("id") || "0");
    const evaluateeId = parseInt(searchParams.get("evaluatee_id") || "0");

    if (!evaluationId || !evaluateeId) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get evaluation
    const evaluation = await prisma.evaluations.findUnique({
      where: { id: evaluationId },
      include: {
        evaluation_scores: {
          include: {
            evaluations: true,
          },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
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
    // Get policies to understand the relationship
    const policies = await prisma.evaluation_policies.findMany({
      where: {
        evaluator_role_id: evaluatorRoleId,
        evaluatee_role_id: evaluateeRoleId,
        is_active: true,
      },
    });

    // Check if evaluator role ID is less than evaluatee role ID (superior)
    // Role IDs: 1=Super Admin, 2=Admin, 3=C-Level, 4=BoD, 5=BoM, 6=Officer
    // Lower ID = higher position
    const isEvaluatingSuperior = evaluatorRoleId > evaluateeRoleId;

    // Get KPIs
    let kpis;
    if (isEvaluatingSuperior) {
      // Only global KPIs (division_id IS NULL)
      kpis = await prisma.kpis.findMany({
        where: {
          division_id: null,
          is_active: true,
        },
        orderBy: { id: "asc" },
        take: 5,
      });
    } else {
      // Global KPIs + division-specific KPIs
      kpis = await prisma.kpis.findMany({
        where: {
          is_active: true,
          OR: [
            { division_id: null },
            { division_id: evaluatee.division_id || -1 },
          ],
        },
        orderBy: [{ division_id: { sort: "desc", nulls: "first" } }, { id: "asc" }],
      });
    }

    return NextResponse.json({
      evaluation,
      scores: evaluation.evaluation_scores,
      kpis,
    });
  } catch (error) {
    console.error("Error fetching evaluation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
