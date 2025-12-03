import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import { sharedContainer } from "../../scripts/shared-container";
import { settings } from "./game-settings";
import * as CrashGameV2 from "./handlers/crash-v2";
import { NullRoundTimeHandlers } from "./handlers/null-round-time-handlers";
import * as InstantWinFeature from "./index";
import { GameStateStore } from "./mines/game-state/game-state-store";
import { GameStateHandler } from "./mines/game-state/game-state-handler";
import { MinesGameStore } from "./mines/mines-game/mines-game-store";
import { MinesGameHandler } from "./mines/mines-game/mines-game-handler";

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings);
        container.bind(LogStore).to(LogStore);

        container.bind(gc.Rounds.RoundTimeHandlers).to(NullRoundTimeHandlers);

        // Mines 遊戲狀態管理
        container.bind(GameStateStore).to(GameStateStore);
        container.bind(GameStateHandler).to(GameStateHandler);

        // Mines 遊戲核心邏輯
        container.bind(MinesGameStore).to(MinesGameStore);
        container.bind(MinesGameHandler).to(MinesGameHandler);
    },
    features: [
        CrashGameV2,
        InstantWinFeature, gc.BetDetailsNew, ...gc.defaultFeatures],
};
