export interface ReceiptFormData {
  year: string;               // 연도
  eventName: string;          // 이벤트명
  churchId: string;           // 교회 ID
  churchName: string;         // 교회명 또는 등록번호
  managerPhone: string;       // 담당자 전화번호
  partTotal: number;          // 전체 인원
  partStudent: number;        // 학생 수
  partTeacher: number;        // 선생 수
  partYM: number;             // 청년 수
  costs: number;              // 비용
}
