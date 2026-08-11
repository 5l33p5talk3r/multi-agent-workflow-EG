import { NextResponse } from "next/server";
import { db } from "@/db";
import { executions, workflows } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  await seedDatabase();
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";

  const execList = await db
    .select({
      id: executions.id,
      workflowId: executions.workflowId,
      userId: executions.userId,
      topic: executions.topic,
      targetNiche: executions.targetNiche,
      targetPlatforms: executions.targetPlatforms,
      status: executions.status,
      currentStepIndex: executions.currentStepIndex,
      logs: executions.logs,
      createdAt: executions.createdAt,
      completedAt: executions.completedAt,
      workflowTitle: workflows.title,
    })
    .from(executions)
    .leftJoin(workflows, eq(executions.workflowId, workflows.id))
    .where(eq(executions.userId, activeUserId))
    .orderBy(desc(executions.createdAt));

  return NextResponse.json(execList);
}
