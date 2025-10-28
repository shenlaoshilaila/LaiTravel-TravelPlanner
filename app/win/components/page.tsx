"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";

export default function ComponentsGamePage() {
    const [rootValue, setRootValue] = useState<number | null>(null);
    const [leftChild, setLeftChild] = useState<number | null>(null);
    const [rightChild, setRightChild] = useState<number | null>(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [message, setMessage] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [showWrongGif, setShowWrongGif] = useState(false);
    const [showWinGif, setShowWinGif] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [score, setScore] = useState(0);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

    // 🎮 Start game
    const startGame = () => {
        if (!rootValue || rootValue < 1 || rootValue > 10) {
            setMessage("Please enter a number between 1–10!");
            return;
        }
        setGameStarted(true);
        generateNewLeft();
        setRightChild(null);
        setMessage("");
        setCorrectCount(0);
        setScore(0);
        setTimeout(() => inputRef.current?.focus(), 200);
    };

    // 🍎 Generate random left child
    const generateNewLeft = () => {
        if (rootValue === null) return;
        const random = Math.floor(Math.random() * (rootValue + 1));
        setLeftChild(random);
        setRightChild(null);
        setUserAnswer("");
        setTimeout(() => inputRef.current?.focus(), 150);
    };

    // 🧠 Check answer
    const checkAnswer = () => {
        if (leftChild === null || rootValue === null) return;
        const correct = rootValue - leftChild;
        const guess = Number(userAnswer);

        if (guess === correct) {
            setRightChild(guess);
            setMessage("✅ Good job!");
            setCorrectCount((prev) => prev + 1);
            setScore((prev) => prev + 10);

            if (correctCount + 1 >= 10) {
                setShowWinGif(true);
                setTimeout(() => setShowWinGif(false), 1000);
                setCorrectCount(0);
            }

            setTimeout(() => {
                generateNewLeft();
                setMessage("");
            }, 1200);
        } else {
            setMessage("❌ Try again!");
            setShowWrongGif(true);
            wrongSoundRef.current?.play().catch(() => {});
            setTimeout(() => setShowWrongGif(false), 1000);
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 text-white font-sans relative overflow-hidden">
            {/* ✅ Title */}
            <h1 className="absolute top-[4vw] left-1/2 -translate-x-1/2 text-[6vw] sm:text-5xl font-extrabold flex items-center gap-2">
                🍎 Components Game
            </h1>

            {/* 🧮 Score */}
            {gameStarted && (
                <div className="absolute top-[4vw] left-[5vw] bg-white/20 border border-white/30 rounded-2xl p-3 w-[22vw] max-w-[120px] text-center shadow-lg backdrop-blur-sm">
                    <p className="text-[4vw] sm:text-xl font-semibold text-yellow-300">Score</p>
                    <p className="text-[6vw] sm:text-3xl font-bold text-white mt-1">{score}</p>
                </div>
            )}

            {/* ✏️ Step 1: Input */}
            {!gameStarted && (
                <div className="absolute top-[35vh] left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4 text-center">
                    <label className="text-lg sm:text-xl">Enter a number (1–10):</label>
                    <input
                        type="number"
                        value={rootValue ?? ""}
                        onChange={(e) => setRootValue(Number(e.target.value))}
                        className="text-black px-3 py-2 rounded-md text-center w-[40vw] max-w-[150px]"
                    />
                    <button
                        onClick={startGame}
                        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-bold text-[4vw] sm:text-lg"
                    >
                        Start
                    </button>
                    {message && <p className="text-red-300 text-sm sm:text-base">{message}</p>}
                </div>
            )}

            {/* 🍎 Step 2: Game Display */}
            {gameStarted && (
                <div className="relative mx-auto mt-[25vh] w-full max-w-[800px] aspect-[4/3]">
                    {/* 🌳 Root Apple */}
                    <div className="absolute left-1/2 top-[0%] -translate-x-1/2 w-[55%] aspect-square flex items-center justify-center">
                        <Image src="/image/appleroot.png" alt="root apple" fill style={{ objectFit: "contain" }} />
                        <span className="absolute text-white font-bold text-[8vw] sm:text-7xl -translate-y-[30%]">{rootValue}</span>
                    </div>

                    {/* 🍏 Left Apple */}
                    {leftChild !== null && (
                        <div className="absolute left-[5%] top-[35%] w-[55%] aspect-square flex items-center justify-center">
                            <Image src="/image/appleleft.png" alt="left apple" fill style={{ objectFit: "contain" }} />
                            <span className="absolute text-white font-bold text-[7vw] sm:text-6xl -translate-y-[40%] -translate-x-[85%]">{leftChild}</span>
                        </div>
                    )}

                    {/* 🍎 Right Apple (answer) */}
                    <div className="absolute right-[5%] top-[35%] w-[55%] aspect-square flex items-center justify-center">
                        <Image src="/image/appleright.png" alt="right apple" fill style={{ objectFit: "contain" }} />
                        {rightChild !== null ? (
                            <span className="absolute text-white font-bold text-[7vw] sm:text-6xl -translate-y-[40%] -translate-x-[15%]">{rightChild}</span>
                        ) : (
                            <input
                                ref={inputRef}
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                                className="absolute w-[18vw] max-w-[40px] h-[10vw] max-h-[100px] text-center text-black rounded-md bg-white/90 border border-gray-300 text-[5vw] sm:text-3xl -translate-y-[35%]"
                                style={{ height: "auto" }}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* 💬 Message */}
            {message && gameStarted && (
                <p
                    className={`absolute bottom-[20vh] left-1/2 -translate-x-1/2 text-[5vw] sm:text-xl font-semibold ${
                        message.includes("Good") ? "text-green-300" : "text-red-300"
                    }`}
                >
                    {message}
                </p>
            )}

            {/* 🔘 Submit Button */}
            {gameStarted && rightChild === null && (
                <button
                    onClick={checkAnswer}
                    className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-bold text-[4vw] sm:text-lg"
                >
                    Submit
                </button>
            )}

            {/* ❌ Wrong Answer GIF */}
            {showWrongGif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Image src="/image/keep-trying.gif" alt="Keep Trying" width={300} height={300} className="rounded-2xl shadow-lg" />
                </div>
            )}

            {/* 🎉 Win GIF */}
            {showWinGif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Image src="/image/congrats.gif" alt="Congratulations!" width={400} height={400} className="rounded-2xl shadow-lg" />
                </div>
            )}

            {/* 🎵 Wrong Answer Sound */}
            <audio ref={wrongSoundRef} src="/music/wrong.wav" preload="auto" />
        </main>
    );
}
