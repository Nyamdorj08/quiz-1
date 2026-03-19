export const dynamic = "force-dynamic"; // 🔥 build crash fix

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { answers, name } = body;

    // 1. basic validation
    if (!answers || !Array.isArray(answers) || !name?.trim()) {
      return Response.json({ error: "Invalid data" }, { status: 400 });
    }

    // 2. бүх асуултад хариулсан эсэх
    const TOTAL_QUESTIONS = 10;

    if (answers.length !== TOTAL_QUESTIONS) {
      return Response.json(
        { error: "All questions must be answered" },
        { status: 400 },
      );
    }

    // 3. duplicate хамгаалах
    const uniqueQuestions = new Set(answers.map((a: any) => a.questionId));

    if (uniqueQuestions.size !== answers.length) {
      return Response.json(
        { error: "Duplicate answers detected" },
        { status: 400 },
      );
    }

    // 4. answer format шалгах
    if (
      answers.some(
        (a: any) =>
          typeof a.questionId !== "string" || typeof a.optionId !== "string",
      )
    ) {
      return Response.json({ error: "Invalid answer format" }, { status: 400 });
    }

    // 5. DB дээр option байгаа эсэх
    const optionIds = answers.map((a: any) => a.optionId);

    const options = await prisma.option.findMany({
      where: {
        id: { in: optionIds },
      },
    });

    // 🔥 DEBUG (production дээр бас хэрэгтэй)
    console.log("DB OPTIONS:", options.length);
    console.log("CLIENT OPTIONS:", optionIds.length);

    if (options.length !== answers.length) {
      return Response.json(
        { error: "Invalid option detected" },
        { status: 400 },
      );
    }

    // 6. score бодох
    const score = options.filter((opt) => opt.isCorrect).length;

    // 7. result үүсгэх
    const result = await prisma.result.create({
      data: {
        userId: "user_1",
        quizId: "quiz_1",
        score,
        name: name.trim(),
      },
    });

    // 8. answers хадгалах
    await prisma.answer.createMany({
      data: answers.map((a: any) => ({
        resultId: result.id,
        questionId: a.questionId,
        optionId: a.optionId,
      })),
    });

    return Response.json({
      success: true,
      score,
      total: answers.length,
    });
  } catch (error: any) {
    console.error("🔥 SUBMIT ERROR:", error?.message || error);

    return Response.json(
      { error: "Server error", details: error?.message },
      { status: 500 },
    );
  }
}
