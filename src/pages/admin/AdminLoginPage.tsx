import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Login01Icon } from "@hugeicons/core-free-icons";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "../../features/auth/api/auth";
import { useAuth } from "../../features/auth/hooks/useAuth";

const authMessages = {
  "auth/invalid-credential": "El correo o la contraseña no son correctos.",
  "auth/invalid-email": "Introduce un correo electrónico válido.",
  "auth/too-many-requests":
    "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.",
};

export function AdminLoginPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function closeModal() {
    navigate("/", { replace: true });
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);

    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      await loginAdmin(email, password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (loginError: unknown) {
      let message = "No se pudo iniciar sesión.";
      if (typeof loginError === "object" && loginError !== null) {
        const le = loginError as { code?: string; message?: string };
        const code = le.code as keyof typeof authMessages | undefined;
        message = (code && authMessages[code]) || le.message || message;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!loading && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl"
      >
        <button
          type="button"
          onClick={closeModal}
          aria-label="Cerrar acceso administrativo"
          className="absolute right-4 top-4 grid size-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="mb-8 pr-8">
          <h1
            id="admin-login-title"
            className="text-2xl font-semibold text-[#1E3A8A]"
          >
            Acceso administrativo
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa con la cuenta creada por la administración.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Correo electrónico
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Contraseña
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1E3A8A] px-4 py-2.5 font-semibold text-white transition hover:bg-[#6885d9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <HugeiconsIcon icon={Login01Icon} size={20} />
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </section>
    </div>
  );
}
