#define MARCH_ITER 200
#define RAYAMP_MIN 0.01
#define REFLECT_MAX 10.0
#define REFLECT_PER_PATH 1
#define INIT_LEN 1E-3

// -----

#define MTL_AIR 1
#define MTL_FLOOR 4
#define MTL_LIGHT 5
#define MTL_REFRACT 6
#define MTL_STATUE 7
#define MTL_EOM 8
#define MTL_MACPLUS 9
#define MTL_DISPLAY 10
#define MTL_ART 11

// ------

#define HUGE 9E16
#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)
#define lofi(i,m) (floor((i)/(m))*(m))

// ------

#extension GL_EXT_draw_buffers : require
precision highp float;

uniform float time;
uniform vec2 resolution;
uniform bool reset;

uniform vec2 textureModelStatueReso;
uniform vec2 textureModelEOMReso;
uniform vec2 textureModelMacPlusReso;

uniform sampler2D textureRandom;
uniform sampler2D textureRandomStatic;

uniform sampler2D textureModelStatue;
uniform sampler2D textureModelEOM;
uniform sampler2D textureModelMacPlus;

uniform sampler2D textureDrawBuffers0;
uniform sampler2D textureDrawBuffers1;
uniform sampler2D textureDrawBuffers2;
uniform sampler2D textureDrawBuffers3;

uniform sampler2D textureImageArt;
uniform sampler2D textureImageCompu;

// ------

vec4 seed;
float random() { // weird prng
  const vec4 q = vec4(   1225.0,    1585.0,    2457.0,    2098.0);
  const vec4 r = vec4(   1112.0,     367.0,      92.0,     265.0);
  const vec4 a = vec4(   3423.0,    2646.0,    1707.0,    1999.0);
  const vec4 m = vec4(4194287.0, 4194277.0, 4194191.0, 4194167.0);

  vec4 beta = floor(seed / q);
  vec4 p = a * (seed - beta * q) - beta * r;
  beta = (sign(-p) + vec4(1.0)) * vec4(0.5) * m;
  seed = (p + beta);

  return fract(dot(seed / m, vec4(1.0, -1.0, 1.0, -1.0)));
}

vec4 random4() {
  return vec4(
    random(),
    random(),
    random(),
    random()
  );
}

// ------

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

bool isUvValid( vec2 _v ) {
  return ( 0.0 <= _v.x ) && ( _v.x <= 1.0 ) && ( 0.0 <= _v.y ) && ( _v.y <= 1.0 );
}

vec4 noise( vec2 _uv ) {
  vec4 sum = V.xxxx;
  for ( int i = 0; i < 6; i ++ ) {
    float mul = pow( 2.0, float( i ) );
    sum += texture2D( textureRandomStatic, _uv / 64.0 * mul ) / 2.0 / mul;
  }
  return sum;
}

// ------

vec2 randomCircle() {
  vec2 v = V.xx;
  for ( int i = 0; i < 99; i ++ ) {
    v = random4().xy * 2.0 - 1.0;
    if ( length( v ) < 1.0 ) { break; }
  }
  return v;
}

vec3 randomSphere() {
  vec3 v = V.xxx;
  for ( int i = 0; i < 99; i ++ ) {
    v = random4().xyz * 2.0 - 1.0;
    if ( length( v ) < 1.0 ) { break; }
  }
  v = normalize( v );
  return v;
}

vec3 randomHemisphere( in vec3 _normal ) {
  vec3 v = randomSphere();
  if ( dot( v, _normal ) < 0.0 ) { v = -v; }
  return v;
}

// Ref: https://pathtracing.wordpress.com/2011/03/03/cosine-weighted-hemisphere/
vec3 randomHemisphereCosWeighted( in vec3 _normal ) {
  float theta = acos( sqrt( 1.0 - random() ) );
  float phi = 2.0 * PI * random();

  vec3 sid = (
    0.5 < abs( dot( V.xyx, _normal ) )
    ? normalize( cross( V.xxy, _normal ) )
    : normalize( cross( V.xyx, _normal ) )
  );
  vec3 top = normalize( cross( _normal, sid ) );

  return (
    sid * sin( theta ) * cos( phi )
    + top * sin( theta ) * sin( phi )
    + _normal * cos( theta )
  );
}

