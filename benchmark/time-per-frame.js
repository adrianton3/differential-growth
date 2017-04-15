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

	let phonyVar = 0
	const pointer = Vec2.make(0, 0)

	// spin up ----------------------------------
	const preHeat = 2

	function runComplete (iterations) {
		const joints = createJoints()

		for (let i = 0; i < iterations; i++) {
			advance(config, joints, pointer)
			multiply(joints)
		}

		phonyVar += joints[0].position.x
	}

	for (let i = 0; i < preHeat; i++) {
		runComplete(1500)
	}

	// measure time per frame -------------------
	function runAt (iterations) {
		const joints = createJoints()

		for (let i = 0; i < iterations; i++) {
			advance(config, joints, pointer)
			multiply(joints)
		}


		const runs = 10

		const start = performance.now()

		for (let i = 0; i < runs; i++) {
			advance(config, joints, pointer)
		}

		const end = performance.now()


		phonyVar += joints[0].position.x

		return (end - start) / runs
	}


	for (let iterations = 100; iterations <= 3000; iterations += 100) {
		const time = runAt(iterations)

		console.log('iterations', iterations, 'time', time)
	}

	console.log('phonyVar', phonyVar)
})()