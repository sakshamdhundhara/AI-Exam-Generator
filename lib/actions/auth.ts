"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return { error: "Missing fields" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return { error: "User already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An error occurred during registration." };
  }
}
