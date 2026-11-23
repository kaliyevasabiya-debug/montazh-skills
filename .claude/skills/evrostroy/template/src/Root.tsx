import React from "react";
import { Composition } from "remotion";
import { EvrostroyRu } from "./Evrostroy_ru";
import { EvrostroyKz } from "./Evrostroy_kz";
import { Evrostroy } from "./Evrostroy";

// одна строка на ролик: durationInFrames = секунды × 30
export const Root: React.FC = () => (
  <>
    <Composition id="EvrostroyRu" component={EvrostroyRu} durationInFrames={Math.round(57.75 * 30)} fps={30} width={1080} height={1920} />
    <Composition id="EvrostroyKz" component={EvrostroyKz} durationInFrames={Math.round(75.38 * 30)} fps={30} width={1080} height={1920} />
    <Composition id="Evrostroy" component={Evrostroy} durationInFrames={Math.round(42.5 * 30)} fps={30} width={1080} height={1920} />
  </>
);
