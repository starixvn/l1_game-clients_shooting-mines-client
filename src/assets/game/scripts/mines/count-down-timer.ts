import { _decorator, Color, Graphics, Label } from 'cc';
import { ObserverComponent } from 'db://shared-components/shared/common-components/observer-component/scripts/observer-component';

const { ccclass, property } = _decorator;

@ccclass('CountDownTimer')
export class CountDownTimer extends ObserverComponent {
    @property(Graphics)
    graphics: Graphics = null;

    @property(Label)
    numberLabel: Label = null;

    @property
    totalTime: number = 10;

    @property
    radius: number = 42;

    @property
    ringWidth: number = 10;

    @property
    progressColor: Color = new Color(242, 175, 39, 255);

    @property
    bgColor: Color = new Color(0, 0, 0, 255);

    private remainingTime: number = 0;
    private isRunning: boolean = false;

    onLoad() {
        super.onLoad();
        this.resetCountdown();
    }

    start() {
        this.startCountdown();
    }

    startCountdown(duration?: number) {
        this.remainingTime = duration ?? this.totalTime;
        this.isRunning = true;
        this.updateLabel(Math.ceil(this.remainingTime));
        this.draw(1);
    }

    stopCountdown() {
        this.isRunning = false;
    }

    resetCountdown() {
        this.remainingTime = this.totalTime;
        this.isRunning = false;
        this.updateLabel(Math.ceil(this.remainingTime));
        this.draw(1);
    }

    update(dt: number) {
        if (!this.isRunning) return;

        this.remainingTime -= dt;

        if (this.remainingTime < 0) {
            this.remainingTime = 0;
        }

        // 根據剩餘時間計算進度
        const currentProgress = this.remainingTime / this.totalTime;

        this.updateLabel(Math.ceil(this.remainingTime));
        this.draw(currentProgress);

        if (this.remainingTime <= 0) {
            this.remainingTime = 0;
            this.isRunning = false;
            this.updateLabel(0);
            this.draw(0);
            this.node.emit('countdown-complete');
        }
    }

    private draw(progress: number) {
        if (!this.graphics) return;

        const clampedProgress = Math.max(0, Math.min(1, progress));

        this.graphics.clear();

        // 背景圓
        this.graphics.fillColor = this.bgColor;
        this.graphics.circle(0, 0, this.radius);
        this.graphics.fill();

        // 進度環（從12點鐘方向順時針繪製，視覺上呈現逆時針縮減效果）
        if (clampedProgress > 0) {
            const startAngle = Math.PI / 2;
            const endAngle = startAngle - Math.PI * 2 * clampedProgress;

            this.graphics.lineWidth = this.ringWidth;
            this.graphics.lineCap = Graphics.LineCap.ROUND;
            this.graphics.strokeColor = this.progressColor;
            this.graphics.arc(0, 0, this.radius - this.ringWidth / 2, startAngle, endAngle, false);
            this.graphics.stroke();
        }
    }

    private updateLabel(time: number) {
        if (!this.numberLabel) return;
        this.numberLabel.string = Math.floor(time).toString();
    }
}
