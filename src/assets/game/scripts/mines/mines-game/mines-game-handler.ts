import inversify from 'inversify';
import { MinesGameStore } from './mines-game-store';
import { GameStateStore } from '../game-state/game-state-store';
import { GameStateHandler } from '../game-state/game-state-handler';
import { BetRequestData, RevealTileRequestData, CashOutRequestData } from './types';

const { injectable, inject } = inversify;

/**
 * Mines 遊戲邏輯 Handler（精簡版）
 */
@injectable()
export class MinesGameHandler {
    @inject(MinesGameStore)
    private minesGameStore: MinesGameStore;

    @inject(GameStateStore)
    private gameStateStore: GameStateStore;

    @inject(GameStateHandler)
    private gameStateHandler: GameStateHandler;

    // ==================== 遊戲初始化 ====================

    /**
     * 開始新遊戲
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
            const mockApiResponse = {
                roundId: 12345,
                mode: mode,
                result: {
                    playerPositions: [0, 1, 2, 5, 8, 10, 12, 15, 16, 18],
                    opponentPositions: [3, 4, 7, 9, 13, 14, 17, 19],
                },
            };

            this.minesGameStore.initGameFromApi(mockApiResponse);
            this.gameStateHandler.onBetPlaced(betAmount);

            console.log('[MinesGameHandler] Game initialized');

        } catch (error) {
            console.error('[MinesGameHandler] Failed to start game', error);
        }
    }

    // ==================== 格子點擊邏輯 ====================

    /**
     * 處理格子點擊
     */
    async handleTileClick(position: number) {
        console.log('[MinesGameHandler] Tile clicked', position);
        this.minesGameStore.clickedPosition = position;
        // try {
        //     // TODO: 向服務器發送揭開格子請求
        //     const requestData: RevealTileRequestData = {
        //         position: position,
        //         roundId: this.minesGameStore.roundId,
        //     };

        //     // const apiResponse = await this.requestRevealTile(requestData);

        //     // 模擬 API 響應
        //     const mockResponse = {
        //         winAmount: 100,
        //         odds: 1.5,
        //         opponentPositions: this.minesGameStore.opponentPositions,
        //     };

        //     // 揭開格子
        //     const result = this.minesGameStore.revealTile(
        //         position,
        //         mockResponse.winAmount,
        //         mockResponse.odds
        //     );

        //     // if (result === 'opponent') {
        //     //     // 遊戲失敗
        //     //     this.gameStateHandler.onGameEnd(0, true);
        //     // }

        // } catch (error) {
        //     console.error('[MinesGameHandler] Failed to reveal tile', error);
        // }
    }

    // ==================== Cash Out ====================

    /**
     * 處理玩家 Cash Out
     */
    async handleCashOut() {
        if (!this.minesGameStore.canCashOut) {
            console.warn('[MinesGameHandler] Cannot cash out');
            return;
        }

        console.log('[MinesGameHandler] Cash out');

        try {
            // TODO: 向服務器發送 Cash Out 請求
            const requestData: CashOutRequestData = {
                roundId: this.minesGameStore.roundId,
            };

            // const apiResponse = await this.requestCashOut(requestData);

            // 模擬 API 響應
            const mockResponse = {
                winAmount: this.minesGameStore.winAmount,
                balance: 5000,
            };

            this.minesGameStore.cashOut(mockResponse.winAmount);
            this.gameStateHandler.onGameEnd(mockResponse.winAmount, false);

            console.log('[MinesGameHandler] Cash out success');

        } catch (error) {
            console.error('[MinesGameHandler] Failed to cash out', error);
        }
    }

    // ==================== 遊戲重置 ====================

    /**
     * 重新開始遊戲
     */
    restartGame() {
        console.log('[MinesGameHandler] Restart game');
        this.minesGameStore.reset();
        this.gameStateHandler.backToTeamSelection();
    }

    /**
     * 繼續遊戲（使用相同設定）
     */
    async continueGame() {
        console.log('[MinesGameHandler] Continue game');

        const betAmount = this.gameStateStore.stateData.betAmount;
        const selectedTeam = this.gameStateStore.stateData.selectedTeam;
        const mode = this.minesGameStore.mode;

        this.minesGameStore.reset();
        await this.startNewGame(betAmount, selectedTeam, mode);
    }

    // ==================== 服務器通訊（預留）====================

    // private async requestBet(requestData: BetRequestData): Promise<any> {
    //     // TODO: 實作服務器通訊
    //     throw new Error('Not implemented');
    // }

    // private async requestRevealTile(requestData: RevealTileRequestData): Promise<any> {
    //     // TODO: 實作服務器通訊
    //     throw new Error('Not implemented');
    // }

    // private async requestCashOut(requestData: CashOutRequestData): Promise<any> {
    //     // TODO: 實作服務器通訊
    //     throw new Error('Not implemented');
    // }
}
