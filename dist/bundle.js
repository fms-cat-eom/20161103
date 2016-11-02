(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/compu.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _step = require('./step');

var _step2 = _interopRequireDefault(_step);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

var width = canvas.width = 320;
var height = canvas.height = 240;

// ------

var gradientBg = context.createLinearGradient(0, 0, 0, 240);
gradientBg.addColorStop(0, 'rgb( 50, 80, 100 )');
gradientBg.addColorStop(1, 'rgb( 120, 50, 80 )');

var gradientFg = context.createLinearGradient(0, 0, 0, 240);
gradientFg.addColorStop(0, 'rgb( 240, 60, 40 )');
gradientFg.addColorStop(1, 'rgb( 200, 170, 20 )');

// ------

var imageComputer = new Image();
var imageEarth = new Image();
var imagePalm = new Image();
var imageCursor = new Image();
var imageCD = new Image();

// ------

var prepare = function prepare(_callback) {
  (0, _step2.default)({
    0: function _(done) {
      imageComputer.onload = done;
      imageComputer.src = 'images/computer.png';

      imageEarth.onload = done;
      imageEarth.src = 'images/earth.png';

      imagePalm.onload = done;
      imagePalm.src = 'images/palm.png';

      imageCursor.onload = done;
      imageCursor.src = 'images/cursor.png';

      imageCD.onload = done;
      imageCD.src = 'images/cd.png';
    },

    5: function _(done) {
      _callback();
    }
  });
};

// ------

var update = function update(_time) {
  context.fillStyle = gradientBg;
  context.fillRect(0, 0, width, height);

  // ------

  context.save();
  context.translate(100 - 5, 40 - 5);
  context.rotate(0.1 + 0.2 * Math.sin(_time * Math.PI * 4.0 - 0.5));

  context.drawImage(imageComputer, -40, -40, 80, 80);

  context.restore();

  // ------

  context.save();
  context.translate(260, 60);
  context.rotate(-0.3 - _time * Math.PI * 4.0);

  context.drawImage(imageCD, -50, -50, 100, 100);

  context.restore();

  // ------

  context.save();
  context.translate(50, 160);
  context.rotate(_time * Math.PI * 2.0);

  context.drawImage(imageEarth, -50, -50, 100, 100);

  context.restore();

  context.save();
  context.translate(30, 160);

  context.drawImage(imageCursor, 0, 0, 80.0, 80.0);

  context.restore();

  // ------

  context.save();
  context.translate(160, 130);
  context.rotate(0.1 + 0.1 * Math.sin(_time * Math.PI * 4.0));

  context.fillStyle = '#000000';
  context.fillRect(-40, -40, 90, 90);

  context.fillStyle = gradientFg;
  context.fillRect(-50, -50, 90, 90);

  context.restore();

  context.save();
  context.translate(210, 240);
  context.rotate(0.3 * Math.sin(_time * Math.PI * 2.0));

  context.drawImage(imagePalm, -60, -100, 120, 120);

  context.restore();

  // ------

  context.fillStyle = '#000000';
  context.font = 'bold 80px "HGP教科書体"';
  context.fillText('美学', 84, 164);

  context.fillStyle = '#6600ff';
  context.font = 'bold 80px "HGP教科書体"';
  context.fillText('美学', 80, 160);
};

// ------

exports.default = {
  prepare: prepare,
  canvas: canvas,
  update: update
};

},{"./step":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/step.js"}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/glcat.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

var GLCat = function () {
	function GLCat(_gl) {
		_classCallCheck(this, GLCat);

		var it = this;

		it.gl = _gl;
		var gl = it.gl;

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.getExtension('OES_texture_float');
		gl.getExtension('OES_float_linear');
		gl.getExtension('OES_half_float_linear');

		it.extDrawBuffers = gl.getExtension('WEBGL_draw_buffers');

		it.currentProgram = null;
	}

	_createClass(GLCat, [{
		key: 'createProgram',
		value: function createProgram(_vert, _frag, _onError) {

			var it = this;
			var gl = it.gl;

			var error = void 0;
			if (typeof _onError === 'function') {
				error = _onError;
			} else {
				error = function error(_str) {
					console.error(_str);
				};
			}

			var vert = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vert, _vert);
			gl.compileShader(vert);
			if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
				error(gl.getShaderInfoLog(vert));
				return null;
			}

			var frag = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(frag, _frag);
			gl.compileShader(frag);
			if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
				error(gl.getShaderInfoLog(frag));
				return null;
			}

			var program = gl.createProgram();
			gl.attachShader(program, vert);
			gl.attachShader(program, frag);
			gl.linkProgram(program);
			if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
				program.locations = {};
				return program;
			} else {
				error(gl.getProgramInfoLog(program));
				return null;
			}
		}
	}, {
		key: 'useProgram',
		value: function useProgram(_program) {

			var it = this;
			var gl = it.gl;

			gl.useProgram(_program);
			it.currentProgram = _program;
		}
	}, {
		key: 'createVertexbuffer',
		value: function createVertexbuffer(_array) {

			var it = this;
			var gl = it.gl;

			var buffer = gl.createBuffer();

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_array), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);

			buffer.length = _array.length;
			return buffer;
		}
	}, {
		key: 'createIndexbuffer',
		value: function createIndexbuffer(_array) {

			var it = this;
			var gl = it.gl;

			var buffer = gl.createBuffer();

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(_array), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

			buffer.length = _array.length;
			return buffer;
		}
	}, {
		key: 'attribute',
		value: function attribute(_name, _buffer, _stride) {

			var it = this;
			var gl = it.gl;

			var location = void 0;
			if (it.currentProgram.locations[_name]) {
				location = it.currentProgram.locations[_name];
			} else {
				location = gl.getAttribLocation(it.currentProgram, _name);
				it.currentProgram.locations[_name] = location;
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
			gl.enableVertexAttribArray(location);
			gl.vertexAttribPointer(location, _stride, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
	}, {
		key: 'getUniformLocation',
		value: function getUniformLocation(_name) {

			var it = this;
			var gl = it.gl;

			var location = void 0;

			if (it.currentProgram.locations[_name]) {
				location = it.currentProgram.locations[_name];
			} else {
				location = gl.getUniformLocation(it.currentProgram, _name);
				it.currentProgram.locations[_name] = location;
			}

			return location;
		}
	}, {
		key: 'uniform1i',
		value: function uniform1i(_name, _value) {

			var it = this;
			var gl = it.gl;

			var location = it.getUniformLocation(_name);
			gl.uniform1i(location, _value);
		}
	}, {
		key: 'uniform1f',
		value: function uniform1f(_name, _value) {

			var it = this;
			var gl = it.gl;

			var location = it.getUniformLocation(_name);
			gl.uniform1f(location, _value);
		}
	}, {
		key: 'uniform2fv',
		value: function uniform2fv(_name, _value) {

			var it = this;
			var gl = it.gl;

			var location = it.getUniformLocation(_name);
			gl.uniform2fv(location, _value);
		}
	}, {
		key: 'uniform3fv',
		value: function uniform3fv(_name, _value) {

			var it = this;
			var gl = it.gl;

			var location = it.getUniformLocation(_name);
			gl.uniform3fv(location, _value);
		}
	}, {
		key: 'uniform4fv',
		value: function uniform4fv(_name, _value) {

			var it = this;
			var gl = it.gl;

			var location = it.getUniformLocation(_name);
			gl.uniform4fv(location, _value);
		}
	}, {
		key: 'uniformCubemap',
		value: function uniformCubemap(_name, _texture, _number) {

			var it = this;
			var gl = it.gl;

			var location = it.getUniformLocation(_name);
			gl.activeTexture(gl.TEXTURE0 + _number);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, _texture);
			gl.uniform1i(location, _number);
		}
	}, {
		key: 'uniformTexture',
		value: function uniformTexture(_name, _texture, _number) {

			var it = this;
			var gl = it.gl;

			var location = it.getUniformLocation(_name);
			gl.activeTexture(gl.TEXTURE0 + _number);
			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.uniform1i(location, _number);
		}
	}, {
		key: 'createTexture',
		value: function createTexture() {

			var it = this;
			var gl = it.gl;

			var texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.bindTexture(gl.TEXTURE_2D, null);

			return texture;
		}
	}, {
		key: 'textureFilter',
		value: function textureFilter(_texture, _filter) {

			var it = this;
			var gl = it.gl;

			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, _filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _filter);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}, {
		key: 'textureWrap',
		value: function textureWrap(_texture, _wrap) {

			var it = this;
			var gl = it.gl;

			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _wrap);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _wrap);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}, {
		key: 'setTexture',
		value: function setTexture(_texture, _image) {

			var it = this;
			var gl = it.gl;

			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}, {
		key: 'setTextureFromArray',
		value: function setTextureFromArray(_texture, _width, _height, _array) {

			var it = this;
			var gl = it.gl;

			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(_array));
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}, {
		key: 'setTextureFromFloatArray',
		value: function setTextureFromFloatArray(_texture, _width, _height, _array) {

			var it = this;
			var gl = it.gl;

			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array(_array));
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}, {
		key: 'copyTexture',
		value: function copyTexture(_texture, _width, _height) {

			var it = this;
			var gl = it.gl;

			gl.bindTexture(gl.TEXTURE_2D, _texture);
			gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, _width, _height, 0);
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}, {
		key: 'createCubemap',
		value: function createCubemap(_arrayOfImage) {

			var it = this;
			var gl = it.gl;

			// order : X+, X-, Y+, Y-, Z+, Z-
			var texture = gl.createTexture();

			gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
			for (var i = 0; i < 6; i++) {
				gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _arrayOfImage[i]);
			}
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

			return texture;
		}
	}, {
		key: 'createFramebuffer',
		value: function createFramebuffer(_width, _height) {

			var it = this;
			var gl = it.gl;

			var framebuffer = {};
			framebuffer.framebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer);

			framebuffer.depth = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, framebuffer.depth);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth);

			framebuffer.texture = it.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, framebuffer.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.bindTexture(gl.TEXTURE_2D, null);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			return framebuffer;
		}
	}, {
		key: 'resizeFramebuffer',
		value: function resizeFramebuffer(_framebuffer, _width, _height) {

			var it = this;
			var gl = it.gl;

			gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer.framebuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	}, {
		key: 'createFloatFramebuffer',
		value: function createFloatFramebuffer(_width, _height) {

			var it = this;
			var gl = it.gl;

			var framebuffer = {};
			framebuffer.framebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer);

			framebuffer.depth = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, framebuffer.depth);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth);

			framebuffer.texture = it.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, framebuffer.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.bindTexture(gl.TEXTURE_2D, null);

			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			return framebuffer;
		}
	}, {
		key: 'resizeFloatFramebuffer',
		value: function resizeFloatFramebuffer(_framebuffer, _width, _height) {

			var it = this;
			var gl = it.gl;

			gl.bindFramebuffer(gl.FRAMEBUFFER, _framebuffer.framebuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
	}, {
		key: 'createDrawBuffers',
		value: function createDrawBuffers(_width, _height, _numDrawBuffers) {

			var it = this;
			var gl = it.gl;
			var ext = it.extDrawBuffers;

			if (ext.MAX_DRAW_BUFFERS_WEBGL < _numDrawBuffers) {
				throw "createDrawBuffers: MAX_DRAW_BUFFERS_WEBGL is " + ext.MAX_DRAW_BUFFERS_WEBGL;
			}

			var framebuffer = {};
			framebuffer.framebuffer = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.framebuffer);

			framebuffer.textures = [];
			for (var i = 0; i < _numDrawBuffers; i++) {
				framebuffer.textures[i] = it.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, framebuffer.textures[i]);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.bindTexture(gl.TEXTURE_2D, null);

				gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + i, gl.TEXTURE_2D, framebuffer.textures[i], 0);
			}

			var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
			if (status !== gl.FRAMEBUFFER_COMPLETE) {
				throw "createDrawBuffers: gl.checkFramebufferStatus( gl.FRAMEBUFFER ) is " + status;
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);

			return framebuffer;
		}
	}, {
		key: 'drawBuffers',
		value: function drawBuffers(_numDrawBuffers) {

			var it = this;
			var gl = it.gl;
			var ext = it.extDrawBuffers;

			var array = [];
			if (typeof _numDrawBuffers === 'number') {
				for (var i = 0; i < _numDrawBuffers; i++) {
					array.push(ext.COLOR_ATTACHMENT0_WEBGL + i);
				}
			} else {
				array = array.concat(_numDrawBuffers);
			}
			ext.drawBuffersWEBGL(array);
		}
	}, {
		key: 'clear',
		value: function clear(_r, _g, _b, _a, _d) {

			var it = this;
			var gl = it.gl;

			var r = _r || 0.0;
			var g = _g || 0.0;
			var b = _b || 0.0;
			var a = typeof _a === 'number' ? _a : 1.0;
			var d = typeof _d === 'number' ? _d : 1.0;

			gl.clearColor(r, g, b, a);
			gl.clearDepth(d);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
	}, {
		key: 'render',
		value: function render(_props) {

			var it = this;
			var gl = it.gl;

			if (_props.viewport) {
				gl.viewport(_props.viewport[0], _props.viewport[1], _props.viewport[2], _props.viewport[3]);
			}
			if (_props.program) {
				it.useProgram(_props.program);
			}
			if (_props.framebuffer) {
				gl.bindFramebuffer(gl.FRAMEBUFFER, _props.framebuffer);
			}

			var clearBit = 0;
			if (_props.clearColor) {
				gl.clearColor(_props.clearColor[0], _props.clearColor[1], _props.clearColor[2], _props.clearColor[3]);
				clearBit = clearBit | gl.COLOR_BUFFER_BIT;
			}
			if (_props.clearDepth) {
				gl.clearDepth(gl.clearDepth);
				clearBit = clearBit | gl.DEPTH_BUFFER_BIT;
			}
			gl.clear;
		}
	}]);

	return GLCat;
}();

