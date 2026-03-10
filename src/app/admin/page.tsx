import Admin from "@/components/Admin";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: 'Admin',
  description: 'Admin page',
};

export default function Page() {
  return <Admin />;
}