/**
 * @author Fayti1703
 * @license MIT
 * @module
 */

const pending = []
let active = false

/**
 * @author Fayti1703
 * @license MIT
 */
export function pumpLoop() {
	if (active)
		return

	active = true

	try {
		while (pending.length != 0) {
			let el = pending.pop()
			el()
		}
	} finally {
		active = false
	}
}

/**
 * @author Fayti1703
 * @license MIT
 */
export default class OffStack {
	#resolved = false
	#value = undefined
	#dependents = []

	constructor(executor) {
		pending.push(() => this.#run(executor))
		pumpLoop()
	}

	#run(executor) {
		executor(value => this.#resolve(value))
	}

	#resolve(value) {
		if (value instanceof OffStack) {
			value.#dependents.push(v => this.#resolve(v))
			return
		}

		this.#resolved = true
		this.#value = value

		for (const dep of this.#dependents)
			pending.push(() => dep(this.#value))

		pumpLoop()
	}

	then(cb) {
		return new OffStack(y => {
			if (this.#resolved) {
				pending.push(() => y(cb(this.#value)))
			} else {
				this.#dependents.push(v => y(cb(v)))
			}
		})
	}
}
