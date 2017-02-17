
/**
 *  robert
 *  2016-09-02
 *  datepick 1.0
 *  690168598@qq.com
 * */

(function( win, document ){

	var dataPick = function( opt ){
		var _default = {
			selector: '[date-pick]',
			styles: ''
		}

		dataPick.options = $.extend(_default, opt||{} );
		var datepicks = $( dataPick.options.selector );
		if( datepicks.size() === 0 ){
			return;
		}
		
		dataPick.addLink();
		dataPick.appendPick( datepicks );
	}

	/** 添加样式类 */
	dataPick.addLink = function(){
		var linkEl = $('<link rel="stylesheet" type="text/css" href="datepick.css" />');
		linkEl.on("error", function(){
			linkEl.attr( "href", "http://www.iwan0.com/cdn/datepick/datepick.css" );
		});

		$('head').append( linkEl );
	}


	/*** 添加日期窗体 */
	dataPick.appendPick = function( datepicks ){

		var html = '<div class="date-pick ' + this.options.styles + '" style="display:none;">';
		html += '<div class="date-header">';
		html += 	'<div class="header-box year-box" data-target="year-content">';
		html += 		'<span class="reduce"><em class="before"></em></span>';
		html += 		'<i class="year-box-title"></i>';
		html += 		'<span class="odd"><em class="before"></em><em class="after"></em></span>';
		html += 	'</div>	';
		html += 	'<div class="header-box month-box" data-target="month-content">';
		html += 		'<span class="reduce"><em class="before"></em></span>';
		html += 		'<i class="month-box-title"></i>';
		html += 		'<span class="odd"><em class="before"></em><em class="after"></em></span>';
		html += 	'</div>';
		html +=		'<div class="day-box-title"></div>';
		html +=		'<div class="week-box-title"></div>';
		html += '</div>	';
		html += '<div class="date-body">';
		html += 	'<div class="date-content year-content">';
		html += 		'<span class="backward">&lt;</span>';
		html += 		'<ul class="year-content-list" data-target="year-box-title"></ul>';
		html += 		'<span class="forward">&gt;</span>';
		html += 	'</div>';
		html += 	'<ul class="date-content month-content" data-target="month-box-title"></ul>';
		html +=		'<div class="date-content day-content">';
		html +=			'<div class="date-week"></div>';
		html +=			'<ul class="day-content-list" data-target="day-box-title"></ul>';
		html +=		'</div>';
		html += '</div>	';
		html += '<div class="date-footer">';
		html += 	'<button class="date-btn-sure">OK</button>';
		html += '</div></div>';

		var dateContainer = $(html);
		$('body').append( dateContainer );

		dataPick.init(datepicks, dateContainer);
	}


	/*** 初始化 */
	dataPick.init = function( datepicks, dpickEl ){
		var curDateEl = null;
		var doc = $(document);
		var month = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
		var daySum = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		var week = ["日", "一", "二", "三", "四", "五", "六"];
		var dateFormat = '';

		/** 最终选定的时间 */
		var lastDate = now();

		var hasDay = true;
		var hasMonth = true;
		var hasYear = true;

		/** 天可选， 选择则显示， 不选则不显示 */
		var isOptionDay = false;
		var isClickDay = false;


		dpickEl = $(".date-pick");
		dpickEl.on( "selectstart", function(){ return false; } );

		/** 日历面板相关操作 */
		datepicks.on("click", function(e){
			var _this = $(this);
			onShowDate( _this );
		});

		function onShowDate( el ){
			curDateEl = el;
			setPos( curDateEl[0] );

			dpickEl.fadeIn(100);
			doc.on("click.datepick", onHideDate);
			doc.on("keydown.datepick", function(e){
				if( e.keyCode == 27 ){
					onHideDate( e );
				}
			});

			isOptionDay = !!curDateEl.attr( "data-option" );

			/*** 根据日期格式判断是否显示天数，如果不显示天数默认显示年
			 *   年月日单独控制
			 * */
			dateFormat = curDateEl.attr("data-format") || "yyyy-MM-dd";
			hasYear = dateFormat.match(/y+/);
			hasMonth = dateFormat.match(/M+/);
			hasDay = dateFormat.match(/d+/);

			if( hasYear ){
				yearContent.show(0);
				yearBox.removeClass("disabled");
			}

			if( hasMonth ){
				monthBox.removeClass("disabled")
				monthContent.show(0);
				yearContent.hide(0);
			}

			if( hasDay ){
				yearBox.removeClass("disabled");
				monthBox.removeClass("disabled")
				dayContent.show(0);
				yearContent.hide(0);
				monthContent.hide(0);
			}

			!hasYear && yearBox.addClass("disabled");
			!hasMonth && monthBox.addClass("disabled")

			initCurDate();
		}

		function onHideDate(){
			dpickEl.fadeOut(100);
			doc.off("click.datepick");
			doc.off("keydown.datepick");
		}

		/**
		 * 元素以及事件
		 */
		var dpBody = dpickEl.find(".date-body");
		var yearContent = dpBody.find(".year-content");
		var yearContentList = dpBody.find(".year-content-list")
		var monthContent = dpBody.find(".month-content");
		var dayContent = dpBody.find(".day-content");
		var dayContentList = dpBody.find(".day-content-list");
		var weekContent = dpBody.find(".date-week");

		var yearTitleEl = dpickEl.find(".year-box-title");
		var monthTitleEl = dpickEl.find(".month-box-title");
		var dayTitleEl = dpickEl.find(".day-box-title");
		var weekTitleEl = dpickEl.find(".week-box-title");

		var dateHead = dpickEl.find(".header-box");
		var headBtn = dateHead.find("span");
		var headi = dateHead.find("i");

		var yearBox = dpickEl.find(".year-box");
		var monthBox = dpickEl.find(".month-box");
		var sureEl = dpickEl.find(".date-btn-sure");

		var endYear = now().getFullYear();

		dpBody.on("click", "li", onClickLi);
		headi.on("click", onClickHeader );
		headBtn.on("click", onClickHeadDateBtn);
		sureEl.on("click", onSureSelect);

		yearContent.on("click", "span", function(e){
			var tar = $(this);

			if( tar.hasClass("backward") ){
				createYear(-1);
			}else{
				createYear(1);
			}
		});



		/**
		 * 创建年份
		 * **/
		function createYear( type ){
			var html = '';

			if( type === -1 ){
				endYear -= 12;
			}

			if( type === 1 ){
				endYear += 12;
			}

			//获取当前选择的年份
			var curYear = parseInt( yearTitleEl.dataVal() );

			for( var i=endYear; i < endYear+12; i++ ){
				html += '<li';
				html += i===curYear ? ' class="date-cur"' : '';
				html += ' data-value="' + i + '">' + i + '</li>';
			}

			//endYear = i;
			yearContentList.html( html );
		}


		/**
		 * 创建月份
		 */
		function createMonth(){
			var html = '';
			var mon = parseInt( monthTitleEl.dataVal() );

			for( var i=0; i<12; i++ ){
				html += '<li';
				html += i===mon ? ' class="date-cur"' : '';
				html += ' data-value="' + i + '">' + month[i] + '月</li>';
			}

			monthContent.html( html );
		}


		/**
		 * 创建天
		 * */
		function createDay(){
			var html = '';
			var year = parseInt( yearTitleEl.dataVal() );
			var m = parseInt( monthTitleEl.dataVal() );
			var sum = daySum[m];
			
			// 检测是否是闰年
			if( year%4===0 && year%100!==0 || year%400===0 ){
				if( m === 1 ){
					sum = 29
				}
			}			

			var d = new Date(year, m, 1);
			var w = d.getDay();
			w = w || 6;  /** 星期天是0 */

			for( var i=0; i<w; i++ ){
				html += '<li class="date-invalid"></li>';
			}

			for( var i=1; i<=sum; i++ ){
				html += '<li';
				html += isEqualLastDate(year, m, i) ? ' class="date-cur"' : '';
				html += ' data-value="' + i + '">' + i + '</li>';
			}

			dayContentList.html( html );
			isClickDay = false;
		}

		/**
		 * 创建星期
		 */
		function createWeek(){
			var html = '';

			for( var i=0; i<7; i++ ){
				html += '<span data-value="' + i + '">' + week[i] + '</span>';
			}

			weekContent.html( html );
			createDay();
		}


		/**
		 * 点击年,月,日
		 */
		function onClickLi(e){
			var _this = getTarget(e);
			if( _this.hasClass("date-invalid") ){
				return;
			}

			var titleEl = $( "." + _this.parent().attr("data-target") );
			var value = parseInt( _this.dataVal() );

			titleEl.dataVal(value);
			titleEl.text(_this.text());

			var closest = _this.closest("ul");
			formatCurElDate( closest, value );

			if( hasDay && !closest.hasClass("day-content-list") ){
				_this.closest(".date-content").fadeOut(100);
				createWeek();
			}

			if( closest.hasClass("day-content-list") ){
				isClickDay = true;
			}
		}

		/**
		 * 年月面板控制
		 * */
		function onClickHeader(e){
			var target = getTarget(e);

			if( target.parent().hasClass("disabled") ){
				return false;
			}

			var panel = target.parent().attr("data-target");
			yearContent.add(monthContent).hide(0);
			dpickEl.find("." + panel).show(0);
		}


		/**
		 * 加减年月按钮
		 * */
		function onClickHeadDateBtn( e ){
			var target = getTarget(e);
			var parent = target.parent();
			var iel = parent.children("i");
			var cur = parseInt( iel.dataVal() );
			var type = target.hasClass("odd") ? 1 : -1;
			cur += type;

			if( parent.hasClass("disabled") ){
				return false;
			}

			if( parent.hasClass("month-box") ){ //月份限制
				cur = Math.max(0, Math.min(11, cur));
				iel.dataVal(cur);
				formatCurElDate( monthContent, cur );

				cur = month[cur] + '月';
				iel.text( cur );

			}else{
				iel.dataVal(cur);
				formatCurElDate( yearContentList, cur );
				iel.text( cur );

				/** 是否超出当前面板数值范围 */
				var min = parseInt( yearContentList.children(":first-child").dataVal() );
				var max = parseInt( yearContentList.children(":last-child").dataVal() );

				if( cur < min || cur > max ){
					createYear( type );
				}
			}

			createDay();
		}

		/**
		 * 格式化当前样式
		 * **/
		function formatCurElDate( el, value, isYear ){

			if( el && el[0].tagName !== "UL" ){
				return;
			}

			el.find(".date-cur").removeClass( "date-cur" );
			el.find("[data-value='" + value + "']").addClass( "date-cur" );

			if( el.hasClass("year-content") ){
				yearTitleEl.dataVal( value );
			}

			if( el.hasClass("month-content") ){
				monthTitleEl.dataVal( value );
			}

			if( el.hasClass("day-content") ){
				dayTitleEl.dataVal( value );
			}
		}


		/**
		 * 设置日期
		 */
		function onSureSelect(){
			if( !curDateEl ){
				onHideDate();
				return;
			}

			var year = yearTitleEl.dataVal();
			var month = parseInt( monthTitleEl.dataVal() ) + 1;
			var day = parseInt( dayTitleEl.dataVal() );
			var w = parseInt( weekTitleEl.dataVal() );

			var format = dateFormat;

			/** 年份 */
			var yMa = format.match(/y+/);
			if( yMa ){
				year = yMa[0].length === 2 ? year.substr(2) : year;
				format = format.replace( yMa[0], year );
			}

			/** 月份 */
			var mmMa = format.match(/M+/);
			if( mmMa ){
				month = mmMa[0].length === 2? fill(month): month;
				format = format.replace( mmMa[0], month );
			}

			/** 天 */
			var dMa = format.match(/d+/);
			if( dMa ){
				if( !isOptionDay || isOptionDay && isClickDay ){

					day = dMa[0].length === 2? fill(day): day;
					format = format.replace( dMa[0], day );

				}else{ /** 去掉日的显示 */
					if( /d+[^\d]$/.test(format) ){
						format = format.replace( /d+[^\d]$/, '' );
					}else{
						format = format.replace( /[^\d]{0,1}d+$/, '' );
					}
					
				}
			}

			/** 星期 */
			var wMa = format.match(/w+/);
			if( wMa ){
				format = format.replace( wMa[0], w );
			}

			dateElVal( format );
			
			curDateEl.dataVal( year, 'year' );
			curDateEl.dataVal( month, 'month' );
			curDateEl.dataVal( day, 'day' );
			
			lastDate = new Date(year, month, day);
			onHideDate();
			
			typeof curDateEl[0].callback === 'function' && curDateEl[0].callback(curDateEl);
		}


		/** 公共行数区 */
		function now(){
			return new Date();
		}

		function evt(e){
			return e || window.event;
		}

		function getTarget(e){
			e = evt(e);
			return $(e.target || e.srcElement);
		}

		function stopPropa(e){
			e = evt(e);
			/** 防止冒泡 */
			if( e.stopPropagation ){
				e.stopPropagation();
			}

			if( e.hasOwnProperty("cancelBubble") ){
				e.cancelBubble = true;
			}
		}

		function getPos( el ){		
			var bound = el.getBoundingClientRect();  //由于 getBoundingClientRect 获取到的对象是只读，所以copy一份
			var pos = {};
			
			for( var name in bound ){
				pos[name] = bound[name];
			}
			
			return pos;
		}

		function setPos( ele ){
			var wWidth = $(win).width();
			var wHeight = $(win).height();
			var dpWidth = dpickEl.width();
			var dpHeight = dpickEl.height();

			var pos = getPos( ele );
			
			if( pos.left + dpWidth > wWidth ){
				pos.left = wWidth - dpWidth;
			}

			if( pos.top + pos.height + dpHeight > wHeight ){
				pos.top = wHeight - dpHeight - pos.height;
			}

			dpickEl.css({
				left: pos.left,
				top: pos.top + pos.height + 5
			});
		}

		function fill( n ){
			return n<10? "0"+n: n;
		}

		function isEqualLastDate( year, mon, day ){
			return !isOptionDay && lastDate.getFullYear()==year && lastDate.getMonth()==mon && lastDate.getDate() == day
		}


		/**
		 * 初始化当前日期
		 * */
		function initCurDate(){
			var d = now();
			var year = d.getFullYear();
			var mon = d.getMonth();
			var day = d.getDate();
			var w = d.getDay();

			/** 输入框本身有值 */
			var dateStr = curDateEl.dataVal();

			if( dateStr ){
				dateStr = dateStr.match(/\d+/g);
				if( dateStr ){

					/** 检测是否是逆序 */
					if( /yy$/.test(dateFormat) ){
						dateStr.reverse();
					}


					if( dateStr.length == 1 ){  /** 单独年月日的时候 */

						var value = parseInt( dateStr[0] );
						hasYear && d.setYear( value );
						hasMonth && d.setMonth( value-1 );
						hasDay && d.setDate( value );

					}else if( dateStr.length == 2 ){  /** 单独年月 或 月日的时候 */
						if( hasYear ){
							d.setYear( dateStr[0] );
							d.setMonth( dateStr[1]-1 );
						}else{
							d.setMonth( dateStr[0]-1 );
							d.setDate( dateStr[1] );
						}
					}else{
						d = new Date( dateStr );
					}

					/** 设置后重新获取一遍 */
					year = d.getFullYear();
					mon = d.getMonth();
					day = d.getDate();
					w = d.getDay();
				}
			}

			yearTitleEl.dataVal( year );
			yearTitleEl.text( year );

			monthTitleEl.dataVal( mon );
			monthTitleEl.text( month[mon] + "月" );

			dayTitleEl.dataVal( day );
			weekTitleEl.dataVal( w );
			lastDate = new Date(year, mon, day);

			createYear();
			createMonth();
			createWeek();
		}


		function dateElVal(value){
			var isInput = "INPUT,SELECT,TEXTAREA".indexOf( curDateEl[0].tagName ) > -1;

			if( value ){
				isInput && curDateEl.val(value);
				!isInput && curDateEl.text(value);

				curDateEl.dataVal( value );
				return this;

			}else{

				if(isInput) return curDateEl.val().trim();
				else return curDateEl.text().trim();
			}
		}


		$.fn.dataVal = function( value, name ){
			name = name || 'value';
			
			if( typeof value !== "undefined" ){

				this.attr("data-"+name, value);
				return this;

			}else{
				return this.attr("data-"+name);
			}
		}


		/**
		 * 绑定事件冒泡
		 */
		dpickEl.add(datepicks).on("click", stopPropa);
	}


	dataPick.on = function(el, evtName, fn){

		if( el.addEventListener ){
			el.addEventListener( evtName, fn, false );

		}else if( el.attachEvent ){
			el.attachEvent( "on" + evtName, fn );

		}else{
			el["on" + evtName] = fn
		}
	}


	/**
	 * 依赖jq运行 *
	 * 检测jq
	 * */
	dataPick.check = function(){

		if( typeof jQuery !== "undefined" ){
			dataPick();
			return;
		}


		var jq = document.createElement("script");
		jq.setAttribute( "type", "text/javascript" );
		jq.setAttribute( "src", "http://www.iwan0.com/cdn/js/jquery-1.11.2.min.js" );

		var head = document.getElementsByTagName('head')[0];

		if( head.appendChild ){
			head.appendChild( jq );
		}else{
			head.insertBefore(jq, head.lastChild);
		}


		dataPick.on(jq, "readystatechange", function(){
			if( !jq.isLoad ){
				if (jq.readyState == 'complete' || jq.readyState == 'loaded')
				{
					jq.isLoad = true;
					dataPick();
				}
			}
		});


		dataPick.on(jq, "load", function(){
			if( !jq.isLoad ){
				jq.isLoad = true;
				dataPick();
			}
		});
	}

	dataPick.check();

})( window, document );

