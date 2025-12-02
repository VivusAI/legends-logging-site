import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/data/DataTable";
import { Asset } from "@/typings/asset";
import { useParams, useSearchParams } from "react-router";
import { Params } from "@/typings/router";
import { assetColumns } from "./assst-columns";
import { useStorageFiles } from "../api/useStorageFiles";

export function AssetList() {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const columns = useMemo<ColumnDef<Asset>[]>(() => assetColumns(), []);

  const [searchParams] = useSearchParams();
  const params = useParams<Params>();

  const view = searchParams?.get("view") ?? "list";
  //const assetType = searchParams?.get("type") ?? "all";
  //const fromDate = searchParams.get("from") ?? new Date().toString();
  //const toDate = searchParams.get("to") ?? new Date().toString();
  //const page = searchParams.get("page");
  const search = searchParams.get("search");

  /*const { data, isLoading } = api.assets.list.useQuery({
    //toDate,
    //fromDate,
    search: search,
    organizationId: params.organizationId as string,
    //currentPage: Number(page),
    //type: assetType !== "all" ? assetType : undefined,
  }); */

  const { data } = useStorageFiles({
    organizationId: params.organizationId as string,
    search: search ?? undefined,
  });

  /*if (isLoading) {
    return view === "list" ? (
      <DataTableSkeleton
        columnCount={columns.length - 1}
        rowCount={10}
        showViewOptions={false}
      />
    ) : (
      {
        <AssetGridSkeleton rowCount={6} />
      }
    );
  } */

  return (
    <div>
      <div>
        {/*data && view === "grid" && (
          <AssetGridView
            assets={data.uploads}
            currentPage={page}
            count={data.totalCount}
          />
        )*/}
      </div>
      <div>
        {data && view === "list" && (
          <DataTable
            columns={columns}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            isLoading={false}
            data={data.files}
            totalCount={data.totalCount}
            onDelete={async () => {}}
          />
        )}
      </div>
    </div>
  );
}
