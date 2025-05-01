export interface ReceiptFormData {
  /** 연도 */
  year: string;
  /** 이벤트명 */
  eventName: string;
  /** 교회 ID */
  churchId: string;
  /** 교회명 또는 등록번호 */
  churchName: string;
  /** 담당자 전화번호 */
  managerPhone: string;
  /** 전체 인원 */
  partTotal: number;
  /** 학생 수 */
  partStudent: number;
  /** 선생 수 */
  partTeacher: number;
  /** 청년 수 */
  partYM: number;
  /** 금액 */
  costs: number;
}
