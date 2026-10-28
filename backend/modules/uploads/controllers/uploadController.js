import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../uploads");
const formats = {
  "image/jpeg": { ext: ".jpg", valid: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  "image/png": { ext: ".png", valid: (b) => b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) },
  "image/webp": { ext: ".webp", valid: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
};

export async function uploadImage(req, res, next) {
  try {
    const format = formats[req.headers["content-type"]];
    const file = req.body;
    if (!format || !Buffer.isBuffer(file) || file.length < 16 || file.length > 10 * 1024 * 1024 || !format.valid(file)) {
      return res.status(400).json({ success: false, message: "Choose a valid JPG, PNG, or WEBP image up to 10 MB." });
    }
    await mkdir(uploadDir, { recursive: true });
    const name = `${randomUUID()}${format.ext}`;
    await writeFile(path.join(uploadDir, name), file, { flag: "wx" });
    return res.status(201).json({ success: true, data: { url: `/uploads/${name}` } });
  } catch (error) { return next(error); }
}
