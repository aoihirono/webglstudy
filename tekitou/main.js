var c, gl, vs, fs, fs2, run, q, qt;
var textures = [];
var tiles = [];
var move;

// マウスムーブイベントに登録する処理
function qtnMouse(e){
	var cw = c.width;
	var ch = c.height;
	var wh = 1 / Math.sqrt(cw * cw + ch * ch);
	var x = e.clientX - c.offsetLeft - cw * 0.5;
	var y = -(e.clientY - c.offsetTop - ch * 0.5)/5 + 50;
	var sq = Math.sqrt(x * x + y * y);
	var r = sq * 2.0 * Math.PI * wh;
	if(sq != 1){
		sq = 1 / sq;
		x *= sq;
		y *= sq;
	}
	q.rotate(r, [y, x, 0.0], qt);
}

function posMove(e){
    move =  e.clientX/c.width;
}

window.onload = function(){
	// - keydown イベントへの関数の登録 -------------------------------------------
	window.addEventListener('keydown', function(eve){run = eve.keyCode !== 27;}, true);


	// - canvas と WebGL コンテキストの初期化 -------------------------------------
	// canvasエレメントを取得
	c = document.getElementById('canvas');

	// canvasのサイズをスクリーン全体に広げる
	c.width = window.innerWidth;
        c.height = window.innerHeight;
        window.onresize = function() {
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            gl.viewport(0, 0, c.width, c.height);
        };

	// webglコンテキストを取得
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');
        
        // - クォータニオン初期化 -----------------------------------------------------
	q = new qtnIV();
	qt = q.identity(q.create());

	// - シェーダとプログラムオブジェクトの初期化 ---------------------------------
	// シェーダのソースを取得
	vs = document.getElementById('vs').textContent;
	fs = document.getElementById('fs').textContent;
        fs2 = document.getElementById('fs2').textContent;
	// 頂点シェーダとフラグメントシェーダの生成
	var vShader = create_shader(vs, gl.VERTEX_SHADER);
	var fShader = create_shader(fs, gl.FRAGMENT_SHADER);
        var fShader2 = create_shader(fs2, gl.FRAGMENT_SHADER);
	// プログラムオブジェクトの生成とリンク
	var prg = create_program(vShader, fShader);
        var prg2 = create_program(vShader, fShader2);

	// - 頂点属性に関する処理 ----------------------------------------------------- *
	// attributeLocationの取得
	var attLocation = [];
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	attLocation[2] = gl.getAttribLocation(prg, 'texCoord');
        
        var attLocation2 = [];
	attLocation2[0] = gl.getAttribLocation(prg2, 'position');
	attLocation2[1] = gl.getAttribLocation(prg2, 'color');
	attLocation2[2] = gl.getAttribLocation(prg2, 'texCoord');

	// attributeの要素数
	var attStride = [];
	attStride[0] = 3;
	attStride[1] = 4;
	attStride[2] = 2;

	// ユーティリティ関数からモデルを生成(キューブ)
        var sphereData = sphere(32, 32, 1, [1,1,1,1]);
	var vPosition = sphereData.p;
	var vColor    = sphereData.c;
        var vTexCoord = sphereData.t;
	var index     = sphereData.i;
        
        var m = new matIV();

	// VBOの生成
	var attVBO = [];
	attVBO[0] = create_vbo(vPosition);
	attVBO[1] = create_vbo(vColor);
	attVBO[2] = create_vbo(vTexCoord);

//	// VBOのバインドと登録
//	set_attribute(attVBO, attLocation, attStride);

	// IBOの生成
	var ibo = create_ibo(index);

        // ユーティリティ関数からモデルを生成(スフィア)
        var torusData = torus2(16, 16, 2, 4, [0.7,0.8,0.9,1]);
	var vPosition2 = torusData.p;
	var vColor2    = torusData.c;
        var vTexCoord2 = torusData.t;
	var index2     = torusData.i;
        // VBOの生成
	var attVBO2 = [];
	attVBO2[0] = create_vbo(vPosition2);
	attVBO2[1] = create_vbo(vColor2);
	attVBO2[2] = create_vbo(vTexCoord2);
        // IBOの生成
	var ibo2 = create_ibo(index2);

        //////////////////////////////
        var starData = star(1, 0.6, 0.2, 5, [1.0, 1.0, 1.0, 1.0]);//
        var vPosition3 = starData.p;
	var vColor3    = starData.c;
        var vTexCoord3 = starData.t;
	var index3     = starData.i;
	// VBOの生成
	var attVBO3 = [];
	attVBO3[0] = create_vbo(vPosition3);
	attVBO3[1] = create_vbo(vColor3);
	attVBO3[2] = create_vbo(vTexCoord3);
	// IBOの生成
	var ibo3 = create_ibo(index3);
////////////////////////////////

	// - uniform関連 -------------------------------------------------------------- *
	// uniformLocationの取得
        var uniLocation = [];
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'textureUnit');
        uniLocation[3] = gl.getUniformLocation(prg, 'camera');

        var uniLocation2 = [];
	uniLocation2[0] = gl.getUniformLocation(prg2, 'mvpMatrix');
	uniLocation2[1] = gl.getUniformLocation(prg2, 'invMatrix');
	uniLocation2[2] = gl.getUniformLocation(prg2, 'textureUnit');
        uniLocation2[3] = gl.getUniformLocation(prg2, 'camera');

	// - 行列の初期化 ------------------------------------------------------------- *
	// minMatrix.js を用いた行列関連処理
	// matIVオブジェクトを生成
	//var m = new matIV();

	// 各種行列の生成と初期化
	var mMatrix = m.identity(m.create());
	var vMatrix = m.identity(m.create());
	var pMatrix = m.identity(m.create());
	var vpMatrix = m.identity(m.create());
	var mvpMatrix = m.identity(m.create());
	var invMatrix = m.identity(m.create());


	// - レンダリングのための WebGL 初期化設定 ------------------------------------
	// ビューポートを設定する  
	gl.viewport(0, 0, c.width, c.height);

	// canvasを初期化する色を設定する
	gl.clearColor(0.05, 0.1, 0.2, 1.0);

	// canvasを初期化する際の深度を設定する
	gl.clearDepth(1.0);

	// いくつかの設定を有効化する
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

	// スクリーンの初期化やドローコール周辺をアニメーションループに入れる --------- *
	// アニメーション用に変数を初期化
	var count = 0;

	// - 行列の計算 ---------------------------------------------------------------
	// ビュー座標変換行列
        // canvas のマウスムーブイベントに処理を登録
	c.addEventListener('mousemove', qtnMouse, true);
	
        // テクスチャ
        create_texture('tex1.png', 0);
        create_texture('tex2.png', 1);
        create_texture('tex3.png', 2);
        
        //建物配列
        for(var i=0; i<10000; i++){
            tiles[i] = Math.random();
        }

	// - レンダリング関数 ---------------------------------------------------------
	// アニメーション用のフラグを立てる
	run = true;

	// レンダリング関数のコール
	render();

	function render(){
            // VBOのバインドと登録
            set_attribute(attVBO, attLocation, attStride);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
            
            // = ループ内初期化処理 ===================================================
            // カウンタのインクリメント
            count++;

            // アニメーション用にカウンタからラジアンを計算
            var rad = ((count/5) % 360) * Math.PI / 180;//(count % 360) * Math.PI / 180;
            
            var eye = new Array();
            var cam = new Array();
            var focus = new Array();
            q.toVecIII([0.0, 0.0, 4.0], qt, eye);
            q.toVecIII([0.0, 1.0, 0.0], qt, cam);
            q.toVecIII([4.0, 0.0, 0.0], qt, focus);
            //m.lookAt(eye, focus, cam, vMatrix);
            m.lookAt([4.0*Math.sin(0), 1.0, 4.0*Math.cos(0)], [4.0*Math.sin(0+1.5), 0.0, 4.0*Math.cos(0+1.5)], [0.0, 1.0, 0.0], vMatrix);
            //m.lookAt([-0.5, 1.0, 7.0], [1.5, 0.0, 3.0], [0.0, 1.0, 0.0], vMatrix);

            // プロジェクション座標変換行列
            m.perspective(45, c.width / c.height, 0.1, 50.0, pMatrix);

            // 各行列を掛け合わせ座標変換行列
            m.multiply(pMatrix, vMatrix, vpMatrix);

            // canvasを初期化
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // テクスチャをバインドする
            gl.bindTexture(gl.TEXTURE_2D, textures[0]);
            

            gl.useProgram(prg);
            
            // = 行列の計算 =========================================================== *
            // モデル座標変換行列
            //gl.bindTexture(gl.TEXTURE_2D, textures[2]);
            for(var i=0; i<10000; i++){
                if(tiles[i] > 0.15) continue;
                if(tiles[i] < 0.07) continue;

                m.identity(mMatrix);
                m.rotate(mMatrix, -rad, [0.0, 1.0, 0.0], mMatrix);
                m.translate(mMatrix, [(i%100-50)/8, Math.sin(rad*4+i), (Math.ceil(i/100)-50)/8], mMatrix);
                m.scale(mMatrix, [tiles[i], tiles[i], tiles[i]], mMatrix);
                m.rotate(mMatrix, (rad*8+i), [0.0, 0.0, 1.0], mMatrix);
                m.multiply(vpMatrix, mMatrix, mvpMatrix);
                m.inverse(mMatrix, invMatrix);

                // = uniform 関連 ========================================================= *
                // uniformLocationへ座標変換行列を登録
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
                gl.uniform1i(uniLocation[2], 0);
                gl.uniform3fv(uniLocation[3], [4.0*Math.sin(rad), 1.0, 4.0*Math.cos(rad)]);
                gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
            }

            //球
            // VBOのバインドと登録
            set_attribute(attVBO2, attLocation, attStride);
            // IBOをバインド
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo2);
            gl.bindTexture(gl.TEXTURE_2D, textures[2]);
            m.identity(mMatrix);
            m.rotate(mMatrix, -rad, [0.0, 1.0, 0.0], mMatrix);
            m.translate(mMatrix, [0, 0, 0], mMatrix);
            //m.scale(mMatrix, [7, 7, 7], mMatrix);
            m.multiply(vpMatrix, mMatrix, mvpMatrix);
            m.inverse(mMatrix, invMatrix);

            // = uniform 関連 ========================================================= *
            // uniformLocationへ座標変換行列を登録
            gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
            gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
            gl.uniform1i(uniLocation[2], 0);
            gl.uniform3fv(uniLocation[3], [4.0*Math.sin(rad), 1.0, 4.0*Math.cos(rad)]);
            gl.drawElements(gl.TRIANGLES, index2.length, gl.UNSIGNED_SHORT, 0);

            // 星
            // VBOのバインドと登録
            gl.useProgram(prg2);
            set_attribute(attVBO3, attLocation2, attStride);
            // IBOをバインド
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo3);
            gl.bindTexture(gl.TEXTURE_2D, textures[1]);
            for(var i=0; i<10000; i+=4){
                if(tiles[i] > 0.10) continue;
                if(tiles[i] < 0.05) continue;
                m.identity(mMatrix);
                m.translate(mMatrix, [(i%100-50)/8, -((count%400)/100) + 2, (Math.ceil(i/100)-50)/8], mMatrix);
                m.scale(mMatrix, [tiles[i], tiles[i], tiles[i]], mMatrix);
                m.rotate(mMatrix, (rad*8+i), [0.0, 0.0, 1.0], mMatrix);
                m.multiply(vpMatrix, mMatrix, mvpMatrix);
                m.inverse(mMatrix, invMatrix);

                // = uniform 関連 ========================================================= *
                // uniformLocationへ座標変換行列を登録
                gl.uniformMatrix4fv(uniLocation2[0], false, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation2[1], false, invMatrix);
                gl.uniform1i(uniLocation2[2], 0);
                gl.uniform3fv(uniLocation2[3], [4.0*Math.sin(rad), 1.0, 4.0*Math.cos(rad)]);
                gl.drawElements(gl.TRIANGLES, index3.length, gl.UNSIGNED_SHORT, 0);
            }

            // コンテキストの再描画
            gl.flush();

            // フラグをチェックしてアニメーション
            if(run){requestAnimationFrame(render);}
	}
};

