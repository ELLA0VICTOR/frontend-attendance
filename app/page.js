"use client"
import React, { useRef } from "react"
import { useState, useEffect } from "react"  
import Image from "next/image"
import EventRegistration from "@/public/src/components/landingpagecomponent/Card.component"
import data from "@/public/src/components/landingpagecomponent/backendresponsemock"
import style from "./page.module.css"
import Header from "@/public/src/components/landingpagecomponent/header"
import axios from "axios"

export default function Home() {
  const [events, setEvents] = useState([])
  const [error, seterror]=useState("")
  const [loading, setloading]=useState("")
  const [success, setsuccess]=useState("")

  // use to fetch available event from the backend 
useEffect( ()=>{

   const fetchEvents =async ()=>{
    setloading(true)

    try{
    const response=await axios.get(/*BACKENDURLTOGETEVENT*/)
    const  info=response.json()
    setEvents(info.data)
    seterror("")
    setloading(false)
    setsuccess("suceesfully getting the latest info")
           
    }catch(erro){
     seterror("fail to get data frombackend data",erro)
     setsuccess("")
     setloading(false)
    }
   }   
})

const bottomref=useRef(null)

const handlescrolltobottom=()=>{
  bottomref.current?.scrollIntoView({
    behavior:"smoth"
  })
}

return (
  <div style={{backgroundColor:"white"}}>
  <div>
  <Header info="Admin"/>
  </div> 
  <div className={style.container}>
  <div className={style.background}>
   <Image src="/image.png" alt="" width={1336} height={600} priority style={{objectFit:"cover", zIndex:0}} />
   <div className={style.overlay}></div>
   <div className={style.wellcome}>
    <h1>Welcome to NIHUB</h1> 
   <h1>Events</h1></div>
    <div className={style.subwellcome}>  
      <h1>Discover and Register for existing tech event
         workshops bootcamps hosted by NITDA HUB 
        enhance your skills and connect with
        your fellow tech enthusiasts </h1>
    </div>
    <button className={style.explore} onClick={handlescrolltobottom} >explore event</button>
    
  </div>
   
  </div>
  <div className={style.availableevent}>
    
    <h1 className={style.textheading}>Available Events</h1>
    <h3 className={style.subheading}>Browse and register for upcoming events </h3>
  </div >
  <div className={style.eventcontainer}>
  <EventRegistration data={data}/>
  </div>   
        {error && <p className={style.error}>{error}</p>}
        {success && <p className={style.sucess}>{success}</p>}
     
  </div>
  )}

    // <EventRegistration data={data}/>