import {
  StateAndInputSymbol,
  MealyMove,
  MooreMove,
  ParsedMealyMove,
  StateAndSignal,
  MooreState,
} from "./MealyMooreTypes";

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

  public getMealyMovesByMoore(
    mooreMoves: MooreMove[],
    mooreStateSignals: StateAndSignal[],
  ): MealyMove[] {
    const result: MealyMove[] = [];

    for (const move of mooreMoves) {
      const { stateAndInputSymbol, destinationState } = move;
      if (destinationState === this.emptyStateSymbol) {
        result.push({
          stateAndInputSymbol,
          destinationStateAndSignal: {
            state: this.emptyStateSymbol,
            signal: this.emptyStateSymbol,
          },
        });

        continue;
      }

      result.push({
        stateAndInputSymbol,
        destinationStateAndSignal: {
          state: destinationState,
          signal: mooreStateSignals.find(
            (item) => item.state === destinationState,
          ).signal,
        },
      });
    }

    return result;
  }

  public splitBySymbol(unsplitedString: string, splitBySymbol: string) {
    return unsplitedString.split(splitBySymbol);
  }

  public buildMooreStatesByMealy(
    inputSymbols: string[],
    mealyStates: string[],
    mealyMoves: MealyMove[],
  ): MooreState[] {
    const processedStates = new Set<string>();

    const result: MooreState[] = [];
    let stateNumberCounter = 1;

    for (const inputSymbol of inputSymbols) {
      for (const state of mealyStates) {
        const key: StateAndInputSymbol = {
          state,
          inputSymbol,
        };

        const destinationStateAndSignal = mealyMoves.find(
          (item) =>
            JSON.stringify(item.stateAndInputSymbol) === JSON.stringify(key),
        ).destinationStateAndSignal;

        if (destinationStateAndSignal.state === this.emptyStateSymbol) {
          continue;
        }

        if (
          destinationStateAndSignal &&
          !processedStates.has(JSON.stringify(destinationStateAndSignal))
        ) {
          result.push({
            newState: `${stateNumberCounter}`,
            originalStateAndSignal: destinationStateAndSignal,
          });

          stateNumberCounter++;
          processedStates.add(JSON.stringify(destinationStateAndSignal));
        }
      }
    }

    return result;
  }

  public getMooreMovesByMealy(
    mooreStates: MooreState[],
    mealyMoves: MealyMove[],
    inputSymbols: string[],
  ) {
    const result: MooreMove[] = [];

    for (const mooreState of mooreStates) {
      for (const inputSymbol of inputSymbols) {
        const key: StateAndInputSymbol = {
          state: mooreState.newState,
          inputSymbol,
        };

        const mealyMove = mealyMoves.find(
          (item) =>
            JSON.stringify(item.stateAndInputSymbol) ===
            JSON.stringify({
              state: mooreState.originalStateAndSignal.state,
              inputSymbol,
            } as StateAndInputSymbol),
        );

        if (
          mealyMove.destinationStateAndSignal.state === this.emptyStateSymbol
        ) {
          result.push({
            stateAndInputSymbol: key,
            destinationState: this.emptyStateSymbol,
          });

          continue;
        }

        result.push({
          stateAndInputSymbol: key,
          destinationState: mooreStates.find(
            (item) =>
              JSON.stringify(item.originalStateAndSignal) ===
              JSON.stringify(mealyMove.destinationStateAndSignal),
          ).newState,
        });
      }
    }

    return result;
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