exports.default = GLCat;

},{}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/main.js":[function(require,module,exports){
'use strict';

var _xorshift = require('./xorshift');

var _xorshift2 = _interopRequireDefault(_xorshift);

var _glcat = require('./glcat');

var _glcat2 = _interopRequireDefault(_glcat);

var _stlLoader = require('./stl-loader');

var _stlLoader2 = _interopRequireDefault(_stlLoader);

var _step = require('./step');

var _step2 = _interopRequireDefault(_step);

var _tweak = require('./tweak');

var _tweak2 = _interopRequireDefault(_tweak);

var _compu = require('./compu');

var _compu2 = _interopRequireDefault(_compu);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _xorshift2.default)(187);




// ------

var clamp = function clamp(_value, _min, _max) {
  return Math.min(Math.max(_value, _min), _max);
};
var saturate = function saturate(_value) {
  return clamp(_value, 0.0, 1.0);
};

// ------

var width = canvas.width = 300;
var height = canvas.height = 300;

var gl = canvas.getContext('webgl');
var glCat = new _glcat2.default(gl);

// ------

var tweak = new _tweak2.default(divTweak);

// ------

var frame = 0;
var frames = 120;
var iSample = 0;
var nSample = 1;
var time = 0.0;
var deltaTime = 1.0 / 60.0;
var shutterRate = 0.14;

var timeUpdate = function timeUpdate() {
  var timePrev = time;
  time = (frame + iSample / nSample * shutterRate) / frames;
  time = time % 1.0;
};

// ------

var vboQuad = glCat.createVertexbuffer([-1, -1, 1, -1, -1, 1, 1, 1]);

// ------

var vertQuad = "#define GLSLIFY 1\nattribute vec2 p;\n\nvoid main() {\n  gl_Position = vec4( p, 0.0, 1.0 );\n}\n";

var programReturn = glCat.createProgram(vertQuad, "precision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform sampler2D texture;\nuniform bool hoge;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  gl_FragColor = texture2D( texture, uv );\n}\n");

var programReturnDb = glCat.createProgram(vertQuad, "#extension GL_EXT_draw_buffers : require\nprecision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform sampler2D texture0;\nuniform sampler2D texture1;\nuniform sampler2D texture2;\nuniform sampler2D texture3;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  gl_FragData[ 0 ] = texture2D( texture0, uv );\n  gl_FragData[ 1 ] = texture2D( texture1, uv );\n  gl_FragData[ 2 ] = texture2D( texture2, uv );\n  gl_FragData[ 3 ] = texture2D( texture3, uv );\n}\n");

