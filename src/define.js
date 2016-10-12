(() => {
	'use strict'

	function getGlobal () {
		if (
			typeof WorkerGlobalScope !== 'undefined' &&
			self instanceof WorkerGlobalScope
		) {
			return self
		} else {
			return window
		}
	}

	function define (name, value) {
		const global = getGlobal()

		if (global[name]) {
			console.warn(`Global '${name}' already taken`)
		}

		global[name] = value
	}

	define('define', define)
})()