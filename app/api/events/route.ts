import { connectToDatabase } from "@/lib/mongodb";
import { connect } from "http2";
import { NextRequest, NextResponse } from "next/server";
import { Event } from "@/database";
import { resolve } from "path";
import { rejects } from "assert";
import { v2 as cloudinary } from "cloudinary";
import { error } from "console";
import { create } from "domain";

export async function POST(req: NextRequest) {
    try{
        await connectToDatabase();
        
        const formData = await req.formData();

        let event;

        try {
            event = Object.fromEntries(formData.entries())
        } catch(e){
            return NextResponse.json({message: 'Invalid JSON data format'} , {status : 400})
        }
        const file = formData.get('image') as File;

        if(!file){
            return NextResponse.json({message: 'Image file is required'} , {status : 400})
        }
        let tags=JSON.parse(formData.get('tags') as string);
        let agenda=JSON.parse(formData.get('agenda') as string);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve,reject)=>{
            cloudinary.uploader.upload_stream({resource_type:'image' , folder:'DevEvents'} , (error,results) => {
                if(error) reject(error);
                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as {secure_url : string}).secure_url;

        const createdEvent = await Event.create({...event,tags:tags,agenda:agenda});

        return NextResponse.json({message : 'Event created successfully' , event : createdEvent} , {status : 201});
    } catch (e) {
        console.error(e);
        return NextResponse.json({message: 'Event Creation Failed' , error : e instanceof Error ? e.message : 'Unknown'} , {status : 500})
    }
}

export async function GET() {
    try{
        await connectToDatabase();

        const events = await Event.find().sort({createdAt: -1});

        return NextResponse.json({message: "Image fetched Successfully" , events} , {status:200})
    } catch(e) {
        return NextResponse.json({message: "Event Fetching Failed" , error: e } , {status : 500})
    }
}