import React, { useState, useEffect } from "react";

const pattern = /\(?(\d{2}:\d{2}\.\d{3})\)?\s*C?([^\s>]+)(?:\s*(ON|\d타|\d스))?(?:>([^\s]+))?/g;

type ParseResult = {
  time: string;
  character: string;
  type: string | null;
  target: string | null;
}[];

interface RegexParserProps {
  onParse: (data: ParseResult | null) => void;
}

export default function RegexParser({ onParse }: RegexParserProps) {
  const [input, setInput] = useState("");
  const [parseResults, setParseResults] = useState<string | null>(null);

  useEffect(() => {
    if (input) {
      const matches = Array.from(input.matchAll(pattern)).map((match) => ({
        time: match[1],
        character: match[2],
        type: match[3] || null,
        target: match[4] || null,
      }));
      onParse(matches.length > 0 ? matches : null);
      setParseResults(
        matches.length > 0
          ? JSON.stringify(matches, null, 2)
          : "No matches found"
      );
    } else {
      onParse(null);
      setParseResults(null);
    }
  }, [input, onParse]);

  return (
    <div>
      <textarea
        placeholder="입력하세요..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", height: "150px", fontSize: 16 }}
      />
      <pre style={{ backgroundColor: "#eee", padding: 10, minHeight: 100 }}>
        {parseResults}
      </pre>
    </div>
  );
}
