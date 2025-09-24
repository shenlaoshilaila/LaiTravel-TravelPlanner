"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";
const PATHS = {
    me: "/auth/me",
    logout: "/auth/logout",
};

export default function ClientNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [checking, setChecking] = useState(true);

    const checkAuth = useCallback(async () => {
        setChecking(true);
        try {
            const res = await fetch(`${API_BASE}${PATHS.me}`, {
                credentials: "include",
                cache: "no-store",
            });
            if (res.ok) {
                const data = await res.json();
                setIsLoggedIn(true);
                setUsername(data?.username ?? "");
            } else {
                setIsLoggedIn(false);
                setUsername("");
            }
        } catch {
            setIsLoggedIn(false);
            setUsername("");
        } finally {
            setChecking(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        checkAuth();
    }, [pathname, checkAuth]);

    useEffect(() => {
        const onFocus = () => checkAuth();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [checkAuth]);

    async function handleLogout() {
        try {
            await fetch(`${API_BASE}${PATHS.logout}`, {
                method: "POST",
                credentials: "include",
            });
        } catch {}
        setIsLoggedIn(false);
        setUsername("");
        router.push("/");
        router.refresh();
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-blue-300 text-black">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link href="/" prefetch={false} className="font-semibold text-lg">
                    Travel Planner
                </Link>

                <nav className="flex items-center gap-6">
                    <Link href="/" prefetch={false} className="hover:underline">
                        Home
                    </Link>
                    <Link href="/planner" prefetch={false} className="hover:underline">
                        Planner
                    </Link>
                    <Link href="/itineraries" prefetch={false} className="hover:underline">
                        My Itineraries
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <span className="hidden sm:inline">
                                {checking ? "…" : `Hello, ${username}`}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="rounded border border-black/40 px-3 py-1 hover:bg-black/10"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                prefetch={false}
                                className="rounded bg-black/10 px-3 py-1 hover:bg-black/20"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                prefetch={false}
                                className="rounded border border-black/40 px-3 py-1 hover:bg-black/10"
                            >
                                Register
                            </Link>
                            {checking && <span aria-hidden className="opacity-80">…</span>}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
