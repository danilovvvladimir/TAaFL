import { ConversionMode, DataFromFile } from "./MealyMooreFileHandler";
import IMachineData from "./IMachineData";
import MealyMachineData from "./MealyMachineData";
import MooreMachineData from "./MooreMachineData";
import MealyMooreFileHandler from "./MealyMooreFileHandler";

const DEFAULT_INPUT_FILE_PATH = "input.txt";
const DEFAULT_OUTPUT_FILE_PATH = "output.txt";

const processData = (data: DataFromFile) => {
  let machineData: IMachineData;

  switch (data.mode) {
    case ConversionMode.MEALY:
      const mealyMachineData = new MealyMachineData(data.matrix);
      machineData = mealyMachineData.convertToMoore();
      break;
    case ConversionMode.MOORE:
      const mooreMachineData = new MooreMachineData(data.matrix);
      machineData = mooreMachineData.convertToMealy();
      break;

    default:
      throw new Error("Unavailable conversion type");
  }

  return machineData;
};

try {
  const fileReader = new MealyMooreFileHandler();
  const data = fileReader.readDataFromFile(DEFAULT_INPUT_FILE_PATH);

  const machineData = processData(data);

  fileReader.writeDataInFile(DEFAULT_OUTPUT_FILE_PATH, machineData.toString());
} catch (error) {
  const err = error as Error;
  console.log(err.message);
}
