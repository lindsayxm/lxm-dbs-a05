import { Suspense } from "react";
import { BoardLoader } from "@/components/board/BoardLoader";
import { BoardSkeleton } from "@/components/board/BoardSkeleton";
import { Footer } from "@/components/shell/Footer";
import { Header } from "@/components/shell/Header";

/**
 * The wall screen. Header and footer are part of the prerendered static shell;
 * the board streams in at request time under the Suspense boundary.
 */
export default function Page() {
  return (
    <main className="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] gap-y-[1.4vh] px-[2.5vw] py-[2.2vh] max-lg:h-auto max-lg:min-h-dvh max-lg:gap-y-4 max-lg:px-4 max-lg:py-4">
      <Header />
      <Suspense fallback={<BoardSkeleton />}>
        <BoardLoader />
      </Suspense>
      <Footer />
    </main>
  );
}
