import mongoose, { Document, Schema } from 'mongoose';

export interface IChurchManager extends Document {
  churchName: string;
  churchAddress: string;
  churchPhone: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  participants: number; // 신청한 참가자 수
  eventId: string; // 이벤트 ID
  registrationDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date; // 승인 시간
  approvedBy?: Schema.Types.ObjectId; // 승인자 ID
  keysGenerated: number; // 생성된 키 수
  keysAssigned: number; // 할당된 키 수
  keysUsed: number; // 사용된 키 수
  totalCost: number; // 총 비용
  paymentStatus: 'pending' | 'paid' | 'confirmed'; // 결제 상태
  paymentDate?: Date; // 결제 확인일
  metadata?: {
    churchId?: string; // 교회 등록번호
    mainId?: string;
    subId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  // 인스턴스 메서드
  generateKeys(): Promise<IChurchManager>;
  assignKey(): Promise<IChurchManager>;
  useKey(): Promise<IChurchManager>;
  approve(approvedBy: Schema.Types.ObjectId): Promise<IChurchManager>;
  confirmPayment(): Promise<IChurchManager>;
}

const ChurchManagerSchema: Schema = new Schema({
  churchName: {
    type: String,
    required: true,
    trim: true,
  },
  churchAddress: {
    type: String,
    required: true,
    trim: true,
  },
  churchPhone: {
    type: String,
    required: true,
    trim: true,
  },
  managerName: {
    type: String,
    required: true,
    trim: true,
  },
  managerPhone: {
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
  managerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, '유효한 이메일 주소를 입력해주세요'],
  },
  participants: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  eventId: {
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
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // 관리자 사용자
  },
  keysGenerated: {
    type: Number,
    default: 0,
    min: 0,
  },
  keysAssigned: {
    type: Number,
    default: 0,
    min: 0,
  },
  keysUsed: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'confirmed'],
    default: 'pending',
  },
  paymentDate: {
    type: Date,
  },
  metadata: {
    churchId: String,
    mainId: String,
    subId: String,
  },
}, {
  timestamps: true,
});

// 인덱스
ChurchManagerSchema.index({ churchName: 1 });
ChurchManagerSchema.index({ managerEmail: 1 });
ChurchManagerSchema.index({ managerPhone: 1 });
ChurchManagerSchema.index({ eventId: 1 });
ChurchManagerSchema.index({ status: 1 });
ChurchManagerSchema.index({ registrationDate: -1 });
ChurchManagerSchema.index({ paymentStatus: 1 });

// 가상 필드: 키 사용률
ChurchManagerSchema.virtual('keyUsageRate').get(function(this: any) {
  if (this.keysGenerated === 0) return 0;
  return Math.round((this.keysUsed / this.keysGenerated) * 100);
});

// 가상 필드: 남은 키 수
ChurchManagerSchema.virtual('remainingKeys').get(function(this: any) {
  return this.keysGenerated - this.keysAssigned;
});

// 승인 시 키 생성 메서드
ChurchManagerSchema.methods.generateKeys = async function(this: IChurchManager) {
  if (this.status !== 'approved') {
    throw new Error('승인된 신청만 키를 생성할 수 있습니다.');
  }
  
  this.keysGenerated = this.participants;
  this.keysAssigned = 0;
  this.keysUsed = 0;
  
  return this.save();
};

// 키 할당 메서드
ChurchManagerSchema.methods.assignKey = function(this: IChurchManager) {
  if (this.keysAssigned >= this.keysGenerated) {
    throw new Error('모든 키가 할당되었습니다.');
  }
  
  this.keysAssigned += 1;
  return this.save();
};

// 키 사용 메서드
ChurchManagerSchema.methods.useKey = function(this: IChurchManager) {
  if (this.keysUsed >= this.keysAssigned) {
    throw new Error('할당된 키보다 많이 사용할 수 없습니다.');
  }
  
  this.keysUsed += 1;
  return this.save();
};

// 승인 처리 메서드
ChurchManagerSchema.methods.approve = function(this: IChurchManager, approvedBy: Schema.Types.ObjectId) {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.approvedBy = approvedBy;
  return this.save();
};

// 결제 확인 메서드
ChurchManagerSchema.methods.confirmPayment = function(this: IChurchManager) {
  this.paymentStatus = 'confirmed';
  this.paymentDate = new Date();
  return this.save();
};

export default mongoose.model<IChurchManager>('ChurchManager', ChurchManagerSchema);
