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
    image: "https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/2255938/pexels-photo-2255938.jpeg?auto=compress&cs=tinysrgb&w=1600",
    bio: "Premium supplier of bio-fertilizers and organic compost based in Punjab. Ensuring healthy soil for generations.",
    longBio: "Organic Roots began with a simple mission: bringing sustainable soil health back to the heartland of India. We craft specialized bio-compost that restores essential microbes, boosting crop yields naturally without relying on harsh chemicals. Every batch is rigorously tested for quality and nutrient density.",
    stats: { following: 120, followers: 8500, posts: 42 },
    products: [
      { name: "Bio-Active Compost 50kg", price: 1200, image: "https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Fertilizer" },
      { name: "Organic Potash Blend", price: 850, image: "https://images.pexels.com/photos/1400172/pexels-photo-1400172.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Supplement" }
    ]
  },
  {
    id: "aerotech",
    name: "AeroTech Drones",
    username: "aerotech_agri",
    image: "https://images.pexels.com/photos/4032338/pexels-photo-4032338.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/10892015/pexels-photo-10892015.jpeg?auto=compress&cs=tinysrgb&w=1600",
    bio: "Specializing in high-precision agricultural drones for targeted spraying and crop monitoring.",
    longBio: "AeroTech bridges the gap between aerospace engineering and traditional farming. Our specialized drones enable hyper-targeted pesticide spraying and thermal field monitoring, allowing farmers to reduce chemical waste by up to 60% while drastically lowering water usage.",
    stats: { following: 45, followers: 12400, posts: 18 },
    products: [
      { name: "Sprayer Drone X1", price: 45000, image: "https://images.pexels.com/photos/5921820/pexels-photo-5921820.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Hardware" },
      { name: "Thermal Sensor Kit", price: 12000, image: "https://images.pexels.com/photos/2569997/pexels-photo-2569997.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Accessory" },
      { name: "Replacement Propellers", price: 1500, image: "https://images.pexels.com/photos/337119/pexels-photo-337119.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Parts" }
    ]
  },
  {
    id: "greenseed",
    name: "GreenSeed Co.",
    username: "greenseed_official",
    image: "https://images.pexels.com/photos/1640562/pexels-photo-1640562.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1600",
    bio: "Certified high-yield, drought-resistant seeds tailored for unpredictable weather patterns.",
    longBio: "Founded by agronomists deeply concerned with climate change, GreenSeed Co. offers hybrid seeds that require less water and exhibit higher resilience to sudden temperature changes. Every seed is organically treated to defend against common soil-borne pathogens natively.",
    stats: { following: 320, followers: 45000, posts: 156 },
    products: [
      { name: "Drought-Resistant Wheat 10kg", price: 800, image: "https://images.pexels.com/photos/1483030/pexels-photo-1483030.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Seeds" },
      { name: "Hybrid Corn Pack", price: 1100, image: "https://images.pexels.com/photos/54000/pexels-photo-54000.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Seeds" }
    ]
  },
  {
    id: "agritechdev",
    name: "AgriTech Solutions",
    username: "agritech_dev",
    image: "https://images.pexels.com/photos/4497591/pexels-photo-4497591.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/1640562/pexels-photo-1640562.jpeg?auto=compress&cs=tinysrgb&w=1600",
    bio: "Pioneering smart agricultural development and sustainable farming hardware.",
    longBio: "AgriTech Solutions is the premier provider of smart farm implements. From automated irrigation valves driven by IoT sensors to advanced soil tracking telemetry devices, we empower farmers to move their harvest from analogue guessing to digital precision.",
    stats: { following: 89, followers: 15200, posts: 24 },
    products: [
      { name: "Smart IoT Valve Controller", price: 8500, image: "https://images.pexels.com/photos/3483098/pexels-photo-3483098.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "IoT" },
      { name: "Soil Moisture Sensor Pro", price: 3200, image: "https://images.pexels.com/photos/4425574/pexels-photo-4425574.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Sensors" }
    ]
  },
  {
    id: "sunlightfarms",
    name: "Sunlight Supply",
    username: "sunlight_greenhouse",
    image: "https://images.pexels.com/photos/2592815/pexels-photo-2592815.jpeg?auto=compress&cs=tinysrgb&w=800",
    heroImage: "https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=1600",
    bio: "Industrial-grade greenhouse materials and hydroponic growth solutions.",
    longBio: "Sunlight Supply enables year-round harvesting regardless of external weather conditions. We supply UV-resistant greenhouse film, structural poly-tunnels, and modular hydroponic nutrient reservoirs for the modern vertical farmer.",
    stats: { following: 210, followers: 18400, posts: 74 },
    products: [
      { name: "UV-Resistant Poly Film 50m", price: 14000, image: "https://images.pexels.com/photos/2255938/pexels-photo-2255938.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Materials" },
      { name: "Hydroponic Nutrient Solution", price: 2100, image: "https://images.pexels.com/photos/1209353/pexels-photo-1209353.jpeg?auto=compress&cs=tinysrgb&w=600", tag: "Supplies" }
    ]
  }
];
