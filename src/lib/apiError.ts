export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): string => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error.response) {
    // HTTP 에러 응답
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해주세요.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 409:
        return '중복된 데이터가 존재합니다.';
      case 422:
        return '입력값이 올바르지 않습니다.';
      case 429:
        return '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요.';
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 503:
        return '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
      default:
        return `오류가 발생했습니다. (${status})`;
    }
  }

  if (error.request) {
    // 요청은 보냈으나 응답을 받지 못함
    return '네트워크 연결을 확인해주세요.';
  }

  // 기타 오류
  return error.message || '알 수 없는 오류가 발생했습니다.';
};
