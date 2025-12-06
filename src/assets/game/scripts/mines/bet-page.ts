import { _decorator, Node } from 'cc';
import { ObserverComponent } from 'db://shared-components/shared/common-components/observer-component/scripts/observer-component';
import Observer from 'observer';
import { GameStateStore } from './game-state/game-state-store';
import { GameState } from './game-state/game-state';

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass('BetPage')
export class BetPage extends ObserverComponent {
    @property(Node)
    betAmountSelector: Node = null;

    @property(Node)
    reSelectTeamButton: Node = null;

    @render(GameStateStore, (store) => store.currentState, { fireImmediately: true })
    onGameStateChange(currentState: GameState) {
        const isBetSection = currentState === GameState.BetSection;
        if (this.betAmountSelector) {
            this.betAmountSelector.active = isBetSection;
        }
        if (this.reSelectTeamButton) {
            this.reSelectTeamButton.active = isBetSection;
        }
    }
}
