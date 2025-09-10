// app/layout.tsx
import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import ClientLayoutWrapper from "./ClientLayoutWrapper"; // Import the client wrapper

export const metadata: Metadata = {
    title: "Travel Planner",
    description: "智能旅行路线规划助手",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh">
        <body className="bg-white text-gray-900">
        {/* Wrap everything in the client component */}
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </body>
        </html>
    );
}