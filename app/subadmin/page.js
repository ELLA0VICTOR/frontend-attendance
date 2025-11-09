"use client"
import { useState, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import api from "@/utils/api"
import { isAuthenticated, isSuperAdmin, logout } from "@/utils/auth"
import Header from "@/public/src/components/AddEventPageComponents/header"
import { Rolecontex } from "@/public/src/components/AdminLoginpageComponents/Admincontex"

const SubAdmin = () => {
  const Navigation = useRouter()
  const { Role } = useContext(Rolecontex)
  const [isMobile, setIsMobile] = useState(false)
  
  const [button, setbutton] = useState("subadmin")
  const [admins, setAdmins] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated() || !isSuperAdmin()) {
      Navigation.push("/AdminLogin")
      return
    }
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setLoading(true)
      const response = await api.get("/users")
      setAdmins(response.data.data.users)
    } catch (err) {
      setError("Failed to fetch admins")
      setTimeout(() => setError(""), 4000)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields")
      setTimeout(() => setError(""), 4000)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setTimeout(() => setError(""), 4000)
      return
    }

    setActionLoading(prev => ({ ...prev, create: true }))
    try {
      await api.post("/users", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "admin"
      })
      
      setSuccess("Admin created successfully. Credentials sent to their email.")
      setTimeout(() => setSuccess(""), 5000)
      
      setFormData({ name: "", email: "", password: "" })
      setShowModal(false)
      await fetchAdmins()
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create admin"
      setError(errorMsg)
      setTimeout(() => setError(""), 5000)
    } finally {
      setActionLoading(prev => ({ ...prev, create: false }))
    }
  }

  const handleDeleteAdmin = async (adminId) => {
    if (deleteConfirm !== adminId) {
      setDeleteConfirm(adminId)
      setTimeout(() => setDeleteConfirm(null), 5000)
      return
    }

    setActionLoading(prev => ({ ...prev, [adminId]: true }))
    try {
      await api.delete(`/users/${adminId}`)
      setAdmins(prev => prev.filter(a => a._id !== adminId))
      setSuccess("Admin deleted successfully")
      setTimeout(() => setSuccess(""), 3000)
      setDeleteConfirm(null)
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to delete admin"
      setError(errorMsg)
      setTimeout(() => setError(""), 4000)
    } finally {
      setActionLoading(prev => ({ ...prev, [adminId]: false }))
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
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        input:focus {
          border-color: #6B46C1 !important;
          box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1) !important;
        }
      `}</style>

      <Header info="Admins" />
      
      <div style={{ padding: isMobile ? "20px 16px" : "20px 48px", backgroundColor: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: "700", color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "#64748B", fontSize: "13px", margin: 0, fontWeight: "500", letterSpacing: "-0.01em" }}>
              Manage sub-administrator accounts
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
            { path: "/subadmin", name: "subadmin", label: "Admins" }
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

      <div style={{ maxWidth: "1400px", margin: isMobile ? "24px auto" : "40px auto", padding: isMobile ? "0 16px" : "0 48px" }}>
        <div style={{ marginBottom: "28px" }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "9px 16px",
              backgroundColor: "#6B46C1",
              color: "#FFFFFF",
              border: "none",
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
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5B3BA1"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6B46C1"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Admin
          </button>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", padding: isMobile ? "24px" : "36px", border: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)" }}>
          <h2 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", marginBottom: "24px", color: "#0F172A", letterSpacing: "-0.02em" }}>
            Admins ({admins.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
              <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTop: "3px solid #6B46C1", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }}></div>
              <p style={{ fontSize: "14px", fontWeight: "600" }}>Loading admins...</p>
            </div>
          ) : admins.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#94A3B8" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: "0 auto 12px", opacity: 0.5 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <p style={{ fontSize: "14px", fontWeight: "600" }}>No admins created yet</p>
            </div>
          ) : (
            <>
              {isMobile ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {admins.map((admin) => (
                    <div 
                      key={admin._id}
                      style={{ padding: "16px", border: "1px solid #E2E8F0", borderRadius: "6px", backgroundColor: "#F8FAFC" }}
                    >
                      <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "14px", color: "#0F172A", fontWeight: "700", marginBottom: "4px", letterSpacing: "-0.01em" }}>
                          {admin.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748B", marginBottom: "8px", fontWeight: "500" }}>
                          {admin.email}
                        </div>
                        <span style={{
                          padding: "4px 10px",
                          backgroundColor: admin.role === "superadmin" ? "#EDE9FE" : "#E0E7FF",
                          color: admin.role === "superadmin" ? "#5B21B6" : "#3730A3",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}>
                          {admin.role}
                        </span>
                      </div>
                      {admin.role !== "superadmin" && (
                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          disabled={actionLoading[admin._id]}
                          style={{
                            width: "100%",
                            padding: "8px",
                            backgroundColor: deleteConfirm === admin._id ? "#B91C1C" : "#DC2626",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: actionLoading[admin._id] ? "not-allowed" : "pointer",
                            fontWeight: "700",
                            transition: "all 0.15s ease",
                            letterSpacing: "-0.01em"
                          }}
                          onMouseEnter={(e) => {
                            if (!actionLoading[admin._id]) e.currentTarget.style.backgroundColor = "#B91C1C"
                          }}
                          onMouseLeave={(e) => {
                            if (!actionLoading[admin._id]) {
                              e.currentTarget.style.backgroundColor = deleteConfirm === admin._id ? "#B91C1C" : "#DC2626"
                            }
                          }}
                        >
                          {actionLoading[admin._id] ? "..." : (deleteConfirm === admin._id ? "Confirm?" : "Delete")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr 1fr 1fr", padding: "12px 16px", backgroundColor: "#F8FAFC", borderRadius: "6px 6px 0 0", fontSize: "11px", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Actions</div>
                  </div>

                  <div style={{ border: "1px solid #E2E8F0", borderTop: "none", borderRadius: "0 0 6px 6px" }}>
                    {admins.map((admin) => (
                      <div 
                        key={admin._id}
                        style={{ display: "grid", gridTemplateColumns: "2fr 3fr 1fr 1fr", padding: "14px 16px", borderBottom: "1px solid #F1F5F9", fontSize: "13px", alignItems: "center" }}
                      >
                        <div style={{ color: "#0F172A", fontWeight: "700", letterSpacing: "-0.01em" }}>
                          {admin.name}
                        </div>
                        <div style={{ color: "#64748B", fontSize: "13px", fontWeight: "500" }}>
                          {admin.email}
                        </div>
                        <div>
                          <span style={{
                            padding: "4px 10px",
                            backgroundColor: admin.role === "superadmin" ? "#EDE9FE" : "#E0E7FF",
                            color: admin.role === "superadmin" ? "#5B21B6" : "#3730A3",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                          }}>
                            {admin.role}
                          </span>
                        </div>
                        <div>
                          {admin.role !== "superadmin" && (
                            <button
                              onClick={() => handleDeleteAdmin(admin._id)}
                              disabled={actionLoading[admin._id]}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: deleteConfirm === admin._id ? "#B91C1C" : "#DC2626",
                                color: "#FFFFFF",
                                border: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                                cursor: actionLoading[admin._id] ? "not-allowed" : "pointer",
                                fontWeight: "700",
                                transition: "all 0.15s ease",
                                letterSpacing: "-0.01em"
                              }}
                              onMouseEnter={(e) => {
                                if (!actionLoading[admin._id]) e.currentTarget.style.backgroundColor = "#B91C1C"
                              }}
                              onMouseLeave={(e) => {
                                if (!actionLoading[admin._id]) {
                                  e.currentTarget.style.backgroundColor = deleteConfirm === admin._id ? "#B91C1C" : "#DC2626"
                                }
                              }}
                            >
                              {actionLoading[admin._id] ? "..." : (deleteConfirm === admin._id ? "Confirm?" : "Delete")}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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

      {showModal && (
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
        }} onClick={() => setShowModal(false)}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "10px",
            padding: isMobile ? "24px" : "32px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: isMobile ? "18px" : "20px", fontWeight: "700", color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
                Create Admin
              </h3>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleCreateAdmin}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Full Name <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
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
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Email <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="admin@example.com"
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
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "8px", color: "#0F172A", letterSpacing: "-0.01em" }}>
                  Password <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
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
                  Credentials will be emailed to the admin
                </small>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "24px", borderTop: "1px solid #E2E8F0", paddingTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  type="submit"
                  disabled={actionLoading.create}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#6B46C1",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: actionLoading.create ? "not-allowed" : "pointer",
                    transition: "all 0.15s ease",
                    letterSpacing: "-0.01em"
                  }}
                  onMouseEnter={(e) => {
                    if (!actionLoading.create) e.currentTarget.style.backgroundColor = "#5B3BA1"
                  }}
                  onMouseLeave={(e) => {
                    if (!actionLoading.create) e.currentTarget.style.backgroundColor = "#6B46C1"
                  }}
                >
                  {actionLoading.create ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
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

export default SubAdmin