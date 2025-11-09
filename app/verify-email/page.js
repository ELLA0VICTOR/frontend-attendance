"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api";
import { setAuth } from "@/utils/auth";

// Create a separate component that uses useSearchParams
const VerifyEmailContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyEmail = async () => {
      // Extract token and email from URL
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      // Validate parameters
      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid verification link. Please check your email and try again.");
        return;
      }

      try {
        // Call backend verification endpoint
        const response = await api.post("/auth/verify-email", {
          token,
          email,
        });

        if (response.data.success) {
          // Save token and user data
          const { token: authToken, user } = response.data.data;
          setAuth(authToken, user);

          // Set success state
          setStatus("success");
          setMessage(response.data.message || "Email verified successfully!");

          // Start countdown and redirect
          let counter = 3;
          const interval = setInterval(() => {
            counter -= 1;
            setCountdown(counter);

            if (counter === 0) {
              clearInterval(interval);
              router.push("/AdminLogin");
            }
          }, 1000);

          // Cleanup interval on unmount
          return () => clearInterval(interval);
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        const errorMessage =
          err.response?.data?.message ||
          "Verification failed. The link may be invalid or expired.";
        setMessage(errorMessage);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  // Verifying state
  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-purple-100">
            {/* Animated spinner */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Verifying Your Email
            </h2>
            <p className="text-gray-600">Please wait while we verify your account...</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-purple-100">
            {/* Success animation */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-900 font-medium">
                Your account is now active and ready to use.
              </p>
              <p className="text-xs text-purple-700 mt-2">
                Redirecting to login in{" "}
                <span className="font-bold text-purple-900">{countdown}</span>{" "}
                seconds...
              </p>
            </div>

            <button
              onClick={() => router.push("/AdminLogin")}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Go to Login Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-purple-100">
          {/* Error icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Verification Failed
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-900 font-medium mb-1">
              Common issues:
            </p>
            <ul className="text-xs text-red-700 text-left space-y-1">
              <li>• The verification link has expired (valid for 24 hours)</li>
              <li>• The link has already been used</li>
              <li>• The link was copied incorrectly</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/SuperAdminSignup")}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Request New Verification Link
            </button>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component that wraps content in Suspense
const VerifyEmail = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-purple-100">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Loading...
            </h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;