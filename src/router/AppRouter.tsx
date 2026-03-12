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
import ModulesList from "../pages/administration/ModulesList";
import SubmodulesList from "../pages/administration/SubmodulesList";

import PermissionsView from "../pages/permissions/PermissionsView";
import EditPermissions from "../pages/permissions/EditPermissions";
import ViewRole from "../pages/roles/ViewRole";
import RoutesWrapper from "./RoutesWrapper";
import EditRole from "../pages/roles/EditRole";
import CreateRole from "../pages/roles/CreateRole";
/**
 * Router Principal de la Aplicación.
 * Define la estructura de navegación utilizando React Router DOM.
 * * Se divide en dos grupos lógicos:
 * 1. Rutas Protegidas: Requieren un token de sesión válido.
 * 2. Rutas Públicas: Solo accesibles si el usuario NO está autenticado (Login, Recobro).
 */
export function AppRouter() {
  return (
    <BrowserRouter basename="/agrofusion">
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
              <Dashboard />
            </ProtectedRoute>
          }
        />

      
        {/* Ruta Raíz: Protegida. Si no hay login, rebota a /login */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
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
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* ADMINISTRATION */}
          <Route path="/administration/users" element={<UsersList />} />
          <Route path="/administration/users/create-user" element={<CreateUser />} />
          <Route path="/administration/users/:userId" element={<ViewUser />} />
          <Route path="/administration/users/edit-user/:userId" element={<EditUser />} />

          <Route path="/administration/projects" element={<ProjectsList />} />
          <Route path="/administration/modules" element={<ModulesList />} />
          <Route path="/administration/submodules" element={<SubmodulesList />} />

          <Route path="/administration/permissions" element={<ListPermissions />} />
          <Route path="/administration/permissions/:permId" element={<PermissionsView />} />
          <Route path="/administration/permissions/edit-perm/:permId" element={<EditPermissions />} />

          <Route path="/administration/roles" element={<ListRoles />} />
          <Route path="/administration/role/:roleId" element={<ViewRole />} />
          <Route path="/administration/roles/edit-role/:roleId" element={<EditRole/>}/>
          <Route path="/administration/roles/create-role" element={<CreateRole/>}/>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
