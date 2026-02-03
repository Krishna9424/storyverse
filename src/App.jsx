import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/profile";

import Stories from "./pages/Stories";
import Story from "./pages/Story";

import WritingStudio from "./pages/WritingStudio";
import ClassicEditor from "./pages/ClassicEditor";

import ProtectedRoute from "./components/ProtectedRoute";
import WriteEditor from "./pages/WriteEditor";

<Route path="/write/editor" element={<WriteEditor />} />

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* HOME */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* STORIES */}
        <Route
          path="/stories"
          element={
            <ProtectedRoute>
              <Stories />
            </ProtectedRoute>
          }
        />

        <Route
          path="/story/:id"
          element={
            <ProtectedRoute>
              <Story />
            </ProtectedRoute>
          }
        />

        {/* WRITER */}
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <WritingStudio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/write/editor"
          element={
            <ProtectedRoute>
              <ClassicEditor />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
