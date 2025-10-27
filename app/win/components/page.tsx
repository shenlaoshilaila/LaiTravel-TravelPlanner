"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function ComponentsGamePage() {
    const [rootValue, setRootValue] = useState<number | null>(null);
    const [leftChild, setLeftChild] = useState<number | null>(null);
    const [rightChild, setRightChild] = useState<number | null>(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [message, setMessage] = useState("");
    const [gameStarted, setGameStarted] = useState(false);

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
    };

    // 🍎 Generate random left child
    const generateNewLeft = () => {
        const random = Math.floor(Math.random() * 6); // 0–3
        setLeftChild(random);
        setRightChild(null);
        setUserAnswer("");
    };

    // 🧠 Check answer
    const checkAnswer = () => {
        if (leftChild === null || rootValue === null) return;
        const correct = rootValue - leftChild;
        const guess = Number(userAnswer);
        if (guess === correct) {
            setRightChild(guess);
            setMessage("✅ Good job!");
            setTimeout(() => {
                generateNewLeft();
                setMessage("");
            }, 1200);
        } else {
            setMessage("❌ Try again!");
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 text-white font-sans relative overflow-hidden">
            {/* 🎯 Fixed title */}
            <h1 className="absolute top-[40px] left-1/2 -translate-x-1/2 text-5xl font-extrabold flex items-center gap-2">
                🍎 Components Game
            </h1>

            {/* 🎮 Step 1: Input root number (shown before game starts) */}
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
                            <span className="absolute text-white text-7xl font-bold  top-[180px] left-[190px]">
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
                                type="number"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                className="absolute w-[50px] text-center text-black rounded-md bg-white/90 border border-gray-300"
                                style={{
                                    height: "50px",
                                    top: "200px",
                                    right: "210px",
                                    fontSize: "50px"
                                }}
                            />
                        )}
                    </div>
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

            {/* 🌿 Connection Lines */}
            {/* Line: Root → Left */}
            {/* 🌿 Connection Lines — visible only when game starts */}
            {gameStarted && (
                <>
                    {/* Line: Root → Left */}
                    <div
                        className="absolute bg-blue-300"
                        style={{
                            width: "4px",
                            height: "100px",
                            top: "380px",
                            left: "860px",
                            transform: "rotate(130deg)",
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
                            top: "300px",
                            left: "600px",
                            transform: "rotate(45deg)",
                            transformOrigin: "top left",
                            borderRadius: "2px",
                        }}
                    />
                </>
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
        </main>
    );
}
