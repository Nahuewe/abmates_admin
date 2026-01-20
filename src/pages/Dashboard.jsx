import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { BADGES } from "../utils/badges";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/");
        return;
      }

      const { data: productsData, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setProducts(productsData || []);
    };

    init();
  }, [navigate]);

  async function remove(id) {
    if (!confirm("¿Seguro que querés eliminar este producto?")) return;

    const product = products.find((p) => p.id === id);

    if (product?.image) {
      const url = new URL(product.image);
      const path = url.pathname.split("/storage/v1/object/public/products/")[1];
      if (path) await supabase.storage.from("products").remove([path]);
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return alert(error.message);

    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">
              Gestión de productos
            </h1>
            <p className="text-gray-600 text-sm">
              Crear, editar y eliminar productos del catálogo
            </p>
          </div>

          <Link
            to="/products/new"
            className="cursor-pointer bg-green-700 hover:bg-green-800 transition-colors text-white px-6 py-3 rounded-xl font-bold shadow-lg"
          >
            + Agregar producto
          </Link>
        </div>

        {products.length === 0 && (
          <div className="bg-white p-10 rounded-2xl shadow text-center">
            <p className="text-gray-600 mb-4">
              No hay productos cargados todavía
            </p>
            <Link
              to="/products/new"
              className="cursor-pointer bg-green-700 hover:bg-green-800 transition text-white px-6 py-3 rounded-xl font-bold"
            >
              Crear primer producto
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="relative bg-white rounded-2xl shadow hover:shadow-2xl transition-shadow p-6 flex flex-col"
            >

              {p.badge && BADGES[p.badge] && (
                <span
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-black shadow ${BADGES[p.badge].className}`}
                >
                  {BADGES[p.badge].label}
                </span>
              )}

              {p.image ? (
                <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={p.image}
                    className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 rounded-2xl mb-4 flex items-center justify-center text-gray-400 text-sm">
                  Sin imagen
                </div>
              )}

              <h2 className="font-black text-xl text-gray-900 mb-1">
                {p.name}
              </h2>

              <p className="text-sm text-gray-600 grow">
                {p.description || "Sin descripción"}
              </p>

              {p.price != null && (
                <p className="text-2xl font-black text-green-700 my-4">${p.price}</p>
              )}

              <div className="flex gap-3 mt-auto">
                <Link
                  to={`/products/edit/${p.id}`}
                  className="cursor-pointer flex-1 text-center bg-blue-600 hover:bg-blue-700 transition text-white py-2 rounded-lg font-bold"
                >
                  Editar
                </Link>

                <button
                  onClick={() => remove(p.id)}
                  className="cursor-pointer flex-1 bg-red-600 hover:bg-red-700 transition text-white py-2 rounded-lg font-bold"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
