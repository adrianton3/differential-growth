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

	let config = {}

	const joints = createJoints()

	self.addEventListener('message', ({ data: { type, payload } }) => {
		if (type === 'get-frame') {
			advance(config, joints)

			if (Math.random() < config.spawnRate) {
				multiply(joints)
			}

			const positions = joints.map(({ position }) => position)

			self.postMessage({
				type: 'set-frame',
				payload: positions
			})
		} else if (type === 'set-config') {
			config = payload
		}
	})
})()