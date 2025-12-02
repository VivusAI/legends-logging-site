import { Suspense } from "react";
import { CreateTokenDialog } from "../components/CreateTokenDialog";
import { TokensTable } from "../components/TokensTable";

export default function TokensRoute() {
  return (
    <main>
      <CreateTokenDialog />
      <section className="mt-6">
        <Suspense fallback={<div>Loading...</div>}>
          <TokensTable />
        </Suspense>
      </section>
    </main>
  );
}
