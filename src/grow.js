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

		let positions = []
		let updated = false

		const worker = new Worker('./src/worker/worker.js')

		worker.addEventListener('message', ({ data: { type, payload } }) => {
			if (type === 'set-frame') {
				positions = payload
				updated = true
			}
		})

		worker.postMessage({ type: 'set-config', payload: config })
		worker.postMessage({ type: 'get-frame' })

		function draw () {
			Draw.clear()

			Draw.lineColor('hsl(0, 100%, 100%)')
			Draw.lineWidth(17)
			Draw.path(positions)

			Draw.lineColor('hsl(210, 100%, 50%)')
			Draw.lineWidth(11)
			Draw.path(positions)
		}

		function run () {
			if (updated) {
				worker.postMessage({ type: 'get-frame' })
				updated = false
				draw()
			}

			requestAnimationFrame(run)
		}

		run()
	}

	main()
})()