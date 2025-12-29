"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

type Problem = {
    question: string;
    answer: number;
};

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addZeros(num: number, zeros: number) {
    return num * Math.pow(10, zeros);
}

function generateProblem(): Problem {
    const isMultiplication = Math.random() < 0.5;

    const a = randomInt(1, 9);
    const b = randomInt(1, 9);

    const zerosA = randomInt(1, 5);
    const zerosB = randomInt(1, 5);

    if (isMultiplication) {
        const x = addZeros(a, zerosA);
        const y = addZeros(b, zerosB);
        return { question: `${x} × ${y}`, answer: x * y };
    } else {
        const base = a * b;
        const dividend = base * Math.pow(10, zerosA + zerosB);
        const divisor = a * Math.pow(10, zerosB);
        return {
            question: `${dividend} ÷ ${divisor}`,
            answer: b * Math.pow(10, zerosA),
        };
    }
}

export default function MixCalculationGame() {
    const [problem, setProblem] = useState<Problem | null>(null);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [message, setMessage] = useState("");
    const [gif, setGif] = useState<string | null>(null);

    useEffect(() => {
        setProblem(generateProblem());
    }, []);

    function playGif(type: "win" | "lose") {
        const gifs =
            type === "win"
                ? ["/image/mixy1.gif", "/image/mixy2.gif"]
                : ["/image/mixn1.gif", "/image/mixn2.gif"];

        setGif(gifs[randomInt(0, gifs.length - 1)]);

        setTimeout(() => setGif(null), 5000); // ⏱️ 5 seconds
    }

    function checkAnswer() {
        if (!problem || input === "") return;

        if (Number(input) === problem.answer) {
            setScore((prev) => {
                const newScore = prev + 10;
                if (newScore === 100) {
                    playGif("win");
                }
                return newScore;
            });

            setMessage("✅ Correct! +10 points");
            setInput("");

            setTimeout(() => {
                setProblem(generateProblem());
                setMessage("");
            }, 800);
        } else {
            setMessage("❌ Try again");
            playGif("lose");
            setInput("");
        }
    }

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 text-white text-center px-4 overflow-hidden">
            <h1 className="text-4xl font-bold mb-6">🔀 Mix Calculation Game</h1>

            <div className="text-xl mb-4">Score: {score}</div>

            {problem && (
                <div className="text-3xl font-bold mb-6">
                    {problem.question}
                </div>
            )}

            <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                className="text-black text-xl px-4 py-2 rounded-lg mb-4 w-64"
                placeholder="Type answer & press Enter"
                autoFocus
            />

            <button
                onClick={checkAnswer}
                className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl hover:scale-105 transition"
            >
                Submit
            </button>

            {message && (
                <div className="mt-4 text-xl font-semibold">{message}</div>
            )}

            {/* 🎬 GIF Overlay */}
            {gif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
                    <Image
                        src={gif}
                        alt="Feedback GIF"
                        width={300}
                        height={300}
                        className="rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </main>
    );
}
