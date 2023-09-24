import IMachineData from "./IMachineData";

class MealyMachineData implements IMachineData {
  private states: string[] = [];
  private inputAlphabet: string[] = [];
  private transitionFunctions: string[][] = [];

  constructor(info: string[][]) {
    if (!info || info.length === 0) {
      return;
    }

    for (let i = 0; i < info[0].length; i++) {
      this.states.push(`S${i}`);
    }

    for (let i = 0; i < info.length; i++) {
      this.inputAlphabet.push(`x${i}`);
    }

    this.transitionFunctions = info;

    // console.log("States:", this.states);
    // console.log("inputAlphabet:", this.inputAlphabet);
    // console.log("transitionFunctions:", this.transitionFunctions);
  }

  public getConvertedData() {
    return "s";
  }
}

export default MealyMachineData;
