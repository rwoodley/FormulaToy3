import * as THREE from 'three';
import { FontLoader } from 'jsm/loaders/FontLoader.js';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import Stats from 'jsm/libs/stats.module.js';
import { ParametricGeometry } from 'jsm/geometries/ParametricGeometry.js';
import { params } from './params.js';
import { setupDatGui } from './guiStuff.js';
import { updateMeshAppearance } from './guiStuff.js';
import {convertToJavascript} from './FormulaValidationCommon.js'
import {getCleanFormula} from './FormulaValidationCommon.js'
import {getDependentVariable} from './FormulaValidationCommon.js'
import {rotateCameraY} from './utilities.js'

// import { drawCoords  } from './utilities.js';

var _camera, _scene, _renderer;
var _controls;
var _stats;
var _mat;
var _lastMesh;
var _params;
var _font;
var loader = new FontLoader();
loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
    _font = font;
    init();
});
var _drawClicked = false;
function userClickedDraw() {
    _drawClicked = true;
    draw();
}
function clearPlot() {
    if (_lastMesh != undefined) {
        _scene.remove(_lastMesh);
        //		_lastMesh.deallocate();
        _lastMesh = undefined;
    }
}
function draw() {
    clearPlot();
    doPlot();
}
function init() {

    _params = new params(userClickedDraw);
    _params.initFromURL();

    _renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true });

    _renderer.setSize(window.innerWidth, window.innerHeight);
    _renderer.shadowMapEnabled = true;
    _renderer.sortObjects = false; // see http://stackoverflow.com/questions/15994944/transparent-objects-in-threejs
    _renderer.outputEncoding = THREE.sRGBEncoding;

    document.body.appendChild(_renderer.domElement);

    _camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 4000);
    _camera.position.x = 0;
    _camera.position.y = 4;
    _camera.position.z = 8;
    _controls = new OrbitControls(_camera, _renderer.domElement);

    // STATS
    _stats = new Stats();
    document.body.appendChild(_stats.dom);
    _stats.dom.style.position = 'absolute'; // or 'fixed'
    _stats.dom.style.left = '0px';
    _stats.dom.style.bottom = '0px';
    _stats.dom.style.top = '';

	_scene = new THREE.Scene();
    _camera.lookAt(_scene.position);

	var ambientLight = new THREE.AmbientLight(0xffffff, 1);
    _scene.add(ambientLight);

	var spotLight = new THREE.SpotLight( 0xffffff );
	spotLight.position.set( 40, 40, -40);
	spotLight.intensity = 3;
	spotLight.distance=0;
    spotLight.decay = 0;
	_scene.add( spotLight );

	spotLight = new THREE.SpotLight( 0xaaaaff );
	spotLight.position.set(-40, -40, -40);
	spotLight.intensity = 2;
	spotLight.distance=0;
    spotLight.decay = 0;
	_scene.add( spotLight );

    const axesHelper = new THREE.AxesHelper(5); // Length of axes
    _scene.add(axesHelper);
    setupDatGui(_params, _drawClicked, draw, clearPlot, getLastMesh);  // this will draw a shape.
    animate();

}
function getLastMesh() {
    return _lastMesh;
}
function doPlot() {
    _mat = new THREE.MeshPhongMaterial(
    {   color: 0x000000, 
        specular: 0x00ffff, 
        shininess: 200,
        side: THREE.DoubleSide
    }  );

    var statements = _params.formula.replace(/\n/g,'').split(';');
    var jsFormula = "";
    var trimmedUserFormula = "";
    var numValidStatements = 0;
    for (var i = 0; i < statements.length; i++) {
        if (statements[i].length == 0) continue;
        var formulaPiece = convertToJavascript(_params.system, statements[i], "Math.");
        if (jsFormula != null) {
            numValidStatements++;
            trimmedUserFormula += statements[i].trim() + ";";
            jsFormula = jsFormula + formulaPiece + ";";
        }
    }
    if (numValidStatements == 1)
        trimmedUserFormula = trimmedUserFormula.replace(/;/g, '');
    _params.setFormula(getCleanFormula(trimmedUserFormula));
    var dependentVariable = getDependentVariable(_params.formula);

    var prefix, postfix;
    if (_params.system == "cartesian") {
        prefix = dependentVariable == 'x' ?
            "var xx, yy, zz, rr, phi, pp, qq, r1, r2,r3, point; var x = v * 2 - 1; \
        var y = u * 2 - 1; \
        var z = v * 2 - 1; " :
            "var x = u * 2 - 1; \
        var y = v * 2 - 1; \
        var z = v * 2 - 1; " ;

        var postFix = "";
    }
    if (_params.system == "spherical") {
        prefix = dependentVariable != 'phi' ?
            "var phi = u * 2 * Math.PI; \
         var theta = v*Math.PI; \
         var radius = v;" :
            "var phi = v * 2 * Math.PI; \
         var theta = u*Math.PI; \
         var radius = v;" ;

        var postFix =
            "z = radius * Math.cos(theta); \
        x = radius*Math.sin(theta)*Math.cos(phi); \
        y = radius*Math.sin(theta)*Math.sin(phi); \
        ";
    }
    if (_params.system == "toroidal") {
        prefix = dependentVariable != 'phi' ?
            "var phi = u * 2 * Math.PI; \
         var theta = v * 2 * Math.PI; \
         var radius = v;" :
            "var phi = v * 2 * Math.PI; \
         var theta = u * 2 * Math.PI; \
         var radius = v;" ;

        var postFix =
            " \
        z =  radius*Math.sin(theta); \
        var R = 1.0 + radius * Math.cos(theta); \
        x = R * Math.cos(phi); \
        y = R * Math.sin(phi); \
        ";
    }
    if (_params.system == "cylindrical") {
        prefix = dependentVariable != 'phi' ?
            "var phi = u * 2 * Math.PI; \
        var radius = v; \
        var z = v * 2 -1;" :
            "var phi = v * 2 * Math.PI; \
        var radius = u; \
        var z = v * 2 -1;";
        var postFix =
            "var x = radius*Math.cos(phi); \
        var y = radius*Math.sin(phi); \
        ";
    }
    if (_params.system == "parametric") {
        prefix = 'x=u;y=v;z=x*x+y*y;';
        var postFix = "";
    }

    console.log(jsFormula);
    var preprefix = "var pi = Math.PI; var e = Math.E; var p = " + _params.P + ";";
    var newCode = preprefix + prefix + jsFormula + postFix;
    try {
        eval(newCode);
    } catch (e) {
        if (e instanceof SyntaxError) {
            alert('There is a syntax error with your formula. Try again please');
            return;
        }
    }
    newCode += "var scale = 1; target.set(x*scale, z*scale, y*scale);  "; // put this after the eval() or non-Chrome browsers will complain.
    console.log(newCode);
	var myFunc = new Function("u,v,target",newCode);
    doShape(0,0,0,myFunc);
    updateMeshAppearance(_params, getLastMesh);
}
function doShape(x, y, z, daFunc) {
    var Geo3 = new ParametricGeometry(daFunc, 720, 720, false);
    var mesh = new THREE.Mesh( Geo3, _mat );
    mesh.position.x = x; mesh.position.y = y; mesh.position.z = z;
    _scene.add(mesh);
    _lastMesh = mesh;
}
function animate() {
	requestAnimationFrame( animate );
    if (_params.spin) rotateCameraY(_params.spinSpeed, _camera);
    // put the 'lookAt' after the camera rotation or it will be askew.
	_camera.lookAt(new THREE.Vector3(_params.X,_params.Z,_params.Y));
    render();
}
function render() {
    _renderer.render( _scene, _camera );
    _controls.update();
    _stats.update();
}
function SinH(Angle) {                      // Angle in radians
    var e = Math.E;
    var p = Math.pow(e, Angle);
    var n = 1 / p;
    return (p - n) / 2;
} // SinH
function CosH(Angle) {                      // Angle in radians
    var e = Math.E;
    var p = Math.pow(e, Angle);
    var n = 1 / p;
    return (p * 1 + n * 1) / 2;
} // CosH

