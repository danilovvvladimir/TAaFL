import MealyMooreHelper from "./MealyMooreHelper";
import { StateAndInputSymbol, MooreMove, MooreState } from "./MealyMooreTypes";

class MooreMachineData {
  private readonly DEFAULT_EMPTY_SYMBOL: string = "-";
  private readonly DEFAULT_INPUT_SYMBOL: string = "x";
  private readonly DEFAULT_SEPARATOR_SYMBOL: string = "/";
  private readonly DEFAULT_NEW_STATE_SYMBOL: string = "q";

  private states: MooreState[] = [];
  private inputSymbols: string[] = [];
  private outputAlphabet: string[] = [];
  private moves: MooreMove[] = [];

  private mealyMooreHelper = new MealyMooreHelper(this.DEFAULT_EMPTY_SYMBOL);

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

        const stateAndInputSymbol: StateAndInputSymbol = {
          state: states[i].state,
          inputSymbol: inputSymbols[j],
        };

        result.push({
          stateAndInputSymbol: stateAndInputSymbol,
          destinationState: move,
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

      [groupStatesMap, groupAmount] = this.buildNextEquivalencyGroups(
        groupStatesMap,
        this.inputSymbols,
        this.moves,
      );
    }

    // В Get newMinimizeValues выписать? или getMinimizeMealyStates tipo takova
    const oldStateToNewStateMap: Map<string, string> = new Map();
    const newStates: MooreState[] = [];

    for (const [group, oldStates] of groupStatesMap) {
      const baseState = oldStates[0];
      const newState = this.getNewStateName(group);

      for (const oldState of oldStates) {
        oldStateToNewStateMap.set(oldState, newState);
      }

      newStates.push({
        state: newState,
        signal: this.states.find((item) => item.state === baseState).signal,
      });
    }

    newStates.sort();

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

    this.states = newStates;
    this.moves = newMoves;
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

  private getNewStateName(stateNumber: number) {
    return this.DEFAULT_NEW_STATE_SYMBOL + stateNumber;
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

  // Отличается только тем, что [X]
  private buildNextEquivalencyGroups(
    groupToStatesMap: Map<number, string[]>,
    inputSymbols: string[],
    moves: MooreMove[],
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
          //[X] что овт тут в moves по другому вытаскивается. Можно сделать лучше. ПОсмотреть, что в mealy move мне не надо и там подфиксить. В муре всё норм нет излишней инфы
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

  private buildGroupHashToStatesMap(stateToGroupHashMap: Map<string, string>) {
    const result: Map<string, string[]> = new Map<string, string[]>();

    for (const [state, groupHash] of stateToGroupHashMap) {
      if (!result.has(groupHash)) {
        result.set(groupHash, []);
      }

      result.get(groupHash).push(state);
    }

    return result;
  }

  private buildStateToGroupMap(groupToStatesMap: Map<number, string[]>) {
    const result: Map<string, number> = new Map();

    for (const [group, states] of groupToStatesMap) {
      for (const state of states) {
        result.set(state, group);
      }
    }

    return result;
  }
}

export default MooreMachineData;
