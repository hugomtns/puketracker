import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const foods = await prisma.food.findMany({
    where: { active: true },
    orderBy: [{ type: "asc" }, { brand: "asc" }],
  });
  return NextResponse.json(foods);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const food = await prisma.food.create({
    data: {
      type: body.type,
      brand: body.brand,
      details: body.details || "",
    },
  });
  return NextResponse.json(food);
}
