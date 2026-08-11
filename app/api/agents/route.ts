import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq, or, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  await seedDatabase();
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";

  const agentList = await db
    .select()
    .from(agents)
    .where(or(eq(agents.userId, activeUserId), isNull(agents.userId)));

  return NextResponse.json(agentList);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";
  const body = await req.json();

  const newId = `agent-${Date.now()}`;
  const newAgent = {
    id: newId,
    userId: activeUserId,
    name: body.name || "Custom Swarm Agent",
    role: body.role || "Niche Content Specialist",
    avatar: body.avatar || "🤖",
    color: body.color || "indigo",
    model: body.model || "Claude 3.5 Sonnet",
    temperature: body.temperature ? parseFloat(body.temperature) : 0.7,
    systemPrompt: body.systemPrompt || "You are an expert niche content creation agent.",
    tools: typeof body.tools === "string" ? body.tools : JSON.stringify(body.tools || []),
    isDefault: false,
  };

  await db.insert(agents).values(newAgent);
  return NextResponse.json(newAgent);
}
