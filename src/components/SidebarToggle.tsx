import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeft01Icon, SidebarRight01Icon } from "@hugeicons/core-free-icons";
import { useSidebar } from "../features/sidebar/hooks/useSidebar";

export function SidebarToggle() {
  const { collapsed, toggle } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={!collapsed}
      aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
      title={collapsed ? "Expandir menú" : "Contraer menú"}
      className="hidden shrink-0 rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 lg:inline-flex"
    >
      <HugeiconsIcon icon={collapsed ? SidebarRight01Icon : SidebarLeft01Icon} size={20} />
    </button>
  );
}
