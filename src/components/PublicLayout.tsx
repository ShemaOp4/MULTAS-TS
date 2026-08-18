import { HugeiconsIcon } from '@hugeicons/react';
import type { IconSvgElement } from '@hugeicons/react';
import {
  AlertCircleIcon,
  DashboardSquare01Icon,
  Login01Icon,
  Note05Icon,
} from '@hugeicons/core-free-icons';
import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { SidebarToggle } from './SidebarToggle';
import { useSidebar } from '../features/sidebar/hooks/useSidebar';

type NavItem = {
  to: string;
  label: string;
  icon: IconSvgElement;
  end?: boolean;
};

const navItems: NavItem[] = [
  { to: '/', label: 'Multas', icon: Note05Icon, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: DashboardSquare01Icon, end: true },
  { to: '/complaints', label: 'Reclamos', icon: AlertCircleIcon },
  { to: '/reasons', label: 'Motivos', icon: Note05Icon },
];

const adminLoginItem: NavItem = {
  to: '/admin/login',
  label: 'Administración',
  icon: Login01Icon,
};

const sidebarLinkClass =
  (collapsed: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
      collapsed ? 'lg:justify-center lg:px-2' : ''
    } ${
      isActive
        ? 'bg-[#1E3A8A] text-white'
        : 'text-slate-600 hover:bg-[#c1cff5] hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white'
    }`;

const tabLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition ${
    isActive
      ? 'text-[#1E3A8A] dark:text-blue-300'
      : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
  }`;

export function PublicLayout() {
  const { collapsed } = useSidebar();

  return (
    <div className='min-h-screen bg-slate-100 dark:bg-slate-900'>
      <header className='border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-800'>
        <div className='mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3'>
          <div className='flex min-w-0 items-center gap-3'>
            <Logo className='h-10 w-10 xl:h-20 xl:w-20' />
            <span className='text-2xl font-bold text-[#1E3A8A] dark:text-blue-300 sm:text-3xl'>
              Gestión de multas
            </span>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <ThemeToggle />
            <NavLink
              to={adminLoginItem.to}
              aria-label={adminLoginItem.label}
              className='inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700 lg:hidden'
            >
              <HugeiconsIcon icon={adminLoginItem.icon} size={18} />
              <span className='hidden sm:inline'>{adminLoginItem.label}</span>
            </NavLink>
          </div>
        </div>
      </header>

      <div className='mx-auto w-full max-w-[1600px] gap-2 px-4 py-6 pb-24 lg:pb-6'>
        <div className='flex flex-col lg:flex-row lg:gap-4'>
          <aside
            className={`hidden lg:flex lg:flex-col lg:shrink-0 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 ${
              collapsed ? 'lg:w-16' : 'lg:w-56'
            }`}
          >
            <div className={`mb-2 flex ${collapsed ? 'justify-center' : 'justify-end'}`}>
              <SidebarToggle />
            </div>
            <nav className='flex flex-col gap-2'>
              {[...navItems, adminLoginItem].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={sidebarLinkClass(collapsed)}
                  end={item.end}
                  title={item.label}
                  aria-label={item.label}
                >
                  <HugeiconsIcon icon={item.icon} size={18} />
                  <span className={collapsed ? 'lg:hidden' : ''}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </nav>
          </aside>
          <main className='min-w-0 flex-1'>
            <Outlet />
          </main>
        </div>
      </div>

      <nav className='fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-slate-200 bg-white px-2 py-1.5 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] dark:border-slate-700 dark:bg-slate-800 lg:hidden'>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={tabLinkClass} end={item.end}>
            <HugeiconsIcon icon={item.icon} size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
