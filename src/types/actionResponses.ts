interface ActionResponse<T> {
    success: boolean;
    message: string;
    errors?: {
        [K in keyof T]?: string[];
    };
    input?: T;
    data?: T;
}
export type { ActionResponse };