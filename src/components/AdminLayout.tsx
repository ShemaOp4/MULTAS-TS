import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  DashboardSquare01Icon,
  Logout01Icon,
  Note05Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../features/auth/api/auth";
import { useAuth } from "../features/auth/hooks/useAuth";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-[#1E3A8A] text-white"
      : "text-slate-600 hover:bg-[#c1cff5] hover:text-slate-950"
  }`;

export function AdminLayout() {
  const auth = useAuth();
  const admin = auth?.admin;
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutAdmin();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto w-8xl">
          <p className="font-bold text-[#1E3A8A] text-3xl">
            Panel administrativo
          </p>
          <p className="text-sm text-slate-500">
            {String(
              admin?.profile &&
                (admin.profile as { displayName?: string }).displayName,
            ) ||
              String(admin?.user.email) ||
              ""}
          </p>
        </div>
      </header>

      <div className="mx-auto w-8xl gap-2 px-4 py-6">
        <div className="flex flex-row">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <nav className="flex flex-col  gap-2 overflow-x-auto lg:flex-col">
              <NavLink to="/admin" end className={navClassName}>
                <HugeiconsIcon icon={Note05Icon} size={19} />
                Multas
              </NavLink>

              <NavLink to="/admin/dashboard" end className={navClassName}>
                <HugeiconsIcon icon={DashboardSquare01Icon} size={19} />
                Dashboard
              </NavLink>

              <NavLink to="/admin/people" className={navClassName}>
                <HugeiconsIcon icon={UserMultipleIcon} size={19} />
                Personas
              </NavLink>

              <NavLink to="/admin/reasons" className={navClassName}>
                <HugeiconsIcon icon={Note05Icon} size={19} />
                Motivos
              </NavLink>

              <NavLink to="/admin/complaints" className={navClassName}>
                <HugeiconsIcon icon={AlertCircleIcon} size={18} />
                <span className="hidden sm:inline">Bandeja de reclamos</span>
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <HugeiconsIcon icon={Logout01Icon} size={18} />
                Cerrar sesión
              </button>
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
