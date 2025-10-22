"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function HomePage() {
    return (
        <main className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
            {/* Background image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/image/fp.png"
                    alt=""
                    fill
                    priority
                    className="
                        object-cover
                        object-[50%_40%]
                        md:object-[50%_45%]
                        lg:object-[50%_50%]
                    "
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center px-6">
                <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
                    Travel Planner · Explore the City Smarter
                </h1>
                <p className="text-lg mb-6 max-w-2xl drop-shadow-md">
                    Tell us how long you're staying and where you want to go — we'll craft the perfect route for each day.
                </p>

                {/* Start Planning Button */}
                <Link href="/planner">
                    <button className="px-6 py-3 bg-blue-300 text-black rounded-lg hover:bg-blue-400 transition shadow-lg">
                        Start Planning Your Trip
                    </button>
                </Link>

                {/* New Button → Goes to /happy-birthday */}
                <Link href="/happy-birthday">
                    <button className="mt-4 px-6 py-3 bg-pink-400 text-white rounded-lg hover:bg-pink-500 transition shadow-lg">
                        Happy birthday Liya
                    </button>
                </Link>
            </div>
        </main>
    );
}
