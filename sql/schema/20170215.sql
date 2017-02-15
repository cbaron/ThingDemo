CREATE TABLE organization (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(50),
    label          VARCHAR(50)
);

INSERT INTO organization ( name, label ) VALUES ( 'uber', 'Uber' );
INSERT INTO organization ( name, label ) VALUES ( 'park-shark', 'Park Shark' );
INSERT INTO organization ( name, label ) VALUES ( 'weather-channel', 'The Weather Channel' );
INSERT INTO organization ( name, label ) VALUES ( 'wunderground', 'Wunderground' );
INSERT INTO organization ( name, label ) VALUES ( 'norsonic', 'Norsonic' );
INSERT INTO organization ( name, label ) VALUES ( 'beacons-in-space', 'Beacons in Space' );
INSERT INTO organization ( name, label ) VALUES ( 'noaa', 'NOAA' );
INSERT INTO organization ( name, label ) VALUES ( 'cbecs', 'CBECS' );
INSERT INTO organization ( name, label ) VALUES ( 'dvrpc', 'DVRPC' );
INSERT INTO organization ( name, label ) VALUES ( 'air-now', 'Air Now' );
INSERT INTO organization ( name, label ) VALUES ( 'phili', 'Cuty of Philadelphia' );
INSERT INTO organization ( name, label ) VALUES ( 'dep-pa-gov', 'Penn. Dept. of Environmental Protection' );
INSERT INTO organization ( name, label ) VALUES ( 'usgs', 'US. Geological Survery' );
INSERT INTO organization ( name, label ) VALUES ( 'philly-watersheds', 'Philly Water Sheds' );
INSERT INTO organization ( name, label ) VALUES ( 'peco', 'PECO' );
INSERT INTO organization ( name, label ) VALUES ( 'microstrain', 'Microstrain' );
INSERT INTO organization ( name, label ) VALUES ( 'phili-toc', 'Philadelphia TOC' );
INSERT INTO organization ( name, label ) VALUES ( 'acs-security', 'ACS Security' );
INSERT INTO organization ( name, label ) VALUES ( 'ups', 'UPS' );
INSERT INTO organization ( name, label ) VALUES ( 'skydrop', 'Skydrop' );
INSERT INTO organization ( name, label ) VALUES ( 'american-supply', 'American Supply Co' );
INSERT INTO organization ( name, label ) VALUES ( 'honeywell', 'Honeywell' );
INSERT INTO organization ( name, label ) VALUES ( 'lutron', 'Lutron' );
INSERT INTO organization ( name, label ) VALUES ( 'cognizant', 'Cognizant' );
INSERT INTO organization ( name, label ) VALUES ( 'sierra-wireless', 'Sierra Wireless' );
INSERT INTO organization ( name, label ) VALUES ( 'general-electric', 'General Electric' );
INSERT INTO organization ( name, label ) VALUES ( 'swarco', 'Swarco' );
INSERT INTO organization ( name, label ) VALUES ( 'septa', 'SEPTA' );
INSERT INTO organization ( name, label ) VALUES ( 'farmsoft', 'Farmsoft' );
INSERT INTO organization ( name, label ) VALUES ( 'tascomi', 'Tascomi' );

CREATE TABLE category (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(50),
    label          VARCHAR(50)
);

INSERT INTO category ( name, label ) VALUES ( 'transportation', 'Transportation' );
INSERT INTO category ( name, label ) VALUES ( 'atmospheric', 'Atmospheric' );
INSERT INTO category ( name, label ) VALUES ( 'environmental', 'Environmental' );
INSERT INTO category ( name, label ) VALUES ( 'consumer', 'Consumer' );
INSERT INTO category ( name, label ) VALUES ( 'facilities', 'Facilities' );
INSERT INTO category ( name, label ) VALUES ( 'water', 'Water' );
INSERT INTO category ( name, label ) VALUES ( 'smart-grid', 'Smart Grid' );
INSERT INTO category ( name, label ) VALUES ( 'infrastructure', 'Infrastructure' );
INSERT INTO category ( name, label ) VALUES ( 'security', 'Security' );
INSERT INTO category ( name, label ) VALUES ( 'logistics', 'Logistics' );
INSERT INTO category ( name, label ) VALUES ( 'retail', 'Retail' );
INSERT INTO category ( name, label ) VALUES ( 'm2m', 'M2M' );
INSERT INTO category ( name, label ) VALUES ( 'agriculture', 'Agriculture' );
INSERT INTO category ( name, label ) VALUES ( 'analytics', 'Analytics' );

CREATE TABLE "subCategory" (
    id             SERIAL PRIMARY KEY,
    "categoryId"   INTEGER REFERENCES category (id),
    name           VARCHAR(50),
    label          VARCHAR(50)
);

INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'traffic', 'Traffic' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'atmospheric' ), 'temperature', 'Temperature' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'atmospheric' ), 'precipitation', 'Precipitation' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'environmental' ), 'urban-noise', 'Urban Noise Level' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'consumer' ), 'mobile-presence', 'Mobile Phone Presence' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'environmental' ), 'snow-level', 'Snow Level' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'environmental' ), 'seismic-detection', 'Seismic Detection' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'facilities' ), 'energy-consumption', 'Energy Consumption' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'parking', 'Parking' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'foot-traffic', 'Foot Traffic' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'environmental' ), 'air-quality', 'Air Quality' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'environmental' ), 'light-level', 'Light Level' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'water' ), 'potable-water', 'Potable Water Monitoring' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'water' ), 'ocean-pollution', 'Ocean Pollution' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'smart-grid' ), 'energy-consumption', 'Energy Consumption' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'infrastructure' ), 'structural-health', 'Structural Health' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'bus', 'Bus' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'train', 'Train' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'vehicle', 'Vehicle' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'infrastructure' ), 'street-lights', 'Street Lights' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'infrastructure' ), 'traffic-lights', 'Traffic Lights' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'security' ), 'perimeter', 'Perimeter Access Control' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'logistics' ), 'fleet-management', 'Fleet Management' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'water' ), 'smart-watering', 'Smart Watering' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'logistics' ), 'storage-compatibility', 'Storage Compatibility' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'facilities' ), 'hvac', 'HVAC' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'facilities' ), 'lighting-system', 'Lighting System' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'retail' ), 'intelligen-shopping', 'Intelligent Shopping' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'm2m' ), 'machine-monitoring', 'Machine Monitoring' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'smart-grid' ), 'energy-management', 'Energy Management' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'smart-parking', 'Smart Parking' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'traffic-light', 'Traffic Light Mgt' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'transportation' ), 'metro-status', 'Metro Status' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'agriculture' ), 'crop-management', 'Crop Management' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'infrastructure' ), 'remote-control', 'Remote Control' );
INSERT INTO "subCategory" ( "categoryId", name, label ) VALUES ( ( SELECT id FROM category WHERE name = 'analytics' ), 'data-marketplace', 'Data Marketplace' );
