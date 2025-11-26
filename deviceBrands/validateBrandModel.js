// Import all brand-model files
const desktopBrands = require("./desktopBrands");
const laptopBrands = require("./laptopBrands");
const monitorBrands = require("./monitorBrands");
const printerBrands = require("./printerBrands");
const mobileBrands = require("./mobileBrands");
const tabletBrands = require("./tabletBrands");
const tvBrands = require("./tvBrands");
const cpuBrands = require("./cpuBrands");
const ramBrands = require("./ramBrands");
const harddiskBrands = require("./harddiskBrands");
const iMacBrands = require("./iMacBrands");
const appleLaptopBrands = require("./AppleLaptopBrands");

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

function validateBrandModel(brand, model, category) {
  let brandList;
switch (category.toLowerCase()) {
  case "desktop": 
    brandList = desktopBrands; 
    break;
  case "laptop": 
    brandList = laptopBrands; 
    break;
  case "monitor": 
    brandList = monitorBrands; 
    break;
  case "printer": 
    brandList = printerBrands; 
    break;
  case "mobile": 
    brandList = mobileBrands; 
    break;
  case "tablet": 
    brandList = tabletBrands; 
    break;
  case "tv": 
    brandList = tvBrands; 
    break;
  case "cpu": 
    brandList = cpuBrands; 
    break;
  case "ram": 
    brandList = ramBrands; 
    break;
  case "hard disk": 
    brandList = harddiskBrands; 
    break;
  case "iphone":
    return validateIphone(model);
    case "imac":
      brandList = iMacBrands;
      break;
    case "apple laptop":
      brandList = appleLaptopBrands;
      break;

  case "other":
    // Skip brand/model validation for Other devices
    return { valid: true, message: "Other category - no brand/model validation required." };
    case "all-in-one pc":
      // Combine desktop and laptop brands for validation
      brandList = [...desktopBrands, ...laptopBrands];
      break;
  default:
    return { valid: false, message: `Invalid category '${category}'` };
}

  // Convert list to { brand: [models...] }
  const brandData = Array.isArray(brandList)
    ? brandList.reduce((acc, item) => {
        acc[item.brand.toLowerCase()] = item.models.map(m => m.toLowerCase());
        return acc;
      }, {})
    : {};

    // If brand is optional and user leaves it empty → SKIP validation
if (!brand || brand.trim() === "") {
  return { valid: true, message: "Brand and model skipped (optional fields)." };
}
 // Validate brand
  const brandKey = brand.toLowerCase();
  if (!brandData[brandKey]) {
    return { valid: false, message: `Brand '${brand}' is not valid for '${category}'.` };
  }
    // --- Check for empty model ---
  if (!model || model.trim() === "") {
    return { valid: false, message: `Please enter a model for brand '${brand}'.` };
  }
 

  // Validate model
  if (!brandData[brandKey].includes(model.toLowerCase())) {
    return { valid: false, message: `Model '${model}' is not valid for brand '${brand}'.` };
  }

  return { valid: true, message: "Brand and model are valid" };
}



function validateIphone(model) {
  if (!model || model.trim() === "") {
    return { valid: false, message: "iPhone model is required." };
  }

  const inputModel = model.trim();

  if (!iPhoneModels.includes(inputModel)) {
    return { valid: false, message: `Model '${inputModel}' is not a valid iPhone model.` };
  }

  return { valid: true, message: "Valid iPhone model." };
}


module.exports = validateBrandModel;
