import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Trash } from "lucide-react";
import { useDeleteToken } from "../api/useDeleteToken";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/typings/query";
import { useTransition } from "react";

interface DeleteTokenDialogProps {
  tokenId: number;
}

export function DeleteTokenDialog(props: DeleteTokenDialogProps) {
  const { tokenId } = props;

  const [isPending, startTransition] = useTransition();

  const queryClient = useQueryClient();
  const { mutateAsync } = useDeleteToken();

  async function handleDelete() {
    startTransition(async () => {
      await mutateAsync(tokenId);

      startTransition(() => {
        queryClient.invalidateQueries({ queryKey: [QueryKeys.Tokens] });
      });
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Trash size={12} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button type="submit" onClick={handleDelete} disabled={isPending}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
