import { NextResponse } from "next/server";
import { db } from "@/db";
import { executions, workflows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { runExecutionStep } from "@/lib/agent-engine";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: workflowId } = await params;
  const cookieStore = await cookies();
  const activeUserId = cookieStore.get("swarm_user_id")?.value || "demo-user-1";

  const body = await req.json();
  const { topic, targetNiche, targetPlatforms, autoRun } = body;

  const [wf] = await db.select().from(workflows).where(eq(workflows.id, workflowId));
  if (!wf) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  const newExecId = `exec-${Date.now()}`;
  const newExec = {
    id: newExecId,
    workflowId: wf.id,
    userId: activeUserId,
    topic: topic || "Emerging Niche Trend Analysis",
    targetNiche: targetNiche || wf.nicheCategory || "Tech & AI",
    targetPlatforms: JSON.stringify(targetPlatforms || ["twitter", "substack", "linkedin", "youtube"]),
    status: "queued",
    currentStepIndex: 0,
    scratchpad: JSON.stringify({}),
    logs: JSON.stringify([]),
    finalOutputs: JSON.stringify({}),
    createdAt: new Date(),
  };

  await db.insert(executions).values(newExec);

  // If autoRun is true, execute the first step immediately
  if (autoRun) {
    try {
      const stepResult = await runExecutionStep(newExecId);
      return NextResponse.json({ executionId: newExecId, stepResult });
    } catch (err: any) {
      return NextResponse.json({ executionId: newExecId, error: err.message });
    }
  }

  return NextResponse.json({ executionId: newExecId, status: "queued" });
}
