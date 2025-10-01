// app/layout.tsx
import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

export const metadata: Metadata = {
    title: "Travel Planner",
    description: "智能旅行路线规划助手",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh">
        <body className="bg-white text-gray-900">
        {/* Google Maps loader is handled in ClientLayoutWrapper */}
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </body>
        </html>
    );
}
