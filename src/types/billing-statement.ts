export interface billing_statement {
    id?: string;
    client_id: string;
    creditor_id: string;
    amount?: number;
    showItemAmount?: boolean;
    status: string;
    payDate: string,
    extraInfo: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface billing_statement_item {
    id?: string;
    billing_statement_id: string;
    amount: number;
    desc: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}