// ------

struct Camera {
  vec3 pos;
  vec3 dir;
  vec3 sid;
  vec3 top;
};

struct Ray {
  vec3 dir;
  vec3 ori;
  int mtl;
};

struct Intersection {
  Ray ray;
  float len;
  vec3 pos;
  vec3 normal;
  int mtl;
  vec4 props;
};

struct Material {
  vec3 color;
  vec3 emissive;
  float reflective;
  float reflectiveRoughness;
  float refractive;
  float refractiveRoughness;
  float refractiveIndex;
};

// ------

Camera camInit( in vec3 _pos, in vec3 _tar ) {
  Camera cam;
  cam.pos = _pos;
  cam.dir = normalize( _tar - _pos );
  cam.sid = normalize( cross( cam.dir, V.xyx ) );
  cam.top = normalize( cross( cam.sid, cam.dir ) );

  return cam;
}

Ray rayInit( in vec3 _ori, in vec3 _dir, in int _mtl ) {
  Ray ray;
  ray.dir = _dir;
  ray.ori = _ori + _dir * INIT_LEN;
  ray.mtl = _mtl;
  return ray;
}

Ray rayFromCam( in vec2 _p, in Camera _cam ) {
  vec3 dir = normalize( _p.x * _cam.sid + _p.y * _cam.top + _cam.dir * 2.0 * ( 1.0 - length( _p.xy ) * 0.0 ) );
  return rayInit( _cam.pos, dir, 1 );
}

Intersection interInit( in Ray _ray, in float _len, in vec3 _nor ) {
  Intersection inter;
  inter.ray = _ray;
  inter.len = _len;
  inter.pos = _ray.ori + _ray.dir * inter.len;
  inter.normal = _nor;
  inter.mtl = MTL_AIR;
  inter.props = V.xxxx;
  return inter;
}

Intersection applyIntersection( in Intersection _old, in Intersection _new ) {
  Intersection inter = _old;
  inter.len = _new.len;
  inter.pos = inter.ray.ori + inter.ray.dir * inter.len;
  inter.normal = _new.normal;
  inter.mtl = _new.mtl;
  inter.props = _new.props;
  return inter;
}

Material mtlInit() {
  Material material;
  material.color = V.xxx;
  material.emissive = V.xxx;
  material.reflective = 0.0;
  material.reflectiveRoughness = 0.0;
  material.refractive = 0.0;
  material.refractiveRoughness = 0.0;
  material.refractiveIndex = 1.0;
  return material;
}

// ------

Intersection sphere( in Ray _ray, in vec3 _pos, in float _r ) {
  float eqb = dot( _ray.dir, _ray.ori - _pos );
  float eqc = dot( _ray.ori - _pos, _ray.ori - _pos ) - _r * _r;
  float eqd = eqb * eqb - eqc;

  float len = HUGE;
  if ( 0.0 <= eqd ) {
    len = -eqb - sqrt( eqd );
    len = len <= 0.0 ? -eqb + sqrt( eqd ) : len;
    len = len < 0.0 ? HUGE : len; 
  }

  Intersection inter = interInit( _ray, len, V.xxy );
  inter.normal = normalize( inter.pos - _pos );
  return inter;
}

Intersection plane( in Ray _ray, in vec3 _pos, in vec3 _nor ) {
  float len = ( dot( _nor, _ray.ori ) - dot( _nor, _pos ) ) / dot( -_nor, _ray.dir );
  len = len < 0.0 ? HUGE : len; 

  Intersection inter = interInit( _ray, len, _nor );
  return inter;
}

