export type MooreMove = {
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

export interface MooreMachineDataInfo {
  states: string[];
  inputSymbols: string[];
  stateSignals: DestinationStateAndSignal[];
  moves: MooreMove[];
}

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
  inputSymbols: string[];
  moves: MealyMove[];
}

export interface ParsedMealyMove {
  stateSymbol: string;
  separatorSymbol: string;
}
