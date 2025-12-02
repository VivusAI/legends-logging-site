import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTokens } from "../api/useTokens";
import { DeleteTokenDialog } from "./DeleteTokenDialog";

export function TokensTable() {
  const tokens = useTokens();

  return (
    <Table className="max-w-6xl">
      <TableCaption>A list of your tokens.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Identifier</TableHead>
          <TableHead>Type</TableHead>
          <TableHead color="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens &&
          tokens.map((token) => (
            <TableRow>
              <TableCell>{token.identifier}</TableCell>
              <TableCell>type</TableCell>
              <TableCell className="text-right">
                <DeleteTokenDialog tokenId={token.id} />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
