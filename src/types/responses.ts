interface Response {
    successful: boolean;
    statusCode: number;
    message: string;
}

interface SuccessResponse<T> extends Response {
    data: T;
}

interface ErrorResponse extends Response {
    error: string;
}

export type { SuccessResponse, ErrorResponse };