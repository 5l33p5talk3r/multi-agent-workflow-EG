import { NextResponse } from "next/server";
import { db } from "@/db";
import { contentItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
  if (!item) {
    return NextResponse.json({ error: "Content item not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  await db
    .update(contentItems)
    .set({
      title: body.title,
      platform: body.platform,
      status: body.status,
      content: body.content,
      metadata: typeof body.metadata === "string" ? body.metadata : JSON.stringify(body.metadata || {}),
      updatedAt: new Date(),
    })
    .where(eq(contentItems.id, id));

  const [updated] = await db.select().from(contentItems).where(eq(contentItems.id, id));
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(contentItems).where(eq(contentItems.id, id));
  return NextResponse.json({ success: true, id });
}