// - 各種ユーティリティ関数 ---------------------------------------------------
/**
 * シェーダを生成する関数
 * @param {string} source シェーダのソースとなるテキスト
 * @param {number} type シェーダのタイプを表す定数 gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
 * @return {object} 生成に成功した場合はシェーダオブジェクト、失敗した場合は null
 */
function create_shader(source, type){
	// シェーダを格納する変数
	var shader;
	
	// シェーダの生成
	shader = gl.createShader(type);
	
	// 生成されたシェーダにソースを割り当てる
	gl.shaderSource(shader, source);
	
	// シェーダをコンパイルする
	gl.compileShader(shader);
	
	// シェーダが正しくコンパイルされたかチェック
	if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		
		// 成功していたらシェーダを返して終了
		return shader;
	}else{
		
		// 失敗していたらエラーログをアラートする
		alert(gl.getShaderInfoLog(shader));
		
		// null を返して終了
		return null;
	}
}

/**
 * プログラムオブジェクトを生成しシェーダをリンクする関数
 * @param {object} vs 頂点シェーダとして生成したシェーダオブジェクト
 * @param {object} fs フラグメントシェーダとして生成したシェーダオブジェクト
 * @return {object} 生成に成功した場合はプログラムオブジェクト、失敗した場合は null
 */
