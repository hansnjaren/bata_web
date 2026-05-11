import { Metadata } from "next";
import EnemiesAdmin from "@/components/admin/EnemiesAdmin";

export const metadata: Metadata = {
  title: "Enemies Admin",
  description: "적 데이터 편집",
};

export default function Page() {
  return <EnemiesAdmin />;
}
