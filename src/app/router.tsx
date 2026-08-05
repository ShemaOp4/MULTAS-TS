import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "../components/PublicLayout";
import { ClaimsPage } from "../pages/public/ClaimPage";
import PublicList from "../pages/PublicList";
import { AdminLayout } from "../components/AdminLayout";
import { AdminFinesPage } from "../pages/admin/AdminFinesPage";
import { AdminFinedPeoplePage } from "../pages/admin/AdminFinedPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { ProtectedAdminRoute } from "../features/auth/components/ProtectedAdminRoute";
import { AdminLoginPage } from "../pages/admin/AdminLoginPage";
import { ReasonsPage } from "../pages/ReasonsPage";
import { AdminComplaintsPage } from "../pages/admin/AdminuseComplaintsPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <PublicList /> },
      { path: "/complaints", element: <ClaimsPage /> },
      { path: "/dashboard", element: <AdminDashboardPage /> },
      { path: "/reasons", element: <ReasonsPage /> },
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
            element: <AdminFinesPage />,
          },
          {
            path: "fines",
            element: <AdminFinesPage />,
          },
          {
            path: "people",
            element: <AdminFinedPeoplePage />,
          },
          {
            path: "dashboard",
            element: <AdminDashboardPage />,
          },
          {
            path: "complaints",
            element: <AdminComplaintsPage />,
          },
          {
            path: "reasons",
            element: <ReasonsPage />,
          },
        ],
      },
    ],
  },
]);
