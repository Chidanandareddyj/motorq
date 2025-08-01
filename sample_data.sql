-- Sample data for parking slots
INSERT INTO parking_slots (slot_number, slot_type, status, floor, section) VALUES
-- Regular car slots
('A001', 'regular', 'available', '1', 'A'),
('A002', 'regular', 'available', '1', 'A'),
('A003', 'regular', 'available', '1', 'A'),
('A004', 'regular', 'available', '1', 'A'),
('A005', 'regular', 'available', '1', 'A'),

-- Compact car slots
('B001', 'compact', 'available', '1', 'B'),
('B002', 'compact', 'available', '1', 'B'),
('B003', 'compact', 'available', '1', 'B'),
('B004', 'compact', 'available', '1', 'B'),
('B005', 'compact', 'available', '1', 'B'),

-- Bike slots
('C001', 'bike', 'available', '1', 'C'),
('C002', 'bike', 'available', '1', 'C'),
('C003', 'bike', 'available', '1', 'C'),
('C004', 'bike', 'available', '1', 'C'),
('C005', 'bike', 'available', '1', 'C'),
('C006', 'bike', 'available', '1', 'C'),
('C007', 'bike', 'available', '1', 'C'),
('C008', 'bike', 'available', '1', 'C'),

-- EV charging slots
('D001', 'ev', 'available', '1', 'D'),
('D002', 'ev', 'available', '1', 'D'),
('D003', 'ev', 'available', '1', 'D'),
('D004', 'ev', 'available', '1', 'D'),

-- Handicap accessible slots
('H001', 'handicap', 'available', '1', 'H'),
('H002', 'handicap', 'available', '1', 'H'),
('H003', 'handicap', 'available', '1', 'H'),

-- Floor 2 slots
('A101', 'regular', 'available', '2', 'A'),
('A102', 'regular', 'available', '2', 'A'),
('A103', 'regular', 'available', '2', 'A'),
('A104', 'regular', 'available', '2', 'A'),
('A105', 'regular', 'available', '2', 'A'),
('B101', 'compact', 'available', '2', 'B'),
('B102', 'compact', 'available', '2', 'B'),
('B103', 'compact', 'available', '2', 'B'),
('C101', 'bike', 'available', '2', 'C'),
('C102', 'bike', 'available', '2', 'C'),
('C103', 'bike', 'available', '2', 'C'),
('C104', 'bike', 'available', '2', 'C'),
('D101', 'ev', 'available', '2', 'D'),
('D102', 'ev', 'available', '2', 'D'),
('H101', 'handicap', 'available', '2', 'H'),
('H102', 'handicap', 'available', '2', 'H');

-- Sample vehicles (optional for testing)
INSERT INTO vehicles (number_plate, vehicle_type) VALUES
('ABC123', 'car'),
('XYZ789', 'bike'),
('EV001', 'ev'),
('HC456', 'handicap'),
('CAR999', 'car');
