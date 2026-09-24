import BookEvent from '@/components/BookEvent';
import { EventDocument } from '@/database/event.model';
import { promises } from 'dns'
import Image from 'next/image';
import { notFound } from 'next/navigation';
import React from 'react'
import { json } from 'stream/consumers';
import { getSimilarEventsBySlug } from '@/lib/actions/event.actions';
import EventCard from '@/components/EventCard';

const BASE_URL= process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({icon,alt,label} : {icon : string , alt : string , label : string}) => (
  <div className='flex-row-gap-2 items-center' >
    <Image src={icon} alt={alt} height={17} width={17} />
    <p>{label}</p>
  </div>
)

const EventAgenda = ({agendaItems} : {agendaItems : string[]}) => (
  <div className='agenda'>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item)=>(
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

const EventTags = ({tags }:{tags : string[]}) => (
  <div className='flex flex-row gap-1.5 flex-wrap'>
    {tags.map((tag)=>(
      <div className='pill' key={tag}>{tag}</div>
    ))}
  </div>
)

const EventDetailsPage = async ({params }: {params : Promise<{slug : string}>}) => {
  const {slug} = await params;
  const response = await fetch(`${BASE_URL}/api/events/${slug}`);
  const {event : {description , image , overview , date , time , location , mode , agenda , audience , tags , organizer}} = await response.json();

  if(!description) return notFound();

  const bookings = 10;

  const similarEvent: EventDocument[] = await getSimilarEventsBySlug(slug); 

  return (
    <section id='event'>
      <div className='header'> 
        <h1>Event description</h1>
        <p >{description}</p>
      </div>

      <div className='details'>
        {/* left side */}
        <div className='content'>
          <Image src={image} alt='Event Banner' width={800} height={800} />

          <section className='flex-col-gap-2'>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className='flex-col-gap-2'>
            <h2>Event Details</h2>
            <EventDetailItem icon='/icons/calendar.svg' alt='calendar' label={date} />
            <EventDetailItem icon='/icons/clock.svg' alt='clock' label={time} />
            <EventDetailItem icon='/icons/pin.svg' alt='pin' label={location} />
            <EventDetailItem icon='/icons/audience.svg' alt='audience' label={audience} />
            <EventDetailItem icon='/icons/mode.svg' alt='mode' label={mode} />

          </section>

          <EventAgenda agendaItems={(agenda)} />

          <section className='flex-col-gap-2'>
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={(tags)} />
        </div>


        {/* booking form */}
        <aside className='booking'>
          <div className='signup-card'>
            <h2>Book Your Spot</h2>
            {bookings > 0 ? (
             <p className='text-sm'>
              join {bookings} people who have already booked their spot
              </p>) : (
                <p>be the first to book this spot</p>
              )
            }
            <BookEvent />
          </div>
        </aside>
      </div>
      <div className='flex w-full flex-col gap-4 pt-20'>
            <h2>Similar Events</h2>
            <div className='events'>
              {similarEvent.length > 0 && similarEvent.map((similarEvent : EventDocument)=>(
                <EventCard key={similarEvent.slug}
                           title={similarEvent.title}
                           image={similarEvent.image}
                           slug={similarEvent.slug}
                           location={similarEvent.location}
                           date={similarEvent.date}
                           time={similarEvent.time} />
              ))}
            </div>
      </div>
    </section>  
  )
}

export default EventDetailsPage