import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function VerifiedSuccess() {
    const navigate = useNavigate();
    const { setUserFromToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
        setError("Invalid verification link.");
        setLoading(false);
        return;
    }

    const verifyEmail = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/verify-email?token=${token}&email=${email}`,
                { method: "GET" }
            );

            if (!res.ok) throw new Error("Verification failed");

            const data = await res.json();

            if (data.user && data.token) {
                // ✅ Save immediately
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                // ✅ Update global state safely
                await setUserFromToken(data.token);

                // ✅ Show success message before navigation
                setLoading(false);
                setError(null);

                // ⏳ Delay redirect only
                setTimeout(() => {
                    navigate("/dashboard");
                }, 2000);
            } else {
                throw new Error("Incomplete verification data");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Verification failed");
            setLoading(false);
        }
    };

    verifyEmail();
}, []);


    if (loading && !error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <h1 className="text-2xl font-bold text-green-600">Verifying your email...</h1>
                <p>Please wait while we complete your verification.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Verification Failed ❌</h1>
                <p>{error}</p>
                <button
                    onClick={() => navigate("/signin")}
                    className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                    Go to Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <h1 className="text-2xl font-bold text-green-600">Email verified ✅</h1>
            {/* <p>You can now log in to your account.</p>
            <button
                onClick={() => navigate("/signin")}
                className="px-4 py-2 bg-primary text-white rounded-lg"
            >
                Go to Sign In
            </button> */}
        </div>
    );
}
