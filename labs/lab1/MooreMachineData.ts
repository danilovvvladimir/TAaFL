import IMachineData from "./IMachineData";
import MealyMachineData, { MealyMove } from "./MealyMachineData";

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

export interface MooreMachineDataProps {
  states: string[];
  inputAlphabet: string[];
  stateSignals: DestinationStateAndSignal[];
  moves: DeterministicMoves[];
}

class MooreMachineData implements IMachineData {
  private states: string[] = [];
  private inputAlphabet: string[] = [];
  private outputAlphabet: string[] = [];
  private stateSignals: DestinationStateAndSignal[] = [];
  private moves: DeterministicMoves[] = [];

  constructor(info: string[][]);
  constructor(mooreMachineDataProps: MooreMachineDataProps);

  constructor(args: string[][] | MooreMachineDataProps) {
    if (Array.isArray(args)) {
      if (!args || args.length === 0) {
        return;
      }

      for (let i = 0; i < args.length - 1; i++) {
        this.inputAlphabet.push(`x${i + 1}`);
      }

      this.outputAlphabet = args[0];

      for (let i = 0; i < args[0].length; i++) {
        this.states.push(`q${i}`);
        this.stateSignals.push({
          destinationState: `q${i}`,
          signal: this.outputAlphabet[i],
        });
      }

      this.moves = this.getDetermenisticMoves(
        args.slice(1),
        this.states,
        this.inputAlphabet,
      );

      // console.log("inputAlphabet:", this.inputAlphabet);
      // console.log("outputAlphabet:", this.outputAlphabet);
      // console.log("States:", this.states);
      // console.log("stateSignals:", this.stateSignals);
      // console.log("moves:", this.moves);
    } else {
      const { inputAlphabet, moves, stateSignals, states } = args;

      this.inputAlphabet = inputAlphabet;
      this.moves = moves;
      this.stateSignals = stateSignals;
      this.states = states;
    }
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
    const mealyMoves = this.getMealyMoves(this.moves, this.stateSignals);

    return new MealyMachineData({
      inputAlphabet: this.inputAlphabet,
      moves: mealyMoves,
      states: this.states,
    });
  }

  private getMealyMoves(
    deterministicMoves: DeterministicMoves[],
    stateToSignal: DestinationStateAndSignal[],
  ): MealyMove[] {
    const result: MealyMove[] = [];

    for (const move of deterministicMoves) {
      const { initialStateAndInput, destinationState } = move;

      // result.set(initialStateAndInput, {
      //   destinationState,
      //   signal: stateToSignal.filter(
      //     (sts) => sts.destinationState === destinationState,
      //   )[0].signal,
      // });

      result.push({
        initialStateAndInput,
        destinationStateAndSignal: {
          destinationState,
          signal: stateToSignal.filter(
            (sts) => sts.destinationState === destinationState,
          )[0].signal,
        },
      });
    }

    return result;
  }

  public getConvertedData() {
    // Convert Moore to String
    return "moore data";
  }
}

export default MooreMachineData;
