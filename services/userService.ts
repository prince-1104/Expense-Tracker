import { prisma } from "@/lib/prisma";
import { hash, compare } from "bcryptjs";

export async function createUser(email: string, password: string) {
  const passwordHash = await hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash
    }
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export async function verifyCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await compare(password, user.passwordHash);
  if (!isValid) return null;

  return user;
}

