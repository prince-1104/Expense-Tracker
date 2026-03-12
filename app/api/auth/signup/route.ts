import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/services/userService";
import { fail, ok } from "@/lib/errors";
import { logError } from "@/lib/logger";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(fail("Invalid signup data", "VALIDATION_ERROR"), {
        status: 400
      });
    }

    const { email, password } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        fail("Email is already registered", "EMAIL_IN_USE"),
        { status: 409 }
      );
    }

    const user = await createUser(email, password);

    return NextResponse.json(
      ok({
        id: user.id,
        email: user.email
      }),
      { status: 201 }
    );
  } catch (err) {
    logError("Signup API failed", { err });
    return NextResponse.json(
      fail("Internal server error", "INTERNAL_ERROR"),
      { status: 500 }
    );
  }
}

