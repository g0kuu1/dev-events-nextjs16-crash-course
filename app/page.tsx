import EventCard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { EventDocument } from "@/database";
import { cacheLife } from "next/cache";

const BASE_URL= process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
  'use cache';
  cacheLife('hours');
  const response = await fetch(`${BASE_URL}/api/events`)
  const { events } = await response.json();

  return (
    <section>
      <h1 className="text-center">The Hub For Every Dev <br /> Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>
      
      <ExploreBtn />
      
      <div>
        <h3>Featured Events</h3>

        <ul className="events list-none p-0">
          { events && events.length > 0 && events.map((event : EventDocument )=> (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
            
          ))}
        </ul>
      </div>
      </section>
  )
}

export default page