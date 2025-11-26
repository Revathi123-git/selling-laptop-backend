const express = require("express");
const router = express.Router();

// Import all brand/model lists
const laptop = require("../deviceBrands/laptopBrands");
const desktop = require("../deviceBrands/desktopBrands");
const appleLaptop = require("../deviceBrands/AppleLaptopBrands");
const imac = require("../deviceBrands/iMacBrands");
const cpuBrands = require("../deviceBrands/cpuBrands");
const harddisk = require("../deviceBrands/harddiskBrands");
const mobile = require("../deviceBrands/mobileBrands");
const monitor = require("../deviceBrands/monitorBrands");
const printer = require("../deviceBrands/printerBrands");
const ram = require("../deviceBrands/ramBrands");
const tablet = require("../deviceBrands/tabletBrands");
const tv = require("../deviceBrands/tvBrands");

// Add iPhone manually
const iPhoneModels = [
  "iPhone 6", "iPhone 6 Plus",
  "iPhone 6S", "iPhone 6S Plus",
  "iPhone 7", "iPhone 7 Plus",
  "iPhone 8", "iPhone 8 Plus",
  "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12", "iPhone 12 Mini", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13", "iPhone 13 Mini", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"
];

// Build final mapping
const DEVICE_BRAND_MAP = {
  Laptop: laptop,
  Desktop: desktop,
  "Apple Laptop": appleLaptop,
  "All-in-One PC": [...desktop, ...imac],
  iMac: imac,
  CPU: cpuBrands,
  "Hard Disk": harddisk,
  Mobile: mobile,
  iPhone: iPhoneModels,
  Monitor: monitor,
  Printer: printer,
  RAM: ram,
  Tablet: tablet,
  TV: tv
};

// API route
router.get("/brands", (req, res) => {
  res.json(DEVICE_BRAND_MAP);
});

module.exports = router;
