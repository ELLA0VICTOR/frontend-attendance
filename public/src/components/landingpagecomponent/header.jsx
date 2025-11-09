"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"

const Header = ({ info }) => {
  const Navigation = useRouter()

  const handleAdmin = () => {
    Navigation.push("./AdminLogin")
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700&display=swap');
      `}</style>
      
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(20px, 4vw, 48px)',
        height: 'clamp(56px, 8vh, 64px)',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}>
        {/* Logo Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(8px, 1.5vw, 10px)'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            position: 'relative',
            background: 'rgba(159, 118, 216, 0.8)',
            borderRadius: '2px'
          }}>
            <Image 
              src="/logo.png" 
              alt="NIHUB Logo" 
              width={20}
              height={20}
              style={{ 
                objectFit: 'contain'
              }}
            />
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', -apple-system, sans-serif",
            fontSize: 'clamp(15px, 2vw, 18px)',
            fontWeight: '700',
            color: '#0A0A0A',
            margin: 0,
            letterSpacing: '0.5px'
          }}>
            NIHUB Events
          </h1>
        </div>
        
        {/* Empty space for future nav items */}
        <div></div>
      </header>
    </>
  )
}

export default Header