Intersection mesh( in Ray _ray, in sampler2D _model, in vec2 _reso ) {
  float minLen = HUGE;
  vec3 minNor = V.xxy;

  float pos = 0.0;

  for ( int i = 0; i < 1000; i ++ ) {
    vec2 coord = vec2( mod( pos, 256.0 ) * 3.0, floor( pos / 256.0 ) ) + vec2( 0.5 );
    vec4 tex1 = texture2D( _model, ( V.yx * 0.0 + coord ) / _reso );
    vec4 tex2 = texture2D( _model, ( V.yx * 1.0 + coord ) / _reso );
    vec4 tex3 = texture2D( _model, ( V.yx * 2.0 + coord ) / _reso );

    if ( tex1.w == 0.0 ) {
      float len1 = ( _ray.ori.x - tex1.x ) / _ray.dir.x; 
      float len2 = ( _ray.ori.x - tex2.x ) / _ray.dir.x;
      float lenMin = min( len1, len2 );
      float lenMax = max( len1, len2 );

      len1 = ( _ray.ori.y - tex1.y ) / _ray.dir.y; 
      len2 = ( _ray.ori.y - tex2.y ) / _ray.dir.y;
      lenMin = max( lenMin, min( len1, len2 ) );
      lenMax = min( lenMax, max( len1, len2 ) );

      len1 = ( _ray.ori.z - tex1.z ) / _ray.dir.z; 
      len2 = ( _ray.ori.z - tex2.z ) / _ray.dir.z;
      lenMin = max( lenMin, min( len1, len2 ) );
      lenMax = min( lenMax, max( len1, len2 ) );

      if ( lenMin <= lenMax ) {
        pos += 1.0;
      } else {
        pos += tex2.w;
      }
    } else if ( tex1.w == 1.0 ) {
      vec3 v1 = tex2.xyz - tex1.xyz;
      vec3 v2 = tex3.xyz - tex1.xyz;
      vec3 nor = normalize( cross( v1, v2 ) );
      nor = ( 0.0 < dot( nor, _ray.dir ) ) ? -nor : nor;

      float len = ( dot( nor, _ray.ori ) - dot( nor, tex1.xyz ) ) / dot( -nor, _ray.dir );
      if ( 0.0 < len && len < minLen ) {
        vec3 pos = _ray.ori + _ray.dir * len;
        vec3 c1 = cross( pos - tex1.xyz, tex2.xyz - tex1.xyz );
        vec3 c2 = cross( pos - tex2.xyz, tex3.xyz - tex2.xyz );
        vec3 c3 = cross( pos - tex3.xyz, tex1.xyz - tex3.xyz );
        if ( 0.0 < dot( c1, c2 ) && 0.0 < dot( c2, c3 ) ) {
          minLen = len;
          minNor = nor;
        }
      }

      pos += 1.0;
    } else {
      break;
    }
  }

  Intersection inter = interInit( _ray, minLen, minNor );
  return inter;
}

