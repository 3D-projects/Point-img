let camera, pos, controls, scene, renderer, geometry, material;
let time = 0;

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);
	
	renderer = new THREE.WebGLRenderer();
	
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerWidth);
	
	let container = document.getElementById('container');
	container.appendChild(renderer.domElement);
	
	camera = new THREE.PerspectiveCamera(
		45,
		window.innerWidth / window.innerHeight,
		0.001, 1000
	);
	camera.position.set(0, 0, 100);
	
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.minPolarAngle = Math.PI * 1 / 4;
	// controls.maxPolarAngle = Math.PI * 3 / 4;
	controls.minDistance = 10;
	controls.maxDistance = 1250;
	// controls.autoRotate = true;
	// controls.autoRotateSpeed = -1.0;
	controls.update();
	
	resize();
	
	
	let cub_g = new THREE.CubeGeometry(10, 10, 10);
	// let cub_t = new THREE.MeshBasicMaterial({color: 0x7fffb7});
	let cub_t = new THREE.MeshNormalMaterial();
	let cube = new THREE.Mesh(cub_g, cub_t);
	scene.add(cube);
	cube.position.set(-40, 0, 0);
	
	const lightAmb = new THREE.AmbientLight(0xffffff);
	scene.add(lightAmb);
}




function loadImages(paths, whenLoaded) {
	var imgs = [];
	paths.forEach(function (path) {
			var img = new Image;
			img.onload = function () {
				imgs.push(img);
				if (imgs.length === paths.length) whenLoaded(imgs);
			}
			img.src = path;
		}
	);
}

let images = ['img/1.jpg', 'img/2.jpg'];


let obj = [];
images.forEach( (img) => {
	obj.push({file: img});
});


let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);



loadImages(images,function(loadedImages) {
	
	
	obj.forEach((image,index) => {
		let img = loadedImages[index];
	
	canvas.width = img.naturalWidth;
	canvas.height = img.naturalHeight;
	
	ctx.drawImage(img,0,0);
	
	
	
	let data = ctx.getImageData(0,0,canvas.width,canvas.height);
	
	let buffer = data.data;
	
	
	let rgb = [];
	let c = new THREE.Color();
	
	for (var i = 0; i < buffer.length; i=i+4) {
		c.setRGB(buffer[i],buffer[i+1],buffer[i+2]);
		rgb.push({c: c.clone(),id: i/4});
	}
	
	console.log(rgb);
	
	let result = new Float32Array(img.width*img.height*2);
	let j = 0;
	
	// rgb.sort( function( a, b ) {
	// 	return a.c.getHSL().s - b.c.getHSL().s;
	// });
	
	rgb.forEach(e => {
		result[j] = e.id % img.width;
	result[j+1] = Math.floor(e.id / img.height);
	j= j +2;
});
	
	console.log(result,'result');
	
	obj[index].image = img;
	obj[index].texture = new THREE.Texture(img);
	obj[index].buffer = result;
	obj[index].texture.needsUpdate = true;
	obj[index].texture.flipY = false;
});
	
	
	console.log(obj);
	
	
	var w = loadedImages[0].width;
	var h = loadedImages[0].height;
	
	let positions = new Float32Array(w*h*3);
	let index = 0;
	for (var i = 0; i < w; i++) {
		for (var j = 0; j < h; j++) {
			positions[index*3] = j;
			positions[index*3+1] = i;
			positions[index*3+2] = 0;
			index++;
		}
	}
	
	let geometry = new THREE.BufferGeometry();
	
	geometry.addAttribute('position', new THREE.BufferAttribute(positions,3));
	
	geometry.addAttribute('source',new THREE.BufferAttribute(obj[0].buffer,2));
	geometry.addAttribute('target',new THREE.BufferAttribute(obj[1].buffer,2));
	
	material = new THREE.RawShaderMaterial( {
		uniforms: {
			sourceTex: { type: 't', value: obj[0].texture },
			targetTex: { type: 't', value: obj[1].texture },
			blend: { type: 'f', value: 0 },
			size: { type: 'f', value: 2.1 },
			dimensions: { type: 'v2', value: new THREE.Vector2(w,h) }
		},
		vertexShader: document.getElementById( 'particle-vs' ).textContent,
		fragmentShader: document.getElementById( 'particle-fs' ).textContent,
	});
	
	let points = new THREE.Points(geometry, material);
	scene.add(points);
	
	
	
	let tl = new TimelineMax({paused:true});
	console.log(material);
	tl
		.to(material.uniforms.blend,3,{value:1},0);
	$('body').on('click',() => {
		
		if($('body').hasClass('done')) {
		tl.reverse();
		$('body').removeClass('done');
	} else{
		tl.play();
		$('body').addClass('done');
	}
});

})


function resize() {
	let w = window.innerWidth;
	let h = window.innerHeight;
	renderer.setSize(w, h);
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}


function animate() {
	time++;
	controls.update();
	requestAnimationFrame(animate);
	render();
}

function render() {
	renderer.render(scene, camera);
}

window.onresize = function () {
	resize()
}


// $('body').on('click', function () {
// 	let t1 = new TimelineMax();
// 	t1.to(material.uniforms.blend, 1, {value: 1}, 0);
// })


init();
animate();