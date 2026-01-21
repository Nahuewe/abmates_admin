import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function NewProduct() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const file = form.image.files[0];
    let imageUrl = null;

    if (file) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      imageUrl = supabase.storage
        .from("products")
        .getPublicUrl(fileName).data.publicUrl;
    }

    const { error } = await supabase.from("products").insert({
      name: form.name.value,
      description: form.description.value,
      price: form.price.value === "" ? null : Number(form.price.value),
      image: imageUrl,
      category: form.category.value,
      status: form.status.value || null,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 p-10">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="cursor-pointer mb-6 text-sm font-bold text-green-700 hover:text-green-900 flex items-center gap-2"
        >
          ← Volver
        </button>
        <h1 className="text-3xl font-black mb-2">Nuevo producto</h1>
        <p className="text-gray-500 mb-8">
          Completa la información del producto
        </p>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block font-bold mb-2">Nombre<strong className='obligatorio'>(*)</strong></label>
            <input
              name="name"
              placeholder="Mate imperial"
              required
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Descripción</label>
            <textarea
              name="description"
              rows="4"
              placeholder="Descripción del producto"
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Precio</label>
            <input
              name="price"
              type="number"
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Categoría<strong className='obligatorio'>(*)</strong></label>
            <select
              name="category"
              required
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <option value="">Seleccionar categoría</option>
              <option value="mate">Mate</option>
              <option value="termo">Termo</option>
              <option value="bombilla">Bombilla</option>
              <option value="vaso">Vaso</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-2">Imagen</label>

            <label className="cursor-pointer block border-2 border-dashed rounded-2xl p-6 text-center hover:border-green-700 transition">
              <input
                name="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />

              <p className="text-gray-500 mb-2">
                Click para subir una imagen
              </p>

              {preview && (
                <img
                  src={preview}
                  className="mx-auto max-h-52 rounded-xl shadow"
                />
              )}
            </label>
          </div>

          <div>
            <label className="block font-bold mb-2">Insignia</label>

            <select
              name="status"
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <option value="">Sin insignia</option>
              <option value="new">Nuevo</option>
              <option value="limited">Últimos disponibles</option>
              <option value="out_of_stock">Sin stock</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="cursor-pointer w-full bg-green-700 hover:bg-green-800 transition text-white py-4 rounded-xl font-black text-lg disabled:opacity-50"
          >
            Guardar producto
          </button>
        </form>
      </div>
    </main>
  );
}
