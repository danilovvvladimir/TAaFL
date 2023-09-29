import MealyMachineData from "./MealyMachineData";
import MealyMooreHelper from "./MealyMooreHelper";
import {
  DestinationStateAndSignal,
  InitialStateAndInputSymbol,
  MooreMachineDataInfo,
  MooreMove,
} from "./MealyMooreTypes";

class MooreMachineData {
  private readonly DEFAULT_EMPTY_SYMBOL: string = "-";
  private readonly DEFAULT_INPUT_SYMBOL: string = "x";
  private readonly DEFAULT_SEPARATOR_SYMBOL: string = "/";

  private states: string[] = [];
  private inputSymbols: string[] = [];
  private outputAlphabet: string[] = [];
  private stateSignals: DestinationStateAndSignal[] = [];
  private moves: MooreMove[] = [];

  private mealyMooreHelper = new MealyMooreHelper(this.DEFAULT_EMPTY_SYMBOL);

  constructor(info: string[][]);
  constructor(mooreMachineDataInfo: MooreMachineDataInfo);

  constructor(args: string[][] | MooreMachineDataInfo) {
    if (Array.isArray(args)) {
      if (!args || args.length === 0) {
        return;
      }

      for (let i = 0; i < args.length - 1; i++) {
        this.inputSymbols.push(`${this.DEFAULT_INPUT_SYMBOL}${i + 1}`);
      }

      this.outputAlphabet = args[0];

      for (let i = 0; i < args[0].length; i++) {
        this.states.push(`${i + 1}`);
        this.stateSignals.push({
          destinationState: `${i + 1}`,
          signal: this.outputAlphabet[i].split(
            this.DEFAULT_SEPARATOR_SYMBOL,
          )[1],
        });
      }

      this.moves = this.createMoves(
        args.slice(1),
        this.states,
        this.inputSymbols,
      );
    } else {
      const { inputSymbols, moves, stateSignals, states } = args;

      this.inputSymbols = inputSymbols;
      this.moves = moves;
      this.stateSignals = stateSignals;
      this.states = states;
    }
  }

  private createMoves(
    info: string[][],
    states: string[],
    inputSymbols: string[],
  ) {
    const transposedRecords = this.mealyMooreHelper.transposeMatrix(info);

    const result: MooreMove[] = [];

    for (let i = 0; i < transposedRecords.length; i++) {
      for (let j = 0; j < transposedRecords[i].length; j++) {
        const move = transposedRecords[i][j];

        const stateAndInput: InitialStateAndInputSymbol = {
          initialState: states[i],
          inputSymbol: inputSymbols[j],
        };

        result.push({
          initialStateAndInput: stateAndInput,
          destinationState: move,
        });
      }
    }

    return result;
  }

  public convertToMealy() {
    const mealyMoves = this.mealyMooreHelper.getMealyMovesByMoore(
      this.moves,
      this.stateSignals,
    );

    return new MealyMachineData({
      inputSymbols: this.inputSymbols,
      moves: mealyMoves,
      states: this.states,
    });
  }

  public toString() {
    let mooreStringData =
      this.stateSignals.map((item) => item.signal).join(" ") + "\n";

    for (let i = 0; i < this.inputSymbols.length; i++) {
      mooreStringData =
        mooreStringData +
        this.moves
          .filter(
            (item) =>
              item.initialStateAndInput.inputSymbol === this.inputSymbols[i],
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

  public getStateSignals() {
    return this.stateSignals;
  }
}

export default MooreMachineData;
