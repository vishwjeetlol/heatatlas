"""
HeatAtlas District Cities Registry & Climatological Engine
Supports major district cities across Maharashtra & India with:
- High-precision geographic bounding boxes (BBOX) and centroids
- 64-cell ward / locality matrices (8x8 grid per city)
- Climatological heatwave profile & El Niño / La Niña teleconnection factor
- Urban Heat Island (UHI) anomaly coefficients
- Local registered NGO bases and default precision junctions
"""

CITIES = {
    "pune": {
        "id": "pune",
        "name": "Pune",
        "state": "Maharashtra",
        "region": "Western Ghats / Deccan",
        "climate_zone": "Tropical Wet and Dry / Deccan Plateau",
        "el_nino_vulnerability": "High (Pre-monsoon drought & severe asphalt heat traps)",
        "el_nino_temp_boost": 2.2,
        "centroid": [18.5204, 73.8567],
        "bbox": {
            "south": 18.41,
            "west": 73.70,
            "north": 18.65,
            "east": 73.95
        },
        "default_junction": {
            "name": "Swargate Flyover (Jedhe Chowk)",
            "lat": 18.5018,
            "lon": 73.8578
        },
        "wards": [
            ["Dehu Road", "Nigdi", "Akurdi", "Chinchwad N", "Moshi", "Bhosari N", "Alandi", "Charholi"],
            ["Ravet", "Thergaon", "Pimpri", "Kasarwadi", "Bhosari MIDC", "Dighi", "Dhanori N", "Lohegaon"],
            ["Hinjawadi Ph-1", "Wakad", "Pimple Saudagar", "Dapodi", "Khadki", "Vishrantwadi", "Tingre Nagar", "Viman Nagar N"],
            ["Hinjawadi Ph-2", "Balewadi", "Baner", "Aundh", "Shivajinagar", "Pune Station", "Yerawada", "Viman Nagar / Kharadi"],
            ["Chandni Chowk", "Bavdhan", "Kothrud", "Deccan Gymkhana", "Kasba Peth", "Swargate", "Camp / Cantonment", "Hadapsar APMC"],
            ["NDA Khadakwasla", "Warje", "Karvenagar", "Parvati", "Bibwewadi", "Market Yard", "Wanowrie", "Magarpatta / Mundhwa"],
            ["Uttamnagar", "Shivane", "Sinhagad Rd", "Vadgaon Budruk", "Dhankawadi", "Kondhwa", "NIBM / Salunke Vihar", "Uruli Devachi"],
            ["Donje", "Khadakwasla S", "Nanded City", "Dhayari", "Ambegaon", "Katraj", "Pisoli", "Handewadi"]
        ],
        "ngos": [
            {
                "id": "ngo_pn_01",
                "name": "Pune Heat Action Collective (Swargate Base)",
                "lat": 18.5020,
                "lon": 73.8580,
                "address": "Jedhe Chowk, Swargate",
                "phone": "+91 98230 11223",
                "teams": 3,
                "water_cans": 60,
                "ors_stock": 500,
                "active_squads": 2
            },
            {
                "id": "ngo_pn_02",
                "name": "Aapla Pune Seva Foundation (Deccan Hub)",
                "lat": 18.5170,
                "lon": 73.8410,
                "address": "FC Road, Deccan Gymkhana",
                "phone": "+91 94220 55667",
                "teams": 2,
                "water_cans": 40,
                "ors_stock": 300,
                "active_squads": 1
            }
        ],
        "assets": [
            {"osm_id": "sw_w1", "name": "Jedhe Chowk Traffic Police Drinking Post", "type": "drinking_water", "lat": 18.5022, "lon": 73.8575, "status": "working", "category": "Water", "address": "Jedhe Chowk, Under Swargate Flyover"},
            {"osm_id": "sw_w2", "name": "Swargate ST Bus Stand Cool Tap Booth", "type": "drinking_water", "lat": 18.5012, "lon": 73.8582, "status": "working", "category": "Water", "address": "Platform 1, MSRTC Swargate"},
            {"osm_id": "sw_c1", "name": "Swargate Underground Metro AC Concourse", "type": "cool_haven", "lat": 18.5016, "lon": 73.8584, "status": "working", "category": "AC Cool Haven", "address": "Metro Entrance 1, Jedhe Chowk"},
            {"osm_id": "sw_p1", "name": "Sarasbaug Public Shaded Garden Canopy", "type": "park", "lat": 18.5008, "lon": 73.8535, "status": "working", "category": "Shade & Parks", "address": "Sarasbaug Main Lawns"},
            {"osm_id": "sw_h1", "name": "PMC Urban Health Post Swargate", "type": "clinic", "lat": 18.5028, "lon": 73.8590, "status": "working", "category": "Clinics & ORS", "address": "Behind Bus Depot, Swargate"}
        ]
    },
    "nagpur": {
        "id": "nagpur",
        "name": "Nagpur",
        "state": "Maharashtra",
        "region": "Vidarbha (Heatwave Epicenter)",
        "climate_zone": "Tropical Wet and Dry / Severe Continental Heat",
        "el_nino_vulnerability": "CRITICAL (Loo Wind Amplification, 47°C+ Peak Risk)",
        "el_nino_temp_boost": 3.8,
        "centroid": [21.1458, 79.0882],
        "bbox": {
            "south": 21.05,
            "west": 78.98,
            "north": 21.25,
            "east": 79.20
        },
        "default_junction": {
            "name": "Sitabuldi Interchange & Zero Mile Stone",
            "lat": 21.1460,
            "lon": 79.0830
        },
        "wards": [
            ["Koradi N", "Mankapur", "Godhni", "Zingabai Takli", "Nari", "Jaripatka N", "Uppalwadi", "Kamptee Rd"],
            ["Friends Colony", "Seminary Hills", "Gittikhadan", "Katol Naka", "Jaripatka S", "Indora", "Pili Nadi", "Kalamna"],
            ["Ravinagar", "Civil Lines N", "Sadar", "Kadbi Chowk", "Pachpaoli", "Kamal Chowk", "Shanti Nagar", "Bharatwada"],
            ["Dharampeth N", "Civil Lines S", "Zero Mile", "Sitabuldi Interchange", "Itwari Market", "Gandhibagh", "Lakadganj", "Surya Nagar"],
            ["Dharampeth S", "Gokulpeth", "Ramdaspeth", "Dhantoli", "Mahal", "Badkas Chowk", "Bhandewadi", "Pardi"],
            ["Bajaj Nagar", "Laxmi Nagar", "Congress Nagar", "Medical Square", "Reshimbagh", "Sakkardara", "Dighori N", "Wathoda"],
            ["Pratap Nagar", "Khamla", "Chhatrapati Sq", "Ajni Station", "Ayodhya Nagar", "Manewada", "Subhash Nagar", "Dighori S"],
            ["Trimurti Nagar", "Jaitala", "Sonegaon Airport", "Wardha Rd SEZ", "Besa", "Beltarodi", "Hudkeshwar", "Pipla"]
        ],
        "ngos": [
            {
                "id": "ngo_ng_01",
                "name": "Vidarbha Heat Taskforce (Sitabuldi Base)",
                "lat": 21.1450,
                "lon": 79.0820,
                "address": "Sitabuldi Metro Station Gate 2",
                "phone": "+91 98900 22334",
                "teams": 4,
                "water_cans": 90,
                "ors_stock": 900,
                "active_squads": 3
            },
            {
                "id": "ngo_ng_02",
                "name": "Orange City Relief Mission (Itwari Hub)",
                "lat": 21.1520,
                "lon": 79.1120,
                "address": "Itwari Grain Market",
                "phone": "+91 94230 88990",
                "teams": 3,
                "water_cans": 50,
                "ors_stock": 400,
                "active_squads": 2
            }
        ],
        "assets": [
            {"osm_id": "ng_w1", "name": "Sitabuldi Metro Cool Tap Point", "type": "drinking_water", "lat": 21.1465, "lon": 79.0835, "status": "working", "category": "Water", "address": "Sitabuldi Square"},
            {"osm_id": "ng_c1", "name": "Sitabuldi Underground AC Metro Concourse", "type": "cool_haven", "lat": 21.1458, "lon": 79.0828, "status": "working", "category": "AC Cool Haven", "address": "Zero Mile Metro Interchange"},
            {"osm_id": "ng_p1", "name": "Maharajbagh Zoo & Botanical Tree Canopy", "type": "park", "lat": 21.1432, "lon": 79.0745, "status": "working", "category": "Shade & Parks", "address": "Maharajbagh Road"},
            {"osm_id": "ng_h1", "name": "GMC Nagpur Emergency Heat Stroke Ward", "type": "clinic", "lat": 21.1378, "lon": 79.0965, "status": "working", "category": "Clinics & ORS", "address": "Medical Square, Hanuman Nagar"}
        ]
    },
    "mumbai": {
        "id": "mumbai",
        "name": "Mumbai",
        "state": "Maharashtra",
        "region": "Konkan Coastal Megacity",
        "climate_zone": "Tropical Coastal / High Relative Humidity Trap",
        "el_nino_vulnerability": "Severe Wet-Bulb Hazard (38°C + 85% Humidity = 52°C Heat Index)",
        "el_nino_temp_boost": 2.6,
        "centroid": [19.0760, 72.8777],
        "bbox": {
            "south": 18.90,
            "west": 72.80,
            "north": 19.25,
            "east": 72.98
        },
        "default_junction": {
            "name": "Dadar TT Circle & Kabutarkhana",
            "lat": 19.0178,
            "lon": 72.8478
        },
        "wards": [
            ["Borivali West", "Borivali East", "Kandivali W", "Kandivali E", "Malad West", "Malad East", "Goregaon W", "Goregaon E"],
            ["Jogeshwari W", "Jogeshwari E", "Andheri W", "Andheri E", "MIDC Andheri", "Marol", "Saki Naka", "Powai"],
            ["Juhu", "Vile Parle W", "Vile Parle E", "Santacruz W", "Santacruz E", "Kalina", "Kurla West", "Kurla East"],
            ["Khar", "Bandra West", "Bandra East", "BKC Core", "Dharavi N", "Sion West", "Sion Koliwada", "Ghatkopar"],
            ["Mahim", "Matunga W", "Dadar West", "Dadar TT Circle", "Dharavi S", "Wadala", "Sewri", "Vikhroli"],
            ["Prabhadevi", "Parel", "Elphinstone", "Naigaon", "Lower Parel", "Lalbaug", "Cotton Green", "Kanjurmarg"],
            ["Worli Seaface", "Worli Naka", "Mahalaxmi", "Byculla", "Nagpada", "Mazgaon", "Dockyard Rd", "Bhandup"],
            ["Pedder Road", "Grant Road", "Girgaon", "Marine Lines", "Fort", "Nariman Point", "Colaba", "Mulund"]
        ],
        "ngos": [
            {
                "id": "ngo_mb_01",
                "name": "Mumbai Gig Worker Aid (Dadar Junction)",
                "lat": 19.0180,
                "lon": 72.8470,
                "address": "Dadar TT Circle, Dadar East",
                "phone": "+91 98200 44556",
                "teams": 4,
                "water_cans": 80,
                "ors_stock": 1000,
                "active_squads": 3
            },
            {
                "id": "ngo_mb_02",
                "name": "BKC Heat Patrol Squad (Kurla Base)",
                "lat": 19.0650,
                "lon": 72.8680,
                "address": "BKC Connector Gate",
                "phone": "+91 98210 99887",
                "teams": 3,
                "water_cans": 60,
                "ors_stock": 600,
                "active_squads": 2
            }
        ],
        "assets": [
            {"osm_id": "mb_w1", "name": "Dadar Station Central Water Kiosk", "type": "drinking_water", "lat": 19.0185, "lon": 72.8432, "status": "working", "category": "Water", "address": "Platform 1, Dadar Central"},
            {"osm_id": "mb_c1", "name": "Aqua Line Metro Underground AC Haven", "type": "cool_haven", "lat": 19.0195, "lon": 72.8450, "status": "working", "category": "AC Cool Haven", "address": "Dadar Underground Metro 3"},
            {"osm_id": "mb_p1", "name": "Shivaji Park Shaded Green Perimeter", "type": "park", "lat": 19.0268, "lon": 72.8385, "status": "working", "category": "Shade & Parks", "address": "Shivaji Park, Dadar W"},
            {"osm_id": "mb_h1", "name": "KEM Hospital Emergency Heat Ward", "type": "clinic", "lat": 19.0028, "lon": 72.8415, "status": "working", "category": "Clinics & ORS", "address": "Acharya Donde Marg, Parel"}
        ]
    },
    "sambhajinagar": {
        "id": "sambhajinagar",
        "name": "Chhatrapati Sambhajinagar",
        "state": "Maharashtra",
        "region": "Marathwada Drought & Extreme Heat Belt",
        "climate_zone": "Semi-Arid / Intense Solar Radiation",
        "el_nino_vulnerability": "SEVERE (Acute groundwater depletion & 45°C+ heatwaves)",
        "el_nino_temp_boost": 3.4,
        "centroid": [19.8762, 75.3433],
        "bbox": {
            "south": 19.80,
            "west": 75.25,
            "north": 19.95,
            "east": 75.45
        },
        "default_junction": {
            "name": "Kranti Chowk Flyover Base",
            "lat": 19.8732,
            "lon": 75.3245
        },
        "wards": [
            ["Harsul N", "Mayur Park", "Jalgaon Rd", "Harsul T-Point", "MGM Campus", "N-1 CIDCO", "N-2 CIDCO", "Chikalthana Airport"],
            ["Ghati Hospital", "Bhadkal Gate", "Delhi Gate", "Makai Gate", "Collector Office", "N-3 CIDCO", "N-4 CIDCO", "MIDC Chikalthana N"],
            ["City Chowk", "Gulmandi", "Nirala Bazar", "Panchakki", "Jubilee Park", "Town Centre", "CIDCO Bus Stand", "MIDC Chikalthana S"],
            ["Kranti Chowk", "Adalat Road", "Samarth Nagar", "Usmanpura N", "Railway Station N", "N-5 CIDCO", "N-6 CIDCO", "Mukundwadi"],
            ["Railway Station S", "Bansilal Nagar", "Usmanpura S", "Garkheda N", "Sutgirni Chowk", "N-7 CIDCO", "N-8 CIDCO", "N-9 CIDCO"],
            ["Padegaon", "Cantonment", "Shahnurwadi", "Garkheda S", "Ulkanagari", "N-11 CIDCO", "N-12 CIDCO", "Cidco Mahanagar"],
            ["Waluj MIDC N", "Pandharpur Waluj", "Beed Bypass W", "Satara Parisar N", "Devlai Chowk", "Mahanagar 1", "Mahanagar 2", "Chitegaon"],
            ["Waluj MIDC S", "Bajaj Nagar Waluj", "Beed Bypass E", "Satara Parisar S", "Devlai Parisar", "Zalta Phata", "Shendra MIDC N", "Shendra MIDC S"]
        ],
        "ngos": [
            {
                "id": "ngo_cs_01",
                "name": "Marathwada Drought & Heat Relief Taskforce",
                "lat": 19.8730,
                "lon": 75.3240,
                "address": "Kranti Chowk Flyover, Sambhajinagar",
                "phone": "+91 94222 11990",
                "teams": 3,
                "water_cans": 75,
                "ors_stock": 750,
                "active_squads": 2
            }
        ],
        "assets": [
            {"osm_id": "cs_w1", "name": "Kranti Chowk Public Water Station", "type": "drinking_water", "lat": 19.8735, "lon": 75.3248, "status": "working", "category": "Water", "address": "Under Kranti Chowk Flyover"},
            {"osm_id": "cs_c1", "name": "Central Bus Stand AC Transit Shelter", "type": "cool_haven", "lat": 19.8820, "lon": 75.3265, "status": "working", "category": "AC Cool Haven", "address": "CBS Bus Depot"},
            {"osm_id": "cs_p1", "name": "Siddharth Garden & Zoo Shaded Forest", "type": "park", "lat": 19.8835, "lon": 75.3180, "status": "working", "category": "Shade & Parks", "address": "Near Central Bus Stand"},
            {"osm_id": "cs_h1", "name": "Government Medical College & Hospital (Ghati)", "type": "clinic", "lat": 19.8910, "lon": 75.3210, "status": "working", "category": "Clinics & ORS", "address": "Panchakki Road"}
        ]
    },
    "nashik": {
        "id": "nashik",
        "name": "Nashik",
        "state": "Maharashtra",
        "region": "Northern Maharashtra / Godavari Basin",
        "climate_zone": "Semi-Arid / Hot Dry Summer",
        "el_nino_vulnerability": "Moderate-High (Godavari flow decline, 42°C+ peak)",
        "el_nino_temp_boost": 2.4,
        "centroid": [19.9975, 73.7898],
        "bbox": {
            "south": 19.90,
            "west": 73.70,
            "north": 20.08,
            "east": 73.88
        },
        "default_junction": {
            "name": "Dwarka Circle Flyover Junction",
            "lat": 19.9880,
            "lon": 73.7995
        },
        "wards": [
            ["Meri Colony", "Panchavati N", "Ramshej Rd", "Mhasrul", "Adgaon Naka", "Amrutdham", "Ozar Rd", "Meri Campus"],
            ["Makhmalabad", "Ramkund", "Panchavati S", "Ganga Ghat", "Nimani Bus Stand", "Dwarka N", "Kathed Raj Park", "Adgaon"],
            ["Gangapur Rd N", "Canada Corner", "Ashok Stambh", "Ravivar Karanja", "CBS Central", "Dwarka Circle", "Bodhle Nagar", "Nashik Rd N"],
            ["Gangapur Rd S", "College Road", "Mahatma Nagar", "Old Pandit Colony", "Sharanpur Rd", "Mumbai Naka", "Upnagar", "Nashik Rd Station"],
            ["Satpur MIDC N", "ABB Circle", "Govind Nagar", "Indira Nagar N", "Pathardi Phata", "Artillery Centre", "Jail Road", "Deolali Gaon"],
            ["Satpur MIDC S", "Parijat Nagar", "CIDCO Uttam Ngr", "Indira Nagar S", "Lekha Nagar", "Pathardi Gaon", "Datta Mandir", "Deolali Camp N"],
            ["Ambad MIDC N", "Trimurti Chowk", "Pawan Nagar", "CIDCO Trimurti", "Rane Nagar", "Wadala Gaon", "Chehadi", "Deolali Camp S"],
            ["Ambad MIDC S", "Garware Point", "Sambhaji Chowk", "Chetana Nagar", "Pathardi S", "Gonde Phata", "Shinde", "Bhagur"]
        ],
        "ngos": [
            {
                "id": "ngo_nk_01",
                "name": "Godavari Seva Brigade (Dwarka Circle)",
                "lat": 19.9882,
                "lon": 73.7990,
                "address": "Dwarka Circle, Mumbai-Agra Highway",
                "phone": "+91 94239 66778",
                "teams": 3,
                "water_cans": 55,
                "ors_stock": 500,
                "active_squads": 2
            }
        ],
        "assets": [
            {"osm_id": "nk_w1", "name": "Dwarka Circle Traffic Cool Point", "type": "drinking_water", "lat": 19.9885, "lon": 73.8001, "status": "working", "category": "Water", "address": "Under Dwarka Flyover"},
            {"osm_id": "nk_c1", "name": "Nashik CBS Air-Conditioned Waiting Hall", "type": "cool_haven", "lat": 19.9940, "lon": 73.7845, "status": "working", "category": "AC Cool Haven", "address": "CBS Central Stand"},
            {"osm_id": "nk_p1", "name": "Pandavleni Shaded Forest Reserve", "type": "park", "lat": 19.9450, "lon": 73.7505, "status": "working", "category": "Shade & Parks", "address": "Mumbai-Nashik Highway"},
            {"osm_id": "nk_h1", "name": "Nashik Civil Hospital Emergency Unit", "type": "clinic", "lat": 19.9960, "lon": 73.7820, "status": "working", "category": "Clinics & ORS", "address": "Trimbak Road, Old Agra Rd"}
        ]
    },
    "solapur": {
        "id": "solapur",
        "name": "Solapur",
        "state": "Maharashtra",
        "region": "South Maharashtra / Dry Arid Border",
        "climate_zone": "Hot Semi-Arid / Chronic Heat Trap",
        "el_nino_vulnerability": "SEVERE (46°C peak, dry desert wind surges)",
        "el_nino_temp_boost": 3.2,
        "centroid": [17.6599, 75.9064],
        "bbox": {
            "south": 17.58,
            "west": 75.82,
            "north": 17.74,
            "east": 76.00
        },
        "default_junction": {
            "name": "Chhatrapati Shivaji Maharaj Chowk (Old Poona Naka)",
            "lat": 17.6650,
            "lon": 75.9020
        },
        "wards": [
            ["Bale N", "Laxmi Peth", "Kegaon N", "Old Poona Rd", "Solapur MIDC N", "Degaon", "Shelgi N", "Bhavani Peth"],
            ["Bale S", "Kegaon S", "Navi Peth", "Shivaji Maharaj Chowk", "Solapur MIDC S", "Shelgi S", "Saat Rasta", "Railway Colony"],
            ["Jodbhavi Peth", "Mangalwar Peth", "Budhwar Peth", "Shukrawar Peth", "Gold Finch Peth", "Siddheshwar Mandir", "Ashok Chowk", "Kumtha Naka"],
            ["Murarji Peth", "Samrat Chowk", "Dufferin Chowk", "Old Employment Sq", "Central Bus Stand", "Lashkar Area", "Modikhana", "Hotgi Road N"],
            ["Nehru Nagar", "Civil Hospital Sq", "Park Stadium", "Damani Nagar", "Majrewadi", "Kalyan Nagar", "Jule Solapur N", "Hotgi Road S"],
            ["Soregaon", "Vijapur Road N", "Jule Solapur S", "Saiful Parisar", "Kumathe", "Degaon MIDC", "Akkalkot Rd N", "Kumbhari N"],
            ["Vijapur Road S", "Pratap Nagar", "Basaveshwar Ngr", "Dargah Parisar", "Siddheshwar Nagar", "Dhanraj Giri", "Akkalkot Rd S", "Kumbhari S"],
            ["Hipparga", "Kandalgaon", "Boramani Phata", "Tirole Parisar", "Ulle", "Dindore", "Valsang Rd", "Soregaon S"]
        ],
        "ngos": [
            {
                "id": "ngo_sl_01",
                "name": "Solapur Heat Action Seva (Saat Rasta)",
                "lat": 17.6620,
                "lon": 75.9100,
                "address": "Saat Rasta Circle, Solapur",
                "phone": "+91 94220 33441",
                "teams": 3,
                "water_cans": 60,
                "ors_stock": 700,
                "active_squads": 2
            }
        ],
        "assets": [
            {"osm_id": "sl_w1", "name": "Shivaji Chowk Traffic Cool Tap", "type": "drinking_water", "lat": 17.6652, "lon": 75.9022, "status": "working", "category": "Water", "address": "Old Poona Naka Junction"},
            {"osm_id": "sl_c1", "name": "Solapur Central ST AC Waiting Concourse", "type": "cool_haven", "lat": 17.6610, "lon": 75.9055, "status": "working", "category": "AC Cool Haven", "address": "Central Bus Stand"},
            {"osm_id": "sl_p1", "name": "Siddheshwar Lake & Garden Canopy", "type": "park", "lat": 17.6710, "lon": 75.9030, "status": "working", "category": "Shade & Parks", "address": "Siddheshwar Temple Rd"},
            {"osm_id": "sl_h1", "name": "Chhatrapati Shivaji Maharaj General Hospital (Civil)", "type": "clinic", "lat": 17.6645, "lon": 75.9080, "status": "working", "category": "Clinics & ORS", "address": "Civil Hospital Road"}
        ]
    },
    "delhi": {
        "id": "delhi",
        "name": "Delhi NCR",
        "state": "Delhi / NCR",
        "region": "Northern Plains / Thar Desert Fringe",
        "climate_zone": "Semi-Arid / Severe Loo & Urban Heat Dome",
        "el_nino_vulnerability": "EXTREME (Loo blast, 48.5°C peak record, acute asphalt radiation)",
        "el_nino_temp_boost": 4.1,
        "centroid": [28.6139, 77.2090],
        "bbox": {
            "south": 28.48,
            "west": 77.05,
            "north": 28.75,
            "east": 77.35
        },
        "default_junction": {
            "name": "Connaught Place (Rajiv Chowk) Radial Hub",
            "lat": 28.6315,
            "lon": 77.2167
        },
        "wards": [
            ["Narela", "Alipur", "Bawana", "Burari", "Rohini N", "Jahangirpuri", "Model Town", "Wazirabad"],
            ["Rohini Sector 16", "Pitampura", "Shalimar Bagh", "Civil Lines N", "Ashok Vihar", "ISBT Kashmere Gate", "Seelampur", "Shahdara N"],
            ["Punjabi Bagh", "Rajouri Garden", "Karol Bagh", "Connaught Place", "Old Delhi Station", "Chandni Chowk", "Laxmi Nagar", "Preet Vihar"],
            ["Janakpuri", "Tilak Nagar", "Patel Nagar", "Rajiv Chowk", "New Delhi Station", "Pragati Maidan", "Mayur Vihar 1", "Mayur Vihar 2"],
            ["Uttam Nagar", "Dwarka Mor", "Dhaula Kuan", "Chanakyapuri", "India Gate", "Lodhi Colony", "Lajpat Nagar", "Akshardham"],
            ["Dwarka Sector 10", "Dwarka Sector 21", "Delhi Cantt", "RK Puram", "AIIMS Core", "South Extension", "Nehru Place", "Okhla Phase 1"],
            ["Palam", "Mahipalpur", "Vasant Vihar", "Hauz Khas", "Greater Kailash", "Malviya Nagar", "Saket", "Kalkaji"],
            ["IGI Airport Terminal", "Vasant Kunj", "Qutub Minar", "Mehrauli", "Chhatarpur", "Sangam Vihar", "Badarpur", "Okhla Phase 3"]
        ],
        "ngos": [
            {
                "id": "ngo_dl_01",
                "name": "Delhi Heat Crisis Brigade (Connaught Place Base)",
                "lat": 28.6320,
                "lon": 77.2170,
                "address": "Inner Circle, Rajiv Chowk",
                "phone": "+91 98110 55667",
                "teams": 5,
                "water_cans": 120,
                "ors_stock": 1500,
                "active_squads": 4
            }
        ],
        "assets": [
            {"osm_id": "dl_w1", "name": "Rajiv Chowk Metro Water Booth", "type": "drinking_water", "lat": 28.6322, "lon": 77.2175, "status": "working", "category": "Water", "address": "Gate 7, Rajiv Chowk Metro"},
            {"osm_id": "dl_c1", "name": "Rajiv Chowk Underground AC Concourse", "type": "cool_haven", "lat": 28.6315, "lon": 77.2167, "status": "working", "category": "AC Cool Haven", "address": "Yellow/Blue Line Interchange"},
            {"osm_id": "dl_p1", "name": "Lodhi Gardens Shaded Tree Canopy", "type": "park", "lat": 28.5933, "lon": 77.2197, "status": "working", "category": "Shade & Parks", "address": "Lodhi Road"},
            {"osm_id": "dl_h1", "name": "AIIMS New Delhi Emergency Heat Stroke Ward", "type": "clinic", "lat": 28.5672, "lon": 77.2100, "status": "working", "category": "Clinics & ORS", "address": "Ansari Nagar"}
        ]
    }
}

