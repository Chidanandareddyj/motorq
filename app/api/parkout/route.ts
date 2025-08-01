import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { numberPlate, sessionId } = body;

        if(!numberPlate && !sessionId) {
            return NextResponse.json({ error: "Number plate or session ID is required" }, { status: 400 });
        }

        let query = supabase
            .from('parking_sessions')
            .select(`
                *,
                vehicles(number_plate, vehicle_type),
                parking_slots(id, slot_number, slot_type)
            `)
            .eq('status', 'active');

        if(sessionId) {
            query = query.eq('id', sessionId);
        } else {
            query = query.eq('vehicles.number_plate', numberPlate);
        }

        const { data: session, error: sessionError } = await query.single();

        if(sessionError || !session) {
            return NextResponse.json({ error: "No active parking session found" }, { status: 404 });
        }

        const exitTime = new Date();
        const entryTime = new Date(session.entry_time);
        const durationMinutes = Math.ceil((exitTime.getTime() - entryTime.getTime()) / (1000 * 60));

        // Calculate billing amount (simple hourly rate - $2 per hour, minimum 1 hour)
        const hourlyRate = 2.0;
        const billableHours = Math.max(1, Math.ceil(durationMinutes / 60));
        const billingAmount = billableHours * hourlyRate;

        // Update parking session
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

        // Update slot status to available
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
                duration_hours: Math.ceil(durationMinutes / 60),
                amount: billingAmount,
                currency: "USD"
            }
        });

    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
