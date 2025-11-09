"use client"
import React from "react"
import Image from "next/image"

const Header = ({ info }) => {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700&display=swap');
      `}</style>
      
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'clamp(14px, 2vw, 18px) clamp(24px, 4vw, 48px)',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(10px, 1.5vw, 14px)'
        }}>
          <div style={{
            width: 'clamp(28px, 3vw, 32px)',
            height: 'clamp(28px, 3vw, 32px)',
            position: 'relative',
            filter: 'brightness(1.1)'
          }}>
            <Image 
              src="/logo.png" 
              alt="NIHUB Logo" 
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', -apple-system, sans-serif",
            fontSize: 'clamp(16px, 2vw, 20px)',
            fontWeight: '700',
            color: '#FFFFFF',
            margin: 0,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            NIHUB
          </h1>
        </div>
        
        {/* Page Info */}
        {info && (
          <div style={{
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 'clamp(11px, 1.5vw, 13px)',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            padding: '6px 14px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}>
            {info}
          </div>
        )}
      </header>
    </>
  )
}

export default Header