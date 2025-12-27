// src/router/AppRouter.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Example from "../pages/Example";
import '../index.css';


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Example initial={10} />} />
      </Routes>
    </BrowserRouter>
  );
}
