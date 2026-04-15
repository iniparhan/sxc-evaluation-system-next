import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { Prisma, evaluation_policies } from "@prisma/client";

/**
 * GET /api/evaluatees
 *
 * Returns list of users that the evaluator needs to evaluate
 * based on evaluation_policies (no hardcoding)
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

    // Get evaluator's role, division, and sub_division
    const evaluator = await prisma.members.findUnique({
      where: { id: evaluatorId },
    });

    if (!evaluator || !evaluator.role_id) {
      return NextResponse.json({ message: "Evaluator not found or has no role" }, { status: 404 });
    }

    const evaluatorRoleId = evaluator.role_id;
    const evaluatorDivisionId = evaluator.division_id;
    const evaluatorSubDivisionId = evaluator.sub_division_id;

    // Get all active policies for this evaluator role
    const policies = await prisma.evaluation_policies.findMany({
      where: {
        evaluator_role_id: evaluatorRoleId,
        is_active: true,
      },
    });

    if (policies.length === 0) {
      return NextResponse.json({ evaluatees: [] });
    }

    // For each policy, find evaluatees based on scope
    type MemberWithRelations = Prisma.membersGetPayload<{
      include: { roles: true; divisions: true; sub_divisions: true };
    }>;
    const allEvaluatees: Array<{ member: MemberWithRelations; policy: evaluation_policies }> = [];

    for (const policy of policies) {
      // Build where clause based on scope
      const whereClause: any = {
        role_id: policy.evaluatee_role_id,
        id: { not: evaluatorId }, // No self-evaluation
      };

      // Add division/subdivision filters based on scope
      if (policy.division_scope === "SAME_DIVISION") {
        whereClause.division_id = evaluatorDivisionId;
      } else if (policy.division_scope === "SAME_SUBDIVISION") {
        whereClause.sub_division_id = evaluatorSubDivisionId;
      }
      // GLOBAL scope doesn't need additional filters

      // Find members matching this policy
      const members = await prisma.members.findMany({
        where: whereClause,
        include: {
          roles: true,
          divisions: true,
          sub_divisions: true,
        },
      });

      // Add these members to the list (avoid duplicates)
      for (const member of members) {
        if (!allEvaluatees.find((e) => e.member.id === member.id)) {
          allEvaluatees.push({
            member,
            policy,
          });
        }
      }
    }

    // Get active period
    const activePeriod = await prisma.evaluation_periods.findFirst({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });

    // Get existing evaluations
    const evaluateeIds = allEvaluatees.map((e) => e.member.id);
    const existingEvaluations = await prisma.evaluations.findMany({
      where: {
        evaluator_id: evaluatorId,
        evaluatee_id: { in: evaluateeIds },
        period_id: activePeriod?.id || undefined,
      },
    });

    // Build response
    const evaluatees = allEvaluatees.map(({ member, policy }) => {
      const evaluation = existingEvaluations.find(
        (e) => e.evaluatee_id === member.id
      );

      return {
        id: member.id,
        name: member.name,
        email: member.email,
        role_id: member.role_id,
        role_name: member.roles?.name || null,
        division_id: member.division_id,
        division_name: member.divisions?.name || null,
        sub_division_id: member.sub_division_id,
        sub_division_name: member.sub_divisions?.name || null,
        evaluation_id: evaluation?.id || null,
        is_submitted: evaluation?.submitted_at !== null && evaluation?.submitted_at !== undefined,
      };
    });

    return NextResponse.json({ evaluatees });
  } catch (error) {
    console.error("Error fetching evaluatees:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
