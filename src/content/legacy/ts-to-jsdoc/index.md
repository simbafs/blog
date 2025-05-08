---
title: Ts to Jsdoc
publishDate: '2023-09-02'
description: ''
tags:
  - js
legacy: true
---

# Ts to Jsdoc

## Generics

https://medium.com/@antonkrinitsyn/jsdoc-generic-types-typescript-db213cf48640

```ts
type List<T> = []T
```

```js
/**
 * @template T
 * @typedef {[]T} List
 */
```

## reducer

```ts
const reducer = (state: number[], action: number) => [...state, action]
```

is equivalent to

```js
const reducer = (
	/** @type {number[]} */ state,
	/** @type {number} */ action
) => [...state, action]
```
