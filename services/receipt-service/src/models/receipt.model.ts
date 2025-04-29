import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  churchId: string;
  churchName: string;
  managerPhone: string;
  partTotal: number;
  partStudent: number;
  partTeacher: number;
  partYM: number;
  costs: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReceiptSchema: Schema = new Schema({
  churchId: { type: String, required: true },
  churchName: { type: String },
  managerPhone: { type: String, required: true },
  partTotal: { type: Number, required: true },
  partStudent: { type: Number, required: true },
  partTeacher: { type: Number, required: true },
  partYM: { type: Number, required: true },
  costs: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IEvent>('Event', ReceiptSchema); 