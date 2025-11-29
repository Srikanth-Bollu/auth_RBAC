// models/User.js
import mongoose from "mongoose";

/**
 * User schema:
 * - name, email, password (hashed), role (user/admin)
 * - refreshTokens: array of strings (we store active refresh tokens to allow revocation)
 */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  refreshTokens: { type: [String], default: [] } // store issued refresh tokens
}, { timestamps: true });

export default mongoose.model("User", userSchema);
