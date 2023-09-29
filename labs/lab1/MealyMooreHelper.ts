import {
  DestinationStateAndSignal,
  InitialStateAndInputSymbol,
  MealyMove,
  MooreMove,
  ParsedMealyMove,
  TestType,
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
    mooreStateSignals: DestinationStateAndSignal[],
  ): MealyMove[] {
    const result: MealyMove[] = [];

    for (const move of mooreMoves) {
      const { initialStateAndInput, destinationState } = move;
      if (destinationState === this.emptyStateSymbol) {
        result.push({
          initialStateAndInput,
          destinationStateAndSignal: {
            destinationState: this.emptyStateSymbol,
            signal: this.emptyStateSymbol,
          },
        });

        continue;
      }

      result.push({
        initialStateAndInput,
        destinationStateAndSignal: {
          destinationState,
          signal: mooreStateSignals.find(
            (item) => item.destinationState === destinationState,
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
  ) {
    // TODO: мб сет вместо этого
    const processedStates: Map<string, boolean> = new Map();

    const result: TestType[] = [];
    let counter = 1;

    for (const inputSymbol of inputSymbols) {
      for (const state of mealyStates) {
        const key: InitialStateAndInputSymbol = {
          initialState: state,
          inputSymbol,
        };

        const destinationStateAndSignal = mealyMoves.find(
          (item) =>
            JSON.stringify(item.initialStateAndInput) === JSON.stringify(key),
        ).destinationStateAndSignal;

        if (
          destinationStateAndSignal.destinationState === this.emptyStateSymbol
        ) {
          continue;
        }

        if (
          destinationStateAndSignal &&
          !processedStates.get(JSON.stringify(destinationStateAndSignal))
        ) {
          result.push({ state: `${counter}`, destinationStateAndSignal });

          counter++;
          processedStates.set(JSON.stringify(destinationStateAndSignal), true);
        }
      }
    }

    return result;
  }

  public getMooreStateSignalsByMealy(oldAndNewStates: TestType[]) {
    const result: DestinationStateAndSignal[] = [];

    oldAndNewStates.forEach(({ destinationStateAndSignal, state }) => {
      result.push({
        signal: destinationStateAndSignal.signal,
        destinationState: state,
      });
    });

    return result;
  }

  public getMooreMovesByMealy(
    mooreStates: string[],
    mealyMoves: MealyMove[],
    inputSymbols: string[],
    oldAndNewStates: TestType[],
  ) {
    const result: MooreMove[] = [];

    for (const state of mooreStates) {
      const oldState = oldAndNewStates.find((item) => item.state === state)
        .destinationStateAndSignal.destinationState;

      if (!oldState) {
        continue;
      }

      for (const symbol of inputSymbols) {
        const key: InitialStateAndInputSymbol = {
          initialState: state,
          inputSymbol: symbol,
        };

        const mealyMove = mealyMoves.find(
          (item) =>
            JSON.stringify(item.initialStateAndInput) ===
            JSON.stringify({
              initialState: oldState,
              inputSymbol: symbol,
            }),
        );

        if (
          mealyMove.destinationStateAndSignal.destinationState ===
          this.emptyStateSymbol
        ) {
          result.push({
            initialStateAndInput: key,
            destinationState: this.emptyStateSymbol,
          });

          continue;
        }

        result.push({
          initialStateAndInput: key,
          destinationState: oldAndNewStates.find(
            (item) =>
              JSON.stringify(item.destinationStateAndSignal) ===
              JSON.stringify(mealyMove.destinationStateAndSignal),
          ).state,
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

        if (numericSequence && numericSequence.index !== undefined) {
          const symbolAfterNumericSequence =
            mealyCorrectMove[numericSequence.index + numericSequence[0].length];

          const symbolBeforeNumericSequence =
            numericSequence.index - 1 < 0
              ? ""
              : mealyCorrectMove[numericSequence.index - 1];

          if (symbolAfterNumericSequence) {
            return {
              separatorSymbol: symbolAfterNumericSequence,
              stateSymbol: symbolBeforeNumericSequence,
            };
          }
        }
      }
    }
  }
}

export default MealyMooreHelper;
