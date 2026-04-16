-- Direct SQL insert for initial data
-- Run this in your Supabase SQL Editor

-- Insert venues
INSERT INTO venues (id, name, type, max_population, owner_name, owner_contact, address, image, created_at) VALUES
('v1', 'Cape Town Stadium', 'outdoor', 68000, 'City of Cape Town', 'stadium@capetown.gov.za', 'Fritz Sonnenberg Road, Green Point, Cape Town', '/images/venues/cape-town-stadium.jpg', '2025-01-15T08:00:00Z'),
('v2', 'Shared Fields', 'outdoor', 5000, 'City of Cape Town', 'fields@capetown.gov.za', 'Green Point Common, Cape Town', '/images/venues/shared-fields.jpg', '2025-01-15T08:00:00Z'),
('v3', 'Green Point Cricket Club', 'hybrid', 1000, 'Green Point Cricket Club', 'events@gpcc.co.za', 'Queen''s Road, Green Point, Cape Town', '/images/venues/green-point-cricket-club.jpg', '2025-02-01T08:00:00Z'),
('v4', 'Green Point A Track', 'outdoor', 7000, 'City of Cape Town', 'athletics@capetown.gov.za', 'Green Point, Cape Town', '/images/venues/green-point-a-track.jpg', '2025-02-10T08:00:00Z'),
('v5', 'Hamilton Rugby Club', 'hybrid', 12000, 'Hamilton Rugby Club', 'events@hamiltonrfc.co.za', 'Hamilton Road, Green Point, Cape Town', '/images/venues/hamilton-rugby-club.jpg', '2025-03-01T08:00:00Z'),
('v6', 'Green Point Urban Park', 'outdoor', 90000, 'City of Cape Town', 'parks@capetown.gov.za', '1 Fritz Sonnenberg Road, Green Point, Cape Town', '/images/venues/green-point-urban-park.jpg', '2025-03-10T08:00:00Z'),
('v7', 'Green Point Athletics Stadium', 'outdoor', 7000, 'City of Cape Town', 'athletics@capetown.gov.za', 'Green Point, Cape Town', '/images/venues/green-point-athletics-stadium.jpg', '2025-04-01T08:00:00Z');

-- Insert parking areas
INSERT INTO parking_areas (id, name, total_spaces, allocated_spaces, location, linked_venue_ids) VALUES
('p1', 'Stadium Parking Precinct', 4000, 2800, 'Adjacent to Cape Town Stadium, Fritz Sonnenberg Road', '{"v1"}'),
('p2', 'Green Point Common Lot', 1200, 600, 'Green Point Common, off Beach Road', '{"v2", "v4", "v7"}'),
('p3', 'Hamilton Street Parking', 300, 150, 'Hamilton Road, Green Point', '{"v3", "v5"}'),
('p4', 'Urban Park Visitor Parking', 200, 80, 'Fritz Sonnenberg Road, adjacent to Urban Park entrance', '{"v6"}');

-- Insert roads
INSERT INTO roads (id, name, status, closure_reason, closure_start, closure_end, linked_venue_ids) VALUES
('r1', 'Fritz Sonnenberg Road (Stadium Precinct)', 'open', NULL, NULL, NULL, '{"v1", "v6"}'),
('r2', 'Beach Road (Green Point Section)', 'restricted', 'Cape Town Sevens event traffic management', '2026-03-14', '2026-03-15', '{"v1", "v2"}'),
('r3', 'Queen''s Road (Cricket & Rugby Zone)', 'open', NULL, NULL, NULL, '{"v3", "v5"}'),
('r4', 'Helen Suzman Boulevard', 'open', NULL, NULL, NULL, '{"v4", "v7"}');
