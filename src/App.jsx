import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewProduct from "./pages/NewProduct";
import EditProduct from "./pages/EditProduct";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/products/new" element={<NewProduct />} />
      <Route path="/products/edit/:id" element={<EditProduct />} />
    </Routes>
  );
}