function create_program(vs, fs){
	// プログラムオブジェクトの生成
	var program = gl.createProgram();
	
	// プログラムオブジェクトにシェーダを割り当てる
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);
	
	// シェーダをリンク
	gl.linkProgram(program);
	
	// シェーダのリンクが正しく行なわれたかチェック
	if(gl.getProgramParameter(program, gl.LINK_STATUS)){
	
		// 成功していたらプログラムオブジェクトを有効にする
		gl.useProgram(program);
		
		// プログラムオブジェクトを返して終了
		return program;
	}else{
		
		// 失敗していたらエラーログをアラートする
		alert(gl.getProgramInfoLog(program));
		
		// null を返して終了
		return null;
	}
}

/**
 * VBOを生成する関数
 * @param {Array.<number>} data 頂点属性を格納した一次元配列
 * @return {object} 頂点バッファオブジェクト
 */
function create_vbo(data){
	// バッファオブジェクトの生成
	var vbo = gl.createBuffer();
	
	// バッファをバインドする
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
	
	// バッファにデータをセット
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// 生成した VBO を返して終了
	return vbo;
}

/**
 * IBOを生成する関数
 * @param {Array.<number>} data 頂点インデックスを格納した一次元配列
 * @return {object} インデックスバッファオブジェクト
 */
