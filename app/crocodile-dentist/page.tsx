"use client";
import React, { useRef, useState, useEffect } from "react";
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
        setClickedTeeth((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
    };

    const isVisible = (id: number) => !clickedTeeth.includes(id);

    // ✅ Always reset state when switching to image phase
    useEffect(() => {
        if (phase === "image") setClickedTeeth([]);
    }, [phase]);

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
                        setClickedTeeth([]); // reset teeth when video ends
                        setPhase("image");
                        setIsPlaying(false);
                    }}
                />
            )}

            {/* 🐊 Alligator Image + Teeth */}
            {phase === "image" && (
                <div className="relative w-full h-full">

                    {/* 🦷 Tooth 1 stays fixed */}
                    {isVisible(1) && (
                        <>
                            {/* 🦷 Tooth Image (does NOT move) */}
                            <div
                                className="absolute z-20"
                                style={{
                                    top: "43vh",
                                    left: "26vw", // keep tooth in correct position
                                    width: "14vw",
                                    height: "14vw",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <Image
                                    src="/image/tooth1.png"
                                    alt="Tooth 1"
                                    fill
                                    className="object-cover scale-125 pointer-events-none"
                                />
                            </div>

                            {/* 🟥 Clickable red box (moves separately) */}
                            <button
                                onClick={() => handleToothClick(1)}
                                className="absolute z-30 cursor-pointer"
                                style={{
                                    top: "43vh",
                                    left: "22vw", // 👈 move red box to left relative to tooth
                                    width: "10vw",
                                    height: "10vw",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(255, 0, 0, 0.15)", // red transparent overlay
                                    border: "2px solid red",
                                }}
                            />
                        </>
                    )}



                    {/* 🦷 Tooth 2 (clip-path click area, visible image always shown) */}
                    {isVisible(2) && (
                        <>
                            {/* 🦷 Tooth Image (does NOT move) */}
                            <div
                                className="absolute z-20"
                                style={{
                                    top: "46vh",
                                    left: "30vw", // keep tooth in correct position
                                    width: "8vw",
                                    height: "8vw",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <Image
                                    src="/image/tooth2.png"
                                    alt="Tooth 2"
                                    fill
                                    className="object-cover scale-125 pointer-events-none"
                                />
                            </div>

                            {/* 🟥 Clickable red box (moves separately) */}
                            <button
                                onClick={() => handleToothClick(2)}
                                className="absolute z-30 cursor-pointer"
                                style={{
                                    top: "48vh",
                                    left: "30vw", // 👈 move red box to left relative to tooth
                                    width: "5vw",
                                    height: "5vw",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(255, 0, 0, 0.15)", // red transparent overlay
                                    border: "2px solid red",
                                }}
                            />
                        </>
                    )}




                    {/* 🦷 Tooth 3 */}
                    {isVisible(3) && (
                        <>
                            {/* 🦷 Tooth Image (does NOT move) */}
                            <div
                                className="absolute z-20"
                                style={{
                                    top: "44vh",
                                    left: "36vw", // keep tooth in correct position
                                    width: "10vw",
                                    height: "10vw",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <Image
                                    src="/image/tooth3.png"
                                    alt="Tooth 3"
                                    fill
                                    className="object-cover scale-125 pointer-events-none"
                                />
                            </div>

                            {/* 🟥 Clickable red box (moves separately) */}
                            <button
                                onClick={() => handleToothClick(3)}
                                className="absolute z-30 cursor-pointer"
                                style={{
                                    top: "48vh",
                                    left: "35vw", // 👈 move red box to left relative to tooth
                                    width: "5vw",
                                    height: "5vw",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(255, 0, 0, 0.15)", // red transparent overlay
                                    border: "2px solid red",
                                }}
                            />
                        </>
                    )}

                    {/* 🦷 Tooth 4 */}
                    {isVisible(4) && (
                        <>
                            {/* 🦷 Tooth Image (does NOT move) */}
                            <div
                                className="absolute z-20"
                                style={{
                                    top: "46vh",
                                    left: "48vw", // keep tooth in correct position
                                    width: "15vw",
                                    height: "15vw",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <Image
                                    src="/image/tooth4.png"
                                    alt="Tooth 4"
                                    fill
                                    className="object-cover scale-125 pointer-events-none"
                                />
                            </div>

                            {/* 🟥 Clickable red box (moves separately) */}
                            <button
                                onClick={() => handleToothClick(4)}
                                className="absolute z-30 cursor-pointer"
                                style={{
                                    top: "47vh",
                                    left: "40vw", // 👈 move red box to left relative to tooth
                                    width: "5vw",
                                    height: "5vw",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(255, 0, 0, 0.15)", // red transparent overlay
                                    border: "2px solid red",
                                }}
                            />
                        </>
                    )}

                    {/* 🦷 Tooth 5 */}
                    {isVisible(5) && (
                        <>
                            {/* 🦷 Tooth Image (does NOT move) */}
                            <div
                                className="absolute z-20"
                                style={{
                                    top: "46vh",
                                    left: "60vw", // keep tooth in correct position
                                    width: "15vw",
                                    height: "15vw",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <Image
                                    src="/image/tooth5.png"
                                    alt="Tooth 5"
                                    fill
                                    className="object-cover scale-125 pointer-events-none"
                                />
                            </div>

                            {/* 🟥 Clickable red box (moves separately) */}
                            <button
                                onClick={() => handleToothClick(5)}
                                className="absolute z-30 cursor-pointer"
                                style={{
                                    top: "47vh",
                                    left: "40vw", // 👈 move red box to left relative to tooth
                                    width: "5vw",
                                    height: "5vw",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(255, 0, 0, 0.15)", // red transparent overlay
                                    border: "2px solid red",
                                }}
                            />
                        </>
                    )}

                    {/* 🦷 Tooth 6 */}
                    {isVisible(6) && (
                        <>
                            {/* 🦷 Tooth Image (does NOT move) */}
                            <div
                                className="absolute z-20"
                                style={{
                                    top: "46vh",
                                    left: "60vw", // keep tooth in correct position
                                    width: "55vw",
                                    height: "55vw",
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <Image
                                    src="/image/tooth6.png"
                                    alt="Tooth 6"
                                    fill
                                    className="object-cover scale-125 pointer-events-none"
                                />
                            </div>

                            {/* 🟥 Clickable red box (moves separately) */}
                            <button
                                onClick={() => handleToothClick(6)}
                                className="absolute z-30 cursor-pointer"
                                style={{
                                    top: "45vh",
                                    left: "52vw", // 👈 move red box to left relative to tooth
                                    width: "5vw",
                                    height: "5vw",
                                    transform: "translate(-50%, -50%)",
                                    backgroundColor: "rgba(255, 0, 0, 0.15)", // red transparent overlay
                                    border: "2px solid red",
                                }}
                            />
                        </>
                    )}

                    {/* 🦷 Tooth 7 */}


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
