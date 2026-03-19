"use client";

import { useState } from "react";
import { quizData } from "@/app/quiz/mockQuiz";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type Answer = {
  questionId: string;
  optionId: string;
};

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);

  const currentQuestion = quizData.questions[currentIndex];

  // select answer
  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);
      return [...filtered, { questionId, optionId }];
    });
  };

  //  next question
  const nextQuestion = () => {
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  //  submit
  const submitQuiz = async () => {
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();

      setScore(data.score);
      setFinished(true);
    } catch (err) {
      console.error(err);
      alert("Алдаа гарлаа");
    }
  };

  const selected = answers.find((a) => a.questionId === currentQuestion?.id);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {/*  RESULT */}
          {finished ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-lg p-10 text-center space-y-6"
            >
              <h1 className="text-3xl font-bold text-gray-800">
                🎉 Quiz дууслаа!
              </h1>

              <p className="text-gray-600">Quiz-д оролцсонд баярлалаа 🙌</p>

              <div className="text-4xl font-bold">
                {score} / {quizData.questions.length}
              </div>

              <p className="text-lg text-gray-500">
                {Math.round(((score || 0) / quizData.questions.length) * 100)}%
              </p>

              <Button
                onClick={() => window.location.reload()}
                className="w-full h-14 text-lg"
              >
                Дахин эхлэх
              </Button>
            </motion.div>
          ) : !started ? (
            /*  INTRO */
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="bg-white rounded-2xl shadow-lg p-10 text-center space-y-6"
            >
              <h1 className="text-3xl font-bold text-gray-800">Quiz эхлэх</h1>

              <p className="text-gray-600 leading-relaxed">
                Танд бид 20 сонирхолтой асуулт бэлдлээ.
                <br />
                Нэг асуултад хариулсны дараа буцах боломжгүй тул анхааралтай
                хариулна уу.
                <br />
                Танд амжилт хүсье 🚀
              </p>

              <Button
                onClick={() => setStarted(true)}
                className="w-full h-14 text-lg"
              >
                Start Quiz
              </Button>
            </motion.div>
          ) : (
            /* QUIZ */
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-lg font-semibold text-gray-700">Quiz</h1>

                <span className="text-sm text-gray-500 font-medium">
                  {currentIndex + 1} / {quizData.questions.length}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{
                      width: `${
                        ((currentIndex + 1) / quizData.questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                  {currentQuestion.text}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.options.map((opt, i) => {
                    const isSelected = selected?.optionId === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition
                          ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full border text-sm font-medium">
                          {String.fromCharCode(65 + i)}
                        </div>

                        <span className="text-left text-base">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8">
                {currentIndex === quizData.questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={answers.length !== quizData.questions.length}
                    className="w-full h-14 text-lg"
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    disabled={!selected}
                    onClick={nextQuestion}
                    className="w-full h-14 text-lg"
                  >
                    Next →
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
