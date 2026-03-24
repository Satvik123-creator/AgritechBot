import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firebaseUid?: string;
  phone: string;
  name?: string;
  role: 'user' | 'admin';
  language: string;
  location?: {
    state?: string;
    district?: string;
  };
  crops?: string[];
  landSize?: number;
  landUnit?: string;
  otp?: string;
  otpExpiresAt?: Date;
  isVerified: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  createdAt: Date;
  updatedAt: Date;
  compareOtp(candidateOtp: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^\+?[1-9]\d{9,14}$/,
    },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    language: {
      type: String,
      default: 'Hindi',
    },
    location: {
      state: String,
      district: String,
      latitude: Number,
      longitude: Number,
      address: String,
    },
    crops: [String],
    landSize: Number,
    landUnit: String,
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
    subscriptionTier: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('otp') || !this.otp) return next();
  this.otp = await bcrypt.hash(this.otp, 10);
  next();
});

userSchema.methods.compareOtp = async function (candidateOtp: string): Promise<boolean> {
  if (!this.otp) return false;
  return bcrypt.compare(candidateOtp, this.otp);
};

export const User = mongoose.model<IUser>('User', userSchema);
