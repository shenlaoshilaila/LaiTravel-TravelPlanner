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
    const wrongSoundRef = useRef<HTMLAudioElement | null>(null); // 🎵 sound reference

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

        // Focus input shortly after game starts
        setTimeout(() => inputRef.current?.focus(), 200);
    };

    // 🍎 Generate random left child (0–5)
    const generateNewLeft = () => {
        if (rootValue === null) return;

        // 🎯 Generate number from 0 to rootValue (inclusive)
        const random = Math.floor(Math.random() * (rootValue + 1));

        setLeftChild(random);
        setRightChild(null);
        setUserAnswer("");

        // Focus the input after new question
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
            setScore((prev) => prev + 10); // 💯 Add 10 points per correct answer

            // 🎉 Show win GIF after 10 correct answers
            if (correctCount + 1 >= 10) {
                setShowWinGif(true);
                setTimeout(() => setShowWinGif(false), 1000);
                setCorrectCount(0);
            }

            // Generate new question after delay
            setTimeout(() => {
                generateNewLeft();
                setMessage("");
            }, 1200);
        } else {
            // ❌ Wrong answer
            setMessage("❌ Try again!");
            setShowWrongGif(true);

            // 🔊 Play sound
            wrongSoundRef.current?.play().catch(() => {});

            setTimeout(() => setShowWrongGif(false), 1000);

            // Refocus input to try again
            setTimeout(() => inputRef.current?.focus(), 200);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 text-white font-sans relative overflow-hidden">
            {/* 🎯 Fixed title */}
            <h1 className="absolute top-[40px] left-1/2 -translate-x-1/2 text-5xl font-extrabold flex items-center gap-2">
                🍎 Components Game
            </h1>

            {/* 🧮 Score Box */}
            {gameStarted && (
                <div className="absolute top-[60px] left-[40px] bg-white/20 border border-white/30 rounded-2xl p-4 w-[120px] text-center shadow-lg backdrop-blur-sm">
                    <p className="text-xl font-semibold text-yellow-300">Score</p>
                    <p className="text-3xl font-bold text-white mt-1">{score}</p>
                </div>
            )}

            {/* 🎮 Step 1: Input root number */}
            {!gameStarted && (
                <div className="absolute top-[150px] left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4">
                    <label className="text-lg">Enter a number (1–10):</label>
                    <input
                        type="number"
                        value={rootValue ?? ""}
                        onChange={(e) => setRootValue(Number(e.target.value))}
                        className="text-black px-3 py-2 rounded-md text-center w-32"
                    />
                    <button
                        onClick={startGame}
                        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-bold"
                    >
                        Start
                    </button>
                    {message && <p className="text-red-300">{message}</p>}
                </div>
            )}

            {/* 🎯 Step 2: Game Display */}
            {gameStarted && (
                <div className="absolute top-[150px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-transparent">
                    {/* 🍎 Root Apple */}
                    <div className="absolute left-[200px] top-[-100px] w-[500px] h-[500px] flex items-center justify-center">
                        <Image
                            src="/image/appleroot.png"
                            alt="root apple"
                            fill
                            style={{ objectFit: "contain" }}
                        />
                        <span className="absolute text-white text-8xl font-bold top-[160px]">
                            {rootValue}
                        </span>
                    </div>

                    {/* 🍏 Left Apple */}
                    {leftChild !== null && (
                        <div className="absolute left-[60px] top-[80px] w-[500px] h-[500px] flex items-center justify-center">
                            <Image
                                src="/image/appleleft.png"
                                alt="left apple"
                                fill
                                style={{ objectFit: "contain" }}
                            />
                            <span className="absolute text-white text-7xl font-bold top-[180px] left-[190px]">
                                {leftChild}
                            </span>
                        </div>
                    )}

                    {/* 🍎 Right Apple (answer area) */}
                    <div className="absolute left-[350px] top-[70px] w-[500px] h-[500px] flex items-center justify-center">
                        <Image
                            src="/image/appleright.png"
                            alt="right apple"
                            fill
                            style={{ objectFit: "contain" }}
                        />
                        {rightChild !== null ? (
                            <span className="absolute text-white text-7xl font-bold top-[180px] left-[250px]">
                                {rightChild}
                            </span>
                        ) : (
                            <input
                                ref={inputRef}
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        checkAnswer();
                                    }
                                }}
                                className="absolute w-[60px] text-center text-black rounded-md bg-white/90 border border-gray-300"
                                style={{
                                    height: "50px",
                                    top: "200px",
                                    right: "210px",
                                    fontSize: "40px",
                                }}
                            />
                        )}
                    </div>

                    {/* 🌿 Connection Lines */}
                    {gameStarted && (
                        <>
                            {/* Line: Root → Left */}
                            <div
                                className="absolute bg-blue-300"
                                style={{
                                    width: "4px",
                                    height: "100px",
                                    top: "220px",
                                    left: "600px",
                                    transform: "rotate(135deg)",
                                    transformOrigin: "top left",
                                    borderRadius: "2px",
                                }}
                            />
                            {/* Line: Root → Right */}
                            <div
                                className="absolute bg-blue-300"
                                style={{
                                    width: "4px",
                                    height: "100px",
                                    top: "150px",
                                    left: "350px",
                                    transform: "rotate(45deg)",
                                    transformOrigin: "top left",
                                    borderRadius: "2px",
                                }}
                            />
                        </>
                    )}
                </div>
            )}

            {/* 🧠 Feedback Message */}
            {message && (
                <p
                    className={`absolute bottom-[100px] left-1/2 -translate-x-1/2 text-xl font-semibold ${
                        message.includes("Good")
                            ? "text-green-300"
                            : "text-red-300"
                    }`}
                >
                    {message}
                </p>
            )}

            {/* 🔘 Submit Button */}
            {gameStarted && rightChild === null && (
                <button
                    onClick={checkAnswer}
                    className="absolute bottom-[150px] left-1/2 -translate-x-[20%] bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                >
                    Submit
                </button>
            )}

            {/* ❌ Wrong Answer GIF */}
            {showWrongGif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Image
                        src="/image/keep-trying.gif"
                        alt="Keep Trying"
                        width={300}
                        height={300}
                        className="rounded-2xl shadow-lg"
                    />
                </div>
            )}

            {/* 🎉 Win GIF */}
            {showWinGif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Image
                        src="/image/congrats.gif"
                        alt="Congratulations!"
                        width={400}
                        height={400}
                        className="rounded-2xl shadow-lg"
                    />
                </div>
            )}

            {/* 🎵 Wrong answer sound */}
            <audio ref={wrongSoundRef} src="/music/wrong.wav" preload="auto" />
        </main>
    );
}
