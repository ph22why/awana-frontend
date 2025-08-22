import mongoose, { Document, Schema } from 'mongoose';

export interface IChurchManager extends Document {
  churchName: string;
  churchAddress: string;
  churchPhone: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  participants?: number;
  registrationDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const ChurchManagerSchema: Schema = new Schema({
  churchName: {
    type: String,
    required: true,
    trim: true,
  },
  churchAddress: {
    type: String,
    required: true,
    trim: true,
  },
  churchPhone: {
    type: String,
    required: true,
    trim: true,
  },
  managerName: {
    type: String,
    required: true,
    trim: true,
  },
  managerPhone: {
    type: String,
    required: true,
    trim: true,
  },
  managerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  participants: {
    type: Number,
    min: 0,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Index for search
ChurchManagerSchema.index({ churchName: 1 });
ChurchManagerSchema.index({ managerEmail: 1 });
ChurchManagerSchema.index({ registrationDate: -1 });

export default mongoose.model<IChurchManager>('ChurchManager', ChurchManagerSchema);
