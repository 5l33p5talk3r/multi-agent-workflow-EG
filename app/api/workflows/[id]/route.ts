import { NextResponse } from "next/server";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [wf] = await db.select().from(workflows).where(eq(workflows.id, id));
  if (!wf) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }
  return NextResponse.json(wf);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await db
    .update(workflows)
    .set({
      title: body.title,
      description: body.description,
      nicheCategory: body.nicheCategory,
      nodes: typeof body.nodes === "string" ? body.nodes : JSON.stringify(body.nodes || []),
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, id));

  const [updated] = await db.select().from(workflows).where(eq(workflows.id, id));
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(workflows).where(eq(workflows.id, id));
  return NextResponse.json({ success: true, id });
}
