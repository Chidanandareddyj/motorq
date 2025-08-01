'use client'
import React from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";

interface ParkingSlot {
    id: string;
    slot_number: string;
    slot_type: string;
    status: string;
    floor?: string;
    section?: string;
}

const VehicleRegistration = () => {
    const [numberPlate, setNumberPlate] = React.useState("");
    const [vehicleType, setVehicleType] = React.useState("");
    const [manualSlotId, setManualSlotId] = React.useState("");
    const [availableSlots, setAvailableSlots] = React.useState<ParkingSlot[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        fetchAvailableSlots();
    }, []);

    const fetchAvailableSlots = async () => {
        try {
            const response = await fetch("/api/parkin?action=available-slots");
            const data = await response.json();
            if(data.slots) setAvailableSlots(data.slots);
        } catch {
            toast.error('Failed to fetch available slots');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!numberPlate || !vehicleType) {
            toast.error('License plate and vehicle type required');
            return;
        }
        setLoading(true);
        
        try {
            const response = await fetch("/api/parkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    numberPlate: numberPlate.toUpperCase(),
                    vehicleType,
                    manualSlotId: manualSlotId || null
                }),
            });

            const data = await response.json();
            
            if(data.error) {
                toast.error(data.error);
            } else {
                const slot = data.slot;
                toast.success(
                    `Parked in slot ${slot.slot_number}${slot.floor ? ` (Floor ${slot.floor})` : ''}`
                );
                setNumberPlate("");
                setVehicleType("");
                setManualSlotId("");
                fetchAvailableSlots(); 
            }
        } catch {
            toast.error('Network error. Please retry.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Vehicle Registration</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="numberPlate" className="block text-sm font-medium text-gray-700 mb-1">
                        License Plate *
                    </label>
                    <Input 
                        type="text" 
                        name="numberPlate" 
                        id="numberPlate" 
                        value={numberPlate} 
                        onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} 
                        placeholder="AP 39 AB 1234" 
                        required
                        disabled={loading}
                        className="w-full"
                    />
                </div>

                <div>
                    <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Type *
                    </label>
                    <select 
                        name="vehicleType" 
                        id="vehicleType" 
                        value={vehicleType} 
                        onChange={(e) => setVehicleType(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Choose type</option>
                        <option value="car">Car</option>
                        <option value="bike">Motorcycle</option>
                        <option value="ev">Electric Vehicle</option>
                        <option value="handicap">Accessible</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="manualSlotId" className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Slot (Optional)
                    </label>
                    <select 
                        name="manualSlotId" 
                        id="manualSlotId" 
                        value={manualSlotId} 
                        onChange={(e) => setManualSlotId(e.target.value)}
                        disabled={loading}
                        className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Auto-assign</option>
                        {availableSlots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                                {slot.slot_number} - {slot.slot_type} 
                                {slot.floor && ` (Floor ${slot.floor})`}
                                {slot.section && ` - ${slot.section}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex space-x-3 pt-4">
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? "Processing..." : "Register Vehicle"}
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => { 
                            setNumberPlate(""); 
                            setVehicleType(""); 
                            setManualSlotId("");
                        }}
                        disabled={loading}
                        className="flex-1"
                    >
                        Clear
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default VehicleRegistration;
