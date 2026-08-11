import { NextResponse } from "next/server";
import { db } from "@/db";
import { executions, workflows } from "@/db/schema";
import { eq } from "drizzle-orm";
import { runExecutionStep } from "@/lib/agent-engine";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const [exec] = await db
    .select({
      id: executions.id,
      workflowId: executions.workflowId,
      userId: executions.userId,
      topic: executions.topic,
      targetNiche: executions.targetNiche,
      targetPlatforms: executions.targetPlatforms,
      status: executions.status,
      currentStepIndex: executions.currentStepIndex,
      scratchpad: executions.scratchpad,
      logs: executions.logs,
      finalOutputs: executions.finalOutputs,
      createdAt: executions.createdAt,
      completedAt: executions.completedAt,
    })
    .from(executions)
    .where(eq(executions.id, id));

  if (!exec) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  let wf = null;
  if (exec.workflowId) {
    [wf] = await db.select().from(workflows).where(eq(workflows.id, exec.workflowId));
  }

  return NextResponse.json({
    ...exec,
    workflow: wf,
    scratchpadParsed: JSON.parse(exec.scratchpad || "{}"),
    logsParsed: JSON.parse(exec.logs || "[]"),
    finalOutputsParsed: JSON.parse(exec.finalOutputs || "{}"),
    targetPlatformsParsed: JSON.parse(exec.targetPlatforms || "[]"),
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { action, feedback } = body;

  const [exec] = await db.select().from(executions).where(eq(executions.id, id));
  if (!exec) {
    return NextResponse.json({ error: "Execution not found" }, { status: 404 });
  }

  if (action === "step" || action === "approve") {
    const result = await runExecutionStep(id);
    return NextResponse.json(result);
  }

  if (action === "autorun_all") {
    let result: any = null;
    let maxSteps = 10;
    while (maxSteps > 0) {
      result = await runExecutionStep(id);
      if (result.status === "completed" || result.status === "waiting_approval" || result.status === "failed") {
        break;
      }
      maxSteps--;
    }
    return NextResponse.json({ status: result?.status || "done", lastResult: result });
  }

  if (action === "reject_and_revise") {
    // Add human feedback into scratchpad and set status to running
    const scratchpad = JSON.parse(exec.scratchpad || "{}");
    scratchpad.human_feedback = feedback || "Revise for brevity and directness.";
    
    // Back track index by 1 to re-run
    const prevIndex = Math.max(0, (exec.currentStepIndex || 1) - 1);

    await db
      .update(executions)
      .set({
        status: "running",
        currentStepIndex: prevIndex,
        scratchpad: JSON.stringify(scratchpad),
      })
      .where(eq(executions.id, id));

    const result = await runExecutionStep(id);
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(executions).where(eq(executions.id, id));
  return NextResponse.json({ success: true, id });
}
