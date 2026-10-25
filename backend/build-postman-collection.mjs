import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(root, "collection", "Ayesha - Orders Payments Coupons Reports");
const outputPath = path.join(root, "Ayesha - Orders Payments Coupons Reports.postman_collection.json");
const sharedEnvironmentVariables = new Set([
  "baseUrl",
  "customerEmail",
  "customerPassword",
  "adminEmail",
  "adminPassword",
  "deliveryEmail",
  "deliveryPassword",
  "customerToken",
  "adminToken",
  "deliveryPartnerToken",
  "productId",
  "token",
]);
const folderFiles = [
  "0 Setup.json",
  "1 Orders (COD).json",
  "2 Payments (SSLCommerz).json",
  "3 Coupons.json",
  "4 Reports.json",
  "5 Share Your Experience.json",
  "6 Contact.json",
];

const items = [];
const variables = new Map();

for (const file of folderFiles) {
  const fragment = JSON.parse(fs.readFileSync(path.join(sourceDir, file), "utf8"));
  if (typeof fragment.name !== "string" || !Array.isArray(fragment.item)) {
    throw new Error(`${file} must contain a folder name and an item array.`);
  }

  for (const variable of fragment.collectionVariables ?? []) {
    if (sharedEnvironmentVariables.has(variable.key)) {
      throw new Error(`${variable.key} belongs in the Local environment, not collection variables.`);
    }
    if (!variables.has(variable.key)) variables.set(variable.key, variable);
  }

  items.push({ name: fragment.name, item: fragment.item });
}

const collection = {
  info: {
    name: "Ayesha - Orders Payments Coupons Reports",
    description: "Make Me Pretty API requests grouped into Setup, Orders/COD, SSLCommerz Payments, Coupons, Reports, Share Your Experience, and Contact messages.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  item: items,
  variable: [...variables.values()],
};

fs.writeFileSync(outputPath, `${JSON.stringify(collection, null, 2)}\n`);
console.log(`Built Postman collection: ${outputPath}`);
