import { _decorator, Node, Sprite } from 'cc';
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from 'observer';
import { GameStateHandler } from './game-state/game-state-handler';
import { GameStateStore } from './game-state/game-state-store';
import { GameState } from './game-state/game-state';

const { ccclass, property } = _decorator;
const { handle, render } = Observer;

export enum TeamType {
    PLAYER = 'PLAYER',
    ENEMIES = 'ENEMIES'
}

@ccclass('SelectTeam')
export class SelectTeam extends ObserverComponent {

    @property(Node)
    player: Node = null;

    @property(Node)
    enemies: Node = null;

    @property(Node)
    uiSelectTeam: Node = null; // ui-select-team 節點

    @property(Node)
    uiBetPage: Node = null; // ui-bet-page 節點

    private selectedTeam: TeamType = TeamType.PLAYER;

    start() {
        // 預設選擇 player
        this.onClickPlayer();
    }

    public onClickPlayer() {
        this.selectedTeam = TeamType.PLAYER;
        this.setNodeGrayscale(this.player, false);
        this.setNodeGrayscale(this.enemies, true);
    }

    public onClickEnemies() {
        this.selectedTeam = TeamType.ENEMIES;
        this.setNodeGrayscale(this.enemies, false);
        this.setNodeGrayscale(this.player, true);
    }

    @handle(GameStateHandler, (handler) => handler.onTeamSelected(null))
    handleTeamSelected(team: string) {
        return team;
    }

    public submitSelection() {
        // 觸發狀態切換：SelectTeam → BetSection
        this.handleTeamSelected(this.selectedTeam);

        // 關閉 ui-select-team，開啟 ui-bet-page
        if (this.uiSelectTeam) {
            this.uiSelectTeam.active = false;
        }
        if (this.uiBetPage) {
            this.uiBetPage.active = true;
        }

        return this.selectedTeam;
    }

    // 監聽遊戲狀態變化，自動控制 UI 顯示
    @render(GameStateStore, (store) => store.currentState)
    updateUIByGameState(currentState: GameState) {
        if (!this.uiSelectTeam || !this.uiBetPage) {
            return;
        }

        switch (currentState) {
            case GameState.SelectTeam:
                this.uiSelectTeam.active = true;
                this.uiBetPage.active = false;
                // 重置選擇
                this.onClickPlayer();
                break;
            case GameState.BetSection:
                this.uiSelectTeam.active = false;
                this.uiBetPage.active = true;
                break;
            case GameState.PlayGame:
            case GameState.Result:
                this.uiSelectTeam.active = false;
                break;
        }
    }

    private setNodeGrayscale(node: Node, isGray: boolean) {
        if (!node) {
            console.warn('Node is null!');
            return;
        }

        const sprite = node.getComponent(Sprite);
        if (sprite) {
            sprite.grayscale = isGray;
        }
    }

}
