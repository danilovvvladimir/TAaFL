import * as fs from "fs";

export enum ConversionMode {
  MEALY,
  MOORE,
}

class FileHandler {
  private filePath: string;
  private readonly MAIN_PARAMS_LENGTH: number = 3;
  private readonly MAIN_PARAMS_INVALID_LENGTH_MESSAGE: string =
    "File does not contain enough data.";
  private readonly INVALID_ROW_LENGTH_MESSAGE: string =
    "Invalid number of columns in the data.";
  private readonly MEALY_CONVERSION_KEY_WORD: string = "mili";
  private readonly MOORE_CONVERSION_KEY_WORD: string = "mur";
  private readonly INCORRECT_MODE_MESSAGE: string = `Mode can only be ${this.MEALY_CONVERSION_KEY_WORD} or ${this.MOORE_CONVERSION_KEY_WORD}`;
  private readonly DEFAULT_DATA_FROM_FILE: DataFromFile = {
    columns: 0,
    rows: 0,
    mode: undefined,
    matrix: [],
  };
  private readonly INCORRECT_NUMBER_PARAM_MESSAGE: string =
    "Param must be number";

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private validateLine(unvalidatedLine: string, splitSymbol: string): string[] {
    return unvalidatedLine.trim().split(splitSymbol);
  }

  private parseConversionMode(rawConversionMode: string): ConversionMode {
    if (rawConversionMode === this.MEALY_CONVERSION_KEY_WORD) {
      return ConversionMode.MEALY;
    } else if (rawConversionMode === this.MOORE_CONVERSION_KEY_WORD) {
      return ConversionMode.MOORE;
    } else {
      throw new Error(this.INCORRECT_MODE_MESSAGE);
    }
  }

  private parseRawNumberParams(rawNumber: string): number {
    const parsedNumber = parseInt(rawNumber);

    if (Number.isNaN(parsedNumber)) {
      throw new Error(this.INCORRECT_NUMBER_PARAM_MESSAGE);
    }

    return parsedNumber;
  }

  public readDataFromFile(): DataFromFile {
    const fileContents = fs.readFileSync(this.filePath, "utf-8");
    const lines = this.validateLine(fileContents, "\n");

    if (lines.length < this.MAIN_PARAMS_LENGTH) {
      throw new Error(this.MAIN_PARAMS_INVALID_LENGTH_MESSAGE);
    }

    const [columns, rows, unparsedMode] = this.validateLine(lines[0], " ");

    const data: DataFromFile = this.DEFAULT_DATA_FROM_FILE;

    data.columns = this.parseRawNumberParams(columns);
    data.rows = this.parseRawNumberParams(rows);
    data.mode = this.parseConversionMode(unparsedMode);

    const loopOffset = data.mode === ConversionMode.MEALY ? 1 : 2;

    for (let i = 1; i < data.rows + loopOffset; i++) {
      const row = this.validateLine(lines[i], " ");

      if (row.length !== data.columns) {
        throw new Error(this.INVALID_ROW_LENGTH_MESSAGE);
      }

      data.matrix.push(row);
    }

    return data;
  }
}

export interface DataFromFile {
  columns: number;
  rows: number;
  mode: ConversionMode;
  matrix: string[][];
}

export default FileHandler;
