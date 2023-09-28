import FileHandler, { ConversionMode, DataFromFile } from "./FileHandler";
import IMachineData from "./IMachineData";
import MealyMachineData from "./MealyMachineData";
import MooreMachineData from "./MooreMachineData";

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
  const fileReader = new FileHandler("input-mealy.txt");
  const data = fileReader.readDataFromFile();

  const machineData = processData(data);

  console.log(machineData.getConvertedData());
} catch (error) {
  const err = error as Error;
  console.log(err.message);
}
