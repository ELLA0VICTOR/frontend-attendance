"use client"
import { useState, useEffect } from "react"
import Image from "next/image"

const Header = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div style={{
      display: "flex",
      height: "64px",
      padding: isMobile ? "0 16px" : "0 48px",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderBottom: "1px solid #E2E8F0",
      position: "sticky",
      top: 0,
      zIndex: 100,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      

      {/* Logo Section */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer"
      }}
      onClick={() => window.location.href = "/"}
      onMouseEnter={(e) => {
        const logoText = e.currentTarget.querySelector('[data-logo-text]')
        if (logoText) logoText.style.color = "#6B46C1"
      }}
      onMouseLeave={(e) => {
        const logoText = e.currentTarget.querySelector('[data-logo-text]')
        if (logoText) logoText.style.color = "#0F172A"
      }}>
        
        
        
          <Image 
            src="/logo.png" 
            alt="NIHUB Logo" 
            width={24} 
            height={24}
            style={{
              objectFit: "contain"
            }}
          />
        

        {/* Logo Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <h1 
            data-logo-text
            style={{
              color: "#0F172A",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: "700",
              margin: 0,
              letterSpacing: "-0.02em",
              transition: "color 0.15s ease",
              lineHeight: "1"
            }}
          >
            NIHUB Events
          </h1>
          <p style={{
            color: "#64748B",
            fontSize: "11px",
            fontWeight: "600",
            margin: 0,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            lineHeight: "1"
          }}>
            Registration Portal
          </p>
        </div>
      </div>

      {/* Right Section - Status Badge */}
      {!isMobile && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          backgroundColor: "#F3F0FF",
          borderRadius: "6px",
          border: "1px solid #E0E7FF"
        }}>
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#6B46C1",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
          }}></div>
          <span style={{
            color: "#000000",
            fontSize: "13px",
            fontWeight: "600",
            letterSpacing: "-0.01em"
          }}>
            Registration Open
          </span>
        </div>
      )}

      {/* Mobile Status Indicator */}
      {isMobile && (
        <div style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: "#059669",
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
        }}></div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}

export default Header