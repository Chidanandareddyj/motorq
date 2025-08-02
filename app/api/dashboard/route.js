import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import {authenticate,authorization } from "@/lib/middleware"
export const GET = authenticate(authorization([ 'admin'])(async (request) => {
    try {
        const { searchParams } = new URL(request.url);
        const slotType = searchParams.get('type');
        const search = searchParams.get('search');
        let query = supabase.from('parking_slots').select(`
            *,
            parking_sessions (
                vehicles (
                    number_plate
                )
            )
        `);
        
        if(slotType && slotType !== 'all') {
            query = query.eq('slot_type', slotType);
        }

        const { data: slots, error: slotsError } = await query;
        
        if(slotsError) {
            return NextResponse.json({ error: slotsError.message }, { status: 500 });
        }
        let occupiedSlotsData = [];
        if(search) {
            const { data: sessions, error: sessionsError } = await supabase
                .from('parking_sessions')
                .select(`
                    *,
                    vehicles!inner(number_plate, vehicle_type),
                    parking_slots!inner(slot_number, slot_type)
                `)
                .eq('status', 'active')
                .ilike('vehicles.number_plate', `%${search}%`);
            
            if(!sessionsError) {
                occupiedSlotsData = sessions;
            }
        }

        const totalSlots = slots?.length || 0;
        const availableSlots = slots?.filter(slot => slot.status === 'available').length || 0;
        const occupiedSlots = slots?.filter(slot => slot.status === 'occupied').length || 0;
        const maintenanceSlots = slots?.filter(slot => slot.status === 'maintenance').length || 0;

        const { data: completedSessions, error: revenueError } = await supabase
            .from('parking_sessions')
            .select('final_bill')
            .eq('status', 'completed');

        let totalRevenue = 0;
        if (!revenueError && completedSessions) {
            totalRevenue = completedSessions.reduce((sum, session) => {
                return sum + (session.final_bill || 0);
            }, 0);
        }

        return NextResponse.json({
            totalSlots,
            availableSlots,
            occupiedSlots,
            maintenanceSlots,
            totalRevenue,
            slots: slots || [],
            occupiedSlotsData: occupiedSlotsData || []
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}));

export  const  PATCH= authenticate(authorization(['admin'])(async(request)=> {
    try {
        const body = await request.json();
        const { slotId, status } = body;

        if (!slotId || !status) {
            return NextResponse.json({ error: "Slot ID and status are required" }, { status: 400 });
        }

        if (!['available', 'occupied', 'maintenance'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('parking_slots')
            .update({ 
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', slotId)
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "Slot status updated successfully", data });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}))
