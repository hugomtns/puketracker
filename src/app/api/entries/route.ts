import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (date) {
    const entry = await prisma.dailyEntry.findUnique({
      where: { date: new Date(date) },
      include: {
        breakfast: true,
        dinner: true,
        kibble: true,
        extras: { include: { food: true } },
        pukeTypes: true,
      },
    });
    return NextResponse.json(entry);
  }

  const where: Record<string, unknown> = {};
  if (from || to) {
    where.date = {};
    if (from) (where.date as Record<string, Date>).gte = new Date(from);
    if (to) (where.date as Record<string, Date>).lte = new Date(to);
  }

  const entries = await prisma.dailyEntry.findMany({
    where,
    include: {
      breakfast: true,
      dinner: true,
      kibble: true,
      extras: { include: { food: true } },
      pukeTypes: true,
    },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const dateObj = new Date(body.date);

  const entry = await prisma.dailyEntry.upsert({
    where: { date: dateObj },
    create: {
      date: dateObj,
      breakfastId: body.breakfastId || null,
      dinnerId: body.dinnerId || null,
      kibbleId: body.kibbleId || null,
      puked: body.puked || false,
      pukeCount: body.pukeCount || 0,
      notes: body.notes || "",
      extras: {
        create: (body.extraIds || []).map((foodId: string) => ({ foodId })),
      },
      pukeTypes: {
        create: (body.pukeTypes || []).map((type: string) => ({ type })),
      },
    },
    update: {
      breakfastId: body.breakfastId || null,
      dinnerId: body.dinnerId || null,
      kibbleId: body.kibbleId || null,
      puked: body.puked || false,
      pukeCount: body.pukeCount || 0,
      notes: body.notes || "",
    },
  });

  // For updates, re-create extras and pukeTypes
  if (body.extraIds !== undefined) {
    await prisma.entryExtra.deleteMany({ where: { entryId: entry.id } });
    if (body.extraIds?.length) {
      await prisma.entryExtra.createMany({
        data: body.extraIds.map((foodId: string) => ({
          entryId: entry.id,
          foodId,
        })),
      });
    }
  }

  if (body.pukeTypes !== undefined) {
    await prisma.pukeType.deleteMany({ where: { entryId: entry.id } });
    if (body.pukeTypes?.length) {
      await prisma.pukeType.createMany({
        data: body.pukeTypes.map((type: string) => ({
          entryId: entry.id,
          type,
        })),
      });
    }
  }

  const full = await prisma.dailyEntry.findUnique({
    where: { id: entry.id },
    include: {
      breakfast: true,
      dinner: true,
      kibble: true,
      extras: { include: { food: true } },
      pukeTypes: true,
    },
  });

  return NextResponse.json(full);
}
