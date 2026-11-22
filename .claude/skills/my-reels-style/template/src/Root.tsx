import React from "react";
import { Composition } from "remotion";
import { Evrostroy } from "./Evrostroy";

// одна строка на ролик: durationInFrames = секунды × 30
export const Root: React.FC = () => (
  <>
    <Composition id="Evrostroy" component={Evrostroy} durationInFrames={Math.round(42.5 * 30)} fps={30} width={1080} height={1920} />
  </>
);
