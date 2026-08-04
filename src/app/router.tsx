import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { ClaimsPage } from "../pages/public/ClaimPage";
import PublicList from "../pages/PublicList";
import { AdminLayout } from "../components/AdminLayout";
import { AdminMultasPage } from "../pages/admin/AdminMultasPage";
import { AdminMultadosPage } from "../pages/admin/AdminMultadosPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { ProtectedAdminRoute } from "../features/auth/components/ProtectedAdminRoute";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { AdminReclamosPage } from "../pages/admin/AdminReclamosPage";
import { MotivosPage } from "../pages/MotivosPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <PublicList /> },
      { path: "/reclamos", element: <ClaimsPage /> },
      { path: "/dashboard", element: <AdminDashboardPage /> },
      { path: "/motivos", element: <MotivosPage /> },
      { path: "/admin/login", element: <AdminLoginPage /> },
    ],
  },
  {
    element: <ProtectedAdminRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminMultasPage />,
          },
          {
            path: "multados",
            element: <AdminMultadosPage />,
          },
          {
            path: "dashboard",
            element: <AdminDashboardPage />,
          },
          {
            path: "reclamos",
            element: <AdminReclamosPage />,
          },
          {
            path: "motivos",
            element: <MotivosPage />,
          },
        ],
      },
    ],
  },
]);
