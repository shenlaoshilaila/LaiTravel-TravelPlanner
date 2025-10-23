"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function GameMenuPage() {
    return (
        <main className="relative h-screen flex flex-col items-center justify-center text-center text-white font-sans overflow-hidden">
            {/* 🌆 Animated Background */}
            <Image
                src="/image/gamebackground.gif"
                alt="Game Background"
                fill
                priority
                className="object-cover -z-10"
            />

            {/* 🎮 Game Title */}
            <h1 className="text-6xl md:text-7xl font-extrabold mb-12 tracking-wide drop-shadow-lg">
                🎮 Welcome to Game Room
            </h1>

            {/* 🕹️ Game Options */}
            <div className="flex flex-col gap-6 w-full max-w-sm items-center">
                {/* Game 1 - Win Your Birthday Money */}
                <Link href="/win">
                    <button
                        className="
                            w-64 py-4 bg-blue-500 hover:bg-blue-600
                            text-white font-bold text-xl rounded-xl
                            transition-all duration-300 transform hover:scale-105 shadow-lg
                        "
                    >
                        💰 Win Your Birthday Money
                    </button>
                </Link>

                {/* Placeholder for future games */}
                <button
                    disabled
                    className="
                        w-64 py-4 bg-gray-500 text-gray-300 font-bold text-xl rounded-xl
                        opacity-50 cursor-not-allowed shadow-md
                    "
                >
                    🎲 Coming Soon...
                </button>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-8 text-gray-300 text-sm">
                © 2025 Liya’s Game Room
            </footer>
        </main>
    );
}
