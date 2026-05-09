"use client";

import { useEffect, useState } from "react";

export default function MathUnder20Page() {
    const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

    const [question, setQuestion] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState(0);

    const [userAnswer, setUserAnswer] = useState("");
    const [message, setMessage] = useState("");

    const [score, setScore] = useState(0);

    // Generate new problem
    const generateQuestion = (target: number) => {

        const randomType = Math.floor(Math.random() * 3);

        // 1️⃣ Missing number addition
        // Example: 6 + ? = 12
        if (randomType === 0) {

            const first = Math.floor(Math.random() * target);
            const missing = target - first;

            setQuestion(`${first} + ? = ${target}`);
            setCorrectAnswer(missing);
        }

            // 2️⃣ Normal addition
        // Example: 6 + 6 = ?
        else if (randomType === 1) {

            const first = Math.floor(Math.random() * target);
            const second = target - first;

            setQuestion(`${first} + ${second} = ?`);
            setCorrectAnswer(target);
        }

            // 3️⃣ Normal subtraction
        // Example: 12 - 5 = ?
        else {

            const subtract = Math.floor(Math.random() * target);

            setQuestion(`${target} - ${subtract} = ?`);
            setCorrectAnswer(target - subtract);
        }

        setUserAnswer("");
    };

    // Start first question after choosing number
    useEffect(() => {
        if (selectedNumber !== null) {
            generateQuestion(selectedNumber);
        }
    }, [selectedNumber]);

    const checkAnswer = () => {

        if (parseInt(userAnswer) === correctAnswer) {

            setMessage("✅ Correct!");
            setScore(score + 10);

            setTimeout(() => {
                setMessage("");

                if (selectedNumber !== null) {
                    generateQuestion(selectedNumber);
                }

            }, 1000);

        } else {

            setMessage("❌ Wrong! Try Again!");

            // SAME QUESTION stays
        }
    };

    // First screen: pick number
    if (selectedNumber === null) {
        return (
            <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-cyan-400 to-blue-600 text-white p-6">

                <h1 className="text-5xl font-bold mb-10">
                    🧮 Pick a Number
                </h1>

                <div className="grid grid-cols-2 gap-4">

                    {Array.from({ length: 10 }, (_, i) => i + 11).map((num) => (

                        <button
                            key={num}
                            onClick={() => setSelectedNumber(num)}
                            className="w-32 py-4 bg-white text-blue-600 font-bold text-3xl rounded-2xl hover:scale-105 transition shadow-xl"
                        >
                            {num}
                        </button>

                    ))}

                </div>

            </main>
        );
    }

    // Game screen
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-500 to-pink-500 text-white p-6">

            <h1 className="text-5xl font-bold mb-6">
                🎯 Number {selectedNumber}
            </h1>

            <div className="bg-white text-black rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">

                <div className="text-4xl font-bold mb-8">
                    {question}
                </div>

                <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            checkAnswer();
                        }
                    }}
                    className="w-full p-4 text-3xl border-2 border-gray-300 rounded-2xl text-center mb-6"
                    placeholder="Answer"
                />

                <button
                    onClick={checkAnswer}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-2xl rounded-2xl transition"
                >
                    Submit
                </button>

                <div className="mt-6 text-2xl font-bold">
                    ⭐ Score: {score}
                </div>

                <div className="mt-4 text-2xl h-10 font-bold">
                    {message}
                </div>

                <button
                    onClick={() => {
                        setSelectedNumber(null);
                        setScore(0);
                    }}
                    className="mt-8 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold"
                >
                    🔙 Pick Another Number
                </button>

            </div>

        </main>
    );
}