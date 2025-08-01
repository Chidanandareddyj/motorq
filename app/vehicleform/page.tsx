'use client'
import React from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ParkingSlot {
    id: string;
    slot_number: string;
    slot_type: string;
    status: string;
    floor?: string;
    section?: string;
}

const vehicleform = () => {
    const [numberPlate, setNumberPlate] = React.useState("");
    const [vehicleType, setVehicleType] = React.useState("");
    const [manualSlotId, setManualSlotId] = React.useState("");
    const [availableSlots, setAvailableSlots] = React.useState<ParkingSlot[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Fetch available slots when component mounts
    React.useEffect(() => {
        fetchAvailableSlots();
    }, []);

    const fetchAvailableSlots = async () => {
        try {
            const response = await fetch("/api/parkin?action=available-slots");
            const data = await response.json();
            if (data.slots) {
                setAvailableSlots(data.slots);
            }
        } catch (error) {
            console.error("Error fetching slots:", error);
        }
    };

    const handlesubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numberPlate || !vehicleType) {
            alert("Please fill in all required fields");
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch("/api/parkin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    numberPlate: numberPlate.toUpperCase(),
                    vehicleType,
                    manualSlotId: manualSlotId || null
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
            } else {
                alert(`Vehicle parked successfully!\nSlot: ${data.slot.slot_number}\nType: ${data.slot.slot_type}${data.slot.floor ? `\nFloor: ${data.slot.floor}` : ''}${data.slot.section ? `\nSection: ${data.slot.section}` : ''}`);
                setNumberPlate("");
                setVehicleType("");
                setManualSlotId("");
                fetchAvailableSlots(); // Refresh available slots
            }
        } catch (error) {
            console.error("Error parking vehicle:", error);
            alert("Failed to park vehicle. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Vehicle Entry</h2>
            <form onSubmit={handlesubmit} className="space-y-4">
                <div>
                    <label htmlFor="numberPlate" className="block text-sm font-medium text-gray-700 mb-1">
                        Number Plate *
                    </label>
                    <Input 
                        type="text" 
                        name="numberPlate" 
                        id="numberPlate" 
                        value={numberPlate} 
                        onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} 
                        placeholder="Enter number plate" 
                        required
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
                        className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Select Vehicle Type</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="ev">Electric Vehicle</option>
                        <option value="handicap">Handicap Accessible</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="manualSlotId" className="block text-sm font-medium text-gray-700 mb-1">
                        Manual Slot Override (Optional)
                    </label>
                    <select 
                        name="manualSlotId" 
                        id="manualSlotId" 
                        value={manualSlotId} 
                        onChange={(e) => setManualSlotId(e.target.value)}
                        className="w-full h-9 px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Auto-assign slot</option>
                        {availableSlots.map((slot) => (
                            <option key={slot.id} value={slot.id}>
                                {slot.slot_number} - {slot.slot_type} 
                                {slot.floor && ` (Floor ${slot.floor})`}
                                {slot.section && ` (${slot.section})`}
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
                        {loading ? "Parking..." : "Park Vehicle"}
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
                        Reset
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default vehicleform;
