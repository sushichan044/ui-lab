import { useCallback, useReducer, useState } from "react";

type Input = {
  candidateValues: readonly string[];
  onUpdate?: (selectedDataSet: Set<string>, allDataSet: Set<string>) => void;
};

type Action =
  | {
      id: string;
      type: "add";
    }
  | {
      id: string;
      type: "remove";
    }
  | {
      type: "add-all" | "remove-all";
    };

type UseMultiChoice = {
  handleAllChange: (checked: boolean) => void;
  handleSingleChange: (selectedId: string, checked: boolean) => void;
  selectedDataSet: Set<string>;
};

export const useMultiChoice = ({
  candidateValues,
  onUpdate,
}: Input): UseMultiChoice => {
  const [allDataSet] = useState(() => new Set(candidateValues));
  const [selectedDataSet, dispatch] = useReducer<Set<string>, [Action]>(
    (state, action) => {
      const newState = (() => {
        switch (action.type) {
          case "add": {
            return new Set(state).add(action.id);
          }
          case "add-all": {
            return allDataSet;
          }
          case "remove": {
            const newState = new Set(state);
            newState.delete(action.id);
            return newState;
          }
          case "remove-all": {
            return new Set<string>();
          }
        }
      })();
      onUpdate?.(newState, allDataSet);
      return newState;
    },
    new Set<string>(),
  );

  const handleAllChange = useCallback((checked: boolean) => {
    dispatch({ type: checked ? "add-all" : "remove-all" });
  }, []);

  const handleSingleChange = useCallback(
    (selectedId: string, checked: boolean) => {
      dispatch({ id: selectedId, type: checked ? "add" : "remove" });
    },
    [],
  );

  return {
    handleAllChange,
    handleSingleChange,
    selectedDataSet,
  };
};
