export interface billing_statement {
    id: string;
    ownerId: string;
    client_id: string;
    creditor_id: string;
    amount: number;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface billing_statement_item {
    id: string;
    billing_statement_id: string;
    amount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}