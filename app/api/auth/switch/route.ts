import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, niche, brandVoice, name, apiKeys } = body;

  const cookieStore = await cookies();

  if (userId) {
    cookieStore.set("swarm_user_id", userId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    
    // Check if updating settings
    if (brandVoice || niche || name || apiKeys) {
      await db
        .update(users)
        .set({
          ...(niche ? { niche } : {}),
          ...(brandVoice ? { brandVoice } : {}),
          ...(name ? { name } : {}),
          ...(apiKeys ? { apiKeys: typeof apiKeys === "string" ? apiKeys : JSON.stringify(apiKeys) } : {}),
        })
        .where(eq(users.id, userId));
    }
    
    return NextResponse.json({ success: true, userId });
  }

  // Create new user profile
  const newUserId = `user-${Date.now()}`;
  await db.insert(users).values({
    id: newUserId,
    email: `${newUserId}@creator.ai`,
    name: name || "Niche Creator",
    niche: niche || "AI & Dev Tools",
    brandVoice: brandVoice || "Insightful, pragmatic, direct",
  });

  cookieStore.set("swarm_user_id", newUserId, { path: "/", maxAge: 60 * 60 * 24 * 30 });

  return NextResponse.json({ success: true, userId: newUserId });
}
