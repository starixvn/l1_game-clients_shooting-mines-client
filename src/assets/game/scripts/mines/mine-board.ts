import { _decorator, Component, Node } from 'cc';
import { ObserverComponent } from 'db://shared-components/shared/common-components/observer-component/scripts/observer-component';
import Observer from 'observer';
import { MinesGameStore } from './mines-game/mines-game-store';

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass('MineBoard')
export class MineBoard extends ObserverComponent {

    @property(Node)
    teamHome: Node = null;

    @property(Node)
    teamAway: Node = null;


    @render(MinesGameStore, (store) => store.lastClickedPosition, { fireImmediately: false })
    onClickedPositionChanged(lastClickedPosition: number) {
        this.handleTileRevealed(lastClickedPosition);
    }

    private handleTileRevealed(position: number) {
        const test = this.teamHome.getChildByName(`player-${position}`);
        if (test) {
            test.active = true;
        }
    }

}

