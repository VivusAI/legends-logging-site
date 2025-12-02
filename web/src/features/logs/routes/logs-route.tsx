import { Params } from "@/typings/router";
import { useParams } from "react-router";
import { LogsStream } from "../components/logs-stream";

export default function LogsRoute() {
  const params = useParams<Params & { datasetId: string }>();

  return (
    <LogsStream
      organizationId={params.organizationId}
      datasetId={params.datasetId}
    />
  );
}
