import axios from "axios";
import { headers } from "next/headers";

export const refreshToken = async(token:string)=>{
    const refresh_token = await axios.get(`${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`)

    return refresh_token.data
}

// Send DM to user
export const sendDM = async(
    userId:string,
    receiverId:string,
    prompt:string,
    token:string,
)=> {
    console.log("Sending DM to ", receiverId)
    return await axios.post(`${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
        {
            recipient:{
                id: receiverId
            },
            message:{
                text: prompt
            }
        },
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    )
}


// Generate tokens
export const generateTokens = async(code:string)=>{
    console.log("Generating tokens with code: ", code)
    const insta_form = new FormData()
    // Append the code and client id to the form
    insta_form.append("client_id", process.env.INSTAGRAM_CLIENT_ID as string)
    insta_form.append("client_secret", process.env.INSTAGRAM_CLIENT_SECRET as string)
    insta_form.append("grant_type", "authorization_code")
    insta_form.append("redirect_uri",process.env.NEXT_PUBLIC_IG_REDIRECT_URI!)

    insta_form.append("code", code)
    console.log(code)
    console.log(insta_form)

    const sortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL as string,{
        method:"POST",
        body:insta_form
    })
    console.log(sortTokenRes)

    const token = await sortTokenRes.json()
    if(token.permissions.length>0){
        console.log(token,"got permissions")
        const long_token = await axios.get(`${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${
            process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${token.access_token}`)
        console.log(long_token)
        console.log(long_token.data,"long lived token")
        return long_token.data
    }
}

export const sendPrivateMessage = async (
    userId:string,
    recieverId:string,
    prompt:string,
    token:string
) =>{
    return await axios.post(
        `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
        {
            recipient:{
                comment_id:recieverId,
            },
            message:{
                text:prompt,
            },
        },
        {
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json"
            }
        }
    )
}