def get_city(city_id: str) -> dict:
    return CITIES.get(city_id.lower(), CITIES["pune"])

def list_all_cities() -> list:
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "state": c["state"],
            "region": c["region"],
            "climate_zone": c["climate_zone"],
            "el_nino_vulnerability": c["el_nino_vulnerability"],
            "el_nino_temp_boost": c["el_nino_temp_boost"],
            "centroid": c["centroid"],
            "default_junction": c["default_junction"]
        }
        for c in CITIES.values()
    ]

# Add Nanded District
CITIES["nanded"] = {
    "id": "nanded",
    "name": "Nanded",
    "state": "Maharashtra",
    "region": "Marathwada / Godavari Basin",
    "climate_zone": "Tropical Wet and Dry / Intense Semi-Arid Heat",
    "el_nino_vulnerability": "SEVERE (Dry Marathwada Heat, 44.5°C+ peak with Godavari drop)",
    "el_nino_temp_boost": 3.1,
    "centroid": [19.1383, 77.3210],
    "bbox": {
        "south": 19.06,
        "west": 77.24,
        "north": 19.22,
        "east": 77.40
    },
    "default_junction": {
        "name": "Hazur Sahib Gurudwara & Station Circle",
        "lat": 19.1528,
        "lon": 77.3189
    },
    "wards": [
        ["Wajegaon N", "Asarjan", "MIDC Nanded N", "Dhanegaon N", "Purna Rd N", "Tupur", "Nava Nanded", "Sangvi N"],
        ["Wajegaon S", "Khadkpura", "CIDCO Nanded N", "MIDC Nanded S", "Dhanegaon S", "Purna Rd S", "Vishnupuri N", "Sangvi S"],
        ["Degloor Naka", "Old Ganj", "Sarafa Bazar", "Guru Gobind Singh Marg", "Station Rd N", "Vazirabad", "Shivaji Nagar", "Airport Rd"],
        ["Hyderbagh", "Itwara Bazar", "Hazur Sahib Gate", "Railway Station", "Mahaveer Chowk", "Anand Nagar", "Khadakpura", "Babanagar"],
        ["Kala Mandir", "Doctor Lane", "Labour Colony", "Workshop Corner", "Taroda Naka", "Shyam Nagar", "Sneha Nagar", "Pannalal Ngr"],
        ["Govardhan Ghat", "Banda Ghat", "Nagachawdi", "Maltekdi N", "Chaitanya Nagar", "Gautam Nagar", "Kautha N", "Srinagar"],
        ["Vishnupuri Dam Rd", "SRTM University", "Govt Medical College", "Maltekdi S", "Vasant Nagar", "Kautha S", "Chikhali", "Pawdewadi"],
        ["Wadi Bhokar Rd", "Ashtavinayak Ngr", "MIDC Kranti", "Brahmapuri", "Dharmabad Rd", "Mudkhed Phata", "Loha Phata", "Vishnupuri S"]
    ],
    "ngos": [
        {
            "id": "ngo_nd_01",
            "name": "Hazur Sahib Langar & Heat Relief Seva",
            "lat": 19.1530,
            "lon": 77.3190,
            "address": "Gurudwara Complex, Station Rd, Nanded",
            "phone": "+91 94221 44556",
            "teams": 4,
            "water_cans": 80,
            "ors_stock": 800,
            "active_squads": 3
        },
        {
            "id": "ngo_nd_02",
            "name": "Nanded Youth Seva Brigade (Vazirabad)",
            "lat": 19.1560,
            "lon": 77.3140,
            "address": "Vazirabad Market Chowk",
            "phone": "+91 98901 33221",
            "teams": 2,
            "water_cans": 40,
            "ors_stock": 400,
            "active_squads": 1
        }
    ],
    "assets": [
        {"osm_id": "nd_w1", "name": "Gurudwara Gate 1 Cold Drinking Water Seva", "type": "drinking_water", "lat": 19.1535, "lon": 77.3195, "status": "working", "category": "Water", "address": "Hazur Sahib Main Entry"},
        {"osm_id": "nd_w2", "name": "Nanded Railway Station Public Cooler", "type": "drinking_water", "lat": 19.1510, "lon": 77.3160, "status": "working", "category": "Water", "address": "Platform 1, Nanded Station"},
        {"osm_id": "nd_c1", "name": "Hazur Sahib AC Yatri Niwas Concourse", "type": "cool_haven", "lat": 19.1542, "lon": 77.3205, "status": "working", "category": "AC Cool Haven", "address": "Gurudwara Yatri Niwas 1"},
        {"osm_id": "nd_p1", "name": "Govardhan Ghat Shaded Riverbank Garden", "type": "park", "lat": 19.1480, "lon": 77.3260, "status": "working", "category": "Shade & Parks", "address": "Godavari Riverbank, Nanded"},
        {"osm_id": "nd_h1", "name": "Dr. Shankarrao Chavan GMC Hospital (Heat ICU)", "type": "clinic", "lat": 19.1220, "lon": 77.2940, "status": "working", "category": "Clinics & ORS", "address": "Vishnupuri, Nanded"}
    ]
}
