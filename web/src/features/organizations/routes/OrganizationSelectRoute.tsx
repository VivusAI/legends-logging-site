import { Navigate, NavLink } from "react-router";
import { useOrganizations } from "../api/useOrganizations";
import { useSession, useLogout } from "@/features/auth/api/useSession";
import { CirclePlus, ChevronRight, LogOut } from "lucide-react";

export function OrganizationSelectRoute() {
  const { data, isLoading } = useOrganizations();
  // todo: move this to a layout route
  const session = useSession();
  const { logout } = useLogout();
  const orgCount = data?.length || 0;

  if (!session.data && !session.isPending) {
    return <Navigate to="/auth" />;
  }

  // switch out to use suspense
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <Navigate to="/app/new-organization" />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div
        data-slot="card"
        className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full max-w-md"
      >
        <div
          data-slot="card-header"
          className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 border-b"
        >
          <div data-slot="card-title" className="text-center text-2xl font-bold">
            Select Workspace
          </div>
        </div>
        <div data-slot="card-content" className="p-0">
          <div
            dir="ltr"
            data-slot="scroll-area"
            className="relative h-72 px-4 py-4"
            style={{ position: 'relative', ['--radix-scroll-area-corner-width' as any]: '0px', ['--radix-scroll-area-corner-height' as any]: '0px' }}
          >
            <div
              data-radix-scroll-area-viewport=""
              data-slot="scroll-area-viewport"
              className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
              style={{ overflow: 'hidden scroll' }}
            >
              <div style={{ minWidth: '100%', display: 'table' }}>
                <button
                  data-slot="button"
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3 mb-2 w-full justify-start text-left"
                  type="button"
                  onClick={() => window.location.href = '/app/new-organization'}
                >
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Create New Team
                </button>
                <ul className="flex w-full flex-col gap-2 overflow-y-auto">
                  {data.map((org) => (
                    <li className="w-full" key={org.id}>
                      <NavLink
                        className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-accent/50 px-4 has-[>svg]:px-3 h-fit w-full justify-start rounded-lg py-2 text-left transition-colors duration-200 hover:bg-accent hover:text-accent-foreground"
                        to={`/app/${org.id}`}
                        state={{ organization: org }}
                      >
                        <div className="flex w-full items-center space-x-4">
                          <span data-slot="avatar" className="relative flex size-8 shrink-0 overflow-hidden rounded-full h-10 w-10 border-2 border-background">
                            <span data-slot="avatar-fallback" className="flex size-full items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                              {org.name.charAt(0)}
                            </span>
                          </span>
                          <div className="grow">
                            <p className="text-sm font-medium">{org.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {org.id}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div
          data-slot="card-footer"
          className="items-center [.border-t]:pt-6 flex justify-between border-t px-4 py-3"
        >
          <p className="text-sm text-muted-foreground">{orgCount} workspace{orgCount === 1 ? '' : 's'}</p>
          <button
            data-slot="button"
            className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}