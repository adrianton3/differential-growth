(() => {
	'use strict'

	let renderer, stage, renderTexture, outputSprite, blobContainer, middleContainer
	let blobs = [], middles = []
	let filter

	function init (element) {
		const width = element.width
		const halfWidth = width / 2

		filter = Light.make()

		renderer = PIXI.autoDetectRenderer(width, width, {
			view: element,
			backgroundColor: 0x000000,
		})

		stage = new PIXI.Container()
		renderTexture = PIXI.RenderTexture.create(width, width)

		outputSprite = new PIXI.Sprite(renderTexture)
		outputSprite.position.x = halfWidth
		outputSprite.position.y = halfWidth
		outputSprite.anchor.set(0.5)

		outputSprite.filters = [filter]

		stage.addChild(outputSprite)

		blobContainer = new PIXI.particles.ParticleContainer(2700, {
			scale: true,
			position: true,
			rotation: false,
			uvs: false,
			alpha: true,
		})

		blobContainer.position.x = halfWidth
		blobContainer.position.y = halfWidth

		middleContainer = new PIXI.particles.ParticleContainer(2700, {
			scale: true,
			position: true,
			rotation: false,
			uvs: false,
			alpha: true,
		})

		middleContainer.position.x = halfWidth
		middleContainer.position.y = halfWidth
	}

	function copyPosition (sprite, { x, y, scale }) {
		sprite.position.x = x
		sprite.position.y = y
		sprite.scale.x = scale
		sprite.scale.y = scale
	}

	function addSprite (point, container, list) {
		const sprite = PIXI.Sprite.fromImage('./res/blob.png')
		sprite.anchor.set(0.5)
		sprite.blendMode = PIXI.BLEND_MODES.ADD
		copyPosition(sprite, point)

		container.addChild(sprite)
		list.push(sprite)
	}

	function path (points, pointer) {
		if (points.length < 2) { return }

		for (let i = 0; i < blobs.length; i++) {
			copyPosition(blobs[i], points[i])

			blobs[i].alpha = Math.min(Math.max(0.0, Math.sin(i * 0.1) + 0.9), 1.0)
		}

		for (let i = 0; i < middles.length; i++) {
			const current = points[i]
			const next = points[i + 1]

			copyPosition(middles[i], {
				x: (current.x + next.x) / 2,
				y: (current.y + next.y) / 2,
				scale: (current.scale + next.scale) / 2,
			})

			middles[i].alpha = Math.min(Math.max(0.0, Math.sin(i * 0.1) + 0.9), 1.0)
		}

		for (let i = blobs.length; i < points.length; i++) {
			addSprite(points[i], blobContainer, blobs)
		}

		for (let i = middles.length; i < points.length - 1; i++) {
			const current = points[i]
			const next = points[i + 1]

			addSprite({
				x: (current.x + next.x) / 2,
				y: (current.y + next.y) / 2,
				scale: (current.scale + next.scale) / 2,
			}, middleContainer, middles)
		}

		const { pointerPos } = filter.uniforms

		pointerPos[0] = pointer.x
		pointerPos[1] = pointer.y

		renderer.render(blobContainer, renderTexture)
		renderer.render(middleContainer, renderTexture, false)

		renderer.render(stage)
	}

	define('Draw', {
		init,
		path,
	})
})()
