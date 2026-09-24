'use server';

import { connectToDatabase } from "../mongodb";
import { Event } from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug : string) => {
    try{
        await connectToDatabase();

        const event = await Event.findOne({slug});
        const similarEvents = await Event.find({_id :{$ne : event._id }, tags:{$in : event.tags}}).lean();

        return similarEvents;
    }catch{
        return [];
    }
}