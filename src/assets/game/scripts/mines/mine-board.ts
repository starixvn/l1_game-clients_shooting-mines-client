import { _decorator, Component, Node } from 'cc';
import { ObserverComponent } from 'db://shared-components/shared/common-components/observer-component/scripts/observer-component';
import Observer from 'observer';
import { MinesGameStore } from './mines-game';

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass('MineBoard')
export class MineBoard extends ObserverComponent {

    start() {
        console.log("🚀 ~ MineBoard ~ start:")
    }

    @render(MinesGameStore, (store) => store)
    assignMineBoard(store: MinesGameStore) {
        console.log("🚀 ~ assignMineBoard:", store)
    }
}   

