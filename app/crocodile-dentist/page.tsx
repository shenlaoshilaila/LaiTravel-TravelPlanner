"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";

export default function CrocodileDentistPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [phase, setPhase] = useState<"intro" | "image">("intro");
    const [isPlaying, setIsPlaying] = useState(false);
    const [clickedTeeth, setClickedTeeth] = useState<number[]>([]); // track clicked teeth

    const handleStart = () => {
        setIsPlaying(true);
        videoRef.current?.play();
    };

    const handleRestart = () => {
        setPhase("intro");
        setIsPlaying(false);
        setClickedTeeth([]); // reset all teeth
        setTimeout(() => {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }, 100);
    };

    const handleToothClick = (id: number) => {
        // ensure only one disappear per click
        setClickedTeeth((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const isVisible = (id: number) => !clickedTeeth.includes(id);

    return (
        <div className="relative flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-black text-center">
            {/* 🎥 Intro Video */}
            {phase === "intro" && (
                <video
                    ref={videoRef}
                    src="/image/alli2.mp4"
                    className="absolute top-0 left-0 w-full h-full object-cover"
                    preload="auto"
                    controls={false}
                    onEnded={() => {
                        setPhase("image");
                        setIsPlaying(false);
                    }}
                />
            )}

            {/* 🐊 Alligator Image + Teeth */}
            {phase === "image" && (
                <div className="relative w-full h-full">
                    {/* 🦷 Tooth 1 */}
                    {isVisible(1) && (
                        <button
                            key={`tooth-1`}
                            onClick={() => handleToothClick(1)}
                            className="absolute inset-0 z-20 w-full h-full"
                        >
                            <Image
                                src="/image/tooth1.png"
                                alt="Tooth 1"
                                fill
                                className="object-contain hover:scale-105 transition-transform duration-300"
                            />
                        </button>
                    )}

                    {/* 🦷 Tooth 2 */}
                    {isVisible(2) && (
                        <button
                            key={`tooth-2`}
                            onClick={() => handleToothClick(2)}
                            className="absolute z-20"
                            style={{
                                top: "43vh",
                                left: "63vw",
                                width: "180vw",
                                height: "180vw",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <Image
                                src="/image/tooth2.png"
                                alt="Tooth 2"
                                fill
                                className="object-contain"
                            />
                        </button>
                    )}

                    {/* 🦷 Tooth 3 */}
                    {isVisible(3) && (
                        <button
                            key={`tooth-3`}
                            onClick={() => handleToothClick(3)}
                            className="absolute z-20"
                            style={{
                                top: "43vh",
                                left: "69vw",
                                width: "180vw",
                                height: "180vw",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <Image
                                src="/image/tooth3.png"
                                alt="Tooth 3"
                                fill
                                className="object-contain"
                            />
                        </button>
                    )}

                    {/* 🦷 Tooth 4 */}
                    {isVisible(4) && (
                        <button
                            key={`tooth-4`}
                            onClick={() => handleToothClick(4)}
                            className="absolute z-20"
                            style={{
                                top: "46vh",
                                left: "67vw",
                                width: "180vw",
                                height: "180vw",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <Image
                                src="/image/tooth4.png"
                                alt="Tooth 4"
                                fill
                                className="object-contain"
                            />
                        </button>
                    )}

                    {/* 🦷 Tooth 5 */}
                    {isVisible(5) && (
                        <button
                            key={`tooth-5`}
                            onClick={() => handleToothClick(5)}
                            className="absolute z-20"
                            style={{
                                top: "47vh",
                                left: "64vw",
                                width: "180vw",
                                height: "180vw",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <Image
                                src="/image/tooth5.png"
                                alt="Tooth 5"
                                fill
                                className="object-contain"
                            />
                        </button>
                    )}

                    {/* 🦷 Tooth 6 */}
                    {isVisible(6) && (
                        <button
                            key={`tooth-6`}
                            onClick={() => handleToothClick(6)}
                            className="absolute z-20"
                            style={{
                                top: "50vh",
                                left: "63vw",
                                width: "180vw",
                                height: "180vw",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <Image
                                src="/image/tooth6.png"
                                alt="Tooth 6"
                                fill
                                className="object-contain"
                            />
                        </button>
                    )}

                    {/* 🦷 Tooth 7 */}
                    {isVisible(7) && (
                        <button
                            key={`tooth-7`}
                            onClick={() => handleToothClick(7)}
                            className="absolute z-20"
                            style={{
                                top: "75vh",
                                left: "53vw",
                                width: "180vw",
                                height: "180vw",
                                transform: "translate(-50%, -50%)",
                            }}
                        >
                            <Image
                                src="/image/tooth7.png"
                                alt="Tooth 7"
                                fill
                                className="object-contain"
                            />
                        </button>
                    )}

                    {/* 🐊 Alligator Image (on top) */}
                    <Image
                        src="/image/alli.png"
                        alt="Alligator Open Mouth"
                        fill
                        className="object-contain z-50 pointer-events-none"
                    />

                    {/* 🔁 Restart Button */}
                    <button
                        onClick={handleRestart}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3
            bg-yellow-400 text-black font-semibold rounded-lg
            hover:bg-yellow-500 transition shadow-lg z-30"
                    >
                        🔁 Restart
                    </button>
                </div>
            )}

            {/* ▶️ Start Button */}
            {phase === "intro" && !isPlaying && (
                <button
                    onClick={handleStart}
                    className="absolute inset-0 flex items-center justify-center
                     bg-black/50 text-white text-5xl font-extrabold
                     transition-all duration-300 hover:bg-black/70"
                >
                    ▶️ Start Game
                </button>
            )}

            {/* 🐊 Title */}
            <h1 className="absolute top-10 text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg">
                🐊 Crocodile Dentist
            </h1>
        </div>
    );
}
