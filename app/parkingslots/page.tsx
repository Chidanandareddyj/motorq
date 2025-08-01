"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const ParkingSlotsPage = () => {
  const [data, setData] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

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
      toast.error('Failed to load parking slots');
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

  if (loading) {
    return (
      <div className="min-h-screen ">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Parking Slots Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`p-3  border-2 text-center ${
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

export default ParkingSlotsPage;
