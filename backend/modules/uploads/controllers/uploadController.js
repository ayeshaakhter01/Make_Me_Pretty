
import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const formats = {
  "image/jpeg": {
    valid: (b) =>
      b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  "image/png": {
    valid: (b) =>
      b.subarray(0, 8).equals(
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
      ),
  },
  "image/webp": {
    valid: (b) =>
      b.toString("ascii", 0, 4) === "RIFF" &&
      b.toString("ascii", 8, 12) === "WEBP",
  },
};

export async function uploadImage(req, res, next) {
  try {
    const format = formats[req.headers["content-type"]];
    const file = req.body;

    if (
      !format ||
      !Buffer.isBuffer(file) ||
      file.length < 16 ||
      file.length > 10 * 1024 * 1024 ||
      !format.valid(file)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Choose a valid JPG, PNG, or WEBP image up to 10 MB.",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "make-me-pretty",
          resource_type: "image",
        },
        (error, uploadedImage) => {
          if (error) {
            reject(error);
          } else {
            resolve(uploadedImage);
          }
        }
      );

      Readable.from([file]).pipe(stream);
    });

    return res.status(201).json({
      success: true,
      data: {
        url: result.secure_url,
      },
    });
  } catch (error) {
    return next(error);
  }
}
