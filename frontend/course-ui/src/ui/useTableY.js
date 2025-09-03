import { useEffect, useState } from "react";

// offset = total space above/below the table inside the page
export default function useTableY(offset = 360, min = 260) {
  const calc = () => Math.max(min, window.innerHeight - offset);
  const [y, setY] = useState(calc());
  useEffect(() => {
    const onResize = () => setY(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [offset]);
  return y;
}
