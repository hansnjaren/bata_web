import React, { useState } from 'react';
import logo from './logo.svg';
import Timeline from './components/Timeline';
import RegexParser from './components/RegexParser';

function App() {
  const [parsedData, setParsedData] = useState<{time: string; character: string; type: string | null; target: string | null}[] | null>(null);
  return (
    <div className="App">
      <header className="App-header">
        <Timeline parsedData={parsedData}></Timeline>
        <RegexParser onParse={setParsedData}></RegexParser>
      </header>
    </div>
  );
}

export default App;
