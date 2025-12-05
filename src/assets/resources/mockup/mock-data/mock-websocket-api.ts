/**
 * Mock WebSocket API Data
 * 整理所有 mock 資料供測試使用
 */

// ==================== Sign In ====================
export const mockSignInRequest = {
    isAuthenticated: true,
    umInfo: null,
    username: "ONEworksVGCash_5546183",
    language: "vi-VN",
    ss: "DYFaHKV8cpoxpOv3r3TEQKDYK6t2Prvk_ONEworksVGCash_5546183",
    system: 1,
    memberName: "username_5546183",
    rate: 0.038009999999999995,
    offerGames: [
        {
            gameId: 0,
            minBet: 1,
            maxBet: 10000,
            maxBetPerChoices: {}
        }
    ],
    fractionalOddsFormat: false,
    isUM: false
};

export const mockSignInResponse = {
    toGame: "shootblitz"
};

// ==================== In Game (Join Game) ====================
export const mockInGameRequest = {
    key: "1"
};

export const mockInGameResponse = {
    gameConfigs: {
        _id: "68e6106dd35d85a9459e7f93",
        chips: ["50", "500", "2000", "5000"],
        maxBet: 40000,
        minBet: 10
    },
    user: {
        name: "yuan1",
        UID: 5454,
        currency: "INH",
        balance: 10000
    },
    homeTeam: {
        opponentCount: 4,
        teamId: 0
    },
    awayTeam: {
        opponentCount: 3,
        teamId: 1
    }
};

// ==================== Bet Action ====================
export const mockBetRequest = {
    action: "bet",
    amount: 10,
    clientSeed: "1234",
    selectedPosition: 19
};

export const mockBetResponseSuccess = {
    roundId: 456134,
    winAmount: 100,
    odds: 1.75,
    hasStarChance: true,
    isStarHit: true,
    opponentPositions: [0, 1, 2],
    effects: {
        type: "home",
        feature: {
            nextPosition: 2
        }
    },
    starPosition: []
};

export const mockBetResponseSuccessAway = {
    roundId: 456134,
    winAmount: 100,
    odds: 1.75,
    hasStarChance: true,
    isStarHit: false,
    opponentPositions: [0, 1, 2],
    effects: {
        type: "away",
        feature: {
            isNextProtected: false
        }
    },
    starPosition: []
};

export const mockBetResponseFail = {
    endBet: -1,
    notice: {
        errorCode: "SB1940",
        minBet: 10,
        maxBet: 40000
    }
};

// ==================== Mine Action ====================
export const mockMineRequest = {
    action: "mine",
    selectedPosition: 19,
    roundId: 456134
};

export const mockMineResponseSuccess = {
    winAmount: 100,
    odds: 1.75,
    hasStarChance: true,
    isStarHit: true,
    opponentPositions: [0, 1, 2],
    effects: {
        type: "home",
        feature: {
            nextPosition: 2
        }
    },
    starPosition: []
};

export const mockMineResponseFail = {
    endBet: -1,
    notice: {
        errorCode: "SB1942" // "SB1942" (noBetFound), "SB1943" (alreadyCashOut), "SB1944" (invalidMine)
    }
};

// ==================== Cash Out ====================
export const mockCashOutRequest = {
    roundId: 456134
};

export const mockCashOutResponseSuccess = {
    winAmount: 100,
    odds: 1.75,
    opponentPositions: [0, 1, 2],
    starPosition: [],
    balance: 4000,
    reachMaxWin: false
};

// ==================== Get History ====================
export const mockGetHistoryRequest = {
    page: 1,
    pageSize: 10
};

export const mockGetHistoryResponse = {
    history: [
        {
            roundId: 456134,
            amount: 100,
            winAmount: 175,
            time: "2024-12-03T10:30:00Z",
            opponentPositions: [0, 1, 2],
            selectedPositions: [
                {
                    position: 3,
                    odds: 1.0,
                    isStarHit: true,
                    isProtected: false
                },
                {
                    position: 7,
                    odds: 2.0,
                    isStarHit: false,
                    isProtected: true
                }
            ]
        }
    ],
    totalPages: 10,
    currentPage: 1
};

// ==================== Get Provably Fair ====================
export const mockGetProvablyFairRequest = {
    roundId: 456134
};

export const mockGetProvablyFairResponse = {
    provablyFair: {
        serverSeedHash: "a3f5e8d9c7b2...",
        clientSeed: "player_seed_123",
        serverSeed: "decrypted_server_seed",
        opponentPositions: [0, 1, 5],
        finalHash: "final_hash_xyz789",
        roundId: 456134
    }
};

// ==================== All Mock Data (Grouped) ====================
export const MockData = {
    signIn: {
        request: mockSignInRequest,
        response: mockSignInResponse
    },
    inGame: {
        request: mockInGameRequest,
        response: mockInGameResponse
    },
    bet: {
        request: mockBetRequest,
        responseSuccess: mockBetResponseSuccess,
        responseSuccessAway: mockBetResponseSuccessAway,
        responseFail: mockBetResponseFail
    },
    mine: {
        request: mockMineRequest,
        responseSuccess: mockMineResponseSuccess,
        responseFail: mockMineResponseFail
    },
    cashOut: {
        request: mockCashOutRequest,
        responseSuccess: mockCashOutResponseSuccess
    },
    history: {
        request: mockGetHistoryRequest,
        response: mockGetHistoryResponse
    },
    provablyFair: {
        request: mockGetProvablyFairRequest,
        response: mockGetProvablyFairResponse
    }
};

export default MockData;
