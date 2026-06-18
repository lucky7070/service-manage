import { ServiceCategory } from "../models/index.js";

export const SEED_CATEGORIES = [
    {
        slug: "air-conditioner-repair",
        name: "Air Conditioner Repair",
        nameHi: "एयर कंडीशनर मरम्मत",
        displayOrder: 1,
        image: "/service-categories/air-conditioner-repair.png",
        description: "AC installation, repair, maintenance and troubleshooting services",
        services: [
            {
                name: "Air Conditioner Installation",
                nameHi: "एसी इंस्टॉलेशन",
                estimatedTimeMinutes: 90,
                basePrice: 1499,
                displayOrder: 1,
                image: "",
                description: "Split or window AC installation service."
            },
            {
                name: "AC Uninstallation",
                nameHi: "एसी अनइंस्टॉलेशन",
                estimatedTimeMinutes: 60,
                basePrice: 799,
                displayOrder: 2,
                image: "",
                description: "Safe removal of existing AC unit."
            },
            {
                name: "AC General Service",
                nameHi: "एसी सामान्य सर्विस",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 3,
                image: "",
                description: "Routine AC cleaning and maintenance."
            },
            {
                name: "AC Deep Cleaning",
                nameHi: "एसी डीप क्लीनिंग",
                estimatedTimeMinutes: 120,
                basePrice: 1499,
                displayOrder: 4,
                image: "",
                description: "Complete indoor and outdoor unit cleaning."
            },
            {
                name: "AC Jet Wash Service",
                nameHi: "एसी जेट वॉश सर्विस",
                estimatedTimeMinutes: 120,
                basePrice: 1799,
                displayOrder: 5,
                image: "",
                description: "High-pressure jet cleaning for AC units."
            },
            {
                name: "AC Gas Refilling",
                nameHi: "एसी गैस रिफिलिंग",
                estimatedTimeMinutes: 120,
                basePrice: 2499,
                displayOrder: 6,
                image: "",
                description: "AC refrigerant gas refill service."
            },
            {
                name: "AC Cooling Issue Repair",
                nameHi: "एसी कूलिंग समस्या मरम्मत",
                estimatedTimeMinutes: 90,
                basePrice: 699,
                displayOrder: 7,
                image: "",
                description: "Diagnosis and repair of cooling issues."
            },
            {
                name: "AC Water Leakage Repair",
                nameHi: "एसी पानी रिसाव मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 8,
                image: "",
                description: "Fix indoor or outdoor water leakage problems."
            },
            {
                name: "AC Noise Issue Repair",
                nameHi: "एसी शोर समस्या मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 9,
                image: "",
                description: "Repair unusual AC noises and vibrations."
            },
            {
                name: "AC Fan Motor Repair",
                nameHi: "एसी फैन मोटर मरम्मत",
                estimatedTimeMinutes: 90,
                basePrice: 999,
                displayOrder: 10,
                image: "",
                description: "Repair or servicing of AC fan motor."
            },
            {
                name: "AC Capacitor Replacement",
                nameHi: "एसी कैपेसिटर बदलना",
                estimatedTimeMinutes: 45,
                basePrice: 699,
                displayOrder: 11,
                image: "",
                description: "Replace faulty AC capacitor."
            },
            {
                name: "AC Compressor Checkup",
                nameHi: "एसी कंप्रेसर जांच",
                estimatedTimeMinutes: 60,
                basePrice: 799,
                displayOrder: 12,
                image: "",
                description: "Inspection and diagnosis of AC compressor."
            },
            {
                name: "AC Compressor Replacement",
                nameHi: "एसी कंप्रेसर बदलना",
                estimatedTimeMinutes: 180,
                basePrice: 3499,
                displayOrder: 13,
                image: "",
                description: "Replacement of damaged AC compressor."
            },
            {
                name: "AC PCB Repair",
                nameHi: "एसी पीसीबी मरम्मत",
                estimatedTimeMinutes: 120,
                basePrice: 1499,
                displayOrder: 14,
                image: "",
                description: "Repair AC control PCB board."
            },
            {
                name: "AC Remote Repair",
                nameHi: "एसी रिमोट मरम्मत",
                estimatedTimeMinutes: 30,
                basePrice: 299,
                displayOrder: 15,
                image: "",
                description: "AC remote diagnosis and repair."
            },
            {
                name: "AC Drain Pipe Cleaning",
                nameHi: "एसी ड्रेन पाइप सफाई",
                estimatedTimeMinutes: 45,
                basePrice: 399,
                displayOrder: 16,
                image: "",
                description: "Cleaning blocked AC drainage pipe."
            },
            {
                name: "AC Copper Pipe Extension",
                nameHi: "एसी कॉपर पाइप एक्सटेंशन",
                estimatedTimeMinutes: 90,
                basePrice: 1299,
                displayOrder: 17,
                image: "",
                description: "Copper pipe extension and fitting."
            },
            {
                name: "AC Stabilizer Installation",
                nameHi: "एसी स्टेबलाइजर इंस्टॉलेशन",
                estimatedTimeMinutes: 30,
                basePrice: 399,
                displayOrder: 18,
                image: "",
                description: "Installation of AC stabilizer."
            },
            {
                name: "AC Annual Maintenance",
                nameHi: "एसी वार्षिक रखरखाव",
                estimatedTimeMinutes: 90,
                basePrice: 1999,
                displayOrder: 19,
                image: "",
                description: "Yearly preventive maintenance package."
            },
            {
                name: "AC Inspection Visit",
                nameHi: "एसी निरीक्षण विजिट",
                estimatedTimeMinutes: 30,
                basePrice: 299,
                displayOrder: 20,
                image: "",
                description: "Professional AC inspection and diagnosis."
            }
        ]
    },
    {
        slug: "electrician",
        name: "Electrician",
        nameHi: "इलेक्ट्रीशियन",
        displayOrder: 2,
        image: "/service-categories/electrician.png",
        description: "Electrical installation, repair and maintenance services",
        services: [
            {
                name: "Switch Board Repair",
                nameHi: "स्विच बोर्ड मरम्मत",
                estimatedTimeMinutes: 30,
                basePrice: 249,
                displayOrder: 1,
                image: "",
                description: "Repair faulty switch boards and electrical panels."
            },
            {
                name: "Switch Replacement",
                nameHi: "स्विच बदलना",
                estimatedTimeMinutes: 20,
                basePrice: 149,
                displayOrder: 2,
                image: "",
                description: "Replacement of damaged electrical switches."
            },
            {
                name: "Socket Replacement",
                nameHi: "सॉकेट बदलना",
                estimatedTimeMinutes: 20,
                basePrice: 149,
                displayOrder: 3,
                image: "",
                description: "Replace damaged power sockets."
            },
            {
                name: "Fan Installation",
                nameHi: "पंखा इंस्टॉलेशन",
                estimatedTimeMinutes: 45,
                basePrice: 349,
                displayOrder: 4,
                image: "",
                description: "Ceiling fan installation service."
            },
            {
                name: "Fan Repair",
                nameHi: "पंखा मरम्मत",
                estimatedTimeMinutes: 45,
                basePrice: 299,
                displayOrder: 5,
                image: "",
                description: "Repair noisy or non-working ceiling fans."
            },
            {
                name: "Fan Regulator Repair",
                nameHi: "पंखा रेगुलेटर मरम्मत",
                estimatedTimeMinutes: 20,
                basePrice: 199,
                displayOrder: 6,
                image: "",
                description: "Repair or replace fan regulator."
            },
            {
                name: "Tube Light Installation",
                nameHi: "ट्यूबलाइट इंस्टॉलेशन",
                estimatedTimeMinutes: 20,
                basePrice: 199,
                displayOrder: 7,
                image: "",
                description: "Install tube lights and fittings."
            },
            {
                name: "LED Light Installation",
                nameHi: "एलईडी लाइट इंस्टॉलेशन",
                estimatedTimeMinutes: 20,
                basePrice: 199,
                displayOrder: 8,
                image: "",
                description: "Install LED lights and fixtures."
            },
            {
                name: "Chandelier Installation",
                nameHi: "झूमर इंस्टॉलेशन",
                estimatedTimeMinutes: 90,
                basePrice: 999,
                displayOrder: 9,
                image: "",
                description: "Professional chandelier installation."
            },
            {
                name: "MCB Replacement",
                nameHi: "एमसीबी बदलना",
                estimatedTimeMinutes: 30,
                basePrice: 399,
                displayOrder: 10,
                image: "",
                description: "Replace damaged MCB units."
            },
            {
                name: "Distribution Board Repair",
                nameHi: "डिस्ट्रिब्यूशन बोर्ड मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 799,
                displayOrder: 11,
                image: "",
                description: "Repair electrical distribution boards."
            },
            {
                name: "Door Bell Installation",
                nameHi: "डोर बेल इंस्टॉलेशन",
                estimatedTimeMinutes: 30,
                basePrice: 249,
                displayOrder: 12,
                image: "",
                description: "Install wired or wireless doorbells."
            },
            {
                name: "Inverter Installation",
                nameHi: "इन्वर्टर इंस्टॉलेशन",
                estimatedTimeMinutes: 90,
                basePrice: 899,
                displayOrder: 13,
                image: "",
                description: "Home inverter installation service."
            },
            {
                name: "Inverter Repair",
                nameHi: "इन्वर्टर मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 699,
                displayOrder: 14,
                image: "",
                description: "Diagnosis and repair of inverter systems."
            },
            {
                name: "Wiring Repair",
                nameHi: "वायरिंग मरम्मत",
                estimatedTimeMinutes: 90,
                basePrice: 699,
                displayOrder: 15,
                image: "",
                description: "Repair damaged electrical wiring."
            },
            {
                name: "New House Wiring",
                nameHi: "नए घर की वायरिंग",
                estimatedTimeMinutes: 240,
                basePrice: 2999,
                displayOrder: 16,
                image: "",
                description: "Complete house electrical wiring work."
            },
            {
                name: "Short Circuit Repair",
                nameHi: "शॉर्ट सर्किट मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 17,
                image: "",
                description: "Troubleshoot and repair short circuits."
            },
            {
                name: "Geyser Installation",
                nameHi: "गीजर इंस्टॉलेशन",
                estimatedTimeMinutes: 45,
                basePrice: 499,
                displayOrder: 18,
                image: "",
                description: "Electric geyser installation service."
            },
            {
                name: "Electrical Inspection Visit",
                nameHi: "विद्युत निरीक्षण विजिट",
                estimatedTimeMinutes: 30,
                basePrice: 299,
                displayOrder: 19,
                image: "",
                description: "Electrical safety inspection and diagnosis."
            }
        ]
    },
    {
        slug: "plumber",
        name: "Plumber",
        nameHi: "प्लम्बर",
        displayOrder: 3,
        image: "/service-categories/plumber.png",
        description: "Plumbing installation, repair and maintenance services",
        services: [
            {
                name: "Tap Repair",
                nameHi: "नल मरम्मत",
                estimatedTimeMinutes: 30,
                basePrice: 249,
                displayOrder: 1,
                image: "",
                description: "Repair leaking or damaged taps."
            },
            {
                name: "Pipe Leakage Repair",
                nameHi: "पाइप रिसाव मरम्मत",
                estimatedTimeMinutes: 45,
                basePrice: 399,
                displayOrder: 2,
                image: "",
                description: "Repair leaking water supply pipes."
            },
            {
                name: "Wash Basin Installation",
                nameHi: "वॉश बेसिन इंस्टॉलेशन",
                estimatedTimeMinutes: 60,
                basePrice: 699,
                displayOrder: 3,
                image: "",
                description: "Install new wash basin and fittings."
            },
            {
                name: "Toilet Seat Installation",
                nameHi: "टॉयलेट सीट इंस्टॉलेशन",
                estimatedTimeMinutes: 60,
                basePrice: 799,
                displayOrder: 4,
                image: "",
                description: "Western toilet seat installation service."
            }
        ]
    },
    {
        slug: "cleaning-and-pest-control",
        name: "Cleaning and Pest Control",
        nameHi: "सफाई एवं पेस्ट कंट्रोल",
        displayOrder: 4,
        image: "/service-categories/cleaning-and-pest-control.png",
        description: "Cleaning, sanitation and pest control services",
        services: [
            {
                name: "Water Tank Cleaning",
                nameHi: "पानी की टंकी सफाई",
                estimatedTimeMinutes: 120,
                basePrice: 1499,
                displayOrder: 1,
                image: "",
                description: "Cleaning and disinfecting overhead water tanks."
            },
            {
                name: "Underground Tank Cleaning",
                nameHi: "भूमिगत टंकी सफाई",
                estimatedTimeMinutes: 180,
                basePrice: 2499,
                displayOrder: 2,
                image: "",
                description: "Cleaning underground water storage tanks."
            },
            {
                name: "Septic Tank Cleaning",
                nameHi: "सेप्टिक टैंक सफाई",
                estimatedTimeMinutes: 240,
                basePrice: 3999,
                displayOrder: 3,
                image: "",
                description: "Professional septic tank cleaning service."
            },
            {
                name: "Borewell Cleaning",
                nameHi: "बोरवेल सफाई",
                estimatedTimeMinutes: 240,
                basePrice: 4999,
                displayOrder: 4,
                image: "",
                description: "Cleaning and maintenance of borewell systems."
            },
            {
                name: "Drain Cleaning",
                nameHi: "नाली सफाई",
                estimatedTimeMinutes: 60,
                basePrice: 699,
                displayOrder: 5,
                image: "",
                description: "Removal of drain blockages and debris."
            },
            {
                name: "Sewer Line Cleaning",
                nameHi: "सीवर लाइन सफाई",
                estimatedTimeMinutes: 120,
                basePrice: 1999,
                displayOrder: 6,
                image: "",
                description: "Cleaning clogged sewer pipelines."
            },
            {
                name: "General Pest Control",
                nameHi: "सामान्य पेस्ट कंट्रोल",
                estimatedTimeMinutes: 90,
                basePrice: 999,
                displayOrder: 7,
                image: "",
                description: "Treatment against common household pests."
            },
            {
                name: "Termite Control",
                nameHi: "दीमक नियंत्रण",
                estimatedTimeMinutes: 180,
                basePrice: 3499,
                displayOrder: 8,
                image: "",
                description: "Anti-termite treatment for homes and offices."
            },
            {
                name: "Cockroach Control",
                nameHi: "कॉकरोच नियंत्रण",
                estimatedTimeMinutes: 90,
                basePrice: 1199,
                displayOrder: 9,
                image: "",
                description: "Cockroach elimination treatment."
            },
            {
                name: "Mosquito Control",
                nameHi: "मच्छर नियंत्रण",
                estimatedTimeMinutes: 90,
                basePrice: 1499,
                displayOrder: 10,
                image: "",
                description: "Mosquito treatment for residential premises."
            },
            {
                name: "House Deep Cleaning",
                nameHi: "घर की डीप क्लीनिंग",
                estimatedTimeMinutes: 360,
                basePrice: 4999,
                displayOrder: 11,
                image: "",
                description: "Complete deep cleaning of home interiors."
            },
            {
                name: "Office Deep Cleaning",
                nameHi: "ऑफिस डीप क्लीनिंग",
                estimatedTimeMinutes: 480,
                basePrice: 7999,
                displayOrder: 12,
                image: "",
                description: "Professional office deep cleaning service."
            }
        ]
    },
    {
        slug: "painting-service",
        name: "Painting Service",
        nameHi: "पेंटिंग सेवा",
        displayOrder: 5,
        image: "/service-categories/painting-service.png",
        description: "Interior, exterior and decorative painting services",
        services: [
            {
                name: "Interior Wall Painting",
                nameHi: "इंटीरियर दीवार पेंटिंग",
                estimatedTimeMinutes: 480,
                basePrice: 5999,
                displayOrder: 1,
                image: "",
                description: "Painting of interior walls and ceilings."
            },
            {
                name: "Exterior Wall Painting",
                nameHi: "बाहरी दीवार पेंटिंग",
                estimatedTimeMinutes: 720,
                basePrice: 8999,
                displayOrder: 2,
                image: "",
                description: "Weather-resistant exterior wall painting."
            },
            {
                name: "Texture Painting",
                nameHi: "टेक्सचर पेंटिंग",
                estimatedTimeMinutes: 360,
                basePrice: 6999,
                displayOrder: 3,
                image: "",
                description: "Decorative texture finish for walls."
            },
            {
                name: "Waterproofing Service",
                nameHi: "वॉटरप्रूफिंग सेवा",
                estimatedTimeMinutes: 480,
                basePrice: 7999,
                displayOrder: 4,
                image: "",
                description: "Roof and wall waterproofing treatment."
            }
        ]
    },
    {
        slug: "carpenter-service",
        name: "Carpenter Service",
        nameHi: "बढ़ई सेवा",
        displayOrder: 6,
        image: "/service-categories/carpenter-service.png",
        description: "Furniture assembly, repair and woodwork services",
        services: [
            {
                name: "Furniture Repair",
                nameHi: "फर्नीचर मरम्मत",
                estimatedTimeMinutes: 90,
                basePrice: 599,
                displayOrder: 1,
                image: "",
                description: "Repair damaged wooden furniture."
            },
            {
                name: "Door Repair",
                nameHi: "दरवाजा मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 499,
                displayOrder: 2,
                image: "",
                description: "Repair wooden doors and fittings."
            },
            {
                name: "Window Repair",
                nameHi: "खिड़की मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 499,
                displayOrder: 3,
                image: "",
                description: "Repair wooden or aluminum windows."
            },
            {
                name: "Modular Kitchen Repair",
                nameHi: "मॉड्यूलर किचन मरम्मत",
                estimatedTimeMinutes: 120,
                basePrice: 1499,
                displayOrder: 4,
                image: "",
                description: "Repair modular kitchen cabinets and fittings."
            },
            {
                name: "Bed Repair",
                nameHi: "बेड मरम्मत",
                estimatedTimeMinutes: 90,
                basePrice: 699,
                displayOrder: 5,
                image: "",
                description: "Repair wooden and metal beds."
            },
            {
                name: "Sofa Repair",
                nameHi: "सोफा मरम्मत",
                estimatedTimeMinutes: 120,
                basePrice: 999,
                displayOrder: 6,
                image: "",
                description: "Repair damaged sofa frame and fittings."
            }
        ]
    },
    {
        slug: "refrigerator-repair",
        name: "Refrigerator Repair",
        nameHi: "रेफ्रिजरेटर मरम्मत",
        displayOrder: 7,
        image: "/service-categories/refrigerator-repair.png",
        description: "Refrigerator inspection, maintenance and repair services",
        services: [
            {
                name: "Cooling Check",
                nameHi: "कूलिंग जांच",
                estimatedTimeMinutes: 30,
                basePrice: 299,
                displayOrder: 1,
                image: "",
                description: "Inspection of refrigerator cooling performance."
            },
            {
                name: "Gas Filling",
                nameHi: "गैस भरना",
                estimatedTimeMinutes: 90,
                basePrice: 1999,
                displayOrder: 2,
                image: "",
                description: "Refrigerant gas refill service."
            },
            {
                name: "Compressor Check",
                nameHi: "कंप्रेसर जांच",
                estimatedTimeMinutes: 45,
                basePrice: 399,
                displayOrder: 3,
                image: "",
                description: "Inspection of refrigerator compressor."
            },
            {
                name: "Compressor Replacement",
                nameHi: "कंप्रेसर बदलना",
                estimatedTimeMinutes: 180,
                basePrice: 3999,
                displayOrder: 4,
                image: "",
                description: "Replacement of faulty refrigerator compressor."
            },
            {
                name: "Thermostat Repair",
                nameHi: "थर्मोस्टेट मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 699,
                displayOrder: 5,
                image: "",
                description: "Repair or replacement of thermostat."
            },
            {
                name: "Condenser Coil Cleaning",
                nameHi: "कंडेंसर कॉइल सफाई",
                estimatedTimeMinutes: 45,
                basePrice: 499,
                displayOrder: 6,
                image: "",
                description: "Cleaning condenser coils for better cooling."
            },
            {
                name: "Door Gasket Replacement",
                nameHi: "डोर गैस्केट बदलना",
                estimatedTimeMinutes: 45,
                basePrice: 799,
                displayOrder: 7,
                image: "",
                description: "Replace damaged refrigerator door rubber."
            },
            {
                name: "Fan Motor Repair",
                nameHi: "फैन मोटर मरम्मत",
                estimatedTimeMinutes: 60,
                basePrice: 899,
                displayOrder: 8,
                image: "",
                description: "Repair refrigerator fan motor."
            },
            {
                name: "Defrost System Repair",
                nameHi: "डीफ्रॉस्ट सिस्टम मरम्मत",
                estimatedTimeMinutes: 90,
                basePrice: 1199,
                displayOrder: 9,
                image: "",
                description: "Repair automatic defrost system."
            },
            {
                name: "General Refrigerator Service",
                nameHi: "सामान्य रेफ्रिजरेटर सर्विस",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 10,
                image: "",
                description: "Routine refrigerator maintenance and cleaning."
            }
        ]
    },
    {
        slug: "ro-water-purifier",
        name: "RO Water Purifier Service",
        nameHi: "आरओ जल शोधक सेवा",
        displayOrder: 8,
        image: "/service-categories/ro-water-purifier.png",
        description: "Water Purifier installation, repair and maintenance services",
        services: [
            {
                name: "RO Water Purifier Service",
                nameHi: "RO जल प्रशीपर सेवा",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 1,
                image: "",
                description: "Installation, repair and maintenance of RO water purifier."
            }
        ]
    },
    {
        slug: "equipment-rental",
        name: "Equipment Rental Services",
        nameHi: "सामान्य उपकरण किराया",
        displayOrder: 9,
        image: "/service-categories/equipment-rental.png",
        description: "Equipment rental services",
        services: [
            {
                name: "Generator on Rent",
                nameHi: "जनरेटर किराये पर",
                estimatedTimeMinutes: 60,
                basePrice: 2500,
                displayOrder: 1,
                image: "",
                description: "Rental of generator."
            },
            {
                name: "Chair Table Rent",
                nameHi: "चेयर टेबल किराया",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 2,
                image: "",
                description: "Rental of chair and table."
            },
            {
                name: "Cooler on Rent",
                nameHi: "कूलर किराया",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 3,
                image: "",
                description: "Rental of cooler."
            },
            {
                name: "AC on Rent",
                nameHi: "एसी किराया",
                estimatedTimeMinutes: 60,
                basePrice: 599,
                displayOrder: 4,
                image: "",
                description: "Rental of AC."
            },
            {
                name: "Sound System Rent",
                nameHi: "साउंड सिस्टम किराये पर",
                estimatedTimeMinutes: 60,
                basePrice: 2500,
                displayOrder: 6,
                image: "",
                description: "Rental of sound system."
            },
            {
                name: "Projector Rent",
                nameHi: "प्रोजेक्टर किराया",
                estimatedTimeMinutes: 60,
                basePrice: 1500,
                displayOrder: 5,
                image: "",
                description: "Rental of projector."
            },
            {
                name: "LED Wall Rent",
                nameHi: "एलईडी वॉल किराये पर",
                estimatedTimeMinutes: 60,
                basePrice: 5000,
                displayOrder: 7,
                image: "",
                description: "Rental of LED wall."
            },
            {
                name: "JCB Rental",
                nameHi: "JCB किराया",
                estimatedTimeMinutes: 60,
                basePrice: 1800,
                displayOrder: 8,
                image: "",
                description: "Rental of JCB."
            },
            {
                name: "Crane Service",
                nameHi: "क्रेन किराया",
                estimatedTimeMinutes: 60,
                basePrice: 3500,
                displayOrder: 9,
                image: "",
                description: "Service of crane."
            }
        ]
    },
    {
        slug: "event-management",
        name: "Event Management",
        nameHi: "इवेंट मैनेजमेंट",
        displayOrder: 10,
        image: "/service-categories/event-management.png",
        description: "Event management services",
        services: [
            {
                name: "DJ Sound Service",
                nameHi: "DJ संगीत सेवा",
                estimatedTimeMinutes: 60,
                basePrice: 3000,
                displayOrder: 1,
                image: "",
                description: "DJ sound service for events."
            },
            {
                name: "Tent House Service",
                nameHi: "टेंट हाउस सेवा",
                estimatedTimeMinutes: 60,
                basePrice: 5000,
                displayOrder: 2,
                image: "",
                description: "Tent house service for events."
            },
            {
                name: "Wedding Decoration",
                nameHi: "विवाह सजावट",
                estimatedTimeMinutes: 60,
                basePrice: 15000,
                displayOrder: 3,
                image: "",
                description: "Wedding decoration service for events."
            },
            {
                name: "Birthday Decoration",
                nameHi: "जन्मदिन सजावट",
                estimatedTimeMinutes: 60,
                basePrice: 3000,
                displayOrder: 4,
                image: "",
                description: "Birthday decoration service for events."
            },
            {
                name: "Event Management",
                nameHi: "इवेंट मैनेजमेंट",
                estimatedTimeMinutes: 60,
                basePrice: 25000,
                displayOrder: 5,
                image: "",
                description: "Event management service for events."
            },
            {
                name: "Catering Service",
                nameHi: "कैटरिंग सेवा",
                estimatedTimeMinutes: 60,
                basePrice: 10000,
                displayOrder: 6,
                image: "",
                description: "Catering service for events."
            },
            {
                name: "Band Service",
                nameHi: "बैंड सेवा",
                estimatedTimeMinutes: 60,
                basePrice: 5000,
                displayOrder: 7,
                image: "",
                description: "Band service for events."
            },
            {
                name: "Dhol Service",
                nameHi: "धोल सेवा",
                estimatedTimeMinutes: 60,
                basePrice: 2500,
                displayOrder: 8,
                image: "",
                description: "Dhol service for events."
            },
            {
                name: "Light Decoration",
                nameHi: "लाइट डेकोरेशन",
                estimatedTimeMinutes: 60,
                basePrice: 5000,
                displayOrder: 9,
                image: "",
                description: "Light decoration service for events."
            },
            {
                name: "Flower Decoration",
                nameHi: "फूलों की सजावट",
                estimatedTimeMinutes: 60,
                basePrice: 2500,
                displayOrder: 10,
                image: "",
                description: "Flower decoration service for events."
            },
            {
                name: "Stage Setup",
                nameHi: "स्टेज सेटअप",
                estimatedTimeMinutes: 60,
                basePrice: 8000,
                displayOrder: 11,
                image: "",
                description: "Stage setup service for events."
            }
        ]
    },
];

/**
 * Seed Service Categories (idempotent upserts by slug).
 * @returns {Promise<{ count: number }>}
 */
export async function seedServiceCategories() {
    const ops = SEED_CATEGORIES.map((row) => ({
        updateOne: {
            filter: { slug: row.slug },
            update: {
                $set: {
                    slug: row.slug,
                    name: row.name,
                    nameHi: row.nameHi ?? null,
                    displayOrder: row.displayOrder ?? 0,
                    image: row.image?.trim() || null,
                    description: row.description?.trim() || null,
                    isActive: true,
                    deletedAt: null
                }
            },
            upsert: true
        }
    }));

    await ServiceCategory.bulkWrite(ops);
    const count = await ServiceCategory.countDocuments({ deletedAt: null });
    return { count };
}
