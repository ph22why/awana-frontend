import { Schema, model, Document, Model } from 'mongoose';

export interface IChurch extends Document {
  mainId: string;
  subId: string;
  name: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IChurchModel extends Model<IChurch> {
  validateChurchId(mainId: string, subId: string): boolean;
}

const churchSchema = new Schema({
  mainId: {
    type: String,
    required: true,
    trim: true
  },
  subId: {
    type: String,
    required: true,
    trim: true,
    default: 'a'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// 교회 ID로 조회하기 위한 복합 인덱스
churchSchema.index({ mainId: 1, subId: 1 }, { unique: true });

// 가상 필드: 전체 교회 ID
churchSchema.virtual('fullId').get(function() {
  return `${this.mainId}-${this.subId}`;
});

// 교회 ID 검증을 위한 정적 메서드
churchSchema.statics.validateChurchId = function(mainId: string, subId: string): boolean {
  const mainIdPattern = /^\d{4}$/;
  const subIdPattern = /^[a-z]$/;
  return mainIdPattern.test(mainId) && subIdPattern.test(subId);
};

export const Church = model<IChurch, IChurchModel>('Church', churchSchema); 