// src/db/seed.ts
import { db } from "./index"; // db 연결 객체 (경로 확인 필요)
import { characters, skills, enemies } from "./schema";
import characterData from "../../public/data/character.json"; // JSON 파일 불러오기
import enemyList from "../../public/data/enemy.json"; // ["Enemy1", "Enemy2", ...]

async function seedCharacters() {
  console.log("데이터 마이그레이션 시작...");

  // transaction을 쓰면 중간에 에러가 나도 이전 상태로 롤백(복구)해 줍니다. (안전함)
  await db.transaction(async (tx) => {
    for (const charItem of characterData) {
      
      // 1. 캐릭터 먼저 Insert 하고, 생성된 ID 값 받아오기 (.returning() 활용)
      const [insertedChar] = await tx
        .insert(characters)
        .values({
          name: charItem.name,
          alias: charItem.alias || [],
          ue2: charItem.UE2 || false,
        })
        .returning({ id: characters.id }); // 👈 핵심! DB가 만든 id를 반환받음

      const newCharacterId = insertedChar.id;

      // 2. 캐릭터에 속한 스킬 리스트가 있다면?
      if (charItem.skills && charItem.skills.length > 0) {
        
        // 3. 스킬 데이터에 방금 발급받은 characterId를 끼워 넣기
        const skillsToInsert = charItem.skills.map((skill) => ({
          characterId: newCharacterId, // 👈 받아온 부모 ID를 여기에 쏙!
          type: skill.type,
          alias: skill.alias || [],
          role: skill.role || [],
          delays: skill.delays || [],
          duration: skill.duration || 0,
        }));

        // 4. 스킬들을 한 번에 Insert (Bulk Insert)
        await tx.insert(skills).values(skillsToInsert);
      }
      
      console.log(`${charItem.name} 저장 완료!`);
    }
  });

  console.log("모든 데이터 마이그레이션이 완료되었습니다! 🎉");
}

async function seedEnemies() {
  // 1. JSON 배열을 DB 포맷으로 변환
  const dataToInsert = enemyList.map((name) => ({
    name: name,
  }));

  // 2. 한 번에 삽입 (Bulk Insert)
  await db.insert(enemies).values(dataToInsert).onConflictDoNothing(); 
  // .onConflictDoNothing()을 붙이면 이미 있는 이름일 경우 에러 없이 넘어갑니다.
}


// 스크립트 실행
seedCharacters().catch((err) => {
  console.error("seedCharacters 에러 발생:", err);
});


seedEnemies().catch((err) => {
  console.error("seedEnemies 에러 발생:", err);
});