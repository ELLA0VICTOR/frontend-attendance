"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api"; // your axios instance
import Header from "@/public/src/components/RegistrationPageComponents/header";

// --- Helper component for the back arrow ---
const BackArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 mr-1"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
    />
  </svg>
);

const Registration = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const Programid = searchParams.get("Programid");

  // Form states
  const [fullname, setFullname] = useState("");
  const [matricnumber, setMatricnumber] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState(null);

  // Feedback and loading
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Go back
  const handleGoBack = () => router.push("./");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullname || !matricnumber || !email || !department || !gender || !photo) {
      setError("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("matricnumber", matricnumber);
    formData.append("email", email);
    formData.append("department", department);
    formData.append("gender", gender);
    formData.append("photo", photo);
    formData.append("eventId", Programid);

    try {
      setLoading(true);
      await api.post("/participants/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Registration successful! You will be redirected.");
      setError("");

      // Reset form
      setFullname("");
      setMatricnumber("");
      setEmail("");
      setDepartment("");
      setGender("");
      setPhoto(null);

      // Redirect after success
      setTimeout(() => {
        router.push("./");
      }, 2000);
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  // Tailwind classes
  const inputStyle =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm " +
    "focus:outline-none focus:ring-[#7741C3] focus:border-[#7741C3] sm:text-sm text-black"; // <-- text-black added

  const labelStyle = "block text-sm font-medium text-gray-900";

  const fileInputStyle =
    "mt-1 block w-full text-sm text-black " + // <-- text-black added
    "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 " +
    "file:text-sm file:font-semibold file:bg-purple-50 file:text-[#7741C3] " +
    "hover:file:bg-purple-100 cursor-pointer";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="w-full bg-[#7741C3]">
        <Header />
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-4 inline-flex items-center text-sm font-medium text-[#7741C3] hover:text-[#5e339a] transition-colors"
        >
          <BackArrowIcon />
          Back to Events
        </button>

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Event Registration</h2>
            <p className="mt-1 text-md text-gray-700">
              Please fill in your details to register for this event.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Fullname */}
            <div>
              <label htmlFor="fullname" className={labelStyle}>Fullname</label>
              <input
                type="text"
                id="fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className={inputStyle}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            {/* Matric number */}
            <div>
              <label htmlFor="matric" className={labelStyle}>Matric number</label>
              <input
                type="text"
                id="matric"
                value={matricnumber}
                onChange={(e) => setMatricnumber(e.target.value)}
                className={inputStyle}
                placeholder="e.g. 12345678"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelStyle}>Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                placeholder="e.g. you@example.com"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label htmlFor="department" className={labelStyle}>Department</label>
              <input
                type="text"
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputStyle}
                placeholder="e.g. Computer Science"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className={labelStyle}>Gender</label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={inputStyle}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Photo Upload */}
            <div>
              <label className={labelStyle}>Upload your Passport Photograph</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files[0])}
                className={fileInputStyle}
                required
              />
            </div>

            {/* Feedback */}
            <div className="text-center">
              {error && <p className="text-sm text-red-600">{error}</p>}
              {success && <p className="text-sm text-green-600">{success}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7741C3] hover:bg-[#6a39a9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7741C3] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
