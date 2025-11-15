"use client"
import { useState, useContext, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import api from "@/utils/api"
import { isAuthenticated, isAdmin, logout, isSuperAdmin } from "@/utils/auth"
import Header from "@/public/src/components/AddEventPageComponents/header"
import Scroll from "@/public/src/components/scroll"
import { Rolecontex } from "@/public/src/components/AdminLoginpageComponents/Admincontex"
import VerificationModal from "@/public/src/components/Attendancepagecomponents/VerificationModal"

const Attendance = () => {
  const Navigation = useRouter()
  const { Role } = useContext(Rolecontex)
  const scannerRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  
  const [button, setbutton] = useState("Attendance")
  const [myEvents, setMyEvents] = useState([])
  const [grantedEvents, setGrantedEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState("")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [scannedToday, setScannedToday] = useState([])
  const [search, setSearch] = useState("")
  const [scanning, setScanning] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRegistered: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0
  })

  // Verification Modal States
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verifiedParticipant, setVerifiedParticipant] = useState(null)
  const [verifiedEvent, setVerifiedEvent] = useState(null)
  const [alreadyMarked, setAlreadyMarked] = useState(false)
  const [existingAttendance, setExistingAttendance] = useState(null)
  const [markingPresent, setMarkingPresent] = useState(false)

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
    fetchEvents()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      fetchEventData()
    }
  }, [selectedEventId])

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop()
        } catch (e) {}
      }
    }
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const myEventsRes = await api.get("/events/my-events")
      setMyEvents(myEventsRes.data.data.events.filter(e => e.isActive && e.status !== "terminated"))
      
      try {
        const grantedRes = await api.get("/event-permissions/my-granted-events")
        const granted = grantedRes.data.data.grantedEvents
          .filter(g => g.event && g.event.isActive && g.permissions.canScan)
          .map(g => g.event)
        setGrantedEvents(granted)
      } catch (err) {}
    } catch (err) {
      setError("Failed to fetch events")
      setTimeout(() => setError(""), 4000)
    } finally {
      setLoading(false)
    }
  }

  const fetchEventData = async () => {
    try {
      const eventRes = await api.get(`/events/${selectedEventId}`)
      setSelectedEvent(eventRes.data.data.event)
      
      const participantsRes = await api.get(`/participants/event/${selectedEventId}`)
      setParticipants(participantsRes.data.data.participants)
      
      const attendanceRes = await api.get(`/attendance/event/${selectedEventId}`)
      const today = new Date().toISOString().split('T')[0]
      const todayScanned = attendanceRes.data.data.attendance.filter(a => {
        const scanDate = new Date(a.scannedAt).toISOString().split('T')[0]
        return scanDate === today
      })
      setScannedToday(todayScanned)
      
      const totalReg = participantsRes.data.data.participants.length
      const present = todayScanned.length
      const absent = totalReg - present
      const rate = totalReg > 0 ? ((present / totalReg) * 100).toFixed(1) : 0
      
      setStats({
        totalRegistered: totalReg,
        present,
        absent,
        attendanceRate: rate
      })
    } catch (err) {
      setError("Failed to fetch event data")
      setTimeout(() => setError(""), 4000)
    }
  }

  const startScanner = async () => {
    setScannerActive(true)
    setError("")
    
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: isMobile ? { width: 250, height: 250 } : { width: 300, height: 300 },
          aspectRatio: 1.0,
          rememberLastUsedCamera: true
        },
        false
      )
      
      scannerRef.current = scanner
      
      scanner.render(
        async (decodedText) => {
          try {
            const qrData = JSON.parse(decodedText)
            await handleScan(qrData.participantId)
          } catch (e) {
            await handleScan(decodedText)
          }
        },
        (error) => {}
      )
    } catch (err) {
      setError("Failed to initialize scanner. Make sure camera permissions are granted.")
      setTimeout(() => setError(""), 5000)
      setScannerActive(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setScannerActive(false)
  }

  const handleScan = async (participantId) => {
    if (!selectedEventId || scanning) return
    
    setScanning(true)
    try {
      // Step 1: Verify QR and get participant details
      const response = await api.post("/attendance/verify-qr", {
        participantId,
        eventId: selectedEventId
      })
      
      // Step 2: Show verification modal
      setVerifiedParticipant(response.data.data.participant)
      setVerifiedEvent(response.data.data.event)
      setAlreadyMarked(response.data.data.alreadyMarked)
      setExistingAttendance(response.data.data.existingAttendance)
      setShowVerificationModal(true)
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to verify QR code"
      setError(errorMsg)
      setTimeout(() => setError(""), 4000)
    } finally {
      setScanning(false)
    }
  }

  const handleConfirmPresent = async () => {
    if (!verifiedParticipant || alreadyMarked) return
    
    setMarkingPresent(true)
    try {
      // Step 3: Mark attendance after confirmation
      const response = await api.post("/attendance/mark-present", {
        participantId: verifiedParticipant.id,
        eventId: selectedEventId
      })
      
      setSuccess(`Attendance marked for ${verifiedParticipant.name}`)
      setTimeout(() => setSuccess(""), 3000)
      
      // Close modal and refresh data
      setShowVerificationModal(false)
      await fetchEventData()
      
      // Reset verification states
      setVerifiedParticipant(null)
      setVerifiedEvent(null)
      setAlreadyMarked(false)
      setExistingAttendance(null)
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to mark attendance"
      setError(errorMsg)
      setTimeout(() => setError(""), 4000)
    } finally {
      setMarkingPresent(false)
    }
  }

  const handleCloseModal = () => {
    setShowVerificationModal(false)
    setVerifiedParticipant(null)
    setVerifiedEvent(null)
    setAlreadyMarked(false)
    setExistingAttendance(null)
  }

  const handleViewReport = () => {
    if (selectedEventId) {
      Navigation.push(`/AttendanceReport/${selectedEventId}`)
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

  const allEvents = [...myEvents, ...grantedEvents]
  const filteredParticipants = participants.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.matricNo?.toLowerCase().includes(search.toLowerCase())
  )

  const getAttendanceStatus = (participantId) => {
    return scannedToday.some(s => s.participantId._id === participantId || s.participantId === participantId)
      ? "present"
      : "absent"
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#FFFFFF",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        input:focus, select:focus {
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

      <Header info="Attendance" />
      
      <div style={{ padding: isMobile ? "20px 16px" : "20px 48px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#64748B", fontSize: isMobile ? "13px" : "13px", margin: 0, fontWeight: "500", letterSpacing: "-0.01em" }}>
              Track and manage event attendance
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
                fontSize: isMobile ? "13px" : "13px",
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
              <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                Attendance Management
              </h2>
              <button
                onClick={scannerActive ? stopScanner : startScanner}
                disabled={!selectedEventId}
                style={{
                  padding: "9px 16px",
                  backgroundColor: scannerActive ? "#DC2626" : "#6B46C1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: !selectedEventId ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                  letterSpacing: "-0.01em",
                  opacity: !selectedEventId ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (selectedEventId && !scannerActive) e.currentTarget.style.backgroundColor = "#5B3BA1"
                  if (selectedEventId && scannerActive) e.currentTarget.style.backgroundColor = "#B91C1C"
                }}
                onMouseLeave={(e) => {
                  if (scannerActive) e.currentTarget.style.backgroundColor = "#DC2626"
                  else e.currentTarget.style.backgroundColor = "#6B46C1"
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                </svg>
                {scannerActive ? "Stop Scanner" : "Scan QR Code"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 2fr 1fr 1fr", gap: "12px", marginBottom: "28px", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Select Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
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
                    transition: "all 0.15s ease",
                    fontWeight: "500"
                  }}
                >
                  <option value="">Select an event</option>
                  {myEvents.length > 0 && (
                    <optgroup label="My Events">
                      {myEvents.map(e => (
                        <option key={e._id} value={e._id}>{e.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {grantedEvents.length > 0 && (
                    <optgroup label="Granted Access">
                      {grantedEvents.map(e => (
                        <option key={e._id} value={e._id}>{e.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Search Participants
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, email, or matric..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    backgroundColor: "#FFFFFF",
                    color: "#0F172A",
                    transition: "all 0.15s ease",
                    fontWeight: "500"
                  }}
                />
              </div>

              <button
                onClick={handleViewReport}
                disabled={!selectedEventId}
                style={{
                  padding: "9px 16px",
                  backgroundColor: !selectedEventId ? "#F1F5F9" : "#6B46C1",
                  color: !selectedEventId ? "#94A3B8" : "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: !selectedEventId ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  letterSpacing: "-0.01em"
                }}
                onMouseEnter={(e) => {
                  if (selectedEventId) e.currentTarget.style.backgroundColor = "#5B3BA1"
                }}
                onMouseLeave={(e) => {
                  if (selectedEventId) e.currentTarget.style.backgroundColor = "#6B46C1"
                }}
              >
                Report
              </button>
            </div>

            {scannerActive && (
              <div style={{ marginBottom: "28px", border: "2px solid #6B46C1", borderRadius: "10px", padding: isMobile ? "16px" : "20px", backgroundColor: "#F8FAFC" }}>
                <div id="qr-reader" style={{ width: "100%", maxWidth: isMobile ? "100%" : "500px", margin: "0 auto" }}></div>
                <p style={{ textAlign: "center", marginTop: "12px", color: "#64748B", fontSize: "13px", fontWeight: "600" }}>
                  Position QR code within the frame
                </p>
              </div>
            )}

            {selectedEventId && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
                {[
                  { label: "Total Registered", value: stats.totalRegistered, color: "#0F172A" },
                  { label: "Present Today", value: stats.present, color: "#000000" },
                  { label: "Absent Today", value: stats.absent, color: "#000000" },
                  { label: "Attendance Rate", value: `${stats.attendanceRate}%`, color: "#000000" }
                ].map((stat, idx) => (
                  <div key={idx} style={{ padding: isMobile ? "16px" : "20px", backgroundColor: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <p style={{ fontSize: "11px", color: "#64748B", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {stat.label}
                    </p>
                    <p style={{ fontSize: isMobile ? "24px" : "28px", fontWeight: "700", color: stat.color, margin: 0, letterSpacing: "-0.02em" }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {selectedEventId && participants.length > 0 && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Participant List ({filteredParticipants.length})
                </h3>

                {isMobile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filteredParticipants.map((participant) => {
                      const status = getAttendanceStatus(participant._id)
                      return (
                        <div 
                          key={participant._id}
                          style={{ padding: "12px", border: "1px solid #E2E8F0", borderRadius: "6px", backgroundColor: "#F8FAFC" }}
                        >
                          <div style={{ marginBottom: "8px" }}>
                            <div style={{ color: "#0F172A", fontWeight: "600", fontSize: "14px", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                              {participant.name}
                            </div>
                            <div style={{ color: "#64748B", fontSize: "12px", marginBottom: "2px" }}>
                              {participant.email}
                            </div>
                            <div style={{ color: "#64748B", fontSize: "12px" }}>
                              {participant.matricNo || participant.track || "N/A"}
                            </div>
                          </div>
                          <span style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            backgroundColor: status === "present" ? "#D1FAE5" : "#FEE2E2",
                            color: status === "present" ? "#065F46" : "#991B1B",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}>
                            {status}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr 1fr", padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "6px 6px 0 0", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <div>Name</div>
                      <div>Email</div>
                      <div>Matric No / Track</div>
                      <div>Status</div>
                    </div>

                    <div style={{ maxHeight: "450px", overflow: "auto", border: "1px solid #E2E8F0", borderTop: "none", borderRadius: "0 0 6px 6px" }}>
                      {filteredParticipants.map((participant) => {
                        const status = getAttendanceStatus(participant._id)
                        return (
                          <div 
                            key={participant._id}
                            style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr 1fr", padding: "12px 16px", borderBottom: "1px solid #F1F5F9", fontSize: "13px", alignItems: "center" }}
                          >
                            <div style={{ color: "#0F172A", fontWeight: "600", letterSpacing: "-0.01em" }}>
                              {participant.name}
                            </div>
                            <div style={{ color: "#64748B", fontSize: "13px" }}>
                              {participant.email}
                            </div>
                            <div style={{ color: "#64748B", fontSize: "13px" }}>
                              {participant.matricNo || participant.track || "N/A"}
                            </div>
                            <div>
                              <span style={{
                                padding: "4px 12px",
                                backgroundColor: status === "present" ? "#D1FAE5" : "#FEE2E2",
                                color: status === "present" ? "#065F46" : "#991B1B",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                              }}>
                                {status}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedEventId && participants.length === 0 && !loading && (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", opacity: 0.5 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p style={{ fontSize: "14px", fontWeight: "600" }}>No participants registered yet</p>
              </div>
            )}

            {!selectedEventId && (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", opacity: 0.5 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <p style={{ fontSize: "14px", fontWeight: "600" }}>Select an event to begin</p>
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

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={handleCloseModal}
        participant={verifiedParticipant}
        event={verifiedEvent}
        alreadyMarked={alreadyMarked}
        existingAttendance={existingAttendance}
        onConfirm={handleConfirmPresent}
        loading={markingPresent}
      />
    </div>
  )
}

export default Attendance