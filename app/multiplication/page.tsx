"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function MultiplicationGamePage() {
    const [left, setLeft] = useState(0);
    const [right, setRight] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");

    const [correctCount, setCorrectCount] = useState(0);
    const [score, setScore] = useState(0);

    const [showGoodGif, setShowGoodGif] = useState(false);
    const [showBadGif, setShowBadGif] = useState(false);

    const [currentGif, setCurrentGif] = useState("");

    const generateProblem = () => {
        setLeft(Math.floor(Math.random() * 10));
        setRight(Math.floor(Math.random() * 10));
        setAnswer("");
        setFeedback("");
    };

    useEffect(() => {
        generateProblem();
    }, []);

    const checkAnswer = () => {
        const correctAnswer = left * right;

        // ---------------------
        // 🎉 CORRECT ANSWER
        // ---------------------
        if (parseInt(answer) === correctAnswer) {
            setFeedback("correct");

            setScore((prev) => prev + 10); // ⭐ ADD SCORE

            setCorrectCount((prev) => {
                const newCount = prev + 1;

                if (newCount >= 10) {
                    const gif = Math.random() < 0.5 ? "/image/good1.gif" : "/image/good2.gif";
                    setCurrentGif(gif);
                    setShowGoodGif(true);

                    setTimeout(() => {
                        setShowGoodGif(false);
                        setCorrectCount(0);
                        generateProblem();
                    }, 5005);
                } else {
                    setTimeout(() => {
                        generateProblem();
                    }, 600);
                }

                return newCount;
            });

        } else {
            // ---------------------
            // ❌ WRONG ANSWER
            // ---------------------
            setFeedback("wrong");

            const gif = Math.random() < 0.5 ? "/image/bad1.gif" : "/image/bad2.gif";
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

            {/* 🎉 Good GIF */}
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

            {/* ❌ Bad GIF */}
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

            <h1 className="text-4xl font-extrabold mb-6">✖️ Multiplication Game</h1>

            {/* ⭐ SCORE BOARD */}
            <div className="bg-white px-6 py-3 rounded-2xl shadow-lg mb-6 text-xl font-bold text-blue-600">
                Score: {score}
            </div>

            {/* Question Box */}
            <div className="bg-white p-10 rounded-3xl shadow-xl text-center w-80">
                <div className="text-5xl font-bold mb-6">
                    {left} × {right}
                </div>

                {/* Input */}
                <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full text-center text-2xl border-2 rounded-xl p-3 outline-none focus:ring-4 focus:ring-blue-300"
                    placeholder="Your answer"
                />

                {/* Feedback */}
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

                {/* Button */}
                <button
                    onClick={checkAnswer}
                    className="
                        w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600
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
