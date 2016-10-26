(() => {
	'use strict'

	const {
		applyInertia,
		applyOverlapping,
		applySprings,
		applyAngles,
		applyVelocity,
		applyLimits,
		computeExit,
	} = Joint

	const { clone, add, sub, scale, isNull, distance } = Vec2

	const halfWidth = 768 / 2

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

		joint1.sleeping = false
		joint2.sleeping = false

		joints.splice(index + 1, 0, newJoint)

		return index + 1
	}

	function updateParams (joints, tick) {
		for (let i = 0; i < joints.length; i++) {
			const joint = joints[i]

			Joint.updateParams(joint, i, tick)
		}
	}

	function applyInteraction (space, pointer) {
		const translated = sub(clone(pointer), Vec2.make(halfWidth, halfWidth))

		const overlaps = Space.getOverlapping(space, {
			position: {
				x: Math.min(Math.max(translated.x, -halfWidth + 32), halfWidth - 32),
				y: Math.min(Math.max(translated.y, -halfWidth + 32), halfWidth - 32),
			},
			radius: 30,
		})

		for (let i = 0; i < overlaps.length; i++) {
			const overlap = overlaps[i]

			const dist = distance(overlap.position, translated)
			const repulsion = 4 / (dist + 0.1)

			const exit = computeExit({
				position: translated,
				radius: 30,
			}, overlap)
			sub(overlap.velocity, scale(exit, repulsion))
		}
	}

	function advance (config, joints, pointer) {
		const space = Space.make(joints, { resolution: 32, halfWidth })

		applyInteraction(space, pointer)

		for (let i = 0; i < joints.length; i++) {
			const joint = joints[i]

			if (joint.sleeping) {
				joint.sleeping = false
			} else {
				const overlapping = Space.getOverlapping(space, joint)

				applyInertia(config, joint)
				applyOverlapping(config, joint, overlapping)
				applySprings(config, joint)
				applyAngles(config, joint)
				applyVelocity(config, joint)
				applyLimits(config, joint, halfWidth)

				if (isNull(joint.velocity)) {
					joint.sleeping = true
				} else {
					if (joint.left) {
						joint.left.sleeping = false
					}

					if (joint.right) {
						joint.right.sleeping = false
					}
				}
			}
		}
	}

	define('Grow', {
		createJoints,
		multiply,
		advance,
		updateParams,
	})
})()