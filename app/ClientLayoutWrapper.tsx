"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import ClientNavbar from "./ClientNavbar";
import { LoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {/* Load Google Maps API globally */}
            <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                libraries={libraries}
            >
                <ClientNavbar />
                {children}
            </LoadScript>
        </AuthProvider>
    );
}
