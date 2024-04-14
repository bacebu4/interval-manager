[![npm version](https://img.shields.io/npm/v/interval-manager)](https://www.npmjs.com/package/interval-manager)
![tests](https://github.com/bacebu4/interval-manager/actions/workflows/test.yaml/badge.svg?branch=master)
[![codecov](https://codecov.io/gh/bacebu4/interval-manager/graph/badge.svg?token=JW6GTZWBSY)](https://codecov.io/gh/bacebu4/interval-manager)

# Interval Manager

Lightweight API for `setInterval` jobs with handling graceful shutdown.

## Installation

```bash
npm i interval-manager
```

## Usage

```js
import { IntervalManager } from 'interval-manager';

const intervalManager = new IntervalManager();

// add custom interval
intervalManager.add(() => {
  console.log('Called every second');
}, 1_000);

// somewhere in graceful shutdown handler
// returns a promise which will resolve when no jobs will be running
await intervalManager.close();
```

## API

### `IntervalManager.prototype.constructor({ timeoutMs })`

- `timeoutMs` - Timeout for `.close()` method. Default value is `60_000` ms.

### `IntervalManager.prototype.add(callback, [ms])`

Schedules and registers repeated execution of `callback` every `ms` milliseconds.

When delay is larger than 2147483647 or less than 1, the delay will be set to 1. Non-integer delays are truncated to an integer.

If callback is not a function, a TypeError will be thrown.

If the Interval Manager is in the closing state then doesn't schedule anything.

### `IntervalManager.prototype.close()`

Switcher Interval Manager to closing state and clears all registered intervals.

Returns a promise which will resolve as soon as all interval's callbacks will be executed. Supposed to be called in graceful shutdown handler.

Will reject the promise if timeout is reached.
