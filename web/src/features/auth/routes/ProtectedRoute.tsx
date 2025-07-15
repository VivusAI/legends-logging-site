import { useOrganizations } from "@/features/organizations/api/useOrganizations";
import { Outlet, Navigate, useParams } from "react-router";
import { useSession } from "../api/useSession";

type AppParams = {
  organizationId: string;
};

export const ProtectedRoute: React.FC = () => {
  const params = useParams<AppParams>();

  const { data: session, isPending: sessionPending, error: sessionError } = useSession();
  const { data: organizations, isPending: orgsPending } = useOrganizations();

  if (sessionPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (sessionError || !session) {
    return <Navigate to="/auth" replace />;
  }

  if (orgsPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading organizations...</div>;
  }

  if (organizations && organizations.length === 0) {
    return <Navigate to="/app/new-organization" replace />;
  }

  if (params.organizationId && organizations) {
    const hasAccess = session.isAdmin || organizations.some(org => org.id === params.organizationId);
    if (!hasAccess) {
      return <Navigate to="/app" replace />;
    }
  }

  if (!params.organizationId && organizations && organizations.length > 0) {
    return <Navigate to={`/app/${organizations[0].id}`} replace />;
  }

  return <Outlet />;
};
