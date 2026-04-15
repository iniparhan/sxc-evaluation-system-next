import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
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

    // Set submitted_at to current timestamp
    const updated = await prisma.evaluations.update({
      where: { id: evaluationId },
      data: {
        submitted_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Evaluation submitted successfully",
      evaluation: updated,
    });
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
