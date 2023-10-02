import { ConversionMode } from "./MealyMooreFileHandler";
import MealyMachineData from "./MealyMachineData";
import MooreMachineData from "./MooreMachineData";
import MealyMooreFileHandler from "./MealyMooreFileHandler";
import MealyMooreDrawer from "./MealyMooreDrawer";

const INPUT_FILE_PATH = "input.txt";
const OUTPUT_FILE_PATH = "output.txt";
const MEALY_GRAPH_PATH = "mealy-graph.png";
const MOORE_GRAPH_PATH = "moore-graph.png";

try {
  const fileReader = new MealyMooreFileHandler();
  const data = fileReader.readDataFromFile(INPUT_FILE_PATH);

  const mealyMooreDrawer = new MealyMooreDrawer();

  switch (data.mode) {
    case ConversionMode.MEALY:
      const mealyMachineData = new MealyMachineData(data.matrix);
      const convertedMooreMachineData = mealyMachineData.convertToMoore();

      mealyMooreDrawer.drawMooreGraph(
        convertedMooreMachineData.getMoves(),
        convertedMooreMachineData.getStates(),
        MOORE_GRAPH_PATH,
      );

      fileReader.writeDataInFile(
        OUTPUT_FILE_PATH,
        convertedMooreMachineData.toString(),
      );
      break;
    case ConversionMode.MOORE:
      const mooreMachineData = new MooreMachineData(data.matrix);
      const convertedMealyMachineData = mooreMachineData.convertToMealy();

      mealyMooreDrawer.drawMealyGraph(
        convertedMealyMachineData.getMoves(),
        MEALY_GRAPH_PATH,
      );

      fileReader.writeDataInFile(
        OUTPUT_FILE_PATH,
        convertedMealyMachineData.toString(),
      );
      break;

    default:
      throw new Error("Unavailable conversion type");
  }
} catch (error) {
  const err = error as Error;
  console.log(err.message);
}
