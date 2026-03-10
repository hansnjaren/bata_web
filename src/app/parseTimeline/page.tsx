import ParseTimeline from "@/components/ParseTimeline";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Timeline Parser',
  description: 'Parse tactic timeline',
};

export default function Page() {
  return <ParseTimeline />;
}