import { db } from "@/lib/db";
import { languages, NewLanguage } from "@/lib/db/schema";

export async function GET() {
  const data = await db.select().from(languages);

  return Response.json(data);
}

export async function POST(req: Request) {
  const data: NewLanguage = await req.json();
  const res = await db.insert(languages).values(data).returning();

  return Response.json(res[0]);
}
