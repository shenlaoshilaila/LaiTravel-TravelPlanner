"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function HappyBirthdayPage() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Try to autoplay the music when page loads
        const audio = audioRef.current;
        if (audio) {
            // Some browsers block autoplay without user interaction,
            // so catch any errors silently.
            audio.play().catch(() => {
                console.log("Autoplay blocked. Music will start after first user click.");
            });
        }
    }, []);

    return (
        <main className="relative h-screen flex flex-col items-center justify-center overflow-hidden text-center text-white">
            {/* 🎵 Background Music */}
            <audio ref={audioRef} src="/music/happy-birthday.mp3" loop />

            {/* 🎆 Fireworks background */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/image/fireworks.gif"
                    alt="Fireworks celebration"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* 🎉 Title */}
            <h1
                className="
                    text-6xl md:text-8xl font-extrabold
                    drop-shadow-2xl
                    animate-pop
                "
            >
                🎂 Happy Birthday Liya 🎉
            </h1>

            {/* 💰 Button */}
            <Link href="/win">
                <button
                    className="
                        mt-8 px-8 py-4 bg-yellow-400 text-black font-bold
                        rounded-xl hover:bg-yellow-500 transition shadow-2xl
                        animate-bounce-in
                    "
                >
                    💰 Win Your Money
                </button>
            </Link>

            <style jsx>{`
                @keyframes pop {
                    0% {
                        transform: scale(0.5);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                .animate-pop {
                    animation: pop 1.2s ease-out;
                }

                @keyframes bounceIn {
                    0% {
                        transform: translateY(200px);
                        opacity: 0;
                    }
                    60% {
                        transform: translateY(-20px);
                        opacity: 1;
                    }
                    80% {
                        transform: translateY(10px);
                    }
                    100% {
                        transform: translateY(0);
                    }
                }
                .animate-bounce-in {
                    animation: bounceIn 1.5s ease-out 1.2s both;
                }
            `}</style>
        </main>
    );
}
