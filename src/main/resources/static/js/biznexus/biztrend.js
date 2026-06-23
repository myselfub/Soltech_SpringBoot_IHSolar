/*
수정이력
    2023-05-09  v1.10   moonbsun	MinMax계산 오류로 트렌드 표시 안되는 내용 수정
									트렌드 이동시 현재 날짜보다 큰 경우 현재 날자로 고정되도록 수정
*/
String.prototype.string = function (len) { var s = '', i = 0; while (i++ < len) { s += this; } return s; };
String.prototype.zf = function (len) { return "0".string(len - this.length) + this; };
Number.prototype.zf = function (len) { return this.toString().zf(len); };
Number.prototype.pad = function(size) 
{
   	var s = String(this);
   	while (s.length < (size || 2)) {s = "0" + s;}
   	return s;
}	
	
Number.prototype.withCommas = function() {
    var reg = /(^[+-]?\d+)(\d{3})/;
    var n = (this + '');
	 
    while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');
	 
    return n;
}

Date.prototype.format = function (f) 
{
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
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
            case "mm": return d.getMinutes().zf(2); // 분 (2자리)
            case "ss": return d.getSeconds().zf(2); // 초 (2자리)
            case "a/p": return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
            default: return $1;
        }
    });
};

//function getContextPath() {
//	var hostIndex = location.href.indexOf( location.host ) + location.host.length;
//	return location.href.substring( hostIndex, location.href.indexOf('/', hostIndex + 1) );
//};

