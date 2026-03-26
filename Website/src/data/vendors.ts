export interface VendorProduct {
  name: string;
  price: number;
  image: string;
  tag: string;
}

export interface VendorData {
  id: string;
  name: string;
  username: string;
  image: string;
  heroImage: string;
  bio: string;
  longBio: string;
  stats: { following: number; followers: number; posts: number };
  products: VendorProduct[];
}

export const vendors: VendorData[] = [
  {
    id: "organicroots",
    name: "Organic Roots",
    username: "organicroots_pb",
    image: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&q=80&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80&auto=format&fit=crop",
    bio: "Premium supplier of bio-fertilizers and organic compost based in Punjab. Ensuring healthy soil for generations.",
    longBio: "Organic Roots began with a simple mission: bringing sustainable soil health back to the heartland of India. We craft specialized bio-compost that restores essential microbes, boosting crop yields naturally without relying on harsh chemicals.",
    stats: { following: 120, followers: 8500, posts: 42 },
    products: [
      {
        name: "Bio-Active Compost 50kg",
        price: 1200,
        image: "https://images.unsplash.com/photo-1592982537447-6f296b0f0b4a?w=600&q=80&auto=format&fit=crop",
        tag: "Fertilizer"
      },
      {
        name: "Organic Potash Blend",
        price: 850,
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&q=80&auto=format&fit=crop",
        tag: "Supplement"
      }
    ]
  },
  {
    id: "aerotech",
    name: "AeroTech Drones",
    username: "aerotech_agri",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&q=80&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1473968512647-3e44a224fe8f?w=1200&q=80&auto=format&fit=crop",
    bio: "Specializing in high-precision agricultural drones for targeted spraying and crop monitoring.",
    longBio: "AeroTech bridges the gap between aerospace engineering and traditional farming. Our specialized drones enable hyper-targeted pesticide spraying and thermal field monitoring.",
    stats: { following: 45, followers: 12400, posts: 18 },
    products: [
      {
        name: "Sprayer Drone X1",
        price: 45000,
        image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&q=80&auto=format&fit=crop",
        tag: "Hardware"
      },
      {
        name: "Thermal Sensor Kit",
        price: 12000,
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&auto=format&fit=crop",
        tag: "Accessory"
      }
    ]
  },
  {
    id: "greenseed",
    name: "GreenSeed Co.",
    username: "greenseed_official",
    image: "https://images.unsplash.com/photo-1592997571659-0b21ff64313b?w=400&q=80&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1523348830155-911477755866?w=1200&q=80&auto=format&fit=crop",
    bio: "Certified high-yield, drought-resistant seeds tailored for unpredictable weather patterns.",
    longBio: "Founded by agronomists deeply concerned with climate change, GreenSeed Co. offers hybrid seeds that require less water and exhibit higher resilience to sudden temperature changes.",
    stats: { following: 320, followers: 45000, posts: 156 },
    products: [
      {
        name: "Drought-Resistant Wheat 10kg",
        price: 800,
        image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80&auto=format&fit=crop",
        tag: "Seeds"
      },
      {
        name: "Hybrid Corn Pack",
        price: 1100,
        image: "https://images.unsplash.com/photo-1551748629-bc730883398c?w=600&q=80&auto=format&fit=crop",
        tag: "Seeds"
      }
    ]
  },
  {
    id: "agritechdev",
    name: "AgriTech Solutions",
    username: "agritech_dev",
    image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&q=80&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80&auto=format&fit=crop",
    bio: "Pioneering smart agricultural development and sustainable farming hardware.",
    longBio: "AgriTech Solutions is the premier provider of smart farm implements. From automated irrigation valves driven by IoT sensors to advanced soil tracking telemetry devices.",
    stats: { following: 89, followers: 15200, posts: 24 },
    products: [
      {
        name: "Smart IoT Valve Controller",
        price: 8500,
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&auto=format&fit=crop",
        tag: "IoT"
      },
      {
        name: "Soil Moisture Sensor Pro",
        price: 3200,
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&auto=format&fit=crop",
        tag: "Sensors"
      }
    ]
  },
  {
    id: "sunlightfarms",
    name: "Sunlight Supply",
    username: "sunlight_greenhouse",
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=400&q=80&auto=format&fit=crop",
    heroImage: "https://images.unsplash.com/photo-1585314062340-f1a5acc7d921?w=1200&q=80&auto=format&fit=crop",
    bio: "Industrial-grade greenhouse materials and hydroponic growth solutions.",
    longBio: "Sunlight Supply enables year-round harvesting regardless of external weather conditions. We supply UV-resistant greenhouse film, structural poly-tunnels, and modular hydroponic nutrient reservoirs.",
    stats: { following: 210, followers: 18400, posts: 74 },
    products: [
      {
        name: "UV-Resistant Poly Film 50m",
        price: 14000,
        image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&auto=format&fit=crop",
        tag: "Materials"
      },
      {
        name: "Hydroponic Nutrient Solution",
        price: 2100,
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=600&q=80&auto=format&fit=crop",
        tag: "Supplies"
      }
    ]
  }
];