(() => {
	'use strict'

	importScripts(
		'../define.js',
		'./vec2.js',
		'./space.js',
		'./joint.js',
		'./grow.js'
	)

	const { createJoints, multiply, advance, updateParams } = Grow

	const maxJoints = 2700

	let config = {}

	const joints = createJoints()

	let tick = 0
	let tickIncrement = 0.2

	let pointer = { x: 0, y: 0 }

	self.addEventListener('message', ({ data: { type, payload } }) => {
		if (type === 'get-frame') {
			updateParams(joints, tick)

			advance(config, joints, pointer)

			if (
				joints.length < maxJoints &&
				Math.random() < config.spawnRate
			) {
				const index = multiply(joints)

				if (index < tick) {
					tick += 1
				}
			}

			tick += tickIncrement
			if (tick < 0 || tick > joints.length) {
				tickIncrement *= -1
			}

			const x = new Float32Array(maxJoints)
			const y = new Float32Array(maxJoints)
			const radius = new Float32Array(maxJoints)

			for (let i = 0; i < joints.length; i++) {
				const joint = joints[i]

				x[i] = joint.position.x
				y[i] = joint.position.y
				radius[i] = joint.radius
			}

			self.postMessage({
				type: 'set-frame',
				payload: {
					x: x.buffer,
					y: y.buffer,
					radius: radius.buffer,
					length: joints.length,
				}
			}, [x.buffer, y.buffer, radius.buffer])
		} else if (type === 'set-config') {
			config = payload
		} else if (type === 'set-pointer') {
			pointer = payload
		}
	})
})()