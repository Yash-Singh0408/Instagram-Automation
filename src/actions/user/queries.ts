'use server'

import { client } from "@/lib/prisma"

// Find user by Clerk ID
export const findUser = async (clerkId:string) => {
     return await client.user.findUnique({
        where:{
            clerkId,
        },
        include:{
            subscription:true,
            integrations:{
                select:{
                    id:true,
                    token:true,
                    expiresAt:true,
                    name:true,
                }
            }
        }
     })
}

// Create user
export const createUser = async(
    clerkId:string,
    firstName:string,
    lastName:string,
    email:string
)=>{
    return await client.user.create({
        data:{
            clerkId,
            firstName,
            lastName,
            email,
            subscription:{
                create:{},
            },
        },
        select:{
            firstName:true,
            lastName:true,
        }
    })
}