var programRender = glCat.createProgram(vertQuad, "#define MARCH_ITER 200\n#define RAYAMP_MIN 0.01\n#define REFLECT_MAX 10.0\n#define REFLECT_PER_PATH 1\n#define INIT_LEN 1E-3\n\n// -----\n\n#define MTL_AIR 1\n#define MTL_FLOOR 4\n#define MTL_LIGHT 5\n#define MTL_REFRACT 6\n#define MTL_STATUE 7\n#define MTL_EOM 8\n#define MTL_MACPLUS 9\n#define MTL_DISPLAY 10\n#define MTL_ART 11\n\n// ------\n\n#define HUGE 9E16\n#define PI 3.14159265\n#define V vec2(0.,1.)\n#define saturate(i) clamp(i,0.,1.)\n#define lofi(i,m) (floor((i)/(m))*(m))\n\n// ------\n\n#extension GL_EXT_draw_buffers : require\nprecision highp float;\n#define GLSLIFY 1\n\nuniform float time;\nuniform vec2 resolution;\nuniform bool reset;\n\nuniform vec2 textureModelStatueReso;\nuniform vec2 textureModelEOMReso;\nuniform vec2 textureModelMacPlusReso;\n\nuniform sampler2D textureRandom;\nuniform sampler2D textureRandomStatic;\n\nuniform sampler2D textureModelStatue;\nuniform sampler2D textureModelEOM;\nuniform sampler2D textureModelMacPlus;\n\nuniform sampler2D textureDrawBuffers0;\nuniform sampler2D textureDrawBuffers1;\nuniform sampler2D textureDrawBuffers2;\nuniform sampler2D textureDrawBuffers3;\n\nuniform sampler2D textureImageArt;\nuniform sampler2D textureImageCompu;\n\n// ------\n\nvec4 seed;\nfloat random() { // weird prng\n  const vec4 q = vec4(   1225.0,    1585.0,    2457.0,    2098.0);\n  const vec4 r = vec4(   1112.0,     367.0,      92.0,     265.0);\n  const vec4 a = vec4(   3423.0,    2646.0,    1707.0,    1999.0);\n  const vec4 m = vec4(4194287.0, 4194277.0, 4194191.0, 4194167.0);\n\n  vec4 beta = floor(seed / q);\n  vec4 p = a * (seed - beta * q) - beta * r;\n  beta = (sign(-p) + vec4(1.0)) * vec4(0.5) * m;\n  seed = (p + beta);\n\n  return fract(dot(seed / m, vec4(1.0, -1.0, 1.0, -1.0)));\n}\n\nvec4 random4() {\n  return vec4(\n    random(),\n    random(),\n    random(),\n    random()\n  );\n}\n\n// ------\n\nmat2 rotate2D( float _t ) {\n  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );\n}\n\nbool isUvValid( vec2 _v ) {\n  return ( 0.0 <= _v.x ) && ( _v.x <= 1.0 ) && ( 0.0 <= _v.y ) && ( _v.y <= 1.0 );\n}\n\nvec4 noise( vec2 _uv ) {\n  vec4 sum = V.xxxx;\n  for ( int i = 0; i < 6; i ++ ) {\n    float mul = pow( 2.0, float( i ) );\n    sum += texture2D( textureRandomStatic, _uv / 64.0 * mul ) / 2.0 / mul;\n  }\n  return sum;\n}\n\n// ------\n\nvec2 randomCircle() {\n  vec2 v = V.xx;\n  for ( int i = 0; i < 99; i ++ ) {\n    v = random4().xy * 2.0 - 1.0;\n    if ( length( v ) < 1.0 ) { break; }\n  }\n  return v;\n}\n\nvec3 randomSphere() {\n  vec3 v = V.xxx;\n  for ( int i = 0; i < 99; i ++ ) {\n    v = random4().xyz * 2.0 - 1.0;\n    if ( length( v ) < 1.0 ) { break; }\n  }\n  v = normalize( v );\n  return v;\n}\n\nvec3 randomHemisphere( in vec3 _normal ) {\n  vec3 v = randomSphere();\n  if ( dot( v, _normal ) < 0.0 ) { v = -v; }\n  return v;\n}\n\n// Ref: https://pathtracing.wordpress.com/2011/03/03/cosine-weighted-hemisphere/\nvec3 randomHemisphereCosWeighted( in vec3 _normal ) {\n  float theta = acos( sqrt( 1.0 - random() ) );\n  float phi = 2.0 * PI * random();\n\n  vec3 sid = (\n    0.5 < abs( dot( V.xyx, _normal ) )\n    ? normalize( cross( V.xxy, _normal ) )\n    : normalize( cross( V.xyx, _normal ) )\n  );\n  vec3 top = normalize( cross( _normal, sid ) );\n\n  return (\n    sid * sin( theta ) * cos( phi )\n    + top * sin( theta ) * sin( phi )\n    + _normal * cos( theta )\n  );\n}\n\n// ------\n\nstruct Camera {\n  vec3 pos;\n  vec3 dir;\n  vec3 sid;\n  vec3 top;\n};\n\nstruct Ray {\n  vec3 dir;\n  vec3 ori;\n  int mtl;\n};\n\nstruct Intersection {\n  Ray ray;\n  float len;\n  vec3 pos;\n  vec3 normal;\n  int mtl;\n  vec4 props;\n};\n\nstruct Material {\n  vec3 color;\n  vec3 emissive;\n  float reflective;\n  float reflectiveRoughness;\n  float refractive;\n  float refractiveRoughness;\n  float refractiveIndex;\n};\n\n// ------\n\nCamera camInit( in vec3 _pos, in vec3 _tar ) {\n  Camera cam;\n  cam.pos = _pos;\n  cam.dir = normalize( _tar - _pos );\n  cam.sid = normalize( cross( cam.dir, V.xyx ) );\n  cam.top = normalize( cross( cam.sid, cam.dir ) );\n\n  return cam;\n}\n\nRay rayInit( in vec3 _ori, in vec3 _dir, in int _mtl ) {\n  Ray ray;\n  ray.dir = _dir;\n  ray.ori = _ori + _dir * INIT_LEN;\n  ray.mtl = _mtl;\n  return ray;\n}\n\nRay rayFromCam( in vec2 _p, in Camera _cam ) {\n  vec3 dir = normalize( _p.x * _cam.sid + _p.y * _cam.top + _cam.dir * 2.0 * ( 1.0 - length( _p.xy ) * 0.0 ) );\n  return rayInit( _cam.pos, dir, 1 );\n}\n\nIntersection interInit( in Ray _ray, in float _len, in vec3 _nor ) {\n  Intersection inter;\n  inter.ray = _ray;\n  inter.len = _len;\n  inter.pos = _ray.ori + _ray.dir * inter.len;\n  inter.normal = _nor;\n  inter.mtl = MTL_AIR;\n  inter.props = V.xxxx;\n  return inter;\n}\n\nIntersection applyIntersection( in Intersection _old, in Intersection _new ) {\n  Intersection inter = _old;\n  inter.len = _new.len;\n  inter.pos = inter.ray.ori + inter.ray.dir * inter.len;\n  inter.normal = _new.normal;\n  inter.mtl = _new.mtl;\n  inter.props = _new.props;\n  return inter;\n}\n\nMaterial mtlInit() {\n  Material material;\n  material.color = V.xxx;\n  material.emissive = V.xxx;\n  material.reflective = 0.0;\n  material.reflectiveRoughness = 0.0;\n  material.refractive = 0.0;\n  material.refractiveRoughness = 0.0;\n  material.refractiveIndex = 1.0;\n  return material;\n}\n\n// ------\n\nIntersection sphere( in Ray _ray, in vec3 _pos, in float _r ) {\n  float eqb = dot( _ray.dir, _ray.ori - _pos );\n  float eqc = dot( _ray.ori - _pos, _ray.ori - _pos ) - _r * _r;\n  float eqd = eqb * eqb - eqc;\n\n  float len = HUGE;\n  if ( 0.0 <= eqd ) {\n    len = -eqb - sqrt( eqd );\n    len = len <= 0.0 ? -eqb + sqrt( eqd ) : len;\n    len = len < 0.0 ? HUGE : len; \n  }\n\n  Intersection inter = interInit( _ray, len, V.xxy );\n  inter.normal = normalize( inter.pos - _pos );\n  return inter;\n}\n\nIntersection plane( in Ray _ray, in vec3 _pos, in vec3 _nor ) {\n  float len = ( dot( _nor, _ray.ori ) - dot( _nor, _pos ) ) / dot( -_nor, _ray.dir );\n  len = len < 0.0 ? HUGE : len; \n\n  Intersection inter = interInit( _ray, len, _nor );\n  return inter;\n}\n\nIntersection mesh( in Ray _ray, in sampler2D _model, in vec2 _reso ) {\n  float minLen = HUGE;\n  vec3 minNor = V.xxy;\n\n  float pos = 0.0;\n\n  for ( int i = 0; i < 1000; i ++ ) {\n    vec2 coord = vec2( mod( pos, 256.0 ) * 3.0, floor( pos / 256.0 ) ) + vec2( 0.5 );\n    vec4 tex1 = texture2D( _model, ( V.yx * 0.0 + coord ) / _reso );\n    vec4 tex2 = texture2D( _model, ( V.yx * 1.0 + coord ) / _reso );\n    vec4 tex3 = texture2D( _model, ( V.yx * 2.0 + coord ) / _reso );\n\n    if ( tex1.w == 0.0 ) {\n      float len1 = ( _ray.ori.x - tex1.x ) / _ray.dir.x; \n      float len2 = ( _ray.ori.x - tex2.x ) / _ray.dir.x;\n      float lenMin = min( len1, len2 );\n      float lenMax = max( len1, len2 );\n\n      len1 = ( _ray.ori.y - tex1.y ) / _ray.dir.y; \n      len2 = ( _ray.ori.y - tex2.y ) / _ray.dir.y;\n      lenMin = max( lenMin, min( len1, len2 ) );\n      lenMax = min( lenMax, max( len1, len2 ) );\n\n      len1 = ( _ray.ori.z - tex1.z ) / _ray.dir.z; \n      len2 = ( _ray.ori.z - tex2.z ) / _ray.dir.z;\n      lenMin = max( lenMin, min( len1, len2 ) );\n      lenMax = min( lenMax, max( len1, len2 ) );\n\n      if ( lenMin <= lenMax ) {\n        pos += 1.0;\n      } else {\n        pos += tex2.w;\n      }\n    } else if ( tex1.w == 1.0 ) {\n      vec3 v1 = tex2.xyz - tex1.xyz;\n      vec3 v2 = tex3.xyz - tex1.xyz;\n      vec3 nor = normalize( cross( v1, v2 ) );\n      nor = ( 0.0 < dot( nor, _ray.dir ) ) ? -nor : nor;\n\n      float len = ( dot( nor, _ray.ori ) - dot( nor, tex1.xyz ) ) / dot( -nor, _ray.dir );\n      if ( 0.0 < len && len < minLen ) {\n        vec3 pos = _ray.ori + _ray.dir * len;\n        vec3 c1 = cross( pos - tex1.xyz, tex2.xyz - tex1.xyz );\n        vec3 c2 = cross( pos - tex2.xyz, tex3.xyz - tex2.xyz );\n        vec3 c3 = cross( pos - tex3.xyz, tex1.xyz - tex3.xyz );\n        if ( 0.0 < dot( c1, c2 ) && 0.0 < dot( c2, c3 ) ) {\n          minLen = len;\n          minNor = nor;\n        }\n      }\n\n      pos += 1.0;\n    } else {\n      break;\n    }\n  }\n\n  Intersection inter = interInit( _ray, minLen, minNor );\n  return inter;\n}\n\nIntersection map( in Ray _ray ) {\n  Intersection inter = interInit( _ray, HUGE, V.xxy );\n\n  { // floor\n    Intersection intert = plane( inter.ray, -V.xyx, V.xyx );\n    if ( intert.len < inter.len ) {\n      inter = applyIntersection( inter, intert );\n      inter.mtl = MTL_FLOOR;\n      inter.props.x = smoothstep( -0.01, 0.01, cos( inter.pos.x * 10.0 ) * cos( inter.pos.z * 10.0 ) );\n    }\n  }\n\n  { // wall\n    Intersection intert = plane( inter.ray, -V.xxy * 2.0, V.xxy );\n    if ( intert.len < inter.len ) {\n      inter = applyIntersection( inter, intert );\n      inter.mtl = MTL_FLOOR;\n      inter.props.x = 1.0;\n    }\n  }\n\n  { // picture\n    Ray ray = inter.ray;\n    ray.ori -= vec3( -0.7, 1.0, 0.0 );\n    Intersection intert = plane( ray, -V.xxy * 1.9, V.xxy );\n    if ( ( intert.len < inter.len ) && abs( intert.pos.x ) < 1.4 && abs( intert.pos.y ) < 1.0 ) {\n      inter = applyIntersection( inter, intert );\n      inter.mtl = MTL_ART;\n      inter.props.xy = intert.pos.xy / vec2( 1.4, 1.0 );\n    }\n  }\n\n  { // helios\n    float rotate = -time * PI * 2.0;\n\n    Ray ray = inter.ray;\n    ray.ori -= vec3( 0.6, 0.0, -0.2 );\n    ray.ori.zx = rotate2D( -rotate ) * ray.ori.zx;\n    ray.dir.zx = rotate2D( -rotate ) * ray.dir.zx;\n    Intersection intert = mesh( ray, textureModelStatue, textureModelStatueReso );\n    if ( intert.len < inter.len ) {\n      inter = applyIntersection( inter, intert );\n      inter.normal.zx = rotate2D( rotate ) * inter.normal.zx;\n      inter.mtl = MTL_STATUE;\n    }\n  }\n\n  { // macplus\n    float rotate = 0.4;\n    float scale = 0.6;\n\n    Ray ray = inter.ray;\n    ray.ori -= vec3( -0.95, -0.4, -0.4 );\n    ray.ori /= scale;\n    ray.dir /= scale;\n    ray.ori.zx = rotate2D( -rotate ) * ray.ori.zx;\n    ray.dir.zx = rotate2D( -rotate ) * ray.dir.zx;\n\n    {\n      Intersection intert = mesh( ray, textureModelMacPlus, textureModelMacPlusReso );\n      if ( intert.len < inter.len ) {\n        inter = applyIntersection( inter, intert );\n        inter.normal *= scale;\n        inter.normal.zx = rotate2D( rotate ) * inter.normal.zx;\n        inter.mtl = MTL_MACPLUS;\n      }\n    }\n\n    {\n      Intersection intert = plane( ray, V.xxy * 0.7, normalize( vec3( 0.0, 0.05, 1.0 ) ) );\n      if ( ( intert.len < inter.len ) && abs( intert.pos.x ) < 0.58 && abs( intert.pos.y - 0.3 ) < 0.42 ) {\n        inter = applyIntersection( inter, intert );\n        inter.normal *= scale;\n        inter.normal.zx = rotate2D( rotate ) * inter.normal.zx;\n        inter.mtl = MTL_DISPLAY;\n        inter.props.xy = ( intert.pos.xy - vec2( 0.0, 0.3 ) ) / vec2( 0.48, 0.36 );\n      }\n    }\n  }\n\n  if(false){ // refract\n    Ray ray = inter.ray;\n    ray.ori.zx = rotate2D( 1.0 ) * ray.ori.zx;\n    ray.dir.zx = rotate2D( 1.0 ) * ray.dir.zx;\n    Intersection intert = mesh( ray, textureModelStatue, textureModelStatueReso );\n    // Intersection intert = sphere( ray, V.xxx, 0.5 );\n    if ( intert.len < inter.len ) {\n      inter = applyIntersection( inter, intert );\n      // inter.normal = ray.mtl == MTL_REFRACT ? -inter.normal : inter.normal;\n      inter.normal.zx = rotate2D( -1.0 ) * inter.normal.zx;\n      inter.mtl = ray.mtl == MTL_REFRACT ? MTL_AIR : MTL_REFRACT;\n    }\n  }\n\n  { // eom\n    Ray ray = inter.ray;\n    ray.ori -= vec3( 0.0, -0.8, 0.7 );\n    Intersection intert = mesh( ray, textureModelEOM, textureModelEOMReso );\n    if ( intert.len < inter.len ) {\n      inter = applyIntersection( inter, intert );\n      inter.mtl = MTL_EOM;\n      inter.props.x = dot( inter.normal, V.xxy ); \n    }\n  }\n\n  { // light\n    Intersection intert = sphere( inter.ray, vec3( 0.0, 3.0, 2.0 ), 1.0 );\n    if ( intert.len < inter.len ) {\n      inter = intert;\n      inter.mtl = MTL_LIGHT;\n    }\n  }\n\n  return inter;\n}\n\n// ------\n\nMaterial getMtl( int _mtl, vec4 _props ) {\n  Material mtl = mtlInit();\n\n  if ( _mtl == MTL_AIR ) {\n    mtl.color = vec3( 1.0 );\n    mtl.refractive = 1.0;\n    mtl.refractiveIndex = 1.0;\n\n  } else if ( _mtl == MTL_FLOOR ) {\n    mtl.color = mix(\n      vec3( 0.2 ),\n      vec3( 0.9, 0.4, 0.7 ),\n      _props.x\n    );\n\n  } else if ( _mtl == MTL_LIGHT ) {\n    mtl.emissive = 20.0 * vec3( 0.9, 0.6, 0.8 );\n\n  } else if ( _mtl == MTL_REFRACT ) {\n    mtl.color = vec3( 0.9 );\n    mtl.refractive = 1.0;\n    mtl.refractiveIndex = 1.4;\n\n  } else if ( _mtl == MTL_STATUE ) {\n    mtl.color = vec3( 0.8, 0.8, 0.7 );\n    mtl.reflective = 0.02;\n    mtl.reflectiveRoughness = 0.04;\n\n  } else if ( _mtl == MTL_MACPLUS ) {\n    mtl.color = vec3( 0.9, 0.9, 0.8 );\n    mtl.reflective = 0.02;\n    mtl.reflectiveRoughness = 0.002;\n\n  } else if ( _mtl == MTL_DISPLAY ) {\n    mtl.color = vec3( 0.5 );\n    mtl.reflective = 1.0;\n\n    vec3 emi = V.xxx;\n    if ( abs( _props.x ) < 1.0 && abs( _props.y ) < 1.0 ) {\n      vec3 img = texture2D( textureImageCompu, 0.5 + vec2( 0.5, -0.5 ) * _props.xy ).xyz;\n      emi = mix(\n        vec3( 0.1, 0.9, 0.6 ),\n        vec3( 0.9, 0.1, 0.6 ),\n        _props.y * 0.5 + 0.5\n      );\n      emi = img;\n    }\n    mtl.emissive = emi * 2.0;\n\n  } else if ( _mtl == MTL_EOM ) {\n    mtl.color = mix(\n      vec3( 0.2, 0.5, 0.7 ),\n      vec3( 0.5, 0.9, 0.2 ),\n      abs( _props.x )\n    );\n    mtl.emissive = mtl.color * 0.6;\n    mtl.reflective = 0.0;\n\n  } else if ( _mtl == MTL_ART ) {\n    vec3 img = texture2D( textureImageArt, 0.5 + vec2( 0.5, -0.5 ) * _props.xy ).xyz;\n    vec3 col = img.xzy * mix(\n      vec3( 0.8, 1.3, 1.4 ),\n      vec3( 1.4, 1.1, 0.8 ),\n      _props.y * 0.5 + 0.5\n    );\n    mtl.color = col;\n\n  }\n\n  return mtl;\n}\n\n// ------\n\nRay shade( in Intersection _inter, inout vec3 colorAdd, inout vec3 colorMul ) {\n  Intersection inter = _inter;\n\n  if ( inter.len != HUGE ) {\n    vec3 normal = inter.normal;\n\n    int rayMtl = inter.ray.mtl;\n    Material material = getMtl( inter.mtl, inter.props );\n\n    vec3 dir = V.xxx;\n    float dice = random4().x;\n\n    colorAdd += colorMul * material.emissive;\n\n    colorMul *= material.color;\n    if ( dice < material.reflective ) { // reflect\n      vec3 ref = normalize( reflect(\n        inter.ray.dir,\n        normal\n      ) );\n      vec3 dif = randomHemisphere( normal );\n      dir = normalize( mix(\n        ref,\n        dif,\n        material.reflectiveRoughness\n      ) );\n      colorMul *= max( dot( dir, ref ), 0.0 );\n\n    } else if ( dice < material.reflective + material.refractive ) { // refract\n      vec3 inc = normalize( inter.ray.dir );\n      float eta = getMtl( inter.ray.mtl, V.xxxx ).refractiveIndex / material.refractiveIndex;\n\n      vec3 ref = refract( inc, normal, eta );\n      ref = ( ref == V.xxx )\n      ? ( normalize( reflect(\n        inter.ray.dir,\n        normal\n      ) ) )\n      : normalize( ref );\n\n      vec3 dif = randomHemisphere( -normal );\n      dir = normalize( mix(\n        ref,\n        dif,\n        material.refractiveRoughness\n      ) );\n      colorMul *= max( dot( dir, ref ), 0.0 );\n      \n      rayMtl = inter.mtl;\n\n    } else { // diffuse\n      dir = randomHemisphereCosWeighted( normal );\n      colorMul *= 1.0;\n    }\n    \n    Ray ray = rayInit( inter.pos, dir, rayMtl );\n    return ray;\n  } else {\n    // colorAdd += colorMul * vec3( 0.9 );\n    colorMul *= 0.0;\n\n    return rayInit( V.xxy, V.xxy, MTL_AIR );\n  }\n}\n\n// ------\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  seed = texture2D( textureRandom, gl_FragCoord.xy / resolution );\n\n  vec4 tex0 = texture2D( textureDrawBuffers0, uv );\n  vec4 tex1 = texture2D( textureDrawBuffers1, uv );\n  vec4 tex2 = texture2D( textureDrawBuffers2, uv );\n  vec4 tex3 = texture2D( textureDrawBuffers3, uv );\n\n  vec3 colorAdd = abs( tex1.xyz ) - 1E-2;\n  vec3 colorMul = abs( tex2.xyz ) - 1E-2;\n  vec3 colorOut = tex3.xyz;\n  int rayMtl = int( abs( tex2.w ) );\n  float depth = ( tex1.x < 0.0 ? 0.0 : 1.0 ) + ( tex1.y < 0.0 ? 0.0 : 2.0 ) + ( tex1.z < 0.0 ? 0.0 : 4.0 ) + ( tex2.x < 0.0 ? 0.0 : 8.0 ) + ( tex2.y < 0.0 ? 0.0 : 16.0 ) + ( tex2.z < 0.0 ? 0.0 : 32.0 );\n  float samples = abs( tex3.w );\n\n  Ray ray;\n  vec3 dir = vec3( tex0.w, tex1.w, 0.0 );\n  dir.z = sqrt( 1.0 - dot( dir, dir ) ) * sign( tex2.w );\n  ray = rayInit( tex0.xyz, dir, rayMtl );\n\n  if ( reset ) {\n    colorOut = V.xxx;\n    colorAdd = V.xxx;\n    samples = 0.0;\n  }\n\n  for ( int i = 0; i < REFLECT_PER_PATH; i ++ ) {\n\n    if ( reset || REFLECT_MAX <= depth || length( colorMul ) < RAYAMP_MIN ) {\n      samples += 1.0;\n      depth = 0.0;\n\n      colorOut = mix(\n        colorOut,\n        max( V.xxx, colorAdd ),\n        1.0 / samples\n      );\n\n      // ------\n\n      vec3 camTar = vec3( 0.0, 0.0, 0.0 );\n      Camera cam = camInit(\n        vec3( 0.0, 0.0, 3.0 ),\n        camTar\n      );\n\n      // dof\n      vec2 dofCirc = randomCircle() * 0.01;\n      cam.pos += dofCirc.x * cam.sid;\n      cam.pos += dofCirc.y * cam.top;\n\n      cam = camInit( cam.pos, camTar );\n\n      // antialias\n      vec2 pix = gl_FragCoord.xy + random4().xy - 0.5;\n\n      vec2 p = ( pix * 2.0 - resolution ) / resolution.x;\n      ray = rayFromCam( p, cam );\n\n      colorAdd = V.xxx;\n      colorMul = V.yyy;\n    } else {\n      depth += 1.0;\n    }\n\n    Intersection inter = map( ray );\n    ray = shade( inter, colorAdd, colorMul );\n\n  }\n\n  // ------\n\n  vec3 depthBits1 = vec3(\n    mod( depth, 2.0 ) < 1.0 ? -1.0 : 1.0,\n    mod( depth / 2.0, 2.0 ) < 1.0 ? -1.0 : 1.0,\n    mod( depth / 4.0, 2.0 ) < 1.0 ? -1.0 : 1.0\n  );\n\n  vec3 depthBits2 = vec3(\n    mod( depth / 8.0, 2.0 ) < 1.0 ? -1.0 : 1.0,\n    mod( depth / 16.0, 2.0 ) < 1.0 ? -1.0 : 1.0,\n    mod( depth / 32.0, 2.0 ) < 1.0 ? -1.0 : 1.0\n  );\n\n  gl_FragData[ 0 ] = vec4( ray.ori, ray.dir.x );\n  gl_FragData[ 1 ] = vec4( ( colorAdd + 1E-2 ) * depthBits1, ray.dir.y );\n  gl_FragData[ 2 ] = vec4( ( colorMul + 1E-2 ) * depthBits2, float( ray.mtl ) * ( ( 0.0 < ray.dir.z ) ? 1.0 : -1.0 ) );\n  gl_FragData[ 3 ] = vec4( colorOut, samples );\n}\n");

