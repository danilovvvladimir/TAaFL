import MealyMooreHelper from "./MealyMooreHelper";
import {
  MealyMove,
  StateAndInputSymbol,
  StateAndSignal,
} from "./MealyMooreTypes";

class MealyMachineData {
  private readonly DEFAULT_SEPARATOR_SYMBOL: string = "/";
  private readonly DEFAULT_STATE_SYMBOL: string = "";
  private readonly DEFAULT_EMPTY_SYMBOL: string = "-";
  private readonly DEFAULT_INPUT_SYMBOL: string = "x";

  private separatorSymbol: string = this.DEFAULT_SEPARATOR_SYMBOL;
  private stateSymbol: string = this.DEFAULT_STATE_SYMBOL;

  private inputSymbols: string[] = [];
  private states: string[] = [];
  private moves: MealyMove[] = [];

  private mealyMooreHelper = new MealyMooreHelper(this.DEFAULT_EMPTY_SYMBOL);

  constructor(args: string[][]) {
    if (Array.isArray(args)) {
      if (args.length === 0) {
        return;
      }

      const { separatorSymbol, stateSymbol } =
        this.mealyMooreHelper.getMealyMoveDetails(
          args,
          this.DEFAULT_EMPTY_SYMBOL,
        );

      this.separatorSymbol = separatorSymbol;
      this.stateSymbol = stateSymbol;

      for (let i = 0; i < args[0].length; i++) {
        this.states.push(`${this.stateSymbol}${i}`);
      }

      for (let i = 0; i < args.length; i++) {
        this.inputSymbols.push(`${this.DEFAULT_INPUT_SYMBOL}${i + 1}`);
      }

      this.moves = this.createMoves(args, this.states, this.inputSymbols);
    }
  }

  private createMoves(
    info: string[][],
    states: string[],
    inputSymbols: string[],
  ) {
    const result: MealyMove[] = [];

    for (let i = 0; i < info.length; i++) {
      for (let j = 0; j < info[i].length; j++) {
        const stateAndInputSymbol: StateAndInputSymbol = {
          state: states[j],
          inputSymbol: inputSymbols[i],
        };

        if (info[i][j] === this.DEFAULT_EMPTY_SYMBOL) {
          result.push({
            destinationStateAndSignal: {
              state: this.DEFAULT_EMPTY_SYMBOL,
              signal: this.DEFAULT_EMPTY_SYMBOL,
            },
            stateAndInputSymbol,
          });

          continue;
        }

        const splitedPair = this.mealyMooreHelper.splitBySymbol(
          info[i][j],
          this.separatorSymbol,
        );

        const destinationStateAndSignal: StateAndSignal = {
          state: splitedPair[0],
          signal: splitedPair[1],
        };

        result.push({ destinationStateAndSignal, stateAndInputSymbol });
      }
    }

    return result;
  }

  public toString() {
    let mealyStringData = this.states.join(" ") + "\n";

    for (let i = 0; i < this.inputSymbols.length; i++) {
      mealyStringData =
        mealyStringData +
        this.moves
          .filter(
            (item) =>
              item.stateAndInputSymbol.inputSymbol === this.inputSymbols[i],
          )
          .map(
            (item) =>
              item.destinationStateAndSignal.state +
              this.separatorSymbol +
              item.destinationStateAndSignal.signal,
          )
          .join(" ") +
        "\n";
    }

    return mealyStringData;
  }

  public getMoves() {
    return this.moves;
  }

  // private removeUnreachableMooreStates() {

  // }

  public minimize(): void {
    let [groupStatesMap, groupAmount] = this.buildOneEquivalencyGroups();
    console.log("groupStatesMap", groupStatesMap);
    console.log("amount", groupAmount);

    let previousGroupAmount = -1;

    while (groupAmount !== previousGroupAmount) {
      previousGroupAmount = groupAmount;

      [groupStatesMap, groupAmount] = this.buildNextEquivalencyGroups(
        groupStatesMap,
        this.inputSymbols,
        this.moves,
      );

      console.log("temp groupStatesMap", groupStatesMap);
      console.log("temp amount", groupAmount);
    }

    // build minimaze mealy
    console.log("final groupStatesMap", groupStatesMap);
    console.log("final amount", groupAmount);
  }

  private buildOneEquivalencyGroups(): [Map<number, string[]>, number] {
    const stateToGroupHashMap: Map<string, string> = new Map<string, string>();

    for (const sourceState of this.states) {
      for (const inputSymbol of this.inputSymbols) {
        const key: StateAndInputSymbol = {
          state: sourceState,
          inputSymbol: inputSymbol,
        };

        const destinationSignal = this.moves.find(
          (item) =>
            JSON.stringify(item.stateAndInputSymbol) === JSON.stringify(key),
        ).destinationStateAndSignal.signal;

        if (stateToGroupHashMap.has(sourceState)) {
          const existingRecord = stateToGroupHashMap.get(sourceState);
          stateToGroupHashMap.set(
            sourceState,
            existingRecord + destinationSignal,
          );
        } else {
          stateToGroupHashMap.set(sourceState, destinationSignal);
        }
      }
    }

    const groupHashToStatesMap =
      this.buildGroupHashToStatesMap(stateToGroupHashMap);

    const groupToStatesMap: Map<number, string[]> = new Map<number, string[]>();
    let groupAmount = 0;

    for (const newStates of groupHashToStatesMap.values()) {
      groupToStatesMap.set(groupAmount, newStates);
      groupAmount++;
    }

    return [groupToStatesMap, groupAmount];
  }

  // Reverse мапы, могу иначе сделать
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

  private buildNextEquivalencyGroups(
    groupToStatesMap: Map<number, string[]>,
    inputSymbols: string[],
    moves: MealyMove[],
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
          ).destinationStateAndSignal.state;
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

export default MealyMachineData;
