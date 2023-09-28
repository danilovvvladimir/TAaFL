import IMachineData from "./IMachineData";
import MooreMachineData, {
  DestinationStateAndSignal,
  DeterministicMoves,
  InitialStateAndInputSymbol,
} from "./MooreMachineData";

export type MealyMove = {
  initialStateAndInput: InitialStateAndInputSymbol;
  destinationStateAndSignal: DestinationStateAndSignal;
};

export type TestType = {
  state: string;
  destinationStateAndSignal: DestinationStateAndSignal;
};

export interface MealyMachineDataProps {
  states: string[];
  inputAlphabet: string[];
  moves: MealyMove[];
}

class MealyMachineData implements IMachineData {
  private states: string[] = [];
  private inputAlphabet: string[] = [];
  private moves: MealyMove[] = [];

  constructor(info: string[][]);
  constructor(mealyMachineDataProps: MealyMachineDataProps);
  constructor(args: string[][] | MealyMachineDataProps) {
    if (Array.isArray(args)) {
      if (!args || args.length === 0) {
        return;
      }

      console.log("info", args);

      for (let i = 0; i < args[0].length; i++) {
        this.states.push(`S${i}`);
      }

      for (let i = 0; i < args.length; i++) {
        this.inputAlphabet.push(`x${i + 1}`);
      }

      this.moves = this.getMoves(args, this.states, this.inputAlphabet);

      // console.log("inputAlphabet:", this.inputAlphabet);
      // console.log("States:", this.states);
      // console.log("moves:", this.moves);
    } else {
      const { inputAlphabet, moves, states } = args;
      this.states = states;
      this.inputAlphabet = inputAlphabet;
      this.moves = moves;
    }
  }
  private getMoves(
    info: string[][],
    states: string[],
    inputAlphabet: string[],
  ) {
    const result: MealyMove[] = [];

    for (let i = 0; i < info.length; i++) {
      for (let j = 0; j < info[i].length; j++) {
        const splitedPair = this.splitBySymbol(info[i][j], "/");

        const destinationStateAndSignal: DestinationStateAndSignal = {
          destinationState: splitedPair[0],
          signal: splitedPair[1],
        };

        const initialStateAndInput: InitialStateAndInputSymbol = {
          initialState: states[j],
          inputSymbol: inputAlphabet[i],
        };

        result.push({ destinationStateAndSignal, initialStateAndInput });
      }
    }

    return result;
  }

  public convertToMoore() {
    const newStateToOldPair = this.buildMooreStates(
      this.inputAlphabet,
      this.states,
      this.moves,
    );

    // const mooreStates = Array.from(newStateToOldPair.keys()).sort();
    const mooreStates = newStateToOldPair.map((item) => item.state);

    const mooreStateSignals = this.getMooreStateSignals(newStateToOldPair);

    const mooreMoves = this.getMooreMoves(
      mooreStates,
      this.moves,
      this.inputAlphabet,
      newStateToOldPair,
    );

    console.log(mooreMoves);

    return new MooreMachineData({
      inputAlphabet: this.inputAlphabet,
      moves: mooreMoves,
      states: mooreStates,
      stateSignals: mooreStateSignals,
    });
  }

  private getMooreMoves(
    mooreStates: string[],
    mealyMoves: MealyMove[],
    inputSymbols: string[],
    stateToOldStateAndSignalMap: TestType[],
  ) {
    const result: DeterministicMoves[] = [];

    for (const state of mooreStates) {
      const oldState = stateToOldStateAndSignalMap.find(
        (item) => item.state === state,
      ).destinationStateAndSignal.destinationState;

      if (oldState) {
        for (const symbol of inputSymbols) {
          const key: InitialStateAndInputSymbol = {
            initialState: state,
            inputSymbol: symbol,
          };

          const mealyMove = mealyMoves.find(
            (item) =>
              JSON.stringify(item.initialStateAndInput) ===
              JSON.stringify({
                initialState: oldState,
                inputSymbol: symbol,
              }),
          );

          if (mealyMove) {
            result.push({
              initialStateAndInput: key,
              destinationState: stateToOldStateAndSignalMap.find(
                (item) =>
                  JSON.stringify(item.destinationStateAndSignal) ===
                  JSON.stringify(mealyMove.destinationStateAndSignal),
              ).destinationStateAndSignal.destinationState,
            });
          }
        }
      }
    }

    return result;
  }

  private getMooreStateSignals(newStateToOldPair: TestType[]) {
    const result: DestinationStateAndSignal[] = [];

    newStateToOldPair.forEach(({ destinationStateAndSignal, state }) => {
      result.push({
        signal: destinationStateAndSignal.signal,
        destinationState: state,
      });
    });

    return result;
  }

  private buildMooreStates(
    inputAlphabet: string[],
    states: string[],
    moves: MealyMove[],
  ) {
    const processedStates: Map<string, boolean> = new Map();

    const result: TestType[] = [];
    let counter = 0;

    for (const inputSymbol of inputAlphabet) {
      for (const state of states) {
        const key: InitialStateAndInputSymbol = {
          initialState: state,
          inputSymbol,
        };

        const destinationStateAndSignal = moves.find(
          (item) =>
            JSON.stringify(item.initialStateAndInput) === JSON.stringify(key),
        ).destinationStateAndSignal;

        if (
          destinationStateAndSignal &&
          !processedStates.get(JSON.stringify(destinationStateAndSignal))
        ) {
          const stateName = this.getNewStateName(counter);

          result.push({ state: stateName, destinationStateAndSignal });

          counter++;
          processedStates.set(JSON.stringify(destinationStateAndSignal), true);
        }
      }
    }

    return result;
  }

  private getNewStateName(number: number) {
    return "S" + number;
  }

  private splitBySymbol(unsplitedString: string, splitBySymbol: string) {
    return unsplitedString.split(splitBySymbol);
  }

  public getConvertedData() {
    // Convert Mealy to String
    return "mealy data";
  }
}

export default MealyMachineData;