function create_ibo(data){
	// バッファオブジェクトの生成
	var ibo = gl.createBuffer();
	
	// バッファをバインドする
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
	
	// バッファにデータをセット
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
	
	// バッファのバインドを無効化
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	
	// 生成したIBOを返して終了
	return ibo;
}

/**
 * VBOをバインドし登録する関数
 * @param {object} vbo 頂点バッファオブジェクト
 * @param {Array.<number>} attribute location を格納した配列
 * @param {Array.<number>} アトリビュートのストライドを格納した配列
 */
function set_attribute(vbo, attL, attS){
	// 引数として受け取った配列を処理する
	for(var i in vbo){
		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
		
		// attributeLocationを有効にする
		gl.enableVertexAttribArray(attL[i]);
		
		// attributeLocationを通知し登録する
		gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
	}
}

/**
 * テクスチャを生成する関数
 * @param {string} source テクスチャに適用する画像ファイルのパス
 * @param {number} number テクスチャ用配列に格納するためのインデックス
 */
function create_texture(source, number){
	// イメージオブジェクトの生成
	var img = new Image();
	
	// データのオンロードをトリガーにする
	img.onload = function(){
		// テクスチャオブジェクトの生成
		var tex = gl.createTexture();
		
		// テクスチャをバインドする
		gl.bindTexture(gl.TEXTURE_2D, tex);
		
		// テクスチャへイメージを適用
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		
		// ミップマップを生成
		gl.generateMipmap(gl.TEXTURE_2D);
		
		// テクスチャのバインドを無効化
		gl.bindTexture(gl.TEXTURE_2D, null);
		
		// 生成したテクスチャを変数に代入
		textures[number] = tex;
	};
	
	// イメージオブジェクトのソースを指定
	img.src = source;
}