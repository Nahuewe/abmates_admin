import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        alert("Producto no encontrado");
        navigate("/dashboard");
        return;
      }

      setProduct(data);
      setPreview(data.image || null);
    };

    load();
  }, [id, navigate]);

  const update = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target;
    const file = form.image.files[0];
    let imageUrl = product.image;

    if (file) {
      if (product.image) {
        const url = new URL(product.image);
        const oldPath = url.pathname.split("/storage/v1/object/public/products/")[1];
        if (oldPath) {
          await supabase.storage.from("products").remove([oldPath]);
        }
      }

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

    const { error } = await supabase
      .from("products")
      .update({
        name: form.name.value,
        description: form.description.value,
        price: form.price.value === "" ? null : Number(form.price.value),
        category: form.category.value,
        image: imageUrl,
        status: form.status.value || null,
      })
      .eq("id", id);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  const remove = async () => {
    if (!confirm("¿Eliminar producto definitivamente?")) return;

    if (product.image) {
      const url = new URL(product.image);
      const path = url.pathname.split("/storage/v1/object/public/products/")[1];

      if (path) {
        await supabase.storage.from("products").remove([path]);
      }
    }

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) return alert(error.message);

    navigate("/dashboard");
  };

  if (!product) return null;

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
        <h1 className="text-3xl font-black mb-2">Editar producto</h1>
        <p className="text-gray-500 mb-8">
          Modificá la información del producto
        </p>

        <form onSubmit={update} className="space-y-6">
          <div>
            <label className="block font-bold mb-2">Nombre<strong className='obligatorio'>(*)</strong></label>
            <input
              name="name"
              defaultValue={product.name}
              required
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Descripción</label>
            <textarea
              name="description"
              rows="4"
              defaultValue={product.description || ""}
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Precio</label>
            <input
              name="price"
              type="number"
              defaultValue={product.price}
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Categoría<strong className='obligatorio'>(*)</strong></label>
            <select
              name="category"
              defaultValue={product.category}
              required
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            >
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
                Click para reemplazar la imagen
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
              defaultValue={product.status || ""}
              className="w-full border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-700"
            >
              <option value="">Sin insignia</option>
              <option value="new">Nuevo</option>
              <option value="limited">Últimos disponibles</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="cursor-pointer w-full bg-green-700 hover:bg-green-800 transition text-white py-4 rounded-xl font-black text-lg disabled:opacity-50"
          >
            Guardar cambios
          </button>
        </form>

        <button
          onClick={remove}
          className="cursor-pointer mt-6 w-full bg-red-600 hover:bg-red-700 transition text-white py-3 rounded-xl font-bold"
        >
          Eliminar producto
        </button>
      </div>
    </main>
  );
}
