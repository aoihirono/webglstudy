function cylinder(radius, height, accur, color){
    var i, j, tc;
    var pos = new Array(), nor = new Array(),
        col = new Array(), st  = new Array(), idx = new Array();
    
    // 上の円
    pos.push(0, 0, height / 2);
    nor.push(0, 0, 1);
    if(color){
        tc = color;
    }else{
        tc = hsva(1, 1, 1, 1);
    }
    col.push(tc[0], tc[1], tc[2], tc[3]);
    st.push(0.5, 0.5);
    for(i = 0; i <= 360; i+= 360/accur){
        var r = (Math.PI / 180) * i;
        var rx = Math.cos(r);
        var ry = Math.sin(r);
        if(color){
                tc = color;
        }else{
                tc = hsva(360 / i, 1, 1, 1);
        }
        var rs = rx/2+0.5;
        var rt = ry/2+0.5;
        rt = 1.0 - rt;
        pos.push(rx * radius, ry * radius, height / 2);
        nor.push(0, 0, 1);
        col.push(tc[0], tc[1], tc[2], tc[3]);
        st.push(rs, rt);
    }
    //インデックス
    for(i = 0; i < accur; i++){
        var p2 = i+2;
        if(i+1 === accur)
            p2 = 1;
        idx.push(0, i+1, p2);
    }
    // 下の円
    pos.push(0, 0, -height / 2);
    nor.push(0, 0, 1);
    if(color){
        tc = color;
    }else{
        tc = hsva(0, 0, 1, 1);
    }
    col.push(tc[0], tc[1], tc[2], tc[3]);
    st.push(0.5, 0.5);
    for(i = 0; i <= 360; i+= 360/accur){
        var r = (Math.PI / 180) * i;
        var rx = Math.cos(r);
        var ry = Math.sin(r);
        if(color){
                tc = color;
        }else{
                tc = hsva(360 / i, 1, 1, 1);
        }
        var rs = rx;
        var rt = ry;
        var rs = rx/2+0.5;
        var rt = ry/2+0.5;
        rt = 1.0 - rt;
        pos.push(rx * radius, ry * radius, -height / 2);
        nor.push(0, 0, 1);
        col.push(tc[0], tc[1], tc[2], tc[3]);
        st.push(rs, rt);
    }
    //インデックス
    for(i = 0; i < accur; i++){
        var offs = accur+2;
        var p2 = i+2;
        if(i+1 === accur)
            p2 = 1;
        idx.push(offs, offs+p2, offs+i+1);
    }

    for(i = 0; i < accur; i++){
        var offset1 = 1;
        var offset2 = accur + 3;
        var ul = offset1+i;
        var ur = offset1+i+1;
        if(ur === offset2) ur = offset1;
        var dl = offset2+i;
        var dr = offset2+i+1;
        if(dr === offset2+accur) dr = offset2;

        idx.push(ul, dl, ur);
        idx.push(ur, dl, dr);
    }
    return {p : pos, n : nor, c : col, t : st, i : idx};
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

