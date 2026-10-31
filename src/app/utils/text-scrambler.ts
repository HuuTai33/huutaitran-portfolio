const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#_~@0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * "Encrypt then decrypt" text effect (same as the home portal links):
 * the text is fully replaced by random characters, then resolved from left to right.
 * Call destroy() when the owner is destroyed to cancel pending frames/timeouts.
 */
export class TextScrambler {
  private readonly frameIds = new Set<number>();
  private readonly timeouts = new Set<ReturnType<typeof setTimeout>>();
  private destroyed = false;

  constructor(private readonly enabled: boolean) {}

  get isDestroyed(): boolean {
    return this.destroyed;
  }

  scramble(originalText: string, updateFn: (val: string) => void, duration = 600): Promise<void> {
    return new Promise((resolve) => {
      if (!this.enabled || this.destroyed) {
        updateFn(originalText);
        resolve();
        return;
      }

      const length = originalText.length;
      const startTime = performance.now();
      const encryptDuration = Math.min(150, duration * 0.25);
      const decryptDuration = duration - encryptDuration;
      let frameId: number;

      const update = (now: number) => {
        this.frameIds.delete(frameId);
        if (this.destroyed) {
          updateFn(originalText);
          resolve();
          return;
        }

        const elapsed = now - startTime;
        const resolvedCount = elapsed < encryptDuration
          ? 0
          : Math.floor(Math.min((elapsed - encryptDuration) / decryptDuration, 1) * length);

        let result = '';
        for (let i = 0; i < length; i++) {
          result += originalText[i] === ' ' ? ' ' : i < resolvedCount ? originalText[i] : this.randomChar();
        }
        updateFn(result);

        if (resolvedCount < length) {
          frameId = requestAnimationFrame(update);
          this.frameIds.add(frameId);
        } else {
          updateFn(originalText);
          resolve();
        }
      };

      frameId = requestAnimationFrame(update);
      this.frameIds.add(frameId);
    });
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.timeouts.delete(timeout);
        resolve();
      }, ms);
      this.timeouts.add(timeout);
    });
  }

  destroy(): void {
    this.destroyed = true;
    this.frameIds.forEach((id) => cancelAnimationFrame(id));
    this.frameIds.clear();
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts.clear();
  }

  private randomChar(): string {
    return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
  }
}
