import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";
import TextEditor from "./TextEditor";
import AppBar from "./AppBar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />
        <Route
          path="/documents/:id"
          element={
            <>
              <AppBar />
              <TextEditor />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;


//delete the old data