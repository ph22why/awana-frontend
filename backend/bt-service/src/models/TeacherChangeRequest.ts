import mongoose, { Document, Schema } from 'mongoose';

export interface ITeacherChangeRequest extends Document {
  churchManagerId: Schema.Types.ObjectId;
  requestType: 'add' | 'delete' | 'modify';
  teacherData: {
    id: number;
    key: string;
    name: string;
    phone: string;
    originalData?: any; // 수정/삭제 시 원본 데이터
  };
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Date;
  processedDate?: Date;
  processedBy?: Schema.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherChangeRequestSchema: Schema = new Schema({
  churchManagerId: {
    type: Schema.Types.ObjectId,
    ref: 'ChurchManager',
    required: true,
  },
  requestType: {
    type: String,
    enum: ['add', 'delete', 'modify'],
    required: true,
  },
  teacherData: {
    id: Number,
    key: String,
    name: String,
    phone: String,
    originalData: Schema.Types.Mixed,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  processedDate: {
    type: Date,
  },
  processedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// 인덱스
TeacherChangeRequestSchema.index({ churchManagerId: 1 });
TeacherChangeRequestSchema.index({ status: 1 });
TeacherChangeRequestSchema.index({ requestDate: -1 });

export default mongoose.model<ITeacherChangeRequest>('TeacherChangeRequest', TeacherChangeRequestSchema);
