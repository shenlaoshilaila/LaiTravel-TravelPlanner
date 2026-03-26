"use client";
import React, { useState, useEffect } from "react";

export default function WinPage() {
    const [num1, setNum1] = useState(12);
    const [num2, setNum2] = useState(3);
    const [answer, setAnswer] = useState("");

    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [finished, setFinished] = useState(false);

    // 🎯 generate problem
    const generateProblem = () => {
        const n1 = Math.floor(Math.random() * 90) + 10; // 10–99
        const n2 = Math.floor(Math.random() * 8) + 2;   // ✅ 2–9 (NO ×1)

        setNum1(n1);
        setNum2(n2);
        setAnswer("");
        setFeedback("");
        setFinished(false);
    };

    useEffect(() => {
        generateProblem();
    }, []);

    const checkAnswer = () => {
        const correct = num1 * num2;
        const userAnswer = parseInt(answer);

        if (!isNaN(userAnswer) && userAnswer === correct) {
            setFeedback("correct");
            setScore((prev) => prev + 10);
            setFinished(true);

            setTimeout(() => {
                generateProblem();
            }, 1500);
        } else {
            setFeedback("wrong");
        }
    };

    return (
        <main className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-200 to-yellow-400 text-center text-gray-900">

            <h1 className="text-5xl font-extrabold mb-8 drop-shadow-lg">
                🧮 One Multiply Two
            </h1>

            {/* SCORE */}
            <div className="text-2xl font-bold mb-6">
                Score: {score}
            </div>

            {/* QUESTION */}
            <div className="bg-white p-10 rounded-3xl shadow-xl mb-6">
                <div className="text-5xl font-bold mb-6">
                    {num1} × {num2}
                </div>

                <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                    className="text-2xl text-center border-2 rounded-xl p-3 w-40 outline-none focus:ring-4 focus:ring-yellow-300"
                    placeholder="Answer"
                />

                {/* FEEDBACK */}
                <div className="h-10 mt-3">
                    {feedback === "correct" && (
                        <p className="text-green-600 font-bold text-lg">
                            ✔ Correct!
                        </p>
                    )}
                    {feedback === "wrong" && (
                        <p className="text-red-500 font-bold text-lg">
                            ✖ Try again!
                        </p>
                    )}
                </div>

                <button
                    onClick={checkAnswer}
                    className="mt-4 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                    Check
                </button>
            </div>

            {/* 🎉 WIN MESSAGE */}
            {finished && (
                <div className="text-3xl font-bold animate-bounce">
                    🎉 Nice Job! 🎉
                </div>
            )}

            {/* RESET */}
            <button
                onClick={generateProblem}
                className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition shadow-lg"
            >
                New Question
            </button>
        </main>
    );
}