/**
 * ==================== API 類型定義 ====================
 * 這些是服務器 WebSocket API 的資料格式
 */

// ==================== 請求格式 (Client → Server) ====================

/**
 * 選擇隊伍請求
 */
export interface ApiSelectTeamRequest {
    isHomeTeam: boolean;             // true = 主隊，false = 客隊
}

/**
 * 下注請求（第一個格子）
 */
export interface ApiBetRequest {
    action: 'bet';
    amount: number;                  // 下注金額
    selectedPosition: number;        // 選擇的位置
    clientSeed?: string;             // 客戶端種子（可選）
}

/**
 * 揭開格子請求（後續格子）
 */
export interface ApiMineRequest {
    action: 'mine';
    selectedPosition: number;        // 格子位置
    roundId: number;                 // 回合 ID
}

/**
 * 兌現請求
 */
export interface ApiCashOutRequest {
    roundId: number;                 // 回合 ID
}

// ==================== 回應格式 (Server → Client) ====================

/**
 * 下注回應
 */
export interface ApiBetResponse {
    roundId: number;                 // 回合 ID
    winAmount: number;               // 贏得金額
    odds: number;                    // 倍數
    opponentPositions: number[];     // 對手位置
    // 可能還有其他欄位...
}

/**
 * 揭開格子回應
 */
export interface ApiMineResponse {
    winAmount: number;               // 贏得金額
    odds: number;                    // 倍數
    opponentPositions: number[];     // 對手位置（如果失敗）
}

/**
 * 兌現回應
 */
export interface ApiCashOutResponse {
    winAmount: number;               // 最終贏得金額
    balance: number;                 // 更新後的餘額
}

/**
 * 錯誤回應
 */
export interface ApiErrorResponse {
    errorCode: string;               // 錯誤代碼
    message?: string;                // 錯誤訊息
}

/**
 * ==================== 內部類型定義 ====================
 * 這些是遊戲內部使用的資料格式
 */

/**
 * 遊戲初始化資料（從 API 轉換而來）
 */
export interface GameInitData {
    roundId: number;
    playerPositions: number[];       // 我方球員位置（從某處獲取或生成）
    opponentPositions: number[];     // 對手球員位置（從 API 獲取）
}

/**
 * 格子揭開結果
 */
export interface TileRevealResult {
    position: number;                // 位置
    isPlayer: boolean;               // 是否是我方球員
    winAmount: number;               // 贏得金額
    odds: number;                    // 當前倍數
}
