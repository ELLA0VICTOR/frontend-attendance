"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import api from "@/utils/api"
import { isAuthenticated, isAdmin, logout } from "@/utils/auth"
import Header from "@/public/src/components/AddEventPageComponents/header"

const PermissionGrant = () => {
  const Navigation = useRouter()
  const params = useParams()
  const eventId = params.eventId
  const [isMobile, setIsMobile] = useState(false)
  
  const [event, setEvent] = useState(null)
  const [admins, setAdmins] = useState([])
  const [permissions, setPermissions] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState("")
  const [password, setPassword] = useState("")
  const [permissionOptions, setPermissionOptions] = useState({
    canScan: true,
    canViewReports: true,
    canEdit: false,
    canDelete: false
  })
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})

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
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [eventRes, adminsRes, permissionsRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get("/users"),
        api.get(`/event-permissions/event/${eventId}`).catch(() => ({ data: { data: { permissions: [] } } }))
      ])
      
      setEvent(eventRes.data.data.event)
      setAdmins(adminsRes.data.data.users.filter(u => u.role === "admin"))
      setPermissions(permissionsRes.data.data.permissions || [])
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to fetch data"
      setError(errorMsg)
      setTimeout(() => setError(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleGrantPermission = async (e) => {
    e.preventDefault()
    
    if (!selectedAdmin) {
      setError("Please select an admin")
      setTimeout(() => setError(""), 4000)
      return
    }

    if (!password) {
      setError("Password is required for security")
      setTimeout(() => setError(""), 4000)
      return
    }

    setActionLoading(prev => ({ ...prev, grant: true }))
    try {
      await api.post("/event-permissions/grant", {
        eventId,
        grantToAdminId: selectedAdmin,
        password,
        permissions: permissionOptions,
        notes
      })
      
      setSuccess("Permission granted successfully")
      setTimeout(() => setSuccess(""), 4000)
      
      setSelectedAdmin("")
      setPassword("")
      setNotes("")
      setPermissionOptions({
        canScan: true,
        canViewReports: true,
        canEdit: false,
        canDelete: false
      })
      
      await fetchData()
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to grant permission"
      setError(errorMsg)
      setTimeout(() => setError(""), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, grant: false }))
    }
  }

  const handleRevokePermission = async (adminId) => {
    if (!window.confirm("Are you sure you want to revoke this permission?")) {
      return
    }

    const pwd = window.prompt("Enter your password to confirm:")
    if (!pwd) return

    setActionLoading(prev => ({ ...prev, [adminId]: true }))
    try {
      await api.post("/event-permissions/revoke", {
        eventId,
        revokeFromAdminId: adminId,
        password: pwd
      })
      
      setSuccess("Permission revoked successfully")
      setTimeout(() => setSuccess(""), 4000)
      
      await fetchData()
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to revoke permission"
      setError(errorMsg)
      setTimeout(() => setError(""), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, [adminId]: false }))
    }
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
        <Header info="Grant Permissions" />
        <div style={{ textAlign: "center", padding: "80px 20px", color: "#94A3B8" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E2E8F0", borderTop: "3px solid #6B46C1", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }}></div>
          <p style={{ fontSize: "14px", fontWeight: "600" }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
        <Header info="Grant Permissions" />
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" style={{ margin: "0 auto 16px" }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ color: "#DC2626", marginBottom: "20px", fontSize: "14px", fontWeight: "600" }}>Event not found</p>
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        input:focus, textarea:focus, select:focus {
          border-color: #6B46C1 !important;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
        }
      `}</style>

      <Header info="Grant Permissions" />
      
      <div style={{ padding: isMobile ? "20px 16px" : "20px 48px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
              Grant Permissions
            </h1>
            <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontWeight: "500", letterSpacing: "-0.01em" }}>
              {event.name}
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
        <div style={{ marginBottom: "28px" }}>
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
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F1F5F9"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: isMobile ? "24px" : "32px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "#0F172A", letterSpacing: "-0.01em" }}>
              Grant New Permission
            </h2>
            <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "24px", fontWeight: "500" }}>
              Allow admins to manage this event
            </p>

            <form onSubmit={handleGrantPermission}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Select Admin <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <select
                  value={selectedAdmin}
                  onChange={(e) => setSelectedAdmin(e.target.value)}
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
                    color: "#0F172A",
                    fontWeight: "500"
                  }}
                >
                  <option value="">Choose an admin</option>
                  {admins.map(admin => {
                    const hasPermission = permissions.some(p => 
                      p.grantedTo._id === admin._id && p.isActive
                    )
                    if (hasPermission) return null
                    
                    return (
                      <option key={admin._id} value={admin._id}>
                        {admin.name} ({admin.email})
                      </option>
                    )
                  })}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Your Password <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Confirm your identity"
                  required
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
                <small style={{ color: "#64748B", fontSize: "12px", display: "block", marginTop: "6px", fontWeight: "500" }}>
                  Required for security verification
                </small>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "12px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Permissions
                </label>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { key: 'canScan', label: 'Can scan QR codes' },
                    { key: 'canViewReports', label: 'Can view reports' },
                    { key: 'canEdit', label: 'Can edit event' },
                    { key: 'canDelete', label: 'Can delete event' }
                  ].map(perm => (
                    <label key={perm.key} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px", borderRadius: "6px", transition: "background 0.15s" }}>
                      <input
                        type="checkbox"
                        checked={permissionOptions[perm.key]}
                        onChange={(e) => setPermissionOptions(prev => ({ ...prev, [perm.key]: e.target.checked }))}
                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#6B46C1" }}
                      />
                      <span style={{ fontSize: "13px", color: "#0F172A", fontWeight: "600" }}>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add context about this permission"
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

              <button
                type="submit"
                disabled={actionLoading.grant}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: actionLoading.grant ? "#94A3B8" : "#6B46C1",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: actionLoading.grant ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  letterSpacing: "-0.01em"
                }}
                onMouseEnter={(e) => {
                  if (!actionLoading.grant) e.currentTarget.style.backgroundColor = "#5B3BA1"
                }}
                onMouseLeave={(e) => {
                  if (!actionLoading.grant) e.currentTarget.style.backgroundColor = "#6B46C1"
                }}
              >
                {actionLoading.grant ? "Granting Permission..." : "Grant Permission"}
              </button>
            </form>
          </div>

          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: isMobile ? "24px" : "32px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "6px", color: "#0F172A", letterSpacing: "-0.01em" }}>
              Active Permissions ({permissions.filter(p => p.isActive).length})
            </h2>
            <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "24px", fontWeight: "500" }}>
              Admins with access to this event
            </p>

            {permissions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", opacity: 0.5 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p style={{ fontSize: "13px", fontWeight: "600" }}>No permissions granted yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {permissions.filter(p => p.isActive).map((permission) => (
                  <div 
                    key={permission._id}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "10px",
                      padding: isMobile ? "16px" : "20px",
                      backgroundColor: "#F8FAFC"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <p style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                          {permission.grantedTo.name}
                        </p>
                        <p style={{ fontSize: "12px", color: "#64748B", fontWeight: "500" }}>
                          {permission.grantedTo.email}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleRevokePermission(permission.grantedTo._id)}
                        disabled={actionLoading[permission.grantedTo._id]}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#DC2626",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          cursor: actionLoading[permission.grantedTo._id] ? "not-allowed" : "pointer",
                          fontWeight: "700",
                          transition: "all 0.15s ease",
                          letterSpacing: "-0.01em"
                        }}
                        onMouseEnter={(e) => {
                          if (!actionLoading[permission.grantedTo._id]) e.currentTarget.style.backgroundColor = "#B91C1C"
                        }}
                        onMouseLeave={(e) => {
                          if (!actionLoading[permission.grantedTo._id]) e.currentTarget.style.backgroundColor = "#DC2626"
                        }}
                      >
                        {actionLoading[permission.grantedTo._id] ? "..." : "Revoke"}
                      </button>
                    </div>

                    <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "10px", fontWeight: "600" }}>
                      Granted {new Date(permission.grantedAt).toLocaleDateString()} by {permission.grantedBy.name}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {permission.permissions.canScan && (
                        <span style={{
                          padding: "4px 8px",
                          backgroundColor: "#DBEAFE",
                          color: "#1E40AF",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase"
                        }}>
                          Scan
                        </span>
                      )}
                      {permission.permissions.canViewReports && (
                        <span style={{
                          padding: "4px 8px",
                          backgroundColor: "#DBEAFE",
                          color: "#1E40AF",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase"
                        }}>
                          Reports
                        </span>
                      )}
                      {permission.permissions.canEdit && (
                        <span style={{
                          padding: "4px 8px",
                          backgroundColor: "#FEF3C7",
                          color: "#92400E",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase"
                        }}>
                          Edit
                        </span>
                      )}
                      {permission.permissions.canDelete && (
                        <span style={{
                          padding: "4px 8px",
                          backgroundColor: "#FEE2E2",
                          color: "#991B1B",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: "700",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase"
                        }}>
                          Delete
                        </span>
                      )}
                    </div>

                    {permission.notes && (
                      <p style={{ fontSize: "12px", color: "#64748B", marginTop: "10px", fontStyle: "italic", lineHeight: "1.5", fontWeight: "500" }}>
                        "{permission.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: "20px",
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
            marginTop: "20px",
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
    </div>
  )
}

export default PermissionGrant