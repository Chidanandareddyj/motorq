'use client'
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Car, Bike, Zap, Accessibility } from 'lucide-react';

interface RevenueData {
    id: string;
    entry_time: string;
    exit_time: string;
    final_bill: number;
    billing_type: 'hourly' | 'day_pass';
    vehicles: {
        number_plate: string;
        vehicle_type: string;
    };
}

const VehicleIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'car': return <Car className="h-5 w-5 text-blue-500" />;
        case 'bike': return <Bike className="h-5 w-5 text-green-500" />;
        case 'ev': return <Zap className="h-5 w-5 text-yellow-500" />;
        case 'handicap': return <Accessibility className="h-5 w-5 text-purple-500" />;
        default: return <Car className="h-5 w-5 text-gray-500" />;
    }
};

const RevenuePage = () => {
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const response = await fetch('/api/revenue');
                const data = await response.json();
                if (data.error) {
                    toast.error(data.error);
                } else {
                    setRevenueData(data.revenue);
                }
            } catch (error) {
                toast.error('Failed to fetch revenue data');
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, []);

    const totalRevenue = revenueData.reduce((acc, item) => acc + item.final_bill, 0);

    return (
        <div className="min-h-screen gradient-bg py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Revenue Report</h1>
                    <p className="text-muted-foreground text-lg">
                        Detailed log of all completed parking sessions and earnings.
                    </p>
                </div>

                <Card className="mb-8 shadow-sm border-0">
                    <CardHeader>
                        <CardTitle>Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">
                            ₹{totalRevenue.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-0">
                    <CardHeader>
                        <CardTitle>Revenue Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Number Plate</TableHead>
                                    <TableHead>Entry Time</TableHead>
                                    <TableHead>Exit Time</TableHead>
                                    <TableHead>Billing Type</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : revenueData.length > 0 ? (
                                    revenueData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <VehicleIcon type={item.vehicles.vehicle_type} />
                                            </TableCell>
                                            <TableCell className="font-mono">{item.vehicles.number_plate}</TableCell>
                                            <TableCell>{new Date(item.entry_time).toLocaleString()}</TableCell>
                                            <TableCell>{new Date(item.exit_time).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={item.billing_type === 'day_pass' ? 'secondary' : 'default'}>
                                                    {item.billing_type === 'day_pass' ? 'Day Pass' : 'Hourly'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">₹{item.final_bill.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">No revenue data found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default RevenuePage;
