var c, gl, vs, fs, run;
var textures = [];

window.onload = function(){
	// - keydown イベントへの関数の登録 -------------------------------------------
	window.addEventListener('keydown', function(eve){run = eve.keyCode !== 27;}, true);


	// - canvas と WebGL コンテキストの初期化 -------------------------------------
	// canvasエレメントを取得
	c = document.getElementById('canvas');

	// canvasのサイズをスクリーン全体に広げる
	c.width = 512;
	c.height = 512;

	// webglコンテキストを取得
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	// - シェーダとプログラムオブジェクトの初期化 ---------------------------------
	// シェーダのソースを取得
	vs = document.getElementById('vs').textContent;
	fs = document.getElementById('fs').textContent;
	
	// 頂点シェーダとフラグメントシェーダの生成
	var vShader = create_shader(vs, gl.VERTEX_SHADER);
	var fShader = create_shader(fs, gl.FRAGMENT_SHADER);

	// プログラムオブジェクトの生成とリンク
	var prg = create_program(vShader, fShader);


	// - 頂点属性に関する処理 ----------------------------------------------------- *
	// attributeLocationの取得
	var attLocation = [];
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	attLocation[2] = gl.getAttribLocation(prg, 'texCoord');

	// attributeの要素数
	var attStride = [];
	attStride[0] = 3;
	attStride[1] = 4;
	attStride[2] = 2;

	// ユーティリティ関数からモデルを生成(円柱)
        var cData = cylinder(1, 0.2, 36, [1.0, 1.0, 1.0, 1.0]);
	var vPosition = cData.p;
	var vColor    = cData.c;
        var vTexCoord = cData.t;
	var index     = cData.i;
        
        var m = new matIV();

	// VBOの生成
	var attVBO = [];
	attVBO[0] = create_vbo(vPosition);
	attVBO[1] = create_vbo(vColor);
	attVBO[2] = create_vbo(vTexCoord);

	// VBOのバインドと登録
	set_attribute(attVBO, attLocation, attStride);

	// IBOの生成
	var ibo = create_ibo(index);

	// IBOをバインド
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);


	// - uniform関連 -------------------------------------------------------------- *
	// uniformLocationの取得
        var uniLocation = [];
	uniLocation[0] = gl.getUniformLocation(prg, 'mvpMatrix');
	uniLocation[1] = gl.getUniformLocation(prg, 'invMatrix');
	uniLocation[2] = gl.getUniformLocation(prg, 'textureUnit');


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
	gl.clearColor(0.3, 0.3, 0.3, 1.0);

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
        var rotZ = 0;
        c.addEventListener('mousemove', function(e){
            rotZ = - Math.PI * 2 * (1.0 - e.layerX / c.width);
        }, false);
	
        create_texture('tex1.png', 0);
        create_texture('tex2.png', 1);
        var tmpCanvas = document.createElement("canvas");
        document.body.appendChild(tmpCanvas);
        tmpCanvas.width = 32;
        tmpCanvas.height = 32;
        var ctx = tmpCanvas.getContext('2d');
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        for(var i=0; i<12; i++){
            ctx.fillStyle = '#37a';
            ctx.fillRect(0, 0, 32, 32);
            ctx.fillStyle = '#fff';
            if(i===0) ctx.fillText( "12" , 13 , 26 ) ;
            else ctx.fillText( "" + i , 13 , 26 ) ;
            create_texture(tmpCanvas.toDataURL("image/gif"), 2+i);
        }

	// - レンダリング関数 ---------------------------------------------------------
	// アニメーション用のフラグを立てる
	run = true;

	// レンダリング関数のコール
	render();

	function render(){
            
        m.lookAt([Math.sin(rotZ)*5.0, 0.0, Math.cos(rotZ)*5.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0], vMatrix);

	// プロジェクション座標変換行列
	m.perspective(45, c.width / c.height, 0.1, 10.0, pMatrix);

	// 各行列を掛け合わせ座標変換行列
	m.multiply(pMatrix, vMatrix, vpMatrix);
		// = ループ内初期化処理 ===================================================
		// カウンタのインクリメント
		//count++;
		
		// アニメーション用にカウンタからラジアンを計算
		var rad = (count % 360) * Math.PI / 180;
		
		// canvasを初期化
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
                
                // テクスチャをバインドする
		gl.bindTexture(gl.TEXTURE_2D, textures[0]);
		
		// = 行列の計算 =========================================================== *
		// モデル座標変換行列
		m.identity(mMatrix);
		m.rotate(mMatrix, rad, [0.0, 1.0, 1.0], mMatrix);
                m.translate(mMatrix, [0.0, 0.0, -0.1], mMatrix);
		m.multiply(vpMatrix, mMatrix, mvpMatrix);
		m.inverse(mMatrix, invMatrix);
		
		// = uniform 関連 ========================================================= *
		// uniformLocationへ座標変換行列を登録
		gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
		gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
                gl.uniform1i(uniLocation[2], 0);
		
		// = レンダリング =========================================================
		// モデルの描画
		gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
                
                //数字
                // = 行列の計算 =========================================================== *
		// モデル座標変換行列
                // テクスチャをバインドする
                for(var i=0; i<12; i++){
                    gl.bindTexture(gl.TEXTURE_2D, textures[2+i]);
                    m.identity(mMatrix);
                    m.rotate(mMatrix, rad, [0.0, 0.0, 1.0], mMatrix);
                    m.translate(mMatrix, [Math.sin(Math.PI*i/6)*0.8, Math.cos(Math.PI*i/6)*0.8, -0.04], mMatrix);
                    m.scale(mMatrix, [0.15, 0.15, 0.5], mMatrix);
                    m.multiply(vpMatrix, mMatrix, mvpMatrix);
                    m.inverse(mMatrix, invMatrix);

                    // = uniform 関連 ========================================================= *
                    // uniformLocationへ座標変換行列を登録
                    gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                    gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
                    gl.uniform1i(uniLocation[2], 0);
                    gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
                }
                
                gl.bindTexture(gl.TEXTURE_2D, textures[1]);
                var date = new Date();
                
                // 秒
                var sec = - date.getSeconds() * Math.PI * 2 / 60;
                m.identity(mMatrix);
                m.rotate(mMatrix, sec, [0.0, 0.0, 1.0], mMatrix);
                m.translate(mMatrix, [0.0, 0.4, 0.0], mMatrix);
                m.scale(mMatrix, [0.02, 0.4, 0.5], mMatrix);
                m.multiply(vpMatrix, mMatrix, mvpMatrix);
                m.inverse(mMatrix, invMatrix);

                // = uniform 関連 ========================================================= *
                // uniformLocationへ座標変換行列を登録
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
                gl.uniform1i(uniLocation[2], 0);
                gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
                
                // 分
                var min = - date.getMinutes() * Math.PI * 2 / 60;
                m.identity(mMatrix);
                m.rotate(mMatrix, min, [0.0, 0.0, 1.0], mMatrix);
                m.translate(mMatrix, [0.0, 0.4, 0.0], mMatrix);
                m.scale(mMatrix, [0.05, 0.4, 0.5], mMatrix);
                m.multiply(vpMatrix, mMatrix, mvpMatrix);
                m.inverse(mMatrix, invMatrix);

                // = uniform 関連 ========================================================= *
                // uniformLocationへ座標変換行列を登録
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
                gl.uniform1i(uniLocation[2], 0);
                gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
                
                // 時間
                var hour = - (date.getHours() * 60 + date.getMinutes()) * Math.PI * 2 / (12*60);
                m.identity(mMatrix);
                m.rotate(mMatrix, hour, [0.0, 0.0, 1.0], mMatrix);
                m.translate(mMatrix, [0.0, 0.25, 0.0], mMatrix);
                m.scale(mMatrix, [0.05, 0.25, 0.5], mMatrix);
                m.multiply(vpMatrix, mMatrix, mvpMatrix);
                m.inverse(mMatrix, invMatrix);

                // = uniform 関連 ========================================================= *
                // uniformLocationへ座標変換行列を登録
                gl.uniformMatrix4fv(uniLocation[0], false, mvpMatrix);
                gl.uniformMatrix4fv(uniLocation[1], false, invMatrix);
                gl.uniform1i(uniLocation[2], 0);
                gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
                
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
