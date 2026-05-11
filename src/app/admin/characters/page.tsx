import { Metadata } from "next";
import CharactersAdmin from "@/components/admin/CharactersAdmin";

export const metadata: Metadata = {
  title: "Characters Admin",
  description: "캐릭터 데이터 편집",
};

export default function Page() {
  return <CharactersAdmin />;
}
