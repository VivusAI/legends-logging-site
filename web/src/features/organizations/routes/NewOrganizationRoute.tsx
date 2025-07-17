import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateOrganization } from "../api/useCreateOrganization";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOrganizationSchema,
  CreateOrganizationSchema,
  Organization,
} from "@/typings/organizations";
import { useTheme } from "@/components/theme/useTheme";
import { useNavigate } from "react-router";

export function NewOrganizationRoute() {
  const navigate = useNavigate();
  const { mutate } = useCreateOrganization();
  const { theme } = useTheme();
  let systemTheme = undefined;
  if (theme === "system" && typeof window !== "undefined") {
    systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  let logoSrc = "/logos/logo-white.png";
  if (theme === "dark" || (theme === "system" && systemTheme === "dark")) {
    logoSrc = "/logos/logo-black.png";
  }
  const formMethods = useForm<CreateOrganizationSchema>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createOrganizationSchema),
  });

  function handleCreateOrganization(data: CreateOrganizationSchema) {
    mutate(data, {
      onSuccess: (org) => {
        const organization = org as Organization;
        if (organization?.id) {
          navigate(`/app/${organization.id}`);
        }
      },
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-gray-100 to-gray-200 dark:from-background dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
      <div className="flex w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <img
              src={logoSrc}
              alt="Fivemanage Logo"
              className="w-55 h-10 mb-4 drop-shadow-lg"
            />
            <h1 className="text-3xl font-bold mb-1 text-center">Create new organization</h1>
          </div>
          <Form {...formMethods}>
            <form
              className="mt-8"
              onSubmit={formMethods.handleSubmit(handleCreateOrganization)}
            >
              <div className="space-y-4">
                <FormField
                  control={formMethods.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Organization Name<span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center justify-end space-x-4 mt-4">
                <Button size="sm" type="submit">
                  Create organization
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
