import { ParsedMealyMove } from "./MealyMooreTypes";

class MealyMooreHelper {
  private emptyStateSymbol: string;

  constructor(emptyStateSymbol: string) {
    this.emptyStateSymbol = emptyStateSymbol;
  }

  public transposeMatrix(matrix: string[][]): string[][] {
    const xl = matrix[0].length;
    const yl = matrix.length;

    const result: string[][] = new Array(xl);
    for (let i = 0; i < xl; i++) {
      result[i] = new Array(yl);
    }

    for (let i = 0; i < xl; i++) {
      for (let j = 0; j < yl; j++) {
        result[i][j] = matrix[j][i];
      }
    }

    return result;
  }

  public splitBySymbol(unsplitedString: string, splitBySymbol: string) {
    return unsplitedString.split(splitBySymbol);
  }

  public getMealyMoveDetails(
    matrix: string[][],
    emptySymbol: string,
  ): ParsedMealyMove {
    const regex = /\d+/;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === emptySymbol) {
          continue;
        }

        const mealyCorrectMove = matrix[i][j];
        const numericSequence = mealyCorrectMove.match(regex);

        const symbolAfterNumericSequence =
          mealyCorrectMove[numericSequence.index + numericSequence[0].length];

        const symbolBeforeNumericSequence =
          numericSequence.index - 1 < 0
            ? ""
            : mealyCorrectMove[numericSequence.index - 1];

        return {
          separatorSymbol: symbolAfterNumericSequence,
          stateSymbol: symbolBeforeNumericSequence,
        };
      }
    }
  }
}

export default MealyMooreHelper;
