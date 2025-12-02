import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { type TokenParams, tokenSchema } from "@/typings/token";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateToken } from "../api/useCreateToken";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/typings/query";

export function CreateTokenDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { mutateAsync, reset, data, isSuccess } = useCreateToken();
  const form = useForm<TokenParams>({
    defaultValues: {
      type: "media",
    },
    resolver: zodResolver(tokenSchema),
  });

  const queryClient = useQueryClient();

  function handleOnSubmit(data: TokenParams) {
    startTransition(async () => {
      await mutateAsync(data);

      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Tokens] });
      });
    });
  }

  function resetForm() {
    form.reset();
    reset();
  }

  function handleInteractOutside(e: Event) {
    e.preventDefault();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <KeyRound size={16} className="mr-2" />
          Create token
        </Button>
      </DialogTrigger>
      <DialogContent
        id="create-token-dialog"
        aria-description="Create a new token"
        onInteractOutside={handleInteractOutside}
        onPointerDownOutside={handleInteractOutside}
        onAnimationEnd={resetForm}
      >
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? "Token created!" : "Create token"}
          </DialogTitle>
        </DialogHeader>
        {isSuccess && data ? (
          <div>
            <p className="text-sm">
              Copy the token below and store it in a safe place.
            </p>
            <p className="text-red-500 text-sm">
              You won't be able to see it again.
            </p>
            <div className="border p-2 mt-2">{data.token}</div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)}>
              <div>
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifier</FormLabel>
                      <FormControl>
                        <Input {...field} type="text" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isPending}>
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
