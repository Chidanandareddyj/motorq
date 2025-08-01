import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slotType = searchParams.get('type');
        const search = searchParams.get('search');

        // Build query based on filters
        let query = supabase.from('parking_slots').select('*');
        
        if(slotType && slotType !== 'all') {
            query = query.eq('slot_type', slotType);
        }

        const { data: slots, error: slotsError } = await query;
        
        if(slotsError) {
            return NextResponse.json({ error: slotsError.message }, { status: 500 });
        }

        // Get occupied slots with vehicle info if search is provided
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

        return NextResponse.json({
            totalSlots,
            availableSlots,
            occupiedSlots,
            maintenanceSlots,
            slots: slots || [],
            occupiedSlotsData: occupiedSlotsData || []
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Update slot status (for maintenance mode)
export async function PATCH(request: Request) {
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
}