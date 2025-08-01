import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { data: sessions, error } = await supabase
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

        const totalRevenue = sessions.reduce((acc, session) => acc + session.final_bill, 0);
        const hourlyRevenue = sessions
            .filter(session => session.billing_type === 'hourly')
            .reduce((acc, session) => acc + session.final_bill, 0);
        const dayPassRevenue = sessions
            .filter(session => session.billing_type === 'day_pass')
            .reduce((acc, session) => acc + session.final_bill, 0);

        const dailyRevenue = sessions.reduce((acc, session) => {
            const date = new Date(session.exit_time).toLocaleDateString();
            acc[date] = (acc[date] || 0) + session.final_bill;
            return acc;
        }, {} as Record<string, number>);

        const monthlyRevenue = sessions.reduce((acc, session) => {
            const month = new Date(session.exit_time).toLocaleString('default', { month: 'long', year: 'numeric' });
            acc[month] = (acc[month] || 0) + session.final_bill;
            return acc;
        }, {} as Record<string, number>);

        const { data: slotUtilization, error: slotError } = await supabase
            .from('parking_sessions')
            .select('slot_id, parking_slots(slot_number)')
            .eq('status', 'completed');

        if (slotError) {
            return NextResponse.json({ error: slotError.message }, { status: 500 });
        }

        const slotCounts: Record<string, number> = {};
        slotUtilization.forEach(session => {
            const slotNumber = (session.parking_slots as any)?.slot_number;
            if (slotNumber) {
                slotCounts[slotNumber] = (slotCounts[slotNumber] || 0) + 1;
            }
        });


        return NextResponse.json({
            sessions,
            stats: {
                totalRevenue,
                hourlyRevenue,
                dayPassRevenue,
                dailyRevenue,
                monthlyRevenue,
                slotUtilization: slotCounts,
            }
        });
    } catch (error) {
        console.error("GET revenue error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
