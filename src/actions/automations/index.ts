"use server";

import { onCurrentUser } from "../user";
import { createAutomation } from "./queries";

export const getAllAutomations = async () => {
  const user = await onCurrentUser();
  try {
    const create = await createAutomation(user.id);
    if (create) return { status: 200, data: "Automation Created" };
    return { status: 404, data: " Could not create automation" };
  } catch (error) {
    return { status: 500, error: "Internal Server Error" };
  }
};
