export type DeterministicMove = {
  stateAndInputSymbol: StateAndInputSymbol;
  destinationState: string;
};

export type MooreMove = {
  stateAndInputSymbol: StateAndInputSymbol;
  destinationState: string;
};

export type MealyMove = {
  stateAndInputSymbol: StateAndInputSymbol;
  destinationStateAndSignal: StateAndSignal;
};

export type StateAndInputSymbol = {
  state: string;
  inputSymbol: string;
};

export type StateAndSignal = {
  state: string;
  signal: string;
};

export type MooreMachineDataInfo = {
  states: MooreState[];
  inputSymbols: string[];
  moves: MooreMove[];
};

export type MealyMachineDataInfo = {
  states: string[];
  inputSymbols: string[];
  moves: MealyMove[];
};

export type ParsedMealyMove = {
  stateSymbol: string;
  separatorSymbol: string;
};

export type MooreState = {
  // newState: string;
  // originalStateAndSignal: StateAndSignal;s
  state: string;
  signal: string;
};
