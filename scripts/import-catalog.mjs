/**
 * Optional offline regenerator. Not used by npm run dev, npm run build, or the demo.
 * Runtime catalog is always the committed data/products.json file.
 *
 * Usage (optional): node scripts/import-catalog.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const INR_PER_USD = 83;
const MERCHANT_ID = "merchant-demo";
const SKIP_SKUS = new Set(["MOB-PRO-STU-112"]);
const CATEGORIES = ["laptops", "smartphones", "tablets", "mobile-accessories"];

const CURATED = [
  {
    id: "prod-001",
    sku: "NB-AURA-16-512",
    title: "AuraBook 14 Laptop (16 GB / 512 GB)",
    description:
      "A 14-inch everyday laptop for study and light work. Ships with 16 GB RAM, 512 GB SSD, and a full-size keyboard.",
    category: "laptops",
    price_inr: 74990,
    rating: 4.5,
    stock: 12,
    brand: "Aura",
    tags: ["laptop", "16gb-ram", "student", "windows"],
    image_url:
      "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/1.webp",
    specifications: {
      ram: "16 GB",
      storage: "512 GB SSD",
      display: "14-inch FHD",
      processor: "Intel Core i5",
      os: "Windows 11",
    },
  },
  {
    id: "prod-002",
    sku: "NB-NEXUS-8-256",
    title: "Nexus Lite 15 Laptop (8 GB / 256 GB)",
    description:
      "A budget 15-inch laptop for browsing, documents, and video. 8 GB RAM and 256 GB storage.",
    category: "laptops",
    price_inr: 42990,
    rating: 4.1,
    stock: 8,
    brand: "Nexus",
    tags: ["laptop", "8gb-ram", "budget"],
    image_url:
      "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/1.webp",
    specifications: {
      ram: "8 GB",
      storage: "256 GB SSD",
      display: "15.6-inch FHD",
      processor: "Intel Core i3",
      os: "Windows 11",
    },
  },
  {
    id: "prod-003",
    sku: "NB-PEAK-32-1TB",
    title: "Peak Pro 16 Laptop (32 GB / 1 TB)",
    description:
      "A 16-inch performance laptop for design and development. 32 GB RAM, 1 TB SSD, and a high-refresh display.",
    category: "laptops",
    price_inr: 129990,
    rating: 4.7,
    stock: 4,
    brand: "Peak",
    tags: ["laptop", "32gb-ram", "creator"],
    image_url: "https://cdn.dummyjson.com/product-images/laptops/macbook-pro/1.webp",
    specifications: {
      ram: "32 GB",
      storage: "1 TB SSD",
      display: "16-inch QHD",
      processor: "Intel Core i7",
      os: "Windows 11",
    },
  },
  {
    id: "prod-004",
    sku: "HP-SONIC-OVER",
    title: "Sonic Over-Ear Headphones",
    description:
      "Wireless over-ear headphones with active noise cancellation and 30-hour battery life.",
    category: "audio",
    price_inr: 12990,
    rating: 4.6,
    stock: 25,
    brand: "Sonic",
    tags: ["headphones", "anc", "gift"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp",
    specifications: {
      type: "Over-ear",
      connectivity: "Bluetooth 5.3",
      battery: "30 hours",
      noise_cancellation: "Yes",
    },
  },
  {
    id: "prod-005",
    sku: "HP-BUD-IN",
    title: "Pulse In-Ear Earbuds",
    description:
      "Compact wireless earbuds with a charging case. Suited for calls and commuting.",
    category: "audio",
    price_inr: 3490,
    rating: 4.2,
    stock: 40,
    brand: "Pulse",
    tags: ["earbuds", "budget", "wireless"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp",
    specifications: {
      type: "In-ear",
      connectivity: "Bluetooth 5.2",
      battery: "6 hours + case",
      noise_cancellation: "No",
    },
  },
  {
    id: "prod-006",
    sku: "KB-CLICK-TKL",
    title: "ClickForge Mechanical Keyboard",
    description:
      "Tenkeyless mechanical keyboard with hot-swappable switches and RGB lighting.",
    category: "accessories",
    price_inr: 7990,
    rating: 4.4,
    stock: 18,
    brand: "ClickForge",
    tags: ["keyboard", "mechanical", "desk-setup"],
    image_url: "/products/keyboard.svg",
    specifications: {
      layout: "TKL",
      switches: "Hot-swappable",
      backlight: "RGB",
      connection: "USB-C",
    },
  },
  {
    id: "prod-007",
    sku: "MS-TRACK-WL",
    title: "TrackFlow Wireless Mouse",
    description:
      "Ergonomic wireless mouse with a silent click and USB-C rechargeable battery.",
    category: "accessories",
    price_inr: 1990,
    rating: 4.3,
    stock: 50,
    brand: "TrackFlow",
    tags: ["mouse", "wireless"],
    image_url: "/products/mouse.svg",
    specifications: {
      connectivity: "2.4 GHz wireless",
      dpi: "1600",
      battery: "Rechargeable USB-C",
      buttons: "6",
    },
  },
  {
    id: "prod-008",
    sku: "MN-CLEAR-27",
    title: "ClearView 27-inch Monitor",
    description:
      "27-inch IPS monitor with USB-C power delivery for a single-cable laptop desk setup.",
    category: "monitors",
    price_inr: 18990,
    rating: 4.5,
    stock: 9,
    brand: "ClearView",
    tags: ["monitor", "usb-c", "home-office"],
    image_url: "/products/monitor.svg",
    specifications: {
      size: "27-inch",
      resolution: "2560 x 1440",
      panel: "IPS",
      refresh_rate: "75 Hz",
      ports: "HDMI, USB-C",
    },
  },
  {
    id: "prod-009",
    sku: "BG-CARRY-15",
    title: "CarryAll 15-inch Laptop Backpack",
    description:
      "Padded backpack with a 15-inch laptop sleeve, bottle pocket, and water-resistant fabric.",
    category: "bags",
    price_inr: 2490,
    rating: 4.4,
    stock: 30,
    brand: "CarryAll",
    tags: ["backpack", "laptop", "student"],
    image_url: "/products/backpack.svg",
    specifications: {
      laptop_sleeve: "15-inch",
      material: "Water-resistant polyester",
      pockets: "3",
      weight: "720 g",
    },
  },
  {
    id: "prod-010",
    sku: "SSD-FAST-1TB",
    title: "FastDrive 1 TB Portable SSD",
    description:
      "USB-C portable SSD for backups and media. 1 TB capacity with a compact metal body.",
    category: "storage",
    price_inr: 8990,
    rating: 4.6,
    stock: 15,
    brand: "FastDrive",
    tags: ["ssd", "storage", "usb-c"],
    image_url: "/products/ssd.svg",
    specifications: {
      capacity: "1 TB",
      interface: "USB-C 10 Gbps",
      form_factor: "Portable",
      encryption: "Hardware password",
    },
  },
  {
    id: "prod-011",
    sku: "PH-RIVER-128",
    title: "River 12 Smartphone (8 GB / 128 GB)",
    description:
      "A mid-range smartphone with 8 GB RAM, a 50 MP camera, and a 5000 mAh battery. Currently out of stock.",
    category: "smartphones",
    price_inr: 18999,
    rating: 4.3,
    stock: 0,
    brand: "River",
    tags: ["smartphone", "mid-range", "8gb-ram"],
    image_url:
      "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp",
    specifications: {
      ram: "8 GB",
      storage: "128 GB",
      battery: "5000 mAh",
      camera: "50 MP",
    },
  },
  {
    id: "prod-012",
    sku: "PB-CHARGE-20K",
    title: "ChargeKeep 20000 mAh Power Bank",
    description:
      "Dual-port 20000 mAh power bank with 30W USB-C output for phones and compact laptops.",
    category: "accessories",
    price_inr: 2290,
    rating: 4.2,
    stock: 22,
    brand: "ChargeKeep",
    tags: ["power-bank", "travel", "usb-c"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-charger/1.webp",
    specifications: {
      capacity: "20000 mAh",
      output: "30W USB-C",
      ports: "USB-C, USB-A",
      weight: "340 g",
    },
  },
  {
    id: "prod-013",
    sku: "NB-LEAF-16-512",
    title: "LeafBook 15 Laptop (16 GB / 512 GB)",
    description:
      "A 15.6-inch laptop for college work. Includes 16 GB RAM, 512 GB SSD, and a numeric keypad.",
    category: "laptops",
    price_inr: 78990,
    rating: 4.3,
    stock: 7,
    brand: "Leaf",
    tags: ["laptop", "16gb-ram", "student"],
    image_url:
      "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/1.webp",
    specifications: {
      ram: "16 GB",
      storage: "512 GB SSD",
      display: "15.6-inch FHD",
      processor: "AMD Ryzen 5",
      os: "Windows 11",
    },
  },
  {
    id: "prod-014",
    sku: "NB-NEXUS-16-512",
    title: "Nexus 14 Laptop (16 GB / 512 GB)",
    description:
      "A compact 14-inch laptop with 16 GB RAM and 512 GB SSD for travel and office work.",
    category: "laptops",
    price_inr: 64990,
    rating: 4.4,
    stock: 10,
    brand: "Nexus",
    tags: ["laptop", "16gb-ram", "portable"],
    image_url:
      "https://cdn.dummyjson.com/product-images/laptops/new-dell-xps-13-9300-laptop/1.webp",
    specifications: {
      ram: "16 GB",
      storage: "512 GB SSD",
      display: "14-inch FHD",
      processor: "Intel Core i5",
      os: "Windows 11",
    },
  },
  {
    id: "prod-015",
    sku: "NB-AURA-16-256",
    title: "AuraBook 14 Laptop (16 GB / 256 GB)",
    description:
      "Same 14-inch AuraBook chassis with 16 GB RAM and a 256 GB SSD for a lower price.",
    category: "laptops",
    price_inr: 69990,
    rating: 4.2,
    stock: 5,
    brand: "Aura",
    tags: ["laptop", "16gb-ram", "student"],
    image_url:
      "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/2.webp",
    specifications: {
      ram: "16 GB",
      storage: "256 GB SSD",
      display: "14-inch FHD",
      processor: "Intel Core i5",
      os: "Windows 11",
    },
  },
  {
    id: "prod-016",
    sku: "NB-AURA-16-OOS",
    title: "AuraBook 15 Laptop (16 GB / 512 GB)",
    description:
      "A 15-inch AuraBook with 16 GB RAM and 512 GB SSD. Currently out of stock.",
    category: "laptops",
    price_inr: 72990,
    rating: 4.4,
    stock: 0,
    brand: "Aura",
    tags: ["laptop", "16gb-ram"],
    image_url:
      "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/2.webp",
    specifications: {
      ram: "16 GB",
      storage: "512 GB SSD",
      display: "15.6-inch FHD",
      processor: "Intel Core i5",
      os: "Windows 11",
    },
  },
  {
    id: "prod-017",
    sku: "NB-PEAK-16-1TB",
    title: "Peak 16 Laptop (16 GB / 1 TB)",
    description:
      "A 16-inch Peak laptop with 16 GB RAM and 1 TB SSD. Priced above ₹80,000.",
    category: "laptops",
    price_inr: 99990,
    rating: 4.6,
    stock: 3,
    brand: "Peak",
    tags: ["laptop", "16gb-ram", "creator"],
    image_url: "https://cdn.dummyjson.com/product-images/laptops/macbook-pro/2.webp",
    specifications: {
      ram: "16 GB",
      storage: "1 TB SSD",
      display: "16-inch QHD",
      processor: "Intel Core i7",
      os: "Windows 11",
    },
  },
  {
    id: "prod-018",
    sku: "NB-NEXUS-8-512",
    title: "Nexus 15 Laptop (8 GB / 512 GB)",
    description:
      "A 15-inch Nexus laptop with 8 GB RAM and 512 GB SSD for everyday use.",
    category: "laptops",
    price_inr: 48990,
    rating: 4.0,
    stock: 6,
    brand: "Nexus",
    tags: ["laptop", "8gb-ram"],
    image_url:
      "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/2.webp",
    specifications: {
      ram: "8 GB",
      storage: "512 GB SSD",
      display: "15.6-inch FHD",
      processor: "Intel Core i3",
      os: "Windows 11",
    },
  },
  {
    id: "prod-019",
    sku: "HP-SONIC-BUD",
    title: "Sonic Earbuds Pro",
    description: "In-ear wireless earbuds with ANC and a USB-C charging case.",
    category: "audio",
    price_inr: 6990,
    rating: 4.5,
    stock: 20,
    brand: "Sonic",
    tags: ["earbuds", "anc", "wireless"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/1.webp",
    specifications: {
      type: "In-ear",
      connectivity: "Bluetooth 5.3",
      battery: "8 hours + case",
      noise_cancellation: "Yes",
    },
  },
  {
    id: "prod-020",
    sku: "HP-PULSE-OVER",
    title: "Pulse Over-Ear Headphones",
    description: "Wired-free over-ear headphones without noise cancellation.",
    category: "audio",
    price_inr: 4990,
    rating: 4.1,
    stock: 14,
    brand: "Pulse",
    tags: ["headphones", "budget"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/2.webp",
    specifications: {
      type: "Over-ear",
      connectivity: "Bluetooth 5.1",
      battery: "20 hours",
      noise_cancellation: "No",
    },
  },
  {
    id: "prod-021",
    sku: "KB-CLICK-FULL",
    title: "ClickForge Full-size Keyboard",
    description: "Full-size mechanical keyboard with a number pad and USB-C.",
    category: "accessories",
    price_inr: 8990,
    rating: 4.5,
    stock: 11,
    brand: "ClickForge",
    tags: ["keyboard", "mechanical"],
    image_url: "/products/keyboard.svg",
    specifications: {
      layout: "Full-size",
      switches: "Hot-swappable",
      backlight: "White",
      connection: "USB-C",
    },
  },
  {
    id: "prod-022",
    sku: "MS-TRACK-BT",
    title: "TrackFlow Bluetooth Mouse",
    description: "Compact Bluetooth mouse for laptops. Two-device pairing.",
    category: "accessories",
    price_inr: 1490,
    rating: 4.2,
    stock: 28,
    brand: "TrackFlow",
    tags: ["mouse", "bluetooth"],
    image_url: "/products/mouse.svg",
    specifications: {
      connectivity: "Bluetooth 5.0",
      dpi: "1200",
      battery: "AA",
      buttons: "4",
    },
  },
  {
    id: "prod-023",
    sku: "HB-USBC-7",
    title: "PortNest USB-C Hub (7-port)",
    description: "USB-C hub with HDMI, USB-A, SD, and 100W pass-through.",
    category: "accessories",
    price_inr: 3490,
    rating: 4.3,
    stock: 16,
    brand: "PortNest",
    tags: ["hub", "usb-c", "laptop"],
    image_url: "/products/ssd.svg",
    specifications: {
      ports: "HDMI, 2x USB-A, USB-C, SD, microSD",
      power_passthrough: "100W",
      connection: "USB-C",
    },
  },
  {
    id: "prod-024",
    sku: "WC-FRAME-1080",
    title: "FrameCam 1080p Webcam",
    description: "1080p webcam with a built-in microphone for video calls.",
    category: "accessories",
    price_inr: 2490,
    rating: 4.1,
    stock: 19,
    brand: "FrameCam",
    tags: ["webcam", "home-office"],
    image_url: "/products/monitor.svg",
    specifications: {
      resolution: "1080p",
      microphone: "Yes",
      connection: "USB-A",
      fov: "78 degree",
    },
  },
  {
    id: "prod-025",
    sku: "CB-USBC-2M",
    title: "ChargeKeep USB-C Cable 2 m",
    description: "2-metre USB-C to USB-C cable rated for 60W charging.",
    category: "accessories",
    price_inr: 490,
    rating: 4.0,
    stock: 60,
    brand: "ChargeKeep",
    tags: ["cable", "usb-c"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/1.webp",
    specifications: {
      length: "2 m",
      rating: "60W",
      connectors: "USB-C to USB-C",
    },
  },
  {
    id: "prod-026",
    sku: "ST-LAP-COOL",
    title: "AirLift Laptop Stand",
    description: "Aluminium laptop stand that raises a 13–16 inch laptop.",
    category: "accessories",
    price_inr: 1990,
    rating: 4.4,
    stock: 13,
    brand: "AirLift",
    tags: ["stand", "laptop", "desk-setup"],
    image_url: "/products/monitor.svg",
    specifications: {
      material: "Aluminium",
      size_range: "13-16 inch",
      adjustable: "Yes",
    },
  },
  {
    id: "prod-027",
    sku: "MN-CLEAR-24",
    title: "ClearView 24-inch Monitor",
    description: "24-inch FHD IPS monitor with HDMI and VGA.",
    category: "monitors",
    price_inr: 9990,
    rating: 4.2,
    stock: 12,
    brand: "ClearView",
    tags: ["monitor", "home-office"],
    image_url: "/products/monitor.svg",
    specifications: {
      size: "24-inch",
      resolution: "1920 x 1080",
      panel: "IPS",
      refresh_rate: "75 Hz",
      ports: "HDMI, VGA",
    },
  },
  {
    id: "prod-028",
    sku: "MN-CLEAR-32",
    title: "ClearView 32-inch Monitor",
    description: "32-inch QHD monitor with USB-C and speakers.",
    category: "monitors",
    price_inr: 24990,
    rating: 4.4,
    stock: 4,
    brand: "ClearView",
    tags: ["monitor", "usb-c"],
    image_url: "/products/monitor.svg",
    specifications: {
      size: "32-inch",
      resolution: "2560 x 1440",
      panel: "IPS",
      refresh_rate: "75 Hz",
      ports: "HDMI, USB-C",
    },
  },
  {
    id: "prod-029",
    sku: "MN-PEAK-27",
    title: "Peak 27-inch 144 Hz Monitor",
    description: "27-inch 144 Hz IPS monitor for desk use.",
    category: "monitors",
    price_inr: 22990,
    rating: 4.6,
    stock: 6,
    brand: "Peak",
    tags: ["monitor", "144hz"],
    image_url: "/products/monitor.svg",
    specifications: {
      size: "27-inch",
      resolution: "2560 x 1440",
      panel: "IPS",
      refresh_rate: "144 Hz",
      ports: "HDMI, DisplayPort",
    },
  },
  {
    id: "prod-030",
    sku: "SSD-FAST-512",
    title: "FastDrive 512 GB Portable SSD",
    description: "512 GB USB-C portable SSD in a compact metal body.",
    category: "storage",
    price_inr: 4990,
    rating: 4.5,
    stock: 21,
    brand: "FastDrive",
    tags: ["ssd", "usb-c"],
    image_url: "/products/ssd.svg",
    specifications: {
      capacity: "512 GB",
      interface: "USB-C 10 Gbps",
      form_factor: "Portable",
    },
  },
  {
    id: "prod-031",
    sku: "SSD-FAST-2TB",
    title: "FastDrive 2 TB Portable SSD",
    description: "2 TB USB-C portable SSD for large backups.",
    category: "storage",
    price_inr: 14990,
    rating: 4.7,
    stock: 8,
    brand: "FastDrive",
    tags: ["ssd", "usb-c"],
    image_url: "/products/ssd.svg",
    specifications: {
      capacity: "2 TB",
      interface: "USB-C 10 Gbps",
      form_factor: "Portable",
    },
  },
  {
    id: "prod-032",
    sku: "FD-FLASH-256",
    title: "FastDrive 256 GB USB-C Flash Drive",
    description: "256 GB USB-C flash drive for files and presentations.",
    category: "storage",
    price_inr: 1490,
    rating: 4.1,
    stock: 35,
    brand: "FastDrive",
    tags: ["flash-drive", "usb-c"],
    image_url: "/products/ssd.svg",
    specifications: {
      capacity: "256 GB",
      interface: "USB-C",
      form_factor: "Stick",
    },
  },
  {
    id: "prod-033",
    sku: "BG-CARRY-13",
    title: "CarryAll 13-inch Laptop Sleeve",
    description: "Padded sleeve for 13-inch laptops.",
    category: "bags",
    price_inr: 1290,
    rating: 4.3,
    stock: 24,
    brand: "CarryAll",
    tags: ["sleeve", "laptop"],
    image_url: "/products/backpack.svg",
    specifications: {
      laptop_sleeve: "13-inch",
      material: "Neoprene",
    },
  },
  {
    id: "prod-034",
    sku: "BG-CARRY-MESS",
    title: "CarryAll Messenger Bag",
    description: "Messenger bag with a 15-inch laptop sleeve.",
    category: "bags",
    price_inr: 3490,
    rating: 4.4,
    stock: 9,
    brand: "CarryAll",
    tags: ["messenger", "laptop"],
    image_url: "/products/backpack.svg",
    specifications: {
      laptop_sleeve: "15-inch",
      material: "Canvas",
      pockets: "4",
    },
  },
  {
    id: "prod-035",
    sku: "PB-CHARGE-10K",
    title: "ChargeKeep 10000 mAh Power Bank",
    description: "Compact 10000 mAh power bank with 20W USB-C output.",
    category: "accessories",
    price_inr: 1490,
    rating: 4.1,
    stock: 33,
    brand: "ChargeKeep",
    tags: ["power-bank", "usb-c"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/1.webp",
    specifications: {
      capacity: "10000 mAh",
      output: "20W USB-C",
      ports: "USB-C, USB-A",
    },
  },
  {
    id: "prod-036",
    sku: "PB-CHARGE-30K",
    title: "ChargeKeep 30000 mAh Power Bank",
    description: "High-capacity 30000 mAh power bank with 45W USB-C output.",
    category: "accessories",
    price_inr: 3490,
    rating: 4.3,
    stock: 10,
    brand: "ChargeKeep",
    tags: ["power-bank", "travel"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/2.webp",
    specifications: {
      capacity: "30000 mAh",
      output: "45W USB-C",
      ports: "2x USB-C, USB-A",
    },
  },
  {
    id: "prod-037",
    sku: "CS-PHONE-CLR",
    title: "ClearFit Universal Phone Case",
    description: "Clear TPU case that fits most mid-size smartphones.",
    category: "accessories",
    price_inr: 790,
    rating: 4.0,
    stock: 40,
    brand: "ClearFit",
    tags: ["case", "smartphone"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/1.webp",
    specifications: {
      material: "TPU",
      type: "Clear case",
    },
  },
  {
    id: "prod-038",
    sku: "GL-PHONE-TEM",
    title: "TemperGuard Phone Glass",
    description: "Tempered glass screen protector for common phone sizes.",
    category: "accessories",
    price_inr: 490,
    rating: 3.9,
    stock: 55,
    brand: "TemperGuard",
    tags: ["glass", "smartphone"],
    image_url:
      "https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/2.webp",
    specifications: {
      material: "Tempered glass",
      hardness: "9H",
    },
  },
];

function specsFromDummy(product) {
  const specifications = {};
  if (product.warrantyInformation) {
    specifications.warranty = String(product.warrantyInformation);
  }
  const titleDesc = `${product.title} ${product.description}`;
  const ram = titleDesc.match(/(\d+)\s*GB\s*RAM/i);
  if (ram) {
    specifications.ram = `${ram[1]} GB`;
  }
  const storage = titleDesc.match(/(\d+)\s*(GB|TB)\s*(SSD|storage|ROM)/i);
  if (storage) {
    specifications.storage = `${storage[1]} ${storage[2].toUpperCase()}`;
  }
  return specifications;
}

function normalizeDummy(product) {
  return {
    id: `dj-${product.id}`,
    merchant_id: MERCHANT_ID,
    sku: product.sku,
    title: product.title,
    description: product.description,
    category: product.category,
    price_inr: Math.round(Number(product.price) * INR_PER_USD),
    rating: Math.round(Number(product.rating) * 10) / 10,
    stock: Number(product.stock) || 0,
    brand: product.brand || "Unbranded",
    tags: Array.isArray(product.tags) ? product.tags.map(String) : [],
    image_url: product.images?.[0] || product.thumbnail || "/product-placeholder.svg",
    specifications: specsFromDummy(product),
    compatible_skus: [],
  };
}

function withMerchant(product) {
  return {
    merchant_id: MERCHANT_ID,
    compatible_skus: [],
    ...product,
  };
}

function assignCompatible(products) {
  const bySku = new Map(products.map((p) => [p.sku, p]));
  const pick = (...skus) => skus.filter((sku) => bySku.has(sku));

  for (const product of products) {
    let links = [];
    if (product.category === "laptops") {
      links = pick(
        "MS-TRACK-WL",
        "BG-CARRY-15",
        "SSD-FAST-1TB",
        "PB-CHARGE-20K",
        "KB-CLICK-TKL",
      );
    } else if (product.category === "monitors") {
      links = pick("KB-CLICK-TKL", "MS-TRACK-WL");
    } else if (product.category === "smartphones") {
      links = pick("PB-CHARGE-20K", "CS-PHONE-CLR", "HP-BUD-IN", "MOB-APP-APP-104");
    } else if (product.category === "tablets") {
      links = pick("MOB-APP-APP-104", "SSD-FAST-1TB");
    } else if (product.category === "audio") {
      links = pick("PB-CHARGE-10K");
    } else if (product.sku === "KB-CLICK-TKL" || product.sku === "KB-CLICK-FULL") {
      links = pick("MS-TRACK-WL");
    } else if (product.sku === "MS-TRACK-WL" || product.sku === "MS-TRACK-BT") {
      links = pick("KB-CLICK-TKL");
    }
    product.compatible_skus = [...new Set(links.filter((sku) => sku !== product.sku))];
  }
}

async function fetchDummyCategory(category) {
  const response = await fetch(
    `https://dummyjson.com/products/category/${category}`,
  );
  if (!response.ok) {
    throw new Error(`DummyJSON ${category}: HTTP ${response.status}`);
  }
  const data = await response.json();
  if (!Array.isArray(data.products)) {
    throw new Error(`DummyJSON ${category}: unexpected payload`);
  }
  return data.products;
}

async function main() {
  const dummy = [];
  for (const category of CATEGORIES) {
    const products = await fetchDummyCategory(category);
    dummy.push(...products);
  }

  const fromDummy = dummy
    .filter((product) => !SKIP_SKUS.has(product.sku))
    .map(normalizeDummy);

  const curatedSkus = new Set(CURATED.map((p) => p.sku));
  const merged = [
    ...CURATED.map(withMerchant),
    ...fromDummy.filter((p) => !curatedSkus.has(p.sku)),
  ];

  assignCompatible(merged);
  merged.sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));

  const outPath = join(dirname(fileURLToPath(import.meta.url)), "../data/products.json");
  writeFileSync(outPath, `${JSON.stringify(merged, null, 2)}\n`);
  console.log(`Wrote ${merged.length} products to data/products.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
