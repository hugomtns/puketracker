import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const food = await prisma.food.update({
    where: { id },
    data: {
      type: body.type,
      brand: body.brand,
      details: body.details,
      active: body.active,
    },
  });
  return NextResponse.json(food);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.food.update({
    where: { id },
    data: { active: false },
  });
  return NextResponse.json({ ok: true });
}
