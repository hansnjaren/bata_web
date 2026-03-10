import { ParseResult } from "@/interfaces/timelineData";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const pattern =
  /\(?(\d{2}:\d{2}\.\d{0,3})\)?(?:\s*(?:\([^)]*\)|\[[^\]]*\]))*\s*C?\**[([]*([^\s*>()[\]]+)[)\]]*\**(?:\s*(ON|OFF|\d타|\d스))?(?:\s*>\s*(?:\[([^\]]+)\](?:\([^)]+\))?|([^\n-]*))(?=\s*-|\n|$))?/g;

interface RegexParserProps {
  onParse: (data: ParseResult[] | null) => void;
}

export default function RegexParser({ onParse }: RegexParserProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const parsedData = useMemo<ParseResult[] | null>(() => {
    const cleaned = input.replace(/`[^`]*`/g, " ");
    if (!cleaned) return null;

    const matches = Array.from(cleaned.matchAll(pattern)).map((match) => ({
      time: match[1],
      character: match[2],
      type: match[3] || null,
      target: (match[4] ?? match[5])?.trim() || null,
    }));

    return matches.length > 0 ? matches : null;
  }, [input]);

  const parseResults = useMemo(() => {
    if (!input) return null;
    return parsedData
      ? JSON.stringify(parsedData, null, 2)
      : "No matches found";
  }, [input, parsedData]);

  useEffect(() => {
    onParse(parsedData);
  }, [parsedData, onParse]);

  const handleInput = (e: FormEvent<HTMLTextAreaElement>) => {
    setInput(e.currentTarget.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        placeholder="입력하세요..."
        value={input}
        onChange={handleInput}
        style={{
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
          resize: "none",
        }}
      />
      <pre style={{ backgroundColor: "#eee", padding: 10, minHeight: 100 }}>
        {parseResults}
      </pre>
    </div>
  );
}