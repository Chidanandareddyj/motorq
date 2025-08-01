'use client'
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Car, Bike, Zap, Accessibility } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SessionData {
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

interface StatsData {
    totalRevenue: number;
    hourlyRevenue: number;
    dayPassRevenue: number;
    dailyRevenue: Record<string, number>;
    monthlyRevenue: Record<string, number>;
    slotUtilization: Record<string, number>;
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
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const response = await fetch('/api/revenue');
                const data = await response.json();
                if (data.error) {
                    toast.error(data.error);
                } else {
                    setSessions(data.sessions);
                    setStats(data.stats);
                }
            } catch (error) {
                toast.error('Failed to fetch revenue data');
            } finally {
                setLoading(false);
            }
        };
        fetchRevenue();
    }, []);

    const dailyChartData = stats ? Object.entries(stats.dailyRevenue).map(([date, revenue]) => ({ date, revenue })) : [];
    const monthlyChartData = stats ? Object.entries(stats.monthlyRevenue).map(([month, revenue]) => ({ month, revenue })) : [];
    const slotChartData = stats ? Object.entries(stats.slotUtilization).map(([slot, count]) => ({ slot, count })) : [];

    return (
        <div className="min-h-screen gradient-bg py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Revenue & Analytics</h1>
                    <p className="text-muted-foreground text-lg">
                        Insights into revenue, slot utilization, and trends.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary">₹{stats?.totalRevenue.toFixed(2) || '0.00'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Hourly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary">₹{stats?.hourlyRevenue.toFixed(2) || '0.00'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Day Pass Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold text-primary">₹{stats?.dayPassRevenue.toFixed(2) || '0.00'}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daily Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="revenue" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Slot Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={slotChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="slot" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#ffc658" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
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
                                ) : sessions.length > 0 ? (
                                    sessions.map((item) => (
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
