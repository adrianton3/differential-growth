(() => {
	'use strict'

	let renderer, stage, renderTexture, outputSprite, blobContainer
	let blobs = []

	function makeFilter () {
		const source = `
			precision mediump float;
			
			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;

			void main () {
				vec4 color = texture2D(uSampler, vTextureCoord);

				float value = color.r;

				if (value < 0.6) {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				} else if (value < 0.8) {
					gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
				} else {
					gl_FragColor = vec4(0.2, 0.5, 1.0, 1.0);
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

		blobContainer = new PIXI.ParticleContainer(4000, {
			scale: false,
			position: false,
			roation: false,
			uvs: false,
			alpha: false,
		})

		blobContainer.position.x = halfWidth
		blobContainer.position.y = halfWidth
	}

	function path (points) {
		if (points.length < 2) { return }

		for (let i = 0; i < blobs.length; i++) {
			const point = points[i]
			const blob = blobs[i]

			blob.position.x = point.x
			blob.position.y = point.y
		}

		for (let i = blobs.length; i < points.length; i++) {
			const point = points[i]

			const blob = PIXI.Sprite.fromImage('./res/blob.png')
			blob.blendMode = PIXI.BLEND_MODES.ADD
			blob.position.x = point.x
			blob.position.y = point.y

			blobContainer.addChild(blob)
			blobs.push(blob)
		}

		renderer.render(blobContainer, renderTexture)

		renderer.render(stage)
	}

	window.Draw = window.Draw || {}
	Object.assign(window.Draw, {
		init,
		path,
	})
})()
