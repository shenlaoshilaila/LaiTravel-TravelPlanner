"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function HappyBirthdayPage() {
    return (
        <main className="relative h-screen flex flex-col items-center justify-center overflow-hidden text-center text-white">
            {/* 🎆 Fireworks background */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/image/fireworks.gif" // 🔥 put your GIF at /public/image/fireworks.gif
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

            {/* 💰 "Win Your Money" Button */}
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
                /* Pop effect for title */
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

                /* Bounce-in for button */
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
