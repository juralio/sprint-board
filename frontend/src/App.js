import React, { useState } from "react";
import Board from "./component/Board";
import "./App.css";
import { Button } from "@material-ui/core";
import YesterdayTodayBlockersBoard from "./component/YesterdayTodayBlockersBoard";

function App() {
  const [yesterdayTodayBlockersMode, setYesterdayTodayBlockersMode] = useState(
    true
  );

  return (
    <div className="App">
      <Button
        color="primary"
        variant="contained"
        onClick={() =>
          setYesterdayTodayBlockersMode(!yesterdayTodayBlockersMode)
        }
      >
        {yesterdayTodayBlockersMode
          ? "Switch to old view"
          : "Switch to new view"}
      </Button>
      {yesterdayTodayBlockersMode ? <YesterdayTodayBlockersBoard /> : <Board />}
    </div>
  );
}

export default App;
