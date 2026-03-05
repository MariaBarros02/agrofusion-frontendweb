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

import PermissionsView from "../pages/permissions/PermissionsView";
import EditPermissions from "../pages/permissions/EditPermissions";
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



      {/* RUTA PADRE ADMINISTRACION */}
      <Route path="administration">
        
        {/* USERS */}
        <Route path="users" element={<UsersList />} />
        <Route path="users/create-user" element={<CreateUser />} />
        <Route path="users/:userId" element={<ViewUser />} />
        <Route path="users/edit-user/:userId" element={<EditUser />} />

        {/* PROJECTS */}
        <Route path="projects" element={<ProjectsList />} />

        {/* MODULES */}
        <Route path="modules" element={<ModulesList />} />

        {/* PERMISSIONS */}
        <Route path="permissions" element = {<ListPermissions/>}/> 
        <Route path="permissions/:permId" element = {<PermissionsView/>}/> 
        <Route path="permissions/edit-perm/:permId" element = {<EditPermissions/>}/> 
        
        {/* ROLES */}
        <Route path="roles" element = {<ListRoles/>}/> 
      </Route>

      </Routes>
    </BrowserRouter>
  );
}