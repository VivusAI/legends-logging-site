import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
<<<<<<< HEAD
import { toast } from "sonner";

const registerSchema = z.object({
  username: z.string(),
  password: z.string(),
});
=======
import { useState } from "react";
import { useLogin } from "../api/useLogin";
import { loginSchema, LoginSchema } from "@/typings/auth";
>>>>>>> upstream/develop

export function AuthForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const formMethods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const { mutateAsync } = useLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

<<<<<<< HEAD
  const handleRegisterSubmit = async (data: z.infer<typeof registerSchema>) => {
    console.log({ data });
    const res = await fetch("/api/dash/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (res.status === 403) {
      const body = await res.json();
      const message = (body.message || "Unknown error").charAt(0).toUpperCase() + (body.message || "Unknown error").slice(1);
      toast.error(message, { position: "bottom-right" });
      return;
    }

    if (IS_DEV && res.ok) {
      navigate("/app");
    }
=======
  const handleLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);
    mutateAsync(data);
>>>>>>> upstream/develop
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username and password to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(handleLoginSubmit)}>
              <div className="flex flex-col gap-6">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <div className="grid gap-2">
                  <FormField
                    control={formMethods.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-2">
                  <FormField
                    control={formMethods.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="*********"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
<<<<<<< HEAD
                <Button type="submit" className="w-full">
                  Login
=======
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
>>>>>>> upstream/develop
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
