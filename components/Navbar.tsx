"use client";
import React, { useState } from "react";
import Link from "next/link";

type AuthPayload = { username: string; password: string };

type NavbarProps = {
    onLogin?: (payload: AuthPayload) => Promise<void> | void;
    onRegister?: (payload: AuthPayload) => Promise<void> | void;
    onLogout?: () => Promise<void> | void;
    isLoggedIn?: boolean;
    username?: string;
};

// Reusable AuthModal component
function AuthModal({
                       title,
                       submitLabel,
                       onClose,
                       onSubmit,
                       footerHint,
                   }: {
    title: string;
    submitLabel: string;
    onClose: () => void;
    onSubmit: (data: AuthPayload) => Promise<void> | void;
    footerHint?: React.ReactNode;
}) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    return (
        <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose(); // click outside to close
            }}
        >
            <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <form
                    className="px-5 py-4 space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setErr(null);
                        setLoading(true);
                        try {
                            await onSubmit({ username, password });
                        } catch (error: any) {
                            setErr(error?.message ?? "Something went wrong");
                        } finally {
                            setLoading(false);
                        }
                    }}
                >
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Username</label>
                        <input
                            type="text"
                            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="yourname"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    {err && <div className="text-sm text-red-600">{err}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-blue-600 text-white py-2.5 hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Please wait…" : submitLabel}
                    </button>
                </form>

                <div className="px-5 pb-4">{footerHint}</div>
            </div>
        </div>
    );
}

export default function Navbar({
                                   onLogin,
                                   onRegister,
                                   onLogout,
                                   isLoggedIn = false,
                                   username = ""
                               }: NavbarProps) {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <>
            <nav className="bg-blue-600 text-white px-6 py-3 shadow">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                    <Link href="/" className="text-lg font-bold">
                        Travel Planner
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="hover:underline">
                            Home
                        </Link>
                        <Link href="/planner" className="hover:underline">
                            Planner
                        </Link>

                        {/* ✅ Added "My Itineraries" link */}
                        <Link href="/itineraries" className="hover:underline">
                            My Itineraries
                        </Link>

                        {/* Conditional rendering based on auth status */}
                        {isLoggedIn ? (
                            <div className="flex items-center gap-4">
                                <span className="text-white/80">Hello, {username}</span>
                                <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg border border-white/70 font-medium hover:bg-white/10"
                                    onClick={onLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg bg-white text-blue-600 font-medium hover:opacity-90"
                                    onClick={() => setShowLogin(true)}
                                >
                                    Login
                                </button>
                                <button
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg border border-white/70 font-medium hover:bg-white/10"
                                    onClick={() => setShowRegister(true)}
                                >
                                    Register
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {showLogin && (
                <AuthModal
                    title="Login"
                    submitLabel="Sign in"
                    onClose={() => setShowLogin(false)}
                    onSubmit={async (data: AuthPayload) => {
                        if (!data.username.trim()) {
                            throw new Error(
                                "Please enter your username. If you don't have one, click Register."
                            );
                        }
                        await onLogin?.(data);
                        setShowLogin(false);
                    }}
                    footerHint={
                        <p className="text-xs text-gray-600">
                            Don&apos;t have an account?{" "}
                            <button
                                className="underline underline-offset-2"
                                onClick={() => {
                                    setShowLogin(false);
                                    setShowRegister(true);
                                }}
                            >
                                Register here
                            </button>
                        </p>
                    }
                />
            )}

            {/* Register Modal */}
            {showRegister && (
                <AuthModal
                    title="Create Account"
                    submitLabel="Register"
                    onClose={() => setShowRegister(false)}
                    onSubmit={async (data: AuthPayload) => {
                        if (!data.username.trim()) throw new Error("Username is required.");
                        if (!data.password) throw new Error("Password is required.");
                        await onRegister?.(data);
                        setShowRegister(false);
                    }}
                    footerHint={
                        <p className="text-xs text-gray-600">
                            Already have an account?{" "}
                            <button
                                className="underline underline-offset-2"
                                onClick={() => {
                                    setShowRegister(false);
                                    setShowLogin(true);
                                }}
                            >
                                Sign in
                            </button>
                        </p>
                    }
                />
            )}
        </>
    );
}