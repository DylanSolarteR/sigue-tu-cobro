import { Actor } from "./actor";
export interface billing_statement {
    id?: string;
    client_id: string;
    client: Actor;
    creditor_id: string;
    creditor: Actor
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
    billing_statement_id: string | null;
    client_id: string;
    status: "pending" | "added" | "paid";
    amount: number;
    desc: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
