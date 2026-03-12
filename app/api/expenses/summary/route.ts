import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/errors";
import { parseDateParam, toEndOfDay, toStartOfDay } from "@/lib/date";
import { logError } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(fail("Unauthorized", "UNAUTHORIZED"), { status: 401 });
    }
    const email = session.user.email!;

    const dbUser =
      (await prisma.user.findUnique({ where: { email } })) ??
      (await prisma.user.create({
        data: {
          email,
          passwordHash: "external-auth"
        }
      }));
    const userId = dbUser.id;

    const { searchParams } = new URL(request.url);
    const start = parseDateParam(searchParams.get("start"));
    const end = parseDateParam(searchParams.get("end"));

    const startDate = start ? toStartOfDay(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end ? toEndOfDay(end) : new Date();

    const where = {
      userId,
      expenseDate: { gte: startDate, lte: endDate }
    } as const;

    const [totals, grouped] = await prisma.$transaction([
      prisma.expense.aggregate({
        where,
        _sum: { amount: true },
        _count: { _all: true }
      }),
      prisma.expense.groupBy({
        by: ["category"],
        where,
        orderBy: { category: "asc" },
        _sum: { amount: true }
      })
    ]);

    const total_spent = Number(totals._sum.amount ?? 0);
    const transaction_count = totals._count._all ?? 0;

    const category_breakdown = grouped.map((g) => ({
      category: g.category,
      total: Number(g._sum?.amount ?? 0)
    }));

    return NextResponse.json(
      ok({
        total_spent,
        category_breakdown,
        transaction_count
      })
    );
  } catch (err) {
    logError("GET /api/expenses/summary failed", { err });
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}
