import { getAllAutomations } from "@/actions/automations";
import { onUserInfo } from "@/actions/user";
import { QueryClient, QueryFunction } from "@tanstack/react-query";


// Generic prefetch function
const prefetch = async (
    client: QueryClient,
    action: QueryFunction,
    key: string
) => {
    return await client.prefetchQuery({
        queryKey: [key],
        queryFn: action,
        staleTime: 60000, // 1 minute
    })
}

// Prefetch User Profile Data
export const PrefetchUserProfile =async (client : QueryClient)=>{
    return await prefetch(client , onUserInfo , 'user-profile')
}

// Prefetch User Automations
export const PrefetchUserAutomations =async (client:QueryClient)=>{
    return await prefetch(client , getAllAutomations , 'user-automations')
}
