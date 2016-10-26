(() => {
	'use strict'

	function makeGui (config, onChange) {
		const gui = new dat.GUI
		const dummy = {}

		Object.keys(config).forEach((key) => {
			if (typeof config[key] === 'function') {
				gui.add(config, key)
			} else {
				const { min, max, step } = config[key]
				dummy[key] = (max - min) / 2
				gui.add(dummy, key, min, max, step)
					.onChange(onChange)
			}
		})

		return dummy
	}

	function main () {
		const canvas = document.getElementById('can')
		const { width } = canvas

		const pointer = {
			x: 0.5,
			y: 0.5,
		}

		Draw.init(canvas)

		canvas.addEventListener('mousemove', (event) => {
			pointer.x = event.offsetX / width
			pointer.y = event.offsetY / width

			worker.postMessage({
				type: 'set-pointer',
				payload: { x: event.offsetX, y: event.offsetY },
			})
		})

		const bufferTargetSize = 4
		const buffer = []

		const worker = new Worker('./src/worker/worker.js')

		const config = location.hash ? {
			inertia: 0.25,
			attenuator: 0.03,
			repulsion: 0.07,
			spawnRate: 1.0,
		} : makeGui({
			inertia: {
				min: 0,
				max: 0.5,
			},
			attenuator: {
				min: 0.01,
				max: 0.07,
			},
			repulsion: {
				min: 0.05,
				max: 0.2,
			},
			spawnRate: {
				min: 0.0,
				max: 1.0,
			}
		}, () => {
			worker.postMessage({ type: 'set-config', payload: config })
		})

		worker.addEventListener('message', ({ data: { type, payload } }) => {
			if (type === 'set-frame') {
				const x = new Float32Array(payload.x)
				const y = new Float32Array(payload.y)
				const radius = new Float32Array(payload.radius)

				const expanded = []

				for (let i = 0; i < payload.length; i++) {
					expanded.push({
						x: x[i],
						y: y[i],
						scale: radius[i] / Joint.baseRadius,
					})
				}

				buffer.push(expanded)
			}
		})

		worker.postMessage({ type: 'set-config', payload: config })
		worker.postMessage({ type: 'get-frame' })

		function run () {
			for (let i = buffer.length; i < bufferTargetSize; i++) {
				worker.postMessage({ type: 'get-frame' })
			}

			if (buffer.length > 0) {
				const positions = buffer.shift()
				Draw.path(positions, pointer)
			}

			requestAnimationFrame(run)
		}

		run()
	}

	main()
})()