import { z } from "zod/v4";

export interface Log {
  TraceId: string;
  Timestamp: string;
  Body: string;
  Metadata: Record<string, string>;
}

export interface QueryLogResponse {
  data: Log[];
  meta: {
    totalRowCount: number;
  };
}

export interface Query {
  field: string;
  operator: string;
  value?: FilterValue;
  type?: string;
  children?: Query[];
}

export interface FilterSelection {
  field: string;
  operator: OperatorType;
  value?: FilterValue;
  type?: string;
}

export const filterSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  type: z.string().optional(),
  get children() {
    return z.array(filterSchema).optional();
  },
});

export type FilterSchema = z.infer<typeof filterSchema>;

export interface Filter {
  field: string;
  operator: string;
  value?: FilterValue;
  type?: string;
  children?: Filter[];
}

export interface Field {
  field: string;
  type: "String" | "Numeric";
}

export const metadataSchema = z.object({
  key: z.string(),
  type: z.union([z.literal("String"), z.literal("Numeric")]),
});

export const listLogsSchema = z.object({
  organizationId: z.string(),
  datasetId: z.string(),
  levels: z.string().nullable(),
  fromDate: z.string().nullable(),
  toDate: z.string().nullable(),
  metadata: z.union([z.string(), z.array(z.string())]).nullable(),
  filter: z.string().nullable(),
  cursor: z.number().nullish(),
});

export type ListLogsSchema = z.infer<typeof listLogsSchema>;

export enum Operator {
  EQUALS = "==",
  NOT_EQUALS = "!=",
  EXISTS = "exists",
  NOT_EXISTS = "not-exists",
  STARTS_WITH = "starts-with",
  ENDS_WITH = "ends-with",
  CONTAINS = "contains",
  NOT_CONTAINS = "not-contains",
  GTE = ">=",
  LTE = "<=",
  GT = ">",
  LT = "<",
}

export const OPERATOR_TYPE = [
  "==",
  "!=",
  "exists",
  "not-exists",
  "starts-with",
  "ends-with",
  "contains",
  "not-contains",
  ">=",
  "<=",
  ">",
  "<",
];

export type OperatorType = (typeof OPERATOR_TYPE)[number];
export type FilterValue = string | number | boolean | null;

export type WidgetType = "chart" | "stats";
