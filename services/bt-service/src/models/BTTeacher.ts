import mongoose, { Document, Schema } from 'mongoose';

export interface IBTTeacher extends Document {
  churchManagerId: string; // ChurchManager ID 참조
  eventId: string;
  teacherName: string;
  teacherPhone: string;
  teacherEmail: string;
  position?: string; // 교회 내 직책
  experience?: string; // 교육 경력
  specialNotes?: string; // 특이사항
  registrationDate: Date;
  status: 'registered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BTTeacherSchema: Schema = new Schema({
  churchManagerId: {
    type: String,
    required: true,
    ref: 'ChurchManager',
  },
  eventId: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
    trim: true,
  },
  teacherPhone: {
    type: String,
    required: true,
    trim: true,
  },
  teacherEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
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
  specialNotes: {
    type: String,
    trim: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled'],
    default: 'registered',
  },
}, {
  timestamps: true,
});

// 인덱스
BTTeacherSchema.index({ churchManagerId: 1 });
BTTeacherSchema.index({ eventId: 1 });
BTTeacherSchema.index({ teacherEmail: 1 });

export default mongoose.model<IBTTeacher>('BTTeacher', BTTeacherSchema);
