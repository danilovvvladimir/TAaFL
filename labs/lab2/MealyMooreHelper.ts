import {
  DeterministicMove,
  ParsedMealyMove,
  StateAndInputSymbol,
} from "./MealyMooreTypes";

class MealyMooreHelper {
  private readonly DEFAULT_NEW_STATE_SYMBOL: string = "q";

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

  public buildStateToGroupMap(groupToStatesMap: Map<number, string[]>) {
    const result: Map<string, number> = new Map();

    for (const [group, states] of groupToStatesMap) {
      for (const state of states) {
        result.set(state, group);
      }
    }

    return result;
  }

  public buildNextEquivalencyGroups(
    groupToStatesMap: Map<number, string[]>,
    inputSymbols: string[],
    moves: DeterministicMove[],
  ): [Map<number, string[]>, number] {
    const stateToNewGroupMap: Map<number, string[]> = new Map();

    const stateToGroupMap: Map<string, number> =
      this.buildStateToGroupMap(groupToStatesMap);

    let groupAmount = 0;

    for (const groupStates of groupToStatesMap.values()) {
      const stateToGroupHashMap: Map<string, string> = new Map();

      for (const sourceState of groupStates) {
        for (const inputSymbol of inputSymbols) {
          const key: StateAndInputSymbol = {
            state: sourceState,
            inputSymbol: inputSymbol,
          };

          const destinationState = moves.find(
            (item) =>
              JSON.stringify(item.stateAndInputSymbol) === JSON.stringify(key),
          ).destinationState;

          const destinationGroup = stateToGroupMap.get(destinationState);

          if (!stateToGroupHashMap.has(sourceState)) {
            stateToGroupHashMap.set(sourceState, destinationGroup.toString());
          } else {
            const existingRecord = stateToGroupHashMap.get(sourceState);

            stateToGroupHashMap.set(
              sourceState,
              existingRecord + destinationGroup.toString(),
            );
          }
        }
      }

      const groupHashToStatesMap =
        this.buildGroupHashToStatesMap(stateToGroupHashMap);

      for (const newStates of groupHashToStatesMap.values()) {
        stateToNewGroupMap.set(groupAmount, newStates);
        groupAmount++;
      }
    }

    return [stateToNewGroupMap, groupAmount];
  }

  public buildGroupHashToStatesMap(stateToGroupHashMap: Map<string, string>) {
    const result: Map<string, string[]> = new Map<string, string[]>();

    for (const [state, groupHash] of stateToGroupHashMap) {
      if (!result.has(groupHash)) {
        result.set(groupHash, []);
      }

      result.get(groupHash).push(state);
    }

    return result;
  }

  public getNewStateName(stateNumber: number) {
    return this.DEFAULT_NEW_STATE_SYMBOL + stateNumber;
  }
}

export default MealyMooreHelper;
