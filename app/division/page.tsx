"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function DivisionGame() {
    const [dividend, setDividend] = useState(0);
    const [divisor, setDivisor] = useState(0);
    const [correctAnswer, setCorrectAnswer] = useState(0);

    const [userAnswer, setUserAnswer] = useState("");
    const [message, setMessage] = useState("");
    const [score, setScore] = useState(0);

    // ⭐ GIF state
    const [gif, setGif] = useState<string | null>(null);
    const [isGifShowing, setIsGifShowing] = useState(false);

    // WRONG GIFS
    const wrongGifs = [
        "/image/dn1.gif",
        "/image/dn2.gif",
        "/image/dn3.gif"
    ];

    // SUCCESS GIFS (when reaching 100, 200, 300…)
    const successGifs = [
        "/image/dy1.gif",
        "/image/dy2.gif"
    ];

    // FUNCTION: play GIF for 3 seconds
    const playGif = (gifList: string[]) => {
        const randomGif = gifList[Math.floor(Math.random() * gifList.length)];

        setGif(randomGif);
        setIsGifShowing(true);

        // hide after 3 seconds
        setTimeout(() => {
            setGif(null);
            setIsGifShowing(false);
        }, 3000);
    };

    // Generate problem using ONLY 1–10 multiplication table
    const generateProblem = () => {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;

        setDividend(a * b);
        setDivisor(a);
        setCorrectAnswer(b);

        setUserAnswer("");
        setMessage("");
    };

    useEffect(() => {
        generateProblem();
    }, []);

    const checkAnswer = () => {
        if (isGifShowing) return; // block input while gif is showing

        if (parseInt(userAnswer) === correctAnswer) {
            const newScore = score + 10;
            setScore(newScore);

            setMessage("✅ Correct! +10 points");

            // 🎉 If user reaches 100, 200, 300... play success gif
            if (newScore % 100 === 0) {
                playGif(successGifs);
            }

            setTimeout(() => {
                generateProblem();
            }, 700);
        } else {
            setMessage("❌ Wrong, try again!");

            // ❌ Play one of the wrong GIFs
            playGif(wrongGifs);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-indigo-100 text-center p-6">

            {/* ⭐ SCOREBOARD */}
            <div className="mt-6 mb-4 bg-white px-8 py-3 rounded-xl shadow-lg text-2xl font-bold text-green-600">
                ⭐ Score: {score}
            </div>

            <h1 className="text-4xl font-extrabold text-indigo-700 mb-10">
                ➗ Division Game (1–10)
            </h1>

            {/* DIVISION PROBLEM */}
            <div className="text-6xl font-bold text-gray-900 mb-8">
                {dividend} ÷ {divisor}
            </div>

            {/* Disable input while GIF showing */}
            {!isGifShowing && (
                <>
                    <input
                        type="number"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                        className="w-48 text-center text-2xl p-2 border-2 border-indigo-400 rounded-lg"
                        placeholder="Your answer"
                        autoFocus
                    />

                    <button
                        onClick={checkAnswer}
                        className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white text-xl font-bold px-6 py-3 rounded-xl transition-all"
                    >
                        Submit
                    </button>
                </>
            )}

            {/* Feedback Text */}
            {!isGifShowing && (
                <div className="text-2xl font-bold mt-6">
                    {message}
                </div>
            )}

            {/* GIF Overlay */}
            {isGifShowing && gif && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="relative w-80 h-80">
                        <Image
                            src={gif}
                            alt="Feedback GIF"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

        </main>
    );
}
