import { FilterValue } from "@/typings/logs";
import { TextScanner } from "./text-scanner";

export class FilterScanner extends TextScanner {
  field?: string;
  operator?: string;
  value?: FilterValue;
  rawValue?: string | undefined;

  constructor(source: string) {
    super(source);
  }

  scan() {
    this.skipWs();
    this.scanField();

    if (this.field) {
      this.skipWs();
      this.scanOp();

      if (this.operator) {
        this.skipWs();
        this.scanValue();
      }
    }
  }

  scanField() {
    const peek = this.peek();

    if (peek === '"') {
      this.advance();
      let str = this.scanChar(peek);
      if (str) {
        str = str.replace(new RegExp(peek, "g"), "");
      }
      this.field = str;
    } else {
      this.field = this.scanRegExp(/[^\s]/);
    }
  }

  scanOp() {
    this.operator = this.scanRegExp(/[^\s]/);
  }

  scanValue() {
    this.rawValue = this.peekEnd();
    const peek = this.peek();

    if (this.isIdentifierStart(peek)) {
      this.value = this.scanIdentifier();
    } else if (peek === '"' || peek === "'") {
      this.value = this.scanStringLiteral();
    } else if (peek === "." || this.isDigit(peek) || peek === "-") {
      this.value = this.scanNumber();
    }

    if (!this.isAtEnd) {
      this.value = undefined;
    }
  }

  isIdentifierStart(s: string | undefined) {
    return s === "n" || s === "t" || s === "f";
  }

  scanIdentifier() {
    const value = this.scanAlpha();

    if (value !== undefined) {
      if ("null".startsWith(value)) {
        return null;
      } else if ("true".startsWith(value)) {
        return true;
      } else if ("false".startsWith(value)) {
        return false;
      }
    }

    return undefined;
  }
}
