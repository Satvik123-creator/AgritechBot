import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IImageAnalysis extends Document {
  userId: Types.ObjectId;
  imageUri?: string;
  imageBase64?: string; // Optional: if we store small previews or the full image
  diagnosis: string;
  cropType?: string;
  severity?: 'Low' | 'Moderate' | 'High';
  treatment?: string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: {
    processingTimeMs?: number;
    modelVersion?: string;
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const imageAnalysisSchema = new Schema<IImageAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUri: {
      type: String,
    },
    imageBase64: {
      type: String,
      required: false,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    cropType: {
      type: String,
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High'],
    },
    treatment: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    metadata: {
      processingTimeMs: Number,
      modelVersion: String,
      language: String,
    },
  },
  {
    timestamps: true,
  }
);

imageAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const ImageAnalysis = mongoose.model<IImageAnalysis>('ImageAnalysis', imageAnalysisSchema);
