import * as graphviz from "graphviz";
import {
  DestinationStateAndSignal,
  MealyMove,
  MooreMove,
} from "./MealyMooreTypes";

class MealyMooreDrawer {
  private readonly graph = graphviz.digraph("G");

  public drawMealyGraph(mealyMoves: MealyMove[], pngFilepath: string) {
    for (const move of mealyMoves) {
      const { destinationStateAndSignal, initialStateAndInput } = move;

      this.graph.addNode(initialStateAndInput.initialState);

      if (destinationStateAndSignal.destinationState !== "-") {
        this.graph.addEdge(
          initialStateAndInput.initialState,
          destinationStateAndSignal.destinationState,
          {
            label: `${initialStateAndInput.inputSymbol}/${destinationStateAndSignal.signal}`,
          },
        );
      }
    }

    this.drawGraph(pngFilepath);
  }

  public drawMooreGraph(
    mooreMoves: MooreMove[],
    mooreStateSignals: DestinationStateAndSignal[],
    pngFilepath: string,
  ) {
    for (const move of mooreMoves) {
      const { destinationState, initialStateAndInput } = move;

      this.graph.addNode(initialStateAndInput.initialState);

      if (destinationState !== "-") {
        this.graph.addEdge(
          initialStateAndInput.initialState,
          destinationState,
          {
            label: mooreStateSignals.find(
              (item) => item.destinationState === destinationState,
            ).signal,
          },
        );
      }
    }

    this.drawGraph(pngFilepath);
  }

  private drawGraph(pngFilepath: string) {
    this.graph.output("png", pngFilepath, (err) => {
      if (err) throw err;
    });
  }
}

export default MealyMooreDrawer;
