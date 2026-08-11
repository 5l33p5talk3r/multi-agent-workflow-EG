import { NextResponse } from "next/server";
import { db } from "@/db";
import { nicheTrends } from "@/db/schema";
import { desc } from "drizzle-orm";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  await seedDatabase();
  const list = await db.select().from(nicheTrends).orderBy(desc(nicheTrends.score));
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newId = `trend-${Date.now()}`;

  const newTrend = {
    id: newId,
    niche: body.niche || "AI & Dev Tools",
    topic: body.topic || "Emerging Developer Protocol",
    summary: body.summary || "High viral velocity topic detected in specialized dev forums.",
    score: body.score || 88,
    sources: typeof body.sources === "string" ? body.sources : JSON.stringify(body.sources || ["GitHub", "X/Twitter"]),
    suggestedHooks: typeof body.suggestedHooks === "string" ? body.suggestedHooks : JSON.stringify(body.suggestedHooks || []),
    createdAt: new Date(),
  };

  await db.insert(nicheTrends).values(newTrend);
  return NextResponse.json(newTrend);
}
