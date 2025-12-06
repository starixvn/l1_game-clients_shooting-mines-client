import gc from "@sg/game-client-base";
import inversify from 'inversify';
import { MinesGameStore } from './mines-game-store';
import { GameStateStore } from '../game-state/game-state-store';
import { GameStateHandler } from '../game-state/game-state-handler';
import {
    ApiSelectTeamRequest,
    ApiBetRequest,
    ApiBetResponse,
    ApiMineRequest,
    ApiMineResponse,
    ApiCashOutRequest,
} from './types';
import Observer from 'observer';
import { GameState } from '../game-state/game-state';

const { injectable, inject } = inversify;
const { handle } = Observer;
@injectable()
export class MinesGameHandler implements gc.Shared.IMultipleHandlers {
    @inject(MinesGameStore)
    private gameStore: MinesGameStore;

    @inject(GameStateStore)
    private gameStateStore: GameStateStore;

    @inject(GameStateHandler)
    private gameStateHandler: GameStateHandler;

    @inject(gc.Connection.ConnectionStore)
    private connectionStore: gc.Connection.ConnectionStore;


    // ==================== 事件處理列表（處理 WebSocket 事件）====================
    eventHandleList = [
        {
            name: 'bet_response',
            handle: this.onBetResponse
        },
        {
            name: 'mine_response',
            handle: this.onMineResponse
        },
    ];

    handleTeamSelected(team: string) {
        const isHomeTeam = team === 'PLAYER' || team === 'home';

        this.sendSelectTeamRequest(isHomeTeam);

        this.gameStateHandler.onTeamSelected(team);
    }

    handleTileClick(position: number) {
        this.gameStore.setClickedPosition(position);

        const hasBetPlaced = this.gameStore.hasBetPlaced;

        if (!hasBetPlaced) {
            this.gameStateHandler.setGameState(GameState.PlayGame);
            this.sendBetRequest(position);
            this.gameStore.hasBetPlaced = true;
        } else {
            this.sendMineRequest(position);
        }
    }

    /**
     * 處理兌現按鈕（由 UI 透過 @handle 調用）
     */
    handleCashOut() {
        this.sendCashOutRequest();
    }

    private sendSelectTeamRequest(isHomeTeam: boolean) {
        const apiRequest: ApiSelectTeamRequest = {
            isHomeTeam: isHomeTeam,
        };

        // this.sendWebSocket('selectTeam', apiRequest);
    }

    private sendBetRequest(position: number) {
        const betAmount = this.gameStateStore.stateData.betAmount;

        const apiRequest: ApiBetRequest = {
            action: 'bet',
            amount: betAmount,
            selectedPosition: position,
        };

        console.log('[MinesGameHandler] → Sending bet request:', apiRequest);
        // this.sendWebSocket('bet', apiRequest);
    }

    /**
     * 發送揭開格子請求（後續格子）
     */
    private sendMineRequest(position: number) {
        const apiRequest: ApiMineRequest = {
            action: 'mine',
            selectedPosition: position,
            roundId: this.gameStore.currentRoundId,
        };

        console.log('[MinesGameHandler] → Sending mine request:', apiRequest);
        // this.sendWebSocket('mine', apiRequest);
    }

    /**
     * 發送兌現請求
     */
    private sendCashOutRequest() {
        const apiRequest: ApiCashOutRequest = {
            roundId: this.gameStore.currentRoundId,
        };

        console.log('[MinesGameHandler] → Sending cashout request:', apiRequest);
        // this.sendWebSocket('cashout', apiRequest);
    }

    onBetResponse(apiResponse: ApiBetResponse) {
        const myPositions = [0];

        this.gameStore.initializeGame(
            apiResponse.roundId,
            myPositions,
            apiResponse.opponentPositions
        );

        // 揭開第一個格子（就是剛點擊的位置）
        const firstPosition = this.gameStore.lastClickedPosition;
        this.gameStore.revealPosition(
            firstPosition,
            apiResponse.winAmount,
            apiResponse.odds
        );

    }

    /**
     * 處理揭開格子回應（由 eventHandleList 自動調用）
     */
    onMineResponse(apiResponse: ApiMineResponse) {
        const clickedPosition = this.gameStore.lastClickedPosition;

        this.gameStore.revealPosition(
            clickedPosition,
            apiResponse.winAmount,
            apiResponse.odds
        );

        // 檢查遊戲狀態
        if (this.gameStore.isGameOver && !this.gameStore.isWin) {
            // 踩到地雷 → 遊戲失敗
            console.log('[MinesGameHandler] Game over - hit enemy');
            this.gameStateHandler.onGameEnd(0, true);
        } else {
            // 安全格子 → 繼續遊戲
            console.log('[MinesGameHandler] Safe tile revealed, continue playing');
        }
    }

}
