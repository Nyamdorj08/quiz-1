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
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const currentQuestion = quizData.questions[currentIndex];

  // сонголт хийх
  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const filtered = prev.filter((a) => a.questionId !== questionId);
      return [...filtered, { questionId, optionId }];
    });
  };

  // дараагийн асуулт
  const nextQuestion = () => {
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // submit
  const submitQuiz = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers, name: name.trim() }),
      });

      // 🔥 ERROR HANDLE
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Алдаа гарлаа");
        return;
      }

      setFinished(true);
    } catch (err) {
      console.error(err);
      alert("Серверийн алдаа");
    } finally {
      setLoading(false);
    }
  };

  const selected = answers.find((a) => a.questionId === currentQuestion?.id);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative bg-cover bg-center"
      style={{ backgroundImage: "url('/quiz.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#3967F0]/60 backdrop-blur-[3px]" />

      {/* Logo */}
      <img src="/nemo.svg" alt="logo" className="absolute top-6 left-6 w-20" />

      <div className="relative w-full max-w-xl">
        <AnimatePresence mode="wait">
          {/* RESULT */}
          {finished ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-10 text-center space-y-6"
            >
              <h1 className="text-3xl font-bold text-white">Quiz дууслаа!</h1>

              <p className="text-white text-xl">{name} 👏</p>

              <p className="text-white text-2xl">
                Таны хариулт амжилттай бүртгэгдлээ
              </p>
            </motion.div>
          ) : !started ? (
            /* INTRO */
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-10 text-center space-y-6"
            >
              <h1 className="text-2xl font-bold text-white">Quiz эхлүүлэх</h1>

              <p className="text-white/80">Амжилт хүсье 🚀</p>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Нэрээ оруулна уу"
                className="w-full p-3 rounded-xl bg-white/80 text-black outline-none"
              />

              <Button
                disabled={!name.trim()}
                onClick={() => setStarted(true)}
                className="w-full h-14 bg-white text-[#3967F0]"
              >
                Эхлүүлэх
              </Button>
            </motion.div>
          ) : (
            /* QUIZ */
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl p-8"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 text-white">
                <h1 className="font-semibold text-xl">{name}</h1>
                <span>
                  {currentIndex + 1} / {quizData.questions.length}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="w-full h-2 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{
                      width: `${
                        ((currentIndex + 1) / quizData.questions.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <h2 className="text-2xl font-bold text-white mb-6">
                {currentQuestion.text}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((opt, i) => {
                  const isSelected = selected?.optionId === opt.id;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectAnswer(currentQuestion.id, opt.id)}
                      className={`w-full p-4 rounded-xl border flex gap-4 transition
                        ${
                          isSelected
                            ? "bg-white text-[#3967F0]"
                            : "text-white border-white/30 hover:bg-white/10"
                        }`}
                    >
                      <span>{String.fromCharCode(65 + i)}.</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-8">
                {currentIndex === quizData.questions.length - 1 ? (
                  <Button
                    onClick={submitQuiz}
                    disabled={
                      answers.length !== quizData.questions.length || loading
                    }
                    className="w-full h-14 bg-white text-[#3967F0] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#3967F0] border-t-transparent rounded-full animate-spin"></span>
                        Илгээж байна...
                      </>
                    ) : (
                      "Илгээх"
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled={!selected}
                    onClick={nextQuestion}
                    className="w-full h-14 bg-white text-[#3967F0]"
                  >
                    Дараах →
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
