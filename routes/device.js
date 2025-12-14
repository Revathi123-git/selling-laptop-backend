const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Device = require("../models/Device");
const validateBrandAndModel = require("../deviceBrands/validateBrandModel");

const router = express.Router();

// =========================
// 📁 Upload folder setup
// =========================
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// =========================
// 🎯 DEVICE-BASED VALIDATION FUNCTION
// =========================
const validateDeviceDetails = (deviceType, details) => {
  const errors = [];

/*   const textRegex = /^[A-Za-z0-9\s\-().]+$/; // alphanumeric + few symbols
  const numRegex = /^\d+$/;
  const batteryRegex = /^(100|[0-9]{1,2})$/;
  const yesNoRegex = /^(Yes|No)$/i;
 */
function normalizeCategory(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[-\s]+/g, "-");
}
const category =  normalizeCategory(deviceType);
  switch (category) {
   case "Laptop": {

   if (details.Processor?.trim()) {
  const processor = details.Processor.trim();

  const processorPattern =
    /^(intel\s*core\s*)?i[3579]([-\s]?\d+[a-zA-Z]*)?$|^(amd\s*ryzen\s*)?([3579]\d*)[a-zA-Z]*$/i;

  if (!processorPattern.test(processor)) {
    errors.push(
      'Invalid Processor. Please enter something like "Intel Core i5", "i7", "AMD Ryzen 7", or "Ryzen 5 5600U".'
    );
  }
}


    // ------------------- RAM -------------------
    const ramKey = Object.keys(details).find((k) => k.toLowerCase() === "ram");
    if (ramKey && details[ramKey]?.toString().trim()) {
      const ramString = details[ramKey].toString().trim();
      const ram = parseInt(ramString.replace(/\D/g, ""), 10); // extract digits
      const allowedRAM = [4, 8, 16, 32, 64];
      if (isNaN(ram) || !allowedRAM.includes(ram)) {
        errors.push(`RAM must be one of: ${allowedRAM.join(", ")} GB.`);
      }
    }

    // ------------------- Storage -------------------
    if (details.Storage?.toString().trim()) {
      const storage = parseInt(details.Storage.toString(), 10);
      const allowedStorage = [128, 256, 512, 1024, 2048];
      if (!allowedStorage.includes(storage)) {
        errors.push(`Storage must be one of: ${allowedStorage.join(", ")} GB.`);
      }
    }

    // ------------------- Screen Size -------------------
    if (details.ScreenSize?.toString().trim()) {
      const screen = parseFloat(details.ScreenSize.toString());
      if (isNaN(screen) || screen <= 0 || screen > 20) {
        errors.push("Screen Size must be a valid number between 1 and 20 inches.");
      }
    }

    // ------------------- Graphics Card -------------------
    if (details["Graphics Card"]?.trim()) {
      const graphics = details["Graphics Card"].trim();

      const knownCards = [
        "Integrated", "Intel UHD", "Intel Iris Xe",
        "NVIDIA GTX 1050", "NVIDIA GTX 1650", "NVIDIA GTX 1660",
        "NVIDIA RTX 2060", "NVIDIA RTX 3060", "NVIDIA RTX 4070",
        "AMD Radeon RX 6600", "AMD Radeon RX 6700 XT", "AMD Radeon Vega 8"
      ];

      const isKnownCard = knownCards.some(
        (card) => card.toLowerCase() === graphics.toLowerCase()
      );

      const validPattern = /^(integrated|(intel|nvidia|amd)\s+[a-z0-9\s\-]+)$/i.test(graphics);

      if (!isKnownCard && !validPattern) {
        errors.push(
          'Invalid Graphics Card. Please enter a valid one like "Integrated", "NVIDIA GTX 1650", or "AMD Radeon RX 6600".'
        );
      }
    }

    break;
  }

case "Desktop": {
  // --- Brand & Model (required) ---
  if (!details.Brand || details.Brand.toString().trim() === "") {
    errors.push("Brand is required for Desktop.");
  }
  /* if (!details.Model || details.Model.toString().trim() === "") {
    errors.push("Model is required for Desktop.");
  } */

  // --- Processor (required) ---
  if(details.Processor){
    const processor = details.Processor.toString().trim();
    const processorPattern = /^(intel|amd)?\s?(core\s)?(i[3579]|ryzen\s?[3579])(\s?\d{3,5}[a-zA-Z]?)?$/i;
    if (!processorPattern.test(processor)) {
      errors.push('Invalid Processor. Examples: "Intel Core i5", "AMD Ryzen 7".');
    }
  }

  // --- RAM (required) ---
  const ramKey = Object.keys(details).find(k => k.toLowerCase() === "ram");
 if(ramKey) {
    const ramString = details[ramKey].toString().trim();
    const ram = parseInt(ramString.replace(/\D/g, ""), 10);
    const allowedRAM = [4, 8, 16, 32, 64];
    if (isNaN(ram) || !allowedRAM.includes(ram)) {
      errors.push(`RAM must be one of: ${allowedRAM.join(", ")} GB.`);
    }
  }

  // --- Storage (required) ---
  const storageKey = Object.keys(details).find(k => k.toLowerCase() === "storage");
if(storageKey) {
    const storage = parseInt(details[storageKey].toString().trim(), 10);
    const allowedStorage = [128, 256, 512, 1024, 2048];
    if (isNaN(storage) || !allowedStorage.includes(storage)) {
      errors.push(`Storage must be one of: ${allowedStorage.join(", ")} GB.`);
    }
  }

  // --- Graphics Card (optional) ---
  const graphicsKey = Object.keys(details).find(k => k.toLowerCase() === "graphics card");
  if (graphicsKey && details[graphicsKey]?.toString().trim() !== "") {
    const graphics = details[graphicsKey].toString().trim().toLowerCase();
    const knownCards = [
      "integrated", "intel uhd", "intel iris xe",
      "nvidia gtx 1050", "nvidia gtx 1650", "nvidia gtx 1660",
      "nvidia rtx 2060", "nvidia rtx 3060", "nvidia rtx 4070",
      "amd radeon rx 6600", "amd radeon rx 6700 xt", "amd radeon vega 8"
    ];

    const isKnownCard = knownCards.some(card => graphics === card.toLowerCase());
    const validStructure = /^(integrated|(intel|nvidia|amd)\s+[a-z0-9\s\-]+)$/i.test(graphics);

    if (!isKnownCard && !validStructure) {
      errors.push('Invalid Graphics Card. Examples: "Integrated", "NVIDIA GTX 1650", "AMD Radeon RX 6600".');
    }
  }

  // --- Monitor Included (required, Yes/No) ---
  const monitorKey = Object.keys(details).find(k => k.toLowerCase().replace(/\s+/g, "") === "monitorincluded");
 if(monitorKey) {
    const monitorValue = details[monitorKey].toString().trim();
    if (!/^yes$/i.test(monitorValue) && !/^no$/i.test(monitorValue)) {
      errors.push('Monitor Included must be "Yes" or "No".');
    }
  }

  break;
}


 case "Mobile":
case "Tablet":
case "iPhone": {
  // --- Brand ---
  if (deviceType !== "iPhone" && (!details.Brand || details.Brand.toString().trim() === "")) {
    errors.push("Brand is required for Mobile/Tablet.");
  }

  /* // --- Model ---
  if (!details.Model || details.Model.toString().trim() === "") {
    errors.push("Model is required.");
  }
 */

   // --- Storage (GB) ---
 if(details.Storage) {
    const storageValue = parseInt(details.Storage.toString().replace(/\D/g, ""), 10);
    const allowedStorage = [8, 16, 32, 64, 128, 256, 512, 1024];
    if (isNaN(storageValue) || !allowedStorage.includes(storageValue)) {
      errors.push(`Storage must be one of: ${allowedStorage.join(", ")} GB.`);
    }
  }


  

 // --- RAM (MOBILE ONLY) ---
if (deviceType === "Mobile") {
  const ramKey = Object.keys(details).find(
    (k) => k.toLowerCase().replace(/\s+/g, "") === "ram"
  );
if(ramKey) {
    const ramValue = parseInt(details[ramKey].toString().replace(/\D/g, ""));
    const allowedRam = [2, 3, 4, 6, 8, 12, 16];

    if (isNaN(ramValue)) {
      errors.push("RAM must be a numeric value.");
    } else if (!allowedRam.includes(ramValue)) {
      errors.push(`RAM must be one of: ${allowedRam.join(", ")} GB.`);
    }
  }
}



const batteryKey = Object.keys(details).find(
  (k) =>
    k.toLowerCase().replace(/\s+/g, "") === "batteryhealth" ||
    k.toLowerCase().replace(/\s+/g, "") === "batteryhealth(%)"
);

if(batteryKey) {
  const value = details[batteryKey].toString().trim();

  if (value === "") {
    errors.push("Battery Health is required.");
  } else {
    const batteryValue = Number(value);
    if (isNaN(batteryValue)) {
      errors.push("Battery Health must be a numeric value.");
    } else if (batteryValue < 0 || batteryValue > 100) {
      errors.push("Battery Health must be between 0 and 100.");
    }
  }
}

   // --- Screen Size (Mobile + Tablet) ---
  const screenKey = Object.keys(details).find(
    (k) => k.toLowerCase().replace(/\s+/g, "") === "screensize"
  );


  if (deviceType === "Mobile" || deviceType === "Tablet") {
   if(screenKey) {
      const screenValue = parseFloat(details[screenKey].toString().replace(/[^\d.]/g, ""));
      if (isNaN(screenValue) || screenValue < 2 || screenValue > 20) {
        errors.push("Screen Size must be between 2 and 20 inches.");
      }
    }
  }

  break;
}




   case "TV":
  // Brand

  const normalize = (key) => key.toLowerCase().replace(/\s+/g, "");
const get = (field) => {
  const target = normalize(field);
  const foundKey = Object.keys(details).find(
    (k) => normalize(k) === target
  );
  return foundKey ? details[foundKey] : "";
};
case "TV":
 
  const screenSize = get("screenSize");
  const displayType = get("displayType");
  const resolution = get("resolution");

 /*  if (!brand) errors.push("Brand is required for TV.");
  if (!model) errors.push("Model is required for TV."); */

 if (screenSize) {
 
 if (!/^\d+(\.\d+)?$/.test(screenSize)) {
  errors.push("Screen Size must be a valid number.");
} else {
  const size = parseFloat(screenSize);

  if (size < 10 || size > 120) {
    errors.push("Screen Size must be between 10 and 120 inches.");
  }
}
}
  if(displayType){
    const validDisplays = ["LED", "OLED", "QLED", "LCD", "PLASMA"];
    if (!validDisplays.includes(displayType.toUpperCase())) {
      errors.push(`Display Type must be one of: ${validDisplays.join(", ")}.`);
    }
  }

  if (resolution) {
    const validRes = ["HD", "HD+", "FULL HD", "2K", "4K", "8K", "1080P", "1440P", "2160P"];
    if (!validRes.includes(resolution.toUpperCase())) {
      errors.push(`Resolution must be one of: ${validRes.join(", ")}.`);
    }
  }

  break;



   case "CPU":

let ct = details.cores;

// Convert to string ALWAYS
if (ct !== undefined && ct !== null) {
  ct = ct.toString().trim();
}

// Required check
if (!ct || ct.length === 0) {
  console.log("🟨 Received Cores Value:", details.cores);
  errors.push("Cores/Threads is required for CPU.");
} 
else {
  // Validate proper number/number format
  const validFormat = /^\d+\s*\/\s*\d+$/;

  if (!validFormat.test(ct)) {
    errors.push("Cores/Threads must be in format like 6/12.");
  }
}

  break;


    case "RAM":

  
      
     const validCapacities = [2, 4, 8, 16, 32, 64, 128];

if(details.Capacity) {
  const capacityValue = Number(details.Capacity);

  if (!validCapacities.includes(capacityValue)) {
    errors.push(`Capacity must be one of: ${validCapacities.join(", ")} GB`);
  }
}

const ramType = details.type || details.Type;
const ramSpeed = details.speed || details.Speed;

// ===== RAM TYPE VALIDATION =====
if (ramType ) {
 if (!/^DDR[3-5]$/i.test(ramType.trim())) {
  errors.push("Type must be DDR3, DDR4, or DDR5.");
}
}
// ===== RAM SPEED VALIDATION =====
if (ramSpeed ) {
  if (!/^\d+$/.test(ramSpeed.trim())) {
  errors.push("Speed must be numeric (e.g., 3200).");
}
}

      break;

    case "Hard Disk":
      

      const capacity = details.capacity || details.Capacity;
  const type = details.diskType || details.DiskType;

       // CAPACITY REQUIRED
 if (!capacity || capacity.trim() === "") {
  errors.push("Capacity (GB/TB) is required for Hard Disk.");
} else {
  const match = capacity.match(/^(\d+)\s*(GB|TB)?$/i);
  if (!match) {
    errors.push("Capacity must be numeric (e.g., 500GB or 1TB).");
  } else {
    let value = parseInt(match[1], 10);
    const unit = match[2] ? match[2].toUpperCase() : "GB";

    // Convert TB to GB for limit check
    if (unit === "TB") value *= 1024;

    if (value < 1 || value > 102400) { // 1GB to 100TB
      errors.push("Capacity must be between 1GB and 100TB.");
    }
  }
}

  // TYPE REQUIRED
  if (!type || type.trim() === "") {
    errors.push("Disk type is required (HDD/SSD).");
  }
  // TYPE FORMAT CHECK
  else if (!/^(HDD|SSD)$/i.test(type)) {
    errors.push("Disk type must be HDD or SSD.");
  }
      break;





case "iMac": {
 
  const processor = details.Processor ?? details.processor ?? "";
 

/*   // Model required
  if (!model.trim()) {
    errors.push("Model is required for iMac.");
  } */

  // Processor validation (example: allow Apple Silicon M1/M2/M3, or Intel core i5/i7)
  if (processor) {
    // Example regex: Apple M‑series (M1, M2, M3) or Intel i-series
    const procPattern = /^(m[1-4](\s?(pro|max|ultra)?)|intel\s?core\s?(i3|i5|i7|i9))/i;
    if (!procPattern.test(processor.trim())) {
      errors.push("Processor must be a valid iMac processor (e.g., M1, M2, Intel Core i5).");
    }
  }

// Normalize RAM input
let ramValueRaw =
  (details.RAM ??
   details.Ram ??
   details.ram ??
   details.ramValue ??
   details.RAMValue ??
   "").trim();

// Empty check
if (ramValueRaw) {
 {
  // CASE 1: Only number (e.g., "8")
  const onlyNumberMatch = ramValueRaw.match(/^(\d+)$/);

  if (onlyNumberMatch) {
    ramValueRaw = onlyNumberMatch[1] + " GB";  
  }

  // CASE 2: Number + GB in all formats
  const ramMatch = ramValueRaw.match(/^(\d+)\s*(gb)$/i);

  if (!ramMatch) {
    errors.push("RAM must be numeric in GB for iMac (e.g., 8, 8 GB, 16 GB).");
  } else {
    const ramValue = parseInt(ramMatch[1], 10);
    if (ramValue < 4 || ramValue > 64) {
      errors.push("RAM for iMac must be between 4 GB and 64 GB.");
    }
  }
}
}
  break;
}

case "Apple Laptop": {

  const processor = details.Processor ?? details.processor ?? "";



  if (processor) {
    const procPattern = /^(M[1-4]\s?(Pro|Max)?|Intel\s?Core\s?(i3|i5|i7|i9))/i;
    if (!procPattern.test(processor.trim())) {
      errors.push("Processor must be a valid Apple Laptop processor (e.g., M1, M2 Pro, Intel Core i7).");
    }
  } 

 // Normalize RAM input
const Ram =
  details.RAM ||
  details.Ram ||
  details.ram ||
  details.ramValue ||
  details.memory ||
  details.Memory ||
  details.memorySize ||
  "";

// Trim and validate
const ramValueRaw = Ram.trim();

// Empty check
if (ramValueRaw)  {
  // Validate: 8 GB, 16GB, etc.
  const ramMatch = ramValueRaw.match(/^(\d+)\s*(GB)?$/i);

  if (!ramMatch) {
    errors.push("RAM must be numeric in GB for Apple Laptop (e.g., 8 GB, 16 GB).");
  } else {
    const ramValue = parseInt(ramMatch[1], 10);
    if (ramValue < 4 || ramValue > 128) {
      errors.push("RAM for Apple Laptop must be between 4 GB and 128 GB.");
    }
  }
}


  break;
}


case "all-in-one-pc": {
  const processor = (details.Processor || details.processor || "").trim();
  const ram = (details.RAM || details.ram || "").trim();
  const storage = (details.Storage || details.storage || "").trim();

  // --- Processor (optional but validated if present)
  if (processor !== "") {
    if (!/^[a-zA-Z0-9\s\-]+$/.test(processor)) {
      errors.push(
        "Processor should contain only letters, numbers, spaces, and hyphens (e.g., Intel i5-12400)."
      );
    }
  }

  // --- RAM (optional but validated if present)
  if (ram) {
    const ramMatch = ram.match(/^(\d+)\s*(GB|TB)?$/i);
    if (!ramMatch) {
      errors.push("RAM must be numeric (e.g., 8GB, 16GB, 1TB).");
    } else {
      let ramValue = parseInt(ramMatch[1], 10);
      const unit = ramMatch[2] ? ramMatch[2].toUpperCase() : "GB";
      if (unit === "TB") ramValue *= 1024;
      if (ramValue < 2 || ramValue > 512) {
        errors.push("RAM must be between 2GB and 512GB.");
      }
    }
  }

  // --- Storage (optional but validated if present)
  if (storage !== "") {
    const storageMatch = storage.match(/^(\d+)\s*(GB|TB)?$/i);
    if (!storageMatch) {
      errors.push("Storage must be numeric (e.g., 256GB, 1TB).");
    } else {
      let storageValue = parseInt(storageMatch[1], 10);
      const unit = storageMatch[2] ? storageMatch[2].toUpperCase() : "GB";
      if (unit === "TB") storageValue *= 1024;
      if (storageValue < 64 || storageValue > 10000) {
        errors.push("Storage must be between 64GB and 10TB.");
      }
    }
  }

  break;
}




    case "Monitor":
    // Screen Size validation
  const monitorscreenSize = details.screenSize || details.ScreenSize;
  if (!monitorscreenSize) {
  if (!/^\d+(\.\d+)?$/.test(monitorscreenSize)) {
    errors.push("Screen Size must be a number (e.g., 24, 27.5).");
  } else {
    const sizeValue = parseFloat(monitorscreenSize);
    if (sizeValue < 10 || sizeValue > 100) {
      errors.push("Screen Size must be between 10 and 100 inches.");
    }
  }
  }
  // Resolution validation
  const monitorresolution = details.Resolution || details.resolution;
  if (monitorresolution) {
   if (!/^\d{3,5}\s*([xX*])\s*\d{3,5}$/.test(monitorresolution)) {
    errors.push(
      "Resolution must be in the format WidthxHeight (e.g., 1920x1080)."
    );
  }
}
      break;

   case "Other":

    const deviceName = details.deviceName ||details.DeviceName;
  const specs = details.specs ||details.Specs;

  // Device Name is required
  if (!deviceName || deviceName.trim() === "") {
    errors.push("Device Name is required for Other device type.");
  } else if (!/^[a-zA-Z0-9\s.,\-()]{3,100}$/.test(deviceName.trim())) {
    errors.push(
      "Device Name must be meaningful, using letters, numbers, and common punctuation (3-100 characters)."
    );
  }

  // Specs is optional but validate if provided
  if (specs && specs.trim() !== "") {
    if (!/^[a-zA-Z0-9\s.,\-()]{3,300}$/.test(specs.trim())) {
      errors.push(
        "Key Specifications must be meaningful, using letters, numbers, and common punctuation (3-300 characters)."
      );
    }
  }
  

    default:
      break;
  }

  return errors;
};

