"use client"
import React, { useRef } from "react"
import Image from "next/image"
import EventRegistration from "@/public/src/components/landingpagecomponent/Card.component"
import Header from "@/public/src/components/landingpagecomponent/header"

export default function Home() {
  const bottomref = useRef(null)

  const handlescrolltobottom = () => {
    bottomref.current?.scrollIntoView({
      behavior: "smooth"
    })
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');
      `}</style>
      
      <div style={{ 
        backgroundColor: "#FAFBFC",
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Header info="Admin"/>
        
        {/* Hero Section */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            height: 'clamp(380px, 55vh, 520px)',
            overflow: 'hidden'
          }}>
            {/* Background Image */}
            <Image 
              src="/image.png" 
              alt="Hero background" 
              fill
              priority 
              style={{
                objectFit: "cover",
                objectPosition: "center"
              }} 
            />
            
            {/* Gradient Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(30, 30, 50, 0.92) 0%, rgba(0, 0, 0, 0.75) 100%)',
              zIndex: 1
            }}></div>
            
            {/* Hero Content */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              zIndex: 2,
              padding: '0 24px',
              maxWidth: '1100px',
              margin: '0 auto',
              left: 0,
              right: 0
            }}>
              {/* Main Heading */}
              <h1 style={{
                color: '#FFFFFF',
                fontSize: 'clamp(28px, 4.5vw, 48px)',
                fontWeight: '700',
                lineHeight: '1.15',
                margin: '0 0 20px 0',
                fontFamily: "'Orbitron', -apple-system, sans-serif",
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                NIHUB Events
              </h1>
              
              {/* Subheading */}
              <p style={{
                color: '#E5E7EB',
                fontSize: 'clamp(14px, 2vw, 17px)',
                lineHeight: '1.65',
                maxWidth: '680px',
                margin: '0 0 32px 0',
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontWeight: '400',
                letterSpacing: '0.2px'
              }}>
                Discover and register for cutting-edge tech events, workshops, and bootcamps. 
                Enhance your skills and connect with industry professionals.
              </p>
              
              {/* CTA Button */}
              <button 
                onClick={handlescrolltobottom}
                style={{
                  padding: '13px 32px',
                  backgroundColor: 'transparent',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Orbitron', -apple-system, sans-serif",
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#1F2937';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Explore Events
              </button>
            </div>
          </div>
        </div>
        
        {/* Events Section */}
        <div 
          ref={bottomref}
          style={{
            maxWidth: '1480px',
            margin: '0 auto',
            padding: '0 clamp(20px, 4vw, 32px)'
          }}
        >
          {/* Section Header - CENTERED */}
          <div style={{
            marginBottom: '28px',
            textAlign: 'center'
          }}>
            <h2 style={{
              color: '#111827',
              fontSize: 'clamp(20px, 3vw, 28px)',
              fontWeight: '700',
              margin: '0 0 8px 0',
              fontFamily: "'Orbitron', -apple-system, sans-serif",
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Available Events
            </h2>
            <div style={{
              width: '60px',
              height: '3px',
              backgroundColor: '#7741C3',
              margin: '0 auto 10px'
            }}></div>
            <p style={{
              color: '#6B7280',
              fontSize: 'clamp(12px, 1.5vw, 14px)',
              margin: 0,
              fontFamily: "'Inter', -apple-system, sans-serif",
              fontWeight: '400',
              letterSpacing: '0.2px'
            }}>
              Browse and register for upcoming events
            </p>
          </div>
          
          {/* Events Grid */}
          <EventRegistration />
        </div>
        
        {/* Footer Spacing */}
        <div style={{ height: '80px' }}></div>
      </div>
    </>
  )
}