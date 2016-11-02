import step from './step';

let canvas = document.createElement( 'canvas' );
let context = canvas.getContext( '2d' );

let width = canvas.width = 320;
let height = canvas.height = 240;

// ------

let gradientBg = context.createLinearGradient( 0, 0, 0, 240 );
gradientBg.addColorStop( 0, 'rgb( 50, 80, 100 )' );
gradientBg.addColorStop( 1, 'rgb( 120, 50, 80 )' );

let gradientFg = context.createLinearGradient( 0, 0, 0, 240 );
gradientFg.addColorStop( 0, 'rgb( 240, 60, 40 )' );
gradientFg.addColorStop( 1, 'rgb( 200, 170, 20 )' );

// ------

let imageComputer = new Image();
let imageEarth = new Image();
let imagePalm = new Image();
let imageCursor = new Image();
let imageCD = new Image();

// ------

let prepare = ( _callback ) => {
  step( {
    0: ( done ) => {
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

    5: ( done ) => {
      _callback();
    }
  } );
};

// ------

let update = ( _time ) => {
  context.fillStyle = gradientBg;
  context.fillRect( 0, 0, width, height );

  // ------

  context.save();
  context.translate( 100 - 5, 40 - 5 );
  context.rotate( 0.1 + 0.2 * Math.sin( _time * Math.PI * 4.0 - 0.5 ) );

  context.drawImage( imageComputer, -40, -40, 80, 80 );
  
  context.restore();

  // ------

  context.save();
  context.translate( 260, 60 );
  context.rotate( -0.3 - _time * Math.PI * 4.0 );

  context.drawImage( imageCD, -50, -50, 100, 100 );
  
  context.restore();

  // ------

  context.save();
  context.translate( 50, 160 );
  context.rotate( _time * Math.PI * 2.0 );

  context.drawImage( imageEarth, -50, -50, 100, 100 );
  
  context.restore();

  context.save();
  context.translate( 30, 160 );

  context.drawImage( imageCursor, 0, 0, 80.0, 80.0 );
  
  context.restore();

  // ------

  context.save();
  context.translate( 160, 130 );
  context.rotate( 0.1 + 0.1 * Math.sin( _time * Math.PI * 4.0 ) );

  context.fillStyle = '#000000';
  context.fillRect( -40, -40, 90, 90 );

  context.fillStyle = gradientFg;
  context.fillRect( -50, -50, 90, 90 );

  context.restore();

  context.save();
  context.translate( 210, 240 );
  context.rotate( 0.3 * Math.sin( _time * Math.PI * 2.0 ) );

  context.drawImage( imagePalm, -60, -100, 120, 120 );
  
  context.restore();

  // ------

  context.fillStyle = '#000000';
  context.font = 'bold 80px "HGP教科書体"';
  context.fillText( '美学', 84, 164 );

  context.fillStyle = '#6600ff';
  context.font = 'bold 80px "HGP教科書体"';
  context.fillText( '美学', 80, 160 );
};

// ------

export default {
  prepare: prepare,
  canvas: canvas,
  update: update
};