import { Suspense } from "react";
import { AssetList } from "./components/AssetList";
import { DataTableSkeleton } from "@/components/data/DataTableSkeleton";
import { UploadDialog } from "./components/UploadDialog";

export default function StorageRoute() {
  return (
    <div>
      <UploadDialog />
      <Suspense fallback={<DataTableSkeleton columnCount={10} />}>
        <AssetList />
      </Suspense>
    </div>
  );
}
