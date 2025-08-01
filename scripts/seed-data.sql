-- Insert sample parking slots for testing
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

-- EV slots
('C001', 'ev', 'available', '1', 'C'),
('C002', 'ev', 'available', '1', 'C'),
('C003', 'ev', 'available', '1', 'C'),

-- Handicap accessible slots
('H001', 'handicap', 'available', '1', 'H'),
('H002', 'handicap', 'available', '1', 'H'),

-- Bike slots
('M001', 'bike', 'available', '1', 'M'),
('M002', 'bike', 'available', '1', 'M'),
('M003', 'bike', 'available', '1', 'M'),
('M004', 'bike', 'available', '1', 'M'),
('M005', 'bike', 'available', '1', 'M'),

-- Additional floor 2 slots
('A101', 'regular', 'available', '2', 'A'),
('A102', 'regular', 'available', '2', 'A'),
('A103', 'regular', 'available', '2', 'A'),
('B101', 'compact', 'available', '2', 'B'),
('B102', 'compact', 'available', '2', 'B'),
('C101', 'ev', 'available', '2', 'C'),
('M101', 'bike', 'available', '2', 'M'),
('M102', 'bike', 'available', '2', 'M'),
('H101', 'handicap', 'available', '2', 'H');
