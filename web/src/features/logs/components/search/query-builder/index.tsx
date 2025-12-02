import { cn } from "@/lib/utils";
import { Filter, FilterSelection, Field } from "@/typings/logs";
import { useEffect, useState } from "react";
//import { StarSearchPopover } from "../StarSearchPopover";
import { FilterBuilder, selectionToFilter } from "./filter-builder";
import { QueryBuilderDropdown } from "./query-builder-dropdown";
import { useLocation, useSearchParams } from "react-router";

interface QueryBuilderProps {
  fields: Field[] | null | undefined;
}

export function QueryBuilder({ fields }: QueryBuilderProps) {
  const [filter, setFilter] = useState<Filter | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  // this is only called for the first filter
  function setRootFilterFn(selection: FilterSelection, groupClause?: string) {
    const rootFilter = selectionToFilter(selection, groupClause);
    if (!rootFilter) return;

    const root: Filter = {
      field: "",
      operator: "and",
      children: [rootFilter],
    };

    setFilterFn(root);
  }

  function setFilterFn(filter_: Filter) {
    let newFilter = filter_;
    if (newFilter === null) {
      setFilter(null);
      return;
    } else {
      if (newFilter && newFilter?.children?.length === 0) {
        setFilter(null);
        setQueryParams(undefined);
        return;
      } else if (
        newFilter !== null &&
        newFilter.operator !== "and" &&
        newFilter.operator !== "or"
      ) {
        newFilter = {
          field: "",
          operator: "and",
          children: [newFilter],
        };
      }
    }

    setFilter(newFilter);
    setQueryParams(newFilter);
  }

  function setQueryParams(query: Filter | undefined) {
    if (!query) {
      const params = new URLSearchParams(searchParams);
      params.delete("filter");

      setSearchParams(params);
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set("filter", JSON.stringify(query));

    setSearchParams(params);
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const filter = params.get("filter");

    if (filter) {
      const parsedFilter = JSON.parse(filter) as Filter;
      setFilter(parsedFilter);
    }
  }, [searchParams, pathname]);

  return (
    <div className="items-center space-x-2 w-full">
      <div className="flex flex-1">
        <div
          className={cn(
            "flex items-center gap-2 w-full rounded-md relative",
            "border border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring px-1",
          )}
        >
          <div className="overflow-x-auto w-full">
            {filter ? (
              <FilterBuilder
                filter={filter}
                fields={fields}
                onFilterChange={setFilterFn}
                hideClauseDropdown
              />
            ) : (
              <QueryBuilderDropdown
                metadataKeys={fields}
                onFilterSelect={setRootFilterFn}
                isRoot
              />
            )}
          </div>
          <span className="border border-right h-full" />
          {/*<StarSearchPopover query={filter} />*/}
        </div>
      </div>
    </div>
  );
}
