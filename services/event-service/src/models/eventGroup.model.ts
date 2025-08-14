import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEventGroup extends Document {
  name: string;
  location?: string;
  eventIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventGroupSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String },
  eventIds: [{ type: Schema.Types.ObjectId, ref: 'Event', required: true }],
}, {
  timestamps: true
});

EventGroupSchema.index({ name: 1 }, { unique: false });

export default mongoose.model<IEventGroup>('EventGroup', EventGroupSchema);


