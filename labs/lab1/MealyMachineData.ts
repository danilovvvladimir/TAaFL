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

class MealyMachineData implements IMachineData {
  private states: string[] = [];
  private inputAlphabet: string[] = [];
  private moves: MealyMove[] = [];

  constructor(info: string[][]) {
    if (!info || info.length === 0) {
      return;
    }

    console.log("info", info);

    for (let i = 0; i < info[0].length; i++) {
      this.states.push(`S${i}`);
    }

    for (let i = 0; i < info.length; i++) {
      this.inputAlphabet.push(`x${i + 1}`);
    }

    this.moves = this.getMoves(info, this.states, this.inputAlphabet);

    // console.log("inputAlphabet:", this.inputAlphabet);
    // console.log("States:", this.states);
    // console.log("moves:", this.moves);
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

    const mooreStates = Array.from(newStateToOldPair.keys()).sort();

    const mooreStateSignals = this.getMooreStateSignals(newStateToOldPair);

    const mooreMoves = this.getMooreMoves(
      mooreStates,
      this.moves,
      this.inputAlphabet,
      newStateToOldPair,
    );

    console.log(mooreMoves);

    return new MooreMachineData([]);
  }

  private getMooreMoves(
    mooreStates: string[],
    mealyMoves: MealyMove[],
    inputSymbols: string[],
    stateToOldStateAndSignalMap: Map<string, DestinationStateAndSignal>,
  ) {
    const oldStateToStateMap: Map<DestinationStateAndSignal, string> =
      this.getOldStateAndSignalToStateMap(stateToOldStateAndSignalMap);

    console.log("oldStateToStateMap", oldStateToStateMap);

    const result: DeterministicMoves[] = [];

    for (const state of mooreStates) {
      const oldState = stateToOldStateAndSignalMap.get(state).destinationState;

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
            if (!oldStateToStateMap.get(mealyMove.destinationStateAndSignal)) {
              console.log("not found", mealyMove.destinationStateAndSignal);
            }
            result.push({
              initialStateAndInput: key,
              destinationState:
                oldStateToStateMap.get(mealyMove.destinationStateAndSignal) ||
                "",
            });
          }
        }
      }
    }

    return result;
  }

  private getOldStateAndSignalToStateMap(
    stateToOldStateAndSignalMap: Map<string, DestinationStateAndSignal>,
  ) {
    const result: Map<DestinationStateAndSignal, string> = new Map();

    stateToOldStateAndSignalMap.forEach((oldStateAndSignal, state) => {
      result.set(oldStateAndSignal, state);
    });

    return result;
  }

  private getMooreStateSignals(
    newStateToOldPair: Map<string, DestinationStateAndSignal>,
  ) {
    const result: DestinationStateAndSignal[] = [];

    newStateToOldPair.forEach((oldStateAndSignal, newState) => {
      result.push({
        signal: oldStateAndSignal.signal,
        destinationState: newState,
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

    const result: Map<string, DestinationStateAndSignal> = new Map();
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

          result.set(stateName, destinationStateAndSignal);

          counter++;
          processedStates.set(JSON.stringify(destinationStateAndSignal), true);
        }
      }
    }

    return result;
  }

  private getMooreStates() {}

  private getNewStateName(number: number) {
    return "S" + number;
  }

  private splitBySymbol(unsplitedString: string, splitBySymbol: string) {
    return unsplitedString.split(splitBySymbol);
  }

  public getConvertedData() {
    // Convert Mealy to String
    return "s";
  }
}

export default MealyMachineData;
