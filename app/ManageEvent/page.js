"use client"
import { useState, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/utils/api"
import { isAuthenticated, isAdmin, logout, isSuperAdmin } from "@/utils/auth"
import Header from "@/public/src/components/AddEventPageComponents/header"
import Scroll from "@/public/src/components/scroll"
import { Rolecontex } from "@/public/src/components/AdminLoginpageComponents/Admincontex"

const ManageEvent = () => {
  const Navigation = useRouter()
  const { Role } = useContext(Rolecontex)
  const [isMobile, setIsMobile] = useState(false)
  
  const [button, setbutton] = useState("manage")
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [actionLoading, setActionLoading] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const tracks = [
    { id: "web-app", name: "Web and App" },
    { id: "networking", name: "Networking" },
    { id: "cloud", name: "Cloud Computing" },
    { id: "pcb", name: "PCB" },
  ]

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      Navigation.push("/AdminLogin")
      return
    }
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      setLoading(true)
      const response = await api.get("/events/my-events")
      setEvents(response.data.data.events)
    } catch (err) {
      setError("Failed to fetch events")
      setTimeout(() => setError(""), 4000)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event) => {
    setSelectedEvent(event)
    setEditForm({
      name: event.name || "",
      description: event.description || "",
      startDate: event.startDate?.split('T')[0] || "",
      endDate: event.endDate?.split('T')[0] || "",
      duration: event.duration || "",
      location: event.location || "",
      maxParticipants: event.maxParticipants || "",
      selectedTrack: event.selectedTrack || "",
    })
    setEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedEvent) return
    
    setActionLoading(prev => ({ ...prev, [selectedEvent._id]: true }))
    try {
      // Build the update payload - only send fields that have values
      const updatePayload = {}
      
      if (editForm.name && editForm.name.trim()) {
        updatePayload.name = editForm.name.trim()
      }
      
      if (editForm.description !== undefined) {
        updatePayload.description = editForm.description.trim()
      }
      
      if (editForm.startDate) {
        updatePayload.startDate = editForm.startDate
      }
      
      if (editForm.endDate) {
        updatePayload.endDate = editForm.endDate
      }
      
      if (editForm.duration && editForm.duration !== "") {
        updatePayload.duration = parseInt(editForm.duration)
      }
      
      if (editForm.location && editForm.location.trim()) {
        updatePayload.location = editForm.location.trim()
      }
      
      if (editForm.maxParticipants && editForm.maxParticipants !== "") {
        updatePayload.maxParticipants = parseInt(editForm.maxParticipants)
      }
      
      // Handle selectedTrack - send empty string if cleared, otherwise send the value
      if (editForm.selectedTrack !== undefined) {
        updatePayload.selectedTrack = editForm.selectedTrack || null
      }

      const response = await api.put(`/events/${selectedEvent._id}`, updatePayload)
      
      setEvents(prev => prev.map(e => 
        e._id === selectedEvent._id ? response.data.data.event : e
      ))
      
      setSuccess("Event updated successfully")
      setTimeout(() => setSuccess(""), 3000)
      setEditModal(false)
      setSelectedEvent(null)
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Failed to update event"
      setError(errorMsg)
      setTimeout(() => setError(""), 4000)
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedEvent._id]: false }))
    }
  }

  const handleDelete = async (eventId) => {
    if (deleteConfirm !== eventId) {
      setDeleteConfirm(eventId)
      setTimeout(() => setDeleteConfirm(null), 5000)
      return
    }

    setActionLoading(prev => ({ ...prev, [eventId]: true }))
    try {
      await api.delete(`/events/${eventId}`)
      setEvents(prev => prev.filter(e => e._id !== eventId))
      setSuccess("Event deleted successfully")
      setTimeout(() => setSuccess(""), 3000)
      setDeleteConfirm(null)
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete event"
      setError(errorMsg)
      setTimeout(() => setError(""), 4000)
    } finally {
      setActionLoading(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const handleTerminate = async (eventId) => {
    setActionLoading(prev => ({ ...prev, [`terminate_${eventId}`]: true }))
    try {
      const response = await api.post(`/events/${eventId}/terminate`)
      
      setEvents(prev => prev.map(e => 
        e._id === eventId ? response.data.data.event : e
      ))
      
      setSuccess("Event terminated successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to terminate event"
      setError(errorMsg)
      setTimeout(() => setError(""), 4000)
    } finally {
      setActionLoading(prev => ({ ...prev, [`terminate_${eventId}`]: false }))
    }
  }

  const handleViewReport = (eventId) => {
    Navigation.push(`/AttendanceReport/${eventId}`)
  }

  const handleGrantPermission = (eventId) => {
    Navigation.push(`/PermissionGrant/${eventId}`)
  }

  const handleLogout = () => {
    logout()
    Navigation.push("/")
  }

  const handleNavigation = (page, change) => {
    Navigation.push(page)
    setbutton(change)
  }

  const getStatusColor = (status) => {
    const colors = {
      upcoming: "#2563EB",
      ongoing: "#059669",
      completed: "#64748B",
      cancelled: "#DC2626",
      terminated: "#D97706"
    }
    return colors[status] || "#64748B"
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        input:focus, textarea:focus, select:focus {
          border-color: #6B46C1 !important;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
        }
      `}</style>

      <Header info="Manage Events" />
      
      <div style={{ padding: isMobile ? "20px 16px" : "20px 48px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontWeight: "500", letterSpacing: "-0.01em" }}>
              Manage and organize your events
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
            {!isMobile && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "0 16px" : "0 48px" }}>
        <div style={{ display: "flex", gap: "0", marginTop: "0", borderBottom: "1px solid #E2E8F0", backgroundColor: "#FFFFFF", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          {[
            { path: "/AddEvent", name: "create", label: "Create Events" },
            { path: "/ManageEvent", name: "manage", label: "Manage Events" },
            { path: "/Attendance", name: "Attendance", label: "Attendance" },
            ...(isSuperAdmin() ? [{ path: "/subadmin", name: "subadmin", label: "Admins" }] : [])
          ].map(tab => (
            <button 
              key={tab.name}
              onClick={() => handleNavigation(tab.path, tab.name)}
              style={{
                padding: isMobile ? "14px 20px" : "14px 24px",
                backgroundColor: "transparent",
                color: button === tab.name ? "#6B46C1" : "#64748B",
                border: "none",
                borderBottom: button === tab.name ? "2px solid #6B46C1" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600",
                transition: "all 0.15s ease",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap"
              }}
              onMouseEnter={(e) => {
                if (button !== tab.name) e.currentTarget.style.color = "#0F172A"
              }}
              onMouseLeave={(e) => {
                if (button !== tab.name) e.currentTarget.style.color = "#64748B"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Scroll>
        <div style={{ maxWidth: "1400px", margin: isMobile ? "24px auto" : "40px auto", padding: isMobile ? "0 16px" : "0 48px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: isMobile ? "24px" : "36px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
            <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", marginBottom: "28px", color: "#0F172A", letterSpacing: "-0.02em" }}>
              Event Management
            </h2>

            {loading ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
                <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTop: "3px solid #6B46C1", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }}></div>
                <p style={{ fontSize: "14px", fontWeight: "600" }}>Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", opacity: 0.5 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p style={{ fontSize: "14px", fontWeight: "600" }}>No events created yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {events.map((event) => (
                  <div 
                    key={event._id}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: isMobile ? "20px" : "24px",
                      transition: "all 0.15s ease",
                      backgroundColor: "#FFFFFF"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "flex-start", gap: "20px" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <h3 style={{ fontSize: isMobile ? "16px" : "17px", fontWeight: "700", color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                            {event.name}
                          </h3>
                          <span style={{
                            padding: "4px 10px",
                            backgroundColor: getStatusColor(event.status) + "15",
                            color: getStatusColor(event.status),
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}>
                            {event.status}
                          </span>
                        </div>
                        
                        <p style={{ color: "#64748B", fontSize: "13px", margin: "0 0 12px 0", lineHeight: "1.6", fontWeight: "500" }}>
                          {event.description}
                        </p>
                        
                        <div style={{ display: "flex", gap: isMobile ? "12px" : "20px", flexWrap: "wrap", fontSize: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontWeight: "600" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>
                              {new Date(event.startDate).toLocaleDateString()}
                              {event.endDate && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748B", fontWeight: "600" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                          {event.selectedTrack && (
                            <div style={{ color: "#6B46C1", fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              {event.selectedTrack}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: isMobile ? "flex-start" : "flex-end" }}>
                        <button
                          onClick={() => handleViewReport(event._id)}
                          style={{
                            padding: "9px 16px",
                            backgroundColor: "#6B46C1",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.15s ease",
                            letterSpacing: "-0.01em"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5B3BA1"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6B46C1"}
                        >
                          Report
                        </button>
                        
                        <button
                          onClick={() => handleGrantPermission(event._id)}
                          style={{
                            padding: "9px 16px",
                            backgroundColor: "#6B46C1",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "all 0.15s ease",
                            letterSpacing: "-0.01em"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5B3BA1"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6B46C1"}
                        >
                          Access
                        </button>

                        <button
                          onClick={() => handleEdit(event)}
                          disabled={event.status === "terminated" || event.status === "cancelled"}
                          style={{
                            padding: "9px 16px",
                            backgroundColor: event.status === "terminated" || event.status === "cancelled" ? "#F1F5F9" : "#6B46C1",
                            color: event.status === "terminated" || event.status === "cancelled" ? "#94A3B8" : "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: event.status === "terminated" || event.status === "cancelled" ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            transition: "all 0.15s ease",
                            letterSpacing: "-0.01em"
                          }}
                          onMouseEnter={(e) => {
                            if (event.status !== "terminated" && event.status !== "cancelled") {
                              e.currentTarget.style.backgroundColor = "#5B3BA1"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (event.status !== "terminated" && event.status !== "cancelled") {
                              e.currentTarget.style.backgroundColor = "#6B46C1"
                            }
                          }}
                        >
                          Edit
                        </button>

                        {event.status !== "terminated" && event.status !== "cancelled" && (
                          <button
                            onClick={() => handleTerminate(event._id)}
                            disabled={actionLoading[`terminate_${event._id}`]}
                            style={{
                              padding: "9px 16px",
                              backgroundColor: "#6B46C1",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              cursor: actionLoading[`terminate_${event._id}`] ? "not-allowed" : "pointer",
                              fontWeight: "600",
                              transition: "all 0.15s ease",
                              letterSpacing: "-0.01em"
                            }}
                            onMouseEnter={(e) => {
                              if (!actionLoading[`terminate_${event._id}`]) e.currentTarget.style.backgroundColor = "#5B3BA1"
                            }}
                            onMouseLeave={(e) => {
                              if (!actionLoading[`terminate_${event._id}`]) e.currentTarget.style.backgroundColor = "#6B46C1"
                            }}
                          >
                            {actionLoading[`terminate_${event._id}`] ? "..." : "End"}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(event._id)}
                          disabled={actionLoading[event._id]}
                          style={{
                            padding: "9px 16px",
                            backgroundColor: deleteConfirm === event._id ? "#B91C1C" : "#DC2626",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            cursor: actionLoading[event._id] ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            transition: "all 0.15s ease",
                            letterSpacing: "-0.01em"
                          }}
                          onMouseEnter={(e) => {
                            if (!actionLoading[event._id]) {
                              e.currentTarget.style.backgroundColor = "#B91C1C"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!actionLoading[event._id]) {
                              e.currentTarget.style.backgroundColor = deleteConfirm === event._id ? "#B91C1C" : "#DC2626"
                            }
                          }}
                        >
                          {actionLoading[event._id] ? "..." : (deleteConfirm === event._id ? "Confirm?" : "Delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: "16px",
              padding: "12px 16px",
              backgroundColor: "#FEF2F2",
              color: "#DC2626",
              borderRadius: "6px",
              fontSize: "13px",
              border: "1px solid #FEE2E2",
              fontWeight: "600"
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              marginTop: "16px",
              padding: "12px 16px",
              backgroundColor: "#F0FDF4",
              color: "#059669",
              borderRadius: "6px",
              fontSize: "13px",
              border: "1px solid #BBF7D0",
              fontWeight: "600"
            }}>
              {success}
            </div>
          )}
        </div>
      </Scroll>

      {editModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px",
          backdropFilter: "blur(4px)"
        }} onClick={() => setEditModal(false)}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            padding: isMobile ? "24px" : "32px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                Edit Event
              </h3>
              <button
                onClick={() => setEditModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748B",
                  lineHeight: "1",
                  padding: 0,
                  fontWeight: "600"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Event Title
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    color: "#0F172A",
                    fontWeight: "500"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "inherit",
                    color: "#0F172A",
                    lineHeight: "1.6",
                    fontWeight: "500"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#0F172A",
                      fontWeight: "500"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: "inherit",
                      color: "#0F172A",
                      fontWeight: "500"
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    color: "#0F172A",
                    fontWeight: "500"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Track
                </label>
                <select
                  value={editForm.selectedTrack}
                  onChange={(e) => setEditForm(prev => ({ ...prev, selectedTrack: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    backgroundColor: "#FFFFFF",
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
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px", borderTop: "1px solid #E2E8F0", paddingTop: "20px" }}>
                <button
                  onClick={() => setEditModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#F8FAFC",
                    color: "#0F172A",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    letterSpacing: "-0.01em"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading[selectedEvent?._id]}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#6B46C1",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: actionLoading[selectedEvent?._id] ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    letterSpacing: "-0.01em"
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading[selectedEvent?._id]) e.currentTarget.style.backgroundColor = "#5B3BA1"
                  }}
                  onMouseLeave={(e) => {
                    if (!actionLoading[selectedEvent?._id]) e.currentTarget.style.backgroundColor = "#6B46C1"
                  }}
                >
                  {actionLoading[selectedEvent?._id] ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default ManageEvent