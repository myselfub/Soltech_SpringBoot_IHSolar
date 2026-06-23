/*
수정이력 : 
	2023-04-07  v0.10   moonbsun    X Bar-R 관리도 표준 라이브러리
*/
	
(function(window, $, undefined) {
	let BIZCONTROLCHART_DATA_KEY = "bizControlChart";
	
	let s_d2 = [
        -1   , -1   , 1.128, 1.693, 2.059, 2.326, 2.534, 2.704, 2.847, 2.97 ,  
        3.078, 3.173, 3.258, 3.336, 3.407, 3.472, 3.532, 3.588, 3.64 , 3.689,
        3.735, 3.778, 3.819, 3.858,	3.895, 3.931, 3.964, 3.997,	4.027, 4.057,	
        4.086, 4.113, 4.139, 4.165,	4.189, 4.213, 4.236, 4.259,	4.28 , 4.301,	
        4.322, 4.341, 4.361, 4.379,	4.398, 4.415, 4.433, 4.45 ,	4.466, 4.482,	
        4.498, 4.514, 4.529, 4.543,	4.558, 4.572, 4.586, 4.599,	4.613, 4.626,	
        4.639, 4.651, 4.663, 4.676,	4.687, 4.699, 4.711, 4.722,	4.733, 4.744,	
        4.755, 4.765, 4.776, 4.786,	4.796, 4.806, 4.816, 4.825,	4.835, 4.844,	
        4.854, 4.863, 4.872, 4.881,	4.889, 4.898, 4.906, 4.915,	4.923, 4.931,	
        4.939, 4.947, 4.955, 4.963, 4.971, 4.978, 4.986, 4.993,	5.001, 5.008,	
        5.015 ];
        
    let s_d3 = [
        -1      , 0.82    , 0.8525  , 0.8884  ,	0.8794  , 0.8641  ,	0.848   , 0.8332  ,	0.8198  , 0.8078,	
        0.7971  , 0.7873  , 0.7785  , 0.7704  ,	0.763   , 0.7562  ,	0.7499  , 0.7441  ,	0.7386  , 0.7335,
        0.7287	, 0.7242  , 0.7199  , 0.7159  , 0.7121  , 0.7084  , 0.704059, 0.701158, 0.698327, 0.695565,	
        0.692872, 0.690245,	0.687685, 0.685188,	0.682755, 0.680385, 0.678075, 0.675825,	0.673634, 0.671501,	
        0.669424, 0.667402,	0.665435, 0.66352 ,	0.661657, 0.659844, 0.658081, 0.656366,	0.654699, 0.653077,
        0.6515  , 0.649967,	0.648476, 0.647026,	0.645616, 0.644246, 0.642913, 0.641617,	0.640356, 0.639129,	
        0.637936, 0.636775,	0.635644, 0.634543,	0.63347 , 0.632425, 0.631406, 0.630412,	0.629442, 0.628494,
        0.627568, 0.626662,	0.625775, 0.624907,	0.624055, 0.623219, 0.622397, 0.621589,	0.620793, 0.620007,	
        0.619232, 0.618465,	0.617706, 0.616953,	0.616206, 0.615462, 0.614722, 0.613983,	0.613244, 0.612505,	
        0.611764, 0.61102 ,	0.610272, 0.609519,	0.608759, 0.607992, 0.607216, 0.60643 ,	0.605632, 0.604823,	
        0.604 ];

	function workspace(element, config) {
		var $element = $(element);
        $element.data(BIZCONTROLCHART_DATA_KEY, this);
        this._container = $element;
        this.data = [];
		
		this.id = element[0].id;
		this.canvas = element[0];
		this.context = this.canvas.getContext("2d");
		this.context.font = '12px Arial';
		this.canvas.style.zIndex= 10;
		
		this.setConfig(config);
		this.init();
		this.onSize();
	}	
	
	workspace.prototype = {
        view : {
            cl  : 5,
            ucl : 10,
            lcl : 0,
            values : [],
            minMax : {min:0, max:100 },
            pad : 0,
            rect : { x: 0, y : 0, cx: 100, cy: 100 },
            plotArea : { x: 0, y : 0, cx:100, cy: 100 },
        },
        
        viewX : {},
        viewR : {}, 
        
   		setConfig : function(config) {
		},
        
        onSize : function() {
			let width = this.canvas.offsetWidth;
			let height = this.canvas.offsetHeight;
			
			this.setSize(width, height)
			
			this.drawAll(true);
		},
        
        setSize : function(width, height) {
			this.canvas.clientWidth = width;
			this.canvas.clientHeight = height;
			this.canvas.width = width;
			this.canvas.height = height;

			this.redraw();
		},
		
		init : function() {
            this.viewX = JSON.parse(JSON.stringify(this.view));
            this.viewR = JSON.parse(JSON.stringify(this.view));
		},
        
   		getRect : function() {
			let rect = {};
			rect.x = 0;
			rect.y = 0;
			rect.cx = this.canvas.clientWidth;
			rect.cy = this.canvas.clientHeight;
		
			return rect;
		},
        
        //////////////////////////////////
        
        calcMinMax : function(view) {
            let minVal = view.values[0], maxVal = view.values[0];
            for(let val of view.values) {
                minVal = Math.min(val, minVal);
                maxVal = Math.max(val, maxVal);
            }
          
            if(isNaN(view.lcl) == false) minVal = Math.min(minVal, view.lcl);
            if(isNaN(view.ucl) == false) maxVal = Math.max(maxVal, view.ucl);
            
            let r = maxVal - minVal;
            minVal -= r * 0.2;
            maxVal += r * 0.2;
            
            return {
                min : minVal,
                max : maxVal
            }
        },
        
        calcPad : function(minMax) {
            let range = Math.abs(minMax.max - minMax.min) / 8;
            
            let nPad = 0;
            if(range < 0.01) nPad = 3;
            else if(range < 0.1) nPad = 2;
            else if(range < 1) nPad = 1;
            else nPad = 0;
            
            return nPad;
        },
        
        leftMargin : function(context, minMax, nPad) {
            let range = Math.abs(minMax.max - minMax.min) / 8;
            
            let offset = 0;
            for(let i = minMax.min; i <= minMax.max; i += range) {
                let str = i.toFixed(nPad);
                offset = Math.max(context.measureText(str).width, offset);
            }
            
            return offset;
        },
        
        recalcLayout : function(context) {
            let rect = this.getRect();
            let fontHeight = context.measureText("M").width;
            
            this.viewX.rect.x = this.viewR.rect.x = rect.x + fontHeight;
            this.viewX.rect.y = rect.y + fontHeight;

            this.viewR.rect.y = this.viewX.rect.y + this.viewX.rect.cy + 2 * fontHeight;
            this.viewX.rect.cx = this.viewR.rect.cx = rect.cx - 2 * fontHeight;
            this.viewX.rect.cy = this.viewR.rect.cy = rect.cy / 2 - 2 * fontHeight;
            
            this.viewX.minMax = this.calcMinMax(this.viewX);
            this.viewR.minMax = this.calcMinMax(this.viewR);
            
            this.viewX.pad = this.calcPad(this.viewX.minMax);
            this.viewR.pad = this.calcPad(this.viewR.minMax);
            
            //차트 좌측 min, max 데이터
            let leftMarginX = this.leftMargin(context, this.viewX.minMax, this.viewX.pad);
            let leftMarginR = this.leftMargin(context, this.viewR.minMax, this.viewR.pad);
            let leftMargin = Math.max(leftMarginX, leftMarginR) + 2 * fontHeight;
                        
            this.viewX.plotArea.x = this.viewR.plotArea.x = this.viewX.rect.x + leftMargin;
            this.viewX.plotArea.cx = this.viewR.plotArea.cx = this.viewX.rect.cx - leftMargin - fontHeight;

            this.viewX.plotArea.y = this.viewX.rect.y + fontHeight;
            this.viewX.plotArea.cy = this.viewX.rect.cy - 3 * fontHeight;
            
            this.viewR.plotArea.y = this.viewR.rect.y + fontHeight;
            this.viewR.plotArea.cy = this.viewR.rect.cy - 3 * fontHeight;
        },
        
        redraw : function() {
			this.canvas.width = this.canvas.clientWidth;
			this.canvas.height = this.canvas.clientHeight;
			
			this.drawAll(true);
		},
        
        drawAll : function(clearBack)
		{
   			let context = this.context;
            context.font = '12px Arial';
            
            let backColor = "rgba(255,255,255,1.0)";
            
            this.recalcLayout(context);

			if(clearBack == true) {
				this.clearBackground(context, backColor);	
			}
            
            this.draw(context);
		},
        
   		clearBackground : function(context, color) {
			let rect = this.getRect();
			context.clearRect(rect.x, rect.y, rect.cx, rect.cy);
			context.fillStyle = color;
			context.fillRect(rect.x, rect.y, rect.cx, rect.cy);
		},

        draw : function(context) {
            let backColor = "rgba(255, 255, 255, 1.0)";
            let lineColor = "rgba(0, 0, 0, 1.0)";
            let textColor = "rgba(0, 0, 0, 1.0)";
            
            this.drawBorder(context, this.viewX, backColor);
            this.drawBorder(context, this.viewR, backColor);
            
            this.drawAxis(context, this.viewX, lineColor);
            this.drawAxis(context, this.viewR, lineColor);
            
            this.plot(context, this.viewX, lineColor);
            this.plot(context, this.viewR, lineColor);
        },
		        
        drawBorder : function(context, view, backColor, lineColor) {
  			context.fillStyle = backColor;
  			context.strokeStyle = lineColor;
			context.fillRect(view.rect.x, view.rect.y, view.rect.cx, view.rect.cy);
            context.strokeRect(view.plotArea.x, view.plotArea.y, view.plotArea.cx, view.plotArea.cy);
        },
        
        drawAxis : function(context, view, lineColor) {
            context.lineWidth = 0.2;
  			context.strokeStyle = lineColor;
  			context.fillStyle = lineColor;
            
            let fontHeight = context.measureText("M").width;
            
            let val = view.minMax.max, offsetValue = Math.abs(view.minMax.max - view.minMax.min) / 8;
            
            let y = view.plotArea.y + 0.5 * fontHeight, offsetY = view.plotArea.cy / 8;
            
            context.beginPath();
            for(let i = 0; i <= 8; i++) {
                let str = val.toFixed(view.pad);
                let textWidth = context.measureText(str).width;

  				context.fillText(str, view.plotArea.x - textWidth - 0.5 * fontHeight, y);
                
                y += offsetY;
                val -= offsetValue;
            }
            
            let x = view.plotArea.x;
            for(let i = 0; i < view.values.length - 1; i++) {
                context.moveTo(x, view.plotArea.y);
                context.lineTo(x, view.plotArea.y + view.plotArea.cy);
                
                x += view.plotArea.cx / (view.values.length - 1);
            }
            
            context.stroke();
        },
        
        plot : function(context, view, lineColor) {
            let fontHeight = context.measureText("M").width;

  			context.strokeStyle = lineColor;
  			context.fillStyle = lineColor;
            context.lineWidth = 2;
            
            context.beginPath();
            let x = view.plotArea.x, bFlag = false;
            for(let val of view.values) {
                
                let y = view.plotArea.y + view.plotArea.cy * (1 - (val - view.minMax.min) / (view.minMax.max - view.minMax.min));
                if(bFlag == false) {
                    context.moveTo(x, y);
                    bFlag = true;
                }
                else
                    context.lineTo(x, y);
                
                x += view.plotArea.cx / (view.values.length - 1);
            }
            
            // CL
            let y0 = view.plotArea.y + view.plotArea.cy * (1 - (view.cl - view.minMax.min) / (view.minMax.max - view.minMax.min));
            context.moveTo(view.plotArea.x, y0);
            context.lineTo(view.plotArea.x + view.plotArea.cx, y0);
            context.stroke();
            
            x = view.plotArea.x;
            for(let val of view.values) {
                let y = view.plotArea.y + view.plotArea.cy * (1 - (val - view.minMax.min) / (view.minMax.max - view.minMax.min));
                
                context.strokeStyleStyle = val > view.ucl || val < view.lcl ? "rgba(255, 0, 0, 1.0)" : lineColor;
                context.fillStyle = val > view.ucl || val < view.lcl ? "rgba(255, 0, 0, 1.0)" : lineColor;
                context.beginPath();
                context.arc(x, y, 4, 0, 2 * Math.PI);
                context.stroke();
                context.fill();
                x += view.plotArea.cx / (view.values.length - 1);
            }
            
            // UCL LCL
            context.fillStyle = "rgba(0, 0, 255, 0.3)";
            let y1 = view.plotArea.y + view.plotArea.cy * (1 - (view.lcl - view.minMax.min) / (view.minMax.max - view.minMax.min));
            let y2 = view.plotArea.y + view.plotArea.cy * (1 - (view.ucl - view.minMax.min) / (view.minMax.max - view.minMax.min));
            
            if(isNaN(y1) == true) y1 = view.plotArea.y + view.plotArea.cy;
            
            context.fillRect(view.plotArea.x, y1, view.plotArea.cx, y2 - y1);
            
            context.fillStyle = "rgba(0, 0, 0, 1)";
            //jgs
            //context.fillText("CL=" + view.cl.toFixed(3), view.plotArea.x + 0.5 * fontHeight, y0);
            context.fillText("CL=" + view.cl.toFixed(3), document.getElementById("chart").clientWidth - 90, y0);
            context.fillText("UCL=" + view.ucl.toFixed(3), view.plotArea.x + 0.5 * fontHeight, y2 - fontHeight);
            if(isNaN(view.lcl) == false)
                context.fillText("LCL=" + view.lcl.toFixed(3), view.plotArea.x + 0.5 * fontHeight, y1 + 2 * fontHeight);
        },
        
        //
        // 데이터 처리
        //
        setData : function(arr) {
            let data = this.calc(arr);
            this.viewX.values = data.xArr;
            this.viewR.values = data.rArr;
            
            let samples = arr[0].length;
            this.calcR(this.viewR, samples);
            this.calcX(this.viewX, this.viewR.cl, samples);
            
            this.redraw();
        },
        
        calc : function(data){
            let xBar = new Array(), xRange = new Array();
            let xSd = new Array(), rSd = new Array();
            for(let arr of data) {
                let minVal = arr[0], maxVal = arr[0], sum = 0;
                for(let val of arr) {
                    sum += val;
                    minVal = Math.min(val, minVal);
                    maxVal = Math.max(val, maxVal);
                }
                
                let xAvg = sum / arr.length;
                xBar.push(xAvg);
                xRange.push(maxVal - minVal);
                
                let diff = 0;
                for(let val of arr) {
                    diff += (xAvg - val) * (xAvg - val);
                }
                xSd.push(Math.sqrt(diff / arr.length));
            }
        
            return {
                xArr : xBar,
                rArr : xRange
            }
        },
        
        calcX : function(view, clR, samples) {
            samples = Math.min(100,samples);

            let sum = 0;
            for(let val of view.values) sum += val;
            
            view.cl = sum / view.values.length;
            
            view.lcl = view.cl - 3 * clR / (Math.sqrt(samples) * s_d2[samples]);
            view.ucl = view.cl + 3 * clR / (Math.sqrt(samples) * s_d2[samples]);
            
        },
        
        calcR : function(view, samples) {
            samples = Math.min(100,samples);
            
            let sum = 0;
            for(let val of view.values) sum += val;
            
            view.cl = sum / view.values.length;
            view.ucl = (s_d2[samples] + 3 * s_d3[samples]) * view.cl / s_d2[samples];
            view.lcl = (s_d2[samples] - 3 * s_d3[samples]) * view.cl / s_d2[samples];
        }
    }
    
    $.fn.bizControlChart = function(config, param) {
        this.each(function() {
	        var $element = $(this),
                instance = $element.data(BIZCONTROLCHART_DATA_KEY);
 
            if(typeof(instance) == 'undefined') {
	            let obj = new workspace($element, config);
				window.addEventListener("resize", function() {
					obj.onSize(); } );
  			} 
			else {
                switch(config) {
                case "data" : 
                    instance.setData(param);
					break;
                }
			}
        });

        return this;
	};
    
	window.bizControlChart = {
		version: '1.0.0'
	};
}(window, jQuery));


