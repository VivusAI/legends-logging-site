import { isNumeric } from "./util";

export class TextScanner {
  static ALPHA = new RegExp(/[a-z]/i);
  static WS = new RegExp(/\s/);
  static DIGIT = new RegExp(/\d/);

  source: string;
  start = 0;
  current = 0;

  constructor(source: string) {
    this.source = source;
  }

  get isAtEnd() {
    return this.current >= this.source.length;
  }

  isAlpha(char?: string, ws?: boolean) {
    return (
      char !== undefined &&
      (TextScanner.ALPHA.test(char) || (ws && TextScanner.WS.test(char)))
    );
  }

  isDigit(char?: string) {
    return char !== undefined && TextScanner.DIGIT.test(char);
  }

  scanAlpha(ws?: boolean) {
    while (!this.isAtEnd && this.isAlpha(this.source[this.current], ws)) {
      this.advance();
    }

    return this.token();
  }

  scanRegExp(regExp: RegExp) {
    // just escaping type error for now, probably forever
    while (!this.isAtEnd && regExp.test(this.source[this.current]!)) {
      this.advance();
    }

    return this.token();
  }

  scanNumber() {
    if (this.peek() === "-") {
      this.advance();
    }

    while (!this.isAtEnd && this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === ".") {
      if (this.isDigit(this.peekNext())) {
        // Consume the "."
        this.advance();

        while (!this.isAtEnd && this.isDigit(this.peek())) {
          this.advance();
        }
      }
    }

    const token = this.token();

    return isNumeric(token) ? Number(token) : undefined;
  }

  scanNumberList(values: number[]) {
    this.skipWs();

    const value = this.scanNumber();

    if (value !== undefined) {
      values.push(value);

      this.skipWs();

      if (this.peek() === ",") {
        this.skip();
        this.scanNumberList(values);
      }
    }
  }

  scanChar(char: string) {
    while (!this.isAtEnd && this.peek() !== char) {
      this.advance();
    }

    if (this.peek() === char) {
      this.advance();
    }

    return this.token();
  }

  scanStringLiteral() {
    const quote = this.peek();
    if (quote !== '"' && quote !== "'") {
      return undefined;
    }

    const altQuote = quote === '"' ? "'" : '"';

    this.skip();

    let str = "";

    while (!this.isAtEnd) {
      let ch = this.peek();

      if (ch === quote) {
        this.skip();

        break;
      } else if (ch === "\\") {
        // If backslash then they might be escaping

        if (!this.isAtEnd) {
          const next = this.peekNext();

          if (next === quote) {
            // They are trying to escape the quote
            this.skip();
          } else if (next === "\\") {
            // The are trying to escape the backslash
            this.skip();
          } else if (next === altQuote) {
            // The backslash is not part of a control character
            str += ch;
            this.skip();
          }

          if (this.isAtEnd) {
            break;
          }

          ch = this.peek();
        }
      }

      str += ch;
      this.skip();
    }

    return str;
  }

  peekEnd() {
    if (this.isAtEnd) {
      return undefined;
    }

    return this.source.substring(this.current);
  }

  token() {
    let token: string | undefined;

    if (this.current > this.start && this.current <= this.source.length) {
      token = this.source.substring(this.start, this.current);
      this.start = this.current;
    }

    return token;
  }

  end() {
    this.current = this.source.length;
  }

  advance() {
    this.current += 1;
  }

  peek() {
    return this.isAtEnd ? undefined : this.source[this.current];
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) {
      return undefined;
    }

    return this.source[this.current + 1];
  }

  skip() {
    this.advance();
    this.start = this.current;
  }

  skipWs() {
    while (!this.isAtEnd && TextScanner.WS.test(this.peek()!)) {
      this.skip();
    }
  }
}
