"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Sparkles, Trophy, XCircle } from "lucide-react";
import { useAppAuth } from "@/hooks/useAppAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { api, type QuizQuestion } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

export default function QuizComponent() {
  const { getToken } = useAppAuth();
  const { addToast } = useToast();
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const generate = async () => {
    if (!topic.trim()) {
      addToast("Enter a topic to generate a quiz", "error");
      return;
    }

    setLoading(true);
    setFinished(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);

    try {
      const token = await getToken();
      const res = await api.generateQuiz(topic.trim(), count, token ?? undefined);
      setQuestions(res.questions);
      addToast("Quiz generated!", "success");
    } catch (err) {
      setQuestions([]);
      addToast(err instanceof Error ? err.message : "Unable to generate quiz", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = () => {
    if (selected === null || answered) return;
    setAnswered(true);
    if (selected === questions[current].correct) setScore((value) => value + 1);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setFinished(false);
    setSelected(null);
    setAnswered(false);
  };

  const question = questions[current];

  return (
    <div className="space-y-6">
      {questions.length === 0 ? (
        <Card>
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Generate a Quiz</h2>
              <p className="mt-1 text-sm text-muted">
                Enter any topic and the questions will be generated from that topic.
              </p>
            </div>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              generate();
            }}
          >
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Topic</label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Example: DBMS normalization"
                className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Questions</label>
              <input
                type="number"
                min={3}
                max={20}
                value={count}
                onChange={(event) => setCount(Number(event.target.value))}
                className="w-full rounded-xl border border-border bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading || !topic.trim()}>
            {loading ? "Generating..." : "Start Quiz"}
          </Button>
          </form>
        </Card>
      ) : finished ? (
        <Card className="py-12 text-center">
          <Trophy className="mx-auto mb-4 h-16 w-16 text-primary" />
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <p className="mt-4 text-4xl font-bold text-primary">{score}/{questions.length}</p>
          <p className="mt-2 text-muted">{Math.round((score / questions.length) * 100)}% correct</p>
          <Button className="mt-6" onClick={resetQuiz}>
            New Quiz
          </Button>
        </Card>
      ) : question ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <div className="mb-4 flex justify-between text-sm text-muted">
                <span>Question {current + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              <h2 className="mb-6 text-lg font-bold">{question.question}</h2>
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isCorrect = index === question.correct;
                  const isSelected = index === selected;
                  let className = "border-border hover:border-primary";

                  if (answered) {
                    if (isCorrect) className = "border-green-500 bg-green-500/10";
                    else if (isSelected) className = "border-red-500 bg-red-500/10";
                  } else if (isSelected) {
                    className = "border-primary bg-primary/10";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => !answered && setSelected(index)}
                      disabled={answered}
                      className={`w-full rounded-xl border p-4 text-left transition-colors ${className}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                        <span>{option}</span>
                        {answered && isCorrect && <CheckCircle className="ml-auto h-5 w-5 text-green-500" />}
                        {answered && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted">
                  {question.explanation}
                </p>
              )}
              <div className="mt-6 flex gap-3">
                {!answered ? (
                  <Button onClick={submitAnswer} disabled={selected === null}>Submit</Button>
                ) : (
                  <Button onClick={next}>{current < questions.length - 1 ? "Next" : "Finish"}</Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      ) : null}
    </div>
  );
}
