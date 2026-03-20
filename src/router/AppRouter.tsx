import { BrowserRouter, Routes, Route } from "react-router-dom";
//import Example from "../pages/Example";
import "../index.css";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";
import Login from "../pages/Login";
import ResetPassword from "../pages/ResetPassword";
import RequestResetPass from "../pages/RequestResetPass";
import Dashboard from "../pages/Dashboard";
import UsersList from "../pages/users/UsersList";
import CreateUser from "../pages/users/CreateUser";
import AccountActivation from "../pages/users/AccountActivation";
import ViewUser from "../pages/users/ViewUser";
import ListPermissions from "../pages/permissions/ListPermissions";
import ListRoles from "../pages/roles/ListRoles";
import Profile from '../pages/profile/Profile'
import EditUser from "../pages/users/EditUser";
import ProjectsList from "../pages/administration/ProjectsList";
import AddProject from "../pages/administration/AddProject";
import ModulesList from "../pages/administration/ModulesList";
import SubmodulesList from "../pages/administration/SubmodulesList";

import PermissionsView from "../pages/permissions/PermissionsView";
import EditPermissions from "../pages/permissions/EditPermissions";
import ViewRole from "../pages/roles/ViewRole";
import RoutesWrapper from "./RoutesWrapper";
import EditRole from "../pages/roles/EditRole";
import CreateRole from "../pages/roles/CreateRole";
import { ModuleRouteGuard } from "./ModuleRouteGuard";
/**
 * Router Principal de la Aplicación.
 * Define la estructura de navegación utilizando React Router DOM.
 * * Se divide en dos grupos lógicos:
 * 1. Rutas Protegidas: Requieren un token de sesión válido.
 * 2. Rutas Públicas: Solo accesibles si el usuario NO está autenticado (Login, Recobro).
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Raíz: Protegida. Si no hay login, rebota a /login */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        /> 
        {/* Ruta de Login: Pública. Si ya está logueado, rebota a / */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        {/* Flujo de Recuperación de Contraseña: Público */}
        <Route
          path="/request-reset-password"
          element={
            <PublicRoute>
              <RequestResetPass />
            </PublicRoute>
          }
        />
        
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/activate-account"
          element={
            <PublicRoute>
              <AccountActivation />
            </PublicRoute>
          }
        />

        {/* Ruta Raíz: Protegida. Si no hay login, rebota a /login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ModuleRouteGuard moduleCode="DASHBOARD">
                <Dashboard />
              </ModuleRouteGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ModuleRouteGuard moduleCode="PROFILE">
                <Profile />
              </ModuleRouteGuard>
            </ProtectedRoute>
          }
        />



        {/* ================= PROTECTED ROUTES ================= */}

        <Route
          element={
            <ProtectedRoute>
              <RoutesWrapper />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<ModuleRouteGuard moduleCode="DASHBOARD"><Dashboard /></ModuleRouteGuard>} />
          <Route path="/dashboard" element={<ModuleRouteGuard moduleCode="DASHBOARD"><Dashboard /></ModuleRouteGuard>} />
          <Route path="/profile" element={<ModuleRouteGuard moduleCode="PROFILE"><Profile /></ModuleRouteGuard>} />

          {/* ADMINISTRATION */}
          <Route path="/administration/users" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><UsersList /></ModuleRouteGuard>} />
          <Route path="/administration/users/create-user" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><CreateUser /></ModuleRouteGuard>} />
          <Route path="/administration/users/:userId" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><ViewUser /></ModuleRouteGuard>} />
          <Route path="/administration/users/edit-user/:userId" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><EditUser /></ModuleRouteGuard>} />

          <Route path="/administration/projects" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><ProjectsList /></ModuleRouteGuard>} />
          <Route path="/administration/projects/create" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><AddProject /></ModuleRouteGuard>} />
          <Route path="/administration/modules" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><ModulesList /></ModuleRouteGuard>} />
          <Route path="/administration/submodules" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><SubmodulesList /></ModuleRouteGuard>} />

          <Route path="/administration/permissions" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><ListPermissions /></ModuleRouteGuard>} />
          <Route path="/administration/permissions/:permId" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><PermissionsView /></ModuleRouteGuard>} />
          <Route path="/administration/permissions/edit-perm/:permId" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><EditPermissions /></ModuleRouteGuard>} />

          <Route path="/administration/roles" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><ListRoles /></ModuleRouteGuard>} />
          <Route path="/administration/role/:roleId" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><ViewRole /></ModuleRouteGuard>} />
          <Route path="/administration/roles/edit-role/:roleId" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><EditRole /></ModuleRouteGuard>} />
          <Route path="/administration/roles/create-role" element={<ModuleRouteGuard moduleCode="ADMINISTRATION"><CreateRole /></ModuleRouteGuard>} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}