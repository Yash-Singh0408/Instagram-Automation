import { v4 as uuidv4 } from "uuid";

type Props = {
  id: string;
  label: string;
  subLabel: string;
  description: string;
};

export const DASHBOARD_CARDS: Props[] = [
  {
    id: uuidv4(),
    label: "Smart Auto Replies",
    subLabel: "Instant replies to Instagram DMs",
    description:
      "Automatically respond to customer messages 24/7 and never miss a lead.",
  },
  {
    id: uuidv4(),
    label: "AI Conversation Assistant",
    subLabel: "Understand intent & reply with AI",
    description:
      "AI analyzes customer intent and provides accurate, contextual replies.",
  },
  {
    id: uuidv4(),
    label: "Comment-to-DM Automation",
    subLabel: "Convert comments into conversations",
    description:
      "Trigger automated DMs when users comment on your posts or reels.",
  },
];