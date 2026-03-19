import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const entries = await prisma.dailyEntry.findMany({
    include: {
      breakfast: true,
      dinner: true,
      kibble: true,
      extras: { include: { food: true } },
      pukeTypes: true,
    },
    orderBy: { date: "asc" },
  });

  const totalDays = entries.length;
  const pukeDays = entries.filter((e) => e.puked).length;
  const totalPukes = entries.reduce((sum, e) => sum + e.pukeCount, 0);

  // Track food correlation with puking
  const foodStats: Record<string, { name: string; daysEaten: number; daysWithPuke: number }> = {};

  function trackFood(foodId: string | null, foodName: string, puked: boolean) {
    if (!foodId) return;
    if (!foodStats[foodId]) {
      foodStats[foodId] = { name: foodName, daysEaten: 0, daysWithPuke: 0 };
    }
    foodStats[foodId].daysEaten++;
    if (puked) foodStats[foodId].daysWithPuke++;
  }

  function foodLabel(food: { brand: string; details: string; type: string }) {
    return `${food.brand}${food.details ? ` - ${food.details}` : ""} (${food.type})`;
  }

  // Puke type frequency
  const pukeTypeCounts: Record<string, number> = {};

  for (const entry of entries) {
    if (entry.breakfast) {
      trackFood(entry.breakfastId, foodLabel(entry.breakfast), entry.puked);
    }
    if (entry.dinner) {
      trackFood(entry.dinnerId, foodLabel(entry.dinner), entry.puked);
    }
    if (entry.kibble) {
      trackFood(entry.kibbleId, foodLabel(entry.kibble), entry.puked);
    }
    for (const extra of entry.extras) {
      trackFood(extra.foodId, foodLabel(extra.food), entry.puked);
    }
    for (const pt of entry.pukeTypes) {
      pukeTypeCounts[pt.type] = (pukeTypeCounts[pt.type] || 0) + 1;
    }
  }

  // Sort foods by puke rate (descending), min 2 days eaten
  const foodCorrelations = Object.values(foodStats)
    .filter((f) => f.daysEaten >= 2)
    .map((f) => ({
      ...f,
      pukeRate: Math.round((f.daysWithPuke / f.daysEaten) * 100),
    }))
    .sort((a, b) => b.pukeRate - a.pukeRate);

  // Recent trend: last 7 and 30 days
  const now = new Date();
  const last7 = entries.filter(
    (e) => now.getTime() - new Date(e.date).getTime() < 7 * 86400000
  );
  const last30 = entries.filter(
    (e) => now.getTime() - new Date(e.date).getTime() < 30 * 86400000
  );

  return NextResponse.json({
    totalDays,
    pukeDays,
    totalPukes,
    pukeRate: totalDays ? Math.round((pukeDays / totalDays) * 100) : 0,
    foodCorrelations,
    pukeTypeCounts,
    last7: {
      days: last7.length,
      pukeDays: last7.filter((e) => e.puked).length,
    },
    last30: {
      days: last30.length,
      pukeDays: last30.filter((e) => e.puked).length,
    },
  });
}
