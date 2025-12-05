import { _decorator, Node, Sprite } from 'cc';
import { ObserverComponent } from "db://shared-components/shared/common-components/observer-component/scripts/observer-component";
import Observer from 'observer';
import { GameStateHandler } from './game-state/game-state-handler';
import { GameState } from './game-state/game-state';
import { MinesGameHandler } from './mines-game/mines-game-handler';

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

    onEnable() {
        this.setGameState(GameState.SelectTeam);
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

    /**
     * 處理隊伍選擇（透過 MinesGameHandler）
     * 這會發送 WebSocket 請求並切換 GameState
     */
    @handle(MinesGameHandler, (handler, team: string) => handler.handleTeamSelected(team))
    handleTeamSelected(team: string) {
        return team;
    }

    @handle(GameStateHandler, (handler, state: GameState) => handler.setGameState(state))
    private setGameState(state: GameState) {
        return state;
    }

    public submitSelection() {
        console.log('[SelectTeam] Submit selection:', this.selectedTeam);

        // 觸發選隊處理：發送 WebSocket + 切換 GameState
        this.handleTeamSelected(this.selectedTeam);

        if (this.uiSelectTeam) {
            this.uiSelectTeam.active = false;
        }
        if (this.uiBetPage) {
            this.uiBetPage.active = true;
        }

        return this.selectedTeam;
    }

    private setNodeGrayscale(node: Node, isGray: boolean) {
        const sprite = node.getComponent(Sprite);
        if (sprite) {
            sprite.grayscale = isGray;
        }
    }

}
