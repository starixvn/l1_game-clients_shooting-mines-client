import inversify from 'inversify';
import mobx from 'mobx';
import { GameStep, GameScore } from './types';

const { injectable } = inversify;

/**
 * Mines 遊戲核心數據 Store
 * 職責：
 * - 管理格子狀態（已揭開、球員位置）
 * - 管理倍數和獎勵
 * - 管理倒數計時器
 * - 管理遊戲進度
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
    topStep: number = 0;                     // 最高步數
    isSettle: boolean = false;               // 是否已結算
    isAutoCashOut: boolean = false;          // 是否自動兌現

    // ==================== 遊戲數據 ====================
    playerPositions: number[] = [];          // 我方球員位置（從 API 獲取）
    opponentPositions: number[] = [];        // 對手球員位置（從 API 獲取）
    selectedPositions: number[] = [];        // 已選擇的位置（已揭開的格子）
    starPosition: number = -1;               // 星星位置（特殊格子）

    currentMultiplier: number = 1.0;         // 當前倍數
    nextMultiplier: number = 1.5;            // 下一個倍數
    multiplierSteps: number[] = [];          // 倍數階梯（從配置獲取）

    steps: GameStep[] = [];                  // 遊戲步驟記錄
    score: GameScore = {                     // 遊戲分數
        playerTeamScore: 0,
        opponentTeamScore: 0,
    };

    // ==================== 倒數計時 ====================
    autoCashOutTimer: number = 30;           // 倒數秒數（預設 30 秒）
    autoCashOutEnable: boolean = false;      // 是否啟用倒數
    private timerHandle: any = null;         // setTimeout handle

    // ==================== 遊戲結果 ====================
    gameResult: 'win' | 'lose' | null = null;  // 遊戲結果
    finalWinAmount: number = 0;                 // 最終贏得金額

    // ==================== 觸發標記（供 Handler 監聽）====================
    shouldCashOut: boolean = false;          // 是否應該執行 Cash Out

    // ==================== 計算屬性 ====================

    /**
     * 安全揭開次數（揭開我方球員的次數）
     */
    get safeReveals(): number {
        return this.selectedPositions.filter(pos =>
            this.playerPositions.includes(pos)
        ).length;
    }

    /**
     * 最大可揭開次數（我方球員總數）
     */
    get maxReveals(): number {
        return this.playerPositions.length;
    }

    /**
     * 是否可以兌現
     * 條件：至少揭開過一次安全格子，且未結算
     */
    get canCashOut(): boolean {
        return this.safeReveals > 0 && !this.isSettle;
    }

    /**
     * 遊戲進度百分比
     */
    get progress(): number {
        if (this.maxReveals === 0) return 0;
        return this.safeReveals / this.maxReveals;
    }

    /**
     * 剩餘可揭開次數
     */
    get remainingReveals(): number {
        return this.maxReveals - this.safeReveals;
    }

    /**
     * 是否達到最大倍數（揭開所有我方球員）
     */
    get isMaxMultiplier(): boolean {
        return this.safeReveals >= this.maxReveals;
    }

    /**
     * 倒數計時是否可見（最後 5 秒顯示）
     */
    get autoCashOutTimerVisible(): boolean {
        return this.autoCashOutEnable && this.autoCashOutTimer <= 5;
    }

    /**
     * 是否揭開星星位置
     */
    get hasRevealedStar(): boolean {
        return this.starPosition !== -1 && this.selectedPositions.includes(this.starPosition);
    }

    // ==================== 遊戲數據操作 ====================

    /**
     * 初始化遊戲（從 API 數據初始化）
     * @param apiData API 返回的遊戲數據
     */
    initGameFromApi(apiData: {
        roundId: number;
        mode: number;
        topStep: number;
        result: {
            playerPositions: number[];
            opponentPositions: number[];
            starPosition: number;
        };
        steps?: GameStep[];
        score?: GameScore;
    }) {
        this.roundId = apiData.roundId;
        this.mode = apiData.mode;
        this.topStep = apiData.topStep;
        this.playerPositions = apiData.result.playerPositions;
        this.opponentPositions = apiData.result.opponentPositions;
        this.starPosition = apiData.result.starPosition;
        this.selectedPositions = [];
        this.steps = apiData.steps || [];
        this.score = apiData.score || { playerTeamScore: 0, opponentTeamScore: 0 };
        this.currentMultiplier = 1.0;
        this.nextMultiplier = 1.5;
        this.gameResult = null;
        this.finalWinAmount = 0;
        this.isSettle = false;
        this.isAutoCashOut = false;
        this.shouldCashOut = false;
        this.stopAutoCashOutTimer();
    }

    /**
     * 揭開格子
     * @param position 格子位置 (0-19)
     * @param multiplier 服務器返回的倍數
     * @returns 'player' | 'opponent' | 'star'
     */
    revealTile(position: number, multiplier?: number): 'player' | 'opponent' | 'star' {
        // 已經揭開過，直接返回
        if (this.selectedPositions.includes(position)) {
            console.warn(`[MinesGameStore] Tile ${position} already revealed`);
            if (position === this.starPosition) return 'star';
            return this.playerPositions.includes(position) ? 'player' : 'opponent';
        }

        // 記錄選擇的位置
        this.selectedPositions.push(position);

        // 記錄步驟
        this.steps.push({
            action: 'mine',
            position: position,
            multiplier: multiplier || this.currentMultiplier,
            timestamp: new Date().toISOString(),
        });

        // 更新倍數（如果服務器有返回）
        if (multiplier !== undefined) {
            this.currentMultiplier = multiplier;
        }

        // 判斷是什麼類型的格子
        if (position === this.starPosition) {
            // 揭開星星 - 特殊獎勵
            return 'star';
        } else if (this.playerPositions.includes(position)) {
            // 揭開我方球員 - 安全
            this.updateMultiplierBySteps();
            return 'player';
        } else {
            // 揭開對手球員 - 失敗
            this.gameResult = 'lose';
            this.score.opponentTeamScore++;
            this.stopAutoCashOutTimer();
            return 'opponent';
        }
    }

    /**
     * 根據已揭開步數更新倍數（如果沒有服務器返回倍數）
     */
    private updateMultiplierBySteps() {
        const safeCount = this.safeReveals;
        if (safeCount > 0 && safeCount <= this.multiplierSteps.length) {
            this.currentMultiplier = this.multiplierSteps[safeCount - 1];

            // 更新下一個倍數
            if (safeCount < this.multiplierSteps.length) {
                this.nextMultiplier = this.multiplierSteps[safeCount];
            }
        }
    }

    /**
     * 執行 Cash Out（射門）
     * @param winAmount 贏得的金額（從服務器獲取）
     * @param isAuto 是否自動兌現
     */
    cashOut(winAmount: number, isAuto: boolean = false) {
        this.gameResult = 'win';
        this.finalWinAmount = winAmount;
        this.isSettle = true;
        this.isAutoCashOut = isAuto;
        this.score.playerTeamScore++;
        this.stopAutoCashOutTimer();

        // 記錄 cashout 步驟
        this.steps.push({
            action: 'cashout',
            position: this.selectedPositions[this.selectedPositions.length - 1] || 0,
            multiplier: this.currentMultiplier,
            timestamp: new Date().toISOString(),
        });
    }

    // ==================== 倒數計時操作 ====================

    /**
     * 開始倒數計時
     * @param seconds 倒數秒數（預設 30 秒）
     */
    startAutoCashOutTimer(seconds: number = 30) {
        // 如果已經在倒數，先停止
        this.stopAutoCashOutTimer();

        this.autoCashOutEnable = true;
        this.autoCashOutTimer = seconds;

        const countDown = () => {
            this.autoCashOutTimer--;

            if (this.autoCashOutTimer <= 0) {
                // 倒數結束，觸發自動兌現
                this.triggerAutoCashOut();
            } else {
                // 繼續倒數
                this.timerHandle = setTimeout(countDown, 1000);
            }
        };

        this.timerHandle = setTimeout(countDown, 1000);
    }

    /**
     * 停止倒數計時
     */
    stopAutoCashOutTimer() {
        if (this.timerHandle) {
            clearTimeout(this.timerHandle);
            this.timerHandle = null;
        }
        this.autoCashOutEnable = false;
    }

    /**
     * 重置倒數計時（重新開始倒數）
     * @param seconds 倒數秒數（預設 30 秒）
     */
    resetAutoCashOutTimer(seconds: number = 30) {
        this.stopAutoCashOutTimer();
        this.startAutoCashOutTimer(seconds);
    }

    /**
     * 暫停倒數計時
     */
    pauseAutoCashOutTimer() {
        if (this.timerHandle) {
            clearTimeout(this.timerHandle);
            this.timerHandle = null;
        }
        // 保持 autoCashOutEnable = true，但停止倒數
    }

    /**
     * 觸發自動兌現（設置標記，由 Handler 監聽處理）
     */
    private triggerAutoCashOut() {
        this.stopAutoCashOutTimer();
        this.shouldCashOut = true;
    }

    // ==================== 重置遊戲 ====================

    /**
     * 重置所有數據（回到初始狀態）
     */
    reset() {
        this.roundId = 0;
        this.mode = 3;
        this.topStep = 0;
        this.isSettle = false;
        this.isAutoCashOut = false;
        this.playerPositions = [];
        this.opponentPositions = [];
        this.selectedPositions = [];
        this.starPosition = -1;
        this.currentMultiplier = 1.0;
        this.nextMultiplier = 1.5;
        this.multiplierSteps = [];
        this.steps = [];
        this.score = { playerTeamScore: 0, opponentTeamScore: 0 };
        this.gameResult = null;
        this.finalWinAmount = 0;
        this.shouldCashOut = false;
        this.stopAutoCashOutTimer();
    }
}
