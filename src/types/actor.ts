export interface Actor {
    id?: string;
    name: string;
    docType: "CC" | "CE" | "NIT";
    docNumber: string;
    type?: "client" | "creditor";
    expeditionPlace?: string | null;
    telephone?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}