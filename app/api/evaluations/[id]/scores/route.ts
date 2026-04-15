import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const evaluationId = parseInt(id);

    const body = await req.json();
    const { scores } = body;

    if (!scores || !Array.isArray(scores)) {
      return NextResponse.json(
        { message: "Scores array is required" },
        { status: 400 }
      );
    }

    // Verify evaluation exists and belongs to this user
    const evaluation = await prisma.evaluations.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      return NextResponse.json(
        { message: "Evaluation not found" },
        { status: 404 }
      );
    }

    if (evaluation.evaluator_id !== session.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete existing scores and create new ones
    await prisma.evaluation_scores.deleteMany({
      where: { evaluation_id: evaluationId },
    });

    // Create new scores
    await prisma.evaluation_scores.createMany({
      data: scores.map((s: { kpi_id: number; score: number; notes?: string }) => ({
        evaluation_id: evaluationId,
        kpi_id: s.kpi_id,
        score: s.score,
        notes: s.notes || null,
      })),
    });

    return NextResponse.json({ message: "Scores saved successfully" });
  } catch (error) {
    console.error("Error saving scores:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
