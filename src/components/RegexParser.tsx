import { FormEvent, useEffect, useRef, useState } from "react";

const pattern =
  /\(?(\d{2}:\d{2}\.\d{0,3})\)?(?:\s*(?:\([^)]*\)|\[[^\]]*\]))*\s*C?\**[([]*([^\s*>()[\]]+)[)\]]*\**(?:\s*(ON|OFF|\d타|\d스))?(?:\s*>\s*(?:\[([^\]]+)\](?:\([^)]+\))?|([^\n-]*))(?=\s*-|\n|$))?/g;

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const cleaned = input.replace(/`[^`]*`/g, " ");

    if (cleaned) {
      const matches = Array.from(cleaned.matchAll(pattern)).map((match) => ({
        time: match[1],
        character: match[2],
        type: match[3] || null,
        target: (match[4] ?? match[5])?.trim() || null,
      }));
      onParse(matches.length > 0 ? matches : null);
      setParseResults(
        matches.length > 0
          ? JSON.stringify(matches, null, 2)
          : "No matches found",
      );
    } else {
      onParse(null);
      setParseResults(null);
    }
  }, [input, onParse]);

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
