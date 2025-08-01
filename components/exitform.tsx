'use client'
import React from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { toast } from "sonner";

const ExitForm = () => {
    const [numberPlate, setNumberPlate] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleExit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!numberPlate.trim()) {
            toast.error('License plate required');
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch("/api/parkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ numberPlate: numberPlate.toUpperCase() }),
            });

            const data = await response.json();
            
            if(data.error) {
                toast.error(data.error);
            } else {
                const billing = data.billing;
                const slot = data.session.parking_slots;
                toast.success(`Exit processed: ${billing.duration_hours}h parking, $${billing.amount} charged. Slot ${slot.slot_number} now available.`);
                setNumberPlate("");
            }
        } catch {
            toast.error('Connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="text-center">Vehicle Exit</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleExit} className="space-y-4">
                    <div>
                        <label htmlFor="exitNumberPlate" className="block text-sm font-medium text-gray-700 mb-1">
                            License Plate *
                        </label>
                        <Input 
                            type="text" 
                            name="exitNumberPlate" 
                            id="exitNumberPlate" 
                            value={numberPlate} 
                            onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} 
                            placeholder="Enter license plate" 
                            required
                            disabled={loading}
                            className="w-full"
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1"
                            variant="destructive"
                        >
                            {loading ? "Processing..." : "Process Exit"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                                setNumberPlate("");
                            }}
                            disabled={loading}
                            className="flex-1"
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ExitForm;
