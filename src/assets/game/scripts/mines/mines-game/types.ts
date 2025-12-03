/**
 * API 類型定義
 */

/**
 * 遊戲步驟動作類型
 */
export type StepAction = 'bet' | 'mine' | 'cashout';

/**
 * 單個遊戲步驟
 */
export interface GameStep {
    action: StepAction;
    position: number;
    multiplier: number;
    timestamp?: string;
    time?: string;
}

/**
 * 遊戲結果數據
 */
export interface GameResult {
    playerPositions: number[];       // 我方球員位置
    opponentPositions: number[];     // 對手球員位置
    selectedPositions: number[];     // 已選擇的位置
    starPosition: number;            // 星星位置（特殊格子）
}

/**
 * 遊戲分數
 */
export interface GameScore {
    playerTeamScore: number;         // 我方分數
    opponentTeamScore: number;       // 對手分數
}

/**
 * API 返回的完整遊戲數據
 */
export interface MinesGameApiResponse {
    _id: string;
    name: string;
    amount: number;                  // 下注金額
    winAmount: number;               // 贏得金額
    mode: number;                    // 遊戲模式/難度
    settleTime?: string;             // 結算時間
    playerId: string;
    siteId: string;
    isSettle: boolean;               // 是否已結算
    isAutoCashOut: boolean;          // 是否自動兌現
    currency: string;
    operatorId: string;
    roundId: number;                 // 回合 ID
    rtpConfigId: string;
    result: GameResult;              // 遊戲結果數據
    topStep: number;                 // 最高步數
    steps: GameStep[];               // 遊戲步驟記錄
    createdAt: string;
    score: GameScore;                // 遊戲分數
}

/**
 * 下注請求數據
 */
export interface BetRequestData {
    amount: number;                  // 下注金額
    mode: number;                    // 遊戲模式
    selectedTeam?: string;           // 選擇的隊伍（如果需要）
}

/**
 * 揭開格子請求數據
 */
export interface RevealTileRequestData {
    position: number;                // 格子位置
}

/**
 * 兌現請求數據
 */
export interface CashOutRequestData {
    // 可能需要的欄位
}