Intersection map( in Ray _ray ) {
  Intersection inter = interInit( _ray, HUGE, V.xxy );

  { // floor
    Intersection intert = plane( inter.ray, -V.xyx, V.xyx );
    if ( intert.len < inter.len ) {
      inter = applyIntersection( inter, intert );
      inter.mtl = MTL_FLOOR;
      inter.props.x = smoothstep( -0.01, 0.01, cos( inter.pos.x * 10.0 ) * cos( inter.pos.z * 10.0 ) );
    }
  }

  { // wall
    Intersection intert = plane( inter.ray, -V.xxy * 2.0, V.xxy );
    if ( intert.len < inter.len ) {
      inter = applyIntersection( inter, intert );
      inter.mtl = MTL_FLOOR;
      inter.props.x = 1.0;
    }
  }

  { // picture
    Ray ray = inter.ray;
    ray.ori -= vec3( -0.7, 1.0, 0.0 );
    Intersection intert = plane( ray, -V.xxy * 1.9, V.xxy );
    if ( ( intert.len < inter.len ) && abs( intert.pos.x ) < 1.4 && abs( intert.pos.y ) < 1.0 ) {
      inter = applyIntersection( inter, intert );
      inter.mtl = MTL_ART;
      inter.props.xy = intert.pos.xy / vec2( 1.4, 1.0 );
    }
  }

  { // helios
    float rotate = -time * PI * 2.0;

    Ray ray = inter.ray;
    ray.ori -= vec3( 0.6, 0.0, -0.2 );
    ray.ori.zx = rotate2D( -rotate ) * ray.ori.zx;
    ray.dir.zx = rotate2D( -rotate ) * ray.dir.zx;
    Intersection intert = mesh( ray, textureModelStatue, textureModelStatueReso );
    if ( intert.len < inter.len ) {
      inter = applyIntersection( inter, intert );
      inter.normal.zx = rotate2D( rotate ) * inter.normal.zx;
      inter.mtl = MTL_STATUE;
    }
  }

  { // macplus
    float rotate = 0.4;
    float scale = 0.6;

    Ray ray = inter.ray;
    ray.ori -= vec3( -0.95, -0.4, -0.4 );
    ray.ori /= scale;
    ray.dir /= scale;
    ray.ori.zx = rotate2D( -rotate ) * ray.ori.zx;
    ray.dir.zx = rotate2D( -rotate ) * ray.dir.zx;

    {
      Intersection intert = mesh( ray, textureModelMacPlus, textureModelMacPlusReso );
      if ( intert.len < inter.len ) {
        inter = applyIntersection( inter, intert );
        inter.normal *= scale;
        inter.normal.zx = rotate2D( rotate ) * inter.normal.zx;
        inter.mtl = MTL_MACPLUS;
      }
    }

    {
      Intersection intert = plane( ray, V.xxy * 0.7, normalize( vec3( 0.0, 0.05, 1.0 ) ) );
      if ( ( intert.len < inter.len ) && abs( intert.pos.x ) < 0.58 && abs( intert.pos.y - 0.3 ) < 0.42 ) {
        inter = applyIntersection( inter, intert );
        inter.normal *= scale;
        inter.normal.zx = rotate2D( rotate ) * inter.normal.zx;
        inter.mtl = MTL_DISPLAY;
        inter.props.xy = ( intert.pos.xy - vec2( 0.0, 0.3 ) ) / vec2( 0.48, 0.36 );
      }
    }
  }

  if(false){ // refract
    Ray ray = inter.ray;
    ray.ori.zx = rotate2D( 1.0 ) * ray.ori.zx;
    ray.dir.zx = rotate2D( 1.0 ) * ray.dir.zx;
    Intersection intert = mesh( ray, textureModelStatue, textureModelStatueReso );
    // Intersection intert = sphere( ray, V.xxx, 0.5 );
    if ( intert.len < inter.len ) {
      inter = applyIntersection( inter, intert );
      // inter.normal = ray.mtl == MTL_REFRACT ? -inter.normal : inter.normal;
      inter.normal.zx = rotate2D( -1.0 ) * inter.normal.zx;
      inter.mtl = ray.mtl == MTL_REFRACT ? MTL_AIR : MTL_REFRACT;
    }
  }

  { // eom
    Ray ray = inter.ray;
    ray.ori -= vec3( 0.0, -0.8, 0.7 );
    Intersection intert = mesh( ray, textureModelEOM, textureModelEOMReso );
    if ( intert.len < inter.len ) {
      inter = applyIntersection( inter, intert );
      inter.mtl = MTL_EOM;
      inter.props.x = dot( inter.normal, V.xxy ); 
    }
  }

  { // light
    Intersection intert = sphere( inter.ray, vec3( 0.0, 3.0, 2.0 ), 1.0 );
    if ( intert.len < inter.len ) {
      inter = intert;
      inter.mtl = MTL_LIGHT;
    }
  }

  return inter;
}

// ------

