"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import api from "@/utils/api"
import { isAuthenticated, isAdmin, logout } from "@/utils/auth"
import Header from "@/public/src/components/AddEventPageComponents/header"

const AttendanceReport = () => {
  const Navigation = useRouter()
  const params = useParams()
  const eventId = params.eventId
  const [isMobile, setIsMobile] = useState(false)
  
  const [event, setEvent] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filterTrack, setFilterTrack] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

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
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const [eventRes, reportRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get(`/attendance/event/${eventId}/download-report`)
      ])
      
      setEvent(eventRes.data.data.event)
      setReport(reportRes.data.data)
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch report"
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (!report || !report.attendanceRecords) return

    const headers = ["Event Name", "Track", "Participant Name", "Matric No", "Status", "Date", "Scanned At", "Reason"]
    
    const rows = filteredRecords.map(record => [
      record.eventName,
      record.track,
      record.participantName,
      record.matricNo,
      record.status,
      record.date,
      record.scannedAt ? new Date(record.scannedAt).toLocaleString() : "N/A",
      record.reason || ""
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${event?.name || "event"}_attendance_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleLogout = () => {
    logout()
    Navigation.push("/")
  }

  const handleBack = () => {
    Navigation.push("/ManageEvent")
  }

  if (loading) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
        <Header info="Attendance Report" />
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#94A3B8" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E2E8F0", borderTop: "3px solid #6B46C1", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }}></div>
          <p style={{ fontSize: "14px", fontWeight: "600" }}>Loading report...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
        <Header info="Attendance Report" />
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" style={{ margin: "0 auto 16px" }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ color: "#DC2626", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>{error}</p>
          <button
            onClick={handleBack}
            style={{
              padding: "9px 16px",
              backgroundColor: "#6B46C1",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600"
            }}
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  const filteredRecords = report?.attendanceRecords?.filter(record => {
    if (filterTrack && record.track !== filterTrack) return false
    if (filterDate && record.date !== filterDate) return false
    if (filterStatus && record.status !== filterStatus) return false
    return true
  }) || []

  const uniqueDates = [...new Set(report?.attendanceRecords?.map(r => r.date) || [])]
  const uniqueTracks = [...new Set(report?.attendanceRecords?.map(r => r.track) || [])]

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        input:focus, select:focus {
          border-color: #6B46C1 !important;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
        }
      `}</style>

      <Header info="Attendance Report" />
      
      <div style={{ padding: isMobile ? "20px 16px" : "20px 48px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
              Attendance Report
            </h1>
            <p style={{ color: "#64748B", fontSize: isMobile ? "13px" : "13px", margin: 0, fontWeight: "500", letterSpacing: "-0.01em" }}>
              {event?.name}
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

      <div style={{ maxWidth: "1400px", margin: isMobile ? "24px auto" : "40px auto", padding: isMobile ? "0 16px" : "0 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
          <button
            onClick={handleBack}
            style={{
              padding: "9px 16px",
              backgroundColor: "#F8FAFC",
              color: "#0F172A",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: "6px"
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
            Back
          </button>
          
          <button
            onClick={handleDownloadCSV}
            style={{
              padding: "9px 16px",
              backgroundColor: "#6B46C1",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
              letterSpacing: "-0.01em"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5B3BA1"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#6B46C1"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download CSV
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
          {[
            { label: "Total Participants", value: report?.summary?.totalParticipants || 0 },
            { label: "Total Present", value: report?.summary?.totalPresent || 0 },
            { label: "Total Absent", value: report?.summary?.totalAbsent || 0 },
            { label: "Attendance Rate", value: report?.summary?.attendanceRate || "0%" }
          ].map((stat, idx) => (
            <div key={idx} style={{ padding: isMobile ? "20px" : "24px", backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
              <p style={{ fontSize: "11px", color: "#64748B", marginBottom: "8px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: isMobile ? "28px" : "32px", fontWeight: "700", color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: isMobile ? "20px" : "28px", marginBottom: "20px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px", color: "#0F172A", letterSpacing: "-0.01em" }}>
            Filters
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                Track
              </label>
              <select
                value={filterTrack}
                onChange={(e) => setFilterTrack(e.target.value)}
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
                <option value="">All Tracks</option>
                {uniqueTracks.map(track => (
                  <option key={track} value={track}>{track}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                Date
              </label>
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
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
                <option value="">All Dates</option>
                {uniqueDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
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
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                onClick={() => {
                  setFilterTrack("")
                  setFilterDate("")
                  setFilterStatus("")
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#F8FAFC",
                  color: "#0F172A",
                  border: "1px solid #E2E8F0",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
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
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
          <div style={{ padding: isMobile ? "20px" : "24px 28px 20px", borderBottom: "1px solid #E2E8F0" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0F172A", letterSpacing: "-0.01em", margin: 0 }}>
              Attendance Records ({filteredRecords.length})
            </h3>
          </div>

          {isMobile ? (
            <div style={{ padding: "16px" }}>
              {filteredRecords.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94A3B8" }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", opacity: 0.5 }}>
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <p style={{ fontSize: "13px", fontWeight: "600" }}>No records found</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {filteredRecords.map((record, index) => (
                    <div key={index} style={{ padding: "12px", border: "1px solid #E2E8F0", borderRadius: "6px", backgroundColor: "#F8FAFC" }}>
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "14px", color: "#0F172A", fontWeight: "600", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                          {record.participantName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "2px" }}>
                          {record.matricNo}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "2px" }}>
                          {record.track}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{
                          padding: "4px 12px",
                          backgroundColor: record.status === "Present" ? "#D1FAE5" : "#FEE2E2",
                          color: record.status === "Present" ? "#065F46" : "#991B1B",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}>
                          {record.status}
                        </span>
                        <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "500" }}>
                          {record.scannedAt ? new Date(record.scannedAt).toLocaleTimeString() : "Not scanned"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Name
                    </th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Matric No
                    </th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Track
                    </th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Date
                    </th>
                    <th style={{ padding: "12px 20px", textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Status
                    </th>
                    <th style={{ padding: "12px 20px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Scanned At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94A3B8", fontSize: "13px", fontWeight: "600" }}>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, index) => (
                      <tr key={index} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#0F172A", fontWeight: "600", letterSpacing: "-0.01em" }}>
                          {record.participantName}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748B", fontWeight: "500" }}>
                          {record.matricNo}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748B", fontWeight: "500" }}>
                          {record.track}
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748B", fontWeight: "500" }}>
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "center" }}>
                          <span style={{
                            padding: "4px 12px",
                            backgroundColor: record.status === "Present" ? "#D1FAE5" : "#FEE2E2",
                            color: record.status === "Present" ? "#065F46" : "#991B1B",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", fontSize: "13px", color: "#64748B", fontWeight: "500" }}>
                          {record.scannedAt ? new Date(record.scannedAt).toLocaleString() : record.reason || "Not scanned"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceReport