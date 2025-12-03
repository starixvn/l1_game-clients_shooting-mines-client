import inversify from 'inversify';
import mobx from 'mobx';
import { MinesGameStore } from './mines-game-store';
import { GameStateStore } from '../game-state/game-state-store';
import { GameStateHandler } from '../game-state/game-state-handler';
import { GameState } from '../game-state/game-state';
import { MinesGameApiResponse, BetRequestData, RevealTileRequestData } from './types';

const { injectable, inject } = inversify;

/**
 * Mines 遊戲邏輯 Handler
 * 職責：
 * - 處理遊戲初始化（與 API 整合）
 * - 處理格子點擊邏輯
 * - 處理 Cash Out（射門）
 * - 處理倒數計時觸發的自動兌現
 * - 與服務器通訊
 */
@injectable()
export class MinesGameHandler {
    @inject(MinesGameStore)
    private minesGameStore: MinesGameStore;

    @inject(GameStateStore)
    private gameStateStore: GameStateStore;

    @inject(GameStateHandler)
    private gameStateHandler: GameStateHandler;

    constructor() {
        // 監聽自動兌現觸發
        setTimeout(() => {
            mobx.reaction(
                () => this.minesGameStore.shouldCashOut,
                (shouldCashOut) => {
                    if (shouldCashOut) {
                        this.handleAutoCashOut();
                    }
                }
            );
        }, 100);
    }

    // ==================== 遊戲初始化 ====================

    /**
     * 開始新遊戲（發送下注請求到 API）
     * @param betAmount 下注金額
     * @param selectedTeam 選擇的隊伍
     * @param mode 遊戲模式（預設 3）
     */
    async startNewGame(betAmount: number, selectedTeam: string, mode: number = 3) {
        console.log('[MinesGameHandler] Starting new game', { betAmount, selectedTeam, mode });

        try {
            // TODO: 向服務器發送下注請求
            const requestData: BetRequestData = {
                amount: betAmount,
                mode: mode,
                selectedTeam: selectedTeam,
            };

            // const apiResponse = await this.requestBet(requestData);

            // 模擬 API 響應（之後替換為真實 API 調用）
            const mockApiResponse = this.generateMockApiResponse(betAmount, mode);

            // 從 API 數據初始化遊戲
            this.initGameFromApiResponse(mockApiResponse);

            // 切換到遊戲進行狀態
            this.gameStateHandler.onBetPlaced(betAmount);

            console.log('[MinesGameHandler] Game initialized from API', mockApiResponse);

        } catch (error) {
            console.error('[MinesGameHandler] Failed to start game', error);
            // TODO: 處理錯誤（顯示錯誤提示等）
        }
    }

    /**
     * 從 API 響應初始化遊戲數據
     * @param apiResponse API 返回的遊戲數據
     */
    private initGameFromApiResponse(apiResponse: MinesGameApiResponse) {
        // 使用 API 數據初始化 Store
        this.minesGameStore.initGameFromApi({
            roundId: apiResponse.roundId,
            mode: apiResponse.mode,
            topStep: apiResponse.topStep,
            result: apiResponse.result,
            steps: apiResponse.steps,
            score: apiResponse.score,
        });

        // TODO: 從 API 獲取倍數階梯配置
        // 暫時使用模擬數據
        const mockMultiplierSteps = this.generateMultiplierSteps(
            apiResponse.result.playerPositions.length
        );
        this.minesGameStore.multiplierSteps = mockMultiplierSteps;
    }

    // ==================== 格子點擊邏輯 ====================

    /**
     * 處理格子點擊（發送揭開格子請求到 API）
     * @param position 格子位置 (0-19)
     * @returns Promise<'player' | 'opponent' | 'star' | null>
     */
    async handleTileClick(position: number): Promise<'player' | 'opponent' | 'star' | null> {
        // 檢查遊戲狀態
        if (this.gameStateStore.currentState !== GameState.PlayGame) {
            console.warn('[MinesGameHandler] Cannot click tile, game not in PlayGame state');
            return null;
        }

        // 檢查是否已結算
        if (this.minesGameStore.isSettle) {
            console.warn('[MinesGameHandler] Game already settled');
            return null;
        }

        // 檢查格子是否已經揭開
        if (this.minesGameStore.selectedPositions.includes(position)) {
            console.warn('[MinesGameHandler] Tile already revealed', position);
            return null;
        }

        console.log('[MinesGameHandler] Tile clicked', position);

        try {
            // TODO: 向服務器發送揭開格子請求
            const requestData: RevealTileRequestData = {
                position: position,
            };

            // const apiResponse = await this.requestRevealTile(requestData);

            // 模擬服務器響應延遲
            await this.delay(100);

            // 模擬服務器返回的倍數（之後從 API 獲取）
            const newMultiplier = this.calculateMultiplier(
                this.minesGameStore.safeReveals + 1
            );

            // 揭開格子
            const result = this.minesGameStore.revealTile(position, newMultiplier);

            if (result === 'player') {
                // 揭開我方球員 - 安全
                this.handleSafeReveal();
            } else if (result === 'opponent') {
                // 揭開對手球員 - 失敗
                this.handleGameLose();
            } else if (result === 'star') {
                // 揭開星星 - 特殊獎勵
                this.handleStarReveal();
            }

            return result;

        } catch (error) {
            console.error('[MinesGameHandler] Failed to reveal tile', error);
            return null;
        }
    }

    /**
     * 處理安全揭開（揭開我方球員）
     */
    private handleSafeReveal() {
        console.log('[MinesGameHandler] Safe reveal', {
            safeReveals: this.minesGameStore.safeReveals,
            currentMultiplier: this.minesGameStore.currentMultiplier,
        });

        // 如果是第一次揭開，啟動倒數計時
        if (this.minesGameStore.safeReveals === 1) {
            this.minesGameStore.startAutoCashOutTimer(30);
        }

        // 如果揭開所有我方球員，自動結算
        if (this.minesGameStore.isMaxMultiplier) {
            console.log('[MinesGameHandler] Revealed all players, auto cash out');
            this.handleCashOut();
        }
    }

    /**
     * 處理星星揭開（特殊獎勵）
     */
    private handleStarReveal() {
        console.log('[MinesGameHandler] Star revealed!');

        // TODO: 處理星星特殊獎勵邏輯
        // 例如：額外倍數、額外時間等

        this.handleSafeReveal();
    }

    /**
     * 處理遊戲失敗（揭開對手球員）
     */
    private handleGameLose() {
        console.log('[MinesGameHandler] Game lose');

        // 停止倒數計時
        this.minesGameStore.stopAutoCashOutTimer();

        // 切換到結果狀態
        this.gameStateHandler.onGameEnd(0, true);
    }

    // ==================== Cash Out（射門）====================

    /**
     * 處理玩家主動 Cash Out（發送 Cash Out 請求到 API）
     */
    async handleCashOut() {
        // 檢查是否可以兌現
        if (!this.minesGameStore.canCashOut) {
            console.warn('[MinesGameHandler] Cannot cash out');
            return;
        }

        console.log('[MinesGameHandler] Cash out', {
            currentMultiplier: this.minesGameStore.currentMultiplier,
            betAmount: this.gameStateStore.stateData.betAmount,
        });

        try {
            // TODO: 向服務器發送 Cash Out 請求
            // const apiResponse = await this.requestCashOut();

            // 模擬服務器響應延遲
            await this.delay(100);

            // 計算贏得的金額（之後從 API 獲取）
            const betAmount = this.gameStateStore.stateData.betAmount;
            const winAmount = betAmount * this.minesGameStore.currentMultiplier;

            // 更新 Store
            this.minesGameStore.cashOut(winAmount, false);

            // 切換到結果狀態
            this.gameStateHandler.onGameEnd(winAmount, false);

            console.log('[MinesGameHandler] Cash out success', { winAmount });

        } catch (error) {
            console.error('[MinesGameHandler] Failed to cash out', error);
        }
    }

    /**
     * 處理自動兌現（倒數結束）
     */
    private async handleAutoCashOut() {
        console.log('[MinesGameHandler] Auto cash out triggered');

        // 重置標記
        this.minesGameStore.shouldCashOut = false;

        // 檢查是否還可以兌現
        if (!this.minesGameStore.canCashOut) {
            return;
        }

        try {
            // TODO: 向服務器發送自動 Cash Out 請求
            // const apiResponse = await this.requestCashOut({ isAuto: true });

            // 模擬服務器響應延遲
            await this.delay(100);

            // 計算贏得的金額
            const betAmount = this.gameStateStore.stateData.betAmount;
            const winAmount = betAmount * this.minesGameStore.currentMultiplier;

            // 更新 Store（標記為自動兌現）
            this.minesGameStore.cashOut(winAmount, true);

            // 切換到結果狀態
            this.gameStateHandler.onGameEnd(winAmount, false);

            console.log('[MinesGameHandler] Auto cash out success', { winAmount });

        } catch (error) {
            console.error('[MinesGameHandler] Failed to auto cash out', error);
        }
    }

    // ==================== 倒數計時控制 ====================

    /**
     * 暫停倒數計時
     */
    pauseTimer() {
        this.minesGameStore.pauseAutoCashOutTimer();
    }

    /**
     * 恢復倒數計時
     */
    resumeTimer() {
        const remainingTime = this.minesGameStore.autoCashOutTimer;
        this.minesGameStore.startAutoCashOutTimer(remainingTime);
    }

    /**
     * 重置倒數計時（重新開始 30 秒）
     */
    resetTimer() {
        this.minesGameStore.resetAutoCashOutTimer(30);
    }

    // ==================== 遊戲重置 ====================

    /**
     * 重新開始遊戲（返回選隊階段）
     */
    restartGame() {
        console.log('[MinesGameHandler] Restart game');

        // 重置遊戲數據
        this.minesGameStore.reset();

        // 返回選隊階段
        this.gameStateHandler.backToTeamSelection();
    }

    /**
     * 繼續遊戲（使用相同設定開始新局）
     */
    async continueGame() {
        console.log('[MinesGameHandler] Continue game');

        const betAmount = this.gameStateStore.stateData.betAmount;
        const selectedTeam = this.gameStateStore.stateData.selectedTeam;
        const mode = this.minesGameStore.mode;

        // 重置遊戲數據
        this.minesGameStore.reset();

        // 開始新遊戲
        await this.startNewGame(betAmount, selectedTeam, mode);
    }

    // ==================== 工具方法 ====================

    /**
     * 生成隨機位置（用於模擬數據）
     * @param count 位置數量
     * @returns 位置數組
     */
    private generateRandomPositions(count: number): number[] {
        const positions: number[] = [];
        const gridSize = this.minesGameStore.gridSize;

        while (positions.length < count) {
            const randomPos = Math.floor(Math.random() * gridSize);
            if (!positions.includes(randomPos)) {
                positions.push(randomPos);
            }
        }

        return positions;
    }

    /**
     * 生成倍數階梯（根據我方球員數量）
     * @param playerCount 我方球員數量
     * @returns 倍數階梯陣列
     */
    private generateMultiplierSteps(playerCount: number): number[] {
        // TODO: 之後從 API 或配置獲取
        // 暫時使用模擬數據
        const steps: number[] = [];
        for (let i = 0; i < playerCount; i++) {
            steps.push(1.0 + (i + 1) * 0.15); // 每次增加 0.15 倍
        }
        return steps;
    }

    /**
     * 計算當前倍數（根據已揭開次數）
     * @param safeCount 安全揭開次數
     * @returns 當前倍數
     */
    private calculateMultiplier(safeCount: number): number {
        const steps = this.minesGameStore.multiplierSteps;
        if (safeCount > 0 && safeCount <= steps.length) {
            return steps[safeCount - 1];
        }
        return 1.0;
    }

    /**
     * 延遲函數
     * @param ms 毫秒
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 生成模擬 API 響應（開發測試用）
     * @param betAmount 下注金額
     * @param mode 遊戲模式
     * @returns 模擬的 API 響應
     */
    private generateMockApiResponse(betAmount: number, mode: number): MinesGameApiResponse {
        const playerPositions = this.generateRandomPositions(13);
        const opponentPositions = this.generateRandomPositions(3);
        const starPosition = this.generateRandomPositions(1)[0];

        // 確保星星位置不在球員位置中
        while (playerPositions.includes(starPosition) || opponentPositions.includes(starPosition)) {
            const newStar = Math.floor(Math.random() * this.minesGameStore.gridSize);
            if (!playerPositions.includes(newStar) && !opponentPositions.includes(newStar)) {
                break;
            }
        }

        return {
            _id: 'mock_' + Date.now(),
            name: 'test',
            amount: betAmount,
            winAmount: 0,
            mode: mode,
            playerId: 'player_123',
            siteId: '4100300',
            isSettle: false,
            isAutoCashOut: false,
            currency: 'USD',
            operatorId: 'operator_xyz789',
            roundId: Math.floor(Math.random() * 100000),
            rtpConfigId: '673f1a77bcf86cd799439022',
            result: {
                playerPositions: playerPositions,
                opponentPositions: opponentPositions,
                selectedPositions: [],
                starPosition: starPosition,
            },
            topStep: 3,
            steps: [
                {
                    action: 'bet',
                    position: 0,
                    multiplier: 1.0,
                    timestamp: new Date().toISOString(),
                },
            ],
            createdAt: new Date().toISOString(),
            score: {
                playerTeamScore: 0,
                opponentTeamScore: 0,
            },
        };
    }

    // ==================== 服務器通訊（預留）====================

    /**
     * 向服務器發送下注請求
     * @param requestData 下注請求數據
     * @returns Promise<MinesGameApiResponse>
     */
    // private async requestBet(requestData: BetRequestData): Promise<MinesGameApiResponse> {
    //     // TODO: 實作服務器通訊
    //     // return await this.connectionStore.send('bet', requestData);
    //     throw new Error('Not implemented');
    // }

    /**
     * 向服務器發送揭開格子請求
     * @param requestData 揭開格子請求數據
     * @returns Promise<API 響應>
     */
    // private async requestRevealTile(requestData: RevealTileRequestData): Promise<any> {
    //     // TODO: 實作服務器通訊
    //     // return await this.connectionStore.send('revealTile', requestData);
    //     throw new Error('Not implemented');
    // }

    /**
     * 向服務器發送 Cash Out 請求
     * @param params 可選參數（例如 isAuto）
     * @returns Promise<API 響應>
     */
    // private async requestCashOut(params?: { isAuto?: boolean }): Promise<any> {
    //     // TODO: 實作服務器通訊
    //     // return await this.connectionStore.send('cashOut', params || {});
    //     throw new Error('Not implemented');
    // }
}
