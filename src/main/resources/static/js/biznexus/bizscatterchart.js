/*
수정이력 : 
	2023-04-07  v0.10   moonbsun    산점도 및 회구분석 표준 라이브러리 
*/

Number.prototype.pad = function(size) 
{
   	var s = String(this);
   	while (s.length < (size || 2)) {s = "0" + s;}
   	return s;
}	
	
(function(window, $, undefined) {
	let BIZSCATTERCHART_DATA_KEY = "bizScatterChart";
    
	let resFontColor = "#0000FF"; // khr : 분석 결과 라인, 방적식 컬러
    colorTable = [
		'#E6B0AA', '#D7BDE2', '#D4E6F1', '#D1F2EB', '#FDEBD0', '#F2F3F4', '#D6DBDF', '#F5B7B1', '#D2B4DE', '#82E0AA',
		'#85C1E9', '#73C6B6', '#82E0AA', '#F7DC6F', '#E59866', '#E59866', '#E74C3C', '#E74C3C', '#E74C3C', '#73C6B6'
    ];
	
	function workspace(element, config) {
		let self = this;
		
		var $element = $(element);
        $element.data(BIZSCATTERCHART_DATA_KEY, this);
        this._container = $element;
        this.data = [];
		
		this.id = element[0].id;
		this.canvas = element[0];
		this.context = this.canvas.getContext("2d");
		this.context.font = '12px 맑은 고딕'; // khr : 폰트 변경
		this.canvas.style.zIndex= 10;
		
		this.canvas.onmouseout = function(e){ self.onMouseOut(e);	}
		this.canvas.onmousemove = function(e){ self.onMouseMove(e);	}
		
		this.ndTtlTooltip = false; // khr : 툴팁 사용 여부
		
		this.setConfig(config);
		this.init();
		this.onSize();
	}	
	
	workspace.prototype = {
        view : {
            tagX : "",
            tagY : "",
            rect : { x: 0, y : 0, cx: 100, cy: 100 },
            plotArea : { x: 0, y : 0, cx:100, cy: 100 }
        },

        tag : {
            name : "",
            displayName : "",// khr
            values : [],
            min : 0, 
            max : 0
        },
        
        tagList : new Array(),

        viewList : new Array(),

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
           this.tagList.push(JSON.parse(JSON.stringify(this.tag)));
		},
		onMouseOut : function(e){
			$("#scatterTooltip").hide();
		},
		onMouseMove : function(e) {
			if(this.viewList.length > 1 && this.ndTtlTooltip){
				let fontHeight = this.context.measureText("M").width;
				for(let idx in this.viewList) {
					let view = this.viewList[idx];
					if(e.offsetX >= view.rect.x  && e.offsetX <= (view.rect.x + view.rect.cx) && e.offsetY >= view.rect.y && e.offsetY <=(view.rect.y + view.rect.cy)) {
						if(idx % (this.tagList.length + 1) != 0){ // 히스토그램이 아니면
							if($("#scatterTooltip").length > 0){
								$("#scatterTooltip").text(view.tagX + "  VS  " + view.tagY);
								$("#scatterTooltip").css("top", view.rect.y - $("#scatterTooltip").height());
								$("#scatterTooltip").css("left", (view.rect.cx - $("#scatterTooltip").width()) / 2 + view.rect.x);
								
								$("#scatterTooltip").show();
							}
						}
					}
				}
			}
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
        
        redraw : function() {
			this.canvas.width = this.canvas.clientWidth;
			this.canvas.height = this.canvas.clientHeight;
			
			this.ndTtlTooltip = false; // khr
			$("#scatterTooltip").hide(); //khr
			
			this.drawAll(true);
		},
        
        createViews : function() {
        },
        
        recalcLayout(context) {
            let rect = this.getRect();
            let fontHeight = context.measureText("M").width;

            this.viewList = new Array();

            let cx = (rect.cx - (this.tagList.length + 1) * fontHeight) / this.tagList.length;
            let cy = (rect.cy - (this.tagList.length + 1) * fontHeight) / this.tagList.length;

            let y = fontHeight;
            for(let i = 0; i < this.tagList.length; i++) {
                let x = fontHeight;
                for(let j = 0; j < this.tagList.length; j++) {
                    let view = JSON.parse(JSON.stringify(this.view));
                    view.tagX = (this.tagList[i].displayName != "") ? this.tagList[i].displayName : this.tagList[i].name; //this.tagList[i].name; // khr : 한글명 표기 위함
                    view.tagY = (this.tagList[j].displayName != "") ? this.tagList[j].displayName : this.tagList[j].name; //this.tagList[j].name; // khr : 한글명 표기 위함
                    
                    view.rect.x = x;
                    view.rect.y = y;
                    view.rect.cx = cx;
                    view.rect.cy = cy;
                    
                    view.plotArea.x = view.rect.x + 3 * fontHeight;
                    view.plotArea.cx = view.rect.cx - 6 * fontHeight;
                    view.plotArea.y = view.rect.y + 3 * fontHeight;
                    view.plotArea.cy = view.rect.cy - 6 * fontHeight;

                    x += cx + fontHeight;

                    this.viewList.push(view);
                }
                y += cy + fontHeight;
            }
        },
        
        drawAll : function(clearBack)
		{
   			let context = this.context;
            context.font = '12px 맑은 고딕';// khr : 폰트 설정 제거
            
            let backColor = "#f2f2f3"; //"rgba(255, 255, 255, 1.0)"; //"rgba(0,0,0,1.0)"; // khr : 배경 색상 변경
            
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
            let fillColor = "rgba(0, 0, 0, 1.0)";

            this.drawBorders(context, backColor);
            this.plot(context, fillColor);
            this.drawTitle(context, textColor);
            this.drawAxisX(context, lineColor, textColor);
            this.drawAxisY(context, lineColor, textColor);
        },

        drawBorders : function(context, backColor) {
            for(let view of this.viewList) {
                context.fillStyle = backColor;
                context.fillRect(view.rect.x, view.rect.y, view.rect.cx, view.rect.cy);
            }
        },
        
        drawTitle : function(context, textColor) {
            context.fillStyle = textColor;
            context.font = 'bold 12px 맑은 고딕'; // khr : 폰트 변경
            let fontHeight = context.measureText("M").width;
            let i = 0;
            for(let view of this.viewList) {
                let title = i % (this.tagList.length + 1) == 0 ? "히스토그램" : view.tagX + "  VS  " + view.tagY;
                let titleWidth = context.measureText(title).width;
             // khr : 축 기준선 안으로 fillText
                if(view.plotArea.cx > titleWidth) { 
                    let x = (view.plotArea.cx - titleWidth) / 2 + view.plotArea.x; 
                    context.fillText(title, x, view.rect.y + 1.5 * fontHeight); 
                }else{
                	this.ndTtlTooltip = true;
                	let goalWidth = ((view.plotArea.cx - context.measureText("  VS  ").width) / 2) - context.measureText("...").width;
                	
                	let tagXwidth = context.measureText(view.tagX).width;
                	let tagYwidth = context.measureText(view.tagY).width;
                	
                	let tagX = view.tagX; tagY = view.tagY;
                	if(goalWidth < tagXwidth){
                		tagX = "..."+view.tagX.slice(view.tagX.length- (goalWidth / 4));
                	}
                	if(goalWidth < tagYwidth){
                		tagY = "..."+view.tagY.slice(view.tagY.length- (goalWidth / 4));                		
                	}
                	
                	let titleWidth2 = context.measureText(tagX + "  VS  " + tagY).width;
               		let x2 = (view.plotArea.cx - titleWidth2) / 2 + view.plotArea.x + 9;
                    context.fillText(tagX + "  VS  " + tagY, x2, view.rect.y + 1.5 * fontHeight);
                
                }
                i++;
            }
            
            context.font = '12px 맑은 고딕'; // khr : 폰트 변경
        },
        
        drawAxisX : function(context, lineColor, textColor) {
            context.strokeStyle = lineColor;
            context.fillStyle = textColor;
            let fontHeight = context.measureText("M").width;
            
            context.beginPath();
            for(let view of this.viewList) {
                let titleWidth = context.measureText(view.tagX).width;
                if(view.rect.cx > titleWidth) {
                    let x = (view.rect.cx - titleWidth) / 2 + view.rect.x;
                    context.fillText(view.tagX, x, view.rect.y + view.rect.cy - (1.5 * fontHeight) + 1.5); 
                    context.moveTo(view.plotArea.x, view.plotArea.y + view.plotArea.cy);
                    context.lineTo(view.plotArea.x + view.plotArea.cx, view.plotArea.y + view.plotArea.cy);
                }
            }
            context.stroke();
        },
        
        drawAxisY : function(context, lineColor, textColor) {
            context.strokeStyle = lineColor;
            context.fillStyle = textColor;
            let fontHeight = context.measureText("M").width;

            let i = 0;
            context.beginPath();
            for(let view of this.viewList) {
                let title = i % (this.tagList.length + 1) == 0 ? "빈도" : view.tagY;
                let titleWidth = context.measureText(title).width;
                
                if(view.plotArea.cy > titleWidth) { // khr : 축 기준선 안으로 fillText
                    let x = view.rect.x + 2 * fontHeight;
                    let y = view.plotArea.y + (view.plotArea.cy + titleWidth) / 2;
                    
                    context.save();
                    context.translate(x, y);
                    context.rotate(-Math.PI / 2);
                    context.fillText(title, 0, 0); 
                    context.restore();
                    
                    context.moveTo(view.plotArea.x, view.plotArea.y);
                    context.lineTo(view.plotArea.x, view.plotArea.y + view.plotArea.cy);
                }else{

                
                	let tagY = "..."+view.tagY.slice(view.tagY.length-17);
                	let titleWidth2 = context.measureText(tagY).width;
                	
                	let x = view.rect.x + 2 * fontHeight;
                    let y = view.plotArea.y + (view.plotArea.cy + titleWidth2) / 2;
                    
                    context.save();
                    context.translate(x, y);
                    context.rotate(-Math.PI / 2);
                    context.fillText(tagY, 0, 0); 
                    context.restore();
                    
                    context.moveTo(view.plotArea.x, view.plotArea.y);
                    context.lineTo(view.plotArea.x, view.plotArea.y + view.plotArea.cy);
                }
                i++;
            }
            context.stroke();
        },
        
        calcAvg : function(arr) {
            let sum = 0;
            for(let val of arr) {
                sum += val;
            }
            
            return sum / arr.length;
        },
        
        calcVar : function(arr, avg) {
            let sum = 0;
            for(let val of arr) {
                sum += Math.pow(val - avg,2);
            }
            
            return sum;
        },
        
        calcSig : function(arr) {
            let avg = this.calcAvg(arr);
            return Math.sqrt(this.calcVar(arr, avg) / (arr.length - 1));
        },
        
        // 공분산 계산
        calcCov : function(xArr, yArr, xAvg, yAvg) {
            let sum = 0;
            for(let i = 0; i < xArr.length; i++) {
                sum += (xArr[i] - xAvg) * (yArr[i] - yAvg)
            }
            
            return sum;
        },

        
        calcRegresion : function(xArr, yArr, minX, maxX) {
            let xAvg = this.calcAvg(xArr);
            let yAvg = this.calcAvg(yArr);
            
            let xVar = this.calcVar(xArr, xAvg);

            let yVar = this.calcVar(yArr, yAvg);
            let cov = this.calcCov(xArr, yArr, xAvg, yAvg);

            let r = cov / Math.sqrt(xVar * yVar);
            let b1 = cov / xVar;
            let b0 = yAvg - b1 * xAvg;
            
            let yStart = b0 + b1 * minX;
            let yEnd = b0 + b1 * maxX;
            
            return {
                r : r,
                b0 : b0,
                b1 : b1,
                yStart : yStart,
                yEnd : yEnd
            }
        },
        
        calcMinMax : function(tagX, tagY, coef) {
            let yMin = Math.min(coef.yStart, coef.yEnd);
            let yMax = Math.max(coef.yStart, coef.yEnd);
            
            let min = Math.min(tagY.min, yMin);
            let max = Math.max(tagY.max, yMax);
            
            return {
                min : min,
                max : max
            }
        },
        
        plotRegression : function(context, lineColor, view, coef, tagX, tagY) {
            context.strokeStyle = resFontColor; //lineColor;   // khr : 라인 컬러 변경
            context.fillStyle = resFontColor; //lineColor; // khr : 라인 컬러 변경
            
            let minMax = this.calcMinMax(tagX, tagY, coef);
            
            context.beginPath();
            let x = view.plotArea.x;
            let y = view.plotArea.y + view.plotArea.cy * (1 - ((coef.yStart - minMax.min) / (minMax.max - minMax.min)))
            context.moveTo(x, y);

            x = view.plotArea.x + view.plotArea.cx;
            y = view.plotArea.y + view.plotArea.cy * (1 - ((coef.yEnd - minMax.min) / (minMax.max - minMax.min)));
            context.lineTo(x, y);
            
            context.stroke();
            
            context.strokeStyle = lineColor;   // khr : 라인 컬러 변경
            context.fillStyle = lineColor;   // khr : 라인 컬러 변경
            
            let fontHeight = context.measureText("M").width;
            let bultWidth = context.measureText("●").width; // khr : ● 추가
            
            context.font = '8px 맑은 고딕'; // khr : ● 추가
            context.fillText("● ", view.plotArea.x + fontHeight, view.plotArea.y + fontHeight  - 2.5); // khr : ● 추가
            context.fillText("● ", view.plotArea.x + fontHeight, view.plotArea.y + (2.5 * fontHeight) - 2.5); // khr : ● 추가

            context.font = '12px 맑은 고딕';
            context.fillText("상관계수: " + coef.r.toFixed(3), view.plotArea.x + fontHeight + bultWidth, view.plotArea.y + fontHeight); // khr : ● 추가
            context.fillText("결정계수: " + Math.pow(coef.r, 2).toFixed(3), view.plotArea.x + fontHeight + bultWidth, view.plotArea.y + 2.5 * fontHeight); // khr : ● 추가
            
            context.strokeStyle = resFontColor; //lineColor;   // khr : 라인 컬러 변경
            context.fillStyle = resFontColor; //lineColor; // khr : 라인 컬러 변경
            context.fillText("y = " + coef.b0.toFixed(3) + " + " + coef.b1.toFixed(3) + " * x",view.plotArea.x + fontHeight, view.plotArea.y + 4 * fontHeight); // khr : x 소문자로 변경
        },
        
        plotScatter : function(context, view, i, lineColor, fillColor) {
            context.fillStyle = fillColor;
            context.strokeStyle = fillColor;

            let idx1 = parseInt(i / this.tagList.length);
            let idx2 = parseInt(i % this.tagList.length);
            
            let coef = this.calcRegresion(this.tagList[idx1].values, this.tagList[idx2].values, this.tagList[idx1].min, this.tagList[idx1].max);
            let minMax = this.calcMinMax(this.tagList[idx1], this.tagList[idx2], coef);
                    
            for(let k = 0; k < this.tagList[idx1].values.length; k++) {
                let x = view.plotArea.x + view.plotArea.cx * 
                        (this.tagList[idx1].values[k] -  this.tagList[idx1].min) / (this.tagList[idx1].max - this.tagList[idx1].min);
                                    
                let y = view.plotArea.y + view.plotArea.cy * 
                        (1 - (this.tagList[idx2].values[k] -  minMax.min) / (minMax.max - minMax.min));
                                    
                context.beginPath();
                context.arc(x, y, 4, 0, 2 * Math.PI);
                context.stroke();
                context.fill();
            }
            
            this.plotRegression(context, lineColor, view, coef, this.tagList[idx1], this.tagList[idx2]);
        },
        
        plotNorm : function(context, view, values, lineColor, textColor) {
            console.log(this.tagList);
            
            let fontHeight = context.measureText("M").width;
            context.strokeStyle = resFontColor; //lineColor;   // khr : 라인 컬러 변경
            context.fillStyle = resFontColor; //lineColor; // khr : 라인 컬러 변경
            
            
            let avg = this.calcAvg(values);
            let sig = this.calcSig(values);
            
            let cx = view.plotArea.cx / 100;
            
            context.beginPath();
            
            let x = -5, px = view.plotArea.x;
            while(x <= 5) {
                let y = (1 / (sig * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow(x / sig, 2));
                // sqrt : 제곱근(루트), exp : 지수 제곱
                let py = (1 - y) * view.plotArea.cy + view.plotArea.y;
                if(x == -5)
                    context.moveTo(px, py);
                else
                    context.lineTo(px, py);
                
                x += 0.1;
                
                px += cx;
            }
            
            context.stroke();
            context.strokeStyle = lineColor; // khr : 라인 컬러 변경
            context.fillStyle = lineColor; // khr : 라인 컬러 변경
            // 왜도/첨도 계산
            let sum2 = 0, sum3 = 0, sum4 = 0, n = values.length;
            for(let val of values) {
                sum2 += Math.pow((val - avg) / sig, 2);
                sum3 += Math.pow((val - avg) / sig, 3);
                sum4 += Math.pow((val - avg) / sig, 4);
            }
            let skewness = sum3 * n/ ((n - 1) * (n - 2))
            let kurtosis = (1/ n * sum4) / Math.pow(( 1/ n * sum2),2) - 3;

            // khr : ● 추가
            let bultWidth = context.measureText("●").width; 

            let tY = view.plotArea.y + fontHeight;
            let tX = view.plotArea.x + fontHeight + bultWidth;
            let bX = view.plotArea.x + fontHeight;
            
            context.font = '8px 맑은 고딕'; 
            context.fillText("● ", bX, tY - 2.5); 
            context.font = '12px 맑은 고딕';
            context.fillText("샘플수: " + n, tX, tY);  
            
            tY += 1.5 * fontHeight;
            context.font = '8px 맑은 고딕'; 
            context.fillText("● ", bX, tY - 2.5); 
            context.font = '12px 맑은 고딕';
            context.fillText("평균: " + avg.toFixed(3), tX, tY); 
            
            tY += 1.5 * fontHeight;
            context.font = '8px 맑은 고딕';
            context.fillText("● ", bX, tY - 2.5); 
            context.font = '12px 맑은 고딕';
            context.fillText("표준편차: " + sig.toFixed(3), tX, tY); 
           
            tY += 1.5 * fontHeight;
            context.font = '8px 맑은 고딕'; 
            context.fillText("● ", bX, tY - 2.5);
            context.font = '12px 맑은 고딕';
            context.fillText("왜도: " + skewness.toFixed(3), tX, tY); 
            
            tY += 1.5 * fontHeight;
            context.font = '8px 맑은 고딕'; 
            context.fillText("● ", bX, tY - 2.5); 
            context.font = '12px 맑은 고딕';
            context.fillText("첨도: " + kurtosis.toFixed(3), tX, tY); 
            // khr : ● 추가 end
           
        },
        
        plotHistodiagram : function(context, view, i, lineColor, fillColor) {
            context.fillStyle = fillColor;
            context.strokeStyle = fillColor
    
            let idx = parseInt(i / this.tagList.length);
            
            if(this.tagList[idx].values.length > 0) {
                let grp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                for(let val of this.tagList[idx].values) {
                    let k = parseInt((val - this.tagList[idx].min) / (this.tagList[idx].max - this.tagList[idx].min) * 9);
                    grp[k]++;
                }
                
                if(grp.length > 0) {
                    let min = grp[0], max = grp[0];
                    for(let val of grp) {
                        min = Math.min(min, val);
                        max = Math.max(max, val);
                    }

                    let fontHeight = context.measureText("M").width;
                    let cx = (view.plotArea.cx - fontHeight * 2) / 10;
                    let x = view.plotArea.x + fontHeight;
                    for(let i = 0; i < 10; i++) {
                        let y = (1 - (grp[i] - min) / (max - min)) * view.plotArea.cy + view.plotArea.y;
                        let cy = (view.plotArea.cy + view.plotArea.y)  - y;
                        context.fillRect(x, y, cx, cy);

                        x += cx;
                    }
                    
                    this.plotNorm(context, view, this.tagList[idx].values, lineColor, lineColor);
                }
            }
        },
            
        plot : function(context, lineColor) {
            if(this.tagList.length > 0) {
                let i = 0;
                for(let view of this.viewList) {
                    if(i % (this.tagList.length + 1) != 0) 
                        this.plotScatter(context, view, i, lineColor, colorTable[i]);
                    else
                        this.plotHistodiagram(context, view, i, lineColor, colorTable[i]);
                        
                    i++;
                }
            }
        },

        
        //
        // 데이터 처리
        //
        setData : function(arr) {
            console.log(arr);
            this.tagList = new Array();
            for(let tagValues of arr) {
                let tag = new Object();
                tag.name = tagValues.name;
                
                if(typeof(tagValues.displayName) != 'undefined'){tag.displayName = tagValues.displayName;} else { tag.displayName = "";} // khr : 한글명 표기 위함
                
                tag.values = new Array();
                tag.min = tag.max = tagValues.values[0].val;
                for(let val of tagValues.values) {
                    tag.values.push(Number(val.val));
                    tag.min = Math.min(tag.min, Number(val.val));
                    tag.max = Math.max(tag.max, Number(val.val));
                    
                }
                this.tagList.push(tag);
            }
            
            this.redraw();
        }
    }
    
    $.fn.bizScatterChart = function(config, param) {
        this.each(function() {
	        var $element = $(this),
                instance = $element.data(BIZSCATTERCHART_DATA_KEY);
 
            if(typeof(instance) == 'undefined') {
	            let obj = new workspace($element, config);
				window.addEventListener("resize", function() {
					obj.onSize(); 
				});
				
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
    
	window.bizScatterChart = {
		version: '1.0.0'
	};
}(window, jQuery));


