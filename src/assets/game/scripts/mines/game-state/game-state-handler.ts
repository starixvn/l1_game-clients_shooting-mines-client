import inversify from 'inversify';
import { GameStateStore } from './game-state-store';
import { GameState } from './game-state';

const { injectable, inject } = inversify;

@injectable()
export class GameStateHandler {
    @inject(GameStateStore)
    private gameStateStore: GameStateStore;

    // 遊戲開始
    startGame() {
        this.gameStateStore.setState(GameState.SelectTeam);
    }

    // 選隊完成 → 進入下注階段
    onTeamSelected(team: string) {
        this.gameStateStore.updateStateData({
            selectedTeam: team,
        });
        this.setGameState(GameState.BetSection);
    }

    // 下注完成 → 開始遊戲
    onBetPlaced(betAmount: number) {
        this.gameStateStore.updateStateData({
            betAmount: betAmount,
        });
        this.gameStateStore.setState(GameState.PlayGame);
    }

    // 遊戲結束 → 顯示結果
    onGameEnd(winAmount: number, isFailed: boolean) {
        this.gameStateStore.updateStateData({
            winAmount: winAmount,
            isFailed: isFailed,
        });
        this.gameStateStore.setState(GameState.Result);
    }

    // 重新開始
    restart() {
        this.gameStateStore.reset();
        this.startGame();
    }

    setGameState(state: GameState) {
        this.gameStateStore.setState(state);
    }

    // 返回選隊階段
    backToTeamSelection() {
        this.gameStateStore.setState(GameState.SelectTeam);
    }
}
