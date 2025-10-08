import { useEffect, useEffectEvent } from "react";

export function useKeyPress(
  key: string,
  callback: (event: KeyboardEvent) => void,
) {
  const handleKeyPress = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === key) {
      callback(event);
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);
}
