import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  userId: Types.ObjectId;
  tier: 'free' | 'basic' | 'premium';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  paymentId?: string;
  features: {
    dailyQueryLimit: number;
    voiceEnabled: boolean;
    prioritySupport: boolean;
    marketplaceAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TIER_FEATURES = {
  free: { dailyQueryLimit: 10, voiceEnabled: false, prioritySupport: false, marketplaceAccess: true },
  basic: { dailyQueryLimit: 100, voiceEnabled: true, prioritySupport: false, marketplaceAccess: true },
  premium: { dailyQueryLimit: -1, voiceEnabled: true, prioritySupport: true, marketplaceAccess: true },
};

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    paymentId: String,
    features: {
      dailyQueryLimit: { type: Number, default: 20 },
      voiceEnabled: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      marketplaceAccess: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.pre('save', function (next) {
  if (this.isModified('tier')) {
    this.features = TIER_FEATURES[this.tier];
  }
  next();
});

export { TIER_FEATURES };
export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