function torusknot(u, v, R, r, rr, p, q) {
    // Base curve (p, q) torus knot
    let x0 = (R + r * Math.cos(q * u)) * Math.cos(p * u);
    let y0 = (R + r * Math.cos(q * u)) * Math.sin(p * u);
    let z0 = r * Math.sin(q * u);

    // Tangent vector T (derivative of the curve)
    let Tx = -p * (R + r * Math.cos(q * u)) * Math.sin(p * u) - q * r * Math.sin(q * u) * Math.cos(p * u);
    let Ty =  p * (R + r * Math.cos(q * u)) * Math.cos(p * u) - q * r * Math.sin(q * u) * Math.sin(p * u);
    let Tz =  q * r * Math.cos(q * u);

    // Normalize T
    let T_length = Math.sqrt(Tx * Tx + Ty * Ty + Tz * Tz);
    Tx /= T_length;
    Ty /= T_length;
    Tz /= T_length;

    // Arbitrary reference vector (avoid collinearity with T)
    let Ax = 0, Ay = 0, Az = 1;
    if (Math.abs(Tz) > 0.9) { // If T is nearly vertical, use a different reference
        Ax = 1; Ay = 0; Az = 0;
    }

    // Compute Normal vector N (perpendicular to T)
    let Nx = Ay * Tz - Az * Ty;
    let Ny = Az * Tx - Ax * Tz;
    let Nz = Ax * Ty - Ay * Tx;

    // Normalize N
    let N_length = Math.sqrt(Nx * Nx + Ny * Ny + Nz * Nz);
    Nx /= N_length;
    Ny /= N_length;
    Nz /= N_length;

    // Compute Binormal vector B = T × N
    let Bx = Ty * Nz - Tz * Ny;
    let By = Tz * Nx - Tx * Nz;
    let Bz = Tx * Ny - Ty * Nx;

    // Normalize B
    let B_length = Math.sqrt(Bx * Bx + By * By + Bz * Bz);
    Bx /= B_length;
    By /= B_length;
    Bz /= B_length;

    // Apply thickness using N and B
    let x = x0 + rr * (Math.cos(v) * Nx + Math.sin(v) * Bx);
    let y = y0 + rr * (Math.cos(v) * Ny + Math.sin(v) * By);
    let z = z0 + rr * (Math.cos(v) * Nz + Math.sin(v) * Bz);

    return { x, y, z };
}
window.addEventListener('keydown', function (event) {
    //console.log(event.keyCode);
    if (event.keyCode == 13) { // enter key pressed
        _params.draw();
    }
});

