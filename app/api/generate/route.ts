import { NextRequest } from "next/server";
import { examGraph } from "@/lib/agents/examGraph";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { prisma } from "@/lib/prisma";

export const maxDuration = 300; // 5 minutes (for vercel if deployed)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = await req.json();

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  let streamOpen = true;

  const sendEvent = async (data: Record<string, unknown>) => {
    if (!streamOpen) return;
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    } catch (error) {
      streamOpen = false;
      throw error;
    }
  };

  // Start graph processing in background
  (async () => {
    try {
      let currentStep = "INIT";
      
      const eventStream = await examGraph.stream(
        {
          params,
          webContext: [],
          draftQuestions: [],
          reviewFeedback: null,
          finalExam: null,
          revisionCount: 0,
          error: null,
          step: "INIT"
        },
        { recursionLimit: 50 }
      );

      for await (const value of eventStream) {
        // Value is an object mapping node name to its state output
        const nodeName = Object.keys(value)[0];
        const stateOutput = (value as any)[nodeName];

        if (stateOutput.step) {
          currentStep = stateOutput.step;
          let message = "";
          let progress = 0;
          switch (currentStep) {
            case "GENERATING":
              message = "Generating questions using Gemini...";
              progress = 30;
              break;
            case "REVIEWING":
              message = "Checking every question against the requested subject and topics...";
              progress = 60;
              break;
            case "REVISING":
              message = "Revising questions that did not pass the relevance review...";
              progress = 75;
              break;
            case "FORMATTING":
              message = "Formatting the final exam...";
              progress = 90;
              break;
            case "DONE":
              message = "Exam generation complete!";
              progress = 100;
              if (stateOutput.finalExam && session?.user?.email) {
                try {
                  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
                  if (user) {
                    await prisma.exam.create({
                      data: {
                        userId: user.id,
                        subject: stateOutput.finalExam.metadata?.subject || "Generated Exam",
                        totalMarks: stateOutput.finalExam.totalMarks || 100,
                        numQuestions: stateOutput.finalExam.sections?.reduce((acc: number, sec: any) => acc + (sec.questions?.length || 0), 0) || 10,
                        difficulty: stateOutput.finalExam.metadata?.difficulty || "MEDIUM",
                        timeLimit: stateOutput.finalExam.timeLimit || 60,
                        topics: JSON.stringify(stateOutput.finalExam.metadata?.topics || []),
                        questionTypes: JSON.stringify(stateOutput.finalExam.metadata?.questionTypes || []),
                        content: JSON.stringify(stateOutput.finalExam),
                        status: "SAVED"
                      }
                    });
                  }
                } catch (autoSaveErr) {
                  console.warn("Auto-save generated exam history warning:", autoSaveErr);
                }
              }
              break;
            case "ERROR":
              message = "An error occurred during generation.";
              progress = 100;
              break;
          }

          await sendEvent({
            step: currentStep,
            message,
            progress,
            exam: stateOutput.finalExam // will be null until DONE
          });
        }
      }
    } catch (error: unknown) {
      console.error("Exam generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      const message = errorMessage.includes("Gemini API key is not configured")
        ? "Gemini API access is not configured. Add a valid GOOGLE_API_KEY or GEMINI_API_KEY to .env.local, then restart the server."
        : errorMessage.includes("API_KEY_INVALID") ||
          errorMessage.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
          errorMessage.includes("API key not valid")
          ? "Google rejected the Gemini credential. Use an API key created for the Gemini API, then update .env.local and restart the server."
        : errorMessage.includes("did not pass subject and topic relevance review")
          ? errorMessage
          : "Exam generation failed. Please try again.";
      if (streamOpen) {
        try {
          await sendEvent({ step: "ERROR", message, progress: 100 });
        } catch (streamError) {
          console.warn("Could not send generation error because the response stream closed:", streamError);
        }
      }
    } finally {
      if (streamOpen) {
        try {
          await writer.close();
          streamOpen = false;
        } catch (closeError) {
          streamOpen = false;
          console.warn("Could not close the generation response stream:", closeError);
        }
      }
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
