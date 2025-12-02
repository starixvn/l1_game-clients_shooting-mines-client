import { _decorator, Button, Label, Node } from 'cc';
import { ObserverComponent } from 'db://shared-components/shared/common-components/observer-component/scripts/observer-component';
import Observer from 'observer';
import { BetAmountHandlers } from '../components/bet-amount/bet-amount-handlers';
import { BetAmountStore } from '../components/bet-amount/bet-amount-store';

const { ccclass, property } = _decorator;
const { render, handle } = Observer;

@ccclass('BettingArea')
export class BettingArea extends ObserverComponent {
    @property([Label])
    digitLabels: Label[] = []; // 支援最多 4 個數字字元

    @property(Button)
    decreaseButton: Button = null;

    @property(Button)
    increaseButton: Button = null;

    // 可下注的籌碼選項（之後會從 API 獲取）
    private betOptions: number[] = [5, 10, 20, 30, 50, 100, 200, 500, 1000, 10000, 100000, 1000000, 10000000];
    private currentIndex: number = 0;

    onLoad() {
        super.onLoad();

        // 檢查 digitLabels 是否正確設定
        if (!this.digitLabels || this.digitLabels.length === 0) {
            console.error('[BettingArea] digitLabels 陣列未設定！請在 Editor 中連接 4 個 Label 組件');
            return;
        }

        // 檢查是否有 null 的 Label
        for (let i = 0; i < this.digitLabels.length; i++) {
            if (!this.digitLabels[i]) {
                console.error(`[BettingArea] digitLabels[${i}] 是 null！請檢查 Editor 中的連接`);
                return;
            }
        }

        this.updateDisplay();
    }

    onDecreaseClick() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateDisplay();
            this.updateBetAmount(this.betOptions[this.currentIndex]);
            // this.playSound(AudioIds.CLICK); // 之後啟用
        }
    }

    onIncreaseClick() {
        if (this.currentIndex < this.betOptions.length - 1) {
            this.currentIndex++;
            this.updateDisplay();
            this.updateBetAmount(this.betOptions[this.currentIndex]);
            // this.playSound(AudioIds.CLICK); // 之後啟用
        }
    }

    @handle(BetAmountHandlers, (handle, amount: number) => handle.updateBetAmount(amount))
    updateBetAmount(amount: number) {
        return amount;
    }

    @render(BetAmountStore, (store) => store.amount)
    renderBetAmount(amount: any) {
        if (amount?.value) {
            // 同步外部改變的金額
            const index = this.betOptions.indexOf(amount.value);
            if (index !== -1 && index !== this.currentIndex) {
                this.currentIndex = index;
                this.updateDisplay();
            } else if (index === -1) {
                // 如果金額不在選項中，找最接近的值
                const closestIndex = this.findClosestBetIndex(amount.value);
                if (closestIndex !== this.currentIndex) {
                    this.currentIndex = closestIndex;
                    this.updateDisplay();
                }
            }
        }
    }

    private updateDisplay() {
        // 安全檢查
        if (!this.digitLabels || this.digitLabels.length === 0) {
            console.warn('[BettingArea] digitLabels 未設定，無法更新顯示');
            return;
        }

        const value = this.betOptions[this.currentIndex];
        const displayStr = this.formatBetValue(value);

        console.log(`[BettingArea] updateDisplay - value: ${value}, displayStr: "${displayStr}", length: ${displayStr.length}`);

        // 更新每個字元 Label
        for (let i = 0; i < this.digitLabels.length; i++) {
            if (!this.digitLabels[i]) {
                console.warn(`[BettingArea] digitLabels[${i}] 是 null，跳過`);
                continue;
            }

            if (i < displayStr.length) {
                this.digitLabels[i].string = displayStr[i];
                this.digitLabels[i].node.active = true;
                console.log(`[BettingArea] digit[${i}] = "${displayStr[i]}" (active)`);
            } else {
                // 隱藏多餘的位數
                this.digitLabels[i].node.active = false;
                console.log(`[BettingArea] digit[${i}] = hidden`);
            }
        }

        // Layout 組件會自動調整 betting-box-value 的寬度
    }

    /**
     * 格式化下注金額顯示
     * 規則：
     * - 1-999: 顯示為 3 位數，補零 (例如 "005", "100")
     * - 1000-9999: 顯示為 4 位數 (例如 "1000", "5000")
     * - 10000-999999: 顯示為 K (例如 "10K", "700K")
     * - 1000000+: 顯示為 M (例如 "1M", "10M")
     */
    private formatBetValue(value: number): string {
        if (value < 1000) {
            // 1-999: 補零到 3 位數
            return value.toString().padStart(3, '0');
        } else if (value < 10000) {
            // 1000-9999: 直接顯示 4 位數
            return value.toString();
        } else if (value < 1000000) {
            // 10000-999999: 轉換為 K
            const kValue = Math.floor(value / 1000);
            return kValue + 'K';
        } else {
            // 1000000+: 轉換為 M
            const mValue = Math.floor(value / 1000000);
            return mValue + 'M';
        }
    }


    // 之後可以用這個方法從 API 載入籌碼選項
    public setBetOptions(options: number[]) {
        if (options && options.length > 0) {
            this.betOptions = options;
            this.currentIndex = 0;
            this.updateDisplay();
        }
    }

    // 找到最接近目標金額的籌碼選項索引
    private findClosestBetIndex(targetAmount: number): number {
        let closestIndex = 0;
        let minDiff = Math.abs(this.betOptions[0] - targetAmount);

        for (let i = 1; i < this.betOptions.length; i++) {
            const diff = Math.abs(this.betOptions[i] - targetAmount);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }

        return closestIndex;
    }

    // 預留音效方法
    // private playSound(id: string) {
    //     // 之後實作
    // }
}

