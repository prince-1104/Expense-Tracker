import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseExpenses } from "@/lib/expenseParser";
import { ok, fail } from "@/lib/errors";
import { parseDateParam, toEndOfDay, toStartOfDay } from "@/lib/date";
import { logError } from "@/lib/logger";

const postBodySchema = z.object({
  message: z.string().min(1).max(500).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  expenseDate: z.string().optional()
}).refine(
  (data) => (data.message != null) || (data.amount != null && data.category != null),
  { message: "Provide either message or amount and category" }
);

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
          // placeholder hash for non-credentials users (e.g. OAuth or migrated sessions)
          passwordHash: "external-auth"
        }
      }));
    const userId = dbUser.id;

    const { searchParams } = new URL(request.url);
    const startDate = parseDateParam(searchParams.get("start_date"));
    const endDate = parseDateParam(searchParams.get("end_date"));

    const start = startDate ? toStartOfDay(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? toEndOfDay(endDate) : new Date();

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: { gte: start, lte: end }
      },
      orderBy: { expenseDate: "desc" },
      take: 100
    });

    const data = expenses.map((e) => ({
      id: e.id,
      userId: e.userId,
      amount: Number(e.amount),
      category: e.category,
      description: e.description,
      expenseDate: e.expenseDate.toISOString(),
      createdAt: e.createdAt.toISOString()
    }));

    return NextResponse.json(ok(data));
  } catch (err) {
    logError("GET /api/expenses failed", { err });
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const parsed = postBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join("; ") || "Validation failed";
      return NextResponse.json(fail(msg, "VALIDATION_ERROR"), { status: 400 });
    }

    if (parsed.data.message) {
      try {
        const items = parseExpenses(parsed.data.message).map((p) => ({
          amount: p.amount,
          category: p.category.toLowerCase().trim(),
          description: p.description ?? null
        }));

        if (items.length > 1) {
          const now = new Date();
          const created = await prisma.$transaction(
            items.map((it) =>
              prisma.expense.create({
                data: {
                  userId,
                  amount: it.amount,
                  category: it.category,
                  description: it.description,
                  expenseDate: now
                }
              })
            )
          );

          return NextResponse.json(
            ok(
              created.map((expense) => ({
                id: expense.id,
                userId: expense.userId,
                amount: Number(expense.amount),
                category: expense.category,
                description: expense.description,
                expenseDate: expense.expenseDate.toISOString(),
                createdAt: expense.createdAt.toISOString()
              }))
            ),
            { status: 201 }
          );
        }

        const single = items[0]!;
        const expense = await prisma.expense.create({
          data: {
            userId,
            amount: single.amount,
            category: single.category,
            description: single.description,
            expenseDate: new Date()
          }
        });

        return NextResponse.json(
          ok({
            id: expense.id,
            userId: expense.userId,
            amount: Number(expense.amount),
            category: expense.category,
            description: expense.description,
            expenseDate: expense.expenseDate.toISOString(),
            createdAt: expense.createdAt.toISOString()
          }),
          { status: 201 }
        );
      } catch (e) {
        return NextResponse.json(
          fail(e instanceof Error ? e.message : "Invalid expense format", "VALIDATION_ERROR"),
          { status: 400 }
        );
      }
    } else {
      const amount = parsed.data.amount!;
      const category = parsed.data.category!.toLowerCase().trim();
      const description = parsed.data.description ?? null;
      let expenseDate = new Date();
      if (parsed.data.expenseDate) expenseDate = new Date(parsed.data.expenseDate);

      const expense = await prisma.expense.create({
        data: {
          userId,
          amount,
          category,
          description,
          expenseDate
        }
      });

      return NextResponse.json(
        ok({
          id: expense.id,
          userId: expense.userId,
          amount: Number(expense.amount),
          category: expense.category,
          description: expense.description,
          expenseDate: expense.expenseDate.toISOString(),
          createdAt: expense.createdAt.toISOString()
        }),
        { status: 201 }
      );
    }
  } catch (err) {
    logError("POST /api/expenses failed", { err });
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}
