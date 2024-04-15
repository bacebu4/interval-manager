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

## IntervalManager

- [IntervalManager](#IntervalManager)
  - [new IntervalManager(options)](#new_IntervalManager_new)
  - [.add(callback, [ms])](#IntervalManager+add)
  - [.close()](#IntervalManager+close) ⇒ <code>Promise.&lt;undefined&gt;</code>

### new IntervalManager(options)

| Param               | Type                | Description                                                  |
| ------------------- | ------------------- | ------------------------------------------------------------ |
| options             | <code>Object</code> |                                                              |
| [options.timeoutMs] | <code>number</code> | Timeout for `.close()` method. Default value is `60_000` ms. |

### intervalManager.add(callback, [ms])

**Kind**: instance method of [<code>IntervalManager</code>](#IntervalManager)

| Param    | Type                  | Description                                                                                                                                                                                                                                                                                                                                                   |
| -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| callback | <code>function</code> |                                                                                                                                                                                                                                                                                                                                                               |
| [ms]     | <code>number</code>   | Schedules and registers repeated execution of `callback` every `ms` milliseconds. When delay is larger than 2147483647 or less than 1, the delay will be set to 1. Non-integer delays are truncated to an integer. If callback is not a function, a TypeError will be thrown. If the Interval Manager is in the closing state then doesn't schedule anything. |

### intervalManager.close() ⇒ <code>Promise.&lt;undefined&gt;</code>

Switcher Interval Manager to closing state and clears all registered intervals.

Returns a promise which will resolve as soon as all interval's callbacks will be executed. Supposed to be called in graceful shutdown handler.

Will reject the promise if timeout is reached.

**Kind**: instance method of [<code>IntervalManager</code>](#IntervalManager)  
**Throws**:

- <code>Error</code>
