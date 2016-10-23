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

				vec3 deltaX = normalize(vec3(2.0, 0.0, right - left));
				vec3 deltaY = normalize(vec3(0.0, 2.0, down - up));
				vec3 normal = normalize(cross(deltaX, deltaY));

				// for whatever reason vTextureCoord goes up to 0.5 only
				const vec2 center = vec2(0.25, 0.25);
				const vec3 light = vec3(center, 1.3);

				vec3 fragment = vec3(vTextureCoord, current);
				float diffuse = max(0.0, dot(normal, normalize(light - fragment)));

				float specular = pow(diffuse, 20.0);

				gl_FragColor = vec4(color.rgb * (diffuse * 0.8 + specular) * ao, 1.0);
			}
		`

		return new PIXI.Filter(PIXI.Filter.defaultVertexSrc, source)
	}

	define('Light', {
		make,
	})
})()