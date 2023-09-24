import IMachineData from "./IMachineData";
import MealyMachineData from "./MealyMachineData";

type DeterministicMoves = Map<InitialStateAndInputSymbol, string>;
type InitialStateAndInputSymbol = {
  State: string;
  Symbol: string;
};

type DestinationStateAndSignal = Map<string, string>;
// type DestinationStateAndSignal = {
//   State: string;
//   Symbol: string;
// };

class MooreMachineData implements IMachineData {
  private states: string[] = [];
  private inputAlphabet: string[] = [];
  private outputAlphabet: string[] = [];
  private transitionFunctions: string[][] = [];
  private stateSignals: DestinationStateAndSignal = new Map<string, string>();
  private moves: DeterministicMoves = new Map<
    InitialStateAndInputSymbol,
    string
  >();

  constructor(info: string[][]) {
    if (!info || info.length === 0) {
      return;
    }

    for (let i = 0; i < info.length - 1; i++) {
      this.inputAlphabet.push(`x${i + 1}`);
    }

    this.outputAlphabet = info[0];

    for (let i = 0; i < info[0].length; i++) {
      this.states.push(`q${i}`);
      this.stateSignals.set(`q${i}`, this.outputAlphabet[i]);
    }

    this.moves = this.getDetermenisticMoves(
      info.slice(1),
      this.states,
      this.inputAlphabet,
    );

    console.log("inputAlphabet:", this.inputAlphabet);
    console.log("outputAlphabet:", this.outputAlphabet);
    console.log("States:", this.states);
    console.log("stateSignals:", this.stateSignals);
    console.log("moves:", this.moves);
  }

  private getDetermenisticMoves(
    info: string[][],
    states: string[],
    inputSymbols: string[],
  ) {
    const transposedRecords = this.transpose(info);

    const result: DeterministicMoves = new Map<
      InitialStateAndInputSymbol,
      string
    >();

    for (let i = 0; i < transposedRecords.length; i++) {
      for (let j = 0; j < transposedRecords[i].length; j++) {
        const move = transposedRecords[i][j];
        if (move === "-") {
          continue;
        }

        const stateAndInput: InitialStateAndInputSymbol = {
          State: states[i],
          Symbol: inputSymbols[j],
        };

        result.set(stateAndInput, move);
      }
    }

    return result;
  }

  private transpose(matrix: string[][]): string[][] {
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

  public convertToMealy() {
    const mealyData = this.getMealyMoves(this.moves, this.stateSignals);
    console.log("mealyData", mealyData);

    return new MealyMachineData([]);
  }

  private getMealyMoves(
    deterministicMoves: DeterministicMoves,
    stateToSignal: DestinationStateAndSignal,
  ) {
    const result = new Map<
      InitialStateAndInputSymbol,
      DestinationStateAndSignal
    >();

    for (const [initialStateAndInput, destinationState] of deterministicMoves) {
      result.set(
        initialStateAndInput,
        new Map().set(destinationState, stateToSignal.get(destinationState)),
      );
    }

    return result;
  }

  public getConvertedData() {
    // const mealyMachineData: MealyMachineData = new MealyMachineData();
    return "s";
  }
}

export default MooreMachineData;