Material getMtl( int _mtl, vec4 _props ) {
  Material mtl = mtlInit();

  if ( _mtl == MTL_AIR ) {
    mtl.color = vec3( 1.0 );
    mtl.refractive = 1.0;
    mtl.refractiveIndex = 1.0;

  } else if ( _mtl == MTL_FLOOR ) {
    mtl.color = mix(
      vec3( 0.2 ),
      vec3( 0.9, 0.4, 0.7 ),
      _props.x
    );

  } else if ( _mtl == MTL_LIGHT ) {
    mtl.emissive = 20.0 * vec3( 0.9, 0.6, 0.8 );

  } else if ( _mtl == MTL_REFRACT ) {
    mtl.color = vec3( 0.9 );
    mtl.refractive = 1.0;
    mtl.refractiveIndex = 1.4;

  } else if ( _mtl == MTL_STATUE ) {
    mtl.color = vec3( 0.8, 0.8, 0.7 );
    mtl.reflective = 0.02;
    mtl.reflectiveRoughness = 0.04;

  } else if ( _mtl == MTL_MACPLUS ) {
    mtl.color = vec3( 0.9, 0.9, 0.8 );
    mtl.reflective = 0.02;
    mtl.reflectiveRoughness = 0.002;

  } else if ( _mtl == MTL_DISPLAY ) {
    mtl.color = vec3( 0.5 );
    mtl.reflective = 1.0;

    vec3 emi = V.xxx;
    if ( abs( _props.x ) < 1.0 && abs( _props.y ) < 1.0 ) {
      vec3 img = texture2D( textureImageCompu, 0.5 + vec2( 0.5, -0.5 ) * _props.xy ).xyz;
      emi = mix(
        vec3( 0.1, 0.9, 0.6 ),
        vec3( 0.9, 0.1, 0.6 ),
        _props.y * 0.5 + 0.5
      );
      emi = img;
    }
    mtl.emissive = emi * 2.0;

  } else if ( _mtl == MTL_EOM ) {
    mtl.color = mix(
      vec3( 0.2, 0.5, 0.7 ),
      vec3( 0.5, 0.9, 0.2 ),
      abs( _props.x )
    );
    mtl.emissive = mtl.color * 0.6;
    mtl.reflective = 0.0;

  } else if ( _mtl == MTL_ART ) {
    vec3 img = texture2D( textureImageArt, 0.5 + vec2( 0.5, -0.5 ) * _props.xy ).xyz;
    vec3 col = img.xzy * mix(
      vec3( 0.8, 1.3, 1.4 ),
      vec3( 1.4, 1.1, 0.8 ),
      _props.y * 0.5 + 0.5
    );
    mtl.color = col;

  }

  return mtl;
}

// ------

Ray shade( in Intersection _inter, inout vec3 colorAdd, inout vec3 colorMul ) {
  Intersection inter = _inter;

  if ( inter.len != HUGE ) {
    vec3 normal = inter.normal;

    int rayMtl = inter.ray.mtl;
    Material material = getMtl( inter.mtl, inter.props );

    vec3 dir = V.xxx;
    float dice = random4().x;

    colorAdd += colorMul * material.emissive;

    colorMul *= material.color;
    if ( dice < material.reflective ) { // reflect
      vec3 ref = normalize( reflect(
        inter.ray.dir,
        normal
      ) );
      vec3 dif = randomHemisphere( normal );
      dir = normalize( mix(
        ref,
        dif,
        material.reflectiveRoughness
      ) );
      colorMul *= max( dot( dir, ref ), 0.0 );

    } else if ( dice < material.reflective + material.refractive ) { // refract
      vec3 inc = normalize( inter.ray.dir );
      float eta = getMtl( inter.ray.mtl, V.xxxx ).refractiveIndex / material.refractiveIndex;

      vec3 ref = refract( inc, normal, eta );
      ref = ( ref == V.xxx )
      ? ( normalize( reflect(
        inter.ray.dir,
        normal
      ) ) )
      : normalize( ref );

      vec3 dif = randomHemisphere( -normal );
      dir = normalize( mix(
        ref,
        dif,
        material.refractiveRoughness
      ) );
      colorMul *= max( dot( dir, ref ), 0.0 );
      
      rayMtl = inter.mtl;

    } else { // diffuse
      dir = randomHemisphereCosWeighted( normal );
      colorMul *= 1.0;
    }
    
    Ray ray = rayInit( inter.pos, dir, rayMtl );
    return ray;
  } else {
    // colorAdd += colorMul * vec3( 0.9 );
    colorMul *= 0.0;

    return rayInit( V.xxy, V.xxy, MTL_AIR );
  }
}

