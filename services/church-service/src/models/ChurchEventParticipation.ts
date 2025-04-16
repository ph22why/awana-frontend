import { Schema, model, Document } from 'mongoose';

export interface IChurchEventParticipation extends Document {
  churchId: {
    mainId: string;
    subId: string;
  };
  eventId: string;
  participantCount: number;
  registrationDate: Date;
  paymentStatus: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const churchEventParticipationSchema = new Schema({
  churchId: {
    mainId: {
      type: String,
      required: true,
      trim: true
    },
    subId: {
      type: String,
      required: true,
      trim: true
    }
  },
  eventId: {
    type: String,
    required: true
  },
  participantCount: {
    type: Number,
    required: true,
    min: 1
  },
  registrationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// 교회별 이벤트 참가 이력 조회를 위한 인덱스
churchEventParticipationSchema.index({ 'churchId.mainId': 1, 'churchId.subId': 1 });

export const ChurchEventParticipation = model<IChurchEventParticipation>('ChurchEventParticipation', churchEventParticipationSchema); 