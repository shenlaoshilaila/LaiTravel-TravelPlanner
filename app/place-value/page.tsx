"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function PlaceValueGame() {
    const [number, setNumber] = useState(0);
    const [place, setPlace] = useState("");

    const [correctQuotient, setCorrectQuotient] = useState(0);
    const [correctRemainder, setCorrectRemainder] = useState(0);

    const [userQuotient, setUserQuotient] = useState("");
    const [userRemainder, setUserRemainder] = useState("");

    const [step, setStep] = useState<"quotient" | "remainder">("quotient");
    const [message, setMessage] = useState("");
    const [score, setScore] = useState(0);

    // ⭐ GIF + Sound state
    const [gif, setGif] = useState<string | null>(null);
    const [isGifShowing, setIsGifShowing] = useState(false);

    // GIF lists
    const goodGifs = ["/image/pr1.gif", "/image/pr2.gif", "/image/pr3.gif"];
    const wrongGifs = ["/image/pw1.gif", "/image/pw2.gif", "/image/pw3.gif"];

    // ⭐ SOUND FILES
    const wrongSound = typeof Audio !== "undefined" ? new Audio("/music/wrong.wav") : null;
    const winSound = typeof Audio !== "undefined" ? new Audio("/music/win.mp3") : null;

    const playGifWithSound = (type: "good" | "wrong") => {
        const list = type === "good" ? goodGifs : wrongGifs;
        const randomGif = list[Math.floor(Math.random() * list.length)];

        setGif(randomGif);
        setIsGifShowing(true);

        // 🔊 Play sound
        if (type === "good" && winSound) {
            winSound.currentTime = 0;
            winSound.play();
        }
        if (type === "wrong" && wrongSound) {
            wrongSound.currentTime = 0;
            wrongSound.play();
        }

        // ⏳ Hide after 3 seconds + STOP SOUND
        setTimeout(() => {
            setIsGifShowing(false);
            setGif(null);

            // 🔇 STOP SOUND EXACTLY AT 3 SECONDS
            if (wrongSound) {
                wrongSound.pause();
                wrongSound.currentTime = 0;
            }
            if (winSound) {
                winSound.pause();
                winSound.currentTime = 0;
            }
        }, 3000);
    };


    // Generate a new question
    const generateQuestion = () => {
        const randomNum = Math.floor(Math.random() * 9000) + 100;
        const places = ["ones", "tens", "hundreds", "thousands"];
        const chosen = places[Math.floor(Math.random() * places.length)];

        let divisor = 1;
        if (chosen === "tens") divisor = 10;
        if (chosen === "hundreds") divisor = 100;
        if (chosen === "thousands") divisor = 1000;

        const quotient = Math.floor(randomNum / divisor);
        const remainder = randomNum % divisor;

        setNumber(randomNum);
        setPlace(chosen);
        setCorrectQuotient(quotient);
        setCorrectRemainder(remainder);

        setUserQuotient("");
        setUserRemainder("");
        setStep("quotient");
        setMessage("");
    };

    useEffect(() => {
        generateQuestion();
    }, []);

    // Step 1: Quotient
    const checkQuotient = () => {
        if (isGifShowing) return;

        if (parseInt(userQuotient) === correctQuotient) {
            setMessage("✅ Correct! Now enter the remainder.");
            setStep("remainder");
        } else {
            setMessage("❌ Wrong, try again!");
            playGifWithSound("wrong");
        }
    };

    // Step 2: Remainder
    const checkRemainder = () => {
        if (isGifShowing) return;

        if (parseInt(userRemainder) === correctRemainder) {
            setMessage("🎉 Correct! +10 Points!");
            const newScore = score + 10;
            setScore(newScore);

            // ⭐ Only play success GIF at multiples of 100
            if (newScore % 100 === 0) {
                playGifWithSound("good");
            }

            setTimeout(() => {
                generateQuestion();
            }, 1200);
        } else {
            setMessage("❌ Wrong, try again!");
            playGifWithSound("wrong");
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-blue-100 text-center p-6">

            <h1 className="text-4xl font-extrabold text-blue-700 mt-10">
                🔢 Place Value Division Game
            </h1>

            {/* ⭐ Scoreboard */}
            <div className="mt-2 mb-6 bg-white px-8 py-3 rounded-xl shadow-lg text-2xl font-bold text-green-600">
                ⭐ Score: {score}
            </div>

            {/* Number */}
            <div className="text-7xl font-bold text-gray-900 mb-8">
                {number}
            </div>

            <div className="text-2xl font-semibold text-gray-800 mb-6">
                How many <span className="text-blue-600">{place}</span>?
            </div>

            {/* Disable input while GIF is showing */}
            {!isGifShowing && (
                <>
                    {step === "quotient" && (
                        <div className="flex flex-col items-center gap-4">
                            <input
                                type="number"
                                value={userQuotient}
                                onChange={(e) => setUserQuotient(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && checkQuotient()}
                                className="w-48 text-center text-2xl p-2 border-2 border-blue-400 rounded-lg"
                                placeholder="Quotient"
                                autoFocus
                            />

                            <button
                                onClick={checkQuotient}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold px-6 py-3 rounded-xl transition-all"
                            >
                                Answer
                            </button>
                        </div>
                    )}

                    {step === "remainder" && (
                        <div className="flex flex-col items-center gap-4">
                            <input
                                type="number"
                                value={userRemainder}
                                onChange={(e) => setUserRemainder(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && checkRemainder()}
                                className="w-48 text-center text-2xl p-2 border-2 border-green-400 rounded-lg"
                                placeholder="Remainder"
                                autoFocus
                            />

                            <button
                                onClick={checkRemainder}
                                className="bg-green-500 hover:bg-green-600 text-white text-xl font-bold px-6 py-3 rounded-xl transition-all"
                            >
                                Submit
                            </button>
                        </div>
                    )}
                </>
            )}

            <div className="text-2xl font-bold mt-6">
                {!isGifShowing && message}
            </div>

            {/* ⭐ GIF Overlay */}
            {isGifShowing && gif && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                    <div className="relative w-80 h-80">
                        <Image src={gif} alt="gif" fill className="object-contain" />
                    </div>
                </div>
            )}
        </main>
    );
}
