var camera, pos, controls, scene, renderer, geometry, geometry1, material, imgText, imgSonw;
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
mouse.x = -200;
mouse.y = -200;

function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xff0000);
	
	renderer = new THREE.WebGLRenderer();
	
	imgText = new THREE.TextureLoader().load("img/1.png");
	imgSonw = new THREE.TextureLoader().load("img/snow.png");
	
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerWidth);
	
	var container = document.getElementById('container');
	container.appendChild(renderer.domElement);
	
	camera = new THREE.PerspectiveCamera(
		70,
		window.innerWidth / window.innerHeight,
		0.001, 100
	);
	camera.position.set( 0, 0, 1 );
	
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	
	
	
	function loadImages(paths,whenLoaded) {
		var imgs=[];
		paths.forEach(function(path) {
			var img = new Image;
			img.onload = function() {
				imgs.push(img);
				if (imgs.length===paths.length) whenLoaded(imgs);
			};
			img.src = path;
		});
	}
	
	let images = ['img/1.jpg','img/2.jpg'];
	
	let obj = [];
	images.forEach((img) => {
		obj.push({file:img});
});
	console.log(obj);
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
		
		rgb.sort( function( a, b ) {
			return a.c.getHSL().s - b.c.getHSL().s;
		});
		
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
		console.log("ffffffffffffff", (w*h*3) );
		// let positions = new Float32Array(50);
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
			sizeAttenuation: true,
			uniforms: {
				sourceTex: { type: 't', value: obj[0].texture },
				targetTex: { type: 't', value: obj[1].texture },
				blend: { type: 'f', value: 0 },
				size: { type: 'f', value: 15. },				direction: {type: 'f', value: 0},
				dimensions: { type: 'v2', value: new THREE.Vector2(w,h) },
				u_texture: { type: 't', value: imgText },
				u_texture_1: { type: 't', value: imgSonw },
				u_cor: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
			},
			transparent: true,
			alphaTest: 1.,
			side: THREE.DoubleSide,
			vertexShader: document.getElementById( 'particle-vs' ).textContent,
			fragmentShader: document.getElementById( 'particle-fs' ).textContent,
			// blending: THREE.MultiplyBlending
		});
		
		let points = new THREE.Points(geometry, material);
		scene.add(points);
		
		
		
		let tl = new TimelineMax({paused:true, onUpdate:updateStats});
		tl.to(material.uniforms.blend,15,{value:1},0);
		
		$('#container, #btn').on('click',() => {
			
				if($('#container, #btn').hasClass('done')) {
				tl.reverse();
				$('#container, #btn').removeClass('done');
			} else{
				tl.play();
				$('#container, #btn').addClass('done');
			}
		});
		
		
		let cub_g = new THREE.PlaneGeometry(10, 10, 10, 10);
		let material_11 = new THREE.MeshBasicMaterial({
			map: imgText
		});
		let cube = new THREE.Mesh(cub_g, material_11);
		cube.name = 'pol';
		scene.add(cube);
		
		
		window.addEventListener( "click", onMouseMove, false );
		
		
		let starsGeometry = new THREE.Geometry();
		let starsMaterial = new THREE.ParticleBasicMaterial({size: 20, sizeAttenuation: false, color: 0xff00ff});
		
		for (let i = 0; i < 50; i++) {
			let vertex = new THREE.Vector3();
			vertex.x = Math.random() * 2 - 1;
			vertex.y = Math.random() * 2 - 1;
			vertex.z = Math.random() * 2 - 1;
			vertex.name = `name_${i}`;
			starsGeometry.vertices.push(vertex);
		}
		
		let stars = new THREE.ParticleSystem(starsGeometry, starsMaterial);
		scene.add(stars);
	});
	
	
	resize();
}

function updateStats() {
	let zn = Math.random();
	if (zn > 0.5) {
		material.uniforms.direction.value = 1;
	} else {
		material.uniforms.direction.value = 0;
	}
}

function resize() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	renderer.setSize( w, h );
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}

let time = 0;
function animate() {
	time++;
	
	requestAnimationFrame(animate);
	render();
}

function render() {
	renderer.render(scene, camera);
}

function onMouseMove( event ) {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	console.log("ffffffffffffff",  );
	raycaster.setFromCamera( mouse, camera );
	var intersects = raycaster.intersectObjects( scene.children );
	console.log("aaaaaaaaaaaaaaaaaaa", intersects );
	for ( var i = 0; i < intersects.length; i++ ) {
		if (intersects[ i ].object.name == "pol") console.log("eeeeeeeeeeeeee");
		// intersects[ i ].object.material.color.set( 0xff0000 );
	}
}

init();
animate();

window.onresize = function () {
	resize()
}