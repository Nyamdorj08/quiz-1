import { prisma } from "../src/lib/prisma";
import { quizData } from "../src/app/quiz/mockQuiz";

async function main() {
  const quiz = await prisma.quiz.create({
    data: {
      id: quizData.id,
      title: quizData.title,
      questions: {
        create: quizData.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: {
            create: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.id === q.correctOptionId,
            })),
          },
        })),
      },
    },
  });

  console.log("✅ Seed done", quiz.id);
}

main();
