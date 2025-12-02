import { FilterValue } from "@/typings/logs";

export const formatFilterValue = (value?: FilterValue) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return `"${value.replace(/(\\)|(")/g, "\\$1$2")}"`;
  }

  return `${value}`;
};
