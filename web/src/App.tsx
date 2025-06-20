import { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AuthRoute } from "./features/auth/routes/AuthRoute";
import { AppDashboard } from "./features/app/routes/AppDashboard";
import { AppLayout } from "./features/app/components/AppLayout";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { ProtectedRoute } from "./features/auth/routes/ProtectedRoute";
import { NewOrganizationRoute } from "./features/organizations/routes/NewOrganizationRoute";
import { OrganizationSelectRoute } from "./features/organizations/routes/OrganizationSelectRoute";
const StorageRoute = lazy(() => import("./features/files/StorageRoute"));
const TokensRoute = lazy(() => import("./features/tokens/routes/TokensRoute"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<div>404</div>} />
            <Route path="/" element={<Navigate to="/app" />} />
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/app">
              <Route index element={<OrganizationSelectRoute />} />
              <Route
                path="new-organization"
                element={<NewOrganizationRoute />}
              />
              <Route element={<ProtectedRoute />}>
                <Route path=":organizationId" element={<AppLayout />}>
                  <Route index element={<AppDashboard />} />
                  {/* Should probably wrap a suspense around this */}
                  <Route path="tokens" element={<TokensRoute />} />
                  <Route path="storage" element={<StorageRoute />} />
                  <Route path="logs" element={<div>Logs</div>} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
