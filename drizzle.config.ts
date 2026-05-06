import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // 1. 내가 작성할(혹은 Pull 해올) 스키마 파일의 경로
  schema: "./src/db/schema.ts",

  // 2. 마이그레이션 파일들이 저장될 폴더
  out: "./drizzle",

  // 3. 사용하는 DB 종류 (Neon은 PostgreSQL 기반입니다)
  dialect: "postgresql",

  // 4. DB 접속 정보 (.env 파일의 DATABASE_URL 사용)
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  schemaFilter: ["public", "neon_auth"],
});
