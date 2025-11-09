"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import api, { getImageUrl } from "@/utils/api";

// Custom SVG Icons - Professional & Minimal
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 14C8 14 13 10 13 6C13 3.23858 10.7614 1 8 1C5.23858 1 3 3.23858 3 6C3 10 8 14 8 14Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M1 14C1 11.2386 3.23858 9 6 9C8.76142 9 11 11.2386 11 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="11.5" cy="3.5" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M13 9C14.6569 9 16 10.3431 16 12V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const EventRegistration = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/events");
        const ev = res?.data?.data?.events ?? [];
        setEvents(ev);
        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err.response?.data ?? err.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleImageError = (eventId) => {
    setFailedImages(prev => new Set(prev).add(eventId));
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#6B7280',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E7EB',
          borderTopColor: '#7741C3',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', fontWeight: '500', fontSize: '14px' }}>Loading events...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#DC2626',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          backgroundColor: '#FEE2E2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          fontSize: '24px'
        }}>!</div>
        <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>
          Failed to load events
        </p>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>
          Please check your connection and try again
        </p>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#6B7280',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          backgroundColor: '#F3F4F6',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <CalendarIcon />
        </div>
        <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px', color: '#111827' }}>
          No events available
        </p>
        <p style={{ fontSize: '13px' }}>
          Check back later for upcoming events
        </p>
      </div>
    );
  }

  const activeEvents = events.filter(event => !event.isDeleted && event.isActive);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
      gap: 'clamp(16px, 2vw, 20px)',
      width: '100%'
    }}>
      {activeEvents.map(event => {
        const imageUrl = getImageUrl(event.imageUrl);
        const hasFailedImage = failedImages.has(event._id);

        return (
          <div 
            key={event._id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              height: 'fit-content',
              maxWidth: '320px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(119, 65, 195, 0.25)';
              e.currentTarget.style.borderColor = '#7741C3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            {/* Event Image */}
            <div style={{ 
              position: 'relative', 
              width: '100%', 
              height: '160px',
              overflow: 'hidden',
              backgroundColor: '#F9FAFB'
            }}>
              {imageUrl && !hasFailedImage ? (
                <img
                  src={imageUrl}
                  alt={event.name || "Event"}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={() => handleImageError(event._id)}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #7741C3 0%, #9F76D8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '42px',
                  fontWeight: '700',
                  fontFamily: "'Orbitron', sans-serif"
                }}>
                  {event.name?.charAt(0).toUpperCase() || 'E'}
                </div>
              )}
              
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: event.status === 'ongoing' ? '#10B981' : '#7741C3',
                color: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '9px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontFamily: "'Orbitron', sans-serif"
              }}>
                {event.status || 'Upcoming'}
              </div>
            </div>

            {/* Content */}
            <div style={{ 
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              flexGrow: 1
            }}>
              {/* Event Name */}
              <h3 style={{
                color: '#111827',
                fontSize: '14px',
                fontWeight: '700',
                lineHeight: '1.2',
                margin: 0,
                fontFamily: "'Orbitron', -apple-system, sans-serif",
                letterSpacing: '0.2px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '34px'
              }}>
                {event.name}
              </h3>

              {/* Description */}
              <p style={{
                color: '#6B7280',
                fontSize: '11px',
                lineHeight: '1.45',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontFamily: "'Inter', -apple-system, sans-serif",
                minHeight: '32px'
              }}>
                {event.description || "No description available"}
              </p>

              {/* Event Details */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {/* Date */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#4B5563'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', opacity: 0.7, flexShrink: 0 }}>
                    <CalendarIcon />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    letterSpacing: '0.1px'
                  }}>
                    {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : "Date TBD"}
                  </span>
                </div>

                {/* Location */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#4B5563'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', opacity: 0.7, flexShrink: 0 }}>
                    <LocationIcon />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    letterSpacing: '0.1px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {event.location || "Location TBD"}
                  </span>
                </div>

                {/* Capacity */}
                {event.maxParticipants && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#4B5563'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', opacity: 0.7, flexShrink: 0 }}>
                      <UsersIcon />
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '500',
                      fontFamily: "'Inter', -apple-system, sans-serif",
                      letterSpacing: '0.1px'
                    }}>
                      Max {event.maxParticipants}
                    </span>
                  </div>
                )}
              </div>

              {/* Register Button */}
              <Link 
                href={`/Registration?Programid=${event._id}`}
                style={{ textDecoration: 'none', marginTop: 'auto' }}
              >
                <button style={{
                  width: '100%',
                  padding: '9px 16px',
                  backgroundColor: '#7741C3',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: "'Orbitron', -apple-system, sans-serif",
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5E2FA3';
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7741C3';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                >
                  Register
                </button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventRegistration;