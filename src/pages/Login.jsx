import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg("Credenciales incorrectas");
      return;
    }

    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-950 via-green-900 to-green-950 px-4">
      <form
        onSubmit={submit}
        className="bg-white p-10 rounded-3xl w-full max-w-sm shadow-2xl relative"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-green-900">
            Panel Admin
          </h1>
          <p className="text-gray-500 mt-1">
            Acceso exclusivo
          </p>
        </div>

        <div className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="input"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            className="input"
            required
          />
        </div>

        {errorMsg && (
          <p className="text-red-600 text-sm mt-4 text-center">
            {errorMsg}
          </p>
        )}

        <button
          disabled={loading}
          className={`btn-green w-full mt-6 ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-xs text-gray-400 text-center mt-6">
          AB Mates · Administración
        </p>
      </form>
    </main>
  );
}
