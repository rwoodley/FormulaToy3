var _floorColor = 0x888888;
var _radians = 0;
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function rotateCameraY(radians) {
	var x = _camera.position.x;	var y = _camera.position.y;	var z = _camera.position.z;
	var signx = x > 0 ? 1 : -1;

    // get current radians from z and x coords.
	_radians = x == 0 ? Math.PI/2 : Math.atan(z/x);
    if (signx == -1) _radians += Math.PI;

    _radians += radians;
	if (_radians > Math.PI*2) _radians = _radians%(Math.PI*2);
	while (_radians < 0) _radians += Math.PI*2;

	//console.log( _radians);

	var radius = Math.sqrt(x*x + z*z);
	_camera.position.x = radius * Math.cos(_radians);
	_camera.position.z = radius * Math.sin(_radians);
    //_camera.position.y = 4;
}

function doFloor() {
	//var floorMaterial = new THREE.MeshLambertMaterial( { color: _floorColor, side:THREE.DoubleSide } );
	var floorMaterial = new THREE.MeshPhongMaterial( { color: _floorColor, side:THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(150, 1500,50,50);
	_floor = new THREE.Mesh(floorGeometry, floorMaterial);
	_floor.rotation.x = Math.PI / 2;
	_floor.position.y = -50;
	_floor.receiveShadow = true;
	_scene.add(_floor);
	return _floor;
}
function drawCoords(xtext, ytext, ztext, xlen, ylen, zlen) {
    removeAllMeshes();
    drawLine(xlen, 0, 0, 'purple', xtext);
	drawLine(0,ylen,0,'green', ytext);
	drawLine(0, 0, zlen, 'red', ztext);

	//var gridHelper = new THREE.GridHelper(xlen, xlen / 10.0);
	//_scene.add(gridHelper);
	//saveMesh(gridHelper);
}
function drawCoordsSimple() {
    removeAllMeshes();
    drawLine(10000, 0, 0, 'blue', xtext);
    drawLine(0, 10000, 0, 'green', ytext);
    drawLine(0, 0, 10000, 'red', ztext);

    //var gridHelper = new THREE.GridHelper(xlen, xlen / 10.0);
    //_scene.add(gridHelper);
    //saveMesh(gridHelper);
}
function drawLine(x, y, z, color1, text) {
    drawLineFrom(0, 0, 0, x, y, z, color1);
    drawAxisLabel(x, y, z, color1, text);
}
function drawCoordsFrom(x,y,z,len) {
	drawLineFrom(x,y,z,x+len,y,z,'blue');
	drawLineFrom(x,y,z,x,y+len,z,'red');
	drawLineFrom(x,y,z,x,y,z+len,'green');
}
function drawAxisLabel(x,y,z,color1, textstr) {
    var textGeo = new THREE.TextGeometry(textstr, {

        font: _font,

        size: .2,
        height: .02,
        curveSegments: 12,

    });
    //var color = new THREE.Color(color1);
//    color.setRGB(255, 250, 250);
    var textMaterial = new THREE.MeshBasicMaterial({ color: "white" });
    var text = new THREE.Mesh(textGeo, textMaterial);

    text.position.x = x;
    text.position.y = y;
    text.position.z = z;
    //text.rotation = _camera.rotation;
    _scene.add(text);
    saveMesh(text);
}
function drawLineFrom(x1,y1,z1,x2,y2,z2,color1) {
	var lineGeometry = new THREE.Geometry();
	var vertArray = lineGeometry.vertices;
	vertArray.push( new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2) );
	lineGeometry.computeLineDistances();
	var lineMaterial = new THREE.LineBasicMaterial( { color:color1 } );
	var line = new THREE.Line( lineGeometry, lineMaterial );
	_scene.add(line);
	saveMesh(line);
}
function onWindowResize() {
	_camera.aspect = window.innerWidth / window.innerHeight;
	_camera.updateProjectionMatrix();
	_renderer.setSize( window.innerWidth, window.innerHeight );
}
var _meshList = [];
function saveMesh(mesh) {
    _meshList.push(mesh);
}
function removeAllMeshes() {
    for (var i = 0; i < _meshList.length; i++)
        _scene.remove(_meshList[i]);
    _meshList = [];
}
function eventHandler(canvas, res, e) {
	// z = 90, a=65, x=88, s = 83, c= 67, d = 68, v= 86, f =70
    if (res == 'keydown') {
		console.log(e.keyCode);
		if (e.keyCode == 67) {
			alert(
			_camera.position.x + "," +
			_camera.position.y + "," +
			_camera.position.z);
		}
        else if (e.keyCode >= 48 && e.keyCode < 57) {
            var cnum = e.keyCode - 48;
            var ypos = (cnum - 1)* 30 + -90;
        	_camera.position.y = ypos;
            //alert(_camera.position.x + "," + _camera.position.y + "," + _camera.position.z);
            _camera.lookAt(new THREE.Vector3(100, ypos, 0));
            //alert(_camera.target.position);
        }
	}
}
function shareFormula(filename) {
    var root = location.protocol + '//' + location.host + location.pathname;
    var url = root + _params.toURL("");
    if (filename=='' || filename == null)
        filename = getCurrentDateTimeString();
    saveURLToFile(filename, url);
}
function saveURLToFile(filename, pngUrl) {
    // Request a file handle
    window.showSaveFilePicker({
        suggestedName: filename+".txt",
        types: [{
            description: "txt Files",
            accept: { "text/plain": [".txt"] }
        }]
    }).then(function(fileHandle) {
        // Create a writable stream
        return fileHandle.createWritable().then(function(writable) {
            // Write content to the file
            return writable.write(pngUrl).then(function() {
                // Close the stream to save the file
                return writable.close();
            });
        });
    }).then(function() {
        // alert("URL saved successfully!");
        saveScreenshot(filename);
    }).catch(function(error) {
        console.error("Error saving url file:", error);
    });
}
function saveScreenshot(filename) {
    // Assume this is how you're getting the screenshot as a Data URL
    var pngUrl = _renderer.domElement.toDataURL("image/png"); 

    // Convert Data URL to Blob
    var byteString = atob(pngUrl.split(',')[1]);
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var uint8Array = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([uint8Array], { type: "image/png" });

    // Prompt user to save the file
    window.showSaveFilePicker({
        suggestedName: filename + ".png",
        types: [{
            description: "PNG Image",
            accept: { "image/png": [".png"] }
        }]
    }).then(function(fileHandle) {
        return fileHandle.createWritable().then(function(writable) {
            return writable.write(blob).then(function() {
                return writable.close();
            });
        });
    }).then(function() {
        alert("Screenshot saved successfully!");
    }).catch(function(error) {
        console.error("Error saving screenshot:", error);
    });
}
function getCurrentDateTimeString() {
    var now = new Date();
    
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    var day = String(now.getDate()).padStart(2, '0');
    
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
function exportMeshAsStl() {
    var mesh = _lastMesh;
    var filename = getCurrentDateTimeString();

    // const exporter = new THREE.STLExporter();
    // const stlString = exporter.parse(mesh, { binary: true }); // Use true for binary STL
    const exporter = new THREE.STLBinaryExporter();
    const stlString = exporter.parse(mesh, { binary: true }); // Use true for binary STL

    // Create a Blob with STL data
    // const blob = new Blob([stlString], { type: 'text/plain' });
    const blob = new Blob([stlString], { type: 'application/octet-stream' });

    // Prompt user to save the file
    window.showSaveFilePicker({
        suggestedName: filename + ".stl",
        types: [{
            description: "Binary STL file",
            // accept: { "model/stl": [".stl"] }
            accept: { "application/octet-stream": [".stl"] }
        }]
    }).then(function(fileHandle) {
        return fileHandle.createWritable().then(function(writable) {
            return writable.write(blob).then(function() {
                return writable.close();
            });
        });
    }).then(function() {
        shareFormula(filename);
    }).catch(function(error) {
        console.error("Error saving STL file:", error);
    });

}
