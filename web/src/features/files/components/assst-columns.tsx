import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/browser/keyboard";
import { Asset } from "@/typings/asset";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  ClipboardCopy,
  FileAudioIcon,
  ImageIcon,
  VideoIcon,
} from "lucide-react";
import { Link } from "react-router";

function formatFilename(key: string) {
  const parts = key.split("/");
  return parts[parts.length - 1];
}

export function assetColumns(): ColumnDef<Asset>[] {
  return [
    /*{
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              table.getIsSomePageRowsSelected()
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
            aria-label="Select row"
          />
        </div>
      ),
    }, */
    {
      accessorKey: "id",
      header: "Asset",
      cell: (info) => {
        const asset = info.row.original;
        const displayValue = asset.key?.replace(/^(image|video|audio)\//, "");

        const type = asset.type;

        let Icon = ImageIcon;
        const href = `${asset.id}`;

        if (type === "video") {
          Icon = VideoIcon;
        } else if (type === "audio") {
          Icon = FileAudioIcon;
        }

        return (
          <Link to={href} className="flex items-center ">
            <Icon size={18} className="mr-2 text-gray-400" />
            <span>
              <p className="hover:underline">{formatFilename(displayValue)}</p>
              <p className="text-xs text-muted-foreground">
                {displayValue.split("/")[0]}
              </p>
            </span>
          </Link>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: (info) => {
        const type = info.getValue() as string;
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: (info) =>
        format(new Date(info.getValue() as Date), "yyyy-MM-dd HH:mm:ss"),
    },
    {
      accessorKey: "key",
      header: "URL",
      cell: (info) => {
        const url = `${import.meta.env.VITE_DOMAIN}/${info.getValue() as string}`;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(event) => copyToClipboard(event, url)}
                  className="cursor-pointer rounded-md bg-accent/60 p-2 hover:bg-accent"
                >
                  <ClipboardCopy size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy URL</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    /*{
        id: "delete",
        header: ({ table }) => (
          <div className="flex justify-center">
            <Button
              className="h-8 border border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500/30"
              onClick={() => setShowDeleteModal(true)}
              disabled={!table.getFilteredSelectedRowModel().rows.length}
              variant="outline"
            >
              Delete
            </Button>
          </div>
        ),
      }, */
  ];
}
