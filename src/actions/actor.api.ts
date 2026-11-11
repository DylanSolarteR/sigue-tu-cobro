'use server';
import { api } from "@/trpc/server";
import { type ActionResponse } from "@/types/actionResponses";
import { type Actor } from "@/types/actor";
import { z } from "zod";

const actorSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    docType: z.enum(["CC", "CE", "NIT"], {
        error: 'Seleccione un tipo de documento.'
    }),
    docNumber: z.string().min(5, "El número de documento debe tener al menos 5 caracteres"),
    type: z.enum(["client", "creditor"]),
    expeditionPlace: z.string().optional(),
    telephone: z.string().optional(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export async function getClients() {

    const result = await api.actor.queries.getClients();

    return result as Actor[];
}

export async function getClientById(id: string): Promise<ActionResponse<Actor>> {
    try {
        const validatedId = z.string().safeParse(id);

        if (!validatedId.success) {
            return {
                success: false,
                message: 'El cliente no existe',
            };
        }

        const result = await api.actor.queries.getClientById({ id });
        if (!result) {
            return {
                success: false,
                message: 'El cliente no existe',
            };
        }
        return {
            success: true,
            message: 'Cliente encontrado',
            data: result,
        };
    } catch {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        }
    }

}

export async function getCreditors() {
    const result = await api.actor.queries.getCreditors();

    return result;
}

export async function getCreditorById(id: string): Promise<ActionResponse<Actor>> {

    try {
        const validatedId = z.string().safeParse(id);

        if (!validatedId.success) {
            return {
                success: false,
                message: 'El acreedor no existe',
            };
        }
        const result = await api.actor.queries.getCreditorById({ id });
        if (!result) {
            return {
                success: false,
                message: 'El acreedor no existe',
            };
        }
        return {
            success: true,
            message: 'Acreedor encontrado',
            data: result,
        };

    } catch {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }

}

export async function createClient(prevState: ActionResponse<Actor> | null, formData: FormData): Promise<ActionResponse<Actor>> {
    try {
        const rawData: Actor = {
            name: formData.get('name') as string,
            docType: formData.get('docType') as "CC" | "CE" | "NIT",
            docNumber: formData.get('docNumber') as string,
            telephone: formData.get('telephone') as string ? formData.get('telephone') as string : "",
            expeditionPlace: formData.get('expeditionPlace') as string ? formData.get('expeditionPlace') as string : "",
            type: "client",
        }
        const validatedData = actorSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Por favor corrija los errores en el formulario',
                errors: z.flattenError(validatedData.error).fieldErrors,
                input: rawData,
            }
        }

        await api.actor.mutations.client.create({
            name: validatedData.data.name,
            docType: validatedData.data.docType,
            docNumber: validatedData.data.docNumber,
            telephone: validatedData.data.telephone ?? "",
            expeditionPlace: validatedData.data.expeditionPlace ?? "",
            type: "client",
        });

        return {
            success: true,
            message: 'Cliente creado exitosamente!',
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }
}

export async function createCreditor(prevState: ActionResponse<Actor> | null, formData: FormData): Promise<ActionResponse<Actor>> {
    try {
        const rawData: Actor = {
            name: formData.get('name') as string,
            docType: formData.get('docType') as "CC" | "CE" | "NIT",
            docNumber: formData.get('docNumber') as string,
            telephone: formData.get('telephone') as string,
            expeditionPlace: formData.get('expeditionPlace') as string,
            type: "creditor",
        }
        const validatedData = actorSchema.safeParse(rawData);


        if (!validatedData.success) {
            return {
                success: false,
                message: 'Por favor corrija los errores en el formulario',
                errors: z.flattenError(validatedData.error).fieldErrors,
                input: rawData,
            }
        }

        await api.actor.mutations.creditor.create({
            name: validatedData.data.name,
            docType: validatedData.data.docType,
            docNumber: validatedData.data.docNumber,
            telephone: validatedData.data.telephone,
            expeditionPlace: validatedData.data.expeditionPlace,
            type: "creditor",
        });


        return {
            success: true,
            message: 'Acreedor creado exitosamente!',
        }
    } catch {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }
}

