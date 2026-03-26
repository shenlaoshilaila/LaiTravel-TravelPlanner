"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function OneMultiplyTwoPage() {
    const [num1, setNum1] = useState(10); // two-digit
    const [num2, setNum2] = useState(2);  // one-digit

    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");

    const [correctCount, setCorrectCount] = useState(0);
    const [score, setScore] = useState(0);

    const [showGoodGif, setShowGoodGif] = useState(false);
    const [showBadGif, setShowBadGif] = useState(false);

    const [currentGif, setCurrentGif] = useState("");

    // 🎯 Generate problem
    const generateProblem = () => {
        const n1 = Math.floor(Math.random() * 90) + 10; // 10–99
        const n2 = Math.floor(Math.random() * 9) + 1;   // 1–9

        setNum1(n1);
        setNum2(n2);

        setAnswer("");
        setFeedback("");
    };

    useEffect(() => {
        generateProblem();
    }, []);

    // ✅ Check answer
    const checkAnswer = () => {
        const correct = num1 * num2;

        if (parseInt(answer) === correct) {
            setFeedback("correct");
            setScore((prev) => prev + 10);

            setCorrectCount((prev) => {
                const newCount = prev + 1;

                if (newCount >= 10) {
                    const gif =
                        Math.random() < 0.5
                            ? "/image/good1.gif"
                            : "/image/good2.gif";

                    setCurrentGif(gif);
                    setShowGoodGif(true);

                    setTimeout(() => {
                        setShowGoodGif(false);
                        setCorrectCount(0);
                        generateProblem();
                    }, 5000);
                } else {
                    setTimeout(() => {
                        generateProblem();
                    }, 600);
                }

                return newCount;
            });
        } else {
            setFeedback("wrong");

            const gif =
                Math.random() < 0.5
                    ? "/image/bad1.gif"
                    : "/image/bad2.gif";

            setCurrentGif(gif);
            setShowBadGif(true);

            setTimeout(() => {
                setShowBadGif(false);
            }, 3000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            checkAnswer();
        }
    };

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#f7f9fc] text-gray-900 relative">

            {/* GOOD GIF */}
            {showGoodGif && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <Image
                        src={currentGif}
                        alt="Good Job"
                        width={400}
                        height={400}
                        className="rounded-3xl shadow-2xl"
                    />
                </div>
            )}

            {/* BAD GIF */}
            {showBadGif && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <Image
                        src={currentGif}
                        alt="Try Again"
                        width={350}
                        height={350}
                        className="rounded-2xl shadow-xl"
                    />
                </div>
            )}

            <h1 className="text-4xl font-extrabold mb-6">✖ One Multiply Two</h1>

            {/* SCORE */}
            <div className="bg-white px-6 py-3 rounded-2xl shadow-lg mb-6 text-xl font-bold text-purple-600">
                Score: {score}
            </div>

            {/* QUESTION */}
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center w-96">

                <div className="text-5xl font-bold mb-6">
                    {num1} × {num2}
                </div>

                {/* INPUT */}
                <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full text-center text-2xl border-2 rounded-xl p-3 outline-none focus:ring-4 focus:ring-purple-300"
                    placeholder="Your Answer"
                />

                {/* FEEDBACK */}
                <div className="h-10 mt-3">
                    {feedback === "correct" && (
                        <p className="text-green-600 text-lg font-semibold animate-pulse">
                            ✔ Correct!
                        </p>
                    )}
                    {feedback === "wrong" && (
                        <p className="text-red-500 text-lg font-semibold">
                            ✖ Try again!
                        </p>
                    )}
                </div>

                {/* BUTTON */}
                <button
                    onClick={checkAnswer}
                    className="
                        w-full mt-4 py-3 bg-purple-500 hover:bg-purple-600
                        transition-all rounded-xl text-white font-bold text-xl
                        active:scale-95 shadow-md
                    "
                >
                    Check
                </button>

            </div>
        </div>
    );
}