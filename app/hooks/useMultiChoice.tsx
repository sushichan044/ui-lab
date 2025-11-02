import { useCallback, useMemo, useReducer, useState } from "react";

type Input<T extends DataSet> = {
  candidateValues: T;
  onUpdate?: (selectedDataSet: SelectedDataSet<T>) => void;
};

type Action<T extends DataSet> =
  | {
      id: T[number];
      type: "add";
    }
  | {
      id: T[number];
      type: "remove";
    }
  | {
      type: "add-all" | "remove-all";
    };

type DataSet = readonly string[];
type SelectedDataSet<T extends DataSet> = Readonly<Array<T[number]>>;

type UseMultiChoice<T extends DataSet> = {
  handleAllChange: (checked: boolean) => void;
  handleSingleChange: (selectedId: string, checked: boolean) => void;
  selectedDataSet: SelectedDataSet<T>;

  areAllSelected: boolean;
};

export const useMultiChoice = <T extends DataSet>({
  candidateValues,
  onUpdate,
}: Input<T>): UseMultiChoice<T> => {
  const [candidates] = useState<T>(() => candidateValues);

  const [selectedDataSet, dispatch] = useReducer<
    SelectedDataSet<T>,
    [Action<T>]
  >((state, action) => {
    const newState = (() => {
      switch (action.type) {
        case "add": {
          return [...state, action.id];
        }
        case "add-all": {
          return [...candidates];
        }
        case "remove": {
          const newState = [...state];
          newState.splice(newState.indexOf(action.id), 1);
          return newState;
        }
        case "remove-all": {
          return [];
        }
        default: {
          throw new Error("Unhandled action type", action satisfies never);
        }
      }
    })();

    onUpdate?.(newState);
    return newState;
  }, []);

  const isAllChecked = useMemo(
    () => selectedDataSet.length === candidates.length,
    [candidates.length, selectedDataSet.length],
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
    areAllSelected: isAllChecked,
    handleAllChange,
    handleSingleChange,
    selectedDataSet,
  };
};