function addAlpha(color, opacity) {
	color = color.substring(0, 7);
    const _opacity = Math.round(Math.min(Math.max(opacity || 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

function ExportExcel()
{
	var fileName = 'Trend Data.xlsx'
	var data =  new Array(); 
	var rows = $("#dataGrid").data("JSGrid").data;
	var fields = $("#dataGrid").data("JSGrid").fields;
	
	var header = new Array();
	for(var i = 0; i < fields.length; i++) header.push(fields[i].title);
	data.push(header);
	
	for(var i = 0; i < rows.length; i++) {
		var row = new Array();
		for(var j = 0; j < fields.length; j++) 	{
			var val = String(rows[i][fields[j].name]);
			if(j >= 1) val = Number(val.replace(/,/gi, ""));
			row.push(val);
		}
		data.push(row);
	}
	
    var wb = XLSX.utils.book_new();
    var newWorksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, newWorksheet, 'sheet1');
    var wbout = XLSX.write(wb, {bookType:'xlsx',  type: 'binary'});
    saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), fileName);
}

function s2ab(s) { 
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i=0; i<s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;    
}
			
(function(window, $, undefined) {
	let BIZTREND_DATA_KEY = "bizTrend";
	
	let timeToX = function(time, start, end, left, width) {
		var ratio = (Number(time) - Number(start)) / (Number(end) - Number(start));
		return ratio * Number(width) + Number(left);
	}
	
	let valueToY = function(val, min, max, top, height) {
		let ratio = 1 - (val - min) / (max - min);
		ratio = Math.max(0, ratio);
		ratio = Math.min(1, ratio);
		var y = ratio * height + top;
		y = Math.min(y, top + height);
		y = Math.max(y, top);
		
		return y;
	}
	
	let xToTime = function(x, start, end, left, width) 	{
		var ratio = (x - left) / width;
		var time =	ratio * (Number(end) - Number(start)) + Number(start);
		
		return new Date(time);
	}
	
	let yToValue = function(y, min, max, top, height) {
		var ratio = 1 - (y - top) / height;
		
		return  ratio * (max - min) + min;
	}
	
	function workspace(element, config) {
		var $element = $(element);
        $element.data(BIZTREND_DATA_KEY, this);
        this._container = $element;
        this.data = [];
		
		this.id = element[0].id;

		this.onTaglistChanged = null; 
		this.onValueChanged = null; 
		this.onSizeChanged = $.noop;

		this.canvas = element[0];
		this.context = this.canvas.getContext("2d");
		this.context.font = '12px Arial';
		this.canvas.style.zIndex= 10;
		
		this.createCanvas2();
		this.frontContext = this.frontCanvas.getContext("2d");
		this.frontContext.font = '12px Arial';
		
		this.theme = this.themes.black;
		
		this.setConfig(config);
		this.init();
		this.onSize();
	}	
	
	workspace.prototype = {
		colorTable : [
			'#E6B0AA', '#D7BDE2', '#D4E6F1', '#D1F2EB', '#FDEBD0', '#F2F3F4', '#D6DBDF', '#F5B7B1', '#D2B4DE', '#82E0AA',
			'#85C1E9', '#73C6B6', '#82E0AA', '#F7DC6F', '#E59866', '#E59866', '#E74C3C', '#E74C3C', '#E74C3C', '#73C6B6'
		],
		
		themes : {
			white : {
				backColor: "rgba(255, 255, 255, 1)",
				textColor : "rgba(0, 0, 0, 1)",
				lineColor : "rgba(0, 0, 0, 0.5)",
				borderColor : "rgba(0, 0, 0, 1)",
				indicatorColor : "rgba(0, 0, 255, 1.0)"
			},
			black : {
				backColor: "rgba(0, 0, 0, 1)",
				textColor : "rgba(255,255,255,1)",
				lineColor : "rgba(255,255,255,0.5)",
				borderColor : "rgba(255,255,255,1)",
				indicatorColor : "rgba(0, 255, 0, 1.0)"
			}
		},
		
		span : 2 * 3600,
		interval : 10 * 1000,
		tagList : new Array(),
		attr  : {},
		theme : {},
		viewList  : new Array(),
		timerId : null,
		fetchTime : new Date(),
		
		createCanvas2 : function() {
			let self = this;
			
			this.frontCanvas = document.createElement('canvas');
			this.frontCanvas.id = this.canvas.id + "_front";
			this.frontCanvas.style.position = "absolute";
			this.frontCanvas.style.zIndex= 1;
		
			$("#" + this.canvas.id).before(this.frontCanvas);	
			
			this.frontCanvas.onmousedown = function(e) { self.onMouseDown(e.offsetX, e.offsetY) };
			this.frontCanvas.onmouseup = function(e) { self.onMouseUp(e.offsetX, e.offsetY) };
			this.frontCanvas.ondblclick = function(e) { self.onDblClick(e) };	
			this.frontCanvas.onmousemove = function(e) { self.onMouseMove(e.offsetX, e.offsetY) };
		},
		
		initToolbox : function() {
			this.toolbox = {};
			this.toolbox.comm = 0;
			
			this.toolbox.undo = {};
			
			this.toolbox.excel = {};
			this.toolbox.excel.icon = new Image();
			this.toolbox.excel.icon.src = getContextPath() + "/resources/images/biznexus/excel.png";

			this.toolbox.picture = {};
			this.toolbox.picture.icon = new Image();
			this.toolbox.picture.icon.src = getContextPath() + "/resources/images/biznexus/picture.png";

			this.toolbox.up = {};
			this.toolbox.up.icon = new Image();
			this.toolbox.up.icon.src = getContextPath() + "/resources/images/biznexus/up.png";

			this.toolbox.down = {};
			this.toolbox.down.icon = new Image();
			this.toolbox.down.icon.src = getContextPath() + "/resources/images/biznexus/down.png";
			
			this.toolbox.clock = {};
			this.toolbox.clock.icon = new Image();
			this.toolbox.clock.icon.src = getContextPath() + "/resources/images/biznexus/clock.png";
		},
		
		initAttr : function() {
			
			
			this.attr.fontHeight = 	0;
			this.attr.trendType = 0; 
			this.attr.font = '12px Arial';
			this.attr.viewCount = 1;
			
			this.initViews();
		},
		
		initViews : function() {
			let viewList = new Array();
			for(let view of this.viewList) viewList.push(view);
				
			this.viewList = new Array();

			for(let idx = 1; idx <= this.attr.viewCount; idx++) {		
				let view = {};
				
				if(typeof(viewList[idx - 1]) != 'undefined')
					view = viewList[idx - 1];
				else {
					view.index = idx;
					view.indicator = [ null, null ];
					view.rect = {};
					view.area = {};
					view.start = null;
					view.end = null;
					view.span = this.span;
					view.lagTime = 0;
				}
				
				this.viewList.push(view);
			}
		},
		
		// start, end 시간 조정, span 시간 조정
		initDialog : function() {
			let dataGridDiv = document.createElement('div');
			dataGridDiv.id = 'dataGridDlg';
			dataGridDiv.innerHTML = '<div id="dataGrid" />';
			document.body.appendChild(dataGridDiv);

			let modTimeDiv = document.createElement('div');
			modTimeDiv.id = 'modTimeDlg';
			modTimeDiv.innerHTML = '<input type="date" id="date"><input type="time" id="time">';
			document.body.appendChild(modTimeDiv);

			let modSpanDiv = document.createElement('div');
			modSpanDiv.id = 'modSpanDlg';
			modSpanDiv.innerHTML = '<input type="number" id="days" style="width:4em" min="0" max="999"> days ' +
				'<input type="number" id="hours" style="width:4em"  min="0" max="23"> hours ' + 
				'<input type="number" id="mins" style="width:4em"  min="0" max="59"> minutes';
			document.body.appendChild(modSpanDiv);
			
			let script = document.createElement('script');
			script.innerHTML = 
				'showDataGridDlg = function() { ' +
				'	$("#backscreen").show(); '+
		     	'	$("#dataGridDlg").dialog("option", "title", "trend data").dialog("open");' +
		     	'	document.getElementById("dataGrid").style.height = "auto";' +
				'};' +
				'$("#dataGridDlg").dialog({'+
				'	autoOpen: false,' +
				'	resizable:false,' +
				'	closeOnEscape: false,'+
				'	width: 800,' +
				'	buttons: {' +
				'		"확인": function() {' +
				'			$("#backscreen").hide(); '+
				'			$(this).dialog("close");' +
				'		},' +
				'		"엑셀 다운": function() {' +
				'			ExportExcel();' + 
				'			$("#backscreen").hide(); '+
				'			$(this).dialog("close");' +
				'		},'+
				'		"취소": function() {' +
				'			$("#backscreen").hide(); '+
				'			$(this).dialog("close");' +
				'		}'+
				'	}' +
            	'});' +
				'$("#dataGrid").jsGrid({' +
				'	width: "100%",' +
	            '	height: "500px",' +
	            '	paging: true,' +
                '	pageSize: 100,' +
                '	pageButtonCount : 5,' +
				'	fields: ' +
				'	[' +
	   	        '		{ name: "timeStamp", type: "text", width: 150, title :"time stamp", align: "center" }' +
				'	]' +
				'});' +
				'showSpanDlg = function(index, days, hours, mins) { ' +
				'	$("#days").val(days);' +
				'	$("#hours").val(hours);' +
				'	$("#mins").val(mins);' +
				'	$("#backscreen").show(); '+
		     	'	$("#modSpanDlg").dialog("option", "title", index + ":Set Span").dialog("open");' +
				'};' +
				'$("#modSpanDlg").dialog({'+
				'	autoOpen: false,' +
				'	resizable:false,' +
				'	closeOnEscape: false,'+
				'	width: "max(316px, 19vw)", ' +
				'	buttons: {' +
				'		"확인": function() {' +
				'			let title = $("#modSpanDlg").dialog("option", "title");' +
				'			let token = title.split(":");' +
				'			$("#' + this.id + '").bizTrend("setSpan", token[0], $("#days").val(), $("#hours").val(), $("#mins").val());' +
				'			$("#backscreen").hide(); '+
				'			$(this).dialog("close");' +
				'		},' +
				'		"취소": function() {' +
				'			$("#backscreen").hide(); '+
				'			$(this).dialog("close");' +
				'		}'+
				'	}' +
            	'});' +
				'showModTimeDlg = function(index, cat, time) { ' +
        		'	let date = new Date(time);' +
	       		'	let dateOnly = date.getFullYear() + "-" + (date.getMonth() + 1).pad(2) + "-" + date.getDate().pad(2);' +
        		'	let timeOnly = date.getHours().pad(2) + ":" + date.getMinutes().pad(2) + ":00";' +
        		'	$("#date").val(dateOnly);' +
        		'	$("#time").val(timeOnly);' +
				'	$("#backscreen").show(); '+
		     	'	$("#modTimeDlg").dialog("option", "title", index + ":" +cat).dialog("open");' +
				'};' +
				'$("#modTimeDlg").dialog({'+
				'	autoOpen: false,' +
				'	resizable:false,' +
				'	closeOnEscape: false,'+
				'	width: "max(310px,20vw)",' +
				'	buttons: {' +
				'		"확인": function() {' +
				'			let title = $("#modTimeDlg").dialog("option", "title");' +
				'			let token = title.split(":");' +
				'			$("#' + this.id + '").bizTrend(token[1] == "start time" ? "setStart" : "setEnd", token[0], $("#date").val() + " " + $("#time").val());' +
				'			$("#backscreen").hide(); '+
				'			$(this).dialog("close");' +
				'		},' +
				'		"취소": function() {' +
				'			$("#backscreen").hide(); '+
				'			$(this).dialog("close");' +
				'		}'+
				'	}' +
	           	'});';
			document.body.appendChild(script);
		},
		
		init : function() {
			this.initAttr();			
			this.initToolbox();
			this.initDialog();
		},
		
		getMinMax : function(view) {
			let min = null, max = null;
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName];
				if(tag.enable == false) continue;
				if(tag.index != view.index) continue;
			
				tag.min = null;
				tag.max = null;
				
				for(let val of tag.values) {
					if(val.val == 'ERR') continue;
                    if(isNaN(val.val) == true) continue;
					
					let tTime = new Date(val.time);
				
					if(tTime.getTime() < view.start.getTime()) continue;
					if(tTime.getTime() > view.end.getTime()) continue;
				
					if(tag.autoScale == true)  {
						if(min == null) min = Number(val.val);
						if(max == null) max = Number(val.val);
						min = Math.min(min, val.val);
						max = Math.max(max, val.val);
					}
					
					if(tag.min == null) tag.min = Number(val.val);
					if(tag.max == null) tag.max = Number(val.val);
					tag.min = Math.min(tag.min, val.val);
					tag.max = Math.max(tag.max, val.val);
                    
					tag.time = val.time;
					tag.val = val.val;
				}
			}
			
			let range = Math.abs(max - min);
			if(range == 0) range = 1;
			
			let scaleMin = min - range * 0.2;
			let scaleMax = max + range * 0.2;

            
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName];
				if(tag.enable == false) continue;
				if(tag.index != view.index) continue;
				
				if(tag.autoScale == true) {				// scale is auto
					tag.scaleMin = Math.floor(scaleMin);
					tag.scaleMax = Math.ceil(scaleMax);
				}
			}
		},
		
		calcMinMax : function() {
			for(let view of this.viewList) {
				this.getMinMax(view);
			}
		},

		onValues : function(data) {
			for(let tag of data)  {
				if(typeof(this.tagList[tag.name]) == 'undefined') continue;
				this.tagList[tag.name].values = tag.values;
			}
			
			this.calcMinMax();
			
			if(this.onValueChanged != null) this.onValueChanged(this.tagList);
			
			if(this.toolbox.comm > 1) {
				this.toolbox.comm = 0;
				this.fetch();
			}
		},
		
		onTimer : function() {
			let now = new Date();
			if((now.getTime() - this.fetchTime.getTime()) >= this.interval) 
				this.fetch();
		},
		
		setTag : function(tag, tagInfo, color, values) {
			tag.type = 1;				// 1:line, 2: step
			tag.index = 1;
			tag.enable = true;
			tag.autoScale = true;				
			tag.name = tagInfo.name;
			tag.desc = tagInfo.desc;
			tag.color = color;
			tag.min = 0;
			tag.max = 0;
			tag.values = values;
		},
		
		setValues : function(tagValues) {
			this.tagList = new Array();
			for(let idx in tagValues) {
				let tagInfo = tagValues[idx];
				
				let tag = {};
				this.setTag(tag, tagInfo, this.colorTable[idx++ % this.colorTable.length], tagInfo.values);

				this.tagList[tagInfo.name] = tag;
			}
			
			this.calcMinMax();
			this.redraw();
		},
		
		delTag : function(tagName) {
			for(let name in this.tagList) {
				if(name == tagName) {
					delete this.tagList[name];					
					break;
				}
			}
		},
		
		isExist : function(tagName) {
			let bExist = false;
			for(let name in this.tagList) {
				if(name == tagName) {
					bExist = true;					
					break;
				}
			}
			return bExist;
		},
			
		setTagList : function(tagInfos) {
			for(let name in this.tagList) {
				let bFind = false;
				for(let tagInfo of tagInfos) {				
					if(name == tagInfo.name) {
						bFind = true;
						break;
					}
				}
				if(bFind == false) this.delTag(name);
			}
			
			let idx = 0;
			for(let tagInfo of tagInfos) {
				if(this.isExist(tagInfo.name) == false) {
					let tag = {};
					this.setTag(tag, tagInfo, this.colorTable[idx % this.colorTable.length], new Array());
					
					this.tagList[tagInfo.name] = tag;
				}
				idx++;
			}
			
			if(this.onTaglistChanged != null) 
				this.onTaglistChanged(this.tagList);
		},
		
		setConfig : function(config) {
			// callback functions
			if(typeof(config.onSizeChanged) != 'undefined') this.onSizeChanged  = config.onSizeChanged;
			if(typeof(config.onTaglistChanged) != 'undefined') this.onTaglistChanged = config.onTaglistChanged;
			if(typeof(config.onValueChanged) != 'undefined') this.onValueChanged = config.onValueChanged;
			
			if(typeof(config.span) != 'undefined') this.span = config.span;
			if(typeof(config.interval) != 'undefined') this.interval = config.interval;
			if(typeof(config.tagList) != 'undefined') this.setTagList(config.tagList);
			if(typeof(config.theme) != 'undefined') this.setTheme(config.theme);
		}, 
		
		setTheme : function(strTheme) {
			if(strTheme == 'white') this.theme = this.themes.white;
			if(strTheme == 'black') this.theme = this.themes.black;
		},
		
		startEnd : function(view) {
			if(view.start == null || this.timerId != null) {
				let now = new Date();
			
				view.start = new Date(now);
				view.end= new Date(now);
			}
			
			view.start.setSeconds(view.end.getSeconds() + view.lagTime - view.span);
			view.end.setSeconds(view.end.getSeconds() + view.lagTime);
						
			return {
				start : view.start,
				end : view.end
			}
		},
		
		getView : function(index) {
			let view = null;
			for(view of this.viewList) {
				if(view.index == index) break;
			}
			
			return view;
		},
				
		findView : function(x, y) {
			let view = null;
			for(view of this.viewList) {
				let rect = view.rect;
				if(rect.left <= x && rect.left + rect.width >= x &&
					rect.top <= y && rect.top + rect.height + this.attr.fontHeight * 2.5 >= y) {
						break;
				}
			}
			
			return view;
		},
		
		getEnabledTagCounnt : function() {
			let cnt = 0;
			
			for(let tagName in this.tagList) {
				if(this.tagList[tagName].enable == false) continue;
				cnt++;
			}
			
			return cnt;
		},
		
		fetch : function() {
			if(this.getEnabledTagCounnt() > 0) {
				if(this.toolbox.comm == 0 ) {
					this.fetchTrendValues(this.tagList);
					this.fetchTime = new Date();
				}
				this.toolbox.comm++;
				this.drawFront();
			}
		},
		
		redraw : function() {
			this.canvas.width = this.canvas.clientWidth;
			this.canvas.height = this.canvas.clientHeight;
			this.frontCanvas.width = this.canvas.clientWidth;
			this.frontCanvas.height = this.canvas.clientHeight;
			
			this.drawAll(true);
		},
		
		refreshMode : function(bAuto) {
			let self = this;
			if(bAuto == true && this.timerID == null) {
				this.fetch();
				this.timerId = setInterval(function() { self.onTimer(); }, 100);	
			}
			if(bAuto == false && this.timerID != null) clearInterval(this.timerId);
			this.redraw();
		},

		setSpan : function(index, days, hours, mins) {
			let view = this.getView(index);
			view.span = days * 3600 * 24 + hours * 3600 + mins * 60;
			if(view.span == 0) view.span = 30 * 60;
			this.redraw();
			this.fetch();
		},
		
		setStart : function(index, strTime) {
			let time = new  Date(strTime);
			let view = this.getView(index);
			
			view.span = (view.end.getTime() - time.getTime()) / 1000; 
			
			let now = new Date();
			view.lagTime = (time - now) / 1000 + view.span;
            if(view.lagTime >= 0) view.lagTime = 0;
			
			this.redraw();
			this.fetch();
		},
		
		setEnd : function(index, strTime) {
			let time = new  Date(strTime);
			let view = this.getView(index);

			if(time.getTime() > view.start.getTime()) {
				view.span = (time.getTime() - view.start.getTime()) / 1000; 
					
				let now = new Date();
				view.lagTime = (time - now) / 1000;
                if(view.lagTime >= 0) view.lagTime = 0;
			}
			this.redraw();
			this.fetch();
		},
		
		onSize : function() {
			let width = this.canvas.offsetWidth;
			let height = this.canvas.offsetHeight;
			
			this.setSize(width, height)
			
			let isFullscreen = Math.abs(screen.height - window.outerHeight) <= 20; 
			this.onSizeChanged(isFullscreen);
			
			this.drawAll(true);
		},
		
		setSize : function(width, height) {
			this.canvas.clientWidth = width;
			this.canvas.clientHeight = height;
			this.canvas.width = width;
			this.canvas.height = height;
			
			this.frontCanvas.offsetWidth = width;
			this.frontCanvas.offsetHeight = height;

			this.redraw();
		},
		
		setFocus : function(name) {
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName];
				if(tag.name == name || name == "*") 
					tag.color = addAlpha(tag.color, 1.0);
				else
					tag.color = addAlpha(tag.color, 0.3);
			}
			
			this.redraw();
		},
		
		onDblClick : function(e) {
			let view = this.findView(e.offsetX, e.offsetY);
			this.createOrDeleteIndicator(view, e.offsetX, e.offsetY); 
			this.drawFront();
		},
		
		getRect : function() {
			let rect = {};
			rect.left = 0;;
			rect.top = 0;
			rect.width = this.canvas.clientWidth;
			rect.height = this.canvas.clientHeight;
		
			return rect;
		},
		
		newRect : function(view) {
			let layoutList = [ 
				[{ x:0, y:0, w:1.00, h:1.0 }],
				[{ x:0, y:0, w:0.5, h:1.0 }, { x:0.5, y:0, w:0.5, h:1.0 } ],
				[{ x:0, y:0, w:0.5, h:0.5 }, { x:0.5, y:0, w:0.5, h:0.5 }, { x:0, y:0.5, w:1.0, h:0.5 }],
				[{ x:0, y:0, w:0.5, h:0.5 }, { x:0.5, y:0, w:0.5, h:0.5 }, { x:0, y:0.5, w:0.5, h:0.5 }, { x:0.5, y:0.5, w:0.5, h:0.5 }]
				
			];
			
			let rect = {};
			let layout = layoutList[this.attr.viewCount - 1][view.index - 1];
			if(typeof(layout) != 'undefined') {
				rect.left = layout.x * this.canvas.clientWidth;
				rect.top = layout.y * this.canvas.clientHeight;
				rect.width = this.canvas.clientWidth * layout.w - this.attr.fontHeight;
				rect.height = this.canvas.clientHeight * layout.h;
			}
			
			return rect;
		},
		
		drawAll : function(clearBack)
		{
			if(clearBack == true) {
				let rect = this.getRect();
				rect.top += this.attr.fontHeight * 1.6;
				this.drawBackground();	
			}

			for(let view of this.viewList) {
				this.draw(view);
			}
			this.drawFront();
						
		},
		
		drawBackground : function() {
			let context = this.context;
			
			let rect = this.getRect();
			
			context.clearRect(rect.left, rect.top, rect.width, rect.height);
			context.fillStyle = this.theme.backColor;
			context.fillRect(rect.left, rect.top, rect.width, rect.height);
		},
		
		draw : function(view) {
			let rect = this.newRect(view);
			
			this.context.font = this.attr.font;
			this.attr.fontHeight = this.context.measureText("M").width * 1.2;
			this.drawTrend(rect, view);	
			
			view.rect = rect;
		},
		
		drawTrend1 : function(rect, view) {
			this.drawYaxisByValue(rect, view);
			this.drawXaxisByTime(rect, view);
			this.drawLineChart(rect, view);
		},
		
		drawTrend : function(rect, view) {

			rect.left += this.attr.fontHeight;
			rect.width -= this.attr.fontHeight;
			rect.top += 2 * this.attr.fontHeight;
			rect.height -= 5 * this.attr.fontHeight;
			
			switch(this.attr.trendType) {
				case 0 : this.drawTrend1(rect, view); 
			}
		},
		
		drawLineChart : function(rect, view) {
			let context = this.context;
			let startEnd = this.startEnd(view);
			
			let idx = 1;
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName]
				if(tag.enable == false) continue;
				if(tag.index != view.index) continue;
				
				context.fillStyle = tag.color;
				context.fillText(tag.name, rect.left + 4, rect.top + idx * this.attr.fontHeight * 1.2);
				idx++; 
				
				context.beginPath();
				context.strokeStyle = tag.color;
				
				let values = tag.values, bInit = true;
				
				let prevY = 0;
				for(let val of values) {

					let tTime = new Date(val.time);
					let x = timeToX(tTime, startEnd.start, startEnd.end, rect.left, rect.width);
					
					x = Math.max(x, rect.left);
					x = Math.min(x, rect.left + rect.width);
					
					let y = 0;
					if(val.val != 'ERR') {
						y = valueToY(val.val, tag.scaleMin, tag.scaleMax, rect.top, rect.height);
						if(y < rect.top || y > rect.top + rect.height) continue;
					}
					else {
						bInit = true;
						continue;
					}
					
					if(bInit == true) {
						context.moveTo(x, y);
						bInit = false;
					} 
					else {
						if(tag.type == 2) {			// steped chart
							context.lineTo(x, prevY);	
						}
						
						context.lineTo(x,y);
					}
					
					prevY = y;
				}
				context.stroke();
			}
		},
		
		drawXaxisByTime : function(rect, view) {
			let context = this.context;
			let startEnd = this.startEnd(view);
			
			
			context.beginPath();
			context.fillStyle = this.theme.textColor;
			context.lineWidth = 1;
			context.strokeStyle = this.theme.lineColor;
			context.font = this.attr.font;

			// 구간 갯수를 계산한다.	
			var nCount = rect.width / (this.attr.fontHeight * 10);
			nCount = nCount >= 10 ? 10 : nCount >= 5  ? 5 : 2; 
	
			var tSpan = (startEnd.end - startEnd.start) / (1000 * nCount);
			var tTime = new Date(startEnd.start);
			var nDay = tTime.getDate();
			var y = rect.top + rect.height + 1.5 * this.attr.fontHeight;
			for(var i = 0; i <= nCount; i++)
			{
				var x = timeToX(tTime, startEnd.start, startEnd.end, rect.left, rect.width);
				
				context.moveTo(x, y - 1.5 * this.attr.fontHeight);
				context.lineTo(x, rect.top);

				var strDate = tTime.format("yyyy-MM-dd");
				var strTime = tTime.format("HH:mm:ss");
				var nOffsetD = context.measureText(strDate).width;
				var nOffsetT = context.measureText(strTime).width;
					
				if(i == 0 || i == nCount || nDay != tTime.getDate())
				{
					var x1 =  x - nOffsetD / 2;
					if(i == 0) x1 += nOffsetD / 2;
					if(i == nCount) x1 -= nOffsetD / 2;
						
					context.fillText(strDate, x1, y);
				}
				nDay = tTime.getDate();
				
				var x2 =  x - nOffsetT / 2;
				if(i == 0) x2 += nOffsetT / 2;
				if(i == nCount) x2 -= nOffsetT / 2;
					
				context.fillText(strTime, x2, y + this.attr.fontHeight);
				
				tTime.setSeconds(tTime.getSeconds() + tSpan);
				
			}
			context.stroke();
			
			context.lineWidth = 2;
			context.strokeStyle = this.theme.borderColor;
			context.strokeRect(rect.left, rect.top, rect.width, rect.height);
		},
		
		drawYaxisByValue : function(rect, view) {
			
			let context = this.context;
			let scaleMin = null, scaleMax = null;
			let textWidth = context.measureText(numberFormat(0, 2, true)).width;
			
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName];

				if(tag.enable == false) continue;
				if(tag.index != view.index) continue;
				
				tag.scaleMin = Number(tag.scaleMin);
				tag.scaleMax = Number(tag.scaleMax);
				
				textWidth = Math.max(textWidth, context.measureText(numberFormat(tag.scaleMin, 2, true)).width);
				textWidth = Math.max(textWidth, context.measureText(numberFormat(tag.scaleMax, 2, true)).width);
				
				if(tag.autoScale == false) continue;

				if(scaleMin == null) scaleMin = tag.scaleMin;
				if(scaleMax == null) scaleMax = tag.scaleMax;
				
				scaleMin = Math.min(scaleMin, tag.scaleMin);
				scaleMax = Math.max(scaleMax, tag.scaleMax);
			}
			
			let offsetY = 4;
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName];
				if(tag.enable == false) continue;
				if(tag.autoScale == true) continue;
				if(tag.index != view.index) continue;

				offsetY += this.attr.fontHeight
				this.drawYaxisByValue1(rect, tag.scaleMin, tag.scaleMax, offsetY, textWidth, tag.color, false);
			}
			
			offsetY = 4;
			this.drawYaxisByValue1(rect, scaleMin, scaleMax, offsetY,  textWidth, this.theme.textColor, true);
		},
		
		drawYaxisByValue1 : function(rect, scaleMin, scaleMax, offsetY, textWidth, textColor, flag) {
			
			let context = this.context;
			context.font = this.attr.font;
			
			let top = rect.top;
			let bottom = (rect.top + rect.height);
		
			let count = rect.height / (this.attr.fontHeight * 5);
			count = count >= 10 ? 10 : count >= 5  ? 5 : 2; 
			
			let gap = (scaleMax - scaleMin) / count;
		
			let arrScale = new Array(count + 1);
			for(let i = 0; i <= count; i++) {
				arrScale[i] = numberFormat(scaleMin + gap * i, 2, true);
			}
			
			context.beginPath();
			context.fillStyle = textColor;
			context.lineWidth = 1;
			context.strokeStyle = this.theme.lineColor;
			context.save();
		
			let gapY = (bottom - top) / count, y = rect.top + offsetY;;
			
			for(var i = count; i >= 0; i--) {
				var x = rect.left + textWidth - context.measureText(arrScale[i]).width;
				if(flag == false && i == 0) y = rect.top + rect.height - offsetY + this.attr.fontHeight - 4;
			
				if(gap > 0) context.fillText(arrScale[i], x, y);
				
				if(flag == true) {
					context.moveTo(rect.left + textWidth + this.attr.fontHeight - ( i == 0 || i == count ? 8 : 4), y - 4.0);
					context.lineTo(rect.left + rect.width, y - 4.0);
				}
				
				y += gapY;
			}

			context.stroke();
			context.restore();
			
			if(flag == true) {
				rect.left = rect.left + textWidth + this.attr.fontHeight;
				rect.width -=  textWidth + this.attr.fontHeight;
			}
		},
		
		moveIndicator : function(view, x) {
			var bDone = false;
			for(var ind of view.indicator) {
				if(ind == null) continue;
				if(ind.enable == false) continue;
				if(view.rect.left > x) continue;
				if(view.rect.left + view.rect.width < x) continue;
				ind.x = x;
				bDone = true;
				break;
			}
			
			return bDone;
		},
		
		setNow : function() {
			//workspace.lagTime = 0;
			//workspace.fetch();
			//this.drawAll(workspace, false);
		},
		
		moveTime : function(span) {
			this.lagTime -= span;
            if(view.lagTime >= 0) view.lagTime = 0;

			this.fetch();
			for(let view of this.viewList)
				this.draw(view);
		},
		
		shiftTime : function(view, x1, x2) {
			if(this.timerId != null) {
				let startEnd = this.startEnd(view);
				let rect = view.rect;

				let start = xToTime(x1, startEnd.start, startEnd.end, rect.left, rect.width);
				let end = xToTime(x2, startEnd.start, startEnd.end, rect.left, rect.width);
						
				let sececonds = (end.getTime() - start.getTime()) / 1000;
				if(view.area.x1 < view.area.x2) sececonds = -sececonds;
				view.lagTime += sececonds;
                if(view.lagTime >= 0) view.lagTime = 0;
				
				this.calcMinMax();
				this.draw(view);
				
				this.fetch();
			}
		},
		
		zoomTime : function(view, x1, x2) {
			let startEnd = this.startEnd(view);
			let rect = view.rect;

			view.start = xToTime(x1, startEnd.start, startEnd.end, rect.left, rect.width);
			view.end = xToTime(x2, startEnd.start, startEnd.end, rect.left, rect.width);
			view.span = (view.end.getTime() - view.start.getTime()) / 1000;
			
			let now = new Date();
			view.lagTime = (view.end - now) / 1000;
            if(view.lagTime >= 0) view.lagTime = 0;

			
			this.calcMinMax();
			this.draw(view);
			if(this.timerId != null) this.fetch();
		},
		
		adjTime : function(x, y) {
			let bRefresh = false;
			let view = this.findView(x, y);
			if(typeof(view.area.x1) != 'undefined') {
				view.area.x2 = x;
				view.area.y2 = y;

				let x1 = Math.min(view.area.x1, view.area.x2);
				let x2 = Math.max(view.area.x1, view.area.x2);
				
				let y1 = Math.min(view.area.y1, view.area.y2);
				let y2 = Math.max(view.area.y1, view.area.y2);
				
				if(x2 - x1 > 10) {
					if(y2 - y1 > 200) 
						this.zoomTime(view, x1, x2);
					else 
						this.shiftTime(view, x1, x2);
						
					bRefresh = true;
				}
				
				view.area = {};
			}
			
			return bRefresh;
		},
		
		adjViews : function(cnt) {
			let view = Number(this.attr.viewCount);
			view += cnt;
			view = Math.min(view, 4);
			view = Math.max(view, 1);
			this.attr.viewCount = view;
			this.redraw();
			this.initViews();
		},
		
		getCommand : function(x, y) {
			let rect = this.viewList[0].rect;
			let nCmd = -1;
			
			if(y < rect.top) {
				nCmd = Math.floor((x - rect.left) / 24);
			}
			else {
				let view = this.findView(x , y);
				rect = view.rect;
				if(y >= rect.top && y <= rect.top + 24) {
					nCmd = Math.floor((rect.left + rect.width - x) / 24);
					nCmd = nCmd >= 0 && nCmd <= 3 ? 10 : -1;
				}
				else {
					if(y > rect.top + rect.height && y < rect.top + rect.height + 2 * this.attr.fontHeight ) {
						nCmd = Math.floor((x - rect.left) / 24);
						nCmd = nCmd >= 0 && nCmd <= 1 ? 21 : -1;
						if(nCmd == -1) {
							nCmd = Math.floor((rect.left + rect.width - x) / 24);
							nCmd = nCmd >= 0 && nCmd <= 1 ? 22 : -1;
						}  
					}
				}
			}	
			
			return nCmd;			
		},
		
		resampleData : function() {
			let secs1 = this.viewList[0].start.getTime();

			let data = new Array();
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName];
				if(tag.values.length == 0) continue;
				
				let time = new Date(Math.floor(secs1 / 60000) * 60000);
				let val1 = null, val2 = null;
				let decPos = tag.values[0].val.lastIndexOf('.') == -1 ? 0 : tag.values[0].val.length - tag.values[0].val.lastIndexOf('.') - 1;

				let idx = 0;
				for(let val of tag.values) {
					let t = new Date(val.time);
					val2 = val;
					while(time.getTime() <= t.getTime()) {
						if(val1 != null) {
							let t1 = new Date(val1.time);
							let t2 = new Date(val2.time);
							let newVal = (Number(val2.val) - Number(val1.val)) / (t2.getTime() - t1.getTime()) * (time.getTime() - t1.getTime()) + Number(val1.val);
							newVal = numberFormat(newVal, decPos, true);
							
							if(data.length > idx) {
								let row = data[idx];
								row[tagName] = newVal;
							} 
							else {
								let row = {};
								row.timeStamp = time.format('yyyy-MM-dd HH:mm');
								row[tagName] = newVal;
								data.push(row);
							}
							
							idx++; 
						}						
						time.setSeconds(time.getSeconds() + 60);		
					}	
					val1 = val;		
				}
			}
		
			return data;
		},
		
		saveImage : function() {
			const link = document.createElement('a');
  			link.download = 'trend.png';
  			link.href = this.canvas.toDataURL();
  			link.click();
  			link.delete;
		},
			
		showDataGrid : function() {
			var fields = $("#dataGrid").data("JSGrid").fields;
			fields.splice(1)
			for(let tagName in this.tagList) {
				let field = {}
				field.name = tagName;
				field.type = "text"
				field.title = tagName;
				field.align = "right";
				field.width = 150;
				
				fields.push(field);
			}

			$("#dataGrid").jsGrid("option", "fields", fields);
			
			if(fields.length > 1) {
				let data = 	this.resampleData();
				$("#dataGrid").jsGrid("option", "data", data);		
				showDataGridDlg();
			}
		},
		
		doCommand : function(x, y) {
			let bRefresh = false;
			let view = this.findView(x,y);

			let cmd = this.getCommand(x, y);
			let spans = this.splitSpan(view.span);
				
			if(cmd != -1) {
				switch(cmd) {
					case 0 : this.adjViews(-1); break;		
					case 2 : this.adjViews(1); break;		
					case 4 : this.saveImage(); break;		
					case 5 : this.showDataGrid(); break;		 // to data		
					case 10 : showSpanDlg(view.index, spans.days, spans.hours, spans.mins); break;	
					case 21 : showModTimeDlg(view.index, "start time", view.start); break; 
					case 22 : showModTimeDlg(view.index, "end time", view.end); break; 
				}
					
				bRefresh = true;
			}
			
			return bRefresh;
		},
		
		onMouseUp : function(x, y) {
			let view = this.findView(x,y);
			for(var ind of view.indicator) {
				if(ind == null) continue;
				ind.enable = false;
			}
			
			let bRefresh = false;
			if(this.adjTime(x, y) == true) bRefresh = true;
			if(this.doCommand(x, y) == true) bRefresh = true;
			
			if(bRefresh == true) this.drawAll(true);			
		},
		
		onMouseDown : function(x, y) {
			let view = this.findView(x,y);
			if(y > view.rect.top) {
				let bFlag = false;
				for(var ind of view.indicator) {
					if(ind == null) continue;
					if(Math.abs(x - ind.x) <= 4) {
						ind.enable = true;
						bFlag = true;
					}
				}
	
				if(bFlag == false) {
					view.area.x1 = x;
					view.area.y1 = y;
				}
			}						
		},
		
		onMouseMove : function( x, y) {
			let view = this.findView(x,y);

			let bDrawFront = false;
			var bDone = this.moveIndicator(view, x);
			if(bDone == true) bDrawFront = true;
			
			if(typeof(view.area.x1) != 'undefined') {
				view.area.x2 = x;
				view.area.y2 = y;
				
				bDrawFront = true;
			}
			
			let cmd = this.getCommand(x, y);
			
			document.body.style.cursor = "default";
			if(cmd == 0 || cmd == 2 || cmd == 4 || cmd == 5 || cmd == 10 || cmd == 11) 
				document.body.style.cursor = "Pointer";
				
			if(y > view.rect.top + view.rect.height) {
				if(x - view.rect.left > 0 && x - view.rect.left < 60) {
					document.body.style.cursor = "Pointer";
				}
				
				if(view.rect.left +  view.rect.width - x < 60) {
					document.body.style.cursor = "Pointer";
				}
			}
			
			if(bDrawFront == true) this.drawFront();
		},
		
		findValues : function(view, time) {
			let retValues = new Array();
			
			for(let tagName in this.tagList) {
				let tag = this.tagList[tagName];
				if(tag.enable == false) continue;
				if(tag.index != view.index) continue;
				
				let obj1 = {}, obj2 = {};
				for(let val of tag.values) {
					let tTime = new Date(val.time);
					if(time.getTime() == tTime.getTime()) {
						retValues[tag] = val.val;
						break;
					}
					else if(time.getTime() < tTime.getTime()) {
						obj2 = val;
						
						let tTime1 = new Date(obj1.time);
						let tTime2 = new Date(obj2.time);
						
						if(tag.type == 1)
							retValues[tagName] = (Number(obj2.val) - Number(obj1.val)) / (tTime2.getTime() - tTime1.getTime()) * (time.getTime() - tTime1.getTime()) + Number(obj1.val);
						else
							retValues[tagName] = obj1.val;
						break;
					}
					obj1 = val;
				}
			}
			
			return retValues;
		},
		
		splitSpan : function(span) {
			let days = Math.floor(span / (3600 * 24)); span -= days * 3600 * 24;
			let hours = Math.floor(span / 3600); span -= hours * 3600;
			let mins = Math.floor(span / 60); span -= mins * 60;
			
			return {
				'days' : days,
				'hours' : hours,
				'mins' : mins
			};			
		},
		
		drawSpan : function(context, span, x, y) {
			let spans = this.splitSpan(span);
			let strSpan = spans.days.pad(4) + 'days ' + spans.hours.pad(2) + ':' + spans.mins.pad(2);
			context.fillText(strSpan, x, y);
		},
		
		drawMainToolbox : function() {
			let context = this.frontContext;
			context.fillStyle = this.theme.indicatorColor;

			let rect = this.getRect();
			context.clearRect(rect.left, rect.top, rect.width, rect.height);
			rect = this.viewList[0].rect;
			context.font = this.attr.font;
			
			if(this.toolbox.comm == true)
				context.drawImage(this.toolbox.clock.icon,  0, 4);
			
			let x = rect.left;
			
			x += 0 * 24; context.drawImage(this.toolbox.down.icon,  x, 4);
			x += 1 * 24; context.fillText(this.attr.viewCount.pad(2), x, 14);;
			x += 1 * 24; context.drawImage(this.toolbox.up.icon,  x, 4);
			x += 2 * 24; context.drawImage(this.toolbox.picture.icon,  x, 4);
			x += 1 * 24; context.drawImage(this.toolbox.excel.icon,  x, 4);
		} ,
		
		drawToolbox : function(view) {
			let context = this.frontContext;
			let rect = view.rect;	
			let y = rect.top + 14; 
			let x = rect.left + rect.width - 2 * this.attr.fontHeight;
			
			context.fillStyle = this.theme.indicatorColor;//"rgba(0, 255, 120, 1.0)";
			context.font = '12px Arial';
			
			x -= 3 * 24; this.drawSpan(context,  view.span, x, y);
		},
		
		drawFront : function() {
			this.drawMainToolbox();
			for(let view of this.viewList) {
				let context = this.frontContext;
				let rect = view.rect;	
				
				let startEnd = this.startEnd(view);
				this.drawIndicator(view, startEnd, rect, view.indicator[0]);
				this.drawIndicator(view, startEnd, rect, view.indicator[1]);
				this.drawIndicatorInfo(view, startEnd, rect, view.indicator);
				
				
				if(typeof(view.area.x1) != 'undefined') {
					let x = Math.min(view.area.x1, view.area.x2);
					let y = Math.min(view.area.y1, view.area.y2);
					let w = Math.abs(view.area.x1 - view.area.x2);
					let h = Math.abs(view.area.y1 - view.area.y2);
					
					if(h > 200) {
						context.fillStyle = "rgba(0, 0, 255, 0.5)";
						context.fillRect(x, y, w, h);
					}
				}
				
				this.drawToolbox(view);
			}
		},
		
		drawIndicator : function(view, startEnd, rect, ind) {
			if(ind != null) {
				let context = this.frontContext;
				context.beginPath();
				context.strokeStyle = this.theme.indicatorColor;
				context.lineWidth = 2;
					
				context.moveTo(ind.x, rect.top);
				context.lineTo(ind.x, rect.top + rect.height);
				context.stroke();
				
				let tTime = xToTime(ind.x, startEnd.start, startEnd.end, rect.left, rect.width);
				let strTime = tTime.format("yyyy-MM-dd HH:mm:ss");
				let timeWidth = context.measureText(strTime).width;	
				
				var x = ind.x - timeWidth / 2;
				if(x <rect.left) x = rect.left;
				if(x + timeWidth > (rect.left + rect.width)) x = (rect.left + rect.width) - timeWidth;
					
				let fontHeight = context.measureText("M").width * 1, y = rect.top + rect.height - 2;
				context.fillStyle = this.theme.indicatorColor;
				context.fillText(strTime, x, y);
				
				y -= fontHeight * 1.4;
				let values = this.findValues(view, tTime);
				
				for(let tagName in values) {
					let val = Number(values[tagName]);
					let strVal = '[' + tagName + '] ' +  numberFormat(val, 1, true);
					
					context.fillStyle = this.tagList[tagName].color;
					context.font = this.attr.font;
					
					let valWidth = context.measureText(strVal).width;
					if(view.rect.left + view.rect.width > valWidth + ind.x + 4)
						context.fillText(strVal, ind.x + 4, y);
					else
						context.fillText(strVal, ind.x - 4 - valWidth, y);
						
					y -= fontHeight * 1.4;
				}
			}
		},
		
		drawIndicatorInfo : function(view, startEnd, rect, indicators) {
			let ind1 = indicators[0];
			let ind2 = indicators[1];
			if(ind1 != null && ind2 != null) {
				let context = this.frontContext;
					
				let tTime1 = xToTime(ind1.x, startEnd.start, startEnd.end, rect.left, rect.width);
				let tTime2 = xToTime(ind2.x, startEnd.start, startEnd.end, rect.left, rect.width);
				
				let values1 = this.findValues(view, tTime1);
				let values2 = this.findValues(view, tTime2);
				
				let y = this.attr.fontHeight * 5;
				for(let tagName in values1) {
					let val1 = Number(values1[tagName]);
					let val2 = Number(values2[tagName]);
					
					let strVal = '[' + tagName + '] ' + numberFormat(Math.abs(val2 - val1), true);
					
					context.fillStyle = this.tagList[tagName].color;
					context.font = this.attr.font;
					context.fillText(strVal, Math.min(ind1.x, ind2.x) + 4, y);
					y += this.attr.fontHeight * 1.5;
				}
				
				context.beginPath();
				context.strokeStyle = this.theme.indicatorColor;
				context.lineWidth = 1;
				
				context.moveTo(ind1.x, rect.top + this.attr.fontHeight * 2);
				context.lineTo(ind2.x, rect.top + this.attr.fontHeight * 2);
				context.stroke();
				
				let gap  = Math.abs(tTime1.getTime() - tTime2.getTime());
				let gapS = Math.floor(gap / 1000) % 60;
				let gapM = Math.floor(gap / 1000 / 60) % 60;
				let gapH = Math.floor(gap / 1000 / 3600);
				
				let strGap = gapH.pad(2) + ":" + gapM.pad(2) + ":" + gapS.pad(2);
				let gapWidth = context.measureText(strGap).width;	
				
				let x = Math.min(ind1.x, ind2.x) + Math.abs(ind1.x - ind2.x) / 2 - gapWidth / 2;
				
				context.fillStyle = this.theme.indicatorColor;
				context.fillText(strGap, x, rect.top + this.attr.fontHeight  * 2);
			}
		},
		
		createOrDeleteIndicator : function(view, x, y) {
			if(y > view.rect.top + 24 && y < view.rect.top + view.rect.height) {
				var bDelete = false;
				for(var idx = 0; idx < view.indicator.length; idx++) {
					if(view.indicator[idx] == null) continue;
					if( Math.abs(x - view.indicator[idx].x) <= 4 ) {
						view.indicator[idx] = null;
						bDelete = true;
						break;
					}
				}
						
				if(bDelete == false) {
					for(var idx = 0; idx < view.indicator.length; idx++) {
						if(view.indicator[idx] != null) continue;
						view.indicator[idx] = { 'x' : x, 'y' : y, 'enable' : false }; // enable은 버튼이 눌리면 true 떼면 false로 처리
						break;
					}
				}
			}
		},
		
		reqTrendValues : function(reqData) {
			let me = this;
			return new Promise((resolve, reject) => {
				$.ajax ( {
			    	type: 'POST',
			    	contentType: 'application/json; charset=UTF-8',
			    	url: '/req-tag',
			    	dataType: 'json',
			    	cache : false,
			    	data: reqData,
			    	success: function (obj)  {
						switch(obj.cmd) {
							case "fetchValues" : me.onValues(obj.param); break;
							default:
								console.log(obj);
						}
					
						me.toolbox.comm = 0;
						me.redraw();
	
						resolve();
					},
					error: function (request, status, error) 
					{
						me.toolbox.comm = 0;
						me.redraw();
	
						console.log("Error" +  "[" + status + "]" + error);
						reject();
					}
				});
			});
		},
		
		fetchTrendValues : function(tagList) {
			for(let view of this.viewList) {
				let tagNames = new Array();
				for(let name in tagList) {
					let tag = this.tagList[name];
					if(tag.enable == false) continue;
					if(tag.index != view.index) continue; 
					tagNames.push(name);
				}
			
				if(tagNames.length > 0) {
					let startEnd = this.startEnd(view);
				
					var obj = new Object();
					obj.cmd = "fetchValues";
					obj.param = {};
					obj.param.start = startEnd.start.format('yyyy-MM-dd HH:mm:ss');
					obj.param.end = startEnd.end.format('yyyy-MM-dd HH:mm:ss');
					obj.param.fit = true;
					obj.param.tagList = tagNames;
	
					this.reqTrendValues(JSON.stringify(obj));
				}
			}
		}
	}
	
	$.fn.bizTrend = function(config, param, val1, val2, val3) {
        this.each(function() {
	        var $element = $(this),
                instance = $element.data(BIZTREND_DATA_KEY);
 
            if(typeof(instance) == 'undefined') {
	            let obj = new workspace($element, config);
				window.addEventListener("resize", function() {
					obj.onSize(); } );
  			} 
			else {
				switch(config) {
					case "setTagList" : 
						instance.setTagList(param);
						instance.fetch();
						instance.onSize();
						break;
					case "delTag" : 
						instance.delTag(param); 
						instance.fetch();
						instance.onSize();
						break;
					case "refresh" :
						instance.calcMinMax(); 
						instance.onSize(); 
						break;
					case "fetch" : 
						instance.fetch(); 
						break;
					case "setValues" :
						instance.setValues(param); 
						break;
					case "refreshMode" : 
						instance.refreshMode(param); 
						break;
					case "setStart" : 
						instance.setStart(param, val1); 
						break;
					case "setEnd" : 
						instance.setEnd(param, val1); 
						break;
					case "setSpan" : 
						instance.setSpan(param, val1, val2, val3); 
						break;
					case "setFocus" : 
						instance.setFocus(param); 
						break;
				}
			}
        });

        return this;
	};

	window.bizTrend = {
		version: '1.0.0'
	};
}(window, jQuery));


