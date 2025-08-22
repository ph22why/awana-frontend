import mongoose, { Document, Schema } from 'mongoose';

export interface IBTTeacher extends Document {
  keyCode: string; // 할당된 키 코드
  churchManagerId?: Schema.Types.ObjectId; // 교회담당자 ID (교회 소속인 경우)
  eventId: string; // 이벤트 ID
  teacherName: string;
  teacherPhone: string;
  teacherEmail: string;
  address?: string;
  churchName?: string; // 소속 교회
  position?: string; // 교회 내 직책
  experience?: string; // 교육 경력
  motivation: string; // 참가 동기
  qrCode: string; // 생성된 QR 코드
  qrGeneratedAt: Date; // QR 생성 시간
  registrationDate: Date;
  status: 'registered' | 'active' | 'cancelled' | 'expired';
  attendanceRecords?: Schema.Types.ObjectId[]; // 출결 기록 참조
  lastAttendanceDate?: Date; // 마지막 출결일
  createdAt: Date;
  updatedAt: Date;
}

const BTTeacherSchema: Schema = new Schema({
  keyCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v: string) {
        return /^BT\d{4}-CH\d{3}-\d{3}$/.test(v);
      },
      message: '키 코드 형식이 올바르지 않습니다'
    }
  },
  churchManagerId: {
    type: Schema.Types.ObjectId,
    ref: 'ChurchManager',
  },
  eventId: {
    type: String,
    required: true,
    trim: true,
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
    validate: {
      validator: function(v: string) {
        return /^\d{3}-\d{3,4}-\d{4}$/.test(v);
      },
      message: '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'
    }
  },
  teacherEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, '유효한 이메일 주소를 입력해주세요'],
  },
  address: {
    type: String,
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
  motivation: {
    type: String,
    required: true,
    trim: true,
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  qrGeneratedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['registered', 'active', 'cancelled', 'expired'],
    default: 'registered',
  },
  attendanceRecords: [{
    type: Schema.Types.ObjectId,
    ref: 'BTAttendance',
  }],
  lastAttendanceDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

// 인덱스
BTTeacherSchema.index({ keyCode: 1 }, { unique: true });
BTTeacherSchema.index({ qrCode: 1 }, { unique: true });
BTTeacherSchema.index({ churchManagerId: 1 });
BTTeacherSchema.index({ eventId: 1 });
BTTeacherSchema.index({ teacherEmail: 1 });
BTTeacherSchema.index({ teacherPhone: 1 });
BTTeacherSchema.index({ status: 1 });

// QR 코드 생성 메서드
BTTeacherSchema.methods.generateQRCode = function(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${this.keyCode}-${this.teacherName.slice(0, 2)}-${timestamp}-${random}`.toUpperCase();
};

// 출결 상태 확인 메서드
BTTeacherSchema.methods.getAttendanceStatus = function(): 'active' | 'inactive' | 'expired' {
  if (this.status === 'expired') return 'expired';
  if (this.lastAttendanceDate) {
    const daysSinceLastAttendance = Math.floor((Date.now() - this.lastAttendanceDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastAttendance <= 30 ? 'active' : 'inactive';
  }
  return 'inactive';
};

export default mongoose.model<IBTTeacher>('BTTeacher', BTTeacherSchema);
