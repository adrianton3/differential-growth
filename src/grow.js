(() => {
	'use strict'

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

	function main () {
		Draw.init(document.getElementById('can'))
		Draw.clearColor('hsl(0, 0%, 1%)')

		Draw.translate(halfWidth, halfWidth)

		const bufferTargetSize = 16
		const buffer = []

		const worker = new Worker('./src/worker/worker.js')

		worker.addEventListener('message', ({ data: { type, payload } }) => {
			if (type === 'set-frame') {
				buffer.push(payload)
			}
		})

		worker.postMessage({ type: 'set-config', payload: config })
		worker.postMessage({ type: 'get-frame' })

		function draw (positions) {
			Draw.clear()

			Draw.lineColor('hsl(0, 100%, 100%)')
			Draw.lineWidth(17)
			Draw.path(positions)

			Draw.lineColor('hsl(210, 100%, 50%)')
			Draw.lineWidth(11)
			Draw.path(positions)
		}

		function run () {
			for (let i = buffer.length; i < bufferTargetSize; i++) {
				worker.postMessage({ type: 'get-frame' })
			}

			if (buffer.length > 0) {
				const positions = buffer.shift()
				draw(positions)
			}

			requestAnimationFrame(run)
		}

		run()
	}

	main()
})()