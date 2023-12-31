import MealyMooreHelper from "./MealyMooreHelper";
import {
  MealyMove,
  MealyMachineDataInfo,
  StateAndInputSymbol,
  StateAndSignal,
} from "./MealyMooreTypes";
import MooreMachineData from "./MooreMachineData";

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

  constructor(info: string[][]);
  constructor(MealyMachineDataInfo: MealyMachineDataInfo);
  constructor(args: string[][] | MealyMachineDataInfo) {
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
    } else {
      const { inputSymbols, moves, states } = args;
      this.states = states;
      this.inputSymbols = inputSymbols;
      this.moves = moves;
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

  public convertToMoore() {
    const mooreStates = this.mealyMooreHelper.buildMooreStatesByMealy(
      this.inputSymbols,
      this.states,
      this.moves,
    );

    const mooreMoves = this.mealyMooreHelper.getMooreMovesByMealy(
      mooreStates,
      this.moves,
      this.inputSymbols,
    );

    return new MooreMachineData({
      inputSymbols: this.inputSymbols,
      moves: mooreMoves,
      states: mooreStates,
    });
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
}

export default MealyMachineData;
