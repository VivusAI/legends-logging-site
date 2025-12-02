export function copyToClipboard(
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  value: string,
) {
  e.stopPropagation();
  void navigator.clipboard.writeText(value);
}
