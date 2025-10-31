import mongoose, { Document, Schema } from 'mongoose';

export interface IIndividualTeacher extends Document {
  name: string;
  phone: string;
  email: string;
  address: string;
  churchName?: string;
  position?: string;
  experience?: string;
  certification?: string;
  motivation: string;
  registrationDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const IndividualTeacherSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  churchName: {
    type: String,
    trim: true,
  },
  position: {
    type: String,
    enum: ['교사', '전도사', '목사', '장로', '권사', '집사', '기타'],
    trim: true,
  },
  experience: {
    type: String,
    trim: true,
  },
  certification: {
    type: String,
    trim: true,
  },
  motivation: {
    type: String,
    required: true,
    trim: true,
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
IndividualTeacherSchema.index({ name: 1 });
IndividualTeacherSchema.index({ email: 1 });
IndividualTeacherSchema.index({ registrationDate: -1 });

export default mongoose.model<IIndividualTeacher>('IndividualTeacher', IndividualTeacherSchema);
