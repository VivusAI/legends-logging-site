import { type HTMLAttributes } from "react";

interface ListProps {
  children: React.ReactNode;
}

interface ListHeaderProps {
  title: string;
  children: React.ReactNode;
}

interface ListItemProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle: string;
  rightContent?: React.ReactNode;
}

export function List(props: ListProps) {
  return <div className="border rounded-t-sm">{props.children}</div>;
}

function Header(props: ListHeaderProps) {
  return (
    <div className="bg-accent/30 p-2 flex items-center justify-between">
      <h1 className="text-sm font-medium">{props.title}</h1>
      {props.children}
    </div>
  );
}

function Item(props: ListItemProps) {
  return (
    <div
      {...props}
      className="text-xs p-2 hover:bg-accent/50 cursor-pointer border-t"
    >
      <div className="flex justify-between items-center">
        <span>
          <div>{props.title}</div>
          {props.subtitle && (
            <p className="text-muted-foreground">{props.subtitle}</p>
          )}
        </span>

        <span className="flex items-center gap-6">{props.rightContent}</span>
      </div>
    </div>
  );
}

List.Header = Header;
List.Item = Item;
