import mongoose, { Document, Schema } from 'mongoose';

export interface IBTKey extends Document {
  keyCode: string; // 고유 키 코드 (예: BT2025-CH001-001)
  churchManagerId: Schema.Types.ObjectId; // 교회담당자 ID
  eventId: string; // 이벤트 ID (예: "하반기 BT 2025")
  keyType: 'church' | 'individual'; // 키 타입
  status: 'available' | 'assigned' | 'used' | 'expired'; // 키 상태
  assignedTeacherId?: Schema.Types.ObjectId; // 할당된 교사 ID
  assignedDate?: Date; // 할당 날짜
  usedDate?: Date; // 사용 날짜 (QR 생성 시)
  qrCode?: string; // 생성된 QR 코드
  qrGeneratedAt?: Date; // QR 생성 시간
  expiresAt: Date; // 키 만료일
  metadata?: {
    churchName?: string;
    churchId?: string;
    managerPhone?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  // 인스턴스 메서드
  isExpired(): boolean;
  isAvailable(): boolean;
}

export interface IBTKeyModel extends mongoose.Model<IBTKey> {
  generateKeyCode(churchId: string, sequence: number): string;
}

const BTKeySchema: Schema = new Schema({
  keyCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v: string) {
        // BT2025-CH001-001 형식 검증
        return /^BT\d{4}-CH\d{3}-\d{3}$/.test(v);
      },
      message: '키 코드 형식이 올바르지 않습니다 (예: BT2025-CH001-001)'
    }
  },
  churchManagerId: {
    type: Schema.Types.ObjectId,
    ref: 'ChurchManager',
    required: true,
  },
  eventId: {
    type: String,
    required: true,
    trim: true,
  },
  keyType: {
    type: String,
    enum: ['church', 'individual'],
    default: 'church',
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'used', 'expired'],
    default: 'available',
  },
  assignedTeacherId: {
    type: Schema.Types.ObjectId,
    ref: 'BTTeacher',
  },
  assignedDate: {
    type: Date,
  },
  usedDate: {
    type: Date,
  },
  qrCode: {
    type: String,
    trim: true,
  },
  qrGeneratedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // 기본적으로 1년 후 만료
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      return date;
    }
  },
  metadata: {
    churchName: String,
    churchId: String,
    managerPhone: String,
  },
}, {
  timestamps: true,
});

// 인덱스
BTKeySchema.index({ keyCode: 1 }, { unique: true });
BTKeySchema.index({ churchManagerId: 1 });
BTKeySchema.index({ eventId: 1 });
BTKeySchema.index({ status: 1 });
BTKeySchema.index({ assignedTeacherId: 1 });
BTKeySchema.index({ expiresAt: 1 });

// 키 코드 자동 생성 메서드
BTKeySchema.statics.generateKeyCode = function(churchId: string, sequence: number): string {
  const year = new Date().getFullYear();
  const paddedChurchId = churchId.padStart(3, '0');
  const paddedSequence = sequence.toString().padStart(3, '0');
  return `BT${year}-CH${paddedChurchId}-${paddedSequence}`;
};

// 키 만료 체크 메서드
BTKeySchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

// 키 사용 가능 여부 체크
BTKeySchema.methods.isAvailable = function(): boolean {
  return this.status === 'available' && !this.isExpired();
};

export default mongoose.model<IBTKey, IBTKeyModel>('BTKey', BTKeySchema);
