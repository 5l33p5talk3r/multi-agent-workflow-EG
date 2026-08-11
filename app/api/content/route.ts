import { NextResponse } from "next/server";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  await seedDatabase();
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";

  const list = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.userId, activeUserId))
    .orderBy(desc(contentItems.createdAt));

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";
  const body = await req.json();

  const newId = `content-${Date.now()}`;
  const newItem = {
    id: newId,
    userId: activeUserId,
    executionId: body.executionId || null,
    title: body.title || "Untitled Content Piece",
    niche: body.niche || "AI & Dev Tools",
    platform: body.platform || "twitter",
    status: body.status || "draft",
    content: body.content || "",
    metadata: typeof body.metadata === "string" ? body.metadata : JSON.stringify(body.metadata || {}),
    engagementMetrics: typeof body.engagementMetrics === "string" ? body.engagementMetrics : JSON.stringify(body.engagementMetrics || {}),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(contentItems).values(newItem);
  return NextResponse.json(newItem);
}
