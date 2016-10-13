(() => {
	'use strict'

	function make(x, y) {
		return { x, y }
	}

	function clone({ x, y }) {
		return make(x, y)
	}

	function add(v, { x, y }) {
		v.x += x
		v.y += y

		return v
	}

	function sub(v, { x, y }) {
		v.x -= x
		v.y -= y

		return v
	}

	function scale(v, factor) {
		v.x *= factor
		v.y *= factor

		return v
	}

	function length({ x, y }) {
		return Math.sqrt(x * x + y * y)
	}

	function distance(v1, v2) {
		const dx = v1.x - v2.x
		const dy = v1.y - v2.y

		return Math.sqrt(dx * dx + dy * dy)
	}

	const THRESHOLD = 0.1

	function isNull({ x, y }) {
		return -THRESHOLD < x && x < THRESHOLD &&
			-THRESHOLD < y && y < THRESHOLD
	}

	define('Vec2', {
		make,
		clone,
		add,
		sub,
		scale,
		length,
		distance,
		isNull,
	})
})()