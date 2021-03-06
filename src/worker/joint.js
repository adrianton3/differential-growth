(() => {
	'use strict'

	const { clone, add, sub, scale, distance } = Vec2

	const baseRadius = 14
	const baseMeanForce = 0.2

	function make (x, y) {
		return {
			position: Vec2.make(x, y),
			velocity: Vec2.make(0, 0),
			radius: baseRadius,
			meanForce: baseMeanForce,
			left: null,
			right: null,
			sleeping: false,
		}
	}

	function computeExit (fixed, mobile) {
		const dist = distance(fixed.position, mobile.position)
		const optimalDist = fixed.radius + mobile.radius
		const ratio = (optimalDist - dist) / optimalDist
		return scale(
			sub(
				clone(fixed.position),
				mobile.position
			),
			ratio
		)
	}

	function applyInertia (config, { velocity }) {
		scale(velocity, config.inertia)
	}

	function applyVelocity (config, { position, velocity }) {
		add(position, velocity)
	}

	function applyOverlapping (config, mobile, overlapping) {
		for (let i = 0; i < overlapping.length; i++) {
			const fixed = overlapping[i]

			const exit = computeExit(fixed, mobile)
			sub(mobile.velocity, scale(exit, config.repulsion))
		}
	}

	function applySprings (config, joint) {
		const { velocity, left, right } = joint

		if (left !== null) {
			const exit = computeExit(left, joint)
			sub(velocity, scale(exit, config.attenuator))
		}

		if (right !== null) {
			const exit = computeExit(right, joint)
			sub(velocity, scale(exit, config.attenuator))
		}
	}

	function applyLimits (config, { position }, halfWidth) {
		position.x = Math.min(Math.max(-halfWidth + 32, position.x), halfWidth - 32)
		position.y = Math.min(Math.max(-halfWidth + 32, position.y), halfWidth - 32)
	}

	function applyAngles (config, { position, velocity, meanForce, left, right }) {
		if (
			left === null ||
			right === null
		) {
			return
		}

		const neighborDist = distance(left.position, right.position)

		if (neighborDist > 0) {
			const mean = scale(
				add(clone(left.position), right.position),
				0.5
			)

			add(
				velocity,
				scale(sub(mean, position), meanForce)
			)
		}
	}

	function updateParams (joint, index, tick) {
		const d = (index - tick) * 0.2
		const fraction = 1 / (1 + d * d)

		joint.radius = baseRadius + fraction * 5
		joint.meanForce = baseMeanForce + fraction * 0.78
	}

	define('Joint', {
		baseRadius,
		make,
		applyInertia,
		applyVelocity,
		applyOverlapping,
		applySprings,
		applyLimits,
		applyAngles,
		updateParams,
		computeExit,
	})
})()