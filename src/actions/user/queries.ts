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
                    instagramId:true
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

// Update Subscription
export const updateSubscription = async (clerkId:string , props:{
    customerId?:string;
    plan?:'PRO'|'FREE';
})=>{
    return await client.user.update({
        where:{
            clerkId,
        },
        data:{
            subscription:{
                update:{
                    data:{
                        ...props,
                    },
                },
            },
        },
    })
}