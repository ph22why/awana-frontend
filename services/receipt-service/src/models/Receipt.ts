import { Schema, model, Document } from 'mongoose';

export interface IReceipt extends Document {
  eventId: string;
  churchId: {
    mainId: string;  // 교회등록번호
    subId: string;   // 하위 ID
  };
  churchName: string;
  managerName: string;  // 담당자 이름
  managerPhone: string;
  partTotal: number;
  partStudent: number;
  partTeacher: number;
  partYM: number;
  costs: number;
  paymentMethod: 'card' | 'bank' | 'cash';
  paymentStatus: 'pending' | 'completed' | 'cancelled';
  paymentDate: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const receiptSchema = new Schema<IReceipt>(
  {
    eventId: {
      type: String,
      required: true,
    },
    churchId: {
      mainId: {
        type: String,
        required: [true, '교회등록번호는 필수입니다'],
        validate: {
          validator: function(v: string) {
            return /^\d{4}$/.test(v);
          },
          message: '교회등록번호는 4자리 숫자여야 합니다'
        }
      },
      subId: {
        type: String,
        required: [true, '교회 하위 ID는 필수입니다'],
        validate: {
          validator: function(v: string) {
            return /^[a-z]$/.test(v);
          },
          message: '교회 하위 ID는 소문자 알파벳 한 글자여야 합니다'
        }
      }
    },
    churchName: {
      type: String,
      required: [true, '교회명은 필수입니다'],
    },
    managerName: {
      type: String,
      required: [true, '담당자 이름은 필수입니다'],
    },
    managerPhone: {
      type: String,
      required: [true, '담당자 전화번호는 필수입니다'],
      validate: {
        validator: function(v: string) {
          return /^\d{3}-\d{3,4}-\d{4}$/.test(v);
        },
        message: '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'
      }
    },
    partTotal: {
      type: Number,
      required: [true, '전체 참가자 수는 필수입니다'],
      min: [0, '전체 참가자 수는 0보다 작을 수 없습니다'],
    },
    partStudent: {
      type: Number,
      required: [true, '학생 참가자 수는 필수입니다'],
      min: [0, '학생 참가자 수는 0보다 작을 수 없습니다'],
    },
    partTeacher: {
      type: Number,
      required: [true, '선생님 참가자 수는 필수입니다'],
      min: [0, '선생님 참가자 수는 0보다 작을 수 없습니다'],
    },
    partYM: {
      type: Number,
      required: [true, 'YM 참가자 수는 필수입니다'],
      min: [0, 'YM 참가자 수는 0보다 작을 수 없습니다'],
    },
    costs: {
      type: Number,
      required: [true, '금액은 필수입니다'],
      min: [0, '금액은 0보다 작을 수 없습니다'],
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'cash'],
      required: true,
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      required: true,
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// 교회별 영수증 조회를 위한 인덱스
receiptSchema.index({ 'churchId.mainId': 1, 'churchId.subId': 1 });
// 이벤트별 영수증 조회를 위한 인덱스
receiptSchema.index({ eventId: 1 });
// 결제 상태별 조회를 위한 인덱스
receiptSchema.index({ paymentStatus: 1 });

export const Receipt = model<IReceipt>('Receipt', receiptSchema); 