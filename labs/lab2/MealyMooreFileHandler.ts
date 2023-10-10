import * as fs from "fs";

export enum ConversionMode {
  MEALY,
  MOORE,
}

class MealyMooreFileHandler {
  private readonly MAIN_PARAMS_LENGTH: number = 3;
  private readonly MAIN_PARAMS_INVALID_LENGTH_MESSAGE: string =
    "File does not contain enough data.";
  private readonly INVALID_ROW_LENGTH_MESSAGE: string =
    "Invalid number of columns in the data.";
  private readonly MEALY_CONVERSION_KEY_WORD: string = "mili";
  private readonly MOORE_CONVERSION_KEY_WORD: string = "mur";
  private readonly INCORRECT_MODE_MESSAGE: string = `Mode can only be ${this.MEALY_CONVERSION_KEY_WORD} or ${this.MOORE_CONVERSION_KEY_WORD}`;
  private readonly DEFAULT_DATA_FROM_FILE: DataFromFile = {
    mode: undefined,
    matrix: [],
  };
  private readonly INCORRECT_NUMBER_PARAM_MESSAGE: string =
    "Param must be number";
  private readonly LOOP_OFFSET: number = 1;

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

  public readDataFromFile(filePath: string): DataFromFile {
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const lines = this.validateLine(fileContents, "\n");

    if (lines.length < this.MAIN_PARAMS_LENGTH) {
      throw new Error(this.MAIN_PARAMS_INVALID_LENGTH_MESSAGE);
    }

    const [columnsString, rowsString, unparsedMode] = this.validateLine(
      lines[0],
      " ",
    );

    const data: DataFromFile = this.DEFAULT_DATA_FROM_FILE;

    const columns = this.parseRawNumberParams(columnsString);
    const rows = this.parseRawNumberParams(rowsString);
    data.mode = this.parseConversionMode(unparsedMode);

    for (let i = 1; i < rows + this.LOOP_OFFSET; i++) {
      const row = this.validateLine(lines[i], " ");

      if (row.length !== columns) {
        throw new Error(this.INVALID_ROW_LENGTH_MESSAGE);
      }

      data.matrix.push(row);
    }

    return data;
  }

  public writeDataInFile(filePath: string, data: string): void {
    fs.writeFileSync(filePath, data);
  }
}

export interface DataFromFile {
  mode: ConversionMode;
  matrix: string[][];
}

export default MealyMooreFileHandler;
