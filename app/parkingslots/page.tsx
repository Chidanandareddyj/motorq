"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Car, 
  Bike, 
  Zap, 
  Accessibility, 
  Wrench, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Clock
} from "lucide-react";

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
    const debounce = setTimeout(() => {
      fetchDashboardData();
    }, 300);
    return () => clearTimeout(debounce);
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

  const getSlotIcon = (type: VehicleType) => {
    switch (type) {
      case 'car': return <Car className="h-5 w-5" />;
      case 'bike': return <Bike className="h-5 w-5" />;
      case 'ev': return <Zap className="h-5 w-5" />;
      case 'handicap': return <Accessibility className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  const getStatusClass = (status: SlotStatus) => {
    switch (status) {
      case 'available': return 'status-available';
      case 'occupied': return 'status-occupied';
      case 'maintenance': return 'status-maintenance';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-32 bg-muted rounded-xl"></div>
              <div className="h-32 bg-muted rounded-xl"></div>
            </div>
            <div className="h-96 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Parking Slots Management</h1>
          <p className="text-muted-foreground text-lg">
            View, filter, and manage all parking slots
          </p>
        </div>
        
        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-hover border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filter by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-12 px-4 py-2 border border-border rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                aria-label="Filter slots by type"
              >
                <option value="all">All Types</option>
                <option value="car">Car (Regular)</option>
                <option value="bike">Bike</option>
                <option value="ev">Electric Vehicle</option>
                <option value="handicap">Handicap Accessible</option>
              </select>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Search by Number Plate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter number plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10 font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {searchQuery && data?.occupiedSlotsData && (
          <Card className="card-hover border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {data.occupiedSlotsData.length > 0 ? (
                <div className="space-y-3">
                  {data.occupiedSlotsData.map((session: any) => (
                    <div
                      key={session.id}
                      className="p-4 border rounded-lg bg-accent/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-lg text-foreground">
                          {session.vehicles.number_plate}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.vehicles.vehicle_type} • Slot{" "}
                          {session.parking_slots.slot_number} (
                          {session.parking_slots.slot_type})
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Parked: {new Date(session.entry_time).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No occupied slots found for "{searchQuery}"
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Parking Slots Grid */}
        <Card className="card-hover border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Parking Grid</CardTitle>
            <p className="text-sm text-muted-foreground">
              {data?.slots?.length || 0} slots matching criteria
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data?.slots?.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 rounded-lg border-2 text-center transition-all duration-300 ${getStatusClass(slot.status)}`}
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {getSlotIcon(slot.slot_type)}
                    <div className="font-bold text-lg">{slot.slot_number}</div>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize mb-2">
                    {slot.slot_type}
                  </div>
                  
                  <div
                    className={`text-sm font-semibold mb-3 capitalize`}
                  >
                    {slot.status}
                  </div>

                  {slot.status !== "occupied" && (
                    <div className="mt-2 space-y-2">
                      {slot.status === "available" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSlotStatusChange(slot.id, "maintenance")}
                          className="w-full text-xs"
                        >
                          <Wrench className="h-3 w-3 mr-1" />
                          Maintenance
                        </Button>
                      )}
                      {slot.status === "maintenance" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSlotStatusChange(slot.id, "available")}
                          className="w-full text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Available
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {(!data?.slots || data.slots.length === 0) && (
              <div className="text-center py-16">
                <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No Slots Found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your filters or search query.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParkingSlotsPage;
