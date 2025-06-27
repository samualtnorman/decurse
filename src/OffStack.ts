/**
 * @author Fayti1703
 * @license MIT
 * @module
 */
import type { Decurse } from "./default"

export function pump(decurse: Decurse): void {
	if (decurse.active)
		return

	decurse.active = true

	try {
		if (decurse.pending.length)
			decurse.pending.pop()!()
	} finally {
		decurse.active = false
	}
}

/**
 * @author Fayti1703
 * @license MIT
 */
export function pumpAll(decurse: Decurse): void {
	if (decurse.active)
		return

	decurse.active = true

	try {
		while (decurse.pending.length)
			decurse.pending.pop()!()
	} finally {
		decurse.active = false
	}
}

/**
 * @author Fayti1703
 * @license MIT
 */
export class OffStack<T> {
	#resolved = false
	#value: T | undefined = undefined
	#dependents: ((value: T) => void)[] = []
	#decurse: Decurse

	private constructor(decurse: Decurse, executor: (resolve: (value: T | OffStack<T>) => void) => void) {
		this.#decurse = decurse
		decurse.pending.push(() => executor(value => this.#resolve(value)))

		if (decurse.autoPump)
			pumpAll(decurse)
	}

	#resolve(value: T | OffStack<T>): void {
		if (this.#resolved)
			return

		if (value instanceof OffStack) {
			if (value.#resolved) {
				value = value.#value!
			} else {
				value.#dependents.push(value => this.#resolve(value))
				return
			}
		}

		this.#resolved = true
		this.#value = value

		for (const dependent of this.#dependents)
			this.#decurse.pending.push(() => dependent(this.#value!))

		if (this.#decurse.autoPump)
			pumpAll(this.#decurse)
	}

	then<U>(callback: (result: T) => U | OffStack<U>): OffStack<U> {
		return new OffStack<U>(this.#decurse, resolve => {
			if (this.#resolved)
				this.#decurse.pending.push(() => resolve(callback(this.#value!)))
			else
				this.#dependents.push(value => resolve(callback(value)))
		})
	}
}
