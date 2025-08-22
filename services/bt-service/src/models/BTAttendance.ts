import mongoose, { Document, Schema } from 'mongoose';

export interface IBTAttendance extends Document {
  teacherId: Schema.Types.ObjectId; // 교사 ID
  keyCode: string; // 사용된 키 코드
  eventId: string; // 이벤트 ID
  sessionId: string; // 세션 ID (예: "2025-01-15-AM")
  sessionType: 'morning' | 'afternoon' | 'evening' | 'full-day'; // 세션 타입
  checkInTime: Date; // 체크인 시간
  checkOutTime?: Date; // 체크아웃 시간
  location: string; // 출결 장소
  method: 'qr' | 'manual' | 'admin'; // 출결 방법
  status: 'present' | 'late' | 'absent' | 'early-leave'; // 출결 상태
  notes?: string; // 특이사항
  verifiedBy?: Schema.Types.ObjectId; // 확인자 ID
  verifiedAt?: Date; // 확인 시간
  createdAt: Date;
  updatedAt: Date;
}

const BTAttendanceSchema: Schema = new Schema({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'BTTeacher',
    required: true,
  },
  keyCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  eventId: {
    type: String,
    required: true,
    trim: true,
  },
  sessionId: {
    type: String,
    required: true,
    trim: true,
  },
  sessionType: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'full-day'],
    required: true,
  },
  checkInTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  checkOutTime: {
    type: Date,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  method: {
    type: String,
    enum: ['qr', 'manual', 'admin'],
    required: true,
    default: 'qr',
  },
  status: {
    type: String,
    enum: ['present', 'late', 'absent', 'early-leave'],
    required: true,
    default: 'present',
  },
  notes: {
    type: String,
    trim: true,
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // 관리자 사용자
  },
  verifiedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// 인덱스
BTAttendanceSchema.index({ teacherId: 1 });
BTAttendanceSchema.index({ keyCode: 1 });
BTAttendanceSchema.index({ eventId: 1 });
BTAttendanceSchema.index({ sessionId: 1 });
BTAttendanceSchema.index({ checkInTime: 1 });
BTAttendanceSchema.index({ status: 1 });
BTAttendanceSchema.index({ teacherId: 1, sessionId: 1 }, { unique: true }); // 한 세션에 한 번만 출결 가능

// 출결 시간 계산 메서드
BTAttendanceSchema.methods.getDuration = function(): number {
  if (!this.checkOutTime) return 0;
  return Math.floor((this.checkOutTime.getTime() - this.checkInTime.getTime()) / (1000 * 60)); // 분 단위
};

// 지각 여부 확인 메서드
BTAttendanceSchema.methods.isLate = function(): boolean {
  const checkInHour = this.checkInTime.getHours();
  const checkInMinute = this.checkInTime.getMinutes();
  
  // 오전 세션: 9시 10분 이후 지각
  if (this.sessionType === 'morning') {
    return checkInHour > 9 || (checkInHour === 9 && checkInMinute > 10);
  }
  
  // 오후 세션: 14시 10분 이후 지각
  if (this.sessionType === 'afternoon') {
    return checkInHour > 14 || (checkInHour === 14 && checkInMinute > 10);
  }
  
  return false;
};

// 출결 상태 자동 업데이트
BTAttendanceSchema.pre('save', function(next) {
  if (this.isNew && this.isLate()) {
    this.status = 'late';
  }
  next();
});

export default mongoose.model<IBTAttendance>('BTAttendance', BTAttendanceSchema);
