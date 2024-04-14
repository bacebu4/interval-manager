'use strict';

class IntervalManager {
  /**
   * @param {Object} options
   * @param {number=} options.timeoutMs Timeout for `.close()` method. Default value is `60_000` ms.
   */
  constructor({ timeoutMs = 60_000 } = {}) {
    /**
     * @private
     * @type {NodeJS.Timeout[]}
     */
    this.intervals = [];
    /** @private */
    this.runningCount = new Counter();
    /**
     * @private
     * @type {Promise<undefined> | undefined}
     */
    this.closingPromise = undefined;
    /** @private */
    this.timeoutMs = timeoutMs;
  }

  /**
   * @param {() => Promise<unknown> | unknown} callback
   * @param {number=} ms
   *
   * Schedules and registers repeated execution of `callback` every `ms` milliseconds.
   *
   * When delay is larger than 2147483647 or less than 1, the delay will be set to 1. Non-integer delays are truncated to an integer.
   *
   * If callback is not a function, a TypeError will be thrown.
   *
   * If the Interval Manager is in the closing state then doesn't schedule anything.
   */
  add(callback, ms) {
    if (this.closingPromise) {
      return;
    }

    const interval = setInterval(async () => {
      this.runningCount.increase();
      try {
        await callback();
      } finally {
        this.runningCount.decrease();
      }
    }, ms);

    this.intervals.push(interval);
  }

  /**
   * @returns {Promise<undefined>}
   * @throws {Error}
   *
   * Switcher Interval Manager to closing state and clears all registered intervals.
   *
   * Returns a promise which will resolve as soon as all interval's callbacks will be executed. Supposed to be called in graceful shutdown handler.
   *
   * Will reject the promise if timeout is reached.
   */
  close() {
    if (this.closingPromise) {
      return this.closingPromise;
    }

    this.intervals.forEach(i => clearInterval(i));

    this.closingPromise = new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout reached'));
      }, this.timeoutMs);

      this.runningCount.onValueEqualsZero(() => {
        clearInterval(timeout);
        resolve(undefined);
      });
    });

    return this.closingPromise;
  }
}

const noop = () => {};

class Counter {
  constructor() {
    this.value = 0;
    this.onValueEqualsZeroCb = noop;
  }

  increase() {
    this.value += 1;
  }

  decrease() {
    this.value -= 1;
    this.tryOnValueEqualsZero();
  }

  /**
   * @param {() => void} cb
   */
  onValueEqualsZero(cb) {
    this.onValueEqualsZeroCb = cb;
    this.tryOnValueEqualsZero();
  }

  /**
   * @private
   */
  tryOnValueEqualsZero() {
    if (this.value === 0) {
      this.onValueEqualsZeroCb();
    }
  }
}

module.exports = { IntervalManager };