// =========================
// 🚀 POST /api/sell-device
// =========================

router.post("/sell-device", upload.array("images", 5), async (req, res) => {
  try {
    const { name, email, phone, deviceType, condition, price, details } = req.body;

    const errors = [];

    // --- Basic Field Validation ---
    if (!name?.trim()) {
      errors.push("Name is required.");
    } else {
      const nameRegex = /^(?:[A-Za-z]\.?)(?:\s?[A-Za-z]+){0,2}$/;
      if (name.length < 2 || name.length > 50) errors.push("Name must be between 2 and 50 characters.");
      else if (!nameRegex.test(name.trim())) errors.push("Enter a valid name (e.g., A.Name or A Name). Only letters, one period, and single spaces are allowed.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.trim()) errors.push("Email is required.");
    else if (!emailRegex.test(email)) errors.push("Invalid email format.");

    const phoneRegex = /^(?:\+91|91)?(?!([6-9])\1{9})[6-9]\d{9}$/;
    if (!phone?.trim()) errors.push("Phone number is required.");
    else if (!phoneRegex.test(phone)) errors.push("Invalid Indian phone number format.");

    const allowedDeviceTypes = [
      "Laptop", "Desktop", "Printer", "Mobile", "Tablet", "TV",
      "iPhone", "iMac", "Apple Laptop", "CPU", "RAM",
      "Hard Disk", "All-in-One PC", "Monitor", "Other",
    ];
    if (!deviceType?.trim()) errors.push("Device type is required.");
    else if (!allowedDeviceTypes.includes(deviceType)) errors.push("Invalid device type selected.");

    if (!condition?.trim()) errors.push("Condition is required.");

    if (!price?.trim()) errors.push("Price is required.");
    else {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0) errors.push("Price must be a valid positive number.");
      else if (!/^\d{1,6}(\.\d{1,2})?$/.test(price)) errors.push("Price must be a valid number up to 6 digits (e.g., 50000 or 49999.99).");
      else if (numericPrice > 1000000) errors.push("Price cannot exceed ₹10,00,000.");
    }

    // --- Details Validation (JSON-based) ---
    let parsedDetails = {};
    if (details) {
      try {
        parsedDetails = JSON.parse(details);
      } catch {
        // ✅ CORRECTED: send HTTP response, not return array
        return res.status(400).json({ error: "Invalid details format. Please provide valid JSON data." });
      }

      // Normalize keys
      const normalizedDetails = {};
      for (const key in parsedDetails) {
        const normalizedKey = key.trim().replace(/\s+/g, " ").replace(/(^\w|\s\w)/g, (ch) => ch.toUpperCase());
        normalizedDetails[normalizedKey] = parsedDetails[key];
      }


     const categoryKey = deviceType.toLowerCase();

// BRAND & MODEL VALIDATION
const brandCheck = validateBrandAndModel(
  normalizedDetails.Brand || "",
  normalizedDetails.Model || "",
  categoryKey
);



if (!brandCheck.valid) {
  errors.push(brandCheck.message);
}
      const deviceDetailErrors = validateDeviceDetails(deviceType, normalizedDetails);
      if (deviceDetailErrors.length > 0) errors.push(...deviceDetailErrors); 

     
    }

    // If validation failed
    if (errors.length > 0) return res.status(400).json({ error: errors[0] });

    // Save to DB
   const imagePaths = req.files?.map((file) => file.filename) || [];
const newDevice = new Device({
  name,
  email,
  phone,
  deviceType,
  condition,
  price: Number(price),          // typecast to Number
  details: parsedDetails || {},  // ensure object
  images: imagePaths,
});


    await newDevice.save();
    return res.status(201).json({ message: "✅ Device submitted successfully!", deviceId: newDevice._id });

  } catch (err) {
    console.error("❌ Backend Error while saving device:", err);
    return res.status(500).json({ message: "Server error while saving device.", error: err.message });
  }
});


// =========================
// 📄 GET /api/sell-device
// =========================
router.get("/sell-device", async (req, res) => {
  try {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.status(200).json(devices);
  } catch (err) {
    console.error("❌ Error fetching submissions:", err.message);
    res.status(500).json({ message: "Failed to fetch submissions" });
  }
});

module.exports = router;
