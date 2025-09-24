"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";

export default function HomePage() {
    return (
        <main className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden">
            {/* Background image with focal point */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/image/tp.png"   // put your file here
                    alt=""
                    fill
                    priority
                    className="
                        object-cover
                        object-[50%_40%]          /* shift focus up a bit */
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
                <Link href="/planner">
                    <button className="px-6 py-3 bg-blue-300 text-black rounded-lg hover:bg-blue-400 transition shadow-lg">
                        Start Planning Your Trip
                    </button>
                </Link>
            </div>
        </main>
    );
}
