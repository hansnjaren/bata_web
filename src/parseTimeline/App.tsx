import React, { useState } from 'react';
import logo from './logo.svg';
import Timeline from '../components/Timeline';
import RegexParser from '../components/RegexParser';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import TacticEditor from '../tacticEditor/App';
import { GoToButton } from '../App';

export default function ParseTimeline() {
  const [parsedData, setParsedData] = useState<ParseResult[] | null>(null);
  return (
    <div className="App">
        <header className="App-header">
        </header>
        <Timeline parsedData={parsedData}></Timeline>
        <RegexParser onParse={setParsedData}></RegexParser>
    </div>
  );
}
