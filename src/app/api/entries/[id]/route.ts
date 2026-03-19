import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.pukeType.deleteMany({ where: { entryId: id } });
  await prisma.entryExtra.deleteMany({ where: { entryId: id } });
  await prisma.dailyEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
