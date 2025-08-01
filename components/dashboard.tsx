"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { PieChart } from '@mui/x-charts/PieChart';
import { toast } from "sonner";

type SlotStatus = 'available' | 'occupied' | 'maintenance';
type VehicleType = 'car' | 'bike' | 'ev' | 'handicap';

interface Slot {
  id: string;
  slot_number: string;
  slot_type: VehicleType;
  status: SlotStatus;
  floor?: string;
  section?: string;
}

interface Stats {
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  maintenanceSlots: number;
  slots: Slot[];
  occupiedSlotsData?: any[];
}

const Dashboard = () => {
  const [data, setData] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [exitNumberPlate, setExitNumberPlate] = React.useState<string>("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== "all") params.append("type", selectedType);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/dashboard?${params.toString()}`);
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDashboardData();
  }, [selectedType, searchQuery]);

  const handleSlotStatusChange = async (slotId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/dashboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchDashboardData();
        toast.success(`Slot marked as ${newStatus}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update slot');
      }
    } catch {
      toast.error('Network error occurred');
    }
  };

  const handleVehicleExit = async () => {
    if(!exitNumberPlate.trim()) {
      toast.error('Number plate is required');
      return;
    }

    try {
      const response = await fetch("/api/parkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberPlate: exitNumberPlate.toUpperCase(),
        }),
      });

      const result = await response.json();

      if(response.ok) {
        toast.success(
          `${exitNumberPlate} checked out. Duration: ${result.billing.duration_hours}h, $${result.billing.amount}`
        );
        setExitNumberPlate("");
        fetchDashboardData(); 
      } else {
        toast.error(result.error || 'Checkout failed');
      }
    } catch(error) {
      toast.error('Network error during checkout');
    }
  };

  // Loading state - probably should be a spinner component
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Parking Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Parking Availability</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Gauge
              value={data?.availableSlots || 0}
              valueMax={data?.totalSlots || 100}
              startAngle={-110}
              endAngle={110}
              sx={{
                [`& .${gaugeClasses.valueText}`]: {
                  fontSize: 40,
                  transform: 'translate(0px, 0px)',
                  fill: '#1e40af',
                  fontWeight: 'bold',
                },
                [`& .${gaugeClasses.valueArc}`]: {
                  fill: 'url(#glossyBlueGradient)',
                },
                [`& .${gaugeClasses.referenceArc}`]: {
                  fill: '#e5e7eb',
                },
              }}
              text={({ value, valueMax }) => `${value} / ${valueMax}`}
              width={300}
              height={200}
            >
              <defs>
                <linearGradient id="glossyBlueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="50%" stopColor="#1d4ed8" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity={1} />
                </linearGradient>
              </defs>
            </Gauge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-center">Parking Status</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <PieChart
              series={[
                {
                  data: [
                    { id: 0, value: data?.availableSlots || 0, label: 'Available', color: '#00ff88' },
                    { id: 1, value: data?.occupiedSlots || 0, label: 'Occupied', color: '#ff3366' },
                    { id: 2, value: data?.maintenanceSlots || 0, label: 'Maintenance', color: '#ff9500' },
                  ],
                },
              ]}
              width={200}
              height={200}
            />
          </CardContent>
        </Card>
      </div>

      {/* Controls section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Filter by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border rounded-md"
              aria-label="Filter slots by type"
            >
              <option value="all">All Types</option>
              <option value="regular">Car (Regular)</option>
              <option value="compact">Car (Compact)</option>
              <option value="bike">Bike</option>
              <option value="ev">Electric Vehicle</option>
              <option value="handicap">Handicap Accessible</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search by Number Plate</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Enter number plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Exit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              type="text"
              placeholder="Number plate to exit"
              value={exitNumberPlate}
              onChange={(e) => setExitNumberPlate(e.target.value.toUpperCase())}
            />
            <Button onClick={handleVehicleExit} className="w-full">
              Checkout Vehicle
            </Button>
          </CardContent>
        </Card>
      </div>
      {searchQuery &&
        data?.occupiedSlotsData &&
        data.occupiedSlotsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.occupiedSlotsData.map((session: any) => (
                  <div
                    key={session.id}
                    className="p-3 border rounded-md bg-gray-50"
                  >
                    <div className="font-semibold">
                      {session.vehicles.number_plate}
                    </div>
                    <div className="text-sm text-gray-600">
                      {session.vehicles.vehicle_type} • Slot{" "}
                      {session.parking_slots.slot_number} (
                      {session.parking_slots.slot_type})
                    </div>
                    <div className="text-xs text-gray-500">
                      Parked: {new Date(session.entry_time).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      <Card>
        <CardHeader>
          <CardTitle>Parking Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {data?.slots?.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 rounded-md border-2 text-center ${
                  slot.status === "available"
                    ? "bg-green-50 border-green-200"
                    : slot.status === "occupied"
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="font-semibold">{slot.slot_number}</div>
                <div className="text-xs text-gray-600 capitalize">
                  {slot.slot_type}
                </div>
                {slot.floor && (
                  <div className="text-xs text-gray-500">
                    Floor {slot.floor}
                  </div>
                )}
                {slot.section && (
                  <div className="text-xs text-gray-500">{slot.section}</div>
                )}
                <div
                  className={`text-xs font-medium mt-1 ${
                    slot.status === "available"
                      ? "text-green-600"
                      : slot.status === "occupied"
                      ? "text-red-600"
                      : "text-orange-600"
                  }`}
                >
                  {slot.status.toUpperCase()}
                </div>
                {slot.status !== "occupied" && (
                  <div className="mt-2 space-y-1">
                    {slot.status === "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleSlotStatusChange(slot.id, "maintenance")
                        }
                        className="w-full text-xs"
                      >
                        Mark Maintenance
                      </Button>
                    )}
                    {slot.status === "maintenance" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleSlotStatusChange(slot.id, "available")
                        }
                        className="w-full text-xs"
                      >
                        Mark Available
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
  );
};

export default Dashboard;
