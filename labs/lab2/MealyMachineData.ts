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

  public minimize(): void {
    // Должен изменить states и moves.
    console.log("mealy states", this.states);
    console.log("mealy moves", this.moves);
    const initialMap: Map<string, StateAndSignal[]> = new Map<
      string,
      StateAndSignal[]
    >();

    for (const move of this.moves) {
      const { destinationStateAndSignal, stateAndInputSymbol } = move;

      if (!initialMap.has(stateAndInputSymbol.state)) {
        initialMap.set(stateAndInputSymbol.state, [destinationStateAndSignal]);
      } else {
        const existingItem = initialMap.get(stateAndInputSymbol.state);
        initialMap.set(stateAndInputSymbol.state, [
          ...existingItem,
          destinationStateAndSignal,
        ]);
      }
    }

    const firstGroup: Map<string, string[]> = new Map<string, string[]>();

    for (const move of initialMap) {
      const [state, stateAndSignalArray] = move;

      const key = stateAndSignalArray.map((item) => item.signal).join("");

      if (!firstGroup.has(key)) {
        firstGroup.set(key, [state]);
      } else {
        firstGroup.set(key, [...firstGroup.get(key), state]);
      }
    }

    console.log("initial map", initialMap);
    console.log("firstGroup", firstGroup);
    let oldGroupSize = firstGroup.size;
    let newGroupSize: number = -1;

    // while (oldGroupSize !== newGroupSize) {
    const newGroup: Map<string, Set<string>> = new Map<string, Set<string>>();
    const ttt = Array.from(firstGroup.values());

    for (const temp of firstGroup) {
      const [key, states] = temp;

      for (const state of states) {
        const res = initialMap.get(state);

        for (const stateAndSignal of res) {
          const { signal, state } = stateAndSignal;

          const index = ttt.findIndex((item) => item.includes(state)) + 1;
          const finalIndex = "A" + index;
          // console.log(`${state} = A${index}`);
          if (!newGroup.has(finalIndex)) {
            newGroup.set(finalIndex, new Set<string>().add(state));
          } else {
            const existingItem = newGroup.get(finalIndex);
            existingItem.add(state);
            // newGroup.set(finalIndex, existingItem.add(state)]);
          }
        }
        console.log(newGroup);
      }
    }
    // }
  }
}

export default MealyMachineData;
