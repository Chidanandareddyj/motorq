'use client'
import React from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const ExitForm = () => {
    const [numberPlate, setNumberPlate] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const handleExit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numberPlate) {
            alert("Please enter a number plate");
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch("/api/parkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    numberPlate: numberPlate.toUpperCase()
                }),
            });

            const data = await response.json();
            
            if (data.error) {
                alert(data.error);
            } else {
                alert(`Vehicle ${numberPlate} exited successfully!\n\nDetails:\nDuration: ${data.billing.duration_hours} hour(s)\nAmount: $${data.billing.amount}\nSlot: ${data.session.parking_slots.slot_number}`);
                setNumberPlate("");
            }
        } catch (error) {
            console.error("Error exiting vehicle:", error);
            alert("Failed to exit vehicle. Please try again.");
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
                            Number Plate *
                        </label>
                        <Input 
                            type="text" 
                            name="exitNumberPlate" 
                            id="exitNumberPlate" 
                            value={numberPlate} 
                            onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} 
                            placeholder="Enter number plate to exit" 
                            required
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
                            {loading ? "Processing..." : "Exit Vehicle"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setNumberPlate("")}
                            disabled={loading}
                            className="flex-1"
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ExitForm;
