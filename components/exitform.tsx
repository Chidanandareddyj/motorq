'use client'
import React from 'react'
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { toast } from "sonner";
import { LogOut, Car, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

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
                toast.success(`Exit processed: ${billing.duration_hours}h parking, ₹${billing.amount} charged. Slot ${slot.slot_number} now available.`);
                setNumberPlate("");
            }
        } catch {
            toast.error('Connection failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <Card className="card-hover border-0 shadow-lg">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <LogOut className="h-8 w-8 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground">Vehicle Exit</CardTitle>
                    <p className="text-muted-foreground">
                        Process vehicle checkout and billing
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleExit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="exitNumberPlate" className="text-sm font-medium text-foreground">
                                License Plate Number *
                            </label>
                            <div className="relative">
                                <Car className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                <Input 
                                    type="text" 
                                    name="exitNumberPlate" 
                                    id="exitNumberPlate" 
                                    value={numberPlate} 
                                    onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} 
                                    placeholder="Enter license plate" 
                                    required
                                    disabled={loading}
                                    className="h-12 pl-10 text-lg font-mono tracking-wider"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Enter the license plate number to process exit
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button 
                                type="submit" 
                                disabled={loading || !numberPlate.trim()}
                                className="w-full h-12 text-base font-medium bg-red-600 hover:bg-red-700"
                                variant="destructive"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Processing Exit...
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Process Exit
                                    </>
                                )}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setNumberPlate("")}
                                disabled={loading}
                                className="w-full h-12 text-base font-medium"
                            >
                                Clear
                            </Button>
                        </div>
                    </form>

                    {/* Information Section */}
                    <div className="border-t pt-6 space-y-4">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-500" />
                            Exit Process Information
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-3">
                                <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">Duration Calculation</p>
                                    <p className="text-muted-foreground">
                                        Parking duration is calculated from entry to exit time
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <DollarSign className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">Billing</p>
                                    <p className="text-muted-foreground">
                                        Charges are calculated based on parking duration
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">Slot Release</p>
                                    <p className="text-muted-foreground">
                                        Your parking slot will be immediately available for others
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExitForm;
