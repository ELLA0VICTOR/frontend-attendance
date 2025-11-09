"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api"; // your axios instance
import Header from "@/public/src/components/RegistrationPageComponents/header";
import Input from "@/public/src/components/RegistrationPageComponents/forminput";
import style from "./Registration.module.css";

// Create a separate component for the form that uses useSearchParams
const RegistrationForm = () => {
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

    // Validate required fields
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
    formData.append("eventId", Programid); // link to the event

    try {
      setLoading(true);

      await api.post("/participants/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Registration successful!");
      setError("");

      // Reset form
      setFullname("");
      setMatricnumber("");
      setEmail("");
      setDepartment("");
      setGender("");
      setPhoto(null);
    } catch (err) {
      console.error(err);
      setError("Registration failed. Please try again.");
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={style.Header}>
        <Header />
      </div>

      <button className={style.backbotton} onClick={handleGoBack}>
        Back to Events
      </button>

      <div className={style.container}>
        <h3 className={style.title}>Event Registration</h3>
        <h3 className={style.subtitle}>
          Please fill in your details to register for this event
        </h3>

        <form onSubmit={handleSubmit}>
          <Input type="text" label="Fullname" value={fullname} setValue={setFullname} />
          <Input type="text" label="Matric number" value={matricnumber} setValue={setMatricnumber} />
          <Input type="email" label="Email" value={email} setValue={setEmail} />
          <Input type="text" label="Department" value={department} setValue={setDepartment} />

          <label className={style.title}>Gender</label>
          <div className={style.subtitle}>
            <select
              style={{ border: "none", outline: "none" }}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <label className={style.title}>Upload your Passport Photograph</label>
          <div className={style.subtitle}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
            />
          </div>

          <button type="submit" className={style.submitbutton}>
            {!loading ? "Register" : "Please wait..."}
          </button>

          {error && <p className={style.error}>{error}</p>}
          {success && <p className={style.success}>{success}</p>}
        </form>
      </div>
    </div>
  );
};

// Main component that wraps the form in Suspense
const Registration = () => {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading registration form...
      </div>
    }>
      <RegistrationForm />
    </Suspense>
  );
};

export default Registration;