var draw = function(funcs,xmin,xmax,ymin,ymax,precision, xunitmark, yunitmark, canvwidth, canvheight) {
	var canvas = document.getElementById("graph_canvas");
	canvas.width = canvwidth;
	canvas.height = canvheight;
	var ctx = canvas.getContext("2d");

	// function to translate graph coordinates to screen coordinates
	var graphAt = function(x,y) {
		return {
			"x": ((x - xmin)/(Math.abs(xmax - xmin))) * canvas.width,
			"y": canvas.height - (((y - ymin)/(Math.abs(ymax - ymin))) * canvas.height),
		};
	}

	var graphOne = (Math.abs(xmin) + Math.abs(xmax))/canvas.width;

	// clear screen
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	// draw lines through point(0,0)
	var origin = graphAt(0,0);
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo(0,origin["y"]);
	ctx.lineTo(canvas.width,origin["y"]);
	ctx.moveTo(origin["x"],0);
	ctx.lineTo(origin["x"],canvas.height);
	ctx.stroke();

	// mark units
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	var i;
	for (i = xunitmark;i < xmax;i+=xunitmark) {
		var pos = graphAt(i,0);
		ctx.beginPath();
		ctx.moveTo(pos["x"],pos["y"]-5);
		ctx.lineTo(pos["x"],pos["y"]+5);
		ctx.stroke();
		ctx.fillText(i.toString(),pos["x"],pos["y"]-16);
	}
	for (i = -xunitmark;i > xmin;i-=xunitmark) {
		var pos = graphAt(i,0);
		ctx.beginPath();
		ctx.moveTo(pos["x"],pos["y"]-5);
		ctx.lineTo(pos["x"],pos["y"]+5);
		ctx.stroke();
		ctx.fillText(i.toString(),pos["x"],pos["y"]-16);
	}
	for (i = yunitmark;i < ymax;i+=yunitmark) {
		var pos = graphAt(0,i);
		ctx.beginPath();
		ctx.moveTo(pos["x"]-5,pos["y"]);
		ctx.lineTo(pos["x"]+5,pos["y"]);
		ctx.stroke();
		ctx.fillText(i.toString(),pos["x"]+16,pos["y"]);
	}
	for (i = -yunitmark;i > ymin;i-=yunitmark) {
		var pos = graphAt(0,i);
		ctx.beginPath();
		ctx.moveTo(pos["x"]-5,pos["y"]);
		ctx.lineTo(pos["x"]+5,pos["y"]);
		ctx.stroke();
		ctx.fillText(i.toString(),pos["x"]+16,pos["y"]);
	}

	// draw actual data on graph
	for (i = 0; i < funcs.length;i++) {
		var func = funcs[i][0];
		var x = xmin;
		var y;
		eval(func);
		var pos = graphAt(x,y);
		ctx.strokeStyle = funcs[i][1];
		ctx.beginPath();
		ctx.moveTo(pos["x"],pos["y"]);

		for (x = xmin+(precision*graphOne);x < xmax;x += (precision*graphOne)) {
			eval(func);
			pos = graphAt(x,y);
			ctx.lineTo(pos["x"],pos["y"]);
		}
		eval(func);
		pos = graphAt(x,y);
		ctx.lineTo(pos["x"],pos["y"]);

		ctx.stroke();
	}
};

// math passthrough
var sin = Math.sin;
var cos = Math.cos;
var log = Math.log;
var sqrt = Math.sqrt;
var tan = Math.tan;
var abs = Math.abs;
var atan = Math.atan;
var pi = Math.PI;
var asin = Math.asin;
var acos = Math.acos;

// array of arrays of HTML elements used for function input [ text_input, function_delete_button, line_break ]
var funcinput = [
	//[document.getElementById("in_func"),document.getElementById("in_funcdel"),document.getElementById("in_funcbr")],
];

var colors = [
	"red",
	"green",
	"blue",
	"yellow",
	"aqua",
	"cyan",
	"cornflowerblue",
	"darkslateblue",
	"magenta",
];

// get user's functions as array
var getFunctions = function() {
	funcs = [];
	var i;
	for (i = 0;i < funcinput.length;i++) {
		funcs.push([funcinput[i][0].value,colors[i]]);
	}
	return funcs;
}

// collect data for "draw" from inputs on page
var onSubmit = function() {
	var funcs = getFunctions();
	var xmin = parseFloat(document.getElementById("in_xmin").value);
	var xmax = parseFloat(document.getElementById("in_xmax").value);
	var ymin = parseFloat(document.getElementById("in_ymin").value);
	var ymax = parseFloat(document.getElementById("in_ymax").value);
	var precision = parseFloat(document.getElementById("in_prec").value);
	var xunitmark = parseFloat(document.getElementById("in_xunitmark").value);
	var yunitmark = parseFloat(document.getElementById("in_yunitmark").value);
	var canvwidth = parseFloat(document.getElementById("in_canvwidth").value);
	var canvheight = parseFloat(document.getElementById("in_canvheight").value);
	draw(funcs,xmin,xmax,ymin,ymax,precision,xunitmark,yunitmark,canvwidth,canvheight);
};

var inFunctions = document.getElementById("in_funcs");
var removeFunc = function(ind) {
	funcinput[ind][0].parentNode.removeChild(funcinput[ind][0]);
	funcinput[ind][1].parentNode.removeChild(funcinput[ind][1]);
	funcinput[ind][2].parentNode.removeChild(funcinput[ind][2]);

	funcinput.splice(ind,1);
	var i;
	for (i = 0;i < funcinput.length;i++) {
		var e = i;
		funcinput[i][1].onclick = function() {
			removeFunc(e);
		};
	}
	onSubmit();
};

