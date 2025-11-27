import React from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ParseTimeline from "./parseTimeline/App";
import TacticEditor from "./tacticEditor/App";

export function GoToButton({
  children,
  route,
}: {
  children?: React.ReactNode;
  route: string;
}) {
  const navigate = useNavigate();
  const goToParser = () => {
    navigate(route);
  };

  return <button onClick={goToParser}>{children || "Click it!"}</button>;
}

function NavigationButtons() {
  const location = useLocation();
  return (
    <div>
      {location.pathname !== "/" && (
        <GoToButton route="/">Go to Home</GoToButton>
      )}
      {location.pathname !== "/parseTimeline" && (
        <GoToButton route="/parseTimeline">Go to parser</GoToButton>
      )}
      {location.pathname !== "/tacticEditor" && (
        <GoToButton route="/tacticEditor">Go to timeline editor</GoToButton>
      )}
    </div>
  );
}

function Home() {
  return (
    <div className="App">
      <header className="App-header"></header>
    </div>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <NavigationButtons />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/parseTimeline" element={<ParseTimeline />} />
          <Route path="/tacticEditor" element={<TacticEditor />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