export async function updateClientById(prevState: ActionResponse<Actor> | null, formData: FormData, id: string): Promise<ActionResponse<Actor>> {

    try {
        const validatedId = z.string().safeParse(id);
        if (!validatedId.success) {
            return {
                success: false,
                message: 'El cliente a actualizar no existe',
            };
        }
        const rawData: Actor = {
            name: formData.get('name') as string,
            docType: formData.get('docType') as "CC" | "CE" | "NIT",
            docNumber: formData.get('docNumber') as string,
            telephone: formData.get('telephone') as string,
            expeditionPlace: formData.get('expeditionPlace') as string,
            type: "client",
        }
        const validatedData = actorSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Por favor corrija los errores en el formulario',
                errors: z.flattenError(validatedData.error).fieldErrors,
                input: rawData,
            }
        }

        await api.actor.mutations.client.update({
            id: validatedId.data,
            name: validatedData.data.name,
            docType: validatedData.data.docType,
            docNumber: validatedData.data.docNumber,
            expeditionPlace: validatedData.data.expeditionPlace,
            telephone: validatedData.data.telephone,
        });

        return {
            success: true,
            message: 'Cliente actualizado exitosamente!',
            input: rawData,
        }
    } catch {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }
}

export async function updateCreditorById(prevState: ActionResponse<Actor> | null, formData: FormData, id: string): Promise<ActionResponse<Actor>> {

    try {
        const validatedId = z.string().safeParse(id);
        if (!validatedId.success) {
            return {
                success: false,
                message: 'El acreedor a actualizar no existe',
            };
        }
        const rawData: Actor = {
            name: formData.get('name') as string,
            docType: formData.get('docType') as "CC" | "CE" | "NIT",
            docNumber: formData.get('docNumber') as string,
            telephone: formData.get('telephone') as string,
            expeditionPlace: formData.get('expeditionPlace') as string,
            type: "creditor",
        }
        const validatedData = actorSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Por favor corrija los errores en el formulario',
                errors: z.flattenError(validatedData.error).fieldErrors,
                input: rawData,
            }
        }

        await api.actor.mutations.creditor.update({
            id: validatedId.data,
            name: validatedData.data.name,
            docType: validatedData.data.docType,
            docNumber: validatedData.data.docNumber,
            expeditionPlace: validatedData.data.expeditionPlace,
            telephone: validatedData.data.telephone,
        });

        return {
            success: true,
            message: 'Acreedor actualizado exitosamente!',
            input: rawData,
        }
    } catch {
        return {
            success: false,
            message: 'Un error ha ocurrido',
        };
    }
}

export async function deleteClientById(id: string): Promise<ActionResponse<Actor>> {

    const validatedId = z.string().safeParse(id);

    if (!validatedId.success) {
        return {
            success: false,
            message: 'El cliente no existe',
        };
    }
    try {

        await api.actor.mutations.client.delete({ id });

        return {
            success: true,
            message: 'Cliente eliminado exitosamente',
        };
    } catch {
        return {
            success: false,
            message: 'Ocurrió un error al eliminar el cliente',
        };
    }
}

export async function deleteCreditorById(id: string): Promise<ActionResponse<Actor>> {

    const validatedId = z.string().safeParse(id);

    if (!validatedId.success) {
        return {
            success: false,
            message: 'El acreedor no existe',
        };
    }
    try {

        await api.actor.mutations.creditor.delete({ id });

        return {
            success: true,
            message: 'Acreedor eliminado exitosamente',
        };
    } catch {
        return {
            success: false,
            message: 'Ocurrió un error al eliminar el acreedor',
        };
    }
}
