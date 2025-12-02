import { useNavigate, useParams } from "react-router";
import { Params } from "@/typings/router";
import { useListDatasets } from "../../api/dataset-api";
import { List } from "@/components/ui/list";

export function DatasetList() {
  const params = useParams<Params>();
  const { data } = useListDatasets(params.organizationId);
  const navigate = useNavigate();

  function navigateToDataset(datasetId: string) {
    navigate(`${datasetId}`);
  }

  return (
    <>
      {data &&
        data.map((dataset) => (
          <List.Item
            key={dataset.id}
            title={dataset.name}
            subtitle={dataset.description}
            onClick={() => navigateToDataset(dataset.id)}
          />
        ))}
    </>
  );
}
