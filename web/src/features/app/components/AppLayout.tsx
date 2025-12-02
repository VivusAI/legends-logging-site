import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, Outlet, useLocation, useParams } from "react-router";
import { AppSidebar } from "./AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { Params } from "@/typings/router";
import { useCurrentOrganization } from "@/features/organizations/api/useCurrentOrganization";

export function AppLayout() {
  const location = useLocation();
  const params = useParams<Params>();
  const organization = useCurrentOrganization(params.organizationId);

  const paths = location.pathname.split("/").filter((p) => p);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex sticky top-0 bg-background h-10 shrink-0 items-center gap-2 border-b px-4">
          <nav className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild className="text-sm">
                    <Link to={`/app/${params.organizationId}`}>
                      {organization.data && organization.data.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block text-sm" />
                {paths.slice(2, paths.length).map((path) => (
                  <BreadcrumbItem key={path}>
                    <BreadcrumbPage>{path}</BreadcrumbPage>
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </nav>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
