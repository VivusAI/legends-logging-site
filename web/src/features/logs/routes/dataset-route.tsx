import { useParams } from "react-router";
import DatasetOverview from "../components/dataset-overview";
import { Params } from "@/typings/router";

export default function DatasetRoute() {
  const params = useParams<Params>();

  return <DatasetOverview organizationId={params.organizationId} />;
}
