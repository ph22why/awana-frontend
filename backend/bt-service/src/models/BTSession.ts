import mongoose, { Document, Schema } from 'mongoose';

export interface IBTSession extends Document {
  sessionId: string; // 고유 세션 ID (예: "2025-01-15-AM")
  title: string; // 세션 제목
  description: string; // 세션 설명
  sessionType: 'morning' | 'afternoon' | 'evening' | 'full-day'; // 세션 타입
  date: Date; // 세션 날짜
  startTime: string; // 시작 시간 (HH:mm 형식)
  endTime: string; // 종료 시간 (HH:mm 형식)
  location: string; // 장소
  maxParticipants: number; // 최대 참가자 수
  currentParticipants: number; // 현재 참가자 수
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'; // 세션 상태
  eventId: string; // 이벤트 ID
  instructors?: string[]; // 강사 목록
  materials?: string[]; // 교육 자료
  requirements?: string; // 참가 요구사항
  createdBy: Schema.Types.ObjectId; // 생성자 ID
  createdAt: Date;
  updatedAt: Date;
  // 인스턴스 메서드
  activate(): Promise<IBTSession>;
  complete(): Promise<IBTSession>;
  cancel(): Promise<IBTSession>;
  updateParticipantCount(increment?: number): Promise<IBTSession>;
}

export interface IBTSessionModel extends mongoose.Model<IBTSession> {
  generateSessionId(date: Date, sessionType: string): string;
}

const BTSessionSchema: Schema = new Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v: string) {
        // 날짜-세션타입 형식 검증 (예: 2025-01-15-AM)
        return /^\d{4}-\d{2}-\d{2}-(AM|PM|MORNING|AFTERNOON|EVENING|FULL)$/.test(v);
      },
      message: '세션 ID 형식이 올바르지 않습니다 (예: 2025-01-15-AM)'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  sessionType: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'full-day'],
    required: true,
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(v: Date) {
        // 미래 날짜만 허용
        return v >= new Date(new Date().setHours(0, 0, 0, 0));
      },
      message: '세션 날짜는 현재 날짜 이후여야 합니다.'
    }
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: '시작 시간 형식이 올바르지 않습니다 (HH:mm)'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: '종료 시간 형식이 올바르지 않습니다 (HH:mm)'
    }
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 1,
    max: 500,
    default: 50,
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  eventId: {
    type: String,
    required: true,
    trim: true,
  },
  instructors: [{
    type: String,
    trim: true,
  }],
  materials: [{
    type: String,
    trim: true,
  }],
  requirements: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// 인덱스
BTSessionSchema.index({ sessionId: 1 }, { unique: true });
BTSessionSchema.index({ eventId: 1 });
BTSessionSchema.index({ date: 1 });
BTSessionSchema.index({ status: 1 });
BTSessionSchema.index({ createdBy: 1 });
BTSessionSchema.index({ sessionType: 1 });

// 가상 필드: 참가 가능 여부
BTSessionSchema.virtual('isAvailable').get(function(this: any) {
  return this.currentParticipants < this.maxParticipants && this.status === 'scheduled';
});

// 가상 필드: 참가율
BTSessionSchema.virtual('participationRate').get(function(this: any) {
  if (this.maxParticipants === 0) return 0;
  return Math.round((this.currentParticipants / this.maxParticipants) * 100);
});

// 가상 필드: 세션 지속 시간 (분)
BTSessionSchema.virtual('durationMinutes').get(function(this: any) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  return endMinutes - startMinutes;
});

// 세션 ID 자동 생성 메서드
BTSessionSchema.statics.generateSessionId = function(date: Date, sessionType: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const type = sessionType.toUpperCase();
  return `${year}-${month}-${day}-${type}`;
};

// 세션 활성화 메서드
BTSessionSchema.methods.activate = function(this: any) {
  this.status = 'active';
  return this.save();
};

// 세션 완료 처리 메서드
BTSessionSchema.methods.complete = function(this: any) {
  this.status = 'completed';
  return this.save();
};

// 세션 취소 메서드
BTSessionSchema.methods.cancel = function(this: any) {
  this.status = 'cancelled';
  return this.save();
};

// 참가자 수 업데이트 메서드
BTSessionSchema.methods.updateParticipantCount = function(this: any, increment: number = 1) {
  this.currentParticipants = Math.max(0, this.currentParticipants + increment);
  return this.save();
};

// 유효성 검사: 종료 시간이 시작 시간보다 늦은지 확인
BTSessionSchema.pre('save', function(this: any, next: (error?: Error) => void) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];
  
  if (endMinutes <= startMinutes) {
    const error = new Error('종료 시간은 시작 시간보다 늦어야 합니다.');
    return next(error);
  }
  
  next();
});

export default mongoose.model<IBTSession, IBTSessionModel>('BTSession', BTSessionSchema);
