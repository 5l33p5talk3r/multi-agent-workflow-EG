import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedDatabase } from "@/lib/seed";
import { cookies } from "next/headers";

export async function GET() {
  await seedDatabase();

  const cookieStore = await cookies();
  const userIdCookie = cookieStore.get("swarm_user_id")?.value || "demo-user-1";

  let [user] = await db.select().from(users).where(eq(users.id, userIdCookie));

  if (!user) {
    [user] = await db.select().from(users).where(eq(users.id, "demo-user-1"));
  }

  const allUsers = await db.select({ id: users.id, name: users.name, email: users.email, niche: users.niche, avatarUrl: users.avatarUrl }).from(users);

  return NextResponse.json({
    user,
    availableAccounts: allUsers,
  });
}
