"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utils/api";
import Header from "@/public/src/components/RegistrationPageComponents/header";
import Input from "@/public/src/components/RegistrationPageComponents/forminput";

const RegistrationForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const Programid = searchParams.get("Programid");
  const [isMobile, setIsMobile] = useState(false);

  // Form states
  const [fullname, setFullname] = useState("");
  const [matricnumber, setMatricnumber] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [gender, setGender] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Feedback and loading
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGoBack = () => router.push("./");

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        setTimeout(() => setError(""), 4000);
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (!fullname || !matricnumber || !email || !department || !gender || !photo) {
      setError("Please fill in all required fields.");
      setTimeout(() => setError(""), 4000);
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

      setSuccess("Registration successful! You're all set for the event.");
      setError("");

      // Reset form
      setFullname("");
      setMatricnumber("");
      setEmail("");
      setDepartment("");
      setGender("");
      setPhoto(null);
      setPhotoPreview(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("./");
      }, 2000);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMsg);
      setSuccess("");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#FFFFFF",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        input:focus, select:focus {
          border-color: #6B46C1 !important;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
        }
      `}</style>

      <Header />

      {/* Back Button */}
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto",
        padding: isMobile ? "20px 16px 0" : "32px 48px 0"
      }}>
        <button 
          onClick={handleGoBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "9px 16px",
            backgroundColor: "#F8FAFC",
            color: "#0F172A",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            transition: "all 0.15s ease",
            letterSpacing: "-0.01em"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F1F5F9"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#F8FAFC"
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Events
        </button>
      </div>

      {/* Registration Form */}
      <div style={{ 
        maxWidth: "800px", 
        margin: isMobile ? "24px auto 40px" : "40px auto 60px",
        padding: isMobile ? "0 16px" : "0 48px"
      }}>
        <div style={{ 
          backgroundColor: "#FFFFFF", 
          borderRadius: "10px", 
          padding: isMobile ? "28px 20px" : "40px 36px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
        }}>
          {/* Header */}
          <div style={{ 
            textAlign: "center",
            marginBottom: "32px",
            paddingBottom: "24px",
            borderBottom: "1px solid #E2E8F0"
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#F3F0FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px"
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6B46C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
            </div>
            <h1 style={{ 
              fontSize: isMobile ? "22px" : "26px", 
              fontWeight: "700", 
              color: "#0F172A", 
              margin: "0 0 8px 0", 
              letterSpacing: "-0.02em" 
            }}>
              Event Registration
            </h1>
            <p style={{ 
              color: "#64748B", 
              fontSize: "14px", 
              margin: 0, 
              fontWeight: "500",
              letterSpacing: "-0.01em",
              lineHeight: "1.5"
            }}>
              Please fill in your details to register for this event
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: "600", 
                marginBottom: "8px", 
                color: "#0F172A", 
                letterSpacing: "-0.01em" 
              }}>
                Full Name <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <Input 
                type="text" 
                label="" 
                value={fullname} 
                setValue={setFullname}
                placeholder="Enter your full name"
              />
            </div>

            {/* Matric Number & Email */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
              gap: "20px", 
              marginBottom: "20px" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: "#0F172A", 
                  letterSpacing: "-0.01em" 
                }}>
                  Matric Number <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <Input 
                  type="text" 
                  label="" 
                  value={matricnumber} 
                  setValue={setMatricnumber}
                  placeholder="e.g., 2020/1/12345"
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: "#0F172A", 
                  letterSpacing: "-0.01em" 
                }}>
                  Email Address <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <Input 
                  type="email" 
                  label="" 
                  value={email} 
                  setValue={setEmail}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Department & Gender */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
              gap: "20px", 
              marginBottom: "20px" 
            }}>
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: "#0F172A", 
                  letterSpacing: "-0.01em" 
                }}>
                  Department <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <Input 
                  type="text" 
                  label="" 
                  value={department} 
                  setValue={setDepartment}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: "#0F172A", 
                  letterSpacing: "-0.01em" 
                }}>
                  Gender <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    backgroundColor: "#FFFFFF",
                    fontFamily: "inherit",
                    color: gender ? "#0F172A" : "#94A3B8",
                    fontWeight: "500",
                    transition: "all 0.15s ease",
                    cursor: "pointer"
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Photo Upload */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ 
                display: "block", 
                fontSize: "13px", 
                fontWeight: "600", 
                marginBottom: "8px", 
                color: "#0F172A", 
                letterSpacing: "-0.01em" 
              }}>
                Passport Photograph <span style={{ color: "#DC2626" }}>*</span>
              </label>
              
              <div style={{
                border: "2px dashed #E2E8F0",
                borderRadius: "6px",
                padding: isMobile ? "24px 16px" : "32px 24px",
                textAlign: "center",
                backgroundColor: "#F8FAFC",
                transition: "all 0.15s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                if (!photoPreview) {
                  e.currentTarget.style.borderColor = "#6B46C1"
                  e.currentTarget.style.backgroundColor = "#F3F0FF"
                }
              }}
              onMouseLeave={(e) => {
                if (!photoPreview) {
                  e.currentTarget.style.borderColor = "#E2E8F0"
                  e.currentTarget.style.backgroundColor = "#F8FAFC"
                }
              }}>
                {photoPreview ? (
                  <div style={{ position: "relative" }}>
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: "200px", 
                        width: "100%",
                        height: "auto", 
                        borderRadius: "6px",
                        border: "2px solid #6B46C1",
                        margin: "0 auto 12px",
                        display: "block"
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhoto(null);
                        setPhotoPreview(null);
                      }}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#DC2626",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#B91C1C"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#DC2626"}
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#E0E7FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px"
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B46C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <p style={{ 
                      fontSize: "14px", 
                      fontWeight: "600", 
                      color: "#0F172A", 
                      margin: "0 0 6px 0",
                      letterSpacing: "-0.01em"
                    }}>
                      Click to upload or drag and drop
                    </p>
                    <p style={{ 
                      fontSize: "12px", 
                      color: "#64748B", 
                      margin: 0,
                      fontWeight: "500"
                    }}>
                      PNG, JPG or JPEG (max. 5MB)
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  required
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    opacity: 0,
                    overflow: "hidden"
                  }}
                  id="photo-upload"
                />
              </div>
              <label 
                htmlFor="photo-upload"
                style={{
                  display: photoPreview ? "none" : "block",
                  marginTop: "12px",
                  textAlign: "center",
                  cursor: "pointer"
                }}
              >
                <span style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  backgroundColor: "#6B46C1",
                  color: "#FFFFFF",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  transition: "all 0.15s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5B3BA1"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6B46C1"}>
                  Choose File
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div style={{ 
              borderTop: "1px solid #E2E8F0", 
              paddingTop: "24px", 
              marginTop: "28px",
              textAlign: "center"
            }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: isMobile ? "100%" : "auto",
                  minWidth: isMobile ? "auto" : "200px",
                  padding: "12px 28px",
                  backgroundColor: loading ? "#94A3B8" : "#6B46C1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  letterSpacing: "-0.01em",
                  boxShadow: loading ? "none" : "0 1px 3px rgba(107, 70, 193, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#5B3BA1"
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = "#6B46C1"
                }}
              >
                {loading ? (
                  <>
                    <div style={{ 
                      width: "16px", 
                      height: "16px", 
                      border: "2px solid #FFFFFF", 
                      borderTop: "2px solid transparent", 
                      borderRadius: "50%", 
                      animation: "spin 0.6s linear infinite" 
                    }}></div>
                    Please wait...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Register for Event
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: "20px",
              padding: "12px 16px",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              borderRadius: "6px",
              fontSize: "13px",
              border: "1px solid #FEE2E2",
              fontWeight: "600",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div style={{
              marginTop: "20px",
              padding: "12px 16px",
              backgroundColor: "#F0FDF4",
              color: "#059669",
              borderRadius: "6px",
              fontSize: "13px",
              border: "1px solid #BBF7D0",
              fontWeight: "600",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{success}</span>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Main component that wraps the form in Suspense
const Registration = () => {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "3px solid #E2E8F0", 
          borderTop: "3px solid #6B46C1", 
          borderRadius: "50%", 
          animation: "spin 0.8s linear infinite",
          marginBottom: "16px"
        }}></div>
        <p style={{ 
          fontSize: '14px',
          color: '#64748B',
          fontWeight: '600',
          letterSpacing: '-0.01em'
        }}>
          Loading registration form...
        </p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    }>
      <RegistrationForm />
    </Suspense>
  );
};

export default Registration;