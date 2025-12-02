import { lazy } from "react";
import { List } from "@/components/ui/list";
import { useListDatasets } from "../api/dataset-api";
import { useNavigate } from "react-router";
const DatasetSheet = lazy(() => import("./dataset-sheet/dataset-sheet"));

interface DatasetActionsProps {
  organizationId: string | undefined;
}

export default function DatasetOverview({
  organizationId,
}: DatasetActionsProps) {
  const { data } = useListDatasets(organizationId);
  const navigate = useNavigate();

  function navigateToDataset(id: string) {
    navigate(`${id}`);
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-6xl mx-auto">
        <List>
          <List.Header title="Datasets">
            <DatasetSheet organizationId={organizationId} />
          </List.Header>
          <div>
            {data &&
              data.map((dataset) => (
                <List.Item
                  key={dataset.id}
                  title={dataset.name}
                  subtitle={dataset.description}
                  onClick={() => navigateToDataset(dataset.id)}
                />
              ))}
          </div>
        </List>
      </div>
    </div>
  );
}
