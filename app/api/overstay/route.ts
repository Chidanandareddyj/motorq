import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { authenticate, authorization } from "@/lib/middleware";

const MAX_DURATION_HOURS = 6;

export const GET = authenticate(authorization(['admin'])(async (request: any) => {
    try {
        const { data: activeSessions, error } = await supabase
            .from('parking_sessions')
            .select(`
                *,
                vehicles(number_plate, vehicle_type),
                parking_slots(slot_number)
            `)
            .eq('status', 'active');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const now = new Date();
        const overstayingVehicles = activeSessions.filter(session => {
            const entryTime = new Date(session.entry_time);
            const durationHours = (now.getTime() - entryTime.getTime()) / (1000 * 60 * 60);
            return durationHours > MAX_DURATION_HOURS;
        });

        return NextResponse.json({ overstayingVehicles });

    } catch (error) {
        console.error("GET overstay error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}));