var addFunc = function(fun="y = 0") {
	var textfield = document.createElement("input");
	textfield.setAttribute("type", "text");
	textfield.setAttribute("value", fun);
	textfield.addEventListener("change", onSubmit);
	var deleteButton = document.createElement("button");
	deleteButton.innerHTML = "-";
	var ind = funcinput.length;
	deleteButton.onclick = function() {
		removeFunc(ind);
	};
	var lineBreak = document.createElement("br");
	funcinput.push([textfield,deleteButton,lineBreak]);
	inFunctions.appendChild(textfield);
	inFunctions.appendChild(deleteButton);
	inFunctions.appendChild(lineBreak);
}

addFunc("y = sin(x)");
onSubmit();
funcinput[0][1].onclick = function() {
	removeFunc(0);
};

var mouseHeld = false;
var mouseHeldStart = {
	"x": 0,
	"y": 0,
};
document.addEventListener("mousemove", event => {
	if (mouseHeld) {
		var xmin = parseFloat(document.getElementById("in_xmin").value);
		var xmax = parseFloat(document.getElementById("in_xmax").value);
		var ymin = parseFloat(document.getElementById("in_ymin").value);
		var ymax = parseFloat(document.getElementById("in_ymax").value);

		var canvas = document.getElementById("graph_canvas");
		var graphOne = {
			"x": (Math.abs(xmax - xmin))/canvas.width,
			"y": (Math.abs(ymax - ymin))/canvas.height,
		};

		var xchange = (event.clientX - mouseHeldStart["x"]) * graphOne["x"];
		var ychange = (event.clientY - mouseHeldStart["y"]) * graphOne["y"];
		xmin -= xchange;
		xmax -= xchange;
		ymin += ychange;
		ymax += ychange;
		document.getElementById("in_xmin").value = xmin.toString();
		document.getElementById("in_xmax").value = xmax.toString();
		document.getElementById("in_ymin").value = ymin.toString();
		document.getElementById("in_ymax").value = ymax.toString();
		//onSubmit();
		mouseHeldStart["x"] = event.clientX;
		mouseHeldStart["y"] = event.clientY;

		var funcs = getFunctions();
		var precision = parseFloat(document.getElementById("in_prec").value);
		var xunitmark = parseFloat(document.getElementById("in_xunitmark").value);
		var yunitmark = parseFloat(document.getElementById("in_yunitmark").value);
		var canvwidth = parseFloat(document.getElementById("in_canvwidth").value);
		var canvheight = parseFloat(document.getElementById("in_canvheight").value);
		draw(funcs,xmin,xmax,ymin,ymax,precision,xunitmark,yunitmark,canvwidth,canvheight);
	}
});
document.addEventListener("mouseup", event => {
	mouseHeld = false;
});
document.getElementById("graph_canvas").addEventListener("mousedown", event => {
	event.preventDefault();
	mouseHeld = true;
	mouseHeldStart["x"] = event.clientX;
	mouseHeldStart["y"] = event.clientY;
});
var zoomAxisLocked = {
	"x": false,
	"y": false,
};
document.addEventListener("keydown", event => {
	if (event.keyCode == 88) {
		zoomAxisLocked["x"] = true;
	}
	if (event.keyCode == 89) {
		zoomAxisLocked["y"] = true;
	}
});
document.addEventListener("keyup", event => {
	if (event.keyCode == 88) {
		zoomAxisLocked["x"] = false;
	}
	if (event.keyCode == 89) {
		zoomAxisLocked["y"] = false;
	}
});
document.getElementById("graph_canvas").addEventListener("wheel", event => {
	event.preventDefault();
	var canvas = document.getElementById("graph_canvas");
	var xmin = parseFloat(document.getElementById("in_xmin").value);
	var xmax = parseFloat(document.getElementById("in_xmax").value);
	var ymin = parseFloat(document.getElementById("in_ymin").value);
	var ymax = parseFloat(document.getElementById("in_ymax").value);

	var graphOne = {
		"x": (Math.abs(xmax - xmin))/canvas.width,
		"y": (Math.abs(ymax - ymin))/canvas.height,
	};

	var wheelMove = (event.deltaY > 0) ? 1.0 : -1.0;

	if (!zoomAxisLocked["y"]) {
		xmin -= wheelMove * graphOne["x"] * 24.0;
		xmax += wheelMove * graphOne["x"] * 24.0;
	}
	if (!zoomAxisLocked["x"]) {
		ymin -= wheelMove * graphOne["y"] * 24.0;
		ymax += wheelMove * graphOne["y"] * 24.0;
	}

	document.getElementById("in_xmin").value = xmin.toString();
	document.getElementById("in_xmax").value = xmax.toString();
	document.getElementById("in_ymin").value = ymin.toString();
	document.getElementById("in_ymax").value = ymax.toString();
	//onSubmit();
	var funcs = getFunctions();
	var precision = parseFloat(document.getElementById("in_prec").value);
	var xunitmark = parseFloat(document.getElementById("in_xunitmark").value);
	var yunitmark = parseFloat(document.getElementById("in_yunitmark").value);
	var canvwidth = parseFloat(document.getElementById("in_canvwidth").value);
	var canvheight = parseFloat(document.getElementById("in_canvheight").value);
	draw(funcs,xmin,xmax,ymin,ymax,precision,xunitmark,yunitmark,canvwidth,canvheight);
});
