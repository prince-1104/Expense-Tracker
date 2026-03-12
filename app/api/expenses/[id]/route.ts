import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/errors";
import { logError } from "@/lib/logger";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(fail("Unauthorized", "UNAUTHORIZED"), { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    if (!id) {
      return NextResponse.json(fail("Expense ID required", "VALIDATION_ERROR"), { status: 400 });
    }

    const expense = await prisma.expense.findFirst({
      where: { id, userId }
    });

    if (!expense) {
      return NextResponse.json(fail("Expense not found", "NOT_FOUND"), { status: 404 });
    }

    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json(ok({ deleted: true }));
  } catch (err) {
    logError("DELETE /api/expenses/[id] failed", { err });
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}
