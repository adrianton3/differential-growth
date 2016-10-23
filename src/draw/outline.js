(() => {
	'use strict'

	function make () {
		const source = `
			precision mediump float;

			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;

			void main () {
				vec4 color = texture2D(uSampler, vTextureCoord);

				float value = color.a;

				if (value < 0.7) {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				} else if (value < 0.9) {
					float smooth = smoothstep(0.8, 0.9, value);
					const vec3 from = vec3(0.0);
					const vec3 to = vec3(1.0);
					gl_FragColor = vec4(mix(from, to, smooth), 1.0);
				} else {
					float smooth = smoothstep(0.9, 1.0, value);
					const vec3 from = vec3(1.0);
					vec3 to = color.rgb;
					gl_FragColor = vec4(mix(from, to, smooth), 1.0);
				}
			}
		`

		return new PIXI.Filter(PIXI.Filter.defaultVertexSrc, source)
	}

	define('Outline', {
		make,
	})
})()