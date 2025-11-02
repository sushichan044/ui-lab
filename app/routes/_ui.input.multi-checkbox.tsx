import { Fragment, useEffect, useId, useRef } from "react";

import type { Route } from "./+types/_ui.input.multi-checkbox";

import { useMultiChoice } from "../hooks/useMultiChoice";

const ID_ARRAY = ["a", "b", "c", "d", "e", "f"] as const;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Multi Checkbox - sushichan044's UI Lab" },
    {
      content:
        "sushichan044's UI Lab is a place to experiment with new web technologies or ui implementations.",
      name: "description",
    },
  ];
}

export default function Page() {
  const {
    areAllSelected,
    handleAllChange,
    handleSingleChange,
    selectedDataSet,
  } = useMultiChoice({ candidateValues: ID_ARRAY });

  const allCheckboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const allCheckbox = allCheckboxRef.current;

    if (allCheckbox) {
      allCheckbox.indeterminate = !areAllSelected && selectedDataSet.length > 0;
    }

    return () => {
      if (allCheckbox) {
        allCheckbox.indeterminate = false;
      }
    };
  }, [areAllSelected, selectedDataSet.length]);

  const checkboxId = useId();

  return (
    <main className="mx-auto container p-4">
      <div className="space-y-4 md:space-y-8">
        <h1 className="text-3xl">Input with multi checkbox</h1>
        <section className="space-y-2 md:space-y-4">
          <h2 className="text-xl font-bold">Selected values</h2>
          {selectedDataSet.length === 0 ? (
            <p>No selected values</p>
          ) : (
            <ul className="flex flex-row flex-nowrap">
              {Array.from(selectedDataSet).map((id, i) => (
                <Fragment key={id}>
                  <li>{id}</li>
                  {
                    // Add a comma if the current item is not the last one
                    i !== selectedDataSet.length - 1 && <span>,</span>
                  }
                </Fragment>
              ))}
            </ul>
          )}
        </section>
        <section className="space-y-2 md:space-y-4">
          <h2 className="text-xl font-bold">Form</h2>
          <input
            checked={areAllSelected}
            className="checkbox"
            id="all"
            onChange={(e) => handleAllChange(e.target.checked)}
            ref={allCheckboxRef}
            type="checkbox"
          />
          <ul className="space-y-1 md:space-y-2">
            {ID_ARRAY.map((id) => (
              <li key={id}>
                <input
                  checked={selectedDataSet.includes(id)}
                  className="checkbox"
                  id={`${checkboxId}-${id}`}
                  onChange={(e) => handleSingleChange(id, e.target.checked)}
                  type="checkbox"
                />
                <label className="px-2" htmlFor={`${checkboxId}-${id}`}>
                  {id}
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
