const loader=document.getElementById('loader');
// Never let a missing CDN/network connection trap the page on the loading screen.
function hideLoader(){ if(loader){ loader.style.opacity='0'; loader.style.visibility='hidden'; setTimeout(()=>loader.remove(),900); } }
window.addEventListener('load',()=>setTimeout(hideLoader,700));
setTimeout(hideLoader,3500);

const cursor=document.querySelector('.cursor'), ring=document.querySelector('.cursor-ring');
window.addEventListener('mousemove',e=>{
  cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';
  ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';
});
document.querySelectorAll('.magnetic').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
    el.style.transform=`translate(${x*.12}px,${y*.12}px)`;
  });
  el.addEventListener('mouseleave',()=>el.style.transform='');
});

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.14});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));

const sections=[...document.querySelectorAll('main section')], navLinks=[...document.querySelectorAll('.nav nav a')];
window.addEventListener('scroll',()=>{
  let current='home';
  sections.forEach(s=>{if(scrollY>=s.offsetTop-180)current=s.id});
  navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
});

document.querySelector('.menu').addEventListener('click',()=>{
  const nav=document.querySelector('.nav nav');
  const open=nav.style.display==='flex';
  nav.style.display=open?'none':'flex';
  nav.style.position='absolute';nav.style.top='75px';nav.style.left='16px';nav.style.right='16px';
  nav.style.padding='18px';nav.style.flexDirection='column';nav.style.gap='15px';
  nav.style.background='rgba(7,8,15,.95)';nav.style.border='1px solid #292633';nav.style.borderRadius='8px';
});

// ---------- THREE.JS INTERACTIVE HERO ----------
// Three.js is loaded dynamically so the page still works when opened offline.
const mount=document.getElementById('hero-canvas');
function startThree(){
  if(!window.THREE || !mount) return;
  try{
    const THREE=window.THREE;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45,mount.clientWidth/mount.clientHeight,.1,100);
    camera.position.set(0,0,8);
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.setSize(mount.clientWidth,mount.clientHeight);
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x7777aa,1.4));
    const key=new THREE.PointLight(0xb55cff,45,20);key.position.set(2,3,5);scene.add(key);
    const rim=new THREE.PointLight(0x4d8dff,35,18);rim.position.set(-4,1,2);scene.add(rim);

    const astronaut=new THREE.Group();scene.add(astronaut);
    const metal=new THREE.MeshStandardMaterial({color:0x8d8f9b,metalness:.75,roughness:.25});
    const dark=new THREE.MeshStandardMaterial({color:0x171923,metalness:.65,roughness:.28});
    const white=new THREE.MeshStandardMaterial({color:0xcfd2db,metalness:.55,roughness:.3});
    const visorMat=new THREE.MeshStandardMaterial({color:0x050611,metalness:.9,roughness:.08,emissive:0x151044,emissiveIntensity:1.4});
    function add(o){astronaut.add(o);return o}
    function box(s,m,p,rot=[0,0,0]){const o=new THREE.Mesh(new THREE.BoxGeometry(...s),m);o.position.set(...p);o.rotation.set(...rot);return o}
    function sphere(r,m,p){const o=new THREE.Mesh(new THREE.SphereGeometry(r,32,20),m);o.position.set(...p);return o}
    add(sphere(.62,white,[0,1.35,0]));
    const visor=sphere(.47,visorMat,[0,1.38,.42]); visor.scale.set(.98,.72,.35); add(visor);
    add(box([1.05,1.35,.65],dark,[0,.35,0],[.05,0,.02]));
    add(box([.48,1.1,.45],dark,[-.76,.35,0],[0,0,-.16]));
    add(box([.48,1.1,.45],dark,[.76,.35,0],[0,0,.16]));
    add(box([.72,.25,.52],metal,[0,-.48,0]));
    add(box([.45,.95,.45],white,[-.35,-1.05,0],[.06,0,-.06]));
    add(box([.45,.95,.45],white,[.35,-1.05,0],[-.06,0,.06]));
    add(box([.5,.25,.72],dark,[-.35,-1.57,.12],[0,0,-.05]));
    add(box([.5,.25,.72],dark,[.35,-1.57,.12],[0,0,.05]));
    add(box([.65,.85,.28],metal,[0,.45,-.48]));
    astronaut.scale.set(1.05,1.05,1.05); astronaut.rotation.set(.03,-.28,-.06);

    const rocks=new THREE.Group();scene.add(rocks);
    const rockMat=new THREE.MeshStandardMaterial({color:0x30263d,roughness:.9,metalness:.1});
    for(let i=0;i<18;i++){
      const r=.12+Math.random()*.32, rock=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),rockMat);
      const a=Math.random()*Math.PI*2,rad=2.2+Math.random()*2.6;
      rock.position.set(Math.cos(a)*rad,(Math.random()-.5)*3,Math.sin(a)*rad);
      rock.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3); rocks.add(rock);
    }
    const ring=new THREE.Mesh(new THREE.TorusGeometry(2.0,.025,12,160),new THREE.MeshBasicMaterial({color:0x9b59ff}));
    ring.rotation.x=.1;ring.rotation.y=.3;scene.add(ring);
    let mx=0,my=0,targetX=0,targetY=0;
    window.addEventListener('mousemove',e=>{targetX=(e.clientX/innerWidth-.5)*1.1;targetY=(e.clientY/innerHeight-.5)*.7;});
    const clock=new THREE.Clock();
    function animate(){
      requestAnimationFrame(animate); const t=clock.getElapsedTime();
      mx+=(targetX-mx)*.035; my+=(targetY-my)*.035;
      astronaut.rotation.y=-.28+mx*.55+Math.sin(t*.5)*.08;
      astronaut.rotation.x=.03+my*.3+Math.sin(t*1.1)*.025;
      astronaut.position.y=Math.sin(t*1.1)*.09; rocks.rotation.y=t*.035; ring.rotation.z=t*.18;
      ring.position.x=mx*.35;ring.position.y=-my*.2;renderer.render(scene,camera);
    }
    animate();
    window.addEventListener('resize',()=>{camera.aspect=mount.clientWidth/mount.clientHeight;camera.updateProjectionMatrix();renderer.setSize(mount.clientWidth,mount.clientHeight);});
  }catch(err){ console.warn('3D scene unavailable:',err); }
}

const threeScript=document.createElement('script');
threeScript.src='https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
threeScript.onload=()=>{window.__THREE_READY__=true;startThree();};
threeScript.onerror=()=>{console.warn('Three.js could not be loaded. Portfolio will continue in 2D mode.');};
document.head.appendChild(threeScript);
