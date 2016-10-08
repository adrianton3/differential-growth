(() => {
	'use strict'

	let canvas, con2d
	let clearStyle = 'hsl(0, 0%, 0%)'

	function init (element) {
		canvas = element
		con2d = canvas.getContext('2d')
		con2d.lineCap = 'round'
		con2d.lineJoin = 'round'
	}

	function clear () {
		const { fillStyle } = con2d
		con2d.fillStyle = clearStyle
		con2d.save()
		con2d.setTransform(1, 0, 0, 1, 0, 0)
		con2d.fillRect(0, 0, canvas.width, canvas.height)
		con2d.restore()
		con2d.fillStyle = fillStyle
	}

	function path (points) {
		if (points.length < 2) { return }

		con2d.beginPath()

		for (let i = 0; i < points.length - 1; i++) {
			const current = points[i]
			const next = points[i + 1]

			con2d.moveTo(current.x, current.y)
			con2d.lineTo(next.x, next.y)
		}

		con2d.stroke()
	}

	function clearColor (color) {
		clearStyle = color
	}

	function lineColor (color) {
		con2d.strokeStyle = color
	}

	function lineWidth (lineWidth) {
		con2d.lineWidth = lineWidth
	}

	function translate (x, y) {
		con2d.translate(x, y)
	}

	function save () {
		con2d.save()
	}

	function restore () {
		con2d.restore()
	}

	window.Draw = window.Draw || {}
	Object.assign(window.Draw, {
		init,
		clear,
		path,
		clearColor,
		lineColor,
		lineWidth,
		translate,
		save,
		restore,
	})
})()
