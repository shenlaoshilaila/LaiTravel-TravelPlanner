"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function GameMenuPage() {
    return (
        <main className="relative min-h-screen flex flex-col items-center text-center text-white font-sans overflow-y-auto py-20">
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

                <Link href="/win">
                    <button className="w-64 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        💰 Win Your Birthday Money
                    </button>
                </Link>

                <Link href="/win/components">
                    <button className="w-64 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        🧩 Components Game
                    </button>
                </Link>

                <Link href="/crocodile-dentist">
                    <button className="w-64 py-4 bg-yellow-200 hover:bg-yellow-500 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        🐊 Crocodile Dentist
                    </button>
                </Link>

                <Link href="/multiplication">
                    <button className="w-64 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        ✖️ Multiplication Game
                    </button>
                </Link>

                <Link href="/division">
                    <button className="w-64 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        ➗ Division Game
                    </button>
                </Link>

                <Link href="/mix-calculation">
                    <button className="w-64 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        🔀 Mix Calculation Game
                    </button>
                </Link>

                {/* 🆕 Math Under 10 */}
                <Link href="/math-under-10">
                    <button className="w-64 py-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        🧮 Math Under 10
                    </button>
                </Link>

                <Link href="/place-value">
                    <button className="w-64 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
                        🔢 How Many Ones, Tens, Hundreds or Thousands?
                    </button>
                </Link>

            </div>

            <footer className="mt-16 text-gray-300 text-sm">
                © 2025 Liya’s Game Room
            </footer>
        </main>
    );
}
