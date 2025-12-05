import { _decorator, Component, Node } from 'cc';
import { ObserverComponent } from 'db://shared-components/shared/common-components/observer-component/scripts/observer-component';
import Observer from 'observer';
import { MinesGameHandler } from './mines-game/mines-game-handler';

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass('MineCell')
export class MineCell extends ObserverComponent {
    @property(Number)
    mineNumber: number = 0;

    @handle(MinesGameHandler, (handler, position: number) => handler.handleTileClick(position))
    clickCell() {
        return this.mineNumber;
    }
}

