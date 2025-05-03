import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  event_Name: string;
  event_Description?: string;
  event_Location: string;
  event_Year: number;
  event_Start_Date: Date;
  event_End_Date: Date;
  event_Registration_Start_Date: Date;
  event_Registration_End_Date: Date;
  event_Open_Available: string;
  event_Place: string;
  event_Month: number;
  event_Link?: string;
  event_Registration_Start_Time?: string;
  event_Registration_End_Time?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema({
  event_Name: { type: String, required: true },
  event_Description: { type: String },
  event_Location: { type: String, required: true },
  event_Year: { type: Number, required: true },
  event_Start_Date: { type: Date, required: true },
  event_End_Date: { type: Date, required: true },
  event_Registration_Start_Date: { type: Date, required: true },
  event_Registration_End_Date: { type: Date, required: true },
  event_Open_Available: { type: String, enum: ['공개', '비공개'], default: '비공개' },
  event_Place: { type: String, required: true },
  event_Month: { type: Number, required: true },
  event_Link: { type: String },
  event_Registration_Start_Time: { type: String },
  event_Registration_End_Time: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<IEvent>('Event', EventSchema); 