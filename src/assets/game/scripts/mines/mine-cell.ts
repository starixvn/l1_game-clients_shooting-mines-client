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

    /**
     * 處理格子點擊事件
     * 使用 @handle 裝飾器調用 Handler 處理業務邏輯
     */
    @handle(MinesGameHandler, (handler, position: number) => handler.handleTileClick(position))
    clickCell() {
        console.log('[MineCell] Clicked cell:', this.mineNumber);
        // 返回 mineNumber，會作為參數傳給 handler.handleTileClick()
        return this.mineNumber;
    }
}

