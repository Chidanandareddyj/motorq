import React from 'react'
import { Button } from './ui/button';

const  vehicleform = () => {
    const [numberPlate, setNumberPlate] = React.useState("");
    const [vehicleType, setVehicleType] = React.useState("");
    const handlesubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numberPlate || !vehicleType) {
            alert("Please fill in all fields");
            return;
        }
        await fetch("/api/parkin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                numberPlate,
                vehicleType,
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert("Vehicle added successfully");
                setNumberPlate("");
                setVehicleType("");
            }
        })
        .catch((error) => {
            console.error("Error adding vehicle:", error);
            alert("Failed to add vehicle");
        });
    }
  return (
    <div>
      <form  onSubmit={handlesubmit}>
        <label htmlFor="numberPlate">Number Plate:</label>
        <input type="text" name="numberPlate" id="numberPlate" value={numberPlate} onChange={(e) => setNumberPlate(e.target.value)} placeholder="Enter number plate" />
        <label htmlFor="vehicleType">Vehicle Type:</label>
        <select name="vehicleType" id="vehicleType" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
          <option value="">Select Vehicle Type</option>
          <option value="car">Car</option>
          <option value="bike">Bike</option>
          <option value="ev">EV</option>
          <option value="handicap">Handicap Accessible</option>
        </select>
        <Button type="submit">Submit</Button>
        <Button type="reset" onClick={() => { setNumberPlate(""); setVehicleType(""); }}>Reset</Button>
      </form>
    </div>
  )
}

export default vehicleform
