import inversify from 'inversify';
import mobx from 'mobx';
import { GameState, IGameStateData } from './game-state';

const { injectable } = inversify;

@injectable()
export class GameStateStore {
    constructor() {
        mobx.makeAutoObservable(this);
    }

    private _currentState: GameState = GameState.Loading;

    private _stateData: IGameStateData = {
        selectedTeam: null,
        betAmount: 0,
        winAmount: 0,
        isFailed: false,
    };

    get currentState() {
        return this._currentState;
    }

    get stateData() {
        return this._stateData;
    }

    setState(state: GameState) {
        console.log('[GameStateStore] setState ->', state);
        this._currentState = state;
    }

    updateStateData(data: Partial<IGameStateData>) {
        console.log('[GameStateStore] updateStateData ->', data);
        this._stateData = { ...this._stateData, ...data };
    }

    reset() {
        console.log('[GameStateStore] reset');
        this._currentState = GameState.SelectTeam;
        this._stateData = {
            selectedTeam: null,
            betAmount: 0,
            winAmount: 0,
            isFailed: false,
        };
    }
}
