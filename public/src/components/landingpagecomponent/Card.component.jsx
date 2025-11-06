"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import style from "./Card.module.css";
import Link from "next/link";
import api from "@/utils/api"; // axios instance

const EventRegistration = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/events");
        console.log("GET /events ->", res); // inspect full response
        const ev = res?.data?.data?.events ?? [];
        console.log("parsed events ->", ev);
        setEvents(ev);
      } catch (err) {
        console.error("Error fetching events:", err.response?.data ?? err.message);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>Loading events…</p>;
  if (error) return <p>Failed to load events (check console/network).</p>;
  if (!events.length) return <p>No events found.</p>;

  return (
    <>
      {events
        // remove or change the filter until you confirm the backend status strings
        // .filter(event => event.status === "upcoming")
        .map(event => (
          <div key={event._id} className={style.cardSize}>
            {/* fallback image if imageUrl missing */}
            <Image
              src={event.imageUrl || "/placeholder.png"}
              alt={event.name || "event image"}
              height={100}
              width={236}
              // if external URL, make sure domain is allowed in next.config.js
            />

            <h2 className={style.eventname}>{event.name}</h2>

            <div className={style.describe}>
              <h5>{event.description}</h5>
            </div>

            <div className={style.container}>
              <Image src="/calender.svg" height={10} width={10} alt="calendar" />
              <h4 className={style.subtitle}>
                {event.date ? new Date(event.date).toLocaleString() : "Date TBD"}
              </h4>
            </div>

            <div className={style.container}>
              <Image src="/location.svg" height={10} width={10} alt="location" />
              <h4 className={style.subtitle}>{event.location || "Location TBD"}</h4>
            </div>

            <div className={style.container}>
              <Image src="/people.svg" height={10} width={10} alt="participants" />
              <h4 className={style.subtitle}>
                {event.maxParticipants ?? "Capacity N/A"}
              </h4>
            </div>

            <div className={style.button}>
              <Link href={`/Registration?Programid=${event._id}`}>
                Register for the event
              </Link>
            </div>
          </div>
        ))}
    </>
  );
};

export default EventRegistration;
