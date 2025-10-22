"use client";
import React, { useState } from "react";

export default function WinPage() {
    const [digits, setDigits] = useState(["?", "?", "?", "?"]);
    const [currentIndex, setCurrentIndex] = useState(3); // start from ones place (index 3)
    const [finished, setFinished] = useState(false);

    // 🎲 roll digit function
    const rollDigit = (index: number) => {
        if (index !== currentIndex) return; // prevent skipping order

        const newDigits = [...digits];
        let value: number;

        // thousand place special probability
        if (index === 0) {
            const rand = Math.random() * 100;
            if (rand < 60) value = 0;
            else if (rand < 95) value = 1;
            else value = 2;
        } else {
            value = Math.floor(Math.random() * 10);
        }

        newDigits[index] = value.toString();
        setDigits(newDigits);

        // move to next (to the left)
        if (index > 0) {
            setCurrentIndex(index - 1);
        } else {
            setFinished(true);
        }
    };

    const resetGame = () => {
        setDigits(["?", "?", "?", "?"]);
        setCurrentIndex(3);
        setFinished(false);
    };

    const moneyValue = finished ? digits.join("") : null;

    return (
        <main className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-200 to-yellow-400 text-center text-gray-900">
            <h1 className="text-5xl font-extrabold mb-8 drop-shadow-lg">
                💰 Win Your Birthday Money 💰
            </h1>

            {/* 🔢 Boxes (thousand → one) */}
            <div className="flex gap-4 mb-8">
                {digits.map((d, i) => (
                    <div
                        key={i}
                        className={`w-20 h-20 border-4 rounded-lg flex items-center justify-center text-4xl font-bold shadow-md ${
                            i === currentIndex
                                ? "border-pink-600 bg-white text-black"
                                : "border-yellow-500 bg-yellow-50 text-gray-600"
                        }`}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* 🎯 Buttons */}
            <div className="flex gap-4 mb-10">
                {["Thousand", "Hundred", "Ten", "One"].map((label, i) => (
                    <button
                        key={i}
                        onClick={() => rollDigit(i)}
                        disabled={i !== currentIndex || finished}
                        className={`px-4 py-2 font-semibold rounded-lg shadow-md transition ${
                            i === currentIndex
                                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                : "bg-gray-300 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* 🎉 Result */}
            {moneyValue && (
                <div className="text-3xl font-bold animate-bounce">
                    🎉 You Won ${moneyValue}! 🎉
                </div>
            )}

            {/* 🔁 Play again */}
            <button
                onClick={resetGame}
                className="mt-8 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition shadow-lg"
            >
                Play Again
            </button>
        </main>
    );
}
