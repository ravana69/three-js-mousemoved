// このクラス内に three.js のコードを書いていきます
class Canvas {
  constructor() {

    /************************/
    /*インタラクション用*/
    /************************/

    //スクロール量
    this.scrollY = 0;
    //マウス座標
    this.mouse = new THREE.Vector2(0, 0);
    //ウィンドウサイズ
    this.w = window.innerWidth;
    this.h = window.innerHeight;


    /************************/
    /*シーン設定*/
    /************************/

    // レンダラー
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.setSize(this.w, this.h);// 描画サイズ
    this.renderer.setPixelRatio(window.devicePixelRatio);// ピクセル比
    this.renderer.setClearColor( 0x111111 );

    //#myCanvasにレンダラーのcanvasを追加
    const container = document.getElementById("myCanvas");
    container.appendChild(this.renderer.domElement);

    // カメラ
    /*js上の数値をpixelに変換する処理*/
    const fov    = 60;
    const fovRad = (fov / 2) * (Math.PI / 180);// 視野角をラジアンに変換
    const dist   = (this.h / 2) / Math.tan(fovRad);// ウィンドウぴったりのカメラ距離
    /* */
    this.camera = new THREE.PerspectiveCamera(fov, this.w / this.h, 1, dist * 2);
    this.camera.position.z = dist;// カメラを遠ざける
    

    // シーン
    this.scene = new THREE.Scene();

    //uniform
    this.uniforms = {
      "time": { value: 1.0 },
      "resolution": { type: "v2", value: new THREE.Vector2(this.renderer.domElement.width,this.renderer.domElement.height) }
    };

    // ライト
    this.directionLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    this.directionLight.position.set(0, 0, 200);// ライトの位置を設定
    this.scene.add(this.directionLight);

    this.ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    this.scene.add(this.ambientLight);


    this.nowX = 0;
    this.nowY = 0;


    /************************/
    /*オブジェクト*/
    /************************/

    this.meshList = [];

      this.mesh = new Donuts(250,this.uniforms); //引数:size,uniforms
      this.scene.add(this.mesh);

    /************************/
    /*画面更新*/
    /************************/

    this.renderer.render(this.scene, this.camera);
    this.render();
  }

  render() {

    requestAnimationFrame(() => { this.render(); });
    // ミリ秒から秒に変換
    const sec = performance.now() / 1000;


    this.nowX += (this.mouse.x - this.nowX) * 0.03;
    this.nowY += (this.mouse.y - this.nowY) * 0.03;
    this.mesh.rotation.x = (Math.PI / 4) +  ( this.nowX - this.camera.position.x ) * 0.01;
    this.mesh.rotation.y = (Math.PI / 4) +  ( this.nowY - this.camera.position.y ) * 0.01;

    // // ライトの xy座標 をマウス位置にする
    // this.directionLight.position.x += (this.nowX - this.directionLight.position.x)*0.1; 
    // this.directionLight.position.y += (this.nowY - this.directionLight.position.y)*0.1;

    this.uniforms.time.value += 0.05;

    this.camera.lookAt( this.scene.position );    // 画面に表示
  
    // 画面に表示
    this.renderer.render(this.scene, this.camera);

  }

  mouseMoved(x, y) {
    this.mouse.x =  x - (this.w / 2);// 原点を中心に持ってくる
    this.mouse.y = -y + (this.h / 2);// 軸を反転して原点を中心に持ってくる

  }

  scrolled(y) {
    this.scrollY = y;
    
  }

  resized() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.renderer.setSize(this.w, this.h);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
  }
};

/** メッシュを継承したドーナツクラスです。 */
class Donuts extends THREE.Mesh {
  /** コンストラクターです。 */
  constructor(size,uniforms) {
    // ジオメトリを作成
    //const geometry = new THREE.TorusGeometry( size, 50, 160, 100 );
    const geometry = new THREE.BoxGeometry( size, size, size );
    //const geometry = new THREE.SphereGeometry(size, 60, 60);
    //const material = new THREE.MeshLambertMaterial({color: 0x66CCFF});
    const material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    } );

    // 継承元のコンストラクターを実行
    super(geometry, material);
  }
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

//このクラス内に ページごとのcanvas外の処理を書いていきます
window.addEventListener('load', function(){

  const canvas = new Canvas();
  canvas.scrolled(window.scrollY);


 
  /************************/
  /*addEventListener*/
  /************************/

  window.addEventListener('mousemove', e => {
    canvas.mouseMoved(e.clientX, e.clientY);
  });

  window.addEventListener('scroll', e => {
    canvas.scrolled(window.scrollY);
  });

  window.addEventListener('resize', e => {
    canvas.resized();
  });

});