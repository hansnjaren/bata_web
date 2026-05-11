import { NextResponse } from "next/server";
import { db } from "@/db";
import { skills } from "@/db/schema"; // schema.ts에서 정의한 테이블 객체

// 1. 데이터 읽기 (Read)
export async function GET() {
  try {
    const allSkills = await db.select().from(skills);
    return NextResponse.json(allSkills);
  } catch (error: unknown) {
    console.error("Skills GET Error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }
    else {
      return NextResponse.json(
        { error: String(error) },
        { status: 500 },
      );
    }
  }
}

// 2. 데이터 쓰기 (Create)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Drizzle을 사용한 Insert
    const newPost = await db
      .insert(skills)
      .values({
        id: body.id,
        characterId: body.characterId,
        type: body.type,
        alias: body.alias,
        role: body.role,
        delays: body.delays,
        duration: body.duration,
      })
      .returning(); // 삽입된 데이터를 바로 반환받고 싶을 때

    return NextResponse.json(newPost, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "데이터 저장에 실패했습니다." },
      { status: 400 },
    );
  }
}