// ------

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  seed = texture2D( textureRandom, gl_FragCoord.xy / resolution );

  vec4 tex0 = texture2D( textureDrawBuffers0, uv );
  vec4 tex1 = texture2D( textureDrawBuffers1, uv );
  vec4 tex2 = texture2D( textureDrawBuffers2, uv );
  vec4 tex3 = texture2D( textureDrawBuffers3, uv );

  vec3 colorAdd = abs( tex1.xyz ) - 1E-2;
  vec3 colorMul = abs( tex2.xyz ) - 1E-2;
  vec3 colorOut = tex3.xyz;
  int rayMtl = int( abs( tex2.w ) );
  float depth = ( tex1.x < 0.0 ? 0.0 : 1.0 ) + ( tex1.y < 0.0 ? 0.0 : 2.0 ) + ( tex1.z < 0.0 ? 0.0 : 4.0 ) + ( tex2.x < 0.0 ? 0.0 : 8.0 ) + ( tex2.y < 0.0 ? 0.0 : 16.0 ) + ( tex2.z < 0.0 ? 0.0 : 32.0 );
  float samples = abs( tex3.w );

  Ray ray;
  vec3 dir = vec3( tex0.w, tex1.w, 0.0 );
  dir.z = sqrt( 1.0 - dot( dir, dir ) ) * sign( tex2.w );
  ray = rayInit( tex0.xyz, dir, rayMtl );

  if ( reset ) {
    colorOut = V.xxx;
    colorAdd = V.xxx;
    samples = 0.0;
  }

  for ( int i = 0; i < REFLECT_PER_PATH; i ++ ) {

    if ( reset || REFLECT_MAX <= depth || length( colorMul ) < RAYAMP_MIN ) {
      samples += 1.0;
      depth = 0.0;

      colorOut = mix(
        colorOut,
        max( V.xxx, colorAdd ),
        1.0 / samples
      );

      // ------

      vec3 camTar = vec3( 0.0, 0.0, 0.0 );
      Camera cam = camInit(
        vec3( 0.0, 0.0, 3.0 ),
        camTar
      );

      // dof
      vec2 dofCirc = randomCircle() * 0.01;
      cam.pos += dofCirc.x * cam.sid;
      cam.pos += dofCirc.y * cam.top;

      cam = camInit( cam.pos, camTar );

      // antialias
      vec2 pix = gl_FragCoord.xy + random4().xy - 0.5;

      vec2 p = ( pix * 2.0 - resolution ) / resolution.x;
      ray = rayFromCam( p, cam );

      colorAdd = V.xxx;
      colorMul = V.yyy;
    } else {
      depth += 1.0;
    }

    Intersection inter = map( ray );
    ray = shade( inter, colorAdd, colorMul );

  }

  // ------

  vec3 depthBits1 = vec3(
    mod( depth, 2.0 ) < 1.0 ? -1.0 : 1.0,
    mod( depth / 2.0, 2.0 ) < 1.0 ? -1.0 : 1.0,
    mod( depth / 4.0, 2.0 ) < 1.0 ? -1.0 : 1.0
  );

  vec3 depthBits2 = vec3(
    mod( depth / 8.0, 2.0 ) < 1.0 ? -1.0 : 1.0,
    mod( depth / 16.0, 2.0 ) < 1.0 ? -1.0 : 1.0,
    mod( depth / 32.0, 2.0 ) < 1.0 ? -1.0 : 1.0
  );

  gl_FragData[ 0 ] = vec4( ray.ori, ray.dir.x );
  gl_FragData[ 1 ] = vec4( ( colorAdd + 1E-2 ) * depthBits1, ray.dir.y );
  gl_FragData[ 2 ] = vec4( ( colorMul + 1E-2 ) * depthBits2, float( ray.mtl ) * ( ( 0.0 < ray.dir.z ) ? 1.0 : -1.0 ) );
  gl_FragData[ 3 ] = vec4( colorOut, samples );
}
