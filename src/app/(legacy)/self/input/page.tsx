import { Suspense } from "react";
import InputClient from "./InputClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ height: 120 }} />}>
      <InputClient />
    </Suspense>
  );
}
