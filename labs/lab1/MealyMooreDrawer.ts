import * as graphviz from "graphviz";
import { MealyMove, MooreMove, MooreState } from "./MealyMooreTypes";

class MealyMooreDrawer {
  private readonly graph = graphviz.digraph("G");

  public drawMealyGraph(mealyMoves: MealyMove[], pngFilepath: string) {
    for (const move of mealyMoves) {
      const { destinationStateAndSignal, stateAndInputSymbol } = move;

      this.graph.addNode(stateAndInputSymbol.state);

      if (destinationStateAndSignal.state !== "-") {
        this.graph.addEdge(
          stateAndInputSymbol.state,
          destinationStateAndSignal.state,
          {
            label: `${stateAndInputSymbol.inputSymbol}/${destinationStateAndSignal.signal}`,
          },
        );
      }
    }

    this.drawGraph(pngFilepath);
  }

  public drawMooreGraph(
    mooreMoves: MooreMove[],
    mooreStates: MooreState[],
    pngFilepath: string,
  ) {
    for (const move of mooreMoves) {
      const { destinationState, stateAndInputSymbol } = move;

      const mooreState = mooreStates.find(
        (mooreState) => mooreState.newState === stateAndInputSymbol.state,
      );

      const vertexName = `${mooreState.newState} (${mooreState.originalStateAndSignal.state}/${mooreState.originalStateAndSignal.signal})`;
      this.graph.addNode(vertexName);

      if (destinationState !== "-") {
        const mooreDestinationState = mooreStates.find(
          (mooreState) => mooreState.newState === destinationState,
        );

        const destinationVertexName = `${mooreDestinationState.newState} (${mooreDestinationState.originalStateAndSignal.state}/${mooreDestinationState.originalStateAndSignal.signal})`;

        this.graph.addEdge(vertexName, destinationVertexName, {
          label: stateAndInputSymbol.inputSymbol,
        });
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
