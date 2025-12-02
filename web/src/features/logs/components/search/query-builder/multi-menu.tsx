import { cn } from "@/lib/utils";
import { useState } from "react";

export interface OptionProps {
  onClick(
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ): void;
}

export interface MenuOptionState<T> {
  leftSelection: T | null;
  rightSelection: T | null;
  getOptionsProps(option: T): OptionProps;
}

export interface MultiMenuProps<T> {
  renderLeftMenu(props: MenuOptionState<T>): React.ReactNode;
  renderRightMenu(props: MenuOptionState<T>): React.ReactNode;
  onSelect(leftSelection: T | null, rightSelection: T | null): void;
}

interface MenuOptionTitleProps {
  children: React.ReactNode;
  className?: string;
  onClick(
    e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ): void;
}

export interface OptionListProps {
  children: React.ReactNode;
}

export function OptionList({ children }: OptionListProps) {
  return (
    <div className="flex flex-col gap-1">
      {children}
      <div className="border-b border-slate-200 dark:border-slate-700" />
    </div>
  );
}

export function MenuOption({
  children,
  className,
  ...rest
}: MenuOptionTitleProps) {
  return (
    <div className={cn("text-foreground", className)} {...rest}>
      {children}
    </div>
  );
}

export function MenuOptionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground font-medium">{children}</p>
    </div>
  );
}

export function MultiMenu<T>(props: MultiMenuProps<T>) {
  const [leftSelection, setLeftSelection] = useState<T | null>(null);
  const [rightSelection, setRightSelection] = useState<T | null>(null);

  function onLeftClick(value: T) {
    setLeftSelection(value);
  }

  function getLeftOptionProps(option: T): OptionProps {
    return {
      onClick: () => onLeftClick(option),
    };
  }

  function renderLeftMenu() {
    return props.renderLeftMenu({
      leftSelection,
      rightSelection,
      getOptionsProps: getLeftOptionProps,
    });
  }

  function onRightClick(value: T) {
    setRightSelection(value);
    props.onSelect(leftSelection, value);
  }

  function getRightOptionProps(option: T): OptionProps {
    return {
      onClick: () => onRightClick(option),
    };
  }

  function renderRightMenu() {
    return props.renderRightMenu({
      leftSelection,
      rightSelection,
      getOptionsProps: getRightOptionProps,
    });
  }

  // fields are the log attributes that we can filter on
  // this will be the right menu
  // the left menu will be the operator menu
  // we only want to show the operator menu if the user has selected a field

  return (
    <div className="grid grid-cols-2 max-h-72 h-auto overflow-auto">
      <div>
        <div className="mt-2">{renderLeftMenu()}</div>
      </div>
      <div className="border-l">
        <div className="mt-2">{renderRightMenu()}</div>
      </div>
    </div>
  );
}