var programSum = glCat.createProgram(vertQuad, "precision highp float;\n#define GLSLIFY 1\n\nuniform bool init;\nuniform float add;\nuniform vec2 resolution;\nuniform sampler2D textureAdd;\nuniform sampler2D textureBase;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  vec3 ret = texture2D( textureAdd, uv ).xyz * add;\n  if ( !init ) {\n    ret += texture2D( textureBase, uv ).xyz;\n  }\n  gl_FragColor = vec4( ret, 1.0 );\n}\n");

var programBloom = glCat.createProgram(vertQuad, "#define V vec2(0.,1.)\n#define saturate(i) clamp(i,0.,1.)\n#define PI 3.14159265\n#define SAMPLES 40\n\n// ------\n\nprecision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform bool isVert;\nuniform sampler2D texture;\nuniform sampler2D textureBase;\n\nuniform float gaussVar;\n\nfloat gaussian( float _x, float _v ) {\n  return 1.0 / sqrt( 2.0 * PI * _v ) * exp( - _x * _x / 2.0 / _v );\n}\n\nfloat smin( float _a, float _b, float _k ) {\n  float h = clamp( 0.5 + 0.5 * ( _b - _a ) / _k, 0.0, 1.0 );\n  return mix( _b, _a, h ) - _k * h * ( 1.0 - h );\n}\n\nfloat smax( float _a, float _b, float _k ) {\n  return -smin( -_a, -_b, _k );\n}\n\nvec3 preBloom( vec3 _col ) {\n  return pow( vec3(\n    smax( 0.0, _col.x - 0.5, 0.1 ),\n    smax( 0.0, _col.y - 0.5, 0.1 ),\n    smax( 0.0, _col.z - 0.5, 0.1 )\n  ), 0.5 * V.yyy );\n}\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  vec2 bv = ( isVert ? vec2( 0.0, 1.0 ) : vec2( 1.0, 0.0 ) ) / resolution;\n\n  vec3 sum = V.xxx;\n  for ( int i = -SAMPLES; i <= SAMPLES; i ++ ) {\n    vec2 v = saturate( uv + bv * float( i ) );\n    vec3 tex = preBloom( texture2D( texture, v ).xyz );\n    float mul = gaussian( float( i ), gaussVar );\n    sum += tex * mul;\n  }\n\n  sum *= 0.3;\n\n  if ( isVert ) {\n    sum += texture2D( textureBase, uv ).xyz;\n  }\n\n  gl_FragColor = vec4( sum, 1.0 );\n}\n");

