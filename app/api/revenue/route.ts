import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { data, error } = await supabase
            .from('parking_sessions')
            .select(`
                *,
                vehicles(number_plate, vehicle_type)
            `)
            .eq('status', 'completed')
            .not('final_bill', 'is', null)
            .order('exit_time', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ revenue: data });
    } catch (error) {
        console.error("GET revenue error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
