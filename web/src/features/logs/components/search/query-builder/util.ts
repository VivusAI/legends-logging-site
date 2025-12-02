import { OperatorType } from "@/typings/logs";

function isNumber(num: unknown): num is number {
  if (typeof num === "number") {
    return num - num === 0;
  }
  if (typeof num === "string" && num.trim() !== "") {
    return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
  }
  return false;
}

export function isNumeric(value: unknown): value is number {
  return isNumber(value);
}

export const isValidOpAndFieldType = (op: OperatorType, type?: string) => {
  switch (op) {
    case "==":
    case "!=":
      return (
        type?.includes("Numeric") ||
        type?.includes("timespan") ||
        type?.includes("float") ||
        type?.includes("String") ||
        type?.includes("boolean")
      );
    case ">":
    case ">=":
    case "<":
    case "<=":
      return type?.includes("Numeric");
    case "starts-with":
    case "ends-with":
      return type?.includes("String");
    case "contains":
    case "not-contains":
      return type?.includes("String") || type === "array";
    case "exists":
    case "not-exists":
      return true;
    default:
      return false;
  }
};

export function searchSort<T>(search: string, key = "", nearest?: boolean) {
  return (aa: T, bb: T) => {
    // @ts-expect-error we don't want to make the function signature more strict becuase it should be possible to call it loosely
    const aaString = aa[key] ? aa[key].toString() : aa.toString();
    // @ts-expect-error we don't want to make the function signature more strict becuase it should be possible to call it loosely
    const bbString = bb[key] ? bb[key].toString() : bb.toString();

    // sort strings that startWith the search term first
    const aaSearchIdx = aaString
      .toLocaleLowerCase()
      .indexOf(search.toLocaleLowerCase());
    const bbSearchIdx = bbString
      .toLocaleLowerCase()
      .indexOf(search.toLocaleLowerCase());

    const aaStartWithSearch = aaSearchIdx === 0;
    const bbStartWithSearch = bbSearchIdx === 0;

    if (aaStartWithSearch && !bbStartWithSearch) {
      return -1;
    } else if (bbStartWithSearch && !aaStartWithSearch) {
      return 1;
    } else if (nearest) {
      if (aaSearchIdx !== -1 && bbSearchIdx === -1) {
        return -1;
      } else if (bbSearchIdx !== -1 && aaSearchIdx === -1) {
        return 1;
      } else if (aaSearchIdx !== bbSearchIdx) {
        return aaSearchIdx < bbSearchIdx ? -1 : 1;
      }
    }

    return aaString.localeCompare(bbString);
  };
}
