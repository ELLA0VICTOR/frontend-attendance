"use client"
import { useEffect } from "react"
import { getImageUrl } from "@/utils/api"

const VerificationModal = ({ 
  isOpen, 
  onClose, 
  participant, 
  event,
  alreadyMarked,
  existingAttendance,
  onConfirm, 
  loading 
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen || !participant) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  // ===== BASE64 IMAGE HANDLING =====
  // Photo is now Base64 string from database
  const imageUrl = getImageUrl(participant.photo)

  return (
    <div
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: isMobile ? "16px" : "20px", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease-out", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      onClick={onClose}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", maxWidth: "560px", width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", animation: "slideUp 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ padding: isMobile ? "24px 20px" : "28px 28px 20px", borderBottom: "1px solid #E2E8F0", backgroundColor: "#F8FAFC" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <div>
              <h2 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px 0", letterSpacing: "-0.02em" }}>
                Verify Participant
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", margin: 0, fontWeight: "500", letterSpacing: "-0.01em" }}>
                Confirm identity before marking attendance
              </p>
            </div>
            <button onClick={onClose}
              style={{ width: "32px", height: "32px", borderRadius: "6px", border: "none", backgroundColor: "#F1F5F9", color: "#64748B", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: "600", transition: "all 0.15s ease", flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E2E8F0"; e.currentTarget.style.color = "#0F172A" }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#64748B" }}>
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isMobile ? "24px 20px" : "28px" }}>
          
          {/* Photo Section */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
            <div style={{ position: "relative", width: isMobile ? "130px" : "150px", height: isMobile ? "130px" : "150px", marginBottom: "16px" }}>
              {imageUrl ? (
                <img src={imageUrl} alt={participant.name}
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "4px solid #6B46C1", boxShadow: "0 10px 15px -3px rgba(107, 70, 193, 0.2), 0 4px 6px -2px rgba(107, 70, 193, 0.1)", display: "block" }}
                  onError={(e) => {
                    console.error('Image failed to load');
                    e.target.style.display = 'none';
                    const fallback = e.target.nextSibling;
                    if (fallback) fallback.style.display = 'flex';
                  }} />
              ) : null}
              
              {/* Fallback Avatar */}
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", backgroundColor: "#F8FAFC", display: imageUrl ? "none" : "flex", alignItems: "center", justifyContent: "center", border: "4px solid #6B46C1", boxShadow: "0 10px 15px -3px rgba(107, 70, 193, 0.2), 0 4px 6px -2px rgba(107, 70, 193, 0.1)", position: imageUrl ? "absolute" : "static", top: 0, left: 0 }}>
                <span style={{ fontSize: isMobile ? "44px" : "52px", color: "#6B46C1", fontWeight: "700" }}>
                  {participant.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Status Badge */}
              {alreadyMarked && (
                <div style={{ position: "absolute", bottom: "4px", right: "4px", backgroundColor: "#059669", color: "#FFFFFF", borderRadius: "50%", width: "38px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid #FFFFFF", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.15)", fontSize: "16px", fontWeight: "700" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>

            <h3 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", color: "#0F172A", margin: "0 0 6px 0", textAlign: "center", letterSpacing: "-0.01em" }}>
              {participant.name}
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0, fontWeight: "600", textAlign: "center", wordBreak: "break-word", maxWidth: "100%" }}>
              {participant.email}
            </p>
          </div>

          {/* Already Marked Warning */}
          {alreadyMarked && existingAttendance && (
            <div style={{ padding: "14px 16px", backgroundColor: "#ECFDF5", border: "1px solid #10B981", borderRadius: "6px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "2px" }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "700", color: "#065F46", margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>
                    Already Marked Present
                  </p>
                  <p style={{ fontSize: "12px", color: "#047857", margin: 0, lineHeight: "1.5", fontWeight: "600" }}>
                    Recorded at {new Date(existingAttendance.scannedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            {[
              { label: "Matric Number", value: participant.matricNo || "N/A" },
              { label: "Department", value: participant.department || "N/A" },
              { label: "Gender", value: participant.gender || "N/A" },
              { label: "Track", value: participant.track || "None" },
            ].map((item, idx) => (
              <div key={idx} style={{ padding: "14px", backgroundColor: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                <p style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {item.label}
                </p>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Event Info */}
          {event && (
            <div style={{ padding: "14px 16px", backgroundColor: "#EEF2FF", borderRadius: "6px", border: "1px solid #C7D2FE", marginBottom: "20px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#4338CA", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Event Details
              </p>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#1E1B4B", margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>
                {event.name}
              </p>
              <p style={{ fontSize: "12px", color: "#4338CA", margin: 0, fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {event.location}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: isMobile ? "20px" : "20px 28px", borderTop: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "10px 20px", backgroundColor: "#FFFFFF", color: "#0F172A", border: "1px solid #E2E8F0", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.15s ease", letterSpacing: "-0.01em" }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F8FAFC"; e.currentTarget.style.borderColor = "#CBD5E1" }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFFFF"; e.currentTarget.style.borderColor = "#E2E8F0" }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading || alreadyMarked}
            style={{ flex: 1, padding: "10px 20px", backgroundColor: alreadyMarked ? "#94A3B8" : (loading ? "#94A3B8" : "#6B46C1"), color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: (loading || alreadyMarked) ? "not-allowed" : "pointer", transition: "all 0.15s ease", letterSpacing: "-0.01em", boxShadow: (loading || alreadyMarked) ? "none" : "0 1px 3px rgba(107, 70, 193, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            onMouseEnter={(e) => { if (!loading && !alreadyMarked) { e.currentTarget.style.backgroundColor = "#5B3BA1" } }}
            onMouseLeave={(e) => { if (!loading && !alreadyMarked) { e.currentTarget.style.backgroundColor = "#6B46C1" } }}>
            {loading ? (
              <>
                <div style={{ width: "14px", height: "14px", border: "2px solid #FFFFFF", borderTop: "2px solid transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }}></div>
                Marking...
              </>
            ) : alreadyMarked ? (
              "Already Marked"
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Mark Present
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VerificationModal