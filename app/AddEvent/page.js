"use client"
import { useState, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import api from "@/utils/api"
import { isAuthenticated, isAdmin, logout } from "@/utils/auth"
import Header from "@/public/src/components/AddEventPageComponents/header"
import Scroll from "@/public/src/components/scroll"
import { Rolecontex } from "@/public/src/components/AdminLoginpageComponents/Admincontex"

const AddEvent = () => {
  const Navigation = useRouter()
  const { Role } = useContext(Rolecontex)
  
  const [button, setbutton] = useState("create")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: "",
    location: "",
    maxParticipants: "",
    selectedTrack: "",
    imageUrl: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const tracks = [
    { id: "web-app", name: "Web and App" },
    { id: "networking", name: "Networking" },
    { id: "cloud", name: "Cloud Computing" },
    { id: "pcb", name: "PCB" },
  ]

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      Navigation.push("/AdminLogin")
    }
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === "duration" && formData.startDate && value) {
      const start = new Date(formData.startDate)
      const end = new Date(start)
      end.setDate(end.getDate() + parseInt(value))
      setFormData(prev => ({ 
        ...prev, 
        duration: value,
        endDate: end.toISOString().split('T')[0] 
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        setTimeout(() => setError(""), 4000)
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!formData.name || !formData.startDate || !formData.location || !formData.description) {
      setError("Please fill in all required fields")
      setTimeout(() => setError(""), 4000)
      setLoading(false)
      return
    }

    try {
      const data = new FormData()
      data.append("name", formData.name)
      data.append("description", formData.description)
      data.append("startDate", formData.startDate)
      data.append("location", formData.location)
      
      if (formData.endDate) data.append("endDate", formData.endDate)
      if (formData.duration) data.append("duration", formData.duration)
      if (formData.maxParticipants) data.append("maxParticipants", formData.maxParticipants)
      if (formData.selectedTrack) data.append("selectedTrack", formData.selectedTrack)
      if (formData.imageUrl) data.append("imageUrl", formData.imageUrl)
      if (imageFile) data.append("image", imageFile)

      await api.post("/events", data, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      setSuccess("Event created successfully! Redirecting...")
      
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        duration: "",
        location: "",
        maxParticipants: "",
        selectedTrack: "",
        imageUrl: "",
      })
      setImageFile(null)
      setImagePreview(null)

      setTimeout(() => {
        Navigation.push("/ManageEvent")
      }, 2000)

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create event. Please try again."
      setError(errorMsg)
      setTimeout(() => setError(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    Navigation.push("/")
  }

  const handleNavigation = (page, change) => {
    Navigation.push(page)
    setbutton(change)
  }

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
        
        input:focus, textarea:focus, select:focus {
          border-color: #6B46C1 !important;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
        }
        
        @media (max-width: 768px) {
          .responsive-padding {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>

      <Header info="Create Event" />
      
      {/* Top Bar */}
      <div style={{ 
        padding: "20px 48px", 
        backgroundColor: "#FFFFFF", 
        borderBottom: "1px solid #E2E8F0" 
      }} className="responsive-padding">
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          maxWidth: "1400px", 
          margin: "0 auto",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <div>
            <h1 style={{ 
              fontSize: "22px", 
              fontWeight: "700", 
              color: "#0F172A", 
              margin: "0 0 4px 0", 
              letterSpacing: "-0.02em" 
            }}>
              Admin Dashboard
            </h1>
            <p style={{ 
              color: "#64748B", 
              fontSize: "13px", 
              margin: 0, 
              fontWeight: "500",
              letterSpacing: "-0.01em"
            }}>
              Create and manage events efficiently
            </p>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              color: "#64748B",
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6B46C1"
              e.currentTarget.style.color = "#6B46C1"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0"
              e.currentTarget.style.color = "#64748B"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        maxWidth: "1400px", 
        margin: "0 auto",
        padding: "0 48px"
      }} className="responsive-padding">
        <div style={{ 
          display: "flex", 
          gap: "0", 
          marginTop: "0",
          borderBottom: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch"
        }}>
          <button 
            onClick={() => handleNavigation("/AddEvent", "create")}
            style={{
              padding: "14px 24px",
              backgroundColor: "transparent",
              color: button === "create" ? "#6B46C1" : "#64748B",
              border: "none",
              borderBottom: button === "create" ? "2px solid #6B46C1" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              if (button !== "create") e.currentTarget.style.color = "#0F172A"
            }}
            onMouseLeave={(e) => {
              if (button !== "create") e.currentTarget.style.color = "#64748B"
            }}
          >
            Create Events
          </button>
          <button 
            onClick={() => handleNavigation("/ManageEvent", "manage")}
            style={{
              padding: "14px 24px",
              backgroundColor: "transparent",
              color: "#64748B",
              border: "none",
              borderBottom: "2px solid transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#0F172A"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}
          >
            Manage Events
          </button>
          <button 
            onClick={() => handleNavigation("/Attendance", "Attendance")}
            style={{
              padding: "14px 24px",
              backgroundColor: "transparent",
              color: "#64748B",
              border: "none",
              borderBottom: "2px solid transparent",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#0F172A"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}
          >
            Attendance
          </button>
          {Role === "Admin" && (
            <button 
              onClick={() => handleNavigation("/subadmin", "subadmin")}
              style={{
                padding: "14px 24px",
                backgroundColor: "transparent",
                color: "#64748B",
                border: "none",
                borderBottom: "2px solid transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                transition: "all 0.15s ease",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#0F172A"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#64748B"}
            >
              Admins
            </button>
          )}
        </div>
      </div>

      <Scroll>
        <div style={{ maxWidth: "1400px", margin: "40px auto", padding: "0 48px" }} className="responsive-padding">
          <div style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: "10px", 
            padding: window.innerWidth < 768 ? "24px" : "36px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)"
          }}>
            {/* Form Header */}
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{ 
                fontSize: window.innerWidth < 768 ? "18px" : "20px", 
                fontWeight: "700", 
                marginBottom: "4px", 
                color: "#0F172A", 
                letterSpacing: "-0.02em" 
              }}>
                Create New Event
              </h2>
              <p style={{ 
                color: "#64748B", 
                fontSize: "13px", 
                margin: 0, 
                fontWeight: "500",
                letterSpacing: "-0.01em"
              }}>
                Fill in the event details below
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title & Start Date */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", 
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
                    Event Title <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., Tech Workshop 2024"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      fontWeight: "500"
                    }}
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
                    Start Date <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      fontWeight: "500"
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: "#0F172A", 
                  letterSpacing: "-0.01em" 
                }}>
                  Description <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide event details and objectives"
                  required
                  rows="4"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    resize: "vertical",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    lineHeight: "1.6",
                    fontWeight: "500"
                  }}
                />
              </div>

              {/* Row 2: Location & Max Participants */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", 
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
                    Location <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g., Main Auditorium"
                    required
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      fontWeight: "500"
                    }}
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
                    Maximum Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange("maxParticipants", e.target.value)}
                    placeholder="Leave empty for unlimited"
                    min="1"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      fontWeight: "500"
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Duration & End Date */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: window.innerWidth < 768 ? "1fr" : "1fr 1fr", 
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
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="Single-day by default"
                    min="1"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                      backgroundColor: "#FFFFFF",
                      color: "#0F172A",
                      fontWeight: "500"
                    }}
                  />
                  <small style={{ 
                    color: "#64748B", 
                    fontSize: "12px", 
                    display: "block", 
                    marginTop: "6px", 
                    fontWeight: "500" 
                  }}>
                    End date calculated automatically
                  </small>
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
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    disabled={!!formData.duration}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      transition: "all 0.15s ease",
                      fontFamily: "inherit",
                      backgroundColor: formData.duration ? "#F8FAFC" : "#FFFFFF",
                      color: formData.duration ? "#94A3B8" : "#0F172A",
                      cursor: formData.duration ? "not-allowed" : "text",
                      fontWeight: "500"
                    }}
                  />
                  <small style={{ 
                    color: "#64748B", 
                    fontSize: "12px", 
                    display: "block", 
                    marginTop: "6px", 
                    fontWeight: "500" 
                  }}>
                    {formData.duration ? "Calculated from duration" : "Optional"}
                  </small>
                </div>
              </div>

              {/* Track Selection */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: "#0F172A", 
                  letterSpacing: "-0.01em" 
                }}>
                  Track
                </label>
                <select
                  value={formData.selectedTrack}
                  onChange={(e) => handleInputChange("selectedTrack", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    backgroundColor: "#FFFFFF",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                    color: "#0F172A",
                    fontWeight: "500"
                  }}
                >
                  <option value="">No specific track</option>
                  {tracks.map(track => (
                    <option key={track.id} value={track.name}>{track.name}</option>
                  ))}
                </select>
                <small style={{ 
                  color: "#64748B", 
                  fontSize: "12px", 
                  display: "block", 
                  marginTop: "6px", 
                  fontWeight: "500" 
                }}>
                  Participants auto-assigned to this track
                </small>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  marginBottom: "8px", 
                  color: "#0F172A", 
                  letterSpacing: "-0.01em" 
                }}>
                  Event Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                    backgroundColor: "#FFFFFF",
                    fontWeight: "500"
                  }}
                />
                {imagePreview && (
                  <div style={{ marginTop: "12px" }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: "200px", 
                        width: "100%",
                        height: "auto", 
                        borderRadius: "6px",
                        border: "1px solid #E2E8F0"
                      }} 
                    />
                  </div>
                )}
                <small style={{ 
                  color: "#64748B", 
                  fontSize: "12px", 
                  display: "block", 
                  marginTop: "6px", 
                  fontWeight: "500" 
                }}>
                  Or provide an image URL below (Max 5MB)
                </small>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    marginTop: "8px",
                    transition: "all 0.15s ease",
                    fontFamily: "inherit",
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    fontWeight: "500"
                  }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ 
                borderTop: "1px solid #E2E8F0", 
                paddingTop: "24px", 
                marginTop: "28px" 
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: window.innerWidth < 768 ? "100%" : "auto",
                    padding: "9px 16px",
                    backgroundColor: loading ? "#94A3B8" : "#6B46C1",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    letterSpacing: "-0.01em",
                    boxShadow: loading ? "none" : "0 1px 3px rgba(107, 70, 193, 0.3)"
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = "#5B3BA1"
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.currentTarget.style.backgroundColor = "#6B46C1"
                  }}
                >
                  {loading ? "Creating Event..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: "16px",
              padding: "12px 16px",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              borderRadius: "6px",
              fontSize: "13px",
              border: "1px solid #FEE2E2",
              fontWeight: "600",
              letterSpacing: "-0.01em"
            }}>
              {error}
            </div>
          )}
          
          {/* Success Message */}
          {success && (
            <div style={{
              marginTop: "16px",
              padding: "12px 16px",
              backgroundColor: "#F0FDF4",
              color: "#059669",
              borderRadius: "6px",
              fontSize: "13px",
              border: "1px solid #BBF7D0",
              fontWeight: "600",
              letterSpacing: "-0.01em"
            }}>
              {success}
            </div>
          )}
        </div>
      </Scroll>
    </div>
  )
}

export default AddEvent