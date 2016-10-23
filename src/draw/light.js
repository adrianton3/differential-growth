(() => {
	'use strict'

	function make () {
		const source = `
			precision mediump float;

			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;

			void main () {
				vec4 color = texture2D(uSampler, vTextureCoord);

				float current = color.a;

				const vec2 step = vec2(1.0, 0.0) / 256.0;
				float up = texture2D(uSampler, vTextureCoord - step.yx).a;
				float left = texture2D(uSampler, vTextureCoord - step).a;
				float down = texture2D(uSampler, vTextureCoord + step.yx).a;
				float right = texture2D(uSampler, vTextureCoord + step).a;

				float deltaNeighbors = 1.0 + (4.0 * current) - up - left - down - right;
				float ao = pow(smoothstep(0.2, 1.0, deltaNeighbors), 2.0) * smoothstep(0.5, 1.0, current);

				gl_FragColor = vec4(color.rgb * ao, 1.0);
			}
		`

		return new PIXI.Filter(PIXI.Filter.defaultVertexSrc, source)
	}

	define('Light', {
		make,
	})
})()