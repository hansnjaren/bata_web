import { useState } from "react";
import RegexParser from "../components/RegexParser";
import Timeline from "../components/Timeline";

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
