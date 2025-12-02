// 遊戲狀態枚舉
export enum GameState {
    Loading = 'Loading',           // 1. 加載中
    SelectTeam = 'SelectTeam',     // 2. 選擇隊伍
    BetSection = 'BetSection',     // 3. 下注階段
    PlayGame = 'PlayGame',         // 4. 遊戲進行中
    Result = 'Result'              // 5. 結果顯示
}

// 遊戲狀態數據接口
export interface IGameStateData {
    selectedTeam: string | null;   // 選擇的隊伍 (PLAYER | ENEMIES)
    betAmount: number;             // 下注金額
    currentMultiplier: number;     // 當前倍數
    revealedPositions: number[];   // 已揭開的位置
    winAmount: number;             // 贏得的金額
    isFailed: boolean;             // 是否失敗
}
