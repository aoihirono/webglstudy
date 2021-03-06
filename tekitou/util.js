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
function cube2(side, color){
	var tc, hs = side * 0.5;
	var pos = [
		-hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,  hs,
		-hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs, -hs,
		-hs,  hs, -hs, -hs,  hs,  hs,  hs,  hs,  hs,  hs,  hs, -hs,
		-hs, -hs, -hs,  hs, -hs, -hs,  hs, -hs,  hs, -hs, -hs,  hs,
		 hs, -hs, -hs,  hs,  hs, -hs,  hs,  hs,  hs,  hs, -hs,  hs,
		-hs, -hs, -hs, -hs, -hs,  hs, -hs,  hs,  hs, -hs,  hs, -hs
	];
	var nor = [
		-1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
		-1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
		-1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
		-1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
		 1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
		-1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
	];
	var col = new Array();
	for(var i = 0; i < pos.length / 3; i++){
		if(color){
			tc = color;
		}else{
			tc = hsva(360 / pos.length / 3 * i, 1, 1, 1);
		}
		col.push(tc[0], tc[1], tc[2], tc[3]);
	}
	var st = [
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
		0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,//0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
		0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0,
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
	];
	var idx = [
		 0,  1,  2,  0,  2,  3,
		 4,  5,  6,  4,  6,  7,
		 8,  9, 10,  8, 10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	];
	return {p : pos, n : nor, c : col, t : st, i : idx};
}
function sphere2(row, column, rad, color){
	var i, j, tc;
	var pos = new Array(), nor = new Array(),
	    col = new Array(), st  = new Array(), idx = new Array();
	for(i = 0; i <= row; i++){
		var r = Math.PI / row * i;
		var ry = Math.cos(r);
		var rr = Math.sin(r);
		for(j = column; j >= 0; j--){//for(j = 0; j <= column; j++){
			var tr = Math.PI * 2 / column * j;
			var tx = rr * rad * Math.cos(tr);
			var ty = ry * rad;
			var tz = rr * rad * Math.sin(tr);
			var rx = rr * Math.cos(tr);
			var rz = rr * Math.sin(tr);
			if(color){
				tc = color;
			}else{
				tc = hsva(360 / row * i, 1, 1, 1);
			}
			pos.push(tx, ty, tz);
			nor.push(rx, ry, rz);
			col.push(tc[0], tc[1], tc[2], tc[3]);
			st.push(1 - 1 / column * j, 1 / row * i);
		}
	}
	r = 0;
	for(i = 0; i < row; i++){
		for(j = 0; j < column; j++){
			r = (column + 1) * i + j;
			idx.push(r, r + 1, r + column + 2);
			idx.push(r, r + column + 2, r + column + 1);
		}
	}
	return {p : pos, n : nor, c : col, t : st, i : idx};
}

function torus2(row, column, irad, orad, color){
	var i, j, tc;
	var pos = new Array(), nor = new Array(),
	    col = new Array(), st  = new Array(), idx = new Array();
	for(i = 0; i <= row; i++){
		var r = Math.PI * 2 / row * i;
		var rr = Math.cos(r);
		var ry = Math.sin(r);
		for(j = 0; j <= column; j++){
			var tr = Math.PI * 2 / column * j;
			var tx = (rr * irad + orad) * Math.cos(tr);
			var ty = ry * irad;
			var tz = (rr * irad + orad) * Math.sin(tr);
			var rx = rr * Math.cos(tr);
			var rz = rr * Math.sin(tr);
			if(color){
				tc = color;
			}else{
				tc = hsva(360 / column * j, 1, 1, 1);
			}
			var rs = 1 / column * j;
			var rt = 1 / row * i + 0.5;
			if(rt > 1.0){rt -= 1.0;}
			rt = 1.0 - rt;
			pos.push(tx, ty, tz);
			nor.push(rx, ry, rz);
			col.push(tc[0], tc[1], tc[2], tc[3]);
			st.push(rs, rt);
		}
	}
	for(i = 0; i < row; i++){
		for(j = 0; j < column; j++){
			r = (column + 1) * i + j;
			idx.push(r, r + 1, r + column + 1);
			idx.push(r + column + 1, r + 1, r + column + 2);
		}
	}
	return {p : pos, n : nor, c : col, t : st, i : idx};
}

function star(radius, radius2, height, acc, color){
    var i, tc;
    var accur = acc*2;
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
    var count = 0;
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
        if(count%2===0)
            pos.push(rx * radius, ry * radius, height / 2);
        else
            pos.push(rx * radius2, ry * radius2, height / 2);
        nor.push(0, 0, 1);
        col.push(tc[0], tc[1], tc[2], tc[3]);
        st.push(rs, rt);
        count++;
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
    count = 0;
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
        if(count%2===0)
            pos.push(rx * radius, ry * radius, -height / 2);
        else
            pos.push(rx * radius2, ry * radius2, -height / 2);
        nor.push(0, 0, 1);
        col.push(tc[0], tc[1], tc[2], tc[3]);
        st.push(rs, rt);
        count++;
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