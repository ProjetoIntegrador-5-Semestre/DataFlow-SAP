import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { authApi } from "../lib/api";
import { ProjectLogo } from "./ProjectLogo";

export function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await authApi.register({
        full_name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert("Conta criada com sucesso!");

      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <ProjectLogo compact iconClassName="h-14 w-14 mb-4" />

          <h2 className="text-2xl font-bold">Criar Conta</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome Completo"
            className="w-full p-3 border rounded-xl"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            className="w-full p-3 border rounded-xl"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 border rounded-xl"
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Já tem conta?{" "}
          <Link to="/login" className="text-blue-600">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
