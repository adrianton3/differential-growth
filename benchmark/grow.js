(() => {
	'use strict'

	const { createJoints, multiply, advance } = Grow

	const config = {
		inertia: 0.25,
		attenuator: 0.03,
		meanForce: 0.7,
		repulsion: 0.05,
		spawnRate: 0.5,
	}

	const preHeat = 2
	const runs = 4

	let phonyVar = 0

	function run () {
		const joints = createJoints()

		for (let i = 0; i < 1500; i++) {
			advance(config, joints)
			multiply(joints)
		}

		phonyVar += joints[0].position.x
	}

	for (let i = 0; i < preHeat; i++) {
		run()
	}

	const start = performance.now()

	for (let i = 0; i < runs; i++) {
		run()
	}

	const end = performance.now()

	console.log('phonyVar', phonyVar)
	console.log('time', (end - start) / runs)
})()