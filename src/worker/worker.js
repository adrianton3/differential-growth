(() => {
	'use strict'

	importScripts(
		'../define.js',
		'./vec2.js',
		'./space.js',
		'./joint.js',
		'./grow.js'
	)

	const { createJoints, multiply, advance } = Grow

	const maxJoints = 2000

	let config = {}

	const joints = createJoints()

	self.addEventListener('message', ({ data: { type, payload } }) => {
		if (type === 'get-frame') {
			advance(config, joints)

			if (
				joints.length < maxJoints &&
				Math.random() < config.spawnRate
			) {
				multiply(joints)
			}

			const x = new Float32Array(maxJoints)
			const y = new Float32Array(maxJoints)

			for (let i = 0; i < joints.length; i++) {
				const { position } = joints[i]
				x[i] = position.x
				y[i] = position.y
			}

			self.postMessage({
				type: 'set-frame',
				payload: {
					x: x.buffer,
					y: y.buffer,
					length: joints.length,
				}
			}, [x.buffer, y.buffer])
		} else if (type === 'set-config') {
			config = payload
		}
	})
})()