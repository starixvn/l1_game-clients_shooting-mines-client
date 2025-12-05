import inversify from 'inversify';
import mobx from 'mobx';

const { injectable } = inversify;

/**
 * Mines 遊戲核心數據 Store（精簡版）
 */
@injectable()
export class MinesGameStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    // ==================== 遊戲配置 ====================
    readonly gridSize = 20;                  // 20 格子 (4x5 或 5x4)

    // ==================== API 數據 ====================
    roundId: number = 0;                     // 當前回合 ID
    mode: number = 3;                        // 遊戲模式/難度

    // ==================== 遊戲數據 ====================
    playerPositions: number[] = [];          // 我方球員位置
    opponentPositions: number[] = [];        // 對手球員位置
    selectedPositions: number[] = [];        // 已選擇的位置
    clickedPosition: number = -1;            // 當前點擊的位置

    currentMultiplier: number = 1.0;         // 當前倍數
    winAmount: number = 0;                   // 當前贏得金額

    // ==================== 遊戲結果 ====================
    gameResult: 'win' | 'lose' | null = null;  // 遊戲結果

    // ==================== 計算屬性 ====================

    /**
     * 是否可以兌現
     */
    get canCashOut(): boolean {
        return this.selectedPositions.length > 0 && this.gameResult === null;
    }

    /**
     * 是否已經揭開過該位置
     */
    isPositionRevealed(position: number): boolean {
        return this.selectedPositions.includes(position);
    }

    // ==================== 遊戲數據操作 ====================

    /**
     * 初始化遊戲（從 API 數據初始化）
     */
    initGameFromApi(apiData: {
        roundId: number;
        mode: number;
        result: {
            playerPositions: number[];
            opponentPositions: number[];
        };
    }) {
        this.roundId = apiData.roundId;
        this.mode = apiData.mode;
        this.playerPositions = apiData.result.playerPositions;
        this.opponentPositions = apiData.result.opponentPositions;
        this.selectedPositions = [];
        this.clickedPosition = -1;
        this.currentMultiplier = 1.0;
        this.winAmount = 0;
        this.gameResult = null;
    }

    /**
     * 揭開格子
     */
    revealTile(position: number, winAmount: number, odds: number): 'player' | 'opponent' {
        if (this.selectedPositions.includes(position)) {
            return this.playerPositions.includes(position) ? 'player' : 'opponent';
        }

        this.selectedPositions.push(position);
        this.winAmount = winAmount;
        this.currentMultiplier = odds;

        if (this.playerPositions.includes(position)) {
            return 'player';
        } else {
            this.gameResult = 'lose';
            return 'opponent';
        }
    }

    /**
     * 執行 Cash Out
     */
    cashOut(winAmount: number) {
        this.gameResult = 'win';
        this.winAmount = winAmount;
    }

    /**
     * 重置所有數據
     */
    reset() {
        this.roundId = 0;
        this.mode = 3;
        this.playerPositions = [];
        this.opponentPositions = [];
        this.selectedPositions = [];
        this.clickedPosition = -1;
        this.currentMultiplier = 1.0;
        this.winAmount = 0;
        this.gameResult = null;
    }
}
