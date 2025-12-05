import inversify from 'inversify';
import mobx from 'mobx';

const { injectable } = inversify;

/**
 * Mines 遊戲核心數據 Store
 * 只儲存遊戲內部狀態，不直接處理 API 格式
 */
@injectable()
export class MinesGameStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    // ==================== 遊戲配置 ====================
    readonly GRID_SIZE = 20;                     // 20 格子

    // ==================== 遊戲回合資訊 ====================
    currentRoundId: number = 0;                  // 當前回合 ID
    hasBetPlaced: boolean = false;               // 是否已經下注（同步狀態）

    // ==================== 遊戲內部狀態 ====================
    myPositions: number[] = [];                  // 我方球員位置（安全格子）
    enemyPositions: number[] = [];               // 對手球員位置（地雷）
    revealedPositions: number[] = [];            // 已揭開的位置
    lastClickedPosition: number = -1;            // 最後點擊的位置

    currentOdds: number = 1.0;                   // 當前倍數
    currentWinAmount: number = 0;                // 當前贏得金額

    // ==================== 遊戲結果 ====================
    isGameOver: boolean = false;                 // 遊戲是否結束
    isWin: boolean = false;                      // 是否贏（true=贏, false=輸）

    // ==================== 計算屬性 ====================

    /**
     * 是否可以兌現
     */
    get canCashOut(): boolean {
        return this.revealedPositions.length > 0 && !this.isGameOver;
    }

    /**
     * 是否已經揭開過該位置
     */
    isPositionRevealed(position: number): boolean {
        return this.revealedPositions.includes(position);
    }

    /**
     * 已揭開的安全格子數量
     */
    get safeRevealCount(): number {
        return this.revealedPositions.filter(pos =>
            this.myPositions.includes(pos)
        ).length;
    }

    // ==================== 遊戲數據操作 ====================

    /**
     * 初始化新遊戲
     */
    initializeGame(roundId: number, myPositions: number[], enemyPositions: number[]) {
        console.log('[MinesGameStore] initializeGame ->', { roundId, myPositions, enemyPositions });
        this.currentRoundId = roundId;
        this.hasBetPlaced = true;            // 標記已下注
        this.myPositions = myPositions;
        this.enemyPositions = enemyPositions;
        this.revealedPositions = [];
        this.lastClickedPosition = -1;
        this.currentOdds = 1.0;
        this.currentWinAmount = 0;
        this.isGameOver = false;
        this.isWin = false;
    }

    /**
     * 記錄點擊的位置
     */
    setClickedPosition(position: number) {
        console.log('[MinesGameStore] setClickedPosition ->', position);
        this.lastClickedPosition = position;
    }

    /**
     * 揭開格子並更新狀態
     */
    revealPosition(position: number, winAmount: number, odds: number) {
        console.log('[MinesGameStore] revealPosition ->', { position, winAmount, odds });
        // 加入已揭開列表
        if (!this.revealedPositions.includes(position)) {
            this.revealedPositions.push(position);
        }

        // 更新金額和倍數
        this.currentWinAmount = winAmount;
        this.currentOdds = odds;

        // 檢查是否踩到地雷
        if (this.enemyPositions.includes(position)) {
            this.isGameOver = true;
            this.isWin = false;
        }
    }

    /**
     * 兌現（遊戲勝利）
     */
    cashOut(finalWinAmount: number) {
        console.log('[MinesGameStore] cashOut ->', finalWinAmount);
        this.currentWinAmount = finalWinAmount;
        this.isGameOver = true;
        this.isWin = true;
    }

    /**
     * 重置所有數據
     */
    reset() {
        console.log('[MinesGameStore] reset');
        this.currentRoundId = 0;
        this.hasBetPlaced = false;           // 重置下注狀態
        this.myPositions = [];
        this.enemyPositions = [];
        this.revealedPositions = [];
        this.lastClickedPosition = -1;
        this.currentOdds = 1.0;
        this.currentWinAmount = 0;
        this.isGameOver = false;
        this.isWin = false;
    }
}
