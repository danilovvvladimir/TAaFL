import MealyMooreHelper from "./MealyMooreHelper";
import { StateAndInputSymbol, MooreMove, MooreState } from "./MealyMooreTypes";

class MooreMachineData {
  private readonly DEFAULT_INPUT_SYMBOL: string = "x";
  private readonly STATE_TRANSFORM_REGEX: RegExp = /\D+/g;

  private states: MooreState[] = [];
  private inputSymbols: string[] = [];
  private outputAlphabet: string[] = [];
  private moves: MooreMove[] = [];

  private mealyMooreHelper = new MealyMooreHelper();

  constructor(args: string[][]) {
    if (Array.isArray(args)) {
      if (args.length === 0) {
        return;
      }

      for (let i = 0; i < args.length - 1; i++) {
        this.inputSymbols.push(`${this.DEFAULT_INPUT_SYMBOL}${i + 1}`);
      }

      this.outputAlphabet = args[0];

      for (let i = 0; i < args[0].length; i++) {
        this.states.push({
          state: `${i}`,
          signal: this.outputAlphabet[i],
        });
      }

      this.moves = this.createMoves(
        args.slice(1),
        this.states,
        this.inputSymbols,
      );
    }
  }

  private createMoves(
    info: string[][],
    states: MooreState[],
    inputSymbols: string[],
  ) {
    const transposedRecords = this.mealyMooreHelper.transposeMatrix(info);

    const result: MooreMove[] = [];

    for (let i = 0; i < transposedRecords.length; i++) {
      for (let j = 0; j < transposedRecords[i].length; j++) {
        const move = transposedRecords[i][j];
        const transformedMove = move.replace(this.STATE_TRANSFORM_REGEX, "");

        const stateAndInputSymbol: StateAndInputSymbol = {
          state: states[i].state,
          inputSymbol: inputSymbols[j],
        };

        result.push({
          stateAndInputSymbol: stateAndInputSymbol,
          destinationState: transformedMove,
        });
      }
    }

    return result;
  }

  public toString() {
    let mooreStringData =
      this.states
        .map((item) => {
          return `${item.state}/${item.signal}`;
        })
        .join(" ") + "\n";

    for (let i = 0; i < this.inputSymbols.length; i++) {
      mooreStringData =
        mooreStringData +
        this.moves
          .filter(
            (item) =>
              item.stateAndInputSymbol.inputSymbol === this.inputSymbols[i],
          )
          .map((item) => item.destinationState)
          .join(" ") +
        "\n";
    }

    return mooreStringData;
  }

  public getMoves() {
    return this.moves;
  }

  public getStates() {
    return this.states;
  }

  public minimize(): void {
    let [groupStatesMap, groupAmount] = this.buildZeroEquivalencyGroups();
    let previousGroupAmount = -1;

    while (groupAmount !== previousGroupAmount) {
      previousGroupAmount = groupAmount;

      [groupStatesMap, groupAmount] =
        this.mealyMooreHelper.buildNextEquivalencyGroups(
          groupStatesMap,
          this.inputSymbols,
          this.moves,
        );
    }

    const [oldStateToNewStateMap, newStates] =
      this.getMinimizedStates(groupStatesMap);

    const newMoves = this.getMinimizedMoves(
      groupStatesMap,
      oldStateToNewStateMap,
    );

    this.states = newStates;
    this.moves = newMoves;
  }

  private getMinimizedMoves(
    groupStatesMap: Map<number, string[]>,
    oldStateToNewStateMap: Map<string, string>,
  ): MooreMove[] {
    const newMoves: MooreMove[] = [];

    for (const states of groupStatesMap.values()) {
      const baseState = states[0];

      for (const inputSymbol of this.inputSymbols) {
        const key: StateAndInputSymbol = {
          state: baseState,
          inputSymbol: inputSymbol,
        };

        const oldDestinationStateAndSignal = this.moves.find(
          (item) =>
            JSON.stringify(item.stateAndInputSymbol) === JSON.stringify(key),
        ).destinationState;

        const newKey: StateAndInputSymbol = {
          state: oldStateToNewStateMap.get(baseState),
          inputSymbol: inputSymbol,
        };

        newMoves.push({
          stateAndInputSymbol: newKey,
          destinationState: oldStateToNewStateMap.get(
            oldDestinationStateAndSignal,
          ),
        });
      }
    }

    return newMoves;
  }

  private getMinimizedStates(
    groupStatesMap: Map<number, string[]>,
  ): [Map<string, string>, MooreState[]] {
    const oldStateToNewStateMap: Map<string, string> = new Map();
    const newStates: MooreState[] = [];

    for (const [group, oldStates] of groupStatesMap) {
      const baseState = oldStates[0];
      const newState = this.mealyMooreHelper.getNewStateName(group);

      for (const oldState of oldStates) {
        oldStateToNewStateMap.set(oldState, newState);
      }

      newStates.push({
        state: newState,
        signal: this.states.find((item) => item.state === baseState).signal,
      });
    }

    newStates.sort();
    return [oldStateToNewStateMap, newStates];
  }

  private buildZeroEquivalencyGroups(): [Map<number, string[]>, number] {
    const signalToStatesMap: Map<string, string[]> =
      this.buildSignalToStatesMap(this.states);

    const groupToStatesMap: Map<number, string[]> = new Map();
    let groupAmount = 0;

    for (const states of signalToStatesMap.values()) {
      groupToStatesMap.set(groupAmount, states);
      groupAmount++;
    }

    return [groupToStatesMap, groupAmount];
  }

  private buildSignalToStatesMap(
    mooreStates: MooreState[],
  ): Map<string, string[]> {
    const result: Map<string, string[]> = new Map();

    for (const mooreState of mooreStates) {
      if (!result.has(mooreState.signal)) {
        result.set(mooreState.signal, []);
      }

      const existingItem = result.get(mooreState.signal);
      result.set(mooreState.signal, [...existingItem, mooreState.state]);
    }

    return result;
  }
}

export default MooreMachineData;
