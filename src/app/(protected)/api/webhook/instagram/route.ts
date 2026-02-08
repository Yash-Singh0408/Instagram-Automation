import { findAutomation } from "@/actions/automations/queries";
import {
  createChatHistory,
  getChatHistory,
  getKeywordAutomation,
  getKeywordPost,
  getAutomationForDm,
  matchKeyword,
  trackResponse,
} from "@/actions/webhooks/queries";
import { sendDM, sendPrivateMessage } from "@/lib/fetch";
import { chatCompletion } from "@/lib/gemini";
import { client } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("🔗 Instagram Webhook GET request received");
  const hub = req.nextUrl.searchParams.get("hub.challenge");
  console.log("✅ Hub challenge:", hub);
  return new NextResponse(hub);
}

export async function POST(req: NextRequest) {
  const webhook_payload = await req.json();
  console.log("📨 Webhook Payload Received:", JSON.stringify(webhook_payload, null, 2));
  let matcher;
  try {
    console.log("🔍 Processing webhook payload...");
    // for messenges (only process when a message object with text exists)
    if (
      webhook_payload.entry[0].messaging &&
      webhook_payload.entry[0].messaging[0] &&
      webhook_payload.entry[0].messaging[0].message &&
      typeof webhook_payload.entry[0].messaging[0].message.text === "string"
    ) {
      console.log("📨 Messaging detected:", webhook_payload.entry[0].messaging[0]);
      matcher = await matchKeyword(
        webhook_payload.entry[0].messaging[0].message.text,
      );
      console.log("🔎 Matcher result:", matcher);
    } else if (webhook_payload.entry[0].messaging && webhook_payload.entry[0].messaging[0]) {
      // Received a messaging event without a text message (e.g., read/delivery). Log and skip.
      console.log("ℹ️ Messaging event received with no text (skipping):", webhook_payload.entry[0].messaging[0]);
    }

    // for comments
    if (webhook_payload.entry[0].changes) {
      console.log("💬 Changes detected (comments):", webhook_payload.entry[0].changes[0]);
      matcher = await matchKeyword(
        webhook_payload.entry[0].changes[0].value.text,
      );
      console.log("🔎 Matcher result for comment:", matcher);
    }

    if (matcher && matcher.automationId) {
      // We have a match
      console.log("✅ Keyword Match Found:", matcher);
      if (webhook_payload.entry[0].messaging) {
        console.log("🔄 Fetching automation for ID:", matcher.automationId);
        const automation = await getKeywordAutomation(
          matcher.automationId,
          true,
        );
        console.log("✅ Automation fetched:", automation ? "Found" : "Not found");
        if (automation && automation.trigger && automation.trigger.length > 0) {
          if (
            automation.listener &&
            automation.listener.listener === "MESSAGE"
          ) {
            console.log("📤 Sending DM for MESSAGE listener:", {
              userId: webhook_payload.entry[0].id,
              receiverId: webhook_payload.entry[0].messaging[0].sender.id,
              prompt: automation.listener?.prompt
            });
            console.log("🚀 Sending DM...");
            const direct_message = await sendDM(
              webhook_payload.entry[0].id,
              webhook_payload.entry[0].messaging[0].sender.id,
              automation.listener?.prompt,
              automation.User?.integrations[0].token!,
            );
            console.log("✅ DM Response Status:", direct_message.status);
            console.log("📋 DM Response Data:", direct_message);

            if (direct_message.status === 200) {
              console.log("📊 Tracking DM response...");
              const tracked = await trackResponse(automation.id, "DM");
              console.log("✅ Tracked:", tracked);
              if (tracked) {
                console.log("✨ DM successfully sent and tracked");
                return NextResponse.json(
                  {
                    message: "EVENT_RECEIVED",
                  },
                  { status: 200 },
                );
              } else {
                console.warn("⚠️ Failed to track MESSAGE DM response");
                return NextResponse.json(
                  { message: "DM sent but tracking failed" },
                  { status: 200 },
                );
              }
            } else {
              console.error("❌ DM sending failed with status:", direct_message.status);
              return NextResponse.json(
                { message: "DM sending failed" },
                { status: 200 },
              );
            }
          }

          if (
            automation.listener &&
            automation.listener.listener === "SMARTAI" &&
            automation.User?.subscription?.plan === "PRO"
          ) {
            console.log("🤖 SMARTAI listener detected. Generating AI response...");
            try {
              const smart_ai_text = await chatCompletion([
                {
                  role: "assistant",
                  content: `${automation.listener?.prompt}: Keep responses under 2 sentences`,
                },
              ]);

              if (smart_ai_text) {
                console.log("✅ AI response generated:", smart_ai_text);
                console.log("💾 Creating chat history...");
                const reciever = createChatHistory(
                  automation.id,
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].messaging[0].sender.id,
                  webhook_payload.entry[0].messaging[0].message.text,
                );

                const sender = createChatHistory(
                  automation.id,
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].messaging[0].sender.id,
                  smart_ai_text,
                );

                await client.$transaction([reciever, sender]);

                console.log("✅ Chat history saved via transaction");
                console.log("🚀 Sending DM for SMARTAI...");
                const direct_message = await sendDM(
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].messaging[0].sender.id,
                  smart_ai_text,
                  automation.User?.integrations[0].token!,
                );
                console.log("✅ DM Response Status:", direct_message.status);
                console.log("📋 DM Response Data:", direct_message);

                if (direct_message.status === 200) {
                  console.log("📊 Tracking SMARTAI response...");
                  const tracked = await trackResponse(automation.id, "DM");
                  console.log("✅ Tracked:", tracked);
                  if (tracked) {
                    console.log("✨ SMARTAI message successfully sent and tracked");
                    return NextResponse.json(
                      { message: "MESSAGE_SENT from SMARTAI" },
                      { status: 200 },
                    )
                  } else {
                    console.warn("⚠️ Failed to track SMARTAI response");
                    return NextResponse.json(
                      { message: "SMARTAI message sent but tracking failed" },
                      { status: 200 },
                    );
                  }
                } else {
                  console.error("❌ SMARTAI DM sending failed with status:", direct_message.status);
                  return NextResponse.json(
                    { message: "SMARTAI DM sending failed" },
                    { status: 200 },
                  );
                }
              }
            } catch (err: any) {
              if (err?.name === 'GeminiQuotaError') {
                console.warn('⚠️ Gemini quota exceeded:', err?.message, 'retryAfterSeconds:', err?.retryAfterSeconds);
                return NextResponse.json({ message: `SMARTAI temporarily unavailable. Please retry in ${err.retryAfterSeconds || 'a few seconds'}` }, { status: 200 });
              }
              console.error("❌ SMARTAI error:", err);
              return NextResponse.json({ message: "SMARTAI failed" }, { status: 200 });
            }
          }
        }
      } else if(webhook_payload.entry[0].changes && webhook_payload.entry[0].changes[0].field === 'comments'){
        console.log("💬 Processing Comment:", webhook_payload.entry[0].changes[0].value);
        console.log("🔄 Fetching automation for comment (isDm: false)...");
        const automation = await getKeywordAutomation(
            matcher.automationId,
            false,
        )
        console.log("✅ Comment automation fetched:", automation ? "Found" : "Not found");

        console.log("🔄 Fetching post automation...");
        const automations_post = await getKeywordPost(
            webhook_payload.entry[0].changes[0].value.media.id,
            automation?.id!
        )
        console.log("✅ Post automation fetched:", automations_post ? "Found" : "Not found");

        if(automation && automations_post && automation.trigger && automation.trigger.length > 0){
            console.log("✅ Conditions met for comment processing");
            if(automation.listener){
                if(automation.listener.listener==="MESSAGE"){
                    console.log("📤 Sending private message for comment...");
                    const direct_message = await sendPrivateMessage(
                       webhook_payload.entry[0].id,
                       webhook_payload.entry[0].changes[0].value.id,
                       automation.listener?.prompt,
                       automation.User?.integrations[0].token!, 
                    )
                    console.log("✅ Private message response status:", direct_message.status);
                    if(direct_message.status===200){
                        console.log("� Creating chat history for MESSAGE comment...");
                        const reciever = createChatHistory(
                            automation.id,
                            webhook_payload.entry[0].id,
                            webhook_payload.entry[0].changes[0].value.from.id,
                            webhook_payload.entry[0].changes[0].value.text,
                        )

                        const sender = createChatHistory(
                            automation.id,
                            webhook_payload.entry[0].id,
                            webhook_payload.entry[0].changes[0].value.from.id,
                            automation.listener?.prompt,
                        )

                        await client.$transaction([reciever, sender]);
                        console.log("✅ Chat history saved");

                        console.log("�📊 Tracking comment response...");
                        const tracked = await trackResponse(automation.id , "COMMENT")
                        console.log("✅ Tracked:", tracked);
                        if(tracked){
                            console.log("✨ Comment message successfully sent and tracked");
                            return NextResponse.json(
                                {
                                 message:"Message Sent from Comment"
                                },
                                {
                                 status:200
                                }
                            )
                        }
                    } else {
                      console.error("❌ Private message sending failed");
                    }
                }
                if(
                    automation.listener.listener === "SMARTAI" && 
                    automation.User?.subscription?.plan === "PRO"
                ){
                    console.log("🤖 SMARTAI listener detected for comment. Generating AI response...");
                    try {
                      const smart_ai_text = await chatCompletion([
                        {
                          role: "assistant",
                          content: `${automation.listener?.prompt}: Keep responses under 2 sentences`,
                        },
                      ])

                      if(smart_ai_text){
                        console.log("✅ AI response generated for comment:", smart_ai_text);
                        console.log("💾 Creating chat history for comment...");
                        const reciever = createChatHistory(
                          automation.id,
                          webhook_payload.entry[0].id,
                          webhook_payload.entry[0].changes[0].value.from.id,
                          webhook_payload.entry[0].changes[0].value.text,
                        )

                        const sender = createChatHistory(
                          automation.id,
                          webhook_payload.entry[0].id,
                          webhook_payload.entry[0].changes[0].value.from.id,
                          smart_ai_text,
                        )

                        console.log("💾 Chat history saved via transaction");
                        await client.$transaction([reciever, sender])

                        const direct_message = await sendPrivateMessage(
                          webhook_payload.entry[0].id,
                          webhook_payload.entry[0].changes[0].value.id,
                          automation.listener?.prompt,
                          automation.User?.integrations[0].token!, 
                        )

                        if(direct_message.status === 200){
                          console.log("📊 Tracking SMARTAI comment response...");
                          const tracked = await trackResponse(automation.id , "COMMENT")
                          console.log("✅ Tracked:", tracked);
                          if(tracked){
                            console.log("✨ SMARTAI comment message successfully sent and tracked");
                            return NextResponse.json(
                              {
                                message:"Message Sent from Comment"
                              },
                              {
                                status:200
                              }
                            )
                          }
                        } else {
                          console.error("❌ DM for comment failed with status:", direct_message.status);
                        }
                      }
                    } catch (err: any) {
                      if (err?.name === 'GeminiQuotaError') {
                        console.warn('⚠️ Gemini quota exceeded for comment:', err?.message, 'retryAfterSeconds:', err?.retryAfterSeconds);
                        return NextResponse.json({ message: `SMARTAI temporarily unavailable for comments. Please retry in ${err.retryAfterSeconds || 'a few seconds'}` }, { status: 200 });
                      }
                      console.error("❌ SMARTAI comment error:", err);
                      return NextResponse.json({ message: "SMARTAI failed for comment" }, { status: 200 });
                    }
                }
            }
        }
      }
    }
    if(!matcher){
        // No keyword match
        console.log("⚠️ No Keyword Match Found");

        // If this webhook entry is a messaging (DM) event, run the DM fallback flow
        if (
          webhook_payload.entry[0].messaging &&
          webhook_payload.entry[0].messaging[0] &&
          webhook_payload.entry[0].messaging[0].message &&
          typeof webhook_payload.entry[0].messaging[0].message.text === "string"
        ) {
          console.log("🔄 Fetching chat history...");
          const customer_history = await getChatHistory(
            webhook_payload.entry[0].messaging[0].recipient.id,
            webhook_payload.entry[0].messaging[0].sender.id,
          )
          console.log("✅ Chat history retrieved. History length:", customer_history.history.length);

          if(customer_history.history.length > 0){
              console.log("✅ Previous chat history found");
              console.log("🔄 Finding automation for this conversation...");
              const automation = await findAutomation(customer_history.automationId!)
              console.log("✅ Automation found:", automation ? "Yes" : "No");

              if(
                  automation?.User?.subscription?.plan === "PRO" && 
                  automation.listener?.listener === "SMARTAI"
              ){
                  console.log("🤖 SMARTAI with existing chat history. Generating contextual AI response...");
                  try {
                    const smart_ai_text = await chatCompletion([
                      {
                        role:'assistant',
                        content:`${automation.listener?.prompt}: Keep responses under 2 sentences`
                      },
                      ...customer_history.history,
                      {
                        role:'user',
                        content:webhook_payload.entry[0].messaging[0].message.text
                      }
                    ])

                    console.log("✅ AI response with context generated:", smart_ai_text);

                    if(smart_ai_text){
                      console.log("💾 Creating chat history entries...");
                      const reciever = createChatHistory(
                        automation.id,
                        webhook_payload.entry[0].id,
                        webhook_payload.entry[0].messaging[0].sender.id,
                        webhook_payload.entry[0].messaging[0].message.text,
                      )

                      const sender = createChatHistory(
                        automation.id,
                        webhook_payload.entry[0].id,
                        webhook_payload.entry[0].messaging[0].sender.id,
                        smart_ai_text,
                      )
                      console.log("💾 Chat history saved via transaction");
                      await client.$transaction([reciever, sender]);
                      console.log("🚀 Sending contextual AI response via DM...");
                      const direct_message = await sendDM(
                        webhook_payload.entry[0].id,
                        webhook_payload.entry[0].messaging[0].sender.id,
                        smart_ai_text,
                        automation.User?.integrations[0].token!,
                      )
                      console.log("✅ DM response status:", direct_message.status);

                      if(direct_message.status === 200){
                        // if successfully send we return
                        console.log("✨ Contextual SMARTAI message successfully sent");
                        return NextResponse.json(
                          {
                            message:"Message Sent from Comment"
                          },
                          {
                            status:200
                          }
                        )
                      } else {
                        console.error("❌ Contextual DM sending failed");
                      }
                    }
                  } catch (err: any) {
                    if (err?.name === 'GeminiQuotaError') {
                      console.warn('⚠️ Gemini quota exceeded for contextual reply:', err?.message, 'retryAfterSeconds:', err?.retryAfterSeconds);
                      return NextResponse.json({ message: `SMARTAI temporarily unavailable. Please retry in ${err.retryAfterSeconds || 'a few seconds'}` }, { status: 200 });
                    }
                    // console.error("❌ SMARTAI contextual error:", err.message);
                    return NextResponse.json({ message: "SMARTAI failed" }, { status: 200 });
                  }
              }
          }

          console.log("ℹ️ No automation or no chat history found");
          // Try to find an automation that triggers on DMs for this integration
          try {
            const dmAutomation = await getAutomationForDm(
              webhook_payload.entry[0].messaging[0].recipient.id,
            );
            console.log("🔎 DM automation lookup result:", dmAutomation ? "Found" : "Not found");

            if (dmAutomation && dmAutomation.listener) {
              console.log("🔄 Processing DM-triggered automation:", dmAutomation.id);
              // MESSAGE listener: send fixed prompt
              if (dmAutomation.listener.listener === "MESSAGE") {
                console.log("📤 Sending DM for DM-triggered MESSAGE listener...");
                const direct_message = await sendDM(
                  webhook_payload.entry[0].id,
                  webhook_payload.entry[0].messaging[0].sender.id,
                  dmAutomation.listener.prompt,
                  dmAutomation.User?.integrations[0].token!,
                );
                console.log("✅ DM response status:", direct_message.status);
                if (direct_message.status === 200) {
                  const tracked = await trackResponse(dmAutomation.id, "DM");
                  console.log("📊 Tracked DM response:", tracked);
                  if (tracked) {
                    return NextResponse.json({ message: "DM_SENT" }, { status: 200 });
                  }
                }
              }

              // SMARTAI listener: generate AI response if user has PRO
              if (
                dmAutomation.listener.listener === "SMARTAI" &&
                dmAutomation.User?.subscription?.plan === "PRO"
              ) {
                console.log("🤖 Generating SMARTAI response for DM-triggered automation...");
                try {
                  const smart_ai_text = await chatCompletion([
                    {
                      role: "assistant",
                      content: `${dmAutomation.listener?.prompt}: Keep responses under 2 sentences`,
                    },
                    {
                      role: "user",
                      content: webhook_payload.entry[0].messaging[0].message?.text || "",
                    },
                  ]);

                  if (smart_ai_text) {
                    console.log("✅ AI response generated:", smart_ai_text);
                    const reciever = createChatHistory(
                      dmAutomation.id,
                      webhook_payload.entry[0].id,
                      webhook_payload.entry[0].messaging[0].sender.id,
                      webhook_payload.entry[0].messaging[0].message?.text || "",
                    );

                    const sender = createChatHistory(
                      dmAutomation.id,
                      webhook_payload.entry[0].id,
                      webhook_payload.entry[0].messaging[0].sender.id,
                      smart_ai_text,
                    );

                    await client.$transaction([reciever, sender]);

                    const direct_message = await sendDM(
                      webhook_payload.entry[0].id,
                      webhook_payload.entry[0].messaging[0].sender.id,
                      smart_ai_text,
                      dmAutomation.User?.integrations[0].token!,
                    );

                    if (direct_message.status === 200) {
                      const tracked = await trackResponse(dmAutomation.id, "DM");
                      if (tracked) {
                        return NextResponse.json({ message: "DM_SENT_SMARTAI" }, { status: 200 });
                      }
                    }
                  }
                } catch (err: any) {
                  if (err?.name === 'GeminiQuotaError') {
                    console.warn('⚠️ Gemini quota exceeded for DM-triggered SMARTAI:', err?.message, 'retryAfterSeconds:', err?.retryAfterSeconds);
                    return NextResponse.json({ message: `SMARTAI temporarily unavailable. Please retry in ${err.retryAfterSeconds || 'a few seconds'}` }, { status: 200 });
                  }
                  console.error("❌ SMARTAI DM-triggered error:", err);
                  return NextResponse.json({ message: "SMARTAI failed" }, { status: 200 });
                }
              }
            }
          } catch (err) {
            console.error("❌ Error while processing DM-triggered automation:", err);
          }

          return NextResponse.json(
            {
              messages: "No automation set",
            },
            {
              status: 200,
            },
          );
        } else {
          // No messaging object on webhook entry (likely a comment event). Nothing else to do.
          console.log("ℹ️ No messaging object on webhook entry - likely a comment event. Skipping DM fallback.");
          return NextResponse.json(
            {
              messages: "No automation set",
            },
            {
              status: 200,
            },
          );
        }
    }
    console.log("✅ Webhook processing completed successfully");
    return NextResponse.json({message:"No automation set"} , {status:200})
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    console.error("📋 Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "Unknown"
    });
    return NextResponse.json({message:"Internal Server Error , No automation set "} , {status:200})
  }
}