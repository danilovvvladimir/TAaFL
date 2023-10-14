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

  private mealyMooreHelper = new MealyMooreHelper();

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

  public minimize(): void {
    let [groupStatesMap, groupAmount] = this.buildOneEquivalencyGroups();
    let previousGroupAmount = -1;

    while (groupAmount !== previousGroupAmount) {
      previousGroupAmount = groupAmount;

      [groupStatesMap, groupAmount] =
        this.mealyMooreHelper.buildNextEquivalencyGroups(
          groupStatesMap,
          this.inputSymbols,
          this.moves.map((move) => {
            return {
              destinationState: move.destinationStateAndSignal.state,
              stateAndInputSymbol: move.stateAndInputSymbol,
            };
          }),
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
  ): MealyMove[] {
    const newMoves: MealyMove[] = [];

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
        ).destinationStateAndSignal;

        const newKey: StateAndInputSymbol = {
          state: oldStateToNewStateMap.get(baseState),
          inputSymbol: inputSymbol,
        };

        newMoves.push({
          stateAndInputSymbol: newKey,
          destinationStateAndSignal: {
            state: oldStateToNewStateMap.get(
              oldDestinationStateAndSignal.state,
            ),
            signal: oldDestinationStateAndSignal.signal,
          },
        });
      }
    }

    return newMoves;
  }

  private getMinimizedStates(
    groupStatesMap: Map<number, string[]>,
  ): [Map<string, string>, string[]] {
    const oldStateToNewStateMap: Map<string, string> = new Map();
    const newStates: string[] = [];

    for (const [group, oldStates] of groupStatesMap) {
      const newState = this.mealyMooreHelper.getNewStateName(group);

      for (const oldState of oldStates) {
        oldStateToNewStateMap.set(oldState, newState);
      }

      newStates.push(newState);
    }

    newStates.sort();

    return [oldStateToNewStateMap, newStates];
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
      this.mealyMooreHelper.buildGroupHashToStatesMap(stateToGroupHashMap);

    const groupToStatesMap: Map<number, string[]> = new Map<number, string[]>();
    let groupAmount = 0;

    for (const newStates of groupHashToStatesMap.values()) {
      groupToStatesMap.set(groupAmount, newStates);
      groupAmount++;
    }

    return [groupToStatesMap, groupAmount];
  }
}

export default MealyMachineData;
