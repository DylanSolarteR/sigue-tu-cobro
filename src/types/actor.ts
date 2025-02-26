export interface Actor {
    id: string;
    name: string;
    docType: "CC" | "CE" | "NIT";
    docNumber: string;
    type: "client" | "collector";
    expeditionPlace?: string;
    telephone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}