var programFinal = glCat.createProgram(vertQuad, "#define V vec2(0.,1.)\n#define saturate(i) clamp(i,0.,1.)\n\n// ------\n\nprecision highp float;\n#define GLSLIFY 1\n\nuniform float time;\nuniform vec2 resolution;\nuniform sampler2D texture;\n\nfloat gray( vec3 _c ) {\n  return _c.x * 0.299 + _c.y * 0.587 + _c.z * 0.114;\n}\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n\n  vec3 col = texture2D( texture, uv ).xyz;\n\n  float len = length( gl_FragCoord.xy - resolution / 2.0 ) / resolution.x * sqrt( 2.0 );\n  vec3 vig = mix(\n    col,\n    gray( col ) * vec3( 0.4, 0.45, 0.5 ),\n    len * 0.6\n  );\n\n  vec3 gamma = pow( vig, vec3( 1.0 / 1.0 ) );\n\n  gl_FragColor = vec4( gamma, 1.0 );\n}\n");

// ------

var framebufferDrawBuffers = glCat.createDrawBuffers(width, height, 4);
var framebufferDrawBuffersReturn = glCat.createDrawBuffers(width, height, 4);

var framebufferReturn = glCat.createFloatFramebuffer(width, height);
var framebufferBloom = glCat.createFloatFramebuffer(width, height);
var framebufferBloomTemp = glCat.createFloatFramebuffer(width, height);

// ------

var textureRandomSize = 256;

var textureRandomUpdate = function textureRandomUpdate(_tex) {
  glCat.setTextureFromArray(_tex, textureRandomSize, textureRandomSize, function () {
    var len = textureRandomSize * textureRandomSize * 4;
    var ret = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      ret[i] = Math.floor((0, _xorshift2.default)() * 256.0);
    }
    return ret;
  }());
};

var textureRandom = glCat.createTexture();
glCat.textureWrap(textureRandom, gl.REPEAT);

var textureRandomStatic = glCat.createTexture();
glCat.textureWrap(textureRandomStatic, gl.REPEAT);
textureRandomUpdate(textureRandomStatic);

// ------

var textureImageArt = glCat.createTexture();
var textureImageCompu = glCat.createTexture();

// ------

var textureModelStatue = glCat.createTexture();
var textureModelStatueResoX = void 0;
var textureModelStatueResoY = void 0;

var textureModelEOM = glCat.createTexture();
var textureModelEOMResoX = void 0;
var textureModelEOMResoY = void 0;

var textureModelMacPlus = glCat.createTexture();
var textureModelMacPlusResoX = void 0;
var textureModelMacPlusResoY = void 0;

// ------

var renderA = document.createElement('a');

var saveFrame = function saveFrame() {
  renderA.href = canvas.toDataURL();
  renderA.download = ('0000' + frame).slice(-5) + '.png';
  renderA.click();
};

// ------

var render = function render() {
  gl.viewport(0, 0, width, height);
  glCat.useProgram(programReturnDb);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferDrawBuffersReturn.framebuffer);
  glCat.drawBuffers(framebufferDrawBuffersReturn.textures.length);
  gl.blendFunc(gl.ONE, gl.ONE);
  glCat.clear(0.0, 0.0, 0.0, 0.0);

  glCat.attribute('p', vboQuad, 2);

  glCat.uniform1f('time', time);
  glCat.uniform2fv('resolution', [width, height]);

  glCat.uniformTexture('texture0', framebufferDrawBuffers.textures[0], 0);
  glCat.uniformTexture('texture1', framebufferDrawBuffers.textures[1], 1);
  glCat.uniformTexture('texture2', framebufferDrawBuffers.textures[2], 2);
  glCat.uniformTexture('texture3', framebufferDrawBuffers.textures[3], 3);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  // ------

  gl.viewport(0, 0, width, height);
  glCat.useProgram(programRender);
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferDrawBuffers.framebuffer);
  glCat.drawBuffers(framebufferDrawBuffers.textures.length);
  gl.blendFunc(gl.ONE, gl.ONE);
  glCat.clear(0.0, 0.0, 0.0, 0.0);

  glCat.attribute('p', vboQuad, 2);

  glCat.uniform1f('time', time);
  glCat.uniform2fv('resolution', [width, height]);
  glCat.uniform1i('reset', iSample === 0);
  glCat.uniform2fv('textureModelStatueReso', [textureModelStatueResoX, textureModelStatueResoY]);
  glCat.uniform2fv('textureModelEOMReso', [textureModelEOMResoX, textureModelEOMResoY]);
  glCat.uniform2fv('textureModelMacPlusReso', [textureModelMacPlusResoX, textureModelMacPlusResoY]);

  glCat.uniformTexture('textureRandom', textureRandom, 0);
  glCat.uniformTexture('textureRandomStatic', textureRandomStatic, 1);

  glCat.uniformTexture('textureDrawBuffers0', framebufferDrawBuffersReturn.textures[0], 2);
  glCat.uniformTexture('textureDrawBuffers1', framebufferDrawBuffersReturn.textures[1], 3);
  glCat.uniformTexture('textureDrawBuffers2', framebufferDrawBuffersReturn.textures[2], 4);
  glCat.uniformTexture('textureDrawBuffers3', framebufferDrawBuffersReturn.textures[3], 5);

  glCat.uniformTexture('textureModelStatue', textureModelStatue, 6);
  glCat.uniformTexture('textureModelEOM', textureModelEOM, 7);
  glCat.uniformTexture('textureModelMacPlus', textureModelMacPlus, 8);

  glCat.uniformTexture('textureImageArt', textureImageArt, 9);
  glCat.uniformTexture('textureImageCompu', textureImageCompu, 10);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

