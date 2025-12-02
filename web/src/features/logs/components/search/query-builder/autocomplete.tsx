import { Input } from "@/components/ui/input";
import { FilterValue, OperatorType } from "@/typings/logs";
import React, { useEffect, useRef, useState } from "react";
import Autosuggest, {
  type SuggestionsFetchRequested,
  type OnSuggestionsClearRequested,
  type GetSuggestionValue,
  type RenderSuggestion,
  type RenderSuggestionsContainer,
  type ChangeEvent,
  type SuggestionSelectedEventData,
} from "react-autosuggest";

interface FilterSuggestion {
  field: string;
  type: string;
  operator?: OperatorType;
  value?: FilterValue;
  rawValue?: string;
}

interface AutocompleteProps {
  defaultValue: string | null;
  suggestions: FilterSuggestion[];
  onSuggestionsFetchRequested: SuggestionsFetchRequested;
  getSuggestionValue: GetSuggestionValue<FilterSuggestion>;
  onSuggestionsClearRequested: OnSuggestionsClearRequested;
  renderSuggestion: RenderSuggestion<FilterSuggestion>;
  renderSuggestionsContainer: RenderSuggestionsContainer;
  onSuggestionSelected: (
    data: SuggestionSelectedEventData<FilterSuggestion>,
  ) => void;
  onCancel?: () => void;
}

const defaultGetSuggestionValue = (suggestion: string): string => suggestion;

export function Autocomplete({
  defaultValue,
  suggestions,
  onSuggestionsFetchRequested,
  getSuggestionValue,
  onSuggestionsClearRequested,
  onSuggestionSelected,
  renderSuggestion,
  onCancel,
}: AutocompleteProps) {
  const [value, setValue] = useState(defaultValue || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const onChange = (
    _: React.FormEvent<HTMLElement>,
    { newValue }: ChangeEvent,
  ) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function onBlur() {
    if (onCancel) {
      onCancel();
    }
  }

  const inputProps = {
    placeholder: "Enter field name",
    value,
    onChange,
    onBlur,
  };

  useEffect(() => {
    setValue(defaultValue || "");
    inputRef.current?.focus();
  }, [defaultValue]);

  return (
    <div ref={containerRef} className="relative">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue || defaultGetSuggestionValue}
        renderSuggestion={renderSuggestion}
        renderSuggestionsContainer={(params) => {
          // ai wrote this and sometimes that is ok
          const hasChildren =
            params.children && React.Children.count(params.children) > 0;
          if (!hasChildren) {
            return null;
          }

          return (
            <div
              {...params.containerProps}
              className="absolute top-full left-0 right-0 z-50 mt-1 p-0 max-h-96 overflow-y-auto border rounded-md bg-background shadow-lg"
            >
              {params.children}
            </div>
          );
        }}
        inputProps={inputProps}
        highlightFirstSuggestion={true}
        alwaysRenderSuggestions={false}
        onSuggestionSelected={(_, data) => onSuggestionSelected(data)}
        renderInputComponent={(inputProps) => (
          <div className="border-b pb-2 px-2">
            <Input
              {...inputProps}
              className="h-8 focus-visible:ring-0"
              autoComplete="off"
              spellCheck="false"
              autoCapitalize="off"
              autoCorrect="off"
              ref={inputRef}
            />
          </div>
        )}
      />
    </div>
  );
}
