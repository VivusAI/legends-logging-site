import { ModeToggle } from "@/components/theme/ModeToggle";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router";

function activeRoute(pathname: string, route: string): boolean {
  // For the dashboard route (index), check if pathname ends with organizationId
  if (route === "" || route === "/") {
    const segments = pathname.split("/").filter(Boolean);
    // Should be ['app', 'organizationId'] for the index route
    return segments.length === 2 && segments[0] === "app";
  }

  // For other routes, check if the pathname ends with the route
  return pathname.endsWith(`/${route}`);
}

export function AppTopbar() {
  const { pathname } = useLocation();

  return (
    <header className="flex sticky top-0 bg-background h-10 shrink-0 items-center gap-2 border-b px-4">
      <nav className="flex items-center  h-full">
        <Link
          to="storage"
          className={cn(
            "text-sm transition-colors h-full flex items-center px-4",
            activeRoute(pathname, "storage")
              ? "text-foreground bg-accent border-b border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Storage
        </Link>
        <Link
          to="logs"
          className={cn(
            "text-sm transition-colors h-full flex items-center px-4",
            activeRoute(pathname, "logs")
              ? "text-foreground bg-accent border-b border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Logs
        </Link>
      </nav>

      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </header>
  );
}