// ------

var preview = function preview() {
  gl.viewport(0, 0, width, height);
  glCat.useProgram(programReturn);
  glCat.drawBuffers([gl.COLOR_ATTACHMENT0]);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.blendFunc(gl.ONE, gl.ONE);
  glCat.clear();

  glCat.attribute('p', vboQuad, 2);
  glCat.uniform2fv('resolution', [width, height]);

  glCat.uniformTexture('texture', framebufferDrawBuffers.textures[3], 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

// ------

var post = function post() {
  for (var i = 0; i < 4; i++) {
    var gaussVar = Math.exp(i) * Math.max(width, height) / 30.0;

    // ------

    gl.viewport(0, 0, width, height);
    glCat.useProgram(programReturn);
    glCat.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferReturn.framebuffer);
    gl.blendFunc(gl.ONE, gl.ONE);
    glCat.clear();

    glCat.attribute('p', vboQuad, 2);
    glCat.uniform2fv('resolution', [width, height]);

    glCat.uniformTexture('texture', i === 0 ? framebufferDrawBuffers.textures[3] : framebufferBloom.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // ------

    gl.viewport(0, 0, width, height);
    glCat.useProgram(programBloom);
    glCat.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferBloomTemp.framebuffer);
    gl.blendFunc(gl.ONE, gl.ONE);
    glCat.clear();

    glCat.attribute('p', vboQuad, 2);
    glCat.uniform1i('isVert', false);
    glCat.uniform1f('gaussVar', gaussVar);
    glCat.uniform2fv('resolution', [width, height]);

    glCat.uniformTexture('texture', framebufferDrawBuffers.textures[3], 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // ------

    gl.viewport(0, 0, width, height);
    glCat.useProgram(programBloom);
    glCat.drawBuffers([gl.COLOR_ATTACHMENT0]);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferBloom.framebuffer);
    gl.blendFunc(gl.ONE, gl.ONE);
    glCat.clear();

    glCat.attribute('p', vboQuad, 2);
    glCat.uniform1i('isVert', true);
    glCat.uniform1f('gaussVar', gaussVar);
    glCat.uniform2fv('resolution', [width, height]);

    glCat.uniformTexture('texture', framebufferBloomTemp.texture, 0);
    glCat.uniformTexture('textureBase', framebufferReturn.texture, 1);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ------

  gl.viewport(0, 0, width, height);
  glCat.useProgram(programFinal);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  glCat.drawBuffers([gl.BACK]);
  gl.blendFunc(gl.ONE, gl.ONE);
  glCat.clear();

  glCat.attribute('p', vboQuad, 2);
  glCat.uniform1f('time', time);
  glCat.uniform2fv('resolution', [width, height]);

  glCat.uniformTexture('texture', framebufferBloom.texture, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

// ------

var update = function update() {
  if (!tweak.checkbox('play', { value: false })) {
    setTimeout(update, 10);
    return;
  }

  timeUpdate();
  textureRandomUpdate(textureRandom);

  _compu2.default.update(time);
  glCat.setTexture(textureImageCompu, _compu2.default.canvas);

  render();

  iSample++;
  if (iSample === nSample) {
    iSample = 0;
    console.log(frame);

    post();

    if (tweak.checkbox('save', { value: false })) {
      saveFrame();
    }
    nSample = Math.floor(tweak.range('nSample', { value: 1000.0, min: 1.0, max: 10000.0, step: 1.0 }));
    frame++;
  } else {
    preview();
  }

  // requestAnimationFrame( update );
  setTimeout(update, 1);
};

// ------

(0, _step2.default)({
  0: function _(done) {
    _compu2.default.prepare(done);

    (0, _stlLoader2.default)('models/helios.stl', function (_data) {
      textureModelStatueResoX = 768;
      textureModelStatueResoY = _data.length / 4 / 768;
      glCat.setTextureFromFloatArray(textureModelStatue, textureModelStatueResoX, textureModelStatueResoY, _data.array);
      done();
    });

    (0, _stlLoader2.default)('models/eom.stl', function (_data) {
      textureModelEOMResoX = 768;
      textureModelEOMResoY = _data.length / 4 / 768;
      glCat.setTextureFromFloatArray(textureModelEOM, textureModelEOMResoX, textureModelEOMResoY, _data.array);
      done();
    });

    (0, _stlLoader2.default)('models/macplus.stl', function (_data) {
      textureModelMacPlusResoX = 768;
      textureModelMacPlusResoY = _data.length / 4 / 768;
      glCat.setTextureFromFloatArray(textureModelMacPlus, textureModelMacPlusResoX, textureModelMacPlusResoY, _data.array);
      done();
    });

    {
      (function () {
        var image = new Image();
        image.onload = function () {
          glCat.setTexture(textureImageArt, image);
          done();
        };
        image.src = 'images/art.jpg';
      })();
    }
  },

  5: function _(done) {
    update();
  }
});

window.addEventListener('keydown', function (_e) {
  if (_e.which === 27) {
    tweak.checkbox('play', { set: false });
  }
});

},{"./compu":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/compu.js","./glcat":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/glcat.js","./step":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/step.js","./stl-loader":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/stl-loader.js","./tweak":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/tweak.js","./xorshift":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/xorshift.js"}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/step.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var step = function step(_obj) {
  var obj = _obj;
  var count = -1;

  var func = function func() {
    count++;
    if (typeof obj[count] === 'function') {
      obj[count](func);
    }
  };
  func();
};

exports.default = step;

},{}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/stl-loader.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _xorshift = require('./xorshift');

var _xorshift2 = _interopRequireDefault(_xorshift);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stlLoader = function stlLoader(_url, _callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', _url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    var view = new DataView(xhr.response);
    var head = 80;

    var triangleLength = view.getUint32(head, true);
    head += 4;

    // ------

    var tris = [];

    for (var iTri = 0; iTri < triangleLength; iTri++) {
      var verts = [];
      var min = [1E9, 1E9, 1E9];
      var max = [-1E9, -1E9, -1E9];
      var cen = [0.0, 0.0, 0.0];

      for (var iVert = 0; iVert < 3; iVert++) {
        verts[iVert] = [];

        for (var iAx = 0; iAx < 3; iAx++) {
          verts[iVert][iAx] = view.getFloat32(head + 12 + 4 * iAx + 12 * iVert, true);
          min[iAx] = Math.min(min[iAx], verts[iVert][iAx]);
          max[iAx] = Math.max(max[iAx], verts[iVert][iAx]);
          cen[iAx] += verts[iVert][iAx];
        }
      }

      cen = cen.map(function (_v) {
        return _v / 3.0;
      });

      tris.push({
        verts: verts,
        min: min,
        max: max,
        cen: cen
      });

      head += 50;
    }

    // ------

    var vLength = function vLength(_v1, _v2) {
      var x = _v2[0] - _v1[0];
      var y = _v2[1] - _v1[1];
      var z = _v2[2] - _v1[2];
      return Math.sqrt(x * x + y * y + z * z);
    };

    var clustersN = 4;
    var clusterDepth = 8;
    var clusterIter = 8;

    var cluster = function cluster(_tris, _vbox1, _vbox2) {
      var clusters = [];
      for (var iClu = 0; iClu < clustersN; iClu++) {
        clusters[iClu] = {
          tris: [],
          min: [1E9, 1E9, 1E9],
          max: [-1E9, -1E9, -1E9],
          cen: [_vbox1[0] + (_vbox2[0] - _vbox1[0]) * (0, _xorshift2.default)(), _vbox1[1] + (_vbox2[1] - _vbox1[1]) * (0, _xorshift2.default)(), _vbox1[2] + (_vbox2[2] - _vbox1[2]) * (0, _xorshift2.default)()],
          newsum: [0.0, 0.0, 0.0]
        };
      }

      for (var iIter = 0; iIter < clusterIter; iIter++) {
        _tris.map(function (_tri) {
          var nearestI = void 0;
          var nearestL = 1E9;

          for (var _iClu = 0; _iClu < clustersN; _iClu++) {
            var l = vLength(_tri.cen, clusters[_iClu].cen);
            if (l < nearestL) {
              nearestI = _iClu;
              nearestL = l;
            }
          }

          clusters[nearestI].tris.push(_tri);
          clusters[nearestI].min = [Math.min(clusters[nearestI].min[0], _tri.min[0]), Math.min(clusters[nearestI].min[1], _tri.min[1]), Math.min(clusters[nearestI].min[2], _tri.min[2])];
          clusters[nearestI].max = [Math.max(clusters[nearestI].max[0], _tri.max[0]), Math.max(clusters[nearestI].max[1], _tri.max[1]), Math.max(clusters[nearestI].max[2], _tri.max[2])];
          clusters[nearestI].newsum = [clusters[nearestI].newsum[0] + _tri.cen[0], clusters[nearestI].newsum[1] + _tri.cen[1], clusters[nearestI].newsum[2] + _tri.cen[2]];
        });

        if (iIter !== clusterIter - 1) {
          for (var _iClu2 = 0; _iClu2 < clustersN; _iClu2++) {
            clusters[_iClu2] = {
              tris: [],
              min: [1E9, 1E9, 1E9],
              max: [-1E9, -1E9, -1E9],
              cen: [clusters[_iClu2].newsum[0] / clusters[_iClu2].tris.length, clusters[_iClu2].newsum[1] / clusters[_iClu2].tris.length, clusters[_iClu2].newsum[2] / clusters[_iClu2].tris.length],
              newsum: [0.0, 0.0, 0.0]
            };
          }
        }
      }

      return clusters;
    };

    var treeClustering = function treeClustering(_tris, _vbox1, _vbox2, _depth) {
      var depth = _depth || 0;
      var tree = {
        min: _vbox1,
        max: _vbox2,
        clusters: cluster(_tris, _vbox1, _vbox2)
      };
      tree.clusters = tree.clusters.filter(function (_ctree) {
        return _ctree.tris.length !== 0;
      });
      if (depth < clusterDepth) {
        for (var iTree = 0; iTree < tree.clusters.length; iTree++) {
          tree.clusters[iTree] = treeClustering(tree.clusters[iTree].tris, tree.clusters[iTree].min, tree.clusters[iTree].max, depth + 1);
        }
      }
      return tree;
    };

    var rootCluster = treeClustering(tris, [-1.0, -1.0, -1.0], [1.0, 1.0, 1.0]);

    // ------

    var construct = function construct(_cluster) {
      var buffer = [];

      if (_cluster.clusters) {
        buffer = buffer.concat([_cluster.min[0], _cluster.min[1], _cluster.min[2], 0, _cluster.max[0], _cluster.max[1], _cluster.max[2], 0, 0.0, 0.0, 0.0, 0.0]);

        var bufferEndIndex = 1;
        _cluster.clusters.map(function (_clu) {
          var nextBuffer = construct(_clu);
          bufferEndIndex += nextBuffer.length / 12;
          buffer = buffer.concat(nextBuffer);
        });
        buffer[7] = bufferEndIndex;
      } else {
        _cluster.tris.map(function (_tri) {
          buffer = buffer.concat([_tri.verts[0][0], _tri.verts[0][1], _tri.verts[0][2], 1, _tri.verts[1][0], _tri.verts[1][1], _tri.verts[1][2], 1, _tri.verts[2][0], _tri.verts[2][1], _tri.verts[2][2], 0]);
        });
      }

      return buffer;
    };

    var buffer = construct(rootCluster);
    while (buffer.length % (768 * 4) !== 0) {
      buffer = buffer.concat([0.0, 0.0, 0.0, -1, 0.0, 0.0, 0.0, 0, 0.0, 0.0, 0.0, 0.0]);
    }

    // ------

    var ret = new Float32Array(buffer);

    _callback({
      triangles: triangleLength,
      length: buffer.length,
      array: ret
    });
  };
  xhr.send();
};

exports.default = stlLoader;

},{"./xorshift":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/xorshift.js"}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/tweak.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tweak = function () {
  function Tweak(_el) {
    _classCallCheck(this, Tweak);

    var it = this;

    it.parent = _el;
    it.values = {};
    it.elements = {};
  }

  _createClass(Tweak, [{
    key: 'button',
    value: function button(_name, _props) {
      var it = this;

      var props = _props || {};

      if (typeof it.values[_name] === 'undefined') {
        var div = document.createElement('div');
        it.parent.appendChild(div);

        var input = document.createElement('input');
        div.appendChild(input);
        input.type = 'button';
        input.value = _name;

        input.addEventListener('click', function () {
          it.values[_name] = true;
        });

        it.elements[_name] = {
          div: div,
          input: input
        };
      }

      var tempvalue = it.values[_name];
      it.values[_name] = false;
      if (typeof props.set === 'boolean') {
        it.values[_name] = props.set;
      }

      return tempvalue;
    }
  }, {
    key: 'checkbox',
    value: function checkbox(_name, _props) {
      var it = this;

      var props = _props || {};

      var value = void 0;

      if (typeof it.values[_name] === 'undefined') {
        value = props.value || false;

        var div = document.createElement('div');
        it.parent.appendChild(div);

        var name = document.createElement('span');
        div.appendChild(name);
        name.innerText = _name;

        var input = document.createElement('input');
        div.appendChild(input);
        input.type = 'checkbox';
        input.checked = value;

        it.elements[_name] = {
          div: div,
          name: name,
          input: input
        };
      } else {
        value = it.elements[_name].input.checked;
      }

      if (typeof props.set === 'boolean') {
        value = props.set;
      }

      it.elements[_name].input.checked = value;
      it.values[_name] = value;

      return it.values[_name];
    }
  }, {
    key: 'range',
    value: function range(_name, _props) {
      var it = this;

      var props = _props || {};

      var value = void 0;

      if (typeof it.values[_name] === 'undefined') {
        (function () {
          var min = props.min || 0.0;
          var max = props.max || 1.0;
          var step = props.step || 0.001;
          value = props.value || min;

          var div = document.createElement('div');
          it.parent.appendChild(div);

          var name = document.createElement('span');
          div.appendChild(name);
          name.innerText = _name;

          var input = document.createElement('input');
          div.appendChild(input);
          input.type = 'range';
          input.value = value;
          input.min = min;
          input.max = max;
          input.step = step;

          var val = document.createElement('span');
          val.innerText = value.toFixed(3);
          div.appendChild(val);
          input.addEventListener('input', function (_event) {
            var value = parseFloat(input.value);
            val.innerText = value.toFixed(3);
          });

          it.elements[_name] = {
            div: div,
            name: name,
            input: input,
            val: val
          };
        })();
      } else {
        value = parseFloat(it.elements[_name].input.value);
      }

      if (typeof props.set === 'number') {
        value = props.set;
      }

      it.values[_name] = value;
      it.elements[_name].input.value = value;

      return it.values[_name];
    }
  }]);

  return Tweak;
}();

exports.default = Tweak;

},{}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/xorshift.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var seed = void 0;
var xorshift = function xorshift(_seed) {
  seed = _seed || seed || 1;
  seed = seed ^ seed << 13;
  seed = seed ^ seed >>> 17;
  seed = seed ^ seed << 5;
  return seed / Math.pow(2, 32) + 0.5;
};

exports.default = xorshift;

},{}]},{},["/Users/Yutaka/Dropbox/pro/_Projects/_eom/20161103/src/script/main.js"]);
