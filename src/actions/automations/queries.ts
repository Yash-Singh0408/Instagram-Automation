"use server"

import { client } from "@/lib/prisma"

// Create a new automation for a user
export const createAutomation = async (clerkId: string) => {
    return await client.user.update({
        where:{
            clerkId
        },
        data:{
            automations:{
                create:{}
            }
        }
    })
}