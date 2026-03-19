import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1. basic validation
    if (!body.answers || !Array.isArray(body.answers)) {
      return Response.json(
        { error: "Invalid answers format" },
        { status: 400 },
      );
    }

    const answers = body.answers;

    // 2. duplicate question хамгаалах
    const uniqueQuestions = new Set(answers.map((a: any) => a.questionId));

    if (uniqueQuestions.size !== answers.length) {
      return Response.json(
        { error: "Duplicate answers detected" },
        { status: 400 },
      );
    }

    // 3. бүх option DB дээр байгаа эсэх шалгах
    const optionIds = answers.map((a: any) => a.optionId);

    const options = await prisma.option.findMany({
      where: {
        id: { in: optionIds },
      },
    });

    if (options.length !== answers.length) {
      return Response.json(
        { error: "Invalid option detected" },
        { status: 400 },
      );
    }

    // 4. score бодох
    let score = 0;

    for (const option of options) {
      if (option.isCorrect) score++;
    }

    // 5. result үүсгэх
    const result = await prisma.result.create({
      data: {
        userId: "user_1", // дараа auth холбож болно
        quizId: "quiz_1",
        score,
      },
    });

    // 6. answer хадгалах
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
  } catch (error) {
    console.error(error);

    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
