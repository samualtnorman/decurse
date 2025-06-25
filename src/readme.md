# Decurse
An abstraction over continuation-passing and trampolining to write recursive functions that don't exceed the maximum call stack size.

## Example
```js
import { makeDecurse } from "{PACKAGE_NAME}"

const decurse = makeDecurse()

const factorial = (/** @type {bigint} */ n) => decurse(() => n
	? factorial(n - 1n).then(result => result * n)
	: 1n
)

factorial(100_000n).then(value => console.log(value))
```
