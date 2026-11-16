"use server";

import { prisma } from "../prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../authOptions";
import { ExamDocument } from "../types";
import { revalidatePath } from "next/cache";

export async function saveExam(examDoc: ExamDocument) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  const exam = await prisma.exam.create({
    data: {
      userId: user.id,
      subject: examDoc.metadata.subject,
      totalMarks: examDoc.totalMarks,
      numQuestions: examDoc.sections.reduce((acc, sec) => acc + sec.questions.length, 0),
      difficulty: examDoc.metadata.difficulty,
      timeLimit: examDoc.timeLimit || 60,
      topics: JSON.stringify(examDoc.metadata.topics),
      questionTypes: JSON.stringify(examDoc.metadata.questionTypes),
      content: JSON.stringify(examDoc),
      status: "SAVED"
    }
  });

  revalidatePath("/dashboard");
  return exam;
}

export async function getExams() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return [];

  const exams = await prisma.exam.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return exams;
}

export async function getExamById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const exam = await prisma.exam.findUnique({
    where: { id }
  });

  if (!exam) return null;

  return exam;
}

export async function deleteExam(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) throw new Error("User not found");

  await prisma.exam.deleteMany({
    where: {
      id,
      userId: user.id
    }
  });

  revalidatePath("/dashboard");
  return { success: true };
}
