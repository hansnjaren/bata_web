import React, { useState } from 'react';
import logo from './logo.svg';
import Timeline from '../components/Timeline';
import RegexParser from '../components/RegexParser';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { GoToButton } from '../App';

export default function TacticEditor() {
  const location = useLocation();
  const { parsedData = [], attackItems = [], buffItems = [], checkedUE2 = {} } = location.state || {};
  return (
    <div className="App">
        <header className="App-header">
        </header>
        <Timeline parsedData={parsedData} sentAttackItems={attackItems} sentBuffItems={buffItems} sentCheckedUE2={checkedUE2}></Timeline>
    </div>
  );
}
