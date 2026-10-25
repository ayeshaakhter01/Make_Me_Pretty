import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    recipientName: { type: String, trim: true },
    phone: { type: String, trim: true },
    addressLine: { type: String, trim: true, required: true },
    area: { type: String, trim: true },
    city: { type: String, trim: true },
    isDefault: { type: Boolean, default: false }
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    role: {
      type: String,
      enum: ["customer", "admin", "deliveryPartner"],
      default: "customer"
    },
    phone: { type: String, trim: true },
    addresses: { type: [addressSchema], default: [] },
    // Email verification. Old and staff accounts have no value saved, so they count as verified.
    emailVerified: { type: Boolean, default: true },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
