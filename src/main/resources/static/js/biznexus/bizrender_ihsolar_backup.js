/*
/*
수정이력
	2023-03-15  v1.00   moonbsun	Weaver와 의 텍스트 좌표 일치하도록 수정
									텍스트 값 표시하도록 수정
	2023-04-19	v1.01	moonbsun	ontimer 이중 동작 방지 
	2024-09-19	v2.00	moonbsun	함수 정리 및 버그 픽스
									편집기능 추가
	2025-02-27	v2.01	hhw			onItemClick이벤트 name이 빈값("")이 아니면 리턴 추가
									onItemClickBefore이벤트 추가 (이벤트 동작을 막기 위해, shape.stopped = true로 return하면 이벤트 중지)
									'Shape은 visibile을 false로 처리한다.'에서 Shape Name이 있는 경우로 조건문 추가
									저장시 innerHTML 방식에서 textContent 로 변경 (특수문자(& < > 등..) 오류로 인해)
									group, ungroup 완료시 onMouseUp()이벤트 추가
									outValues응답시 taglist가 배열일 경우만 for문 동작하도록 수정
									//삭제 doEffectBySwitch 동작 후 shape.effectBySwitch리턴 추가 
									doEffectBySwitch 동작시 요청 후 outValues 리턴 (원본 데이터 추가)
	2025-07-07	v2.02	kyb			rootPath 옵션 추가(bizNexus 경로 변경에 따른 root 경로 변경 버전 추가) => rootPath 옵션
									Bizrender xml파일 사이즈 비율에 따라가게 설정하는 옵션 => baseRatio 옵션("width", "height")
									bizRender 메소드의 기능중 onSize 이벤트 추가
*/

//// Prototypes of canvas
CanvasRenderingContext2D.prototype.drawEllipse = function (x, y, w, h, lineWidth, fillmode) {
	var kappa = .5522848,
	ox = (w / 2) * kappa, // control point offset horizontal
	oy = (h / 2) * kappa, // control point offset vertical
	xe = x + w, // x-end
	ye = y + h, // y-end
	xm = x + w / 2, // x-middle
	ym = y + h / 2; // y-middle

	this.beginPath();
	this.moveTo(x, ym);
	this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

	this.closePath();

	if(lineWidth > 0) this.stroke();

	if (fillmode != true) 
		this.fill();
	else
		this.clip();
}

CanvasRenderingContext2D.prototype.drawParallelogram = function (x, y, w, h, ofs, fillmode) {
	this.beginPath();
	this.moveTo(x + ofs, y);
	this.lineTo(x + w, y);
	this.lineTo(x + w - ofs, y + h);
	this.lineTo(x, y + h);
	this.lineTo(x + ofs, y);

	if (fillmode != true)	this.fill();
	else					this.clip();

	this.stroke();
}

CanvasRenderingContext2D.prototype.drawPentagon = function (x, y, w, h, fillmode) {
	this.beginPath();
	this.moveTo(x+w/2, y);
	this.lineTo(x+w, y+h*2/5);
	this.lineTo(x+w*3/4, y+h);
	this.lineTo(x+w*1/4, y+h);
	this.lineTo(x, y+h*2/5);
	this.lineTo(x+w/2, y);

	if (fillmode != true)	this.fill();
	else					this.clip();

	this.stroke();
}

CanvasRenderingContext2D.prototype.drawRhombus = function (x, y, w, h, fillmode) {
	this.beginPath();
	this.moveTo(x + w/2, y);
	this.lineTo(x, y + h/2);
	this.lineTo(x + w/2, y + h);
	this.lineTo(x + w, y + h/2);
	this.lineTo(x + w/2, y);

	if (fillmode != true)	this.fill();
	else					this.clip();

	this.stroke();
}

CanvasRenderingContext2D.prototype.drawRoundRect = function (x, y, w, h, r, lineWidth, fillmode, mode) {
	this.beginPath();
	if (mode == "full") {
		this.moveTo(x, y + r);
		this.lineTo(x, y + h - r);
		this.arcTo(x, y + h, x + r, y + h, r);
		this.lineTo(x + w - r, y + h);
		this.arcTo(x + w, y + h, x + w, y + h-r, r);
		this.lineTo(x + w, y + r);
		this.arcTo(x + w, y, x + w - r, y, r);
		this.lineTo(x + r, y);
		this.arcTo(x, y, x, y + r, r);
	}
	else if (mode == "upper") {
		this.moveTo(x, y + r);
		this.lineTo(x, y + h);
		this.lineTo(x + w, y + h);
		this.lineTo(x + w, y + r);
		this.arcTo(x + w, y, x + w - r, y, r);
		this.lineTo(x + r, y);
		this.arcTo(x, y, x, y + r, r);
	}
	else if (mode == "lower") {
		this.moveTo(x, y + r);
		this.lineTo(x, y + h - r);
		this.arcTo(x, y + h, x + r, y + h, r);
		this.lineTo(x + w - r, y + h);
		this.arcTo(x + w, y + h, x + w, y + h-r, r);
		this.lineTo(x + w, y);
		this.lineTo(x, y);
		this.lineTo(x, y + r);
	}

	this.closePath();

	if(lineWidth > 0) this.stroke();

	if (fillmode == true)	this.fill();
	else					this.clip();
}

CanvasRenderingContext2D.prototype.drawTrapezoid = function (x, y, w, h, ofs, fillmode) {
	this.beginPath();
	this.moveTo(x + ofs, y);
	this.lineTo(x + w - ofs, y);
	this.lineTo(x + w, y + h);
	this.lineTo(x, y + h);
	this.lineTo(x + ofs, y);

	if (fillmode != true)	this.fill();
	else					this.clip();

	this.stroke();
}

CanvasRenderingContext2D.prototype.drawTriangle = function (x, y, w, h, fillmode, mode) {
	this.beginPath();
	if (mode == "full") {
		this.moveTo(x+(w/2), y);
		this.lineTo(x+w, y+h);
		this.lineTo(x, y+h);
		this.lineTo(x+(w/2), y);
	}
	else if (mode == "right") {
		this.moveTo(x, y);
		this.lineTo(x+w, y+h);
		this.lineTo(x, y+h);
		this.lineTo(x, y);
	}
	else {
		console.log("is not mode!!");
	}

	if (fillmode != true)	this.fill();
	else					this.clip();

	this.stroke();
}

//// Prototypes of string
String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };

//// protypes of number
Number.prototype.ceil = function () { return Math.ceil(this); };
Number.prototype.zf = function (len) { return this.toString().zf(len); };
Number.prototype.pad = function(size) {	var s = String(this); while (s.length < (size || 2)) {s = "0" + s;}	return s; }
Number.prototype.format = function(nDec, bComma) { 
	var strVal = this.toFixed(nDec).toString(); 
	var decPart = strVal.split("."); 
	if(bComma == true) { 
		strVal = decPart[0].replace(/\B(?=(\d{3})+(?!\d))/g,",") + (decPart[1] ? "." + decPart[1] : ""); 
	} 

	return strVal;
}

//// protypes of date
Date.prototype.format = function (f) {
	if (!this.valueOf()) return " ";
	var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
	var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
	var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	var d = this;

	return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
		switch ($1) {
			case "yyyy": return d.getFullYear(); // 년 (4자리)
			case "yy": return (d.getFullYear() % 1000).zf(2); // 년 (2자리)
			case "MM": return (d.getMonth() + 1).zf(2); // 월 (2자리)
			case "dd": return d.getDate().zf(2); // 일 (2자리)
			case "KS": return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
			case "KL": return weekKorName[d.getDay()]; // 요일 (긴 한글)
			case "ES": return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
			case "EL": return weekEngName[d.getDay()]; // 요일 (긴 영어)
			case "HH": return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)
			case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간(12 시간 기준, 2자리)
			case "mm": return d.getMinutes().zf(2); // 분 (2자리)
			case "ss": return d.getSeconds().zf(2); // 초 (2자리)
			case "a/p": return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
			default: return $1;
		}
	});
};

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
		(+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
	);
}

