(() => {
	'use strict'

	const {
		applyInertia,
		applyOverlapping,
		applySprings,
		applyAngles,
		applyVelocity,
		applyLimits,
	} = Joint

	const { clone, add, sub, scale } = Vec2

	const halfWidth = 512 / 2

	function makeGui (config) {
		const gui = new dat.GUI
		const dummy = {}

		Object.keys(config).forEach((key) => {
			if (typeof config[key] === 'function') {
				gui.add(config, key)
			} else {
				const { min, max, step } = config[key]
				dummy[key] = (max - min) / 2
				gui.add(dummy, key, min, max, step)
			}
		})

		return dummy
	}

	const config = makeGui({
		inertia: {
			min: 0,
			max: 0.5,
		},
		attenuator: {
			min: 0.01,
			max: 0.07,
		},
		meanForce: {
			min: 0.0,
			max: 0.95,
		},
		repulsion: {
			min: 0.01,
			max: 0.2,
		},
		spawnRate: {
			min: 0.0,
			max: 1.0,
		}
	})

	function ran (min, max) {
		return Math.random() * (max - min) + min
	}

	function createJoints () {
		const ranStart = () => ran(-16, 16)

		const joint1 = Joint.make(ranStart(), ranStart())
		const joint2 = Joint.make(ranStart(), ranStart())

		joint1.right = joint1
		joint2.left = joint2

		return [joint1, joint2]
	}

	function multiply (joints) {
		const index = Math.floor(ran(0, joints.length - 1))
		const joint1 = joints[index]
		const joint2 = joints[index + 1]

		const position = scale(add(clone(joint1.position), joint2.position), 0.5)
		const delta = sub(clone(joint1.position), joint2.position)
		add(position, Vec2.make(
			delta.x * ran(-0.1, 0.1),
			delta.y * ran(-0.1, 0.1)
		))

		const newJoint = Joint.make(position.x, position.y)

		newJoint.left = joint1
		newJoint.right = joint2

		joint1.right = newJoint
		joint2.left = newJoint

		joints.splice(index + 1, 0, newJoint)
	}

	function advance (joints) {
		const space = Space.make(joints, { resolution: 32, halfWidth })

		joints.forEach((joint) => {
			const overlapping = Space.getOverlapping(space, joint)

			applyInertia(config, joint)
			applyOverlapping(config, joint, overlapping)
			applySprings(config, joint)
			applyAngles(config, joint)
			applyVelocity(config, joint)
			applyLimits(config, joint, halfWidth)
		})
	}

	function main () {
		Draw.init(document.getElementById('can'))
		Draw.clearColor('hsl(0, 0%, 1%)')

		const joints = createJoints()

		Draw.translate(halfWidth, halfWidth)

		function run () {
			advance(joints)

			if (Math.random() < config.spawnRate) {
				multiply(joints)
			}

			const positions = joints.map(({ position }) => position)

			Draw.clear()

			Draw.lineColor('hsl(0, 100%, 100%)')
			Draw.lineWidth(17)
			Draw.path(positions)

			Draw.lineColor('hsl(210, 100%, 50%)')
			Draw.lineWidth(11)
			Draw.path(positions)

			requestAnimationFrame(run)
		}

		run()
	}

	main()
})()