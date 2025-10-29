"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function ComponentsGamePage() {
    const [rootValue, setRootValue] = useState<number | null>(null);
    const [leftChild, setLeftChild] = useState<number | null>(null);
    const [rightChild, setRightChild] = useState<number | null>(null);
    const [userAnswer, setUserAnswer] = useState("");
    const [message, setMessage] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [showWrongGif, setShowWrongGif] = useState(false);
    const [wrongGifSrc, setWrongGifSrc] = useState("/image/keep-trying.gif");
    const [showWinGif, setShowWinGif] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [score, setScore] = useState(0);
    const [showKeypad, setShowKeypad] = useState(false);

    const keypadRef = useRef<HTMLDivElement | null>(null);
    const wrongSoundRef = useRef<HTMLAudioElement | null>(null);
    const chickenSoundRef = useRef<HTMLAudioElement | null>(null);
    const winnerSoundRef = useRef<HTMLAudioElement | null>(null);

    // ✅ Hide keypad when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                keypadRef.current &&
                !keypadRef.current.contains(event.target as Node)
            ) {
                setShowKeypad(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

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
    };

    // 🍎 Generate random left child
    const generateNewLeft = () => {
        if (rootValue === null) return;
        const random = Math.floor(Math.random() * (rootValue + 1));
        setLeftChild(random);
        setRightChild(null);
        setUserAnswer("");
    };

    // 🧠 Check answer
    const checkAnswer = () => {
        if (leftChild === null || rootValue === null) return;
        const correct = rootValue - leftChild;
        const guess = Number(userAnswer);
        setShowKeypad(false);

        if (guess === correct) {
            setRightChild(guess);
            setMessage("✅ Good job!");
            setCorrectCount((prev) => prev + 1);
            setScore((prev) => prev + 10);

            // 🏆 Win condition
            if (correctCount + 1 >= 10) {
                setShowWinGif(true);
                const winSound = winnerSoundRef.current;
                if (winSound) {
                    winSound.currentTime = 0;
                    winSound.loop = true;
                    winSound.play().catch(() => {});
                    setTimeout(() => {
                        winSound.pause();
                        winSound.loop = false;
                    }, 3000);
                }

                setTimeout(() => {
                    setShowWinGif(false);
                    setCorrectCount(0);
                    generateNewLeft();
                    setMessage("");
                }, 3000);
                return;
            }

            setTimeout(() => {
                generateNewLeft();
                setMessage("");
            }, 1200);
        } else {
            setMessage("❌ Try again!");
            const randomIsChicken = Math.random() < 0.5;
            const chosenGif = randomIsChicken ? "/image/pp.gif" : "/image/keep-trying.gif";
            setWrongGifSrc(chosenGif);
            setShowWrongGif(true);

            const sound = randomIsChicken ? chickenSoundRef.current : wrongSoundRef.current;
            if (sound) {
                sound.currentTime = 0;
                sound.loop = true;
                sound.play().catch(() => {});
                setTimeout(() => {
                    sound.pause();
                    sound.loop = false;
                }, 3000);
            }

            // 🎬 Show wrong GIF for 3 seconds
            setTimeout(() => {
                setShowWrongGif(false);
                setUserAnswer(""); // 🧹 clear input automatically after feedback
            }, 3000);
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
                    <div className="absolute left-1/2 top-[0%] -translate-x-1/2 scale-[1.5] sm:scale-[1.3] w-[55%] aspect-square flex items-center justify-center">
                        <Image src="/image/appleroot.png" alt="root apple" fill style={{ objectFit: "contain" }} />
                        <span className="absolute text-white font-bold text-[8vw] sm:text-7xl -translate-y-[30%]">
                            {rootValue}
                        </span>
                    </div>

                    {/* 🍏 Left Apple */}
                    {leftChild !== null && (
                        <div className="absolute left-[5%] top-[35%] scale-[1.4] sm:scale-[1.2] w-[55%] aspect-square flex items-center justify-center">
                            <Image src="/image/appleleft.png" alt="left apple" fill style={{ objectFit: "contain" }} />
                            <span className="absolute text-white font-bold text-[7vw] sm:text-6xl -translate-y-[40%] -translate-x-[85%]">
                                {leftChild}
                            </span>
                        </div>
                    )}

                    {/* 🍎 Right Apple */}
                    <div
                        className="absolute right-[0vw] top-[20vh] scale-[1.5] sm:scale-[1.1] w-[60vw] sm:w-[55%] aspect-square flex flex-col items-center justify-center"
                    >
                        <Image src="/image/appleright.png" alt="right apple" fill style={{ objectFit: "contain" }} />
                        {rightChild !== null ? (
                            <span className="absolute text-white font-bold text-[7vw] sm:text-6xl -translate-y-[40%] -translate-x-[15%]">
                                {rightChild}
                            </span>
                        ) : (
                            <div className="absolute flex flex-col items-center -translate-y-[35%]">
                                {/* Tap box */}
                                <div
                                    onClick={() => setShowKeypad((prev) => !prev)}
                                    className="w-[18vw] max-w-[40px] h-[19vw] max-h-[120px] flex items-center justify-center text-black rounded-md bg-white/90 border border-gray-300 text-[5vw] sm:text-3xl cursor-pointer select-none"
                                >
                                    {userAnswer || "?"}
                                </div>

                                {/* ✅ Keypad */}
                                {showKeypad && (
                                    <div
                                        ref={keypadRef}
                                        className="fixed bottom-[5vh] left-1/2 -translate-x-1/2 z-50 animate-fadeIn w-[85vw] max-w-[320px]"
                                    >
                                        <div className="grid grid-cols-3 gap-3 bg-white/20 p-5 rounded-3xl backdrop-blur-md shadow-2xl border border-white/30">
                                            {[1,2,3,4,5,6,7,8,9].map((num)=>(
                                                <button key={num} onClick={()=>setUserAnswer((p)=>(p+num).slice(0,2))}
                                                        className="bg-pink-400 hover:bg-pink-500 active:scale-95 transition-transform w-full h-[18vw] sm:h-16 rounded-xl text-white text-[7vw] sm:text-2xl font-bold shadow-md">
                                                    {num}
                                                </button>
                                            ))}
                                            {/* Submit */}
                                            <button onClick={checkAnswer}
                                                    className="bg-green-500 hover:bg-green-600 active:scale-95 transition-transform w-full h-[18vw] sm:h-16 rounded-xl text-white text-[6vw] sm:text-xl font-bold shadow-md">
                                                ✔
                                            </button>
                                            {/* 0 */}
                                            <button onClick={()=>setUserAnswer((p)=>(p+'0').slice(0,2))}
                                                    className="bg-pink-400 hover:bg-pink-500 active:scale-95 transition-transform w-full h-[18vw] sm:h-16 rounded-xl text-white text-[7vw] sm:text-2xl font-bold shadow-md">
                                                0
                                            </button>
                                            {/* Delete */}
                                            <button onClick={()=>setUserAnswer((p)=>p.slice(0,-1))}
                                                    className="bg-gray-600 hover:bg-gray-700 active:scale-95 transition-transform w-full h-[18vw] sm:h-16 rounded-xl text-white text-[6vw] sm:text-xl font-bold shadow-md">
                                                ⌫
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ❌ Wrong GIF */}
            {showWrongGif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50 transition-opacity duration-700">
                    <Image src={wrongGifSrc} alt="Try Again" width={300} height={300} className="rounded-2xl shadow-lg" priority />
                </div>
            )}

            {/* 🎉 Win GIF */}
            {showWinGif && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
                    <Image src="/image/congrats.gif" alt="Congratulations!" width={400} height={400} className="rounded-2xl shadow-lg" />
                </div>
            )}

            {/* 🎵 Sounds */}
            <audio ref={wrongSoundRef} src="/music/wrong.wav" preload="auto" />
            <audio ref={chickenSoundRef} src="/music/chicken.wav" preload="auto" />
            <audio ref={winnerSoundRef} src="/music/winer.wav" preload="auto" />
        </main>
    );
}