//// classes
(function(window, $) {
	let BIZRENDER_DATA_KEY = "BizRender";

	function Workspace() {
		const shapeTypes = ['group', 'line', 'rectangle', 'ellipse', 'triangle', 'rhombus', 'pentagon' ];

		let workspace_self = this;
		this.pressedKeys = new Array();

		this.showAll = false;
		this.edit = false;
		this.undo = new Array();
		this.redo = new Array();

		// callback
		this.onTimeChanged = $.noop;
		this.onItemClick = $.noop;
		this.onItemClickBefore = $.noop;
		//this.onItemDblClick = $.noop;
		this.onChange = $.noop;
		this.onValueChanged = $.noop;
		this.onSizeChanged = $.noop;
		this.onTagChanged = $.noop;

		this.bInit = false;
		this.tick = 0;
		this.drag = {left:0, top:0, x:0, y:0, cx:0, cy:0, mode: 'none', active: false};

		this._container = null;
		this.config = null;
		this.data = [];
		this.layoutBase = null;
		this.rootPath = "/resources/js/biznexus";
		this.timer = null;

		this.images = {};
		this.images.check = new Image();
		this.images.check.src = getContextPath() + this.rootPath + "/images/check.png";

		this.canvasManager = new CanvasManager();
		this.renderManager = new RenderManager();
		this.shapeManager = new ShapeManager();
		this.valueManager = new ValueManager();
		this.scriptManager = new ScriptManager();
		this.tagManager = new TagManager();

		let undo = function() {
			let undoInsert = function(arr) {
				let item = { action:'del', data: []};
				for(let obj of arr) {
					workspace_self.shapeManager.insertShape(obj);
					item.data.push(obj.clone());
				}

				return item;
			}

			let undoDelete = function(arr) {
				let item = { action:'insert', data: []};
				for(let obj of arr) {
					workspace_self.shapeManager.deleteShape(obj);
					item.data.push(obj.clone());
				}

				return item;
			}

			let undoGroup = function(arr, flag) {
				let item = {};
				if(flag )
					item = workspace_self.shapeManager.group(arr);
				else 
					item = workspace_self.shapeManager.ungroup(arr);

				return { action: flag ? 'ungroup' : 'group', data:item};;
			}

			let undoReorder = function(arr, param) {
				for(let shape of arr) workspace_self.shapeManager.deleteShape(shape);
				for(let shape of arr) workspace_self.shapeManager.insertShape(shape);

				return { action: param, data:arr};;
			}

			let undoUpdate = function(arr) {
				let item = { action:'update', data:[]};
				for(let obj of arr) {
					let prev = workspace_self.shapeManager.updateShape(obj);
					item.data.push(prev);
				}

				return item;
			}

			////
			if(workspace_self.undo.length > 0) { //&& workspace_self.redo.length <= 200) {
				let item = workspace_self.undo.shift();
				let arr = item.data;

				let redoList = [];
				if(item.action == 'insert') redoList = undoDelete(arr);
				if(item.action == 'del') redoList = undoInsert(arr);
				if(item.action == 'group') redoList = undoGroup(arr, false);
				if(item.action == 'ungroup') redoList = undoGroup(arr, true);
				if(item.action == 'update') redoList = undoUpdate(arr);
				if(item.action == 'toTop') redoList = undoReorder(arr, item.action);
				if(item.action == 'toBottom') redoList = undoReorder(arr, item.action);
				if(item.action == 'toFront') redoList = undoReorder(arr, item.action);
				if(item.action == 'toBack') redoList = undoReorder(arr, item.action);

				workspace_self.redo.unshift(redoList);
				workspace_self.refreshAll();

				workspace_self.onChange('undo', workspace_self.undo);
				workspace_self.onChange('redo', workspace_self.redo);
			}
		}

		let redo = function() {
			let redoUpdate = function(arr) {
				for(let obj of arr) {
					workspace_self.shapeManager.updateShape(obj);
				}
			}

			let redoInsert= function(arr) {
				for(let obj of arr) {
					workspace_self.shapeManager.insertShape(obj);
				}
			}

			let redoDel = function(arr) {
				for(let obj of arr) {
					workspace_self.shapeManager.deleteShape(obj);
				}
			}

			let redoGroup = function(arr, flag) {
				if(flag )
					workspace_self.shapeManager.group(arr);
				else 
					workspace_self.shapeManager.ungroup(arr);
			}

			let redoReorder = function(arr, param) {
				workspace_self.shapeManager.getShapeList().unselectShapes();
				for(let shape of arr) shape.bSel = true;
				workspace_self.shapeManager.reorderShapes(param);
			}

			// sub-main
			if(workspace_self.redo.length > 0) {
				let item = workspace_self.redo.shift();
				let arr = item.data;
				if(item.action == 'insert') redoInsert(arr);
				if(item.action == 'del') redoDel(arr);
				if(item.action == 'update') redoUpdate(arr);
				if(item.action == 'group') redoGroup(arr, true);
				if(item.action == 'ungroup') redoGroup(arr, false);
				if(item.action == 'toTop') redoList = redoReorder(arr, item.action);
				if(item.action == 'toBottom') redoList = redoReorder(arr, item.action);
				if(item.action == 'toFront') redoList = redoReorder(arr, item.action);
				if(item.action == 'toBack') redoList = redoReorder(arr, item.action);

				workspace_self.refreshAll();
			}
			workspace_self.onChange('redo', workspace_self.redo);
		}

		if(this.timer == null) {
			this.timer = setInterval(function() {
				workspace_self.onTimer();
			}, 100);
		}

		let clearSelector = function() {
			let canvas = workspace_self.canvasManager.getCanvas();
			workspace_self.renderManager.clearSelector(canvas, workspace_self.shapeManager.getShapeList().shapes, workspace_self.drag);
		}

		this.createShape = function(shapeType, subType) {
			workspace_self.shapeManager.getShapeList().unselectShapes();
			workspace_self.drag.mode = shapeType;
			if(subType !== '') workspace_self.drag.mode += "," + subType; 
		}

		this.doIt = function(param) {
			switch(param) {
			case 'redo' : redo(); break;
			case 'refreshAll' : workspace_self.refreshAll(); break;
			case 'run' : workspace_self.scriptManager.run([]);
			case 'show' : workspace_self.showAll = false; workspace_self.refreshAll(); break;
			case 'show-all' : workspace_self.showAll = true; workspace_self.refreshAll(); break; 
			case 'undo' : undo(); break;
			}
		}

		this.get = function(param) {
			let ret = [];

			switch(param) {
			case 'names' : 
				workspace_self.shapeManager.refreshShapeNames()
				ret = workspace_self.shapeManager.getShapeList().shapeNames;
				ret = Object.keys(ret); 
				break;
			case 'shapes' : ret = workspace_self.shapeManager.getShapeList().shapes; break;
			case 'tags' : ret = workspace_self.shapeManager.getTagList(); break;
			}

			return ret;
		}

		this.loadLayout = function(file, fn) {
			file = workspace_self.layoutBase + file + ".xml";
			workspace_self.shapeManager.loadLayout(file, fn);
		}

		this.getRoot = function() {
			let shapeList = workspace_self.shapeManager.getShapeList();
			return { 
				comment : shapeList.comment,
				width : shapeList.width, 
				height: shapeList.height,
				backImage : shapeList.backImage,
				backColor : shapeList.backColor
			}
		}

		this.init = function(element, config) {
			var $element = $(element);
			$element.data(BIZRENDER_DATA_KEY, workspace_self);

			if(config.onSizeChanged !== undefined) workspace_self.onSizeChanged = config.onSizeChanged;
			if(config.onTimeChanged !== undefined) workspace_self.onTimeChanged = config.onTimeChanged;
			if(config.onItemClick !== undefined) workspace_self.onItemClick = config.onItemClick;
			if(config.onItemClickBefore !== undefined) workspace_self.onItemClickBefore = config.onItemClickBefore;
			if(config.onChange !== undefined) workspace_self.onChange = config.onChange;
			if(config.onValueChanged !== undefined) workspace_self.onValueChanged = config.onValueChanged;
			if(config.onTagChanged !== undefined) workspace_self.onTagChanged = config.onTagChanged;

			workspace_self.canvasManager.create(element[0], workspace_self);
			workspace_self.layoutBase = config.layoutPath;
			workspace_self.rootPath = config.rootPath || "/resources/js/biznexus";
			workspace_self.images.check.src = getContextPath() + workspace_self.rootPath + "/images/check.png";
			workspace_self.baseRatio = config.baseRatio;
			workspace_self.load(config.fileName);

			if(typeof(config.edit) != 'undefined')	workspace_self.edit = config.edit;
		}

		this.load = function(file) {
			workspace_self.bInit = false;

			let fileName = workspace_self.layoutBase + file + ".xml";
			workspace_self.shapeManager.loadLayout(fileName, function(shapeList) {
				if(workspace_self.edit == true) {
					workspace_self.onChange('layout', shapeList);
				}
				else 
					workspace_self.reqValues();

				workspace_self.onSize();
				workspace_self.undo = new Array();
				workspace_self.redo = new Array();
			});
		}

		let resetEffectByMouse = function(param) {
			let shapeList = workspace_self.shapeManager.getShapeList();
			// 마우스 이벤트 효과가 있는 객체와 연결된 Shape은 visibile을 false로 처리한다.
			for(let shape of shapeList.shapes) {
				if(shape.name[0] == '$') {
					workspace_self.renderManager.checkRedrawShape(shapeList.shapes, shape);
					shape.visible = false;
					shape.bDraw = true;
					workspace_self.refresh();
					break;
				}

				if(shape.effectByMouse === undefined) continue;
				if(shape.effectByMouse.event != param) continue;
				if(shape.effectByMouse.panel[0] == '$') continue;

				let shapeNames = shapeList.shapeNames;
				if(shapeNames[shape.effectByMouse.panel]){
					shapeNames[shape.effectByMouse.panel].visible = false;
					shapeNames[shape.effectByMouse.panel].bDraw = true;
				}
				workspace_self.refresh();
			}
		}

		let doEffectByMouse = function(src, flag) {
			let name = src.effectByMouse.panel;
			let shapeList = workspace_self.shapeManager.getShapeList();
			if(name[0] == '$') {
				shapeList.showTooltip(src);
			}
			else {
				let shapeNames = shapeList.shapeNames;
				let shape = shapeNames[name];
				if(shape !== undefined) {
					let x = shape.x, y = shape.y;
					switch(src.effectByMouse.position) {
					case 'left-top': x = src.x - shape.cx; y = src.y;	break;
					case 'left-bottom': x = src.x - shape.cx; y = src.y - shape.cy; break;
					case 'right-top': x = src.x + src.cx; y = src.y; break;
					case 'right-bottom': x = src.x + src.cx; y = src.y - shape.cy; break;
					}

					let xy = { x:shape.x, y:shape.y };
					shape.x = x;
					shape.y = y;
					shape.visible = flag;
					shape.bDraw = flag;
					for(let child of shape.children) {
						child.x = x + child.x - xy.x;
						child.y = y + child.y - xy.y;
						child.visible = flag;
						child.bDraw = flag;
					}
				}
			}
		}

		this.onDblClick = function(e) {
			if(workspace_self.edit == false) {
				let shapes = workspace_self.shapeManager.getShapeList().shapes;
				let nLen = shapes.length - 1;
				for(let i = nLen; i >= 0; i--) {
					if(i < 0) break;
					let shape = shapes[i];

					if(e.offsetX >= shape.left && e.offsetX <= shape.left + shape.width &&
						e.offsetY >= shape.top && e.offsetY <= shape.top + shape.height) {
						if(typeof(shape.effectByValue) == 'undefined') continue;
						shape.bSel = shape.bSel == true ? false : true; 
						shape.bDraw = true;
						break;
					}
				}
			}
		}

		this.onClick = function(e) {
			let outValues = function(tag, value) {
				var req = new Object();
				req.cmd = "outValues";
				req.param = [{ name:tag, val:value.toString()}];

				postMessage("/req-tag", req, function(tagList, data) {
					tagInfo = [];
					if(tagList.length){
						for(let tag of tagList) tagInfo[tag.name] = tag;
					}

					workspace_self.onItemClick(tagList, data);
				});
			}

			let doIt = function(link) {
				switch(link) {
					case "$FULL-SCREEN" :
						document.documentElement.requestFullscreen(); 
						break;
					case "$NORMAL-SCREEN" : 
						document.exitFullscreen();
						break;
					default:
						workspace_self.load(link);
						break;
				}
			}

			let doEffectByLink = function(shape) {
				workspace_self.canvasManager.setCursor('pointer');
				if(shape.effectByLink.link[0] != '$')
					doIt(shape.effectByLink.link);
				else
					workspace_self.onItemClick(shape.effectByLink.link);
			}

			let doEffectBySwitch = function(shape) {
				workspace_self.canvasManager.setCursor('pointer');
				if(shape.effectBySwitch.status == '') {
					shape.effectBySwitch.controlVal = (shape.effectBySwitch.val + 1) % shape.effectBySwitch.states.length;
				}
				if(shape.effectBySwitch.control !== '') {
					shape.effectBySwitch.controlVal = (shape.effectBySwitch.val + 1) % shape.effectBySwitch.states.length;
					outValues(shape.effectBySwitch.control, shape.effectBySwitch.controlVal);
				}

//				workspace_self.onItemClick(shape.effectBySwitch);
			}

			let doEffectByToggleImage = function(shape) {
				workspace_self.canvasManager.setCursor('pointer');
				let seq = shape.effectByToggleImage.seq;
				doIt(shape.effectByToggleImage.states[seq].link);
				shape.effectByToggleImage.seq = (shape.effectByToggleImage.seq + 1) % shape.effectByToggleImage.states.length;
				shape.fill.image = new Image();
				shape.fill.image.onload = function() { shape.bDraw = true; workspace_self.refresh(); };

				seq = shape.effectByToggleImage.seq;
				let imageSrcPath = getContextPath() + workspace_self.rootPath + "/images/" + shape.effectByToggleImage.states[seq].state + ".png";
				shape.fill.image.src = imageSrcPath;
			}

			let shapeClicked = null;
			let shapes = workspace_self.shapeManager.getShapeList().shapes;
			let nLen = shapes.length - 1;
			for(let i = nLen; i >= 0; i--) {
				if(i < 0) break;
				let shape = shapes[i];

				if(e.offsetX >= shape.left && e.offsetX <= shape.left + shape.width &&
					e.offsetY >= shape.top && e.offsetY <= shape.top + shape.height) {
					shapeClicked = shape;
					if(workspace_self.edit == false) {
						shape.stopped = false;
						const stopped = workspace_self.onItemClickBefore(shape);
						if(!stopped || !stopped.stopped){
							if(shape.effectByLink !== undefined) {doEffectByLink(shape); break;	}
							if(shape.effectByToggleImage !== undefined) { doEffectByToggleImage(shape);break; } 
							if(shape.effectBySwitch !== undefined) { doEffectBySwitch(shape);break; } 
							if(shape.effectByMouse !== undefined) {	doEffectByMouse(shape, true); break; } 
							if(shape.name != ""){ workspace_self.onItemClick(shape.name); break; }
						}
					}
				}
			}
			if(shapeClicked == null) {
				if(workspace_self.drag.mode != 'none' ) workspace_self.onItemClick([]);
				if(workspace_self.edit == false) {
					resetEffectByMouse('click');
					workspace_self.refreshAll();
				}
			}
		}
		this.onKeyDown = function(e) {
			let copyShapes = function() {
				let shapes = workspace_self.selectedShapes();
				let dst = [];
				for(let shape of shapes) {
					let obj = shape.clone();
					dst.push(obj);
				} 
				let strShapes = JSON.stringify(dst);
				localStorage.setItem('bizNexus', strShapes);
			}

			let pasteShapes = function() {
				let strShapes = localStorage.getItem('bizNexus');
				if(strShapes.length > 0) {
					let shapes = JSON.parse(strShapes);
					workspace_self.appendShapes(shapes);
				}
			}

			workspace_self.pressedKeys[e.key] = true;

			switch(e.key) {
			case 'ArrowDown' : workspace_self.shapeManager.getShapeList().moveShapes('down'); break;
			case 'ArrowUp' : workspace_self.shapeManager.getShapeList().moveShapes('up'); break;
			case 'ArrowLeft' : workspace_self.shapeManager.getShapeList().moveShapes('left'); break;
			case 'ArrowRight' : workspace_self.shapeManager.getShapeList().moveShapes('right'); break;
			case 'Delete' : 
				workspace_self.shapeManager.deleteShapes();
				workspace_self.onChange('undo', workspace_self.undo);
 				break;
			case 'c' : case 'C' : if(workspace_self.pressedKeys['Control'] == true) copyShapes(); break;
			case 'v' : case 'V' : if(workspace_self.pressedKeys['Control'] == true) pasteShapes(); break;
			case 'z' : case 'Z' : if(workspace_self.pressedKeys['Control'] == true) undo(); break;
			case 'x' : case 'X' : if(workspace_self.pressedKeys['Control'] == true) redo(); break;
			case 'Escape' : workspace_self.drag.mode = 'none'; break;
			case 'F6' : if(workspace_self.edit == false) document.documentElement.requestFullscreen();break;
			case 'F7' : if(workspace_self.edit == false) document.exitFullscreen();break; 
			case 'F8' : if(workspace_self.edit == false) workspace_self.onChange('trend'); break;
			case 'F9' : if(workspace_self.edit == false) workspace_self.onChange('show'); break;
			}
		}

		this.onKeyUp = function(e) {
			delete workspace_self.pressedKeys[e.key];
		}

		let createShape = function(x, y, shapeTypeAndSub) {
			let tokens = shapeTypeAndSub.split(",");
			let shapeType = tokens[0], subType ='';
			if(tokens.length > 1) subType = tokens[1];

			if(shapeTypes.some((name) => name == shapeType) == true) {
				let shapes = workspace_self.shapeManager.getShapeList().shapes;

				let shape = new Shape();
				shape.type = shapeType;
				shape.sub = subType;
				shape.x = x;
				shape.y = y;
				shape.cx = shape.cy = 100;
				shape.bSel = shape.bDraw = true ;
				if(shapeType == 'line') {
					shape.line.width = 1;
					shape.line.dir = 1;
				}

				shapes.push(shape);
				shape.index = shapes.length - 1;

				workspace_self.undo.unshift({action:'insert', data:[shape.clone()]});
				workspace_self.onChange('undo', workspace_self.undo);


				workspace_self.refresh();
			}
		}

		this.onMouseDown = function(e) {
			if(workspace_self.edit == true) {
				if(workspace_self.drag.mode == 'none') {
					workspace_self.shapeManager.getShapeList().hitShape(workspace_self.drag, e);
					if(workspace_self.drag.mode == 'select') {
						workspace_self.shapeManager.getShapeList().unselectShapes();
					}
					workspace_self.refresh();
				}
				else {
					createShape(e.offsetX, e.offsetY, workspace_self.drag.mode);
					workspace_self.drag.mode = "none";
				}
			}
		}

		let bDuplicated = false;
		let hoverShape = null;
		this.onMouseMove = function(e) {
			let copyAndPasteShapes = function() {
				let dst = [];
				let shapes = workspace_self.selectedShapes();
				for(let shape of shapes) {
					let obj = shape.clone();
					dst.push(obj);
				} 
				workspace_self.appendShapes(dst);
			}

			let shapeOrCursor = workspace_self.shapeManager.getShapeList().checkCursor(e);
			workspace_self.canvasManager.setCursor(shapeOrCursor.cursor);

			if(workspace_self.edit == true) {
				if(workspace_self.drag.mode == 'select') {
					workspace_self.shapeManager.getShapeList().selectShapes(workspace_self.drag, e);
					clearSelector();

					workspace_self.drag.cx = e.offsetX - workspace_self.drag.left;
					workspace_self.drag.cy = e.offsetY - workspace_self.drag.top;
				}
				else if(workspace_self.drag.mode != 'none') {
					let deltaX = workspace_self.drag.x - e.offsetX;
					let deltaY = workspace_self.drag.y - e.offsetY;

					/*
					if(workspace_self.pressedKeys['Shift'] !== undefined) {
						if(Math.abs(deltaX) > Math.abs(deltaY))
							deltaY = 0;
						else if(Math.abs(deltaX) < Math.abs(deltaY))
							deltaX = 0;
					}
					*/

					if(workspace_self.pressedKeys['Control'] !== undefined) {
						if(bDuplicated == false) {
							copyAndPasteShapes();
							bDuplicated = true;
						}
					}
					else
						bDuplicated = false;

					if(deltaX != 0 || deltaY != 0) {
						workspace_self.shapeManager.getShapeList().doDrag(workspace_self.renderManager, workspace_self.drag.mode, deltaX, deltaY, e);
						workspace_self.drag.active = true;
					}
				}

				workspace_self.drag.x = e.offsetX;
				workspace_self.drag.y = e.offsetY;

				workspace_self.refresh();
			}
			else {
				if(shapeOrCursor.shape != null) {
					if(shapeOrCursor.shape.effectByMouse !== undefined) { 
						if(shapeOrCursor.shape.effectByMouse.event === 'over') {
							if(hoverShape != shapeOrCursor.shape) {
								resetEffectByMouse('over');
								doEffectByMouse(shapeOrCursor.shape, true);
								hoverShape = shapeOrCursor.shape;
							}
						}
					} 
				}
				else {
					if(hoverShape != null) {
						resetEffectByMouse('over');
						hoverShape = null;
					}
				}
			}
		}

		this.onMouseUp = function(e) {
			if(workspace_self.edit == true) {
				let arr = [];
				let shapes = workspace_self.shapeManager.getShapeList().shapes;
				for(let i = 0; i < shapes.length; i++) {
					let shape = shapes[i];
					if(shape.bSel == true) {

						if(shape.type == "line" && (shape.cx < 0 || shape.cy < 0)) {
							if((shape.cx < 0 || shape.cy < 0) && !(shape.cx <= 0 && shape.cy <= 0)) 
								shape.line.dir = shape.line.dir == 1 ? 2 : 1;
						}
	 
						if(shape.cx < 0) { shape.x += shape.cx; shape.cx *= -1; }
						if(shape.cy < 0) { shape.y += shape.cy; shape.cy *= -1; }
						arr.push(shape);
					}
				}
				workspace_self.onItemClick(arr);

				clearSelector();
				workspace_self.drag.active = false;
				workspace_self.drag.mode = 'none';
				workspace_self.drag.cx = workspace_self.drag.cy = 0;

				bDuplicated = false;
			}
		}

		this.onSize = function() {
			let isFullscreen = Math.abs(screen.height - window.outerHeight) <= 20; 
			if(typeof(workspace_self.onSizeChanged) != 'undefined') workspace_self.onSizeChanged(isFullscreen);

			workspace_self.renderManager.setRefreshBack(true);
			workspace_self.shapeManager.setRedraw(true);
			workspace_self.canvasManager.onSize();
		}

		this.onTimer = function() {
			if(workspace_self.bInit == true && workspace_self.edit == false) {
				workspace_self.refresh();
				if(++workspace_self.tick % 10 == 0) workspace_self.reqValues();
			}
		}
		this.onTimerStop = function() {
			if(workspace_self.timer != null){
				clearInterval(workspace_self.timer);
				workspace_self.timer = null;
			}
		}
		this.onTimerStart = function() {
			if(workspace_self.timer == null){
				workspace_self.timer = setInterval(function() {
					workspace_self.onTimer();
				}, 100);
			}
		}

		this.recalcLayout = function(param) {
			let recalcLayoutHorz = function(shapes) {
				shapes.sort(function(a, b){
					if(a.x < b.x) return -1;
					if(a.x > b.x) return 1;
					if(a.x === b.x) return 0;
				});

				let sum = 0, right = 0;
				for(let shape of shapes) {
					if(right != 0) 
						sum += shape.x - right;
					right = shape.x + shape.cx;
				}

				let gap = sum / (shapes.length - 1), left = 0;
				for(let idx in shapes) {
					if(idx >= shapes.length - 1) break;
					let shape = shapes[idx];
					if(left == 0) left = shape.x; 
					shape.x = left;
					left = shape.x + shape.cx + gap; 
					shape.bDraw = true;
				}
				workspace_self.refresh();
			}

			let recalcLayoutVert = function(shapes) {
				shapes.sort(function(a, b){
					if(a.y < b.y) return -1;
					if(a.y > b.y) return 1;
					if(a.y === b.y) return 0;
				});

				let sum = 0, bottom = 0;
				for(let shape of shapes) {
					if(bottom != 0) 
						sum += shape.y - bottom;
					bottom = shape.y + shape.cy;
				}

				let gap = sum / (shapes.length - 1), top = 0;
				for(let idx in shapes) {
					if(idx >= shapes.length - 1) break;
					let shape = shapes[idx];
					if(top == 0) top = shape.y; 
					shape.y = top;
					top = shape.y + shape.cy + gap; 
					shape.bDraw = true;
				}
				workspace_self.refresh();
			}

			let shapes = workspace_self.selectedShapes();
			switch(param) {
				case 'horz' : recalcLayoutHorz(shapes); break;
				case 'vert' : recalcLayoutVert(shapes); break;
			}
		}

		this.reorderLayout = function(param) {
			workspace_self.shapeManager.reorderShapes(param);
			workspace_self.refreshAll();
		}

		this.refresh = function() {
			workspace_self.renderManager.drawBack(workspace_self.canvasManager.getBackCanvas(), workspace_self.shapeManager);
			workspace_self.renderManager.draw(workspace_self.canvasManager.getCanvas(), workspace_self.shapeManager);
		}

		this.refreshAll = function() {
			workspace_self.renderManager.setRefreshBack(true);
			workspace_self.shapeManager.setRedraw(true);
			workspace_self.refresh();
		}

		this.reqValues = function() {
			let tagList = workspace_self.shapeManager.getTagList();
			if(tagList.length > 0) {
				workspace_self.valueManager.reqValues(tagList, function(values) {
					workspace_self.shapeManager.setValues(values);
					let newValues = workspace_self.scriptManager.run(workspace_self.shapeManager.getTagValues());
					workspace_self.shapeManager.setValues(newValues);
				});
			}
		}

		this.setGroup = function(flag) {
			let shapes = workspace_self.shapeManager.getShapeList().shapes;

			let group = function() {
				let objects = [];

				for(let i = 0; i < shapes.length; i++) {
					let shape = shapes[i];
					if(shape.bSel == false) continue;

					shape.index = i;
					objects.push(shape);
				}
				let item = workspace_self.shapeManager.group(objects);

				workspace_self.undo.unshift({action:'group', data:item});
				workspace_self.onChange('undo', workspace_self.undo);
				workspace_self.onMouseUp();
			}

			let ungroup = function() {
				let groups = [];
				for(let i = 0; i < shapes.length; i++) {
					let shape = shapes[i];
					if(shape.bSel == false) continue;
					if(shape.type != 'group') continue;

					groups.push(shape);
				}

				let items = workspace_self.shapeManager.ungroup(groups);

				workspace_self.undo.unshift({action:'ungroup', data:items});
				workspace_self.onChange('undo', workspace_self.undo);
				workspace_self.onMouseUp();
			}

			if(flag == true) 
				group();
			else
				ungroup();

			workspace_self.refreshAll();
		}

		this.setRoot = function(p) {
			let shapeList = workspace_self.shapeManager.getShapeList();

			if(p.comment !== undefined) shapeList.comment = p.comment;
			if(p.slide !== undefined) shapeList.slide = p.slide;
			if(p.script !== undefined) shapeList.script = p.script;
			if(p.width !== undefined) {shapeList.width = p.width; workspace_self.onSize();}
			if(p.height !== undefined) {shapeList.height = p.height; workspace_self.onSize();}
			if(p.backColor !== undefined) shapeList.backColor = p.backColor;
			if(p.backImage !== undefined) { 
				if(p.backImage != '') {
					shapeList.backImage = new Image();
					shapeList.backImage.onload = function() {
						workspace_self.renderManager.setRefreshBack(true);
						workspace_self.refresh();
					}
					shapeList.backImage.src = p.backImage;
				}
				else {
					workspace_self.renderManager.setRefreshBack(true);
					delete shapeList.backImage;
					workspace_self.refresh();
				}
			}
		}

		this.updateShapes = function(s) {
			let recalcX = function(shape, x) {
				let diffX = shape.x - x;
				shape.x = x;
				if(shape.type == 'group') {
					for(let child of shape.children) child.x -= diffX;
				} 
			}
			let recalcCX = function(shape, cx) {
				let rate = (shape.cx - cx) / shape.cx;
				shape.cx = cx;
				if(shape.type == 'group') {
					for(let child of shape.children) {
						child.x = Math.max(child.x - child.cx * rate, shape.x);
						child.cx -= child.cx * rate;
					}
				} 
			}
			let recalcY = function(shape, y) {
				let diffY = shape.y - y;
				shape.y = y;
				if(shape.type == 'group') {
					for(let child of shape.children) child.y -= diffY;
				} 
			}
			let recalcCY = function(shape, cy) {
				let rate = (shape.cy - cy) / shape.cy;
				shape.cy = cy;
				if(shape.type == 'group') {
					for(let child of shape.children) {
						child.y = Math.max(child.y - child.cy * rate, shape.y);
						child.cy -= child.cy * rate;
					}
				} 
			}

			// relating appearances
			let setBottom = function(shape, s) { recalcY(shape, Number(s.bottom) - shape.cy);	}
			let setCenter = function(shape, s) { recalcX(shape, Number(s.center) - shape.cx / 2); }
			let setMiddle = function(shape, s) { recalcY(shape, Number(s.middle - shape.cy / 2)); checkAndSetEffectByFill(shape);	} 
			let setRight = function(shape, s) { recalcX(shape, Number(s.right - shape.cx)); checkAndSetEffectByFill(shape); }
			let setHeight = function(shape, s) { recalcCY(shape, Number(s.cy)); checkAndSetEffectByFill(shape); }
			let setWidth = function(shape, s) { recalcCX(shape, Number(s.cx)); checkAndSetEffectByFill(shape); }
			let setX = function(shape, s) { recalcX(shape, Number(s.x)); checkAndSetEffectByFill(shape); }
			let setY = function(shape, s) { recalcY(shape, Number(s.y)); checkAndSetEffectByFill(shape); }

			let setFlipHorz = function(shape, s) { shape.flipHorz = s.flipHorz }
			let setFlipVert = function(shape, s) { shape.flipVert = s.flipVert }
			let setFontFamily = function(shape, s) { shape.font.fontFamily = s.font.fontFamily; }
			let setFontSize = function(shape, s) { shape.font.fontSize = s.font.fontSize; }
			let setFontStyle = function(shape, s) {
				if(s.font.fontStyle > 0xF0) 
					shape.font.fontStyle &= s.font.fontStyle;
				else
					shape.font.fontStyle |= s.font.fontStyle;
			}
			let setFontTextColor = function(shape, s) {	shape.font.color = s.font.color; }
			let setFontHorz = function(shape, s) { shape.font.textAlignHorz = s.font.textAlignHorz; }
			let setFontVert = function(shape, s) { shape.font.textAlignVert = s.font.textAlignVert; }
			let setFillColor = function(shape, s) { shape.fill.color = s.fill.color; }
			let setFillText = function(shape, s) { shape.fill.text = shape.fill.string = s.fill.text; }
			let setFillImage = function(shape, s) { 
				if(s.fill.image != '') {
					shape.fill.image = new Image();
					shape.fill.image.onload = function() {workspace_self.refresh();}
					shape.fill.image.src = s.fill.image;
					shape.fill.bGIF = s.fill.image.endsWith(".gif") ? true : false;
				} 
				else {
					delete shape.fill.image;
				}
			}
			//let setLineColor = function(shape, s) { shape.line.color = s.line.color; }
			//let setLineWidth = function(shape, s) { shape.line.width = s.line.width; }
			let setLine = function(shape, s) { shape.line = s.line; }
			let setRound = function(shape, s) { shape.round = s.round; }
			let setEffectByBlink = function(shape, s) {
				if(s.effectByBlink.tagName === undefined) 
					delete shape.effectByBlink;
				else 
					shape.effectByBlink = s.effectByBlink;
			}
			let setEffectByColorlist = function(shape, s) {
				if(s.effectByColorlist.tagName === undefined) 
					delete shape.effectByColorlist;
				else 
					shape.effectByColorlist = s.effectByColorlist;
			}
			let setEffectByFill = function(shape, s) {
				if(s.effectByFill.tagName === undefined) 
					delete shape.effectByFill;
				else {
					shape.effectByFill = s.effectByFill;
					shape.effectByFill.rect = { x:shape.x, y:shape.y, cx:shape.cx, cy:shape.cy };
					shape.effectByFill.ratio = 0.000001;
				}
			}
			let setEffectByImagelist = function(shape, s) {
				if(s.effectByImagelist.tagName === undefined) 
					delete shape.effectByImagelist;
				else 
					shape.effectByImagelist = s.effectByImagelist;
			}
			let setEffectByMouse = function(shape, s) {
				if(s.effectByMouse.event === undefined) 
					delete shape.effectByMouse;
				else 
					shape.effectByMouse = s.effectByMouse;
			}
			let setEffectByToggleImage = function(shape, s) {
				if(Object.keys(s.effectByToggleImage).length === 0) {
					delete shape.effectByToggleImage;
					delete shape.fill.image;
				}
				else {
					shape.effectByToggleImage = s.effectByToggleImage;
					shape.fill.bGIF = false;
					shape.fill.image = new Image();
					shape.fill.image.onload = function() { shape.bDraw = true; workspace_self.refresh(); };
					let imageSrcPath = getContextPath() + workspace_self.rootPath + "/images/" + s.effectByToggleImage.states[0].state + ".png";
					shape.fill.image.src = imageSrcPath;
				}
			}

			let setEffectBySwitch = function(shape, s) {
				if(s.effectBySwitch.control === undefined) { 
					delete shape.effectBySwitch;
					delete shape.fill.image;
				}
				else {
					shape.effectBySwitch = s.effectBySwitch;
					shape.effectBySwitch.controlVal = shape.effectBySwitch.val = 0;
					shape.fill.bGIF = false;
					shape.fill.image = new Image();
					shape.fill.image.onload = function() { shape.bDraw = true; workspace_self.refresh(); };
					let imageSrcPath = getContextPath() + workspace_self.rootPath + "/images/" + s.effectBySwitch.states[0] + ".png";
					shape.fill.image.src = imageSrcPath;
				}
			}

			let setEffectByChart = function(shape, s) {
				if(s.effectByChart.options.length === 0) 
					delete shape.effectByChart;
				else 
					shape.effectByChart = s.effectByChart;
			}

			let setEffectByGauge = function(shape, s) {
				if(s.effectByGauge.tag === undefined) 
					delete shape.effectByGauge;
				else 
					shape.effectByGauge = s.effectByGauge;
			}


			let setEffectByValue = function(shape, s) {
				if(Object.keys(s.effectByValue).length === 0) {
					delete shape.effectByValue;
					shape.fill.text = shape.fill.string;
				}
				else {
					if(shape.effectByValue == undefined) shape.effectByValue = {tagName:'', commaDelimeted:true, decPos:0, length:0 };
					if(s.effectByValue.tagName !== undefined) shape.effectByValue.tagName = s.effectByValue.tagName;
					if(s.effectByValue.commaDelimeted !== undefined) shape.effectByValue.commaDelimeted = s.effectByValue.commaDelimeted;
					if(s.effectByValue.decPos !== undefined) shape.effectByValue.decPos = s.effectByValue.decPos;
					Common.setFormatString(shape);
				}
			}
			let setEffectByLink = function(shape, s) {
				if(s.effectByLink.link == '') {
					delete shape.effectByLink.link; 
					delete shape.effectByLink; 
				}
				else {
					shape.effectByLink = {};
					shape.effectByLink.link = s.effectByLink.link;
				} 
			}
			let setName = function(shape, s) { shape.name = s.name; }
			let setRotate = function(shape, s) { shape.rotate = Number(s.rotate); checkAndSetEffectByFill(shape); }
			let setShow = function(shape, s) { 
				shape.visible = s.visible;
				for(let child of shape.children) {
					child.visible = s.visible;
					child.bDraw = true;
				} 
			} 

			let checkAndSetEffectByFill = function(shape) {
				if(shape.effectByFill !== undefined) {
					shape.effectByFill.rect = { x:shape.x, y:shape.y, cx:shape.cx, cy:shape.cy }
				}
			}

			let fn = null;

			if(s.effectByLink !== undefined) fn = setEffectByLink;
			if(s.effectByBlink !== undefined) fn = setEffectByBlink;
			if(s.effectByColorlist !== undefined) fn = setEffectByColorlist;
			if(s.effectByImagelist !== undefined) fn = setEffectByImagelist;
			if(s.effectByFill !== undefined) fn = setEffectByFill;
			if(s.effectByToggleImage !== undefined) fn = setEffectByToggleImage;
			if(s.effectByValue !== undefined) fn = setEffectByValue;
			if(s.effectByMouse !== undefined) fn = setEffectByMouse;
			if(s.effectBySwitch !== undefined) fn = setEffectBySwitch;
			if(s.effectByChart !== undefined) fn = setEffectByChart;
			if(s.effectByGauge !== undefined) fn = setEffectByGauge;

			if(typeof(s.font) != 'undefined') {
				if(typeof(s.font.fontFamily) != 'undefined') fn = setFontFamily;
				if(typeof(s.font.fontSize) != 'undefined') fn = setFontSize;
				if(typeof(s.font.fontStyle) != 'undefined') fn = setFontStyle;
				if(typeof(s.font.textAlignHorz) != 'undefined') fn = setFontHorz;
				if(typeof(s.font.textAlignVert) != 'undefined') fn = setFontVert;
				if(typeof(s.font.color) != 'undefined') fn = setFontTextColor;
			}

			if(s.fill !== undefined) {
				if(s.fill.color !== undefined) fn = setFillColor;
				if(s.fill.image !== undefined) fn = setFillImage;
				if(s.fill.text !== undefined) fn = setFillText;
			}

			if(s.line !== undefined) fn = setLine;

			if(s.bottom !== undefined) fn = setBottom;
			if(s.center !== undefined) fn = setCenter;
			if(s.middle !== undefined) fn = setMiddle;
			if(s.x !== undefined) fn = setX;
			if(s.right !== undefined) fn = setRight;
			if(s.y !== undefined) fn = setY;
			if(s.cx !== undefined) fn = setWidth;
			if(s.cy !== undefined) fn = setHeight;
			if(s.rotate !== undefined) fn = setRotate;
			if(s.visible !== undefined) fn = setShow;
			if(s.name !== undefined) fn = setName;
			if(s.round !== undefined) fn = setRound;
			if(s.flipHorz !== undefined) fn = setFlipHorz;
			if(s.flipVert !== undefined) fn = setFlipVert;

			if(fn != null) {
				let shapes = workspace_self.shapeManager.getShapeList().shapes, arr = new Array();
				for(let i = 0; i < shapes.length; i++) {
					let shape = shapes[i];
					if(shape.bSel == false) continue;
					arr.push(shape.clone());
					fn(shape, s);
					shape.bDraw = true;
					shape.modified = true;
				}

				if(workspace_self.edit == true) {
					if(arr.length > 0) {
						workspace_self.undo.unshift({action:'update', data:arr});
						workspace_self.onChange('undo', workspace_self.undo);
					}
					workspace_self.refresh();
				}
			}
		}

		this.selectedShapes = function() {
			let shapes = new Array();

			let shapeList = workspace_self.shapeManager.getShapeList();
			let cnt = shapeList.shapes.length;
			for(let i = 0; i < cnt; i++) {
				let shape = shapeList.shapes[i];
				if(shape.bSel == false) continue;
				shape.index = i;
				shapes.push(shape);
			}

			return shapes;
		}

		this.appendShapes = function(srcShapes) {
			workspace_self.shapeManager.getShapeList().unselectShapes();
			let shapes = workspace_self.shapeManager.getShapeList().shapes;

			let arr = [];
			for(let shape of srcShapes) {
				let obj = (new Shape).attach(shape);
				obj.id = uuidv4();
				shapes.push(obj);
				arr.push(obj.clone());
			}
			workspace_self.undo.unshift({action:'insert', data:arr});
			workspace_self.onChange('undo', workspace_self.undo);

			workspace_self.refresh();
		}

		this.insertShapes = function(pos, srcShapes) {
			workspace_self.shapeManager.getShapeList().unselectShapes();
			let shapes = workspace_self.shapeManager.getShapeList().shapes;
			for(let shape of srcShapes) {
				let obj = (new Shape).attach(shape);
				shapes.splice(pos, 0, obj);
			}
			//workspace_self.undo.unshift({action:'add', data:srcShapes});
			workspace_self.refresh();
		}

		this.makeLayoutXml = function() {
			return workspace_self.shapeManager.makeLayoutXml();
		}

		/// functions
		function CanvasManager() {
			let self = this;
			this.convas = null;
			this.bgCanvas = null;

			this.create = function(item, workspace) {
				self.canvas = item;
				self.canvas.style.position = 'absolute';
				self.canvas.style.zIndex = 1;
				self.context = self.canvas.getContext("2d");
				self.context.imageSmoothingEnable = true;
				self.canvas.onclick = function(e) { workspace.onClick(e) };
				self.canvas.ondblclick = function(e) { workspace.onDblClick(e) };
				self.canvas.onmousemove = function(e) { workspace.onMouseMove(e) };
				self.canvas.onmousedown = function(e) { workspace.onMouseDown(e) };
				self.canvas.onmouseup = function(e) { workspace.onMouseUp(e) };
				self.createBackCanvas();
			}

			this.createBackCanvas = function() {
				self.bgCanvas = document.createElement('canvas');
				self.bgCanvas.id = self.canvas.id + "_back";
				self.bgCanvas.width = self.canvas.width;
				self.bgCanvas.height = self.canvas.height;

				self.bgCanvas.style.position = 'absolute';
				self.bgCanvas.style.zIndex= 0;

				$("#" + self.canvas.id).after(self.bgCanvas);
			}

			this.getBackCanvas = function() {
				return self.bgCanvas;
			}

			this.getCanvas = function() {
				return self.canvas;
			}

			this.getCursor = function() {
				return self.canvas.style.cursor; 
			}

			this.onSize = function() {
				//console.log("onSize");
				let width = self.canvas.offsetWidth;//window.innerWidth;	// self.canvas.offsetWidth;
				let height = self.canvas.offsetHeight;

				if (typeof(workspace_self.baseRatio) != 'undefined') {
					let root = workspace_self.getRoot();
					let parent = self.canvas.parentElement;
					if (workspace_self.baseRatio == 'width') {
						let ratio = Math.round(root.height / root.width * 100) / 100;
						height = Math.round(ratio * width);
						if (height >= Math.round(parent.offsetHeight)) {
							height = Math.round(parent.offsetHeight);
							width = Math.round((root.width / root.height) * width * 100) / 100;
							self.canvas.style.width = width + "px";
						} else {
							self.canvas.style.width = "100%";
						}
					} else if (workspace_self.baseRatio == 'mobile') {
						let ratio = Math.round(parent.offsetWidth / root.width * 100) / 100;
						self.canvas.style.width = parent.offsetWidth + "px";
						self.canvas.style.height = (root.height * ratio) + "px";
					} else {
						let ratio = Math.round(root.width / root.height * 100) / 100;
						width = Math.round(ratio * height);
						if (width >= Math.round(parent.offsetWidth)) {
							width = Math.round(parent.offsetWidth);
							height = Math.round((root.height / root.width) * width * 100) / 100;
							self.canvas.style.height = height + "px";
						} else {
							self.canvas.style.height = "100%";
						}
					}
				}

				if(workspace_self.edit == true) {
					let root = workspace_self.getRoot();
					width = root.width;
					height = root.height;
				}

				self.canvas.width = width;
				self.canvas.height = height;
				if (typeof(workspace_self.baseRatio) != 'undefined') {
					setTimeout(() => {
						if ((Number(self.canvas.offsetHeight) - Number(self.canvas.getAttribute("height"))) >= 10) {
							$("#bizCanvas").bizRender("onSize");
						}
					}, 50);
				}
				if(typeof(self.bgCanvas) != 'undefined') {
					self.bgCanvas.width = self.bgCanvas.clientWidth = width;
					self.bgCanvas.height = self.bgCanvas.clientHeight = height;
				}

				if(workspace_self.edit == true) {
					workspace_self.refresh();
				}
			}

			this.setCursor = function(cursor) {
				self.canvas.style.cursor = cursor; 
			}
		}

		let Common = {
			getFillStyle : function(context, color, left, top, width, height) {
				let fillStyle;
				if(color.type === undefined) {
					fillStyle = color;
				}
				else {
					let r1 = width / 2, r2 = height / 2;
					let x1 = left + r1 - Math.cos((color.degree * Math.PI) / 180) * r1;
					let y1 = top + r2 - Math.sin((color.degree * Math.PI) / 180) * r2;
					let x2 = left + r1 + Math.cos((color.degree * Math.PI) / 180) * r1;
					let y2 = top + r2 + Math.sin((color.degree * Math.PI) / 180) * r2;

					fillStyle = color.type == 'linear-gradient' 
						? context.createLinearGradient(x1, y1, x2, y2) 
						: context.createRadialGradient(left + r1, top + r2, Math.max(r1, r2) * color.pos, left + r1, top + r2, Math.max(r1, r2));
					fillStyle.addColorStop(0, color.color);
					fillStyle.addColorStop(color.pos, color.gradientColor);
				}

				return fillStyle;
			},
			getAlpha : function(strRgb) {
				let rgb = strRgb.replace(/[^%,.\d]/g, "").split(",");
				return Number(rgb[3]) * 255;
			},
			getRGBA : function(rrggbb, opacity) {
				let A = opacity;
				let R = rrggbb & 255;
				let G = rrggbb >> 8 & 255;
				let B = rrggbb >> 16 & 255;

				let colhexa = "rgba(" + R.toString() + "," + G.toString() + "," + B.toString() + "," + A.toString() + ")";

				return colhexa;
			},
			rgbToHex : function(strRgb) {
				let rgb = strRgb.replace( /[^%,.\d]/g, "" ).split( "," ); 
				let val = 0;
				for(let i = 2; i >= 0; i--) {
					if(val > 0) val *=256;
					val += parseInt(rgb[i]); 
				}

				return val.toString(); 
			}, 
			setFormatString : function(shape) {
				if(shape.effectByValue !== undefined) {
					if(shape.effectByValue.tagName !== undefined) {
						let len = shape.effectByValue.length == 0 ? 12 : shape.effectByValue.length;
						shape.fill.text = '';
						while(len-- > 0) {
							shape.fill.text += '#';
						}

						if(shape.effectByValue.decPos > 0) shape.fill.text += '.';
						let dec = shape.effectByValue.decPos;
						while(dec-- > 0) shape.fill.text += '#';
					}
				}
			}
		}


		function RenderManager() {
			let self = this;
			this.zoomRate = 1;				// edit mode에서만 사용
			bRefreshBack = true;

			let calcZoomRate = function(canvas, shapeList) {
				let width = canvas.offsetWidth;
				let height = canvas.offsetHeight;

				let zoomRatioX = width / shapeList.width;
				let zoomRatioY = height / shapeList.height;

				if(workspace_self.edit == false) {
					self.zoomRate = Math.min(zoomRatioX, zoomRatioY);
					return self.zoomRate;
				}
				else
					return 1; //self.zoomRate;
			}

			let checkCollision = function(shapeList, shape) {
				let rc1 = shape.calcBoundary(true);
				let len = shapeList.shapes.length;
				for(let i = 0; i < len; i++) {
					let obj = shapeList.shapes[i];
					if(obj.bDraw == true) continue;

					let rc2 = obj.calcBoundary(true);
					if ((rc1.x <= rc2.right && rc1.right >= rc2.x) &&
						(rc1.y <= rc2.bottom && rc1.bottom >= rc2.y )) { 
						obj.bDraw = true;
						checkCollision(shapeList, obj);
					}
				}
			}

			let testRedraw = function(shapeList) {
				let len = shapeList.shapes.length;
				for(let i = 0; i < len; i++) {
					let shape = shapeList.shapes[i];
					if(typeof(shape.fill.image) != 'undefined' && shape.fill.bGIF == true) {
						shape.bDraw = true;
					}

					if(shape.bDraw == false) continue;

					checkCollision(shapeList, shape);
				}
			}

			let checkRedrawShape = function(shapes, shape) {
				let len = shapes.length;
				for(let i = 0; i < len; i++) {
					let obj = shapes[i];
					if(obj.bDraw == true) continue;

					if ((shape.left <= obj.left + obj.width && shape.left + shape.width >= obj.left) &&
						(shape.top <= obj.top + obj.height && shape.top + shape.height >= obj.top )) { 
						obj.bDraw = true;
						checkRedrawShape(shapes, obj);
					}
				}
			}

			let clearBackground = function(canvas, shapeList, zoom) {
				console.log("clear all");
				let context = canvas.getContext("2d");
				context.clearRect(0, 0, shapeList.width * zoom, shapeList.height * zoom);
			}

			let clearSelector = function(canvas, shapes, drag) {
				let rect = recalcSelect(drag);

				let context = canvas.getContext("2d");
				context.clearRect(rect.x, rect.y, rect.cx, rect.cy);

				let right = rect.x + rect.cx;
				let bottom = rect.y + rect.cy;
				for(let shape of shapes) {
					if(shape.bDraw == true) continue;
					if (((shape.left <= right && shape.left + shape.width >= right) || 
						(shape.left <= rect.x && shape.left + shape.width >= rect.x) ||
						(shape.left >= rect.x && shape.left + shape.width <= right)) &&
						((shape.top <= bottom && shape.top + shape.height >= bottom) || 
						(shape.top <= rect.y && shape.top + shape.height >= rect.y) ||
						(shape.top >= rect.y && shape.top + shape.height <= bottom))) {
						shape.bDraw = true;
						checkRedrawShape(shapes, shape);
					}
				}
			}

			let clearShapeBackground = function(canvas, shapeList) {
				let context = canvas.getContext("2d");

				//context.fillStyle = shapeList.backColor;
//				shapeList.shapes.map(e=>{e.bDraw = true; return e})
//				console.log(shapeList.shapes.filter(e=>!e.bDraw))
				for(let shape of shapeList.shapes) {
					if(shape.bDraw == false) continue;
					if(shape.clearRect === undefined) continue;
					context.clearRect(shape.clearRect.left, shape.clearRect.top, shape.clearRect.width, shape.clearRect.height);
				}
			}

			let drawBack = function(backCanvas, shapeManager) {
				console.log("drawBack");

				let shapeList = shapeManager.getShapeList();
				let zoomRatio = calcZoomRate(backCanvas, shapeList);
				let context = backCanvas.getContext("2d");

				let width = shapeList.width * zoomRatio;
				let height = shapeList.height * zoomRatio;

				context.clearRect(0, 0, width, height);

				if(typeof(shapeList.backImage) != 'undefined') {
					context.drawImage(shapeList.backImage, 0, 0, width, height);
				}
				else {
					context.fillStyle = Common.getFillStyle(context, shapeList.backColor, 0, 0, width, height);
					context.fillRect(0, 0, width, height);
				}

				bRefreshBack = false;
			}

			let drawSelector = function(canvas, drag, zoomRatio) {
				let context = canvas.getContext("2d");

				let rect = recalcSelect(drag, zoomRatio);
				context.lineWidth = 1;
				context.fillStyle = "rgba(200,200,200,0.3)";
				context.fillRect(rect.x, rect.y, rect.cx, rect.cy);
			}

			let	drawSelectedShapes = function(canvas, shapeList, zoomRatio) {
				let context = canvas.getContext("2d");

				for(let shape of shapeList.shapes) {
					if(shape.visible == false && workspace_self.showAll == false) continue;
					if(shape.bSel == false) continue;
					if(shape.bDraw == false) continue;

					shape.left = zoomRatio * shape.x;
					shape.top = zoomRatio * shape.y;
					shape.width = zoomRatio * shape.cx;
					shape.height = zoomRatio * shape.cy;

					shape.drawSelected(context);
				}
			}

			let drawShape = function(context, shape, zoomRatio) {
				shape.recalcRect(zoomRatio);

				let centerX = shape.left + shape.width * 0.5;
				let centerY = shape.top + shape.height * 0.5;

				if(shape.type != 'group') {
					if(shape.rotate > 0) {
						context.translate(centerX, centerY);
						context.rotate(shape.rotate * Math.PI / 180);

						shape.left = -0.5 * shape.width; 
						shape.top = -0.5 * shape.height; 
					}

					if(shape.flipHorz == 1) {
						context.translate(shape.left - shape.width, 0);
						context.scale(-1, 1);
						shape.left = -2 * shape.width; 
					}

					if(shape.flipVert == 1) {
						context.translate(0, shape.top, 0);
						context.scale(1, -1);
						shape.top = -shape.height; 
					}
				}

				if(typeof(shape.fill) != 'undefined') {
					if(shape.type != "line") {
						let fontStyle = "";
						switch(shape.font.fontStyle) {
						case 1 : fontStyle = 'bold'; break;
						case 2 : fontStyle = 'italic'; break;
						case 3 : fontStyle = 'bold italic'; break;
						}
						context.font = fontStyle + " " + (shape.font.fontSize * zoomRatio).toString() + "px " + shape.font.fontFamily;
						shape.fillShape(context);
						shape.fillImage(context);
						shape.fillText(context);
					}
				}

				if(shape.effectByFill !== undefined) {
					shape.left = zoomRatio * shape.effectByFill.rect.x;
					shape.top = zoomRatio * shape.effectByFill.rect.y;
					shape.width = zoomRatio * shape.effectByFill.rect.cx;
					shape.height = zoomRatio * shape.effectByFill.rect.cy;
				}

				shape.draw(context);
				// 회전이 등록된 경우 좌표값을 원래 좌표로 재 지정
				if(shape.rotate > 0) shape.recalcRect(zoomRatio);

				if(shape.effectByChart !== undefined) shape.drawChart(context);
				if(shape.effectByGauge !== undefined) shape.drawGauge(context);
			}

			let drawGroup = function(context, shape, zoomRatio ) {
				shape.recalcRect(zoomRatio);
				for(let obj of shape.children) {
					if(obj.type == 'group') drawGroup(context, obj, zoomRatio); 

					drawShape(context, obj, zoomRatio);
				}
			}

			let	drawShapes = function(canvas, shapeList, zoomRatio) {
				let nDraw = 0;
				let context = canvas.getContext("2d");
				for(let shape of shapeList.shapes) {
					if(shape.bDraw == false) continue;
					let bVisible = (workspace_self.edit == false && shape.visible == true) ||
						(workspace_self.edit == true && (workspace_self.showAll == true || shape.visible == true));
					//if(workspace_self.edit == false && shape.visible == false) continue;
					//if(workspace_self.edit == true && workspace_self.showAll == false && shape.visible == false) continue;

					if(bVisible == true) {
						context.save();

						if(shape.type == 'group') drawGroup(context, shape, zoomRatio );
						drawShape(context, shape, zoomRatio);

						context.restore();
					}

					shape.recalcClearRect(zoomRatio);

					nDraw++;
				}

			}

			let testEffects = function(shapeList, tagValues) {
				if(workspace_self.edit == false) { 
					for(let shape of shapeList.shapes) {
//						if(shape.bDraw == false) continue;
						testEffectByBlink(tagValues, shape);
						testEffectBySwitch(tagValues, shape);
						testEffectByColorlist(tagValues, shape);
						testEffectByImagelist(tagValues, shape);
						testEffectByFill(tagValues, shape);
						testEffectByChart(tagValues, shape);
					}
				}
			}

			let testEffectByBlink = function(tagValues, shape) {
				if(shape.effectByBlink != undefined) {
					shape.effectByBlink.enable = false;
					if(shape.effectByBlink.tagName != '') {
						let tag = tagValues[shape.effectByBlink.tagName];
						if(typeof(tag) != 'undefined' && typeof(tag.val) != 'undefined') {
							var val = tag.val;
							let oper = shape.effectByBlink.oper.trim();
							if( ( ( oper == "=" ) &&	( val == shape.effectByBlink.operValue ) ) ||
								( ( oper == "<>" ) &&	( val != shape.effectByBlink.operValue ) ) ||
								( ( oper == ">" ) &&	( val > shape.effectByBlink.operValue ) ) ||
								( ( oper == "<" ) &&	( val < shape.effectByBlink.operValue ) ) ||
								( ( oper == ">=" ) &&	( val >= shape.effectByBlink.operValue ) ) ||
								( ( oper == "<=" ) &&	( val <= shape.effectByBlink.operValue ) ) ) 	{
								shape.effectByBlink.enable = true;
							}
						}
					}
					else
						shape.effectByBlink.enable = true;

					if(shape.effectByBlink.enable == true) {
						let visible = shape.visible;
						shape.visible = (new Date()).getMilliseconds() >= 500;
						if(visible != shape.visible) shape.bDraw = true;
					}
				}
			}

			let testEffectByColorlist = function(tagValues, shape) {
				if(shape.effectByColorlist !== undefined) {
					var effectColor = shape.effectByColorlist.orgColor;
					let tag = tagValues[shape.effectByColorlist.tagName];

					if(typeof(tag) != 'undefined' && typeof(tag.val) != 'undefined') {
						var val = tag.val;
						for(var i = 0; i < shape.effectByColorlist.colorList.length; i++) {
							var item = shape.effectByColorlist.colorList[i];
							let operSymbol = item.operSymbol.trim();
							if( ( ( operSymbol == "=" ) &&	( val == item.operValue ) ) ||
								( ( operSymbol == "<>" ) &&	( val != item.operValue ) ) ||
								( ( operSymbol == ">" ) &&	( val > item.operValue ) ) ||
								( ( operSymbol == "<" ) &&	( val < item.operValue ) ) ||
								( ( operSymbol == ">=" ) &&	( val >= item.operValue ) ) ||
								( ( operSymbol == "<=" ) &&	( val <= item.operValue ) ) ) 	{
								effectColor = item.color;
								break;
							}
						}
					}

					switch(shape.effectByColorlist.category) {
						case 0 :
							if(effectColor != shape.fill.color) shape.bDraw = true;
							shape.fill.color = effectColor; 
							break;
						case 1 : 
							if(effectColor != shape.line.color) shape.bDraw = true;
							shape.line.color = effectColor; 
							break;
						case 2 : 
							if(effectColor != shape.font.color) shape.bDraw = true;
							shape.font.color = effectColor;
							break;
					}
				}
			}

			let testEffectByImagelist = function(tagValues, shape) {
				if(shape.effectByImagelist !== undefined) {
					var img = shape.effectByImagelist.orgImage;
					let tag = tagValues[shape.effectByImagelist.tagName];

					if(typeof(tag) != 'undefined') {
						var val = tag.val;
						for(var i = 0; i < shape.effectByImagelist.imageList.length; i++) {
							var imageItem = shape.effectByImagelist.imageList[i];
							let operSymbol = imageItem.operSymbol.trim();
							if( ( ( operSymbol == "=" ) &&	( val == imageItem.operValue ) ) ||
								( ( operSymbol == "<>" ) &&	( val != imageItem.operValue ) ) ||
								( ( operSymbol == ">" )	 &&	( val > imageItem.operValue ) ) ||
								( ( operSymbol == "<" )	 &&	( val < imageItem.operValue ) ) ||
								( ( operSymbol == ">=" ) &&	( val >= imageItem.operValue ) ) ||
								( ( operSymbol == "<=" ) &&	( val <= imageItem.operValue ) ) ) 	{
								img = imageItem.image;
								break;
							}
						}
					}

					if(img != shape.fill.image) shape.bDraw = true;
					shape.fill.image = img;
				}
			}

			let testEffectByFill = function(tagValues, shape) {
				if(shape.effectByFill !== undefined) {
					let tag = tagValues[shape.effectByFill.tagName];
					if(tag !== undefined) {
						var ratio = (Number(tag.val) - shape.effectByFill.min) / (shape.effectByFill.max - shape.effectByFill.min);
						ratio = Math.max(ratio, 0);
						ratio = Math.min(ratio, 1);

						if(shape.effectByFill.ratio != ratio) {
							shape.effectByFill.ratio = ratio;
							shape.bDraw = true;
							shape.x = shape.effectByFill.rect.x;
							shape.y = shape.effectByFill.rect.y;
							shape.cx = shape.effectByFill.rect.cx;
							shape.cy = shape.effectByFill.rect.cy;

							switch(shape.effectByFill.direction) {
								case 0 : 
									shape.x = (shape.effectByFill.rect.x + shape.effectByFill.rect.cx);
									shape.cx = ratio * shape.effectByFill.rect.cx;
									shape.x -= shape.cx;
									break;
								case 1 : 
									shape.cx = ratio * shape.effectByFill.rect.cx;
									break;
								case 2 : 
									shape.y = (shape.effectByFill.rect.y + shape.effectByFill.rect.cy);
									shape.cy = ratio * shape.effectByFill.rect.cy;
									shape.y -= shape.cy;
									break;
								case 3 :
									shape.cy = ratio * shape.effectByFill.rect.cy;
									break;
							}
						}
					}
				}
			}

			let testEffectByChart = function(tagValues, shape) {
				if(shape.effectByChart !== undefined) {
					for(let option of shape.effectByChart.options) {
						if(option.val === undefined) option.val = '';
						let tagVal = tagValues[option.tag];
						if(tagVal === undefined) continue;
						let val = tagVal.val;
						if(val != option.val) {
							option.val = val;
							shape.bDraw = true;
							break;
						}
					}
				}
			}

			let testEffectBySwitch = function(tagValues, shape) {
				let changeState = function(nVal) {
					nVal = Math.min(nVal, shape.effectBySwitch.states.length - 1);
					shape.fill.image.onload = function() { shape.bDraw = true; workspace_self.refresh(); };
					let srcPath = getContextPath() + workspace_self.rootPath + "/images/" + shape.effectBySwitch.states[nVal] + ".png";
					let src = srcPath;
					shape.fill.image = new Image();
					shape.fill.image.onload = function() { shape.bDraw = true };
					shape.fill.image.src = src;

					shape.effectBySwitch.val = nVal;
					shape.visible = true;
					delete shape.effectByBlink;
				}

				if(shape.effectBySwitch !== undefined) {
					if(shape.effectBySwitch.status == '') {
						changeState(shape.effectBySwitch.controlVal);
					}
					else {
						let tag = tagValues[shape.effectBySwitch.status];
						if(tag !== undefined) {
							let nVal = parseInt(tag.val);
							if(nVal != shape.effectBySwitch.val && nVal !== undefined ) changeState(nVal);
						}
					}
				}
			}

			let recalcSelect = function(drag, zoomRatio) {
				let zoom = typeof(zoomRatio) == 'undefined' ? 1 : zoomRatio;
				let x = zoom * drag.left;
				let y = zoom * drag.top;
				let cx = zoom * drag.cx;
				let cy = zoom * drag.cy;

				if(cx < 0) { x += cx; cx = Math.abs(cx); }
				if(cy < 0) { y += cy; cy = Math.abs(cy); }

				return { x:x, y:y, cx:cx, cy:cy }
			}

			return {
				checkRedrawShape : function(shapes, shape) {
					checkRedrawShape(shapes, shape);
				},
				clearSelector : function(canvas, shapes, drag) {
					clearSelector(canvas, shapes, drag);
				},
				draw : function(canvas, shapeManager, drag) {
					let shapeList = shapeManager.getShapeList();
					let tagValues = shapeManager.getTagValues();
					let zoomRatio = calcZoomRate(canvas, shapeList);

					testEffects(shapeList, tagValues);
					testRedraw(shapeList);

					if(shapeList.isRedrawAll() == true) {
						clearBackground(canvas, shapeList, zoomRatio);
					}
					else {
						clearShapeBackground(canvas, shapeList);
					}

					drawShapes(canvas, shapeList, zoomRatio);
					if(workspace_self.edit == true) drawSelectedShapes(canvas, shapeList, zoomRatio);
					if(workspace_self.drag.mode == 'select') drawSelector(canvas, workspace_self.drag, zoomRatio);
					shapeList.setRedraw(false);
				},
				drawBack : function(backCanvas, shapeList) {
					if(bRefreshBack == true) {
						drawBack(backCanvas, shapeList);
					}
				},
				setRefreshBack : function(bFlag) {
					bRefreshBack = bFlag;
				},
				getZoomRate : function() {
					return self.zoomRate;
				}
			}
		}

		function ScriptManager() {
			let jsScript = "";
			let tagValues = {};
			let newValues = new Array();

			let getVal = function (tagName) {
				let val = {};
				let tag = tagValues[tagName];
				if(typeof(tag) != 'undefined'){ 
					val = tag.val;
				}
				else {
					workspace_self.shapeManager.addTag(tagName);
				}

				return val;
			}

			let init = function(script) {
				jsScript = script;
			}

			let run = function(values) {
				if(values !== undefined) tagValues = values;
				if(jsScript.length > 0) {
					eval(jsScript);
				}

				return newValues;
			}

			let setAttr = function(shapeName, field, value) {
				switch(field) {
					case "SHOW" : setAttrShow(shapeName, value); break;
					case "FILLCOLOR" : setAttrFillColor(shapeName, value); break;
					case "FILLTEXT" : setAttrFillText(shapeName, value); break;
					case "ROTATE" : setAttrRotate(shapeName, value); break;
				}
				return 0;
			} 

			let setAttrFillColor = function(shapeName, value ) {
				let shapeNames = workspace_self.shapeManager.getShapeList().shapeNames;
				let shape = shapeNames[shapeName];
				if(typeof(shape) != 'undefined') {
					let fillRGB = parseInt(value.substring(1), 16);
					let fillColor = Common.getRGBA(fillRGB, 1.0);
					if(fillColor != shape.fill.color ) shape.bDraw = true;
					shape.fill.color = fillColor;
				}
			}

			let setAttrFillText = function (shapeName, value ) {
				let shapeNames = workspace_self.shapeManager.getShapeList().shapeNames;
				let shape = shapeNames[shapeName];
				if(typeof(shape) != 'undefined') {
					if(shape.fill.text != value) shape.bDraw = true;
					shape.fill.text = value;
				}
			}

			let setAttrRotate = function(shapeName, value ) {
				let shapeNames = workspace_self.shapeManager.getShapeList().shapeNames;
				let shape = shapeNames[shapeName];
				if(typeof(shape) != 'undefined') {
					if(shape.rotate != value) shape.bDraw = true;
					shape.rotate = value;
					shape.rotateRect();
				}
			}

			let setAttrShow = function(shapeName, value) {
				let shapeNames = workspace_self.shapeManager.getShapeList().shapeNames;
				let shape = shapeNames[shapeName];
				if(typeof(shape) != 'undefined') {
					let bShow = value == 0 ? false : true;
					if(shape.visible != bShow) shape.bDraw = true; 
					shape.visible = bShow;
				}
			}

			let setVal = function (tagName, value) {
				let tag = tagValues[tagName];
				if(tag === undefined) {
					tag = {};
					tag.name = tagName;
					tag.time = new Date();

					if(workspace_self.edit == true) {
						workspace_self.onTagChanged(tagName);
					}
				}

				tag.val = value;
				tagValues[tagName] = tag;
				newValues[tagName] = tag;
			}

			return {
				run : function(values) {
					return run(values);
				},
				init : function(script) {
					init(script);
				}
			}
		}

		function Shape() {
			let TextAlign = { Left : 0, Center : 1, Right : 2, Top:0, Middle:1, Bottom:2 };
			let LineStyles = {"solid" : 0, "dot" : 1, "dash" : 2, "dashdot" : 3, "dashdotdot" : 4 };

			let self = this;

			this.id = uuidv4();
			this.parent = '';				// group, ungroup에서 사용
			this.index = -1;				// undo, redo를 위한 임시용도 사용

			this.rect = {}
			this.children = [];
			this.round = {type:0, r:0};

			this.x = 0;
			this.y = 0;
			this.cx = 0;
			this.cy = 0;

			this.modified = false;		// 속성이 변경되면 true 
			this.visible = true;
			this.bOver = false;			// 자신 좌표위에 마우스가 올려져 있을 경우 true - rendering only
			this.bSel = false;
			this.name = "";
			this.type = "";
			this.sub = "";				// chart, gauge, switch를 그릴 경우 사용
			this.bDraw = true;

			this.left = 0;
			this.top = 0;
			this.width = 0;
			this.height = 0;

			this.flipVert = 0;
			this.flipHorz = 0;
			this.rotate = 0;

			this.clearRect = {};
			this.fill = { color : 'rgba(255,255,255,1)', text:'', bGIF:false };
			this.line = { color : 'rgba(0,0,0,1)', endCap:0, radius:0, startCap:0, style:0, width: 0};
			this.font = { 
				fontFamily:'Arial', 
				fontSize: 12, 
				fontStyle: 0, 
				textAlignHorz:1, 
				textAlignVert:1, 
				color: "rgba(0, 0, 0, 1)",
				textDirection:0
			};
			this.shadow = { color: 'rgba(0,0,0,1)', direction:1, offset:0 }

			let duplicate = function(src, bClone) {
				let dupEffectByColorlist = function() {
					let effectByColorlist = {}; 
					effectByColorlist.category = src.effectByColorlist.category;
					effectByColorlist.tagName = src.effectByColorlist.tagName;
					effectByColorlist.colorList = new Array();
					for(let item of src.effectByColorlist.colorList) {
						let obj = {};
						obj.operValue = item.operValue;
						obj.operSymbol = item.operSymbol;
						obj.color = item.color;
						effectByColorlist.colorList.push(obj);
					}

					return effectByColorlist;
				}

				let dupEffectByChart = function() {
					let effectByChart = Object.assign({}, src.effectByChart); 
					effectByChart.options = [];
					for(let option of src.effectByChart.options) {
						let item = Object.assign({}, option);
						item.color = Object.assign({}, option.color);
						item.val = [];
						for(let val of option.val) item.val.push(val);
						effectByChart.options.push(item);
					}

					return effectByChart;
				}

				let dupEffectByGauge = function() {
					let effectByGauge = Object.assign({}, src.effectByGauge); 
					effectByGauge.color = Object.assign({}, src.effectByGauge.color);

					return effectByGauge;
				}

				let dupEffectByToggleImage = function() {
					let effectByToggleImage = Object.assign({}, src.effectByToggleImage); 
					effectByToggleImage.states = [];
					for(let state of src.effectByToggleImage.states) 
						effectByToggleImage.states.push(Object.assign({}, state));

					return effectByToggleImage;
				}

				let dupEffectByImagelist = function() {
					let effectByImagelist = {}; 
					effectByImagelist.tagName = src.effectByImagelist.tagName;
					effectByImagelist.imageList = new Array();
					for(let item of src.effectByImagelist.imageList) {
						let obj = {};
						obj.operValue = item.operValue;
						obj.operSymbol = item.operSymbol;
						obj.image = bClone == true ? {} : new Image();
						obj.image.src = item.image.src;
						effectByImagelist.imageList.push(obj);
					}

					return effectByImagelist;
				}

				let dupEffectBySwitch = function() {
					let effectBySwitch = Object.assign({}, src.effectBySwitch); 
					effectBySwitch.states = [];
					for(let item of src.effectBySwitch.states) effectBySwitch.states.push(item);

					return effectBySwitch;
				}


				let shape = new Shape();

				shape.type = src.type;
				shape.parent = src.parent;
				shape.id = src.id;
				shape.index = src.index;
				shape.visible = src.visible;
				shape.x = src.x;
				shape.y = src.y;
				shape.cx = src.cx;
				shape.cy = src.cy;
				shape.rotate = src.rotate;
				shape.link = src.link;
				shape.flipHorz = src.flipHorz;
				shape.flipVert = src.flipVert;
				shape.fill = Object.assign({}, src.fill);
				shape.font = Object.assign({}, src.font);
				shape.line = Object.assign({}, src.line);
				shape.round = Object.assign({}, src.round);
				shape.bDraw = true;
				shape.bSel = true;

				if(src.fill.image !== undefined) {
					shape.fill.image = bClone == true ? {} : new Image();
					shape.fill.image.src = src.fill.image.src;
				}

				if(src.effectByFill !== undefined) {
					shape.effectByFill = Object.assign({}, src.effectByFill);
					shape.effectByFill.rect = { x:shape.x, y:shape.y, cx:shape.cx, cy:shape.cy };
				}
				if(src.effectByColorlist !== undefined) shape.effectByColorlist = dupEffectByColorlist();
				if(src.effectByChart !== undefined) shape.effectByChart = dupEffectByChart();
				if(src.effectByFill !== undefined) shape.effectByFill = Object.assign({}, src.effectByFill);
				if(src.effectByGauge !== undefined) shape.effectByGauge = dupEffectByGauge();
				if(src.effectByImagelist !== undefined) shape.effectByImagelist = dupEffectByImagelist(); 
				if(src.effectBySwitch !== undefined) shape.effectBySwitch = dupEffectBySwitch(); 
				if(src.effectByToggleImage !== undefined) shape.effectByToggleImage = dupEffectByToggleImage(); 

				shape.children = new Array();
				for(let obj of src.children) {
					shape.children.push(bClone == true ? obj.clone() : (new Shape).attach(obj));
				}

				return shape;
			}

			this.clone = function() {
				return duplicate(this, true);
			}

			this.attach = function(src) {
				return duplicate(src, false);
			}

			let drawRectangle = function(context, bFill) {
				switch(self.round.type) {
				case 0:
					if(bFill == false)
						context.strokeRect( self.left, self.top, self.width, self.height);
					else 
						context.fillRect( self.left, self.top, self.width, self.height);
					break;
				case 1:
					context.drawRoundRect(self.left, self.top, self.width, self.height, self.round.round, self.line.width, bFill, 'full'); 
					break;
				case 2:
					context.drawRoundRect(self.left, self.top, self.width, self.height, self.round.round, self.line.width, bFill, 'upper'); 
					break;
				case 3:
					context.drawRoundRect(self.left, self.top, self.width, self.height, self.round.round, self.line.width, bFill, 'lower'); 
					break;
				}
			}

			let drawShape = function(context, bFill) {
				let drawLineAndCap = function(fromx, fromy, tox, toy) {
					let capSize = [8, 12, 16 ];
					let headlen = capSize[self.line.startSize], tailLen = capSize[self.line.endSize];

					let dx = tox - fromx;
					let dy = toy - fromy;
					let angle = Math.atan2(dy, dx);

					context.beginPath();
					context.moveTo(fromx, fromy);
					context.lineTo(tox, toy);

					if(self.line.endCap == 1 || self.line.endCap == 2) {
						context.moveTo(tox - tailLen * Math.cos(angle - Math.PI / 6), toy - tailLen * Math.sin(angle - Math.PI / 6));
						context.lineTo(tox, toy);
						context.lineTo(tox - tailLen * Math.cos(angle + Math.PI / 6), toy - tailLen * Math.sin(angle + Math.PI / 6));
						if(self.line.endCap == 1) context.lineTo(tox, toy);
					}

					if(self.line.startCap == 1 || self.line.startCap == 2) {
						angle = 2 * Math.PI - angle;
						context.moveTo(fromx + headlen * Math.cos(angle - Math.PI / 6), fromy - headlen * Math.sin(angle - Math.PI / 6));
						context.lineTo(fromx, fromy);
						context.lineTo(fromx + headlen * Math.cos(angle + Math.PI / 6), fromy - headlen * Math.sin(angle + Math.PI / 6));
						if(self.line.startCap == 1) context.lineTo(fromx, fromy);
					}

					context.stroke();
					if(self.line.startCap == 3) context.drawEllipse( fromx - headlen / 2 , fromy - headlen / 2, headlen, headlen, self.line.width, false);
					if(self.line.endCap == 3) context.drawEllipse( tox - tailLen / 2 , toy - tailLen / 2, tailLen, tailLen, self.line.width, false);

					if(self.line.startCap == 2 || self.line.endCap == 2 || self.line.endCap == 4) context.fill();
				}

				switch(self.type) {
					case "line" :
						switch(self.line.style) {
							case LineStyles.solid : break;
							case LineStyles.dot: context.setLineDash([1]); break;
							case LineStyles.dash : context.setLineDash([1, 2]); break;
							case LineStyles.dashdot: context.setLineDash([1, 2, 1]); break;
							case LineStyles.dashdotdot : context.setLineDash([1, 2, 1, 1]);break;
						}

						let x1 = self.left; 
						let y1 = self.line.dir == 1 ? self.top : self.top + self.height;
						let x2 = self.left + self.width;
						let y2 = self.line.dir == 1 ? self.top + self.height : self.top;

						drawLineAndCap(x1, y1, x2, y2);
						break;
					case "rectangle" : 
						drawRectangle(context, bFill);
						break;
					case "ellipse" : 
						context.drawEllipse( self.left, self.top, self.width, self.height, self.line.width, self.fill.image != null); 
						break;
					case "pentagon" : 
						context.drawPentagon( self.left, self.top, self.width, self.height, self.fill.image != null); 
						break;
					case "rhombus" : 
						context.drawRhombus( self.left, self.top, self.width, self.height, self.fill.image != null); 
						break;
					case "triangle" : 
						context.drawTriangle( self.left, self.top, self.width, self.height, self.fill.image != null, "full"); 
						break;
				}
			}

			this.draw = function(context) {
				context.beginPath();
				if(self.line.width > 0) {
					context.lineWidth = self.line.width;
					context.strokeStyle = Common.getFillStyle(context, self.line.color, self.left, self.top, self.width, self.height);
					context.fillStyle = Common.getFillStyle(context, self.fill.color, self.left, self.top, self.width, self.height);

					drawShape(context, false);
				}
				context.closePath();

				if(workspace_self.edit == false && self.bSel == true) {
					context.drawImage(workspace_self.images.check, self.left, self.top, 24, 24);
				}
			}

			this.drawChart = function(context) {
				let width = self.width, height = self.height;
				let left = self.left, top = self.top, right = self.left + self.width, bottom = self.top + self.height;
				let gapX = 0, nSeries = self.effectByChart.options.length;
				let minVal = 0, maxVal = 100, nSections = 1;

				let recalcPlotArea = function() {
					let offset = 0;
					if(self.effectByChart.labelY.length > 0) {
						let labels = self.effectByChart.labelY.split(",");
						minVal = Number.MAX_VALUE; maxVal = Number.MIN_VALUE;
						for(let label of labels) {
							offset = Math.max(offset, context.measureText(label + self.effectByChart.unit).width + 10);
							minVal = Math.min(minVal, Number(label));
							maxVal = Math.max(maxVal, Number(label));
						}
						left += offset; 
						width -= offset;
					}

					bottom -= 2.5 * context.measureText("#").width;
					height -= 2.5 * context.measureText("#").width;

					nSeries = 0;
					for(let option of self.effectByChart.options) {
						if(option.type != "1") continue;
						nSeries++;
					}
				}

				let drawAxisX = function() {
					let labels = [];
					switch(self.effectByChart.axisX) {
					case 'hour' :
						nSections = 24;
						for(let i = 0; i < 24; i++) labels.push(i);
						break;
					case 'day' :
						let now = new Date();
						let latestDay = new Date(now.getYear(), now.getMonth() + 1, 0).getDate();
						nSections = latestDay;
						for(let i = 0; i < latestDay; i++) labels.push(i + 1);
						break;
					case 'month' :
						nSections = 12;
						for(let i = 0; i < 12; i++) labels.push(i + 1);
						break;
					case 'user' :
						labels = self.effectByChart.labelX.split(",");
						nSections = labels.length;
						break;
					}
					gapX = (width - ((labels.length - 1) * 10)) / labels.length; 

					context.fillStyle = Common.getFillStyle(context, self.font.color, self.left, self.top, self.width, self.height); 
					let x = left, y = top + height + 2.0 * context.measureText("#").width;
					for(let i = 0; i < labels.length; i++) {
						let offset = (gapX - context.measureText(labels[i]).width) / 2; 
						context.fillText(labels[i], x + offset, y);
						x += gapX + 10;
					}
				}

				let drawAxisY = function() {
					context.fillStyle = Common.getFillStyle(context, self.font.color, self.left, self.top, self.width, self.height); 

					let labels = self.effectByChart.labelY.split(",");
					let gap = (height - 5) / (labels.length - 1);
					let y = top + context.measureText("#").width;;
					for(let i = labels.length - 1; i >= 0; i--) {
						if(i != labels.length - 1) {
							let label = labels[i] + self.effectByChart.unit;
							let x = left - context.measureText(label).width - 8;
							context.fillText(label, x, y);
						}

						y += gap;
					}
				}

				let drawAxisXY = function() {
					context.strokeStyle = "rgb(0,0,0)";
					context.moveTo(left - 5, bottom);
					context.lineTo(right, bottom);
					context.moveTo(left - 5, top + 10);
					context.lineTo(left - 5, bottom );
					context.stroke();
				}

				let getValues = function(option) {
					let values = new Array();
					if(workspace_self.edit == true) {
						if(option.val !== undefined) 
							values = option.val;
						else { 
							for(let i = 0; i < nSections; i++) values.push(Math.random() * 0.9 * (maxVal - minVal) + minVal);
							option.val = values;
						}
					}
					else {
						let tagVal = tagValues[option.tag];
						if(tagVal !== undefined) {
							let tokens = tagVal.val.split(',');
							for(let val of tokens) values.push(Number(val));
						}
					}

					values.splice(nSections,values.length);
					return values;
				}

				let drawBarChart = function(option, index) {
					let values = getValues(option);
					let x = left;
					for(let val of values) {
						if(val > minVal) {
							let h = Math.min(((val - minVal) / (maxVal - minVal)) * (bottom - top), bottom - top);
							let y = Math.max((bottom - h), top);

							let gap = gapX / nSeries;
							context.fillStyle = Common.getFillStyle(context, option.color, x + index * gap, top, gap, h);
							context.fillRect( x + index * gap, y, gap, h );

							if(option.displayValue == true) {
								let offset = (gap - context.measureText(val.toFixed(1)).width) / 2; 
								context.fillText(val.toFixed(1), x + index * gap + offset, y);
							}
						}
						x += gapX + 10;
					}
				}

				let drawLineChart = function(option) {
					let values = getValues(option);

					context.strokeStyle = Common.getFillStyle(context, option.color, self.left, self.top, self.width, self.height);
					context.fillStyle = Common.getFillStyle(context, option.color, self.left, self.top, self.width, self.height);

					context.beginPath();
					let x = left;
					for(let val of values) {
						let h = ((val - minVal) / (maxVal - minVal)) * (bottom - top);
						let y = Math.max(bottom - h, top);

						if(x == left) 
							context.moveTo(x + gapX / 2, y);
						else
							context.lineTo(x + gapX / 2, y);
						x += gapX + 10;
					}
					context.stroke();

					x = left;
					for(let val of values) {
						if(val > minVal) {
							let h = ((val - minVal) / (maxVal - minVal)) * (bottom - top);
							let y = Math.max(bottom - h, top);
							let offset = (gapX - context.measureText(val.toFixed(1)).width) / 2; 
							context.drawEllipse(x + gapX / 2 - 4, y - 4, 8, 8, true);
							if(option.displayValue == true) 
								context.fillText(val.toFixed(1), x + offset, y - 10);
						}
						x += gapX + 10;
					}
					context.stroke();
				}

				let drawStepChart = function(option) {
					let values = getValues(option);

					context.strokeStyle = option.color;
					context.fillStyle = option.color;

					let x = left, prevY = 0;
					for(let val of values) {
						let h = ((val - minVal) / (maxVal - minVal)) * (bottom - top);
						let y = (bottom - h);

						if(x == left) 
							context.moveTo(x, y);
						else {
							context.lineTo(x, prevY);
							context.lineTo(x, y);
						}

						prevY = y;

						x += gapX + 10;
					}
					context.stroke();
				}


				let tagValues = workspace_self.shapeManager.getTagValues();
				recalcPlotArea();

				drawAxisX();
				drawAxisY();

				for(let i = 0; i < self.effectByChart.options.length; i++) {
					let option = self.effectByChart.options[i]
					switch(option.type) {
						case "1" : drawBarChart(option, i);	break;				// BAR CHART
						case "2" : drawLineChart(option, i); break;				// 라인 CHART
						case "3" : drawStepChart(option, i); break;				// 라인 CHART
					}
				}
				drawAxisXY();
			}

			// Draw gauge ------------------------------
			this.drawGauge = function(context) {
				let lineWidth = Math.max(20, Math.min(self.width, self.height) / 10); 
				let rx = self.left + self.width / 2, ry = self.top + self.height / 2;
				let r = Math.min(self.width, self.height) / 2 - lineWidth;

				let drawBase = function() {
					context.lineWidth = lineWidth;
					context.lineCap = 'round';
					if(self.effectByGauge.type == 'angular-gauge1')
						context.strokeStyle = Common.getFillStyle(context, self.effectByGauge.color, self.left, self.top, self.width, self.height);
					else
						context.strokeStyle = Common.getFillStyle(context, self.line.color, self.left, self.top, self.width, self.height);
					context.beginPath();
					context.arc(rx, ry, r, 0.75 * Math.PI, 2.25 * Math.PI, false);
					context.stroke();
				}

				let draw = function() {
					let radian = 1.5 * (self.effectByGauge.value - Number(self.effectByGauge.low)) / (Number(self.effectByGauge.high) - Number(self.effectByGauge.low));		 
					context.beginPath();
					context.strokeStyle = Common.getFillStyle(context, self.effectByGauge.color, self.left, self.top, self.width, self.height);
					context.arc(rx, ry, r, 0.75 * Math.PI, (0.75 + radian) * Math.PI, false);
					context.stroke();
				}

				let drawNiddle = function() {
					context.strokeStyle = "rgba(0, 0, 0, 1)";
					context.fillStyle = "rgba(0, 0, 0, 1)";
					context.lineWidth = 1;

					context.beginPath();
					context.moveTo(rx, ry);

					let angle = 270 * (self.effectByGauge.value - Number(self.effectByGauge.low)) / (Number(self.effectByGauge.high) - Number(self.effectByGauge.low)) + 135;
					let x = rx + Math.cos(angle * Math.PI / 180) * r;
					let y = ry + Math.sin(angle * Math.PI / 180) * r;

					context.lineTo(x, y);

					let dr = Math.min(10, r / 50);
					let dx = Math.cos((angle - 90) * Math.PI / 180) * dr;
					let dy = Math.sin((angle - 90) * Math.PI / 180) * dr;

					context.lineTo(rx + dx, ry + dy);
					context.lineTo(rx - dx, ry - dy);
					context.lineTo(x, y);
					context.closePath();
					context.fill();
					context.stroke();

					context.drawEllipse(rx - 2 * dr, ry - 2 * dr, 4 * dr, 4 * dr, 1, false);
				}

				let drawValue = function() {
					let value = self.effectByGauge.value.format(0, true) + self.effectByGauge.unit;
					let ratio = 100 * (self.effectByGauge.value -  - Number(self.effectByGauge.low)) / (Number(self.effectByGauge.high) - Number(self.effectByGauge.low));
					ratio = ratio.toFixed(1) + " %"; 

					let m = context.measureText("W");
					let m1 = context.measureText(value);
					let m2 = context.measureText(ratio);

					context.fillStyle = Common.getFillStyle(context, self.font.color, self.left, self.top, self.width, self.height);
					context.fillText(value, rx - m1.width / 2, ry - 0.5 * m.width);
					context.fillText(ratio, rx - m2.width / 2, ry + 1.0 * m.width);
				}

				let tagValues = workspace_self.shapeManager.getTagValues();
				let val = tagValues[self.effectByGauge.tag];
				if(val !== undefined) self.effectByGauge.value = Number(val.val);
				if(self.effectByGauge.value === undefined) self.effectByGauge.value = Math.random() * Number(self.effectByGauge.high) + Number(self.effectByGauge.low);

				drawBase();
				switch(self.effectByGauge.type) {
					case 'angular-gauge1' : break;
					case 'angular-gauge2' : draw(); break;
				}
				if(self.effectByGauge.niddle == true) drawNiddle();
				drawValue();
			}


			this.calcBoundary = function(flag) {
				let rect = {x:self.x, y:self.y, cx:self.cx, cy: self.cy};

				if(self.rotate > 0 && self.type != 'group') {
					let diagonal = Math.sqrt(self.width * self.width + self.height * self.height);
					rect.x -= (diagonal - rect.cx) / 2
					rect.y -= (diagonal - rect.cy) / 2
					rect.cx = rect.cy = diagonal;
				}

				if(rect.cx < 0) { rect.x += rect.cx; rect.cx *= -1; }
				if(rect.cy < 0) { rect.y += rect.cy; rect.cy *= -1; }

				rect.x += (flag ? -1 * (15 + self.line.width) : 0);
				rect.y += (flag ? -1 * (15 + self.line.width) : 0);
				rect.cx += (flag ? (30 + self.line.width) : 0);
				rect.cy += (flag ? (30 + self.line.width) : 0);

				rect.right = rect.x + rect.cx;
				rect.bottom = rect.y + rect.cy;

				return rect;
			}

			this.drawSelected = function(context) {
				if(self.bSel == true) {
					context.beginPath();
					context.lineWidth = 1;
					context.strokeStyle = context.fillStyle = self.type == 'group' ? '#ff00ff' :'#a9a9a9';

					let rc = self.calcBoundary(false);
					if(self.type != 'line') {
						context.strokeRect( rc.x, rc.y, rc.cx, rc.cy);
						context.drawEllipse(rc.x - 4, rc.y - 4, 8, 8, 1, false);
						context.drawEllipse(rc.right - 4, rc.y - 4, 8, 8, 1, false);
						context.drawEllipse(rc.x - 4, rc.bottom - 4, 8, 8, 1, false);
						context.drawEllipse(rc.right - 4, rc.bottom - 4, 8, 8, 1, false);
					}
					else {
						let dir = self.line.dir;
						if((self.cx < 0 || self.cy < 0) && !(self.cx < 0 && self.cy < 0)) dir = dir == 1 ? 2 : 1;
						if(dir == 1) {
							context.drawEllipse(rc.x - 4, rc.y - 4, 8, 8, 1, false);
							context.drawEllipse(rc.right - 4, rc.bottom - 4, 8, 8, 1, false);
						}
						else {
							context.drawEllipse(rc.right - 4, rc.y - 4, 8, 8, 1, false);
							context.drawEllipse(rc.x - 4, rc.bottom - 4, 8, 8, 1, false);
						}
					}

					context.closePath();
				}
			}

			let drawArea = function(context) {
				if(self.type !== 'rectangle') {
					context.beginPath();
					context.lineWidth = self.line.width;
					context.strokeStyle = Common.getFillStyle(context, self.line.color, self.left, self.top, self.width, self.height);
					drawShape(context, false);
					context.closePath();
				}
			}

			this.fillImage = function(context) {
				try {
					if(typeof(this.fill.image) != 'undefined') {
						if(self.bOver == true && self.effectByMouse !== undefined) {
							context.shadowColor = "Lime";
							context.shadowBlur = 5;
						}

						context.globalAlpha = Common.getAlpha(self.fill.color) / 255;
						drawArea(context);
						if(self.fill.bGIF == false) {
							context.drawImage(self.fill.image, self.left, self.top, self.width, self.height);
						}
						else if(this.fill.image.image != null) {
							context.drawImage(self.fill.image.image, self.left, self.top, self.width, self.height);
						}

						context.shadowBlur = 0;
					}
				}
				catch(error) {
					self.fill.image = new Image();
					let imageSrcPath = getContextPath() + self.rootPath + "/images/noimage80.png";
					self.fill.image.src = imageSrcPath;
				}
			}

			this.fillShape = function(context) {
				if(typeof(self.fill.image) == 'undefined') {
					context.fillStyle = Common.getFillStyle(context, self.fill.color, self.left, self.top, self.width, self.height);
					drawShape(context, true);
				}
			}

			this.fillText = function(context) {
				if(self.fill.text !== undefined) {
					context.fillStyle = Common.getFillStyle(context, self.font.color, self.left, self.top, self.width, self.height); 
					let text = self.fill.string !== undefined ? self.fill.string : '';
					if(text.length == 0) text = self.fill.text;

					if(workspace_self.edit == true && self.fill.text[0] == '#') {
						let metrics = context.measureText("#");
						if( metrics.width * self.fill.text.length > self.width) {
							let len = Math.floor(self.width / metrics.width) - 1;
							text = text.substr(text.length - len);
						}
					}

					let height = context.measureText("M").width * 1.3;
					let x = self.left, y = self.top;

					let strArr = "";
					try {
						strArr = text.split("$LF$");
					}
					catch(err) {
						strArr = '?????';
					}

					switch(self.font.textAlignVert) {
						case TextAlign.Top : 
							y = self.top + height / 1.3;
							break;
						case TextAlign.Middle : 
							y = self.top + (self.height - height * strArr.length) / 2 + height * 0.8; 
							break;
						case TextAlign.Bottom : 
							y = self.top + self.height - height * (strArr.length - 1); 
							break;
					}

					for(let str of strArr) { 
						let metrics = context.measureText(str);

						switch(self.font.textAlignHorz) {
							case TextAlign.Center : 
								x = self.left + (self.width - metrics.width) / 2; 
								break;
							case TextAlign.Right : 
								x = self.left + self.width - metrics.width; 
								break;
						}

						if(self.bOver == true && self.effectByMouse !== undefined) {
							context.shadowColor = "Lime";
							context.shadowBlur = 5;
						}

						context.fillText(str, x, y);
						context.shadowBlur = 0;

						y += height;
					}
				}
			}

			this.recalcClearRect = function(zoomRatio) {
				let rc = self.calcBoundary(true);

				self.clearRect.left = zoomRatio * rc.x;
				self.clearRect.top = zoomRatio * rc.y;
				self.clearRect.width = zoomRatio * rc.cx;
				self.clearRect.height = zoomRatio * rc.cy;

				if(self.effectByFill !== undefined) {
					self.clearRect.left = zoomRatio * self.effectByFill.rect.x;
					self.clearRect.top = zoomRatio * self.effectByFill.rect.y;
					self.clearRect.width = zoomRatio * self.effectByFill.rect.cx;
					self.clearRect.height = zoomRatio * self.effectByFill.rect.cy;
				}

			}

			this.recalcRect = function(zoomRatio) {
				self.left = zoomRatio * self.x;
				self.top = zoomRatio * self.y;
				self.width = zoomRatio * self.cx;
				self.height = zoomRatio * self.cy;

				if(self.round !== undefined) {
					self.round.round = self.round.r * zoomRatio;
				}
			}

			this.rotateRect = function() {
				let offset = Math.max(this.width, this.height) * 1.2;

				this.left -= offset;
				this.top -= offset;
				this.width = offset * 2;
				this.height = offset * 2;
			} 
		}

		function ShapeList() {
			let self = this;

			let height = 0;
			let width = 0;
			let jsScript = "";

			let slide = true;

			let shapes = new Array();
			let shapeNames = new Array();

			let deleteShape = function(shape) {
				let index = shapes.findIndex((obj) => obj.id == shape.id);
				if(index == -1)	{
					index = shapes.findIndex((obj) => 
						obj.type == shape.type && obj.x == shape.x && obj.y == shape.y && obj.cx == shape.cx && obj.cy == shape.cy);
				}

				if(index != -1)
					shapes.splice(index, 1);
			}

			let insertShape = function(shape) {
				let index = shape.index;
				shapes.splice(index, 0, shape);
			}

			let updateShape = function(shape) {
				let index = shapes.findIndex((obj) => obj.id == shape.id);
				if(index == -1) {
					index = shapes.findIndex((obj) => 
						obj.type == shape.type && obj.x == shape.x && obj.y == shape.y && obj.cx == shape.cx && obj.cy == shape.cy);

				}
				if(index != -1) {
					let prev = (new Shape).attach(shapes[index]);
					let newShape = (new Shape).attach(shape);
					shapes[index] = newShape;

					return prev;
				}
				return {};
			}

			let group = function(objects) {
				let group = new Shape();
				group.type = 'group';
				group.id = objects[0].parent;

				let pos = 0, x = 99999, y = 99999, right = 0, bottom = 0;
				for(let shape of objects) {
					shape.name = '';

					pos = Math.max(pos, shape.index);
					group.children.push(shape);

					x = Math.min(x, shape.x);
					y = Math.min(y, shape.y);
					right = Math.max(right, shape.x + shape.cx);
					bottom = Math.max(bottom, shape.y + shape.cy);

					deleteShape(shape);
				}

				group.index = pos;
				group.x = x;
				group.y = y;
				group.cx = right - x;
				group.cy = bottom - y;
				group.bSel = group.bDraw = true ;

				shapes.splice(pos, 0, group);

				return [group.clone()];
			}

			let ungroup = function(groups) {
				let children = [];
				for(let shape of groups) {
					for(let obj of shape.children) {
						obj.bSel = true;
						obj.parent = shape.id;
						children.push(obj);
					}
				}

				for(let obj of groups) deleteShape(obj);

				let items = [];
				for(let obj of children) {
					shapes.splice(obj.index, 0, obj );
					items.push(obj.clone());
				}

				return items;
			}

			let reorderShapes = function(param) {
				let toTop = function(arr) {
					for(let shape of arr) shapes.push(shape);
				}

				let toBottom = function(arr) {
					for(let shape of arr) shapes.splice(0, 0, shape);
				}

				let reorder = function(pos, arr) {
					for(let shape of arr) shapes.splice(pos, 0, shape);
				}


				////
				let arr = [], minIndex = 9999, maxIndex = 0;
				for(let i = 0; i < shapes.length; i++) {
					let shape = shapes[i];
					if(shape.bSel == false) continue;

					if(i > 0) minIndex = Math.min(minIndex, i - 1);
					maxIndex = Math.max(maxIndex, i + 1);
					shape.index = i;
					arr.push(shape);
				}

				for(let shape of arr) deleteShape(shape);

				switch(param) {
					case "toTop" : toTop(arr); break;
					case "toBottom" : toBottom(arr); break;
					case "toFront" : reorder(maxIndex, arr); break;
					case "toBack" : reorder(minIndex, arr); break;
				}

				workspace_self.undo.unshift({action:param, data:arr});
				workspace_self.onChange('undo', workspace_self.undo);

			}

			let testBoundaryForLine = function(shape, mouse, rc) {
				let result = "none";

				let dir = shape.line.dir;
				if((shape.cx < 0 || shape.cy < 0) && !(shape.cx <= 0 && shape.cy <= 0)) 
					dir = dir == 1 ? 2 : 1;

				if(rc.cx <= 10 || rc.cy <= 10) { 
					if( mouse.offsetY >= rc.y - 5 && mouse.offsetY <= rc.bottom + 5 && 
						mouse.offsetX >= rc.x - 5 && mouse.offsetX <= rc.right + 5) result = 'select';
				}
				else {
					let y = 0;
					if(dir == 1)
						y = rc.cy / rc.cx * (mouse.offsetX - rc.x) + rc.y;
					else
						y = -1 * rc.cy / rc.cx * (mouse.offsetX - rc.x) + rc.bottom;

					if(Math.abs(y - mouse.offsetY) <= 10 && 
						mouse.offsetX >= rc.x - 5 && mouse.offsetX <= rc.right + 5) result = 'select';
				}

				if(result == 'select') {
					if(dir == 1) {
						if(Math.abs(mouse.offsetX - rc.x) <= 5 && Math.abs(mouse.offsetY - rc.y) <= 5) result = "nw";
						if(Math.abs(mouse.offsetX - rc.right) <= 5 && Math.abs(mouse.offsetY - rc.bottom) <= 5) result = "se";
					}
					else {
						if(Math.abs(mouse.offsetX - rc.right) <= 5 && Math.abs(mouse.offsetY - rc.y) <= 5) result = "ne";
						if(Math.abs(mouse.offsetX - rc.x) <= 5 && Math.abs(mouse.offsetY - rc.bottom) <= 5) result = "sw";
					}
				}

				return result;
			}

			let testBoundaryForNonLine = function(mouse, rc) {
				let result = "none";
				if(mouse.offsetX >= rc.x - 5 && mouse.offsetX <= rc.right + 5 &&
					mouse.offsetY >= rc.y - 5 && mouse.offsetY <= rc.bottom + 5) result = "select";

				if(result == 'select') {
					if(Math.abs(mouse.offsetX - rc.x) <= 5) result = "west";
					if(Math.abs(mouse.offsetX - rc.right) <= 5) result = "east";
					if(Math.abs(mouse.offsetY - rc.y) <= 5) result = "north";
					if(Math.abs(mouse.offsetY - rc.bottom) <= 5) result = "south";
					if(Math.abs(mouse.offsetX - rc.x) <= 5 && Math.abs(mouse.offsetY - rc.y) <= 5) result = "nw";
					if(Math.abs(mouse.offsetX - rc.right) <= 5 && Math.abs(mouse.offsetY - rc.y) <= 5) result = "ne";
					if(Math.abs(mouse.offsetX - rc.x) <= 5 && Math.abs(mouse.offsetY - rc.bottom) <= 5) result = "sw";
					if(Math.abs(mouse.offsetX - rc.right) <= 5 && Math.abs(mouse.offsetY - rc.bottom) <= 5) result = "se";
				}
				return result;
			}

			let testBoundary = function(shape, mouse, rc) {
				let boundaryTest = 'none';
				if(shape.type == 'line') 
					boundaryTest = testBoundaryForLine(shape, mouse, rc);
				else 
					boundaryTest = testBoundaryForNonLine(mouse, rc);

				return boundaryTest;
			}

			let checkCursor = function(mouse) {
				let cursor = 'default';
				let hovered = null;
				let nLen = shapes.length - 1;

				for(let i = nLen; i >= 0; i--) {
					let shape = shapes[i];
					if(shape.visible == false) continue;

					if(workspace_self.edit == true) {
						if(shape.bSel == false) continue;
						let rc = shape.calcBoundary(false);
						if(mouse.offsetX >= rc.x - 5 && mouse.offsetX <= rc.right + 5 &&
							mouse.offsetY >= rc.y - 5 && mouse.offsetY <= rc.bottom + 5) {
							let boundaryTest = testBoundary(shape, mouse, rc);
							switch(boundaryTest) {
								case 'select' : cursor = "move"; break;
								case 'east' : if(shape.type != 'group') cursor = "col-resize"; else cursor = "move"; break;
								case 'west' : if(shape.type != 'group') cursor = "col-resize"; else cursor = "move"; break;
								case 'north' : if(shape.type != 'group') cursor = "row-resize"; else cursor = "move"; break;
								case 'south' : if(shape.type != 'group') cursor = "row-resize"; else cursor = "move"; break;
								case 'ne' : case 'nw' : case 'se' : case 'sw' :
									 if(shape.type != 'group') cursor = "crosshair"; else cursor = "move";
									 break;
							}
							hovered = shape;
							break;
						}
					}
					else {
						shape.bOver = false;
						if(mouse.offsetX >= shape.left && mouse.offsetX <= shape.left + shape.width &&
							mouse.offsetY >= shape.top && mouse.offsetY <= shape.top + shape.height) {
							if(shape.effectByLink !== undefined) cursor = 'pointer';
							if(shape.effectBySwitch !== undefined) cursor = 'pointer';
							if(shape.effectByToggleImage !== undefined) cursor = 'pointer';

							//if(shape.bOver == false) shape.bDraw = true;
							shape.bOver = true;
							hovered = shape;
							break;
						}
					}
				}

				return {
					shape : hovered,
					cursor: cursor
				}
			}
			let updateShapeApperance = function(mode, shape, deltaX, deltaY) {
				shape.modified = true;
				if(mode == 'move') {
					shape.x -= deltaX;
					shape.y -= deltaY;
				}

				if(mode == 'resize-right') { shape.cx -= deltaX; }
				if(mode == 'resize-left' ) { shape.x -= deltaX; shape.cx += deltaX; }
				if(mode == 'resize-bottom') { shape.cy -= deltaY;	}
				if(mode == 'resize-top' ) { shape.y -= deltaY; shape.cy += deltaY; }
				if(mode == 'resize-ne') { 
					shape.cx -= deltaX;
					shape.y -= deltaY; shape.cy += deltaY;
				}
				if(mode == 'resize-nw' ) { 
					shape.x -= deltaX; 
					shape.cx += deltaX;
					shape.y -= deltaY; shape.cy += deltaY;
				}
				if(mode == 'resize-se' ) {
					shape.cx -= deltaX;
					shape.cy -= deltaY;
				}
				if(mode == 'resize-sw' ) {
					shape.x -= deltaX; shape.cx += deltaX;
					shape.cy -= deltaY;
				}

				if(shape.effectByFill !== undefined) {
					shape.effectByFill.rect = {x:shape.x, y:shape.y, cx:shape.cx, cy:shape.cy};
				}
			}

			let doDragGroup = function(mode, shape, deltaX, deltaY) {
				for(let obj of shape.children) {
					if(obj.type == 'group') doDragGroup(mode, obj, deltaX, deltaY);
					updateShapeApperance(mode, obj, deltaX, deltaY);
				}
			}

			let smartGuide = function(src) {
				let x = 0, y = 0;
				for(let shape of shapes) {
					if(shape.bSel == true) continue;
					if(Math.abs(src.x - shape.x) <= 1) {
						if(x === 0) x = shape.x;
						if(Math.abs(src.x - shape.x) < Math.abs(x - shape.x) ) x = shape.x;
					}

					if(Math.abs(src.y - shape.y) <= 1) {
						if(y === 0) y = shape.y;
						if(Math.abs(src.y - shape.y) < Math.abs(y - shape.y) ) y = shape.y;
					}

				}

				if(x != 0) src.x = x;
				if(y != 0) src.y = y;
			}

			let doDrag = function(renderManager, mode, deltaX, deltaY, mouse) {
				let arr = new Array();
				for(let i = 0; i < shapes.length; i++) {
					let shape = shapes[i];
					if(shape.bSel == false) continue;

					if(workspace_self.drag.active == false) arr.push(shape.clone() );

					updateShapeApperance(mode, shape, deltaX, deltaY);
					if(shape.type == 'group') doDragGroup(mode, shape, deltaX, deltaY);

					//if(workspace_self.pressedKeys['Shift'] !== undefined) 
					//smartGuide(shape);

					shape.bDraw = true;

					renderManager.checkRedrawShape(shapes, shape);
				}

				if(arr.length > 0) {
					workspace_self.undo.unshift({action:'update', data:arr});
					workspace_self.onChange('undo', workspace_self.undo);
				}
			}

			let getSelected = function() {
				let count = 0;
				for(let shape of shapes) {
					if(shape.bSel == true) count++;
				}

				return count;
			}

			let getTagList = function() {
				let tagList = new Array();
				for(let shape of shapes) {
					let tagName = "";
					if(shape.effectByValue !== undefined) tagName = shape.effectByValue.tagName;
					if(shape.effectByImagelist !== undefined) tagName = shape.effectByImagelist.tagName;
					if(shape.effectByColorlist !== undefined) tagName = shape.effectByColorlist.tagName;
					if(shape.effectBySwitch !== undefined) tagName = shape.effectBySwitch.status;
					if(shape.effectByGauge !== undefined) tagName = shape.effectByGauge.tag;

					if(shape.effectByChart !== undefined) {
						for(let option of shape.effectByChart.options)
							tagList.push(option.tag);
					}
					else { 
						if(tagName == "") continue;
						if(typeof(tagName) == 'undefined') continue;
						if(tagName.substring(0,1) == '$') continue;

						tagList.push(tagName);
					}
				}

				return tagList;
			}

			// function witch used only edit mode
			let hitShape = function(drag, mouse) {
				drag.left = drag.x = mouse.offsetX;
				drag.top = drag.y = mouse.offsetY;
				drag.mode = 'select';

				let cursor = workspace_self.canvasManager.getCursor();
				if(cursor == 'default') {
					let selected = getSelected();
					if( workspace_self.pressedKeys['Shift'] === undefined && selected <= 1) {
						for(let shape of shapes) {
							if(shape.bSel == true) shape.bDraw = true;
							shape.bSel = false;
						}
					}
				}

				for(let i = shapes.length - 1; i >= 0; i--) {
					let shape = shapes[i];

					let test = '';
					let rc = shape.calcBoundary(false);
					if(cursor == 'default') {
						test = testBoundary(shape, mouse, rc);
						if(test == 'none') continue;
					}
					else {
						if(shape.bSel == false) continue;
						test = testBoundary(shape, mouse, rc);
					}

					if(workspace_self.pressedKeys['Shift'] == true)
						shape.bSel = shape.bSel == true ? false : true;
					else {
						shape.bSel = true;
					}

					shape.bDraw = true;
					drag.mode = 'move';

					if(shape.type !== 'group') {
						switch(test) {
							case 'west' : drag.mode = "resize-left"; break;
							case 'east' : drag.mode = "resize-right"; break;
							case 'north' : drag.mode = "resize-top"; break;
							case 'south' : drag.mode = "resize-bottom"; break;
							case 'nw' : drag.mode = "resize-nw"; break;
							case 'ne' : drag.mode = "resize-ne"; break;
							case 'sw' : drag.mode = "resize-sw"; break;
							case 'se' : drag.mode = "resize-se"; break;
						}
					}
					break;
				}

				return drag;
			}

			let moveShapes = function(param) {
				let fn = $.noop;
				let moveToLeft = function(shape) { shape.x--; }
				let moveToRight = function(shape) { shape.x++; }
				let moveToUp = function(shape) { shape.y--; }
				let moveToDown = function(shape) { shape.y++; }

				let moveGroup = function(shape) {
					for(let child of shape.children) {
						if(child.type == 'group') moveGroup(child);
						fn(child);
					} 
				}

				switch(param) {
					case 'left' : fn = moveToLeft;break;
					case 'right' : fn = moveToRight;break;
					case 'up' : fn = moveToUp;break;
					case 'down' : fn = moveToDown;break;
				}

				let arr = [];
				for(let shape of shapes) {
					if(shape.bSel == false) continue;
					arr.push(shape.clone());

					fn(shape);
					if(shape.type == 'group') moveGroup(shape);
					shape.bDraw = true;
				}

				workspace_self.undo.unshift({action:'update', data:arr});
				workspace_self.onChange('undo', workspace_self.undo);

				workspace_self.refresh();

				workspace_self.onItemClick(arr);
			}

			let setRedraw = function(bDraw) {
				for(let shape of shapes) {
					shape.bDraw = bDraw;
				}
			}

			let selectShapes = function(drag, mouse) {
				let x1 = drag.left < mouse.offsetX ? drag.left : mouse.offsetX;
				let x2 = drag.left > mouse.offsetX ? drag.left : mouse.offsetX;
				let y1 = drag.top < mouse.offsetY ? drag.top : mouse.offsetY;
				let y2 = drag.top > mouse.offsetY ? drag.top : mouse.offsetY;

				let nLen = shapes.length - 1;
				for(let i = nLen; i >= 0; i--) {
					let shape = shapes[i];
					if(shape.bSel == true) shape.bDraw = true;
					shape.bSel = false;
					let rc = shape.calcBoundary(false);
					if(x1 <= rc.x && x2 > rc.right && y1 <= rc.y && y2 > rc.bottom) {
						shape.bSel = true;
						shape.bDraw = true;
					}
				}
			}

			let unselectShapes = function() {
				for(let shape of shapes) {
					if(shape.bSel == false) continue;
					shape.bSel = false;
					shape.bDraw = true;
				}
			}

			let isRedrawAll = function() {
				return shapes.every((shape) => shape.bDraw == true);
			}

			let showTooltip = function(src) {
				let calcWidthHeight = function(shape, zoomRate) {
					let canvas = workspace_self.canvasManager.getCanvas();
					let context = canvas.getContext("2d");

					context.font = (shape.font.fontSize * zoomRate).toString() + "px " + shape.font.fontFamily;

					let strArr = shape.fill.text.split("$LF$");
					shape.cy = strArr.length * context.measureText("M").width * 2;
					for(let str of strArr) {
						 shape.cx = Math.max(shape.cx, context.measureText(str).width * 1.2);
					}
				}

				let zoomRate = workspace_self.renderManager.getZoomRate();
				for(let i = shapes.length - 1; i >= 0; i--) {
					let shape = shapes[i];
					if(shape.name[0] != '$') break;
					if(shape.name != src.effectByMouse.panel) continue;

					let x = shape.x, y = shape.y;
					switch(src.effectByMouse.position) {
					case 'left-top': x = src.x - shape.cx; y = src.y;	break;
					case 'left-bottom': x = src.x - shape.cx; y = src.y - shape.cy; break;
					case 'right-top': x = src.x + src.cx; y = src.y; break;
					case 'right-bottom': x = src.x + src.cx; y = src.y - shape.cy; break;
					}

					shape.fill.text = " " + src.effectByValue.tagName;
					let tag = workspace_self.tagManager.find(src.effectByValue.tagName);
					if(tag !== undefined) {
						if(tag.desc != '') {
							shape.fill.text += " [" + tag.desc + "]";
						}

						let tagValues = workspace_self.shapeManager.getTagValues();
						let val = tagValues[src.effectByValue.tagName];
						if(val !== undefined) {
							shape.fill.text += "$LF$ " + Number(val.val).format(2, true) + "  [" + val.time + "] " + (val.quality == 192 ? 'Good' : 'Bad');
						}
						shape.fill.text += "$LF$ " + Number(tag.lsl).format(2, true) + " - " + Number(tag.hsl).format(2, true);

						calcWidthHeight(shape, zoomRate);

						workspace_self.renderManager.checkRedrawShape(shapes, shape);

						shape.x = x;
						shape.y = y;

						shape.bDraw = true;
						shape.visible = true;
						shape.recalcClearRect(zoomRate);
					}
					break;
				}
			}

			return {
				deleteShape : deleteShape,
				insertShape : insertShape,
				group : group,
				ungroup : ungroup,
				updateShape : updateShape,
				reorderShapes : reorderShapes,
				checkCursor : function(mouse) { return checkCursor(mouse); },
				hitShape : function(drag, mouse) { return hitShape(drag, mouse); },
				doDrag : function(renderManager, mode, deltaX, deltaY, mouse) { return doDrag(renderManager, mode, deltaX, deltaY, mouse); },
				getTagList : function() { return getTagList(); },
				isRedrawAll : isRedrawAll,
				script : jsScript,
				height: height,
				moveShapes : moveShapes,
				setRedraw : setRedraw,
				shapes : shapes,
				shapeNames : shapeNames,
				selectShapes : function(drag, mouse) { return selectShapes(drag, mouse); },
				unselectShapes : unselectShapes,
				showTooltip : showTooltip,
				slide:slide,
				width : width
			}
		}

		function ShapeManager() {
			let PreLoader = function() {
				let self = this;
				this.requested = 0, completed = 0;
				let noImageSrcPath = getContextPath() + self.rootPath + "/images/noimage80.png";
				let noImage = noImageSrcPath;

				this.loadImage = function(imgSrc) {
					self.requested++;

					let image = new Image();
					image.onload = function() {
						completed++;
						if (self.requested == completed) {
							self.onLoadComplete();
						}
					}

					image.onerror = function() 	{
						completed++;
						image.src = noImage;
						self.requested++;
					}

					image.src = imgSrc;

					return image;
				}

				let onLoadError = function() {
				}

				this.init = function() {
					self.requested = completed = 0;
				}
			}

			let shapeList = new ShapeList();
			let tagList = new Array();
			let tagValues = new Array();
			let preLoader = new PreLoader();
			let resourcesPath = "";

			let deleteShape = function(shape) {
				shapeList.deleteShape(shape);
				workspace_self.refreshAll();	// redraw all after clear background
			}

			let insertShape = function(shape) {
				shapeList.insertShape(shape);
				workspace_self.refreshAll();	// redraw all after clear background
			}

			let deleteShapes = function() {
				let arr = [];
				for(let i = 0; i < shapeList.shapes.length; i++) {
					if(shapeList.shapes[i].bSel == false) continue;
					shapeList.shapes[i].index = i;
					arr.push(shapeList.shapes[i].clone());
					shapeList.shapes.splice(i, 1);
					i--;
				}

				workspace_self.undo.unshift({action:'del', data:arr});
				workspace_self.refreshAll();	// redraw all after clear background
			}

			let group = function(objects) {
				return shapeList.group(objects);
			}

			let ungroup = function(groups) {
				return shapeList.ungroup(groups);
			}

			let updateShape = function(shape) {
				return shapeList.updateShape(shape);
			}

			let reorderShapes = function(param) {
				return shapeList.reorderShapes(param);
			}

			let loadLayout = function(url) {
				let xmlHttp = new XMLHttpRequest();
				xmlHttp.open("GET", url, true);
				xmlHttp.setRequestHeader("Cache-Control", "no-cache");
				xmlHttp.onreadystatechange = function (aEvt) {
					if(xmlHttp.readyState == 4) {
						switch(xmlHttp.status) {
						case 200 : 
							if(xmlHttp.responseXML != null) {
								parseXml(xmlHttp.responseXML);
								if(preLoader.requested == 0) 
									preLoader.onLoadComplete();
							}
							else {
								alert('layout file not found!. url:' + url );
							}
							break;
						default:
							// Call JS alert for custom error or debug messages
							if (strResponse.indexOf('Error:') > -1 ||
								strResponse.indexOf('Debug:') > -1) {
								alert(strResponse);
							}
							else {
								eval(strResultFunc + '(strResponse);');
							}
							break;
						}
					}
				}
				xmlHttp.send(null);
			}

			let refreshShapeNames = function() {
				shapeList.shapeNames = new Array();
				for(let shape of shapeList.shapes) {
					if(shape.name == '') continue;
					shapeList.shapeNames[shape.name] = shape;
				}
			}

			let onAttributes = function(xmlNode, shape)	{
				let strName 	= xmlNode.getAttribute('name');
				let strSub 		= xmlNode.getAttribute('sub');
				let strLeft 	= xmlNode.getAttribute('left');
				let strTop 		= xmlNode.getAttribute('top');
				let strWidth 	= xmlNode.getAttribute('width');
				let strHeight 	= xmlNode.getAttribute('height');
				let rotate 		= xmlNode.getAttribute('rotateAngle');
				let flipVert 	= xmlNode.getAttribute('flipVert');
				let flipHorz 	= xmlNode.getAttribute('flipHorz');

				if(strName != null && strName != "") {
					shape.name = strName;
					shapeList.shapeNames[strName] = shape;
				}
				if(strSub != null && strName != "") shape.sub = strSub;

				if(strLeft != null) shape.x = Number(strLeft).ceil();
				if(strTop != null) shape.y = Number(strTop).ceil();
				if(strWidth != null) shape.cx = Number(strWidth).ceil();
				if(strHeight != null) shape.cy = Number(strHeight).ceil();

				shape.rect = { x:shape.x, y:shape.y, cx:shape.cx, cy:shape.cy};

				if(flipVert != null) shape.flipVert = Number(flipVert);
				if(flipHorz != null) shape.flipHorz = Number(flipHorz);
				shape.rotate = rotate != null ? Number(rotate) : 0;

				for(let childNode of xmlNode.childNodes) {
					switch(childNode.nodeName) {
						case "font": onFontAttribute(childNode, shape); break;
						case "line": onLineAttribute(childNode, shape); break;
						case "fill": onFillAttribute(childNode, shape, preLoader); break;
						//case "shadow": onShadowAttribute(childNode, shape); break;
						case "round": onRoundAttribute(childNode, shape); break;
						case "effectByValue": onEffectByValue(childNode, shape); break;
						case "effectByFill" : onEffectByFill(childNode, shape); break;
						case "effectByOpacity" : onEffectByOpaque(childNode, shape); break;
						case "effectByColorlist" : onEffectByColorlist(childNode, shape); break;
						case "effectByImagelist" : onEffectByImagelist(childNode, shape, preLoader); break;
						case "effectByToggleImage" : onEffectByToggleImage(childNode, shape, preLoader); break;
						case "effectByLink" : onEffectByLink(childNode, shape); break;
						case "effectByBlink" : onEffectByBlink(childNode, shape); break;
						case "effectByMouse" : onEffectByMouse(childNode, shape); break;
						case "effectBySwitch" : onEffectBySwitch(childNode, shape); break;
						case "effectByChart" : onEffectByChart(childNode, shape); break;
						case "effectByGauge" : onEffectByGauge(childNode, shape); break;
					}
				}
			}

			let onEffectByColorlist = function(xmlNode, shape) {
				shape.effectByColorlist = new Object();
				shape.effectByColorlist.colorList = new Array();
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName){
						case "tagName": shape.effectByColorlist.tagName = childNode.firstChild.data;
						case "category": shape.effectByColorlist.category = Number(childNode.firstChild.data);break;
						case "color" : {
							let colorAttr = { color : null, from : 0, to : 0 };
							colorAttr.color = Common.getRGBA(Number(childNode.firstChild.data), 1.0);
							colorAttr.operValue = childNode.getAttribute('operValue');
							colorAttr.operSymbol = childNode.getAttribute('operSymbol');

							shape.effectByColorlist.colorList.push(colorAttr);
						}
						break;
					}
				}

				switch(shape.effectByColorlist.category) {
					case 0 : shape.effectByColorlist.orgColor = shape.fill.color; break;
					case 1 : shape.effectByColorlist.orgColor = shape.line.color; break;
					case 2 : shape.effectByColorlist.orgColor = shape.font.color; break;
				}
			}

			let onEffectByFill = function(xmlNode, shape) {
				shape.effectByFill = new Object();
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					shape.effectByFill.rect = { x:shape.x, y:shape.y, cx:shape.cx, cy:shape.cy };
					shape.effectByFill.ratio = 0.000001;
					switch(childNode.nodeName) {
						case "tagName": shape.effectByFill.tagName = childNode.firstChild.data; break;
						case "direction": shape.effectByFill.direction = Number(childNode.firstChild.data); break;
						case "minValue": shape.effectByFill.min = Number(childNode.firstChild.data); break;
						case "maxValue" : shape.effectByFill.max = Number(childNode.firstChild.data); break;
					}
				}
			}

			let onEffectByImagelist = function(xmlNode, shape) {
				shape.effectByImagelist = new Object();
				shape.effectByImagelist.orgImage = shape.fill.image;
				shape.effectByImagelist.imageList = new Array();
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName){
						case "tagName": shape.effectByImagelist.tagName = childNode.firstChild.data; break;
						case "image" : {
							shape.fill.bGIF = false;

							var strImagePath = resourcesPath + "/" + childNode.firstChild.data;
							var imageAttr = { image : null, operValue : 0, operSymbol : "" };
							imageAttr.image = preLoader.loadImage(strImagePath);
							imageAttr.operValue = childNode.getAttribute('operValue');
							imageAttr.operSymbol = childNode.getAttribute('operSymbol');

							shape.effectByImagelist.imageList.push(imageAttr);
						}
						break;
					}
				}
			}

			let onEffectByBlink = function(xmlNode, shape) {
				shape.effectByBlink = { tagName:'', oper:'', operValue:0 };
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
						case "tagName": shape.effectByBlink.tagName = childNode.firstChild.data; break;
						case "operSymbol": shape.effectByBlink.oper = childNode.firstChild.data; break;
						case "operValue": shape.effectByBlink.operValue = childNode.firstChild.data; break;
					}
				}
			}

			let onEffectByMouse = function(xmlNode, shape) {
				shape.effectByMouse = { event:'', panel:'' };
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
						case "event": shape.effectByMouse.event = childNode.firstChild.data; break;
						case "panel": shape.effectByMouse.panel = childNode.firstChild.data; break;
						case "position": shape.effectByMouse.position = childNode.firstChild.data; break;
					}
				}
			}

			let onEffectByLink = function(xmlNode, shape) {
				shape.effectByLink = new Object();
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
						case "link": shape.effectByLink.link = childNode.firstChild.data; break;
					}
				}
			}

			let onEffectByOpaque = function(xmlNode, shape) {
				shape.effectByOpaque = new Object();
				for (let childNode of xmlNode.childNodes) {
				if(childNode.firstChild == null) continue;
				switch(childNode.nodeName) {
					case "tagName": shape.effectByOpaque.tagName = childNode.firstChild.data; break;
					case "minValue": shape.effectByOpaque.min = Number(childNode.firstChild.data); break;
					case "maxValue" : shape.effectByOpaque.max = Number(childNode.firstChild.data);	break;
					}
				}
			}

			let onEffectByValue = function(xmlNode, shape) {
				shape.effectByValue = new Object();
				shape.effectByValue.orgText = shape.fill.text;
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
					case "tagName": shape.effectByValue.tagName = childNode.firstChild.data; break;
					case "unit": shape.effectByValue.unitName = childNode.firstChild.data;	break;
					case "decPos": shape.effectByValue.decPos = Number(childNode.firstChild.data); break;
					case "commaDelimited" : shape.effectByValue.commaDelimeted = childNode.firstChild.data == "1" ? true : false; break;
					case "length" :	shape.effectByValue.length = Number(childNode.firstChild.data);	break;
					case "prefix" :	shape.effectByValue.prefix = childNode.firstChild.data;	break;
					}
				}
			}

			let onEffectBySwitch = function(xmlNode, shape) {
				shape.effectBySwitch = { control:'', status:'', states:[] };
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
						case "control": shape.effectBySwitch.control = childNode.firstChild.data; break;
						case "status": shape.effectBySwitch.status = childNode.firstChild.data; break;
						case "states": {
							let states = childNode.firstChild.data;
							let tokens = states.split(',');
							for(let token of tokens) {
								if(token =='') continue;
								shape.effectBySwitch.states.push(token);
							}
						}
					}
				}
				shape.effectBySwitch.controlVal = shape.effectBySwitch.val = 0;
				shape.fill.bGIF = false;
				shape.fill.image = new Image();

				let imageSrcPath = getContextPath() + workspace_self.rootPath + "/images/" + shape.effectBySwitch.states[0] + ".png";
				let src = imageSrcPath;
				shape.fill.image = preLoader.loadImage(src);
			}

			let onEffectByToggleImageStates = function(xmlNode, shape) {
				let state = {state:'', link:''};
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;

					switch(childNode.nodeName) {
					case "state": state.state = childNode.firstChild.data; break;
					case "link": state.link = childNode.firstChild.data; break;
					}
				}
				shape.effectByToggleImage.states.push(state);
			}

			let onEffectByToggleImage = function(xmlNode, shape, preLoader) {
				shape.effectByToggleImage = { seq: 0, states:[] };
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					if(childNode.nodeName.includes("state") == true) 
						onEffectByToggleImageStates(childNode, shape)
				}

				shape.fill.bGIF = false;
				shape.fill.image = new Image();

				let imageSrcPath = getContextPath() + workspace_self.rootPath + "/images/" + shape.effectByToggleImage.states[0].state + ".png";
				let src = imageSrcPath;
				shape.fill.image = preLoader.loadImage(src);

			}


			let onEffectByChartSeries = function(xmlNode, shape) {
				let option = {}, colorNode = {}, opacity = 255;
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
					case "tag": option.tag = childNode.firstChild.data; break;
					case "type": option.type = childNode.firstChild.data; break;
					case "color": colorNode = getColorNode(childNode); break;
					case "opacity": opacity = Number(childNode.firstChild.data); break;
					case "display-value": option.displayValue = childNode.firstChild.data == '0' ? false : true; break;
					}
				}

				if(colorNode.type == null)
					option.color = Common.getRGBA(colorNode.color, opacity / 255);
				else {
					colorNode.color = Common.getRGBA(colorNode.color, opacity / 255);
					colorNode.gradientColor = Common.getRGBA(colorNode.gradientColor, opacity / 255); 
					option.color = colorNode;
				}

				shape.effectByChart.options.push(option);
			}

			let onEffectByChart = function(xmlNode, shape) {
				shape.effectByChart = { options:[], labelX:'', labelY:'', unit:'', axisX:'hour' };
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					if(childNode.nodeName.indexOf('series') >= 0) {
						onEffectByChartSeries(childNode, shape);
					}
					else {
						switch(childNode.nodeName) {
						case "axis-x": shape.effectByChart.axisX = childNode.firstChild.data; break;
						case "label-x": shape.effectByChart.labelX = childNode.firstChild.data; break;
						case "label-y": shape.effectByChart.labelY = childNode.firstChild.data; break;
						case "unit": shape.effectByChart.unit = childNode.firstChild.data; break;
						}
					}
				}
			}

			let onEffectByGauge = function(xmlNode, shape) {
				let colorNode, opacity;
				shape.effectByGauge = {};
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
					case "tag": shape.effectByGauge.tag = childNode.firstChild.data; break;
					case "type": shape.effectByGauge.type = childNode.firstChild.data; break;
					case "color": colorNode = getColorNode(childNode); break;
					case "low": shape.effectByGauge.low = childNode.firstChild.data; break;
					case "high": shape.effectByGauge.high = childNode.firstChild.data; break;
					case "unit": shape.effectByGauge.unit = childNode.firstChild.data; break;
					case "niddle": shape.effectByGauge.niddle = childNode.firstChild.data == '0' ? false : true; break;
					case "opacity": opacity = Number(childNode.firstChild.data); break;
					}
				}

				if(colorNode.type == null)
					shape.effectByGauge.color = Common.getRGBA(colorNode.color, opacity / 255);
				else {
					colorNode.color = Common.getRGBA(colorNode.color, opacity / 255);
					colorNode.gradientColor = Common.getRGBA(colorNode.gradientColor, opacity / 255); 
					shape.effectByGauge.color = colorNode;
				}
			}


			let getColorNode = function(childNode) {
				let gradientColor = {}, pos = {}, degree = {};
				let fillRGB = Number(childNode.firstChild.data);
				let colorType = childNode.getAttribute('type'); 
				if(colorType != null) {
					gradientColor = Number(childNode.getAttribute('color')); 
					pos = Number(childNode.getAttribute('pos'));
					degree = Number(childNode.getAttribute('degree'));
					return { type:colorType, color : fillRGB, gradientColor:gradientColor, pos:pos, degree:degree }
				}
				else 
					return { color : fillRGB }
			}


			let onFillAttribute = function(xmlNode, shape) {
				let strImagePath = resourcesPath + "/";
				shape.fill = new Object();
				shape.fill.text ="";

				let colorNode = {}, fillOpacity = 0;
				for(let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;

					switch(childNode.nodeName) {
						case "fillColor": colorNode = getColorNode(childNode); break;
						case "fillOpacity": fillOpacity = Number(childNode.firstChild.data); break;
						case "text": 
							if(childNode.firstChild != null) shape.fill.string = childNode.firstChild.data; 
							break;
						case "image": 
							if(childNode.firstChild != null) {
								strImagePath = strImagePath + childNode.firstChild.data;
								shape.fill.bGIF = false;
								if(strImagePath.slice(-3).toLowerCase() == 'gif') 	{
									shape.fill.bGIF = true;
									shape.fill.image = new GIF(workspace_self.canvasManager.canvas);
									shape.fill.image.load(strImagePath);
								}
								else
									shape.fill.image = preLoader.loadImage(strImagePath);
							}
							break;
					}
				}

				if(colorNode.type == null)
					shape.fill.color = Common.getRGBA(colorNode.color, fillOpacity / 255);
				else {
					colorNode.color = Common.getRGBA(colorNode.color, fillOpacity / 255);
					colorNode.gradientColor = Common.getRGBA(colorNode.gradientColor, fillOpacity / 255); 
					shape.fill.color = colorNode;
				}
			}

			let onFontAttribute = function(xmlNode, shape) {
				shape.font = new Object();

				shape.font.fontFamily = "";
				shape.font.fontSize = 10;
				shape.font.fontStyle = 0;

				let colorNode = {}, textOpacity = 255;
				for(let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
						case "fontFamily": shape.font.fontFamily = childNode.firstChild.data; break;
						case "fontSize": shape.font.fontSize = Number(childNode.firstChild.data) * 1.8; break;
						case "textColor": colorNode = getColorNode(childNode); break; 
						case "textOpacity": textOpacity = Number(childNode.firstChild.data); break;
						case "fontStyle": shape.font.fontStyle = Number(childNode.firstChild.data); break;
						case "textAlignVert": shape.font.textAlignVert = Number(childNode.firstChild.data); break;
						case "textAlignHorz": shape.font.textAlignHorz = Number(childNode.firstChild.data); break;
						case "textDirection": shape.font.textDirection = Number(childNode.firstChild.data); break;
					}
				}

				if(colorNode.type == null)
					shape.font.color = Common.getRGBA(colorNode.color, textOpacity / 255);
				else {
					colorNode.color = Common.getRGBA(colorNode.color, textOpacity / 255);
					colorNode.gradientColor = Common.getRGBA(colorNode.gradientColor, textOpacity / 255); 
					shape.font.color = colorNode;
				}
			}

			let onLineAttribute = function(xmlNode, shape) {
				shape.line = new Object();
				shape.line.startSize = shape.line.endSize = 0;
				let colorNode = {}, lineOpacity = 0;
				for(let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
						case "lineColor": colorNode = getColorNode(childNode); break;
						case "lineOpacity": lineOpacity = Number(childNode.firstChild.data); break;
						case "lineWidth": shape.line.width = Number(childNode.firstChild.data); break;
						case "lineStyle": shape.line.style = Number(childNode.firstChild.data); break;
						case "lineRadius": shape.line.radius = Number(childNode.firstChild.data); break;
						case "lineStartCap": shape.line.startCap = Number(childNode.firstChild.data); break;
						case "lineEndCap": shape.line.endCap = Number(childNode.firstChild.data); break;
						case "lineStartSize": shape.line.startSize = Number(childNode.firstChild.data); break;
						case "lineEndSize": shape.line.endSize = Number(childNode.firstChild.data); break;
						case "lineDir": shape.line.dir = Number(childNode.firstChild.data); break;
					}
				}
				if(shape.line.dir === undefined) shape.line.dir = 1;

				if(colorNode.type == null)
					shape.line.color = Common.getRGBA(colorNode.color, lineOpacity / 255);
				else {
					colorNode.color = Common.getRGBA(colorNode.color, lineOpacity / 255);
					colorNode.gradientColor = Common.getRGBA(colorNode.gradientColor, lineOpacity / 255); 
					shape.line.color = colorNode;
				}
			}

			let onRoundAttribute = function(xmlNode, shape) {
				shape.shadow = new Object();
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
					case "type": shape.round.type = Number(childNode.firstChild.data); break;
					case "r": shape.round.r = Number(childNode.firstChild.data); break;
					}
				}
			}

			/*
			let onShadowAttribute = function(xmlNode, shape) {
				shape.shadow = new Object();
				for (let childNode of xmlNode.childNodes) {
					if(childNode.firstChild == null) continue;
					switch(childNode.nodeName) {
						case "shadowDirection": shape.shadow.direction = Number(childNode.firstChild.data); break;
						case "shadowColor": shape.shadow.color = Common.getRGBA(Number(childNode.firstChild.data), 1.0); break;
						case "shadowOffset": shape.shadow.offset = Number(childNode.firstChild.data); break;
					}
				}
			}
			*/

			let onGroupShape = function(xmlNode) {
				let shape = new Shape();

				shape.type = xmlNode.nodeName;
				onAttributes(xmlNode, shape);

				if(workspace_self.edit == true) Common.setFormatString(shape);
				 
				for(let childNode of xmlNode.childNodes) {
					if(childNode.nodeName == "#text") continue;
					if(shapeTypes.some((name) => name === childNode.nodeName) == false) continue;
					if(childNode.nodeName == 'line' && childNode.hasAttribute('name') != true) continue;


					let child = {};
					if(childNode.nodeName == "group") {
						child = onGroupShape(childNode);
					}
					else {
						child = new Shape();
						child.type = childNode.nodeName;
						onAttributes(childNode, child);
					}

					shape.children.push(child);
				}

				return shape;
			}

			let onShape = function(xmlNode) {
				let shape = new Shape();

				shape.type = xmlNode.nodeName;
				onAttributes(xmlNode, shape);

				if(workspace_self.edit == true) Common.setFormatString(shape);

				return shape;
			}

			let	parseRoot = function(xmlNode) {
				let slide = xmlNode.getAttribute('slide');
				shapeList.slide = false; 
				if(slide != null) shapeList.slide = slide == '1' ? true : false;
				shapeList.comment = xmlNode.getAttribute('comment');
				shapeList.width = Number(xmlNode.getAttribute('width'));
				shapeList.height = Number(xmlNode.getAttribute('height'));
				let gradientType = xmlNode.getAttribute('gradient-type');
				if(gradientType == null)
					shapeList.backColor = Common.getRGBA(Number(xmlNode.getAttribute('backColor')), 1);
				else {
					shapeList.backColor = {};
					shapeList.backColor.type = gradientType;
					shapeList.backColor.color = Common.getRGBA(Number(xmlNode.getAttribute('backColor')), 1);
					shapeList.backColor.gradientColor = Common.getRGBA(Number(xmlNode.getAttribute('gradient-color')), 1);
					shapeList.backColor.pos = Number(xmlNode.getAttribute('gradient-pos'));
					shapeList.backColor.degree = Number(xmlNode.getAttribute('gradient-degree'));
				}

				if(shapeList.comment == null) shapeList.comment = ''; 

				let backImage = xmlNode.getAttribute('backImage');
				if(backImage != null && backImage.length > 0) {
					shapeList.backImage = preLoader.loadImage(resourcesPath + "/" + backImage);
				}
			}

			let	parseXml = function(dom) {
				let root = dom.documentElement;
				parseRoot(root);

				let index = 0;
				for(let xmlNode of root.childNodes) {
					if(xmlNode.nodeName == "#text") continue;
					if(xmlNode.nodeName == "sql") continue;
					if(xmlNode.nodeName == "jsScript") {
						shapeList.script = xmlNode.firstChild.data;
						continue;
					}

					let shape = {};
					if(xmlNode.nodeName == "group") 
						shape = onGroupShape(xmlNode);
					else
						shape = onShape(xmlNode);

					shape.index = index++;
					shapeList.shapes.push(shape);
				}
			}

			let setRedraw = function(flag) {
				shapeList.setRedraw(flag);
			}

			let setTagValues = function() {
				for(let shape of shapeList.shapes) {
					if(typeof(shape.effectByValue) == 'undefined') continue;
					let val = tagValues[shape.effectByValue.tagName];
					if(typeof(val) != 'undefined') {
						if(typeof(val.val) != 'undefined') {
							let strVal = val.val;
							if(isNaN(strVal) == false) {
								strVal = Number(val.val).format(shape.effectByValue.decPos, shape.effectByValue.commaDelimeted);
							}
							if(shape.fill.text != strVal) shape.bDraw = true; 
							shape.fill.text = strVal;
						}
						else {
							let strVal = "???";
							if(typeof(shape.fill.text) == 'undefined' || shape.fill.text != strVal) shape.bDraw = true; 
							shape.fill.text = "???";
						}
					}
				}
			}

			let setValues = function(values) {
				let cov = new Array();
				for(let val of values) {
					let tag = Object.assign({}, val);
					tag.bCov = false;

					tag.val = tag.quality == 192 ? tag.val : '???';

					let prev = tagValues[tag.name];
					if(typeof(prev) != 'undefined') {
						if(prev.val != tag.val) {
							tag.bCov = true;
							cov.push(tag);
						}
					}
					tagValues[tag.name] = tag;
				}


				if(Object.keys(tagValues).length > 0){
					workspace_self.onValueChanged(tagValues);
				}

				setTagValues();
			}

			let makeLayoutXml = function() {
				let dom = new DOMParser();
				let doc = dom.parseFromString('<BizNexus/>', 'text/xml');
				let root = doc.firstChild;
				let pi = doc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
				doc.insertBefore(pi, doc.firstChild);

				writeXmlRoot(root);
				writeXmlShapes(doc, root);
				writeXmlScript(doc, root);

				let serializer = new XMLSerializer();
				return serializer.serializeToString(doc);
			}

			let writeXmlRoot = function(root) {
				root.setAttribute('slide', shapeList.slide == true ? 1 : 0);
				root.setAttribute('comment', shapeList.comment);
				root.setAttribute('width', shapeList.width);
				root.setAttribute('height', shapeList.height);
				if(shapeList.backColor.type === undefined)
					root.setAttribute('backColor', Common.rgbToHex(shapeList.backColor));
				else {
					root.setAttribute('backColor', Common.rgbToHex(shapeList.backColor.color));
					root.setAttribute('gradient-type', shapeList.backColor.type);
					root.setAttribute('gradient-color', Common.rgbToHex(shapeList.backColor.gradientColor));
					root.setAttribute('gradient-pos', shapeList.backColor.pos);
					root.setAttribute('gradient-degree', shapeList.backColor.degree);
				}
				if(shapeList.backImage !== undefined) 
					root.setAttribute('backImage', shapeList.backImage.src.substring(shapeList.backImage.src.lastIndexOf('/') + 1));
			}

			let writeXmlScript = function(doc, root) {
				if(typeof(shapeList.script) != 'undefined') {
					let node = doc.createElement('jsScript');
					node.appendChild(doc.createCDATASection(shapeList.script));
					root.appendChild(node);
				}
			}

			let writeXmlShapes = function(doc, root) {
				let appendAndSetNode = function(doc, node, name, val) {
					let element = doc.createElement(name);
					element.textContent = val;
					node.appendChild(element);

					return element;
				}

				let createNode = function(doc, parent, name, func) {
					let node = doc.createElement(name);
					parent.appendChild(node);
					return {
						set : function(func, shape) {
							func(node, shape);
						}
					}
				}

				let setAttribute = function(node, shape) {
					node.setAttribute('name', shape.name);
					node.setAttribute('sub', shape.sub);
					node.setAttribute('left', shape.left);
					node.setAttribute('height', shape.height);
					node.setAttribute('top', shape.top);
					node.setAttribute('width', shape.width);
					node.setAttribute('rotateAngle', shape.rotate);
					node.setAttribute('flipVert', shape.flipVert);
					node.setAttribute('flipHorz', shape.flipHorz);
				}

				let setColorNode = function(doc, node, color, nodeColor, nodeOpacity ) { 
					if(color.type === undefined) {
						appendAndSetNode(doc, node, nodeColor, Common.rgbToHex(color));
						appendAndSetNode(doc, node, nodeOpacity, Common.getAlpha(color));
					}
					else {
						let element = doc.createElement(nodeColor);
						element.innerHTML = Common.rgbToHex(color.color);
						element.setAttribute('type', color.type);
						element.setAttribute('color', Common.rgbToHex(color.gradientColor));
						element.setAttribute('pos', color.pos);
						element.setAttribute('degree', color.degree);

						node.appendChild(element);

						appendAndSetNode(doc, node, nodeOpacity, Common.getAlpha(color.color));
					}
				}

				let setEffectByBlink = function(effectByBlink, shape) {
					appendAndSetNode(doc, effectByBlink, 'tagName', shape.effectByBlink.tagName );
					appendAndSetNode(doc, effectByBlink, 'operSymbol', shape.effectByBlink.oper);
					appendAndSetNode(doc, effectByBlink, 'operValue', shape.effectByBlink.val);
				}

				let setEffectByMouse = function(effectByMouse, shape) {
					appendAndSetNode(doc, effectByMouse, 'event', shape.effectByMouse.event);
					appendAndSetNode(doc, effectByMouse, 'panel', shape.effectByMouse.panel);
					appendAndSetNode(doc, effectByMouse, 'position', shape.effectByMouse.position);
				}

				let setEffectByColorlist = function(effectByColorlistNode, shape) {
					appendAndSetNode(doc, effectByColorlistNode, 'tagName', shape.effectByColorlist.tagName );
					appendAndSetNode(doc, effectByColorlistNode, 'dataType', typeof(shape.effectByColorlist.dataType) == 'undefined' ? '' : shape.effectByColorlist.dataType);
					appendAndSetNode(doc, effectByColorlistNode, 'category', shape.effectByColorlist.category);

					for(let list of shape.effectByColorlist.colorList) {
						let node = appendAndSetNode(doc, effectByColorlistNode, 'color', Common.rgbToHex(list.color));
						node.setAttribute('operValue', list.operValue);
						node.setAttribute('operSymbol', list.operSymbol);
					}
				}

				let setEffectByImagelist = function(effectByImagelistNode, shape) {
					appendAndSetNode(doc, effectByImagelistNode, 'tagName', shape.effectByImagelist.tagName );
					appendAndSetNode(doc, effectByImagelistNode, 'dataType', typeof(shape.effectByImagelist.dataType) == 'undefined' ? '' : shape.effectByImagelist.dataType);

					for(let list of shape.effectByImagelist.imageList) {
						let node = appendAndSetNode(doc, effectByImagelistNode, 'image', list.image.src.substring(list.image.src.lastIndexOf('/') + 1));
						node.setAttribute('operValue', list.operValue);
						node.setAttribute('operSymbol', list.operSymbol);
					}
				}

				let setEffectByFill = function(effectByFillNode, shape) {
					appendAndSetNode(doc, effectByFillNode, 'tagName', shape.effectByFill.tagName );
					appendAndSetNode(doc, effectByFillNode, 'direction', shape.effectByFill.direction );
					appendAndSetNode(doc, effectByFillNode, 'minValue', shape.effectByFill.min );
					appendAndSetNode(doc, effectByFillNode, 'maxValue', shape.effectByFill.max );
				}

				let setEffectByLink = function(effectByLinkNode, shape) {
					appendAndSetNode(doc, effectByLinkNode, 'link', shape.effectByLink.link );
				}

				let setEffectByValue = function(effectByValueNode, shape) {
					appendAndSetNode(doc, effectByValueNode, 'tagName', shape.effectByValue.tagName );
					appendAndSetNode(doc, effectByValueNode, 'prefix', typeof(shape.effectByValue.prefix) == 'undefined' ? '' : shape.effectByValue.prefix);
					appendAndSetNode(doc, effectByValueNode, 'unit', typeof(shape.effectByValue.unitName) == 'undefined' ? '' : shape.effectByValue.unitName);;
					appendAndSetNode(doc, effectByValueNode, 'decPos', shape.effectByValue.decPos);
					appendAndSetNode(doc, effectByValueNode, 'commaDelimited', shape.effectByValue.commaDelimeted == true ? 1 :0);
					appendAndSetNode(doc, effectByValueNode, 'length', shape.effectByValue.length);
				}

				let setEffectByToggleImage = function(effectByToggleImageNode, shape) {
					let idx = 1;
					for(let state of shape.effectByToggleImage.states) {
						let node = doc.createElement('state' + idx++);

						appendAndSetNode(doc, node, 'state', state.state);
						appendAndSetNode(doc, node, 'link', state.link);
						effectByToggleImageNode.appendChild(node);
					}
				}

				let setEffectBySwitch = function(effectBySwitchNode, shape) {
					appendAndSetNode(doc, effectBySwitchNode, 'control', shape.effectBySwitch.control );
					appendAndSetNode(doc, effectBySwitchNode, 'status', shape.effectBySwitch.status );

					let states = '';
					for(let state of shape.effectBySwitch.states) {
						if(states.length > 0)states += ','; 
						states += state;
					}
					appendAndSetNode(doc, effectBySwitchNode, 'states', states );
				}

				let setEffectByChart = function(effectByCharthNode, shape) {
					appendAndSetNode(doc, effectByCharthNode, 'label-x', shape.effectByChart.labelX );
					appendAndSetNode(doc, effectByCharthNode, 'label-y', shape.effectByChart.labelY );
					appendAndSetNode(doc, effectByCharthNode, 'unit', shape.effectByChart.unit );
					appendAndSetNode(doc, effectByCharthNode, 'axis-x', shape.effectByChart.axisX );

					let idx = 1;
					for(let option of shape.effectByChart.options) {
						let node = doc.createElement('series' + idx++);

						appendAndSetNode(doc, node, 'type', option.type);
						appendAndSetNode(doc, node, 'tag', option.tag);
						setColorNode(doc, node, option.color, 'color', 'opacity');
						//appendAndSetNode(doc, node, 'color', Common.rgbToHex(option.color));
						appendAndSetNode(doc, node, 'display-value', Number(option.displayValue));
						effectByCharthNode.appendChild(node);
					}
				}

				let setEffectByGauge = function(effectByGaugeNode, shape) {
					appendAndSetNode(doc, effectByGaugeNode, 'tag', shape.effectByGauge.tag );
					appendAndSetNode(doc, effectByGaugeNode, 'type', shape.effectByGauge.type );
					setColorNode(doc, effectByGaugeNode, shape.effectByGauge.color, 'color', 'opacity');
					appendAndSetNode(doc, effectByGaugeNode, 'low', Number(shape.effectByGauge.low) );
					appendAndSetNode(doc, effectByGaugeNode, 'high', Number(shape.effectByGauge.high) );
					appendAndSetNode(doc, effectByGaugeNode, 'unit', shape.effectByGauge.unit );
					appendAndSetNode(doc, effectByGaugeNode, 'niddle', Number(shape.effectByGauge.niddle) );
				}


				let setFontNode = function(fontNode, shape) {
					appendAndSetNode(doc, fontNode, 'fontFamily', shape.font.fontFamily );
					appendAndSetNode(doc, fontNode, 'fontSize', shape.font.fontSize / 1.8 );
					setColorNode(doc, fontNode, shape.font.color, 'textColor', 'textOpacity');
					appendAndSetNode(doc, fontNode, 'fontStyle', shape.font.fontStyle );
					appendAndSetNode(doc, fontNode, 'textAlignVert', shape.font.textAlignVert );
					appendAndSetNode(doc, fontNode, 'textAlignHorz', shape.font.textAlignHorz );
					appendAndSetNode(doc, fontNode, 'textDirection', shape.font.textDirection );
				}

				let setFillNode = function(fillNode, shape) {
					setColorNode(doc, fillNode, shape.fill.color, 'fillColor', 'fillOpacity');
					appendAndSetNode(doc, fillNode, 'text', shape.fill.string === undefined ? '' : shape.fill.string);
					if(shape.effectByToggleImage === undefined && shape.effectBySwitch === undefined && shape.fill.image !== undefined)
						appendAndSetNode(doc, fillNode, 'image', shape.fill.image.src.substring(shape.fill.image.src.lastIndexOf('/') + 1));
					else
						appendAndSetNode(doc, fillNode, 'image', '');
				}

				let setLineNode = function(lineNode, shape) {
					setColorNode(doc, lineNode, shape.line.color, 'lineColor', 'lineOpacity');
					appendAndSetNode(doc, lineNode, 'lineWidth', shape.line.width);
					appendAndSetNode(doc, lineNode, 'lineRadius', shape.line.radius);
					appendAndSetNode(doc, lineNode, 'lineStyle', shape.line.style);
					appendAndSetNode(doc, lineNode, 'lineStartCap', shape.line.startCap);
					appendAndSetNode(doc, lineNode, 'lineEndCap', shape.line.endCap);
					appendAndSetNode(doc, lineNode, 'lineStartSize', shape.line.startSize);
					appendAndSetNode(doc, lineNode, 'lineEndSize', shape.line.endSize);
					appendAndSetNode(doc, lineNode, 'lineDir', shape.line.dir);
				}

				/*
				let setShadowNode = function(shadowNode, shape) {
					appendAndSetNode(doc, shadowNode, 'shadowColor', Common.rgbToHex(shape.shadow.color));
					appendAndSetNode(doc, shadowNode, 'shadowDirection', shape.shadow.direction);
					appendAndSetNode(doc, shadowNode, 'shadowOffset',shape.shadow.offset);
				}
				*/

				let setRoundNode = function(roundNode, shape) {
					appendAndSetNode(doc, roundNode, 'type', shape.round.type);
					appendAndSetNode(doc, roundNode, 'r',shape.round.r);
				}


				let setNode = function(doc, node, shape) {
					createNode(doc, node, 'font').set(setFontNode, shape);
					createNode(doc, node, 'line').set(setLineNode, shape);
					createNode(doc, node, 'fill').set(setFillNode, shape);
					//createNode(doc, node, 'shadow').set(setShadowNode, shape);
					createNode(doc, node, 'round').set(setRoundNode, shape);
					if(shape.effectByBlink !== undefined) createNode(doc, node, 'effectByBlink').set(setEffectByBlink, shape);
					if(shape.effectByColorlist !== undefined) createNode(doc, node, 'effectByColorlist').set(setEffectByColorlist, shape);
					if(shape.effectByImagelist !== undefined) createNode(doc, node, 'effectByImagelist').set(setEffectByImagelist, shape);
					if(shape.effectByLink !== undefined) createNode(doc, node, 'effectByLink').set(setEffectByLink, shape);
					if(shape.effectByFill !== undefined) createNode(doc, node, 'effectByFill').set(setEffectByFill, shape);
					if(shape.effectByMouse !== undefined) createNode(doc, node, 'effectByMouse').set(setEffectByMouse, shape);
					if(shape.effectByValue !== undefined) createNode(doc, node, 'effectByValue').set(setEffectByValue, shape);
					if(shape.effectByToggleImage !== undefined) createNode(doc, node, 'effectByToggleImage').set(setEffectByToggleImage, shape);
					if(shape.effectBySwitch !== undefined) createNode(doc, node, 'effectBySwitch').set(setEffectBySwitch, shape);
					if(shape.effectByChart !== undefined) createNode(doc, node, 'effectByChart').set(setEffectByChart, shape);
					if(shape.effectByGauge !== undefined) createNode(doc, node, 'effectByGauge').set(setEffectByGauge, shape);
				}

				let setGroupNode = function(doc, node, shape) {
					for(let obj of shape.children) {
						let childNode = doc.createElement(obj.type);
						if(obj.type == 'group') setGroupNode(doc, childNode, obj);
						setAttribute(childNode, obj);
						setNode(doc, childNode, obj);
						node.appendChild(childNode);
					}
				}

				for(let shape of shapeList.shapes) {
					shape.modified = false;
					let node = doc.createElement(shape.type);
					setAttribute(node, shape);
					if(shape.type == 'group') setGroupNode(doc, node, shape)
					setNode(doc, node, shape);

					root.appendChild(node);
				}
			}

			return {
				addTag : function(tagName) {
					if(tagList.indexOf(tagName) == -1) {
						tagList.push(tagName);
					}
				},
				deleteShape : deleteShape,
				deleteShapes : deleteShapes,
				insertShape: insertShape,
				updateShape : updateShape,
				group: group,
				ungroup : ungroup,
				reorderShapes : reorderShapes,
				getShapeList : function() {
					return shapeList;
				},
				refreshShapeNames : refreshShapeNames,
				getTagList : function() {
					return tagList;
				},
				getTagValues : function() {
					return tagValues;
				},
				loadLayout : function(fileName, onSuccess) {
					let addTagPanel = function() {
						let tagPanel = new Shape();
						tagPanel.type = "rectangle";
						tagPanel.name = '$TAG';
						tagPanel.x = tagPanel.y = 200;
						tagPanel.cx = 150;
						tagPanel.cy = 60;
						tagPanel.fill.color = { type: 'linear-gradient', color:'rgba(244,244,168,1)', gradientColor:'rgba(244,244, 63,1)', pos:1, degree:60 };
						tagPanel.line.color = 'rgba(200, 200, 200, 1)';
						tagPanel.line.width = 1;
						tagPanel.font.textAlignHorz = 0;
						tagPanel.font.fontSize = 16;
						tagPanel.round = { r:10, round:10, type:1 };
						tagPanel.visible = false;

						shapeList.shapes.push(tagPanel);
					}

					tagValues = new Array();
					shapeList = new ShapeList();
					let idx = fileName.lastIndexOf(".");
					if(idx != -1)
						resourcesPath = fileName.substr(0, idx) + ".resources";

					preLoader.onLoadComplete = function() { 
						tagList = shapeList.getTagList();

						workspace_self.bInit = true;
						workspace_self.scriptManager.init(shapeList.script);
						workspace_self.scriptManager.run([]);
						if(workspace_self.edit == true) {
							workspace_self.undo = new Array();
							workspace_self.redo = new Array();
							workspace_self.onChange('undo', workspace_self.undo);
							workspace_self.onChange('redo', workspace_self.redo);
						}
						else {
							// 마우스 이벤트 효과가 있는 객체와 연결된 Shape은 visibile을 false로 처리한다.
							for(let shape of shapeList.shapes) {
								if(shape.effectByMouse !== undefined)	{
									if(shape.effectByMouse.panel[0] == '$') continue;
									let shapeNames = workspace_self.shapeManager.getShapeList().shapeNames;
									if(shapeNames[shape.effectByMouse.panel]){
										shapeNames[shape.effectByMouse.panel].visible = false;
									}
								}
							}

							// 태그정보 표시를 위한 패널 추가한다.
							addTagPanel();
						}
						onSuccess(shapeList);
					}

					preLoader.init();
					loadLayout(fileName);
				},
				makeLayoutXml : makeLayoutXml,
				setRedraw : setRedraw,
				setValues : setValues
			}
		}

		function TagManager() {
			let tagInfo = [];
			let init = function() {
				var req = new Object();
				req.cmd = "selectTags";
				req.param = new Object();
				req.param.category = SELECT_CATEGORY.BY_NAME;
				req.param.val = "";

				postMessage("/req-tag", req, function(tagList) {
					tagInfo = [];
					for(let tag of tagList) tagInfo[tag.name] = tag;
				});
			}

			let find = function(tagName) {
				return tagInfo[tagName];
			}

			return {
				init : init,
				find : find
			}
		}

		function ValueManager() {
			let postValues = function(cmd, reqData, onValues) {
				return new Promise((resolve, reject) => {
					$.ajax ( {
						type: 'POST',
						contentType: 'application/json; charset=UTF-8',
						url: '/req-tag',
						dataType: 'json',
						cache : false,
						data: reqData,
						success: function (obj) {
							switch(obj.cmd) {
							case "reqValues" : 
								onValues(obj.param); 
								break;
							case "fetchValues" : // 트렌드 용도
								break; 
							default:
								// console.log(obj);
								;
							}
							resolve();
						},
						error: function (request, status, error) {
							console.log("Error" + "[" + status + "]" + error);
							reject();
						}
					});
				});
			}

			let	reqValues = function(tagList, onValues) {
				if(tagList.length > 0) {
					let obj = new Object();
					obj.cmd = "reqValues";
					obj.param = {};
					obj.param.tagList = tagList;

					postValues(obj.cmd, JSON.stringify(obj), onValues);
				}
			}

			return {
				reqValues : function(tagList, onValues) {
					reqValues(tagList, onValues);
				}
			}
		}
	}

	$.fn.bizRender = function(config, val1, val2) {
		let ret;

		this.each(function() {
			var $element = $(this),
				instance = $element.data(BIZRENDER_DATA_KEY);

			if(typeof(instance) == 'undefined') {
				let workspace = new Workspace();
				workspace.init($element, config);

				window.addEventListener("resize", workspace.onSize);
				window.addEventListener("keydown", function(e) {
					//if(e.key == 'ArrowDown' || e.key == 'ArrowUp' || e.key == 'ArrowLeft' || e.key == 'ArrowRight' ) e.preventDefault(); 
					if(e.key == 'ArrowDown' || e.key == 'ArrowUp' ) e.preventDefault(); 
					if($(e.srcElement)[0].tagName == 'BODY') workspace.onKeyDown(e); 
				});

				window.addEventListener("keyup", function(e) { 
					e.preventDefault(); 
					if($(e.srcElement)[0].tagName == 'BODY') workspace.onKeyUp(e); 
				});

				if(workspace.edit == false) workspace.tagManager.init();

			} 
			else {
				switch(config) {
				case "createShape" : instance.createShape(val1, val2); break;
				case "doIt" : ret = instance.doIt(val1); break;
				case "get" : ret = instance.get(val1); break;
				case "getRoot" : ret = instance.getRoot(); break;
				case "loadLayout" : instance.loadLayout(val1, val2); break; 
				case "makeLayoutXml": ret = instance.makeLayoutXml(); break;
				case "recalcLayout" : instance.recalcLayout(val1); break;
				case "reorderLayout" : instance.reorderLayout(val1); break;
				case "selectedShapes" : ret = instance.selectedShapes(); break;
				case "setGroup" : ret = instance.setGroup(val1); break;
				case "setRoot" : instance.setRoot(val1); break;
				case "updateShapes" : instance.updateShapes(val1); break;
				case "onSize" : instance.onSize(); break;
				}
			}
		});

		return ret;
	};

	window.bizRender = {
		version: '1.1.0'
	};
}(window, jQuery));


