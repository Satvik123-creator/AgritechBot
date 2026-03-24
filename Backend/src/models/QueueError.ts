import mongoose, { Schema, Document } from 'mongoose';

export interface IQueueError extends Document {
  jobId?: string;
  queueName: string;
  data: Record<string, unknown>;
  errorReason: string;
  failedAt: Date;
  resolved: boolean;
}

const queueErrorSchema = new Schema<IQueueError>(
  {
    jobId: String,
    queueName: { type: String, required: true, index: true },
    data: { type: Schema.Types.Mixed }, // Payload from the failed job
    errorReason: { type: String, required: true },
    failedAt: { type: Date, default: Date.now, index: true },
    resolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const QueueError = mongoose.model<IQueueError>('QueueError', queueErrorSchema);
