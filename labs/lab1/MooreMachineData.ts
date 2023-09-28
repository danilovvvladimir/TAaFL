import IMachineData from "./IMachineData";
import MealyMachineData from "./MealyMachineData";

export type DeterministicMoves = {
  initialStateAndInput: InitialStateAndInputSymbol;
  destinationState: string;
};

export type InitialStateAndInputSymbol = {
  initialState: string;
  inputSymbol: string;
};

export type DestinationStateAndSignal = {
  destinationState: string;
  signal: string;
};

class MooreMachineData implements IMachineData {
  private states: string[] = [];
  private inputAlphabet: string[] = [];
  private outputAlphabet: string[] = [];
  private stateSignals: DestinationStateAndSignal[] = [];
  private moves: DeterministicMoves[] = [];

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
      this.stateSignals.push({
        destinationState: `q${i}`,
        signal: this.outputAlphabet[i],
      });
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

    const result: DeterministicMoves[] = [];

    for (let i = 0; i < transposedRecords.length; i++) {
      for (let j = 0; j < transposedRecords[i].length; j++) {
        const move = transposedRecords[i][j];
        if (move === "-") {
          continue;
        }

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
    deterministicMoves: DeterministicMoves[],
    stateToSignal: DestinationStateAndSignal[],
  ) {
    const result = new Map<
      InitialStateAndInputSymbol,
      DestinationStateAndSignal
    >();

    for (const move of deterministicMoves) {
      const { initialStateAndInput, destinationState } = move;

      result.set(initialStateAndInput, {
        destinationState,
        signal: stateToSignal.filter(
          (sts) => sts.destinationState === destinationState,
        )[0].signal,
      });
    }

    return result;
  }

  public getConvertedData() {
    // Convert Moore to String
    return "s";
  }
}

export default MooreMachineData;
