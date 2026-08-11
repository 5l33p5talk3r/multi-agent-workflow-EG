import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [agent] = await db.select().from(agents).where(eq(agents.id, id));
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }
  return NextResponse.json(agent);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await db
    .update(agents)
    .set({
      name: body.name,
      role: body.role,
      avatar: body.avatar,
      color: body.color,
      model: body.model,
      temperature: body.temperature ? parseFloat(body.temperature) : 0.7,
      systemPrompt: body.systemPrompt,
      tools: typeof body.tools === "string" ? body.tools : JSON.stringify(body.tools || []),
    })
    .where(eq(agents.id, id));

  const [updated] = await db.select().from(agents).where(eq(agents.id, id));
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(agents).where(eq(agents.id, id));
  return NextResponse.json({ success: true, id });
}
