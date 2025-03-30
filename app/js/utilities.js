import * as THREE from 'three';


var _floorColor = 0x888888;
var _radians = 0;
export function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export function rotateCameraY(radians, _camera) {
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

export function onWindowResize() {
	_camera.aspect = window.innerWidth / window.innerHeight;
	_camera.updateProjectionMatrix();
	_renderer.setSize( window.innerWidth, window.innerHeight );
}
var _meshList = [];
export function saveMesh(mesh) {
    _meshList.push(mesh);
}
export function removeAllMeshes() {
    for (var i = 0; i < _meshList.length; i++)
        _scene.remove(_meshList[i]);
    _meshList = [];
}
export function eventHandler(canvas, res, e) {
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
export function shareFormula(filename) {
    var root = location.protocol + '//' + location.host + location.pathname;
    var url = root + _params.toURL("");
    if (filename=='' || filename == null)
        filename = getCurrentDateTimeString();
    saveURLToFile(filename, url);
}
export function saveURLToFile(filename, pngUrl) {
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
export function saveScreenshot(filename) {
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
export function getCurrentDateTimeString() {
    var now = new Date();
    
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    var day = String(now.getDate()).padStart(2, '0');
    
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}
export function exportMeshAsStl() {
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
