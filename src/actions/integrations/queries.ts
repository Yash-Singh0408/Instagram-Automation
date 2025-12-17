'use server'

import { client } from "@/lib/prisma"

// Fetch Integration by ID and update its token and expiration date
export const updateIntegration = async (
    token: string, 
    expire: Date, 
    id: string
) => {
    return await client.integration.update({
        where:{
            id
        },
        data:{
            token,
            expiresAt:expire
        }
    })
}