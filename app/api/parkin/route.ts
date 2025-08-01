import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// Slot assignment logic based on vehicle type
const getCompatibleSlotTypes = (vehicleType: string): string[] => {
    switch (vehicleType) {
        case 'car':
            return ['regular', 'compact'];
        case 'bike':
            return ['bike'];
        case 'ev':
            return ['ev'];
        case 'handicap':
            return ['handicap'];
        default:
            return [];
    }
};

// GET method to retrieve parking information or available slots
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'available-slots') {
            // Return available slots for manual assignment
            const { data: slots, error } = await supabase
                .from('parking_slots')
                .select('*')
                .eq('status', 'available')
                .order('slot_number');

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ slots: slots || [] });
        }

        return NextResponse.json({ error: "Invalid action parameter" }, { status: 400 });
    } catch (error) {
        console.error("GET parkin error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { numberPlate, vehicleType, manualSlotId } = body;

        if (!numberPlate || !vehicleType) {
            return NextResponse.json({ error: "Number plate and vehicle type are required" }, { status: 400 });
        }

        // Validate vehicle type
        if (!['car', 'bike', 'ev', 'handicap'].includes(vehicleType)) {
            return NextResponse.json({ error: "Invalid vehicle type" }, { status: 400 });
        }

        // Check if vehicle already has an active session
        // First, get the vehicle ID if it exists
        const { data: vehicleRecord, error: vehicleCheckError } = await supabase
            .from('vehicles')
            .select('id')
            .eq('number_plate', numberPlate)
            .single();

        if (vehicleCheckError && vehicleCheckError.code !== 'PGRST116') {
            // If error is NOT "no rows returned", it's a real error
            return NextResponse.json({ error: `Error checking vehicle: ${vehicleCheckError.message}` }, { status: 500 });
        }

        // If vehicle exists, check for active sessions
        if (vehicleRecord) {
            const { data: existingSession, error: sessionCheckError } = await supabase
                .from('parking_sessions')
                .select('id')
                .eq('status', 'active')
                .eq('vehicle_id', vehicleRecord.id)
                .single();

            if (sessionCheckError && sessionCheckError.code !== 'PGRST116') {
                return NextResponse.json({ error: `Error checking existing sessions: ${sessionCheckError.message}` }, { status: 500 });
            }

            if (existingSession) {
                return NextResponse.json({ error: "Vehicle already has an active parking session" }, { status: 400 });
            }
        }

        // Insert or get existing vehicle
        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .upsert([
                {
                    number_plate: numberPlate,
                    vehicle_type: vehicleType
                }
            ], { 
                onConflict: 'number_plate',
                ignoreDuplicates: false 
            })
            .select()
            .single();

        if (vehicleError) {
            return NextResponse.json({ error: `Failed to process vehicle: ${vehicleError.message}` }, { status: 500 });
        }

        let assignedSlot;

        if (manualSlotId) {
            // Manual slot assignment - check if slot is available
            const { data: slot, error: slotError } = await supabase
                .from('parking_slots')
                .select('*')
                .eq('id', manualSlotId)
                .eq('status', 'available')
                .single();

            if (slotError || !slot) {
                return NextResponse.json({ error: "Selected slot is not available" }, { status: 400 });
            }

            assignedSlot = slot;
        } else {
            // Auto-assign slot based on vehicle type
            const compatibleSlotTypes = getCompatibleSlotTypes(vehicleType);
            
            if (compatibleSlotTypes.length === 0) {
                return NextResponse.json({ error: "No compatible slot types found" }, { status: 400 });
            }

            // Find the nearest available slot of compatible type
            const { data: availableSlots, error: slotsError } = await supabase
                .from('parking_slots')
                .select('*')
                .in('slot_type', compatibleSlotTypes)
                .eq('status', 'available')
                .order('slot_number')
                .limit(1);

            if (slotsError) {
                return NextResponse.json({ error: `Failed to find available slots: ${slotsError.message}` }, { status: 500 });
            }

            if (!availableSlots || availableSlots.length === 0) {
                return NextResponse.json({ error: `No available slots for ${vehicleType} vehicles` }, { status: 409 });
            }

            assignedSlot = availableSlots[0];
        }

        // Start a transaction-like operation
        // 1. Update slot status to occupied
        const { error: slotUpdateError } = await supabase
            .from('parking_slots')
            .update({ 
                status: 'occupied',
                updated_at: new Date().toISOString()
            })
            .eq('id', assignedSlot.id)
            .eq('status', 'available'); // Ensure it's still available

        if (slotUpdateError) {
            return NextResponse.json({ error: `Failed to assign slot: ${slotUpdateError.message}` }, { status: 500 });
        }

        // 2. Create parking session
        const { data: parkingSession, error: sessionError } = await supabase
            .from('parking_sessions')
            .insert([
                {
                    vehicle_id: vehicle.id,
                    slot_id: assignedSlot.id,
                    status: 'active',
                    billing_type: 'hourly', // Default to hourly
                    entry_time: new Date().toISOString()
                }
            ])
            .select(`
                *,
                vehicles(number_plate, vehicle_type),
                parking_slots(slot_number, slot_type, floor, section)
            `)
            .single();

        if (sessionError) {
            // Rollback: Update slot status back to available
            await supabase
                .from('parking_slots')
                .update({ status: 'available' })
                .eq('id', assignedSlot.id);

            return NextResponse.json({ error: `Failed to create parking session: ${sessionError.message}` }, { status: 500 });
        }

        return NextResponse.json({
            message: "Vehicle parked successfully",
            session: parkingSession,
            slot: {
                slot_number: assignedSlot.slot_number,
                slot_type: assignedSlot.slot_type,
                floor: assignedSlot.floor,
                section: assignedSlot.section
            }
        });

    } catch (error) {
        console.error("Parking error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}