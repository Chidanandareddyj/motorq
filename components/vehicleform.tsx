import React from 'react'
import { Button } from './ui/button';
import { toast } from "sonner";

const VehicleForm = () => {
    const [numberPlate, setNumberPlate] = React.useState("");
    const [vehicleType, setVehicleType] = React.useState("");
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = React.useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!numberPlate || !vehicleType) {
            toast.error('Both fields are required');
            return;
        }
        
        setStatus('loading');
        
        try {
            const response = await fetch("/api/parkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ numberPlate, vehicleType }),
            });
            
            const data = await response.json();
            
            if(data.error) {
                toast.error(data.error);
            } else {
                toast.success("Vehicle registered successfully");
                setNumberPlate("");
                setVehicleType("");
            }
        } catch {
            toast.error('Connection failed');
        } finally {
            setStatus('idle');
        }
    };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Vehicle Entry</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="numberPlate" className="block text-sm font-medium mb-1">
            License Plate
          </label>
          <input 
            type="text" 
            name="numberPlate" 
            id="numberPlate" 
            value={numberPlate} 
            onChange={(e) => setNumberPlate(e.target.value.toUpperCase())} 
            placeholder="Enter license plate" 
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === 'loading'}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="vehicleType" className="block text-sm font-medium mb-1">
            Vehicle Type
          </label>
          <select 
            name="vehicleType" 
            id="vehicleType" 
            value={vehicleType} 
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={status === 'loading'}
          >
            <option value="">Choose type</option>
            <option value="car">Car</option>
            <option value="bike">Motorcycle</option>
            <option value="ev">Electric Vehicle</option>
            <option value="handicap">Accessible</option>
          </select>
        </div>
        
        <div className="flex gap-3">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Processing...' : 'Park Vehicle'}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => { 
              setNumberPlate(""); 
              setVehicleType(""); 
              setStatus('idle');
            }}
            disabled={status === 'loading'}
          >
            Clear
          </Button>
        </div>
      </form>
    </div>
  )
}

export default VehicleForm
