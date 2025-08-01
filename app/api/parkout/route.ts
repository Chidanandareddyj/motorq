import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { numberPlate, sessionId } = body;

        if(!numberPlate && !sessionId) {
            return NextResponse.json({ error: "Number plate or session ID is required" }, { status: 400 });
        }

        let session;
        let sessionError;

        if(sessionId) {
            const { data, error } = await supabase
                .from('parking_sessions')
                .select(`
                    *,
                    vehicles(number_plate, vehicle_type),
                    parking_slots(id, slot_number, slot_type)
                `)
                .eq('status', 'active')
                .eq('id', sessionId)
                .single();
            
            session = data;
            sessionError = error;
        } else {
            const { data: vehicle, error: vehicleError } = await supabase
                .from('vehicles')
                .select('id')
                .eq('number_plate', numberPlate)
                .single();

            if(vehicleError || !vehicle) {
                return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
            }
            const { data, error } = await supabase
                .from('parking_sessions')
                .select(`
                    *,
                    vehicles(number_plate, vehicle_type),
                    parking_slots(id, slot_number, slot_type)
                `)
                .eq('status', 'active')
                .eq('vehicle_id', vehicle.id)
                .single();
            
            session = data;
            sessionError = error;
        }

        if(sessionError || !session) {
            return NextResponse.json({ error: "No active parking session found" }, { status: 404 });
        }

        const exitTime = new Date();
        const entryTime = new Date(session.entry_time);
        const durationMinutes = Math.ceil((exitTime.getTime() - entryTime.getTime()) / (1000 * 60));
        const durationHours = durationMinutes / 60;
    
        let billingAmount = 0;
        if (durationHours <= 1) {
            billingAmount = 50; 
        } else if (durationHours <= 3) {
            billingAmount = 100;
        } else if (durationHours <= 6) {
            billingAmount = 150; 
        } else {
            billingAmount = 200; 
        }
        const { error: updateSessionError } = await supabase
            .from('parking_sessions')
            .update({
                exit_time: exitTime.toISOString(),
                status: 'completed',
                duration_minutes: durationMinutes,
                billing_amount: billingAmount,
                updated_at: new Date().toISOString()
            })
            .eq('id', session.id);

        if (updateSessionError) {
            return NextResponse.json({ error: `Failed to update session: ${updateSessionError.message}` }, { status: 500 });
        }
        const { error: slotUpdateError } = await supabase
            .from('parking_slots')
            .update({ 
                status: 'available',
                updated_at: new Date().toISOString()
            })
            .eq('id', session.parking_slots.id);

        if (slotUpdateError) {
            return NextResponse.json({ error: `Failed to update slot: ${slotUpdateError.message}` }, { status: 500 });
        }

        return NextResponse.json({
            message: "Vehicle checked out successfully",
            session: {
                ...session,
                exit_time: exitTime.toISOString(),
                duration_minutes: durationMinutes,
                billing_amount: billingAmount
            },
            billing: {
                duration_hours: Math.ceil(durationHours),
                amount: billingAmount,
                currency: "INR"
            }
        });

    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