const GIF = function () {
	// **NOT** for commercial use.
	var timerID;						// timer handle for set time out
										// usage
	var st;								// holds the stream object when
										// loading.
	var interlaceOffsets = [0, 4, 2, 1]; // used in de-interlacing.
	var interlaceSteps	= [8, 8, 4, 2];
	var interlacedBufSize; // this holds a buffer to de interlace. Created on
							// the first frame and when size changed
	var deinterlaceBuf;
	var pixelBufSize;	// this holds a buffer for pixels. Created on the
							// first frame and when size changed
	var pixelBuf;
	const GIF_FILE = { // gif file data headers
		GCExt 	: 0xF9,
		COMMENT : 0xFE,
		APPExt 	: 0xFF,
		UNKNOWN : 0x01, // not sure what this is but need to skip it in parser
		IMAGE : 0x2C,
		EOF	 : 59, // This is entered as decimal
		EXT	 : 0x21,
	};
	// simple buffered stream used to read from the file
	var Stream = function (data) { 
		this.data = new Uint8ClampedArray(data);
		this.pos = 0;
		var len = this.data.length;
		this.getString = function (count) { // returns a string from current pos
											// of len count
			var s = "";
			while (count--) { s += String.fromCharCode(this.data[this.pos++]) }
			return s;
		};
		this.readSubBlocks = function () { // reads a set of blocks as a string
			var size, count, data = "";
			do {
				count = size = this.data[this.pos++];
				while (count--) { data += String.fromCharCode(this.data[this.pos++]) }
			} while (size !== 0 && this.pos < len);
			return data;
		}
		this.readSubBlocksB = function () { // reads a set of blocks as binary
			var size, count, data = [];
			do {
				count = size = this.data[this.pos++];
				while (count--) { data.push(this.data[this.pos++]);}
			} while (size !== 0 && this.pos < len);
			return data;
		}
	};
	// LZW decoder uncompressed each frames pixels
	// this needs to be optimised.
	// minSize is the min dictionary as powers of two
	// size and data is the compressed pixels
	function lzwDecode(minSize, data) {
		var i, pixelPos, pos, clear, eod, size, done, dic, code, last, d, len;
		pos = pixelPos = 0;
		dic	 = [];
		clear	= 1 << minSize;
		eod	 = clear + 1;
		size	 = minSize + 1;
		done	 = false;
		while (!done) { // JavaScript optimisers like a clear exit though I
						// never use 'done' apart from fooling the optimiser
			last = code;
			code = 0;
			for (i = 0; i < size; i++) {
				if (data[pos >> 3] & (1 << (pos & 7))) { code |= 1 << i }
				pos++;
			}
			if (code === clear) { // clear and reset the dictionary
				dic = [];
				size = minSize + 1;
				for (i = 0; i < clear; i++) { dic[i] = [i] }
				dic[clear] = [];
				dic[eod] = null;
			} else {
				if (code === eod) { done = true; return }
				if (code >= dic.length) { dic.push(dic[last].concat(dic[last][0])) }
				else if (last !== clear) { dic.push(dic[last].concat(dic[code][0])) }
				d = dic[code];
				len = d.length;
				for (i = 0; i < len; i++) { pixelBuf[pixelPos++] = d[i] }
				if (dic.length === (1 << size) && size < 12) { size++ }
			}
		}
	};
	function parseColourTable(count) { // get a colour table of length count
										// Each entry is 3 bytes, for RGB.
		var colours = [];
		for (var i = 0; i < count; i++) { colours.push([st.data[st.pos++], st.data[st.pos++], st.data[st.pos++]]) }
		return colours;
	}
	function parse (){		// read the header. This is the starting point
								// of the decode and async calls parseBlock
		var bitField;
		st.pos				+= 6;
		gif.width			 = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
		gif.height			 = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
		bitField			 = st.data[st.pos++];
		gif.colorRes		 = (bitField & 0b1110000) >> 4;
		gif.globalColourCount = 1 << ((bitField & 0b111) + 1);
		gif.bgColourIndex	 = st.data[st.pos++];
		st.pos++;					// ignoring pixel aspect ratio. if not
										// 0, aspectRatio = (pixelAspectRatio +
										// 15) / 64
		if (bitField & 0b10000000) { gif.globalColourTable = parseColourTable(gif.globalColourCount) } // global
																										// colour
																										// flag
		setTimeout(parseBlock, 0);
	}
	function parseAppExt() { // get application specific data. Netscape added
								// iterations and terminator. Ignoring that
		st.pos += 1;
		if ('NETSCAPE' === st.getString(8)) { st.pos += 8 } // ignoring this
																// data.
																// iterations
																// (word) and
																// terminator
																// (byte)
		else {
			st.pos += 3;			// 3 bytes of string usually "2.0" when
									// identifier is NETSCAPE
			st.readSubBlocks();	 // unknown app extension
		}
	};
	function parseGCExt() { // get GC data
		var bitField;
		st.pos++;
		bitField			 = st.data[st.pos++];
		gif.disposalMethod	= (bitField & 0b11100) >> 2;
		gif.transparencyGiven = bitField & 0b1 ? true : false; // ignoring bit
																// two that is
																// marked as
																// userInput???
		gif.delayTime		 = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
		gif.transparencyIndex = st.data[st.pos++];
		st.pos++;
	};
	function parseImg() {						 // decodes image data to
													// create the indexed pixel
													// image
		var deinterlace, frame, bitField;
		deinterlace = function (width) {				 // de interlace
															// pixel data if
															// needed
			var lines, fromLine, pass, toline;
			lines = pixelBufSize / width;
			fromLine = 0;
			if (interlacedBufSize !== pixelBufSize) {	 // create the buffer
															// if size changed
															// or undefined.
				deinterlaceBuf = new Uint8Array(pixelBufSize);
				interlacedBufSize = pixelBufSize;
			}
			for (pass = 0; pass < 4; pass++) {
				for (toLine = interlaceOffsets[pass]; toLine < lines; toLine += interlaceSteps[pass]) {
					deinterlaceBuf.set(pixelBuf.subArray(fromLine, fromLine + width), toLine * width);
					fromLine += width;
				}
			}
		};
		frame				= {}
		gif.frames.push(frame);
		frame.disposalMethod = gif.disposalMethod;
		frame.time		 = gif.length;
		frame.delay		 = gif.delayTime * 10;
		gif.length		 += frame.delay;
		if (gif.transparencyGiven) { frame.transparencyIndex = gif.transparencyIndex }
		else { frame.transparencyIndex = undefined }
		frame.leftPos = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
		frame.topPos = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
		frame.width = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
		frame.height = (st.data[st.pos++]) + ((st.data[st.pos++]) << 8);
		bitField	 = st.data[st.pos++];
		frame.localColourTableFlag = bitField & 0b10000000 ? true : false; 
		if (frame.localColourTableFlag) { frame.localColourTable = parseColourTable(1 << ((bitField & 0b111) + 1)) }
		if (pixelBufSize !== frame.width * frame.height) { // create a pixel
															// buffer if not yet
															// created or if
															// current frame
															// size is different
															// from previous
			pixelBuf	 = new Uint8Array(frame.width * frame.height);
			pixelBufSize = frame.width * frame.height;
		}
		lzwDecode(st.data[st.pos++], st.readSubBlocksB()); // decode the pixels
		if (bitField & 0b1000000) {						// de interlace if
															// needed
			frame.interlaced = true;
			deinterlace(frame.width);
		} else { frame.interlaced = false }
		processFrame(frame);							  // convert to canvas
															// image
	};
	function processFrame(frame) { // creates a RGBA canvas image from the
									// indexed pixel data.
		var ct, cData, dat, pixCount, ind, useT, i, pixel, pDat, col, frame, ti;
		frame.image		= document.createElement('canvas');
		frame.image.width = gif.width;
		frame.image.height = gif.height;
		frame.image.ctx	= frame.image.getContext("2d");
		ct = frame.localColourTableFlag ? frame.localColourTable : gif.globalColourTable;
		if (gif.lastFrame === null) { gif.lastFrame = frame }
		useT = (gif.lastFrame.disposalMethod === 2 || gif.lastFrame.disposalMethod === 3) ? true : false;
		if (!useT) { frame.image.ctx.drawImage(gif.lastFrame.image, 0, 0, gif.width, gif.height) }
		cData = frame.image.ctx.getImageData(frame.leftPos, frame.topPos, frame.width, frame.height);
		ti = frame.transparencyIndex;
		dat = cData.data;
		if (frame.interlaced) { pDat = deinterlaceBuf }
		else { pDat = pixelBuf }
		pixCount = pDat.length;
		ind = 0;
		for (i = 0; i < pixCount; i++) {
			pixel = pDat[i];
			col = ct[pixel];
			if (ti !== pixel) {
				dat[ind++] = col[0];
				dat[ind++] = col[1];
				dat[ind++] = col[2];
				dat[ind++] = 255;	 // Opaque.
			} else
				if (useT) {
					dat[ind + 3] = 0; // Transparent.
					ind += 4;
				} else { ind += 4 }
		}
		frame.image.ctx.putImageData(cData, frame.leftPos, frame.topPos);
		gif.lastFrame = frame;
		if (!gif.waitTillDone && typeof gif.onload === "function") { doOnloadEvent() }// if !waitTillDone the call onload now after first frame is loaded
	};
	// **NOT** for commercial use.
	function finnished() { // called when the load has completed
		gif.loading		  = false;
		gif.frameCount		= gif.frames.length;
		gif.lastFrame		 = null;
		st					= undefined;
		gif.complete		 = true;
		gif.disposalMethod	= undefined;
		gif.transparencyGiven = undefined;
		gif.delayTime		 = undefined;
		gif.transparencyIndex = undefined;
		gif.waitTillDone	 = undefined;
		pixelBuf			 = undefined; // dereference pixel buffer
		deinterlaceBuf		= undefined; // dereference interlace buff (may or may not be used);
		pixelBufSize		 = undefined;
		deinterlaceBuf		= undefined;
		gif.currentFrame	 = 0;
		if (gif.frames.length > 0) { gif.image = gif.frames[0].image }
		doOnloadEvent();
		if (typeof gif.onloadall === "function") {
			(gif.onloadall.bind(gif))({ type : 'loadall', path : [gif] });
		}
		if (gif.playOnLoad) { gif.play() }
	}
	function canceled () { // called if the load has been cancelled
		finnished();
		if (typeof gif.cancelCallback === "function") { (gif.cancelCallback.bind(gif))({ type : 'canceled', path : [gif] }) }
	}
	function parseExt() {			 // parse extended blocks
		const blockID = st.data[st.pos++];
		if(blockID === GIF_FILE.GCExt) { parseGCExt() }
		else if(blockID === GIF_FILE.COMMENT) { gif.comment += st.readSubBlocks() }
		else if(blockID === GIF_FILE.APPExt) { parseAppExt() }
		else {
			if(blockID === GIF_FILE.UNKNOWN) { st.pos += 13; } // skip unknow block
			st.readSubBlocks();
		}

	}
	function parseBlock() { // parsing the blocks
		if (gif.cancel !== undefined && gif.cancel === true) { canceled(); return }

		const blockId = st.data[st.pos++];
		if(blockId === GIF_FILE.IMAGE ){ // image block
			parseImg();
			if (gif.firstFrameOnly) { finnished(); return }
		}else if(blockId === GIF_FILE.EOF) { finnished(); return }
		else { parseExt() }
		if (typeof gif.onprogress === "function") {
			gif.onprogress({ bytesRead : st.pos, totalBytes : st.data.length, frame : gif.frames.length });
		}
		setTimeout(parseBlock, 0); // parsing frame async so processes can get some time in.
	};
	function cancelLoad(callback) { // cancels the loading. This will cancel the load before the next frame is decoded
		if (gif.complete) { return false }
		gif.cancelCallback = callback;
		gif.cancel		 = true;
		return true;
	}
	function error(type) {
		if (typeof gif.onerror === "function") { (gif.onerror.bind(this))({ type : type, path : [this] }) }
		gif.onload = gif.onerror = undefined;
		gif.loading = false;
	}
	function doOnloadEvent() { // fire onload event if set
		gif.currentFrame = 0;
		gif.nextFrameAt = gif.lastFrameAt = new Date().valueOf(); // just sets the time now
		if (typeof gif.onload === "function") { (gif.onload.bind(gif))({ type : 'load', path : [gif] }) }
		gif.onerror = gif.onload = undefined;
	}
	function dataLoaded(data) { // Data loaded create stream and parse
		st = new Stream(data);
		parse();
	}
	function loadGif(filename) { // starts the load
		var ajax = new XMLHttpRequest();
		ajax.responseType = "arraybuffer";
		ajax.onload = function (e) {
			if (e.target.status === 404) { error("File not found") }
			else if(e.target.status >= 200 && e.target.status < 300 ) { dataLoaded(ajax.response) }
			else { error("Loading error : " + e.target.status) }
		};
		ajax.open('GET', filename, true);
		ajax.send();
		ajax.onerror = function (e) { error("File error") };
		this.src = filename;
		this.loading = true;
	}
	function play() { // starts play if paused
		if (!gif.playing) {
			gif.paused = false;
			gif.playing = true;
			playing();
		}
	}
	function pause() { // stops play
		gif.paused = true;
		gif.playing = false;
		clearTimeout(timerID);
	}
	function togglePlay(){
		if(gif.paused || !gif.playing){ gif.play() }
		else{ gif.pause() }
	}
	function seekFrame(frame) { // seeks to frame number.
		clearTimeout(timerID);
		gif.currentFrame = frame % gif.frames.length;
		if (gif.playing) { playing() }
		else { gif.image = gif.frames[gif.currentFrame].image }
	}
	function seek(time) { // time in Seconds // seek to frame that would be displayed at time
		clearTimeout(timerID);
		if (time < 0) { time = 0 }
		time *= 1000; // in ms
		time %= gif.length;
		var frame = 0;
		while (time > gif.frames[frame].time + gif.frames[frame].delay && frame < gif.frames.length) { frame += 1 }
		gif.currentFrame = frame;
		if (gif.playing) { playing() }
		else { gif.image = gif.frames[gif.currentFrame].image}
	}
	function playing() {
		var delay;
		var frame;
		if (gif.playSpeed === 0) {
			gif.pause();
			return;
		} else {
			if (gif.playSpeed < 0) {
				gif.currentFrame -= 1;
				if (gif.currentFrame < 0) {gif.currentFrame = gif.frames.length - 1 }
				frame = gif.currentFrame;
				frame -= 1;
				if (frame < 0) { frame = gif.frames.length - 1 }
				delay = -gif.frames[frame].delay * 1 / gif.playSpeed;
			} else {
				gif.currentFrame += 1;
				gif.currentFrame %= gif.frames.length;
				delay = gif.frames[gif.currentFrame].delay * 1 / gif.playSpeed;
			}
			gif.image = gif.frames[gif.currentFrame].image;
			timerID = setTimeout(playing, delay);
		}
	}
	var gif = {					 // the gif image object
		onload		 : null,	 // fire on load. Use waitTillDone = true to have load fire at end or false to fire on first frame
		onerror		: null,		 // fires on error
		onprogress	 : null,	 // fires a load progress event
		onloadall	 : null,	 // event fires when all frames have loaded and gif is ready
		paused		 : false,	 // true if paused
		playing		: false,	 // true if playing
		waitTillDone  : true,	 // If true onload will fire when all frames loaded, if false, onload will fire when first frame has loaded
		loading		: false,	 // true if still loading
		firstFrameOnly : false,	 // if true only load the first frame
		width		 : null,	 // width in pixels
		height		 : null,	 // height in pixels
		frames		 : [],		 // array of frames
		comment		: "",		 // comments if found in file. Note I remember that some gifs have comments per frame if so this will be all comment concatenated
		length		 : 0,		 // gif length in ms (1/1000 second)
		currentFrame  : 0,		 // current frame.
		frameCount	 : 0,		 // number of frames
		playSpeed	 : 1,		 // play speed 1 normal, 2 twice 0.5 half, -1 reverse etc...
		lastFrame	 : null,	 // temp hold last frame loaded so you can display the gif as it loads
		image		 : null,	 // the current image at the currentFrame
		playOnLoad	 : true,	 // if true starts playback when loaded
		// functions
		load		 : loadGif,	// call this to load a file
		cancel		 : cancelLoad, // call to stop loading
		play		 : play,	 // call to start play
		pause		 : pause,	 // call to pause
		seek		 : seek,	 // call to seek to time
		seekFrame	 : seekFrame, // call to seek to frame
		togglePlay	 : togglePlay, // call to toggle play and pause state
	};
	return gif;
}
