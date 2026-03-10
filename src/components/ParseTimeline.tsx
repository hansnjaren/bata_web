'use client'

import RegexParser from "@/components/RegexParser";
import Timeline from "@/components/Timeline";
import { ParseResult } from "@/interfaces/timelineData";
import { useState } from "react";

export default function ParseTimeline() {
  const [parsedData, setParsedData] = useState<ParseResult[] | null>(null);
  return (
    <div className="App">
      <header className="App-header"></header>
      <Timeline parsedData={parsedData}></Timeline>
      <RegexParser onParse={setParsedData}></RegexParser>
    </div>
  );
}
