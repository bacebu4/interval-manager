'use strict';

const { mock, describe, beforeEach, afterEach, it } = require('node:test');
const assert = require('assert');
const { IntervalManager } = require('../index.js');
const { setTimeout } = require('timers/promises');

describe('IndexTest', () => {
  /** @type {IntervalManager} */
  let intervalManager;

  beforeEach(() => {
    intervalManager = new IntervalManager({ timeoutMs: 1_000 });
  });

  afterEach(async () => {
    await intervalManager.close().catch(() => {});
  });

  it('calls passed callback', async () => {
    const mockFn = mock.fn();
    intervalManager.add(() => mockFn(), 0);

    await setTimeout();

    assert.strictEqual(mockFn.mock.callCount(), 1);
  });

  it('when calling `.close()` it waits for all intervals to finish', async () => {
    const mockFn1 = mock.fn(async () => {
      await setTimeout(300);
    });
    const mockFn2 = mock.fn(async () => {
      await setTimeout(200);
    });
    intervalManager.add(() => mockFn1(), 100);
    intervalManager.add(() => mockFn2(), 100);

    await setTimeout(105);

    await intervalManager.close();

    assert.notStrictEqual(mockFn1.mock.callCount(), 0);
    assert.notStrictEqual(mockFn2.mock.callCount(), 0);
  });

  it('can reach timeout when closing', async () => {
    const mockFn = mock.fn(async () => {
      await setTimeout(2_000);
    });
    intervalManager.add(() => mockFn(), 100);

    await setTimeout(105);

    const error = await intervalManager.close().catch(e => e);

    assert(error instanceof Error);
  });
});
