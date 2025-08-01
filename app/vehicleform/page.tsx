'use client'
import React from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from "sonner";
import { Car, Bike, Zap, Accessibility, MapPin, Clock, CheckCircle } from 'lucide-react';

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

    const vehicleTypes = [
        { value: 'car', label: 'Car', icon: Car, description: 'Standard passenger vehicle' },
        { value: 'bike', label: 'Motorcycle', icon: Bike, description: 'Two-wheeler vehicle' },
        { value: 'ev', label: 'Electric Vehicle', icon: Zap, description: 'Electric car with charging' },
        { value: 'handicap', label: 'Accessible', icon: Accessibility, description: 'Handicap accessible parking' },
    ];

    const getVehicleIcon = (type: string) => {
        const vehicleType = vehicleTypes.find(v => v.value === type);
        return vehicleType ? vehicleType.icon : Car;
    };

    return (
        <div className="min-h-screen gradient-bg py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Vehicle Registration</h1>
                    <p className="text-muted-foreground text-lg">
                        Register your vehicle and get assigned a parking slot
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="card-hover border-0 shadow-sm">
                            <CardHeader className="pb-6">
                                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                                    <Car className="h-6 w-6 text-primary" />
                                    Registration Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="numberPlate" className="text-sm font-medium text-foreground">
                                            License Plate Number *
                                        </label>
                                        <Input 
                                            type="text" 
                                            name="numberPlate" 
                                            id="numberPlate" 
                                            value={numberPlate} 
                                            onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} 
                                            placeholder="e.g., AP 39 AB 1234" 
                                            required
                                            disabled={loading}
                                            className="h-12 text-lg font-mono tracking-wider"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter your vehicle's license plate number
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground">
                                            Vehicle Type *
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {vehicleTypes.map((type) => {
                                                const Icon = type.icon;
                                                return (
                                                    <div
                                                        key={type.value}
                                                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
                                                            vehicleType === type.value
                                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                                : 'border-border hover:border-primary/50 hover:bg-accent/50'
                                                        } ${loading ? 'pointer-events-none opacity-50' : ''}`}
                                                        onClick={() => !loading && setVehicleType(type.value)}
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <Icon className={`h-6 w-6 mt-0.5 ${
                                                                vehicleType === type.value ? 'text-primary' : 'text-muted-foreground'
                                                            }`} />
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between">
                                                                    <h3 className="font-medium text-foreground">{type.label}</h3>
                                                                    {vehicleType === type.value && (
                                                                        <CheckCircle className="h-5 w-5 text-primary" />
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {type.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="manualSlotId" className="text-sm font-medium text-foreground">
                                            Preferred Slot (Optional)
                                        </label>
                                        <select 
                                            name="manualSlotId" 
                                            id="manualSlotId" 
                                            value={manualSlotId} 
                                            onChange={(e) => setManualSlotId(e.target.value)}
                                            disabled={loading}
                                            className="w-full h-12 px-4 py-2 border border-border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                                        >
                                            <option value="">Auto-assign best available slot</option>
                                            {availableSlots.map((slot) => (
                                                <option key={slot.id} value={slot.id}>
                                                    Slot {slot.slot_number} - {slot.slot_type} 
                                                    {slot.floor && ` (Floor ${slot.floor})`}
                                                    {slot.section && ` - ${slot.section}`}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            Leave empty for automatic assignment
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <Button 
                                            type="submit" 
                                            disabled={loading || !numberPlate || !vehicleType}
                                            className="flex-1 h-12 text-base font-medium"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Register Vehicle
                                                </>
                                            )}
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
                                            className="flex-1 h-12 text-base font-medium"
                                        >
                                            Clear Form
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="card-hover border-0 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    Available Slots
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary mb-1">
                                        {availableSlots.length}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Slots currently available
                                    </p>
                                </div>
                                
                                {availableSlots.length > 0 && (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {availableSlots.slice(0, 8).map((slot) => {
                                            const Icon = getVehicleIcon(slot.slot_type);
                                            return (
                                                <div key={slot.id} className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{slot.slot_number}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground capitalize">
                                                        {slot.slot_type}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {availableSlots.length > 8 && (
                                            <div className="text-center text-xs text-muted-foreground pt-2">
                                                +{availableSlots.length - 8} more slots available
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                {availableSlots.length === 0 && (
                                    <div className="text-center py-8">
                                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            No slots available at the moment
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="card-hover border-0 shadow-sm">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-semibold">Quick Tips</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Auto-assignment</p>
                                        <p className="text-xs text-muted-foreground">
                                            Leave slot selection empty for optimal placement
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">Vehicle types</p>
                                        <p className="text-xs text-muted-foreground">
                                            Choose the correct type for proper slot assignment
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">License plate</p>
                                        <p className="text-xs text-muted-foreground">
                                            Enter exactly as shown on your vehicle
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleRegistration;
