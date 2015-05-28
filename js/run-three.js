var renderer, scene, camera;

var particles, pGeom, pMat;

var HSCALE = 5;
var VSCALE = 2;

var pointSize = 0.05;

var rotateY = new THREE.Matrix4().makeRotationY( 0.005 );

init();
animate();

function init() {
    
    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 20000 );
    camera.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 25 ) );
    camera.applyMatrix( new THREE.Matrix4().makeRotationX( -0.3 ) );
    scene.add( camera );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    var gpxpoints = getGPXPoints( "round_two_ultra.xml" );

    pGeom = new THREE.Geometry();

    var xvals = [];
    var yvals = [];
    var zvals = [];

    for( var i = 0; i < gpxpoints.length; i++ ) {

        xvals.push( gpxpoints[ i ].x );
        yvals.push( gpxpoints[ i ].y );
        zvals.push( gpxpoints[ i ].z );

    }

    var XMIN = Math.min.apply( null, xvals );
    var XMAX = Math.max.apply( null, xvals );
    var YMIN = Math.min.apply( null, yvals );
    var YMAX = Math.max.apply( null, yvals );
    var ZMIN = Math.min.apply( null, zvals );
    var ZMAX = Math.max.apply( null, zvals );

    var XRANGE = XMAX - XMIN;
    var YRANGE = YMAX - YMIN;
    var ZRANGE = ZMAX - ZMIN;
  
    gpxpoints.forEach( function( p ) {

        var xnorm = 2 * ( p.x - XMIN ) / XRANGE - 1;
        var u = HSCALE * xnorm;

        var ynorm = 2 * ( p.y - YMIN ) / YRANGE - 1;
        var v = VSCALE * ynorm;

        var znorm = 2 * ( p.z - ZMIN ) / ZRANGE - 1;
        var w = HSCALE * ZRANGE / XRANGE * znorm;

        var vertex = new THREE.Vector3( u, v, w );
        pGeom.vertices.push( vertex );

        var color = new THREE.Color();
        color.setRGB( 1.0, ( 1 - ynorm ) / 2, ( 1 - ynorm ) / 2 );
        pGeom.colors.push( color );

    } );

    pMat = new THREE.PointCloudMaterial( { vertexColors: THREE.VertexColors, size: pointSize } );

    particles = new THREE.PointCloud( pGeom, pMat );
    scene.add( particles );

}

function onWindowResize() {

    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

}

function animate() {

    requestAnimationFrame( animate );
    render();

}

function render() {

    camera.applyMatrix( rotateY );
    camera.updateMatrixWorld();

    renderer.render( scene, camera );

}

function getGPXPoints( filename ) {

  var xhttp;
  var xmlDoc;

  if( window.XMLHttpRequest ) {

    xhttp = new XMLHttpRequest();

  } else {

    xhttp = new ActiveXObject( 'Microsoft.XMLHTTP' );

  }

  xhttp.open( 'GET', filename, false );
  xhttp.send();

  xmlDoc = xhttp.responseXML;

  var trkpts = xmlDoc.getElementsByTagName( 'trkpt' );
  var elevations = xmlDoc.getElementsByTagName( 'ele' );
  var points = []

  for( var i = 0; i < trkpts.length; i++ ) {

    var pt = new THREE.Vector3();
    pt.x = parseFloat( trkpts[ i ].getAttribute( 'lat' ) );
    pt.z = parseFloat( trkpts[ i ].getAttribute( 'lon' ) );
    pt.y = parseFloat( elevations[ i ].childNodes[ 0 ].nodeValue );
    points.push( pt );

  }

  return points;

}
