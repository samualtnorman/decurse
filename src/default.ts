import type { LaxPartial } from "@samual/types"
import { OffStack } from "./OffStack"

export type Decurse = {
	pending: (() => void)[]
	active: boolean
	autoPump: boolean
	<T>(callback: () => T | OffStack<T>): OffStack<T>
}

export type DecurseOptions = LaxPartial<{ autoPump: boolean }>

export function makeDecurse({ autoPump = true }: DecurseOptions = {}): Decurse {
	const decurse: Decurse = <T>(callback: () => T | OffStack<T>): OffStack<T> => {
		// @ts-expect-error
		return new OffStack(decurse, resolve => resolve(callback()))
	}

	decurse.pending = []
	decurse.active = false
	decurse.autoPump = autoPump

	return decurse
}
