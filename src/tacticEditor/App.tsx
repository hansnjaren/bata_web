import { useLocation } from "react-router-dom";
import Timeline from "../components/Timeline";
import { timeZoneNumMin, widthMultMin } from "../constants/sizes";

export default function TacticEditor() {
  const location = useLocation();
  const {
    filteredCharacterNames = [],
    attackItems = [],
    buffItems = [],
    checkedUE2 = {},
    widthMult = widthMultMin,
    timeZoneNum = timeZoneNumMin,
  } = location.state || {};
  return (
    <div className="App">
      <header className="App-header"></header>
      <Timeline
        sentFilteredCharacterNames={filteredCharacterNames}
        sentAttackItems={attackItems}
        sentBuffItems={buffItems}
        sentCheckedUE2={checkedUE2}
        sentWidthMult={widthMult}
        sentTimeZoneNum={timeZoneNum}
      ></Timeline>
    </div>
  );
}
