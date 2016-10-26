(() => {
	'use strict'

	function make () {
		const source = `
			precision mediump float;

			varying vec2 vTextureCoord;
			uniform sampler2D uSampler;
			uniform mat3 mappedMatrix;
			uniform vec2 pointerPos;

			void main () {
				vec2 textureCoord = (vec3(vTextureCoord, 1.0) * mappedMatrix).xy;
				vec4 color = texture2D(uSampler, vTextureCoord);
				const float heightMultiplier = 2.0;

				float current = color.a;

				const vec2 step = vec2(1.0, 0.0) / 192.0;
				float up = texture2D(uSampler, vTextureCoord - step.yx).a;
				float left = texture2D(uSampler, vTextureCoord - step).a;
				float down = texture2D(uSampler, vTextureCoord + step.yx).a;
				float right = texture2D(uSampler, vTextureCoord + step).a;

				float deltaNeighbors = 1.0 + (4.0 * current) - up - left - down - right;
				float ao = pow(smoothstep(0.2, 1.0, deltaNeighbors), 2.0) * smoothstep(0.5, 1.0, current);

				vec3 deltaX = normalize(vec3(2.0, 0.0, (right - left) * heightMultiplier));
				vec3 deltaY = normalize(vec3(0.0, 2.0, (down - up) * heightMultiplier));
				vec3 normal = normalize(cross(deltaX, deltaY));

				const vec2 center = vec2(0.5, 0.5);
				vec3 light = vec3(mix(pointerPos, center, 0.5), heightMultiplier * 1.1);

				vec3 fragment = vec3(textureCoord, current * heightMultiplier);
				float diffuse = max(0.0, dot(normal, normalize(light - fragment)));

				float specular = pow(diffuse, 20.0);

				float vig = 1.0 - smoothstep(0.0, 0.9, distance(textureCoord, center));

				gl_FragColor = vec4(color.rgb * (diffuse * 0.8 + specular) * ao * vig, 1.0);
			}
		`

		const uniforms = {
			pointerPos: {
				type: 'f2',
				value: [0.5, 0.5],
			},
			mappedMatrix: {
				type: 'mat3',
				value: new PIXI.Matrix(),
			},
		}

		const filter = new PIXI.Filter(PIXI.Filter.defaultVertexSrc, source, uniforms)

		filter.apply = function (filterManager, input, output, clear) {
			this.uniforms.mappedMatrix = filterManager.calculateNormalizedScreenSpaceMatrix(this.uniforms.mappedMatrix)
			PIXI.Filter.prototype.apply.call(this, filterManager, input, output, clear)
		}

		return filter
	}

	define('Light', {
		make,
	})
})()