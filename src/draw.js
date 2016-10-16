(() => {
	'use strict'

	let renderer, stage, renderTexture, outputSprite, blobContainer, middleContainer
	let blobs = [], middles = []

	function makeFilter () {
		const source = `
			precision mediump float;
			
			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;

			void main () {
				vec4 color = texture2D(uSampler, vTextureCoord);

				float value = color.r;

				if (value < 0.7) {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				} else if (value < 0.9) {
					float smooth = smoothstep(0.8, 0.9, value);
					vec3 from = vec3(0.0);
					vec3 to = vec3(1.0);
					gl_FragColor = vec4(mix(from, to, smooth), 1.0);
				} else {
					float smooth = smoothstep(0.9, 1.0, value);
					vec3 from = vec3(1.0);
					vec3 to = vec3(0.2, 0.6, 1.0);
					gl_FragColor = vec4(mix(from, to, smooth), 1.0);
				}
			}
		`

		return new PIXI.Filter(PIXI.Filter.defaultVertexSrc, source)
	}

	function init (element) {
		const width = element.width
		const halfWidth = width / 2

		renderer = PIXI.autoDetectRenderer(width, width, {
			view: element,
			backgroundColor: 0x000000,
		})

		stage = new PIXI.Container()
		renderTexture = new PIXI.RenderTexture(renderer, renderer.width, renderer.height)

		outputSprite = new PIXI.Sprite(renderTexture)
		outputSprite.position.x = halfWidth
		outputSprite.position.y = halfWidth
		outputSprite.anchor.set(0.5)

		outputSprite.filters = [makeFilter()]

		stage.addChild(outputSprite)

		blobContainer = new PIXI.ParticleContainer(2000, {
			scale: true,
			position: true,
			rotation: false,
			uvs: false,
			alpha: false,
		})

		blobContainer.position.x = halfWidth
		blobContainer.position.y = halfWidth

		middleContainer = new PIXI.ParticleContainer(2000, {
			scale: true,
			position: true,
			rotation: false,
			uvs: false,
			alpha: false,
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

	function path (points) {
		if (points.length < 2) { return }

		for (let i = 0; i < blobs.length; i++) {
			copyPosition(blobs[i], points[i])
		}

		for (let i = 0; i < middles.length; i++) {
			const current = points[i]
			const next = points[i + 1]

			copyPosition(middles[i], {
				x: (current.x + next.x) / 2,
				y: (current.y + next.y) / 2,
				scale: (current.scale + next.scale) / 2,
			})
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

		renderer.render(blobContainer, renderTexture)
		renderer.render(middleContainer, renderTexture, false)

		renderer.render(stage)
	}

	define('Draw', {
		init,
		path,
	})
})()
