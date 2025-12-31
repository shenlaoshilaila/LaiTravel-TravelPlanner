"use client";
import React, { useState } from "react";
import Image from "next/image";

type Question = {
    a: number;
    b: number;
    op: "+" | "-";
};

export default function MathUnder10Page() {
    const [baseNumber, setBaseNumber] = useState<number | null>(null);
    const [startInput, setStartInput] = useState("");
    const [question, setQuestion] = useState<Question | null>(null);
    const [answer, setAnswer] = useState("");
    const [message, setMessage] = useState("");
    const [score, setScore] = useState(0);
    const [gif, setGif] = useState<string | null>(null);

    const successGifs = ["/image/mathy1.gif", "/image/mathy2.gif"];
    const wrongGifs = ["/image/mathw1.gif", "/image/mathw2.gif"];

    const playRandomGif = (gifs: string[], duration = 2000) => {
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
        setGif(randomGif);
        setTimeout(() => setGif(null), duration);
    };

    // 🔑 UPDATED LOGIC HERE
    const generateQuestion = (num: number) => {
        const isAdd = Math.random() > 0.5;

        if (isAdd) {
            // Addition: a + b = num
            const a = Math.floor(Math.random() * (num + 1));
            const b = num - a;
            setQuestion({ a, b, op: "+" });
        } else {
            // Subtraction: num - b = answer
            const b = Math.floor(Math.random() * (num + 1));
            setQuestion({ a: num, b, op: "-" });
        }

        setAnswer("");
        setMessage("");
    };

    const startGame = () => {
        const num = Number(startInput);
        if (num < 1 || num > 10) {
            setMessage("❌ Please enter a number between 1 and 10");
            return;
        }
        setBaseNumber(num);
        setScore(0);
        setGif(null);
        generateQuestion(num);
    };

    const checkAnswer = () => {
        if (!question) return;

        const correct =
            question.op === "+"
                ? question.a + question.b
                : question.a - question.b;

        if (Number(answer) === correct) {
            const newScore = score + 10;
            setScore(newScore);
            setMessage("✅ Correct! +10 points");

            if (newScore === 100) {
                playRandomGif(successGifs, 3000);
            }

            setTimeout(() => generateQuestion(baseNumber!), 800);
        } else {
            setMessage("❌ Try again");
            playRandomGif(wrongGifs, 2000);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center text-center p-6 relative">
            <h1 className="text-4xl font-bold mb-4">🧮 Math Under 10</h1>

            {baseNumber && (
                <div className="text-xl font-bold mb-4">
                    ⭐ Score: {score}
                </div>
            )}

            {/* GIF Overlay */}
            {gif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
                    <Image
                        src={gif}
                        alt="feedback gif"
                        width={300}
                        height={300}
                        className="rounded-xl shadow-lg"
                    />
                </div>
            )}

            {/* Start Screen */}
            {!baseNumber && (
                <div className="flex flex-col gap-4">
                    <input
                        type="number"
                        placeholder="Enter a number (1–10)"
                        value={startInput}
                        onChange={(e) => setStartInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && startGame()}
                        className="border rounded px-4 py-2 text-lg text-center"
                    />
                    <button
                        onClick={startGame}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg"
                    >
                        Start
                    </button>
                    <p className="text-red-500">{message}</p>
                </div>
            )}

            {/* Game Screen */}
            {baseNumber && question && (
                <div className="flex flex-col gap-4 mt-6">
                    <div className="text-3xl font-bold">
                        {question.a} {question.op} {question.b} = ?
                    </div>

                    <input
                        type="number"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                        className="border rounded px-4 py-2 text-lg text-center"
                    />

                    <button
                        onClick={checkAnswer}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg"
                    >
                        Submit
                    </button>

                    <p className="text-lg">{message}</p>
                </div>
            )}
        </main>
    );
}
