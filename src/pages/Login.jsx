import React, { useState } from "react";
import loginBg from "../assets/login.jpg"; // Asegúrate que esta es la imagen que quieres de fondo

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    // CONTENEDOR PRINCIPAL CON LA IMAGEN DE FONDO
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* TARJETA DEL LOGIN */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-full max-w-sm p-10">
        
        {/* ELIMINADO: Se quitó la etiqueta o componente que mostraba el logo aquí,
            que era lo que aparecía dentro del círculo rojo en tu imagen. */}
        
        <h2 className="text-2xl text-center font-semibold text-white mb-2">
          Aplicación para administradores de TI
        </h2>

        <p className="text-center text-cyan-300 text-sm mb-8">
          Acceso para personal de TI
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Usuario
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900/50 text-white p-3 rounded-md border border-gray-700"
              placeholder="admin.it"
            />
          </div>

          {/* CONTRASEÑA */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900/50 text-white p-3 rounded-md border border-gray-700"
              placeholder="********"
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-lg text-white font-semibold shadow-lg"
          >
            Iniciar sesión
          </button>

        </form>

        {/* FOOTER */}
        <p className="text-xs text-center text-gray-300 mt-10 pt-4 border-t border-gray-700">
          © {new Date().getFullYear()} IT Manager
        </p>

      </div>
    </div>
  );
}