import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  DashboardSquare01Icon,
  Login01Icon,
} from "@hugeicons/core-free-icons";
import { NavLink, Outlet } from "react-router-dom";
import { Note05Icon } from "@hugeicons/core-free-icons";

const navClassName = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-[#1E3A8A] text-white"
      : "text-slate-600 hover:bg-[#c1cff5] hover:text-slate-950"
  }`;

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-4 text-[#1E3A8A] text-3xl font-bold">
        Gestion de Multas
      </header>

      <div className="mx-auto w-8xl gap-2 px-4 py-6">
        <div className="flex flex-row">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <nav className="flex flex-col  gap-2 overflow-x-auto lg:flex-col">
              <div className="flex flex-col items-left gap-2">
                <NavLink to="/" className={navClassName} end>
                  <HugeiconsIcon icon={Note05Icon} size={18} />
                  <span className="hidden sm:inline">Multas</span>
                </NavLink>
                <NavLink to="/dashboard" className={navClassName} end>
                  <HugeiconsIcon icon={DashboardSquare01Icon} size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </NavLink>
                <NavLink to="/reclamos" className={navClassName}>
                  <HugeiconsIcon icon={AlertCircleIcon} size={18} />
                  <span className="hidden sm:inline">Reclamos</span>
                </NavLink>
                <NavLink to="/motivos" className={navClassName}>
                  <HugeiconsIcon icon={Note05Icon} size={18} />
                  <span className="hidden sm:inline">Motivos</span>
                </NavLink>
                <NavLink to="/admin/login" className={navClassName}>
                  <HugeiconsIcon icon={Login01Icon} size={18} />
                  <span className="hidden sm:inline">Administración</span>
                </NavLink>
              </div>
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
