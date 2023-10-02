import MealyMachineData from "./MealyMachineData";
import MealyMooreHelper from "./MealyMooreHelper";
import {
  StateAndInputSymbol,
  MooreMachineDataInfo,
  MooreMove,
  MooreState,
} from "./MealyMooreTypes";

class MooreMachineData {
  private readonly DEFAULT_EMPTY_SYMBOL: string = "-";
  private readonly DEFAULT_INPUT_SYMBOL: string = "x";
  private readonly DEFAULT_SEPARATOR_SYMBOL: string = "/";

  private states: MooreState[] = [];
  private inputSymbols: string[] = [];
  private outputAlphabet: string[] = [];
  private moves: MooreMove[] = [];

  private mealyMooreHelper = new MealyMooreHelper(this.DEFAULT_EMPTY_SYMBOL);

  constructor(info: string[][]);
  constructor(mooreMachineDataInfo: MooreMachineDataInfo);

  constructor(args: string[][] | MooreMachineDataInfo) {
    if (Array.isArray(args)) {
      if (args.length === 0) {
        return;
      }

      for (let i = 0; i < args.length - 1; i++) {
        this.inputSymbols.push(`${this.DEFAULT_INPUT_SYMBOL}${i + 1}`);
      }

      this.outputAlphabet = args[0];

      for (let i = 0; i < args[0].length; i++) {
        const [originalState, originalSignal] = this.outputAlphabet[i].split(
          this.DEFAULT_SEPARATOR_SYMBOL,
        );

        this.states.push({
          newState: `${i + 1}`,
          originalStateAndSignal: {
            state: originalState,
            signal: originalSignal,
          },
        });
      }

      this.moves = this.createMoves(
        args.slice(1),
        this.states,
        this.inputSymbols,
      );
    } else {
      const { inputSymbols, moves, states } = args;

      this.inputSymbols = inputSymbols;
      this.moves = moves;
      this.states = states;
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
          state: states[i].newState,
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

  public convertToMealy() {
    const mealyMoves = this.mealyMooreHelper.getMealyMovesByMoore(
      this.moves,
      this.states.map((state) => {
        return {
          state: state.newState,
          signal: state.originalStateAndSignal.signal,
        };
      }),
    );

    return new MealyMachineData({
      inputSymbols: this.inputSymbols,
      moves: mealyMoves,
      states: this.states.map((state) => state.newState),
    });
  }

  public toString() {
    let mooreStringData =
      this.states
        .map((item) => {
          return `${item.originalStateAndSignal.state}/${item.originalStateAndSignal.signal}`;
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
}

export default MooreMachineData;
