/**
 * API 類型定義（精簡版）
 */

/**
 * 遊戲結果數據
 */
export interface GameResult {
    playerPositions: number[];       // 我方球員位置
    opponentPositions: number[];     // 對手球員位置
}

/**
 * API 返回的遊戲數據
 */
export interface MinesGameApiResponse {
    roundId: number;                 // 回合 ID
    mode: number;                    // 遊戲模式/難度
    result: GameResult;              // 遊戲結果數據
}

/**
 * 下注請求數據
 */
export interface BetRequestData {
    amount: number;                  // 下注金額
    mode: number;                    // 遊戲模式
    selectedTeam?: string;           // 選擇的隊伍
}

/**
 * 揭開格子請求數據
 */
export interface RevealTileRequestData {
    position: number;                // 格子位置
    roundId: number;                 // 回合 ID
}

/**
 * 揭開格子響應數據
 */
export interface RevealTileResponse {
    winAmount: number;               // 贏得金額
    odds: number;                    // 當前倍數
    opponentPositions: number[];     // 對手位置（如果失敗）
}

/**
 * 兌現請求數據
 */
export interface CashOutRequestData {
    roundId: number;                 // 回合 ID
}

/**
 * 兌現響應數據
 */
export interface CashOutResponse {
    winAmount: number;               // 最終贏得金額
    balance: number;                 // 更新後的餘額
}
