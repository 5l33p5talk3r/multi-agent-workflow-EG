import { NextResponse } from "next/server";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { eq, or, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  await seedDatabase();
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";

  const workflowList = await db
    .select()
    .from(workflows)
    .where(or(eq(workflows.userId, activeUserId), eq(workflows.isTemplate, true), isNull(workflows.userId)));

  return NextResponse.json(workflowList);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";
  const body = await req.json();

  const newId = `wf-${Date.now()}`;
  const newWf = {
    id: newId,
    userId: activeUserId,
    title: body.title || "New Agent Swarm Workflow",
    description: body.description || "Multi-agent pipeline for niche content creation.",
    nicheCategory: body.nicheCategory || "AI & Dev Tools",
    isTemplate: false,
    nodes: typeof body.nodes === "string" ? body.nodes : JSON.stringify(body.nodes || []),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(workflows).values(newWf);
  return NextResponse.json(newWf);
}
