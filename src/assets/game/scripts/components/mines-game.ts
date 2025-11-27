import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";

import { BalanceEffectHandlers } from "db://shared-components/game/balance-effect/scripts/handlers/balance-effect-handlers";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { siteConfigs } from "../../../scripts/site-configs";
import { containerOptions } from "../containerOptions";
import { settings } from "../game-settings";
import { InterruptionHandlers } from "../interruption-handlers";
import "./../../../resources/i18n";

startGame(settings.name, containerOptions, siteConfigs, settings.namespaces);

const { ccclass, property } = _decorator;
const { observer, handle } = Observer;

@ccclass
@observer(settings.name)
export default class MinesGame extends GameComponent {
    @property({ type: Label, visible: false, override: true })
    lblMinBet: Label = null;

    @property({ type: Label, visible: false, override: true })
    lblMaxBet: Label = null;

    override onShowGame() {
        this.handleGameShow();
    }

    override onHideGame() {
        this.handleGameHide();
    }

    @handle(InterruptionHandlers, (handler) => handler.onGameHide())
    handleGameHide() { }

    @handle(InterruptionHandlers, (handler) => handler.onGameShow())
    handleGameShow() { }


    @handle(gc.Auth.AuthHandlers.GetBalance)
    getBalance() { }

    @handle(BalanceEffectHandlers.MainPlayerIncreaseBalance)
    mainPlayerIncreaseBalance(balance: number) {
        return balance;
    }

    @handle(BalanceEffectHandlers.MainPlayerWinEffect)
    mainPlayerPlayWinningEffect() {
        return true;
    }

}
