/*
 * Flexigrid for jQuery - New Wave Grid
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Version: 2.0
 * $Date: 2011-07-13 16:53:00 +0800 (Tue, 13 Jul 2011) $

*/


var fl_grid = function (){};
var fl_mod = {};
var fl_events = {};

(function( $ ){

fl_grid.prototype = {
	
	//appearance
	height: 'auto'
	,width: 'auto'
	,className: 'fl-grid'
	,viewtype: 'standard'
	
	//state
	,page: 1
	,total: 1
	,rp: 15
	,rpOptions: [10,15,20,25,40]
	,fid: 0
	,autorender: true
	,column_order: []
	,dpane: ''
	
	//ajax --> consider moving to a module
	,url: ''
	,autoload: false
	,dataType: 'json'
	,method: 'POST'
	,timeout: 30
	,onSuccess: false
	,onTimeout: false
	,onError: false	
	
	//layouts
	,fl_hdiv: '<div class="fl-hdiv"><div class="fl-hdiv-inner"><table class="fl-table" ><thead></thead></table></div></div>'
	,fl_bdiv: '<div class="fl-bdiv"><div class="fl-bdiv-inner"><table class="fl-table" ><tbody></tbody></table></div></div>'
	,fl_fpane: function (c) 
		{
		if (!c) c = this.dpane;
		return '<div class="fl-fpane '+ c +' ">' + this.fl_hdiv + this.fl_bdiv +'</div>'; 
		}
	,fl_td: '<div class="fl-td-div"></div>'
	,fl_th: '<div class="fl-th-div"></div>'
	,fl_th_con: '<div class="fl-th-con"></div>'  
	,fl_view_standard: function () 
		{ 
		$(this).append('<div class="fl-grid-inner"><div class="fl-hbdiv">' + this.fl_fpane() + '</div></div>'); 
		}

	//default events
	,render: function ()
		{

		//trigger module beforeRender events
		
		this.trigger_events('beforeRender');
					
		//first unbind and empty then add default content
		$("*",this).unbind();
		$(this).empty();
		
		//build view type
		this['fl_view_' + this.viewtype ]();
		
		this.build_header();
		this.reload();
		this.sync_scroll();
		
		$(this).show().trigger('resize');
		
		//trigger module afterRender events
		
		this.trigger_events('afterRender');
		
		}
	,build_header: function ()
		{
		
		
			//if no order specified create one
			
			if (!this.column_order.length)
				{
				if (this.colModel)
					{
					
					var c = [];
					
					for (var k in this.colModel)
						{
							c[c.length] = k;
						}
					}
					
					this.column_order = c;
				}


			
			$('thead',this).each(
				function ()
					{
					
					var tr = $('<tr />').addClass('fl-tr');
					$(this).append(tr);
					
					}
			)
			
			
			//add columns base on column order
			for (var co=0; co<this.column_order.length; co++)
				{


					var th = $('<th />')
							.addClass('fl-th')
							.addClass('fl-col-'+this.column_order[co])
							.prop('column_name',this.column_order[co])
							;
							
					var cm = this.colModel[this.column_order[co]];

					$(th)
					.append(cm.display)
					.width(cm.width)
					;
					
					if (cm.align)
						$(th).css({'text-align':cm.align});
						
					$(th)
					.wrapInner(this.fl_th)
					.append(this.fl_th_con)
					;
					
					var pane = '.fl-fpane';
					if (cm.pane) 
						pane += '-'+cm.pane;			
					else if (this.dpane)
						pane += '-'+this.dpane;
					
					$(pane+' thead tr',this).append(th);
				
				}

		}
	,dragStart: function ()
		{
			if (this.dragType)
				$(this).trigger('dragStart_'+this.dragType);
		}
	,dragMove: function ()
		{	
			if (this.dragType)
				$(this).trigger('dragMove_'+this.dragType)
				;
		}
	,dragEnd:	function ()
		{	
			if (this.dragType)
				{
				$(this).trigger('dragEnd_'+this.dragType);
				this.dragType = '';
				}
		}
	,disableSelection: function() {
		$(this).bind( 'selectstart dragstart mousedown', function( event ) {
				return false;
			});
	}
	,enableSelection: function() {
		$(this).unbind('selectstart dragstart mousedown');
	}
	,reload: function ()
		{
		
			var rows = $(this).data('rows');

			if (!rows) return true;
			
			var start = ((this.page-1) * this.rp);
			var end = start + this.rp;
			
			if (end>rows.length) end = rows.length;
			
			for (var i=start; i<end; i++)
				{

				$('tbody',this).each(
					function ()
						{
						
						var tr = $('<tr />').addClass('fl-tr');
						$(this).append(tr);
						
						}
				)

				for (var co=0; co<this.column_order.length; co++)
					{
						var td = $('<td />')
								.addClass('fl-td')
								.addClass('fl-td-'+this.column_order[co])
								;

						var cm = this.colModel[this.column_order[co]];

						var row = rows[i][this.column_order[co]];

						$(td).append(row);

						if (i==start)
							$(td).width(cm.width);
						
						if (cm.align)
							$(td).css({'text-align':cm.align});
							
						$(td)
						.wrapInner(this.fl_td)
						;			

						var pane = '.fl-fpane';
						if (cm.pane) 
							pane += '-'+cm.pane;			
						else if (this.dpane)
							pane += '-'+this.dpane;

						$(pane+' tbody tr:last',this).append(td);
					
					}

				}

			$(this).trigger('resize');	
			this.trigger_events('afterReload')
			
		}
	,resize: function ()
		{
		
		
			if (this.height == 'auto') return true;
			
			var gh = $(this).height();
			var bh = $('.fl-bdiv',this).height();
			
			var nh = this.height - (gh-bh);
			
			if (nh<0) nh = 'auto';
			
			$('.fl-bdiv',this).height(nh);
			
			$(this).width(this.width);
			
			this.trigger_events('afterResize');

			
		}
	,col_resize: function ()
		{
			
			var co = this.column_order;
		
			for (var c=0; c<co.length; c++)
				{
				var cm = this.colModel[co[c]];

				
				$('.fl-col-'+co[c],this).width(cm.width);
				$('.fl-td-'+co[c]+':first',this).width(cm.width);
				
				}

			this.trigger_events('afterColResize');			
							
		}		
	,sync_scroll: function ()
		{

		$('.fl-bdiv',this).scroll
		(
			function ()
				{
				var t = this;
				$(this).prev().each
				(
					function ()
						{
						this.scrollLeft = t.scrollLeft;
						}
				);

				$(this).parent().siblings().find('.fl-bdiv').each
				(
					function ()
						{
						this.scrollTop = t.scrollTop;
						}
				);
				
				}
		);
		
		this.trigger_events('afterSyncScroll');	

		}
	,trigger_events: function (mtype)
		{
			
			var mod;
			var ev;
		
			for (mod in fl_events)
				{
					for (var ev in fl_events[mod])
						{
							if (ev==mtype)
								$(this).trigger(mod+'_'+fl_events[mod][ev]);
						}
				}
			
		}
	,parseTable: function (){} // override on a module

};

  $.fn.flexigrid = function(p) {
	
	var grid = [];

	//retain chainability by returning actual flexigrid rather than parsed table
		
	this.each(
		function ()
			{
				var fid = this.fid;
				var gid = grid.length;
				
				if (fid==undefined)
					{
						
						var oldclass = '';
						
						if (this.className) oldclass = this.className;
						
						if (this.nodeName=='DIV')
							grid[gid] = this;
						else
							grid[gid] = document.createElement('div');

						var f = new fl_grid();
						var g = grid[gid];
						
						//apply custom settings
						$.extend(g,f);
						
						if (g.custom)
							{
								for (var m=0; m<g.custom.length;m++)
									{
										$.extend(g,fl_mod[g.custom[m]]);
									}
							}							
						else
							{	
							for (var m in fl_mod)
								{
									if (g.except_modules)
										if ($.inArray(m,g.except_module)>-1)
											{
											continue;
											}
										$.extend(g,fl_mod[m]);
								}
							}
						

						$.extend(g,p);

						//add identifiers
						$(g).addClass(oldclass);
						if (this.id) $(g).attr('id',this.id);
						
						//if table parse data then remove
						if (this.nodeName!='DIV')
						{
							if (this.nodeName=='TABLE')
								{
								g.parseTable(this);
								}
						
							$(this).before(g);
							$(this).remove();
						}
						
						fid = $('.fl-grid').length;
						g.fid = fid;
						
						if (g.autorender)
							$(g).trigger('render');
						else
							$(g).hide();
							
						grid[gid] = g;
						
					}
				else
					{
						$(this).prop(p);
						grid[gid] = this;
					}	
					
			}
	);
	
	return $(grid);			
				
  };
 
 	//global events
 
 	//end drags
	$('body')
		.mousemove(
			function (e)
				{
				$('.fl-grid')
				.prop('mouse_state_now',e)
				.trigger('dragMove')
				;
				}	
			)
		.bind("mouseup blur",
			function (e)
				{
				$('.fl-grid')
				.prop('mouse_state_end',e)
				.trigger('enableSelection')
				.trigger('dragEnd')
				;
				}
		);

	//destry and unbind grids
	$(window)
	.unload(
		function()
			{
			fl_grid = null;
			fl_mod = null;
			fl_events = null;
			}
	);
  
})( jQuery );




/*
 * Flexigrid Column Mover
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_colmove
purpose: can switch columns
requirement: none
when to load: after core
*/

(function( $ ){

fl_mod['fl_colmove'] = {
	
	
	//layouts
	fl_div_colmove: '<div class="fl-colmove"></div>'
	//events
	,fl_colmove_addMover: function () {

			//add column move guide
			$('.fl-hbdiv',this).prepend(this.fl_div_colmove);
	

			//add column move feature				
			$('.fl-th-div',this)
				.mousedown(
					function (e)
						{
						$(this).parents('.fl-grid')
						.prop('dragType','colmove')
						.prop('mouse_state_start',e)
						.prop('colTarget',$(this).parent().prop('column_name'))
						.trigger('disableSelection')
						.trigger('dragStart')
						.addClass('fl-colmoving')
						;
						}
				)		
				.mouseenter(
						function ()
						{
						
							var self = $(this).parents('.fl-grid').get(0);
							
							if (self.dragType!='colmove') return true;
							
							var dt = $(this).parents('th').prop('column_name');
							var cm = self.colModel[self.colTarget];

							var cpane = '.fl-fpane';
							if (cm.pane) 
								cpane += '-'+cm.pane;			
							else if (self.dpane)
								cpane += '-'+self.dpane;
								
								
							if ($(self).find(cpane+' thead .fl-th').length<=1)
								$(self).find('.fl-colmove')
								.addClass('fl-colmove-not-allowed')
								.removeClass('fl-colmove-allowed');
							else		
								$(self)
								.find('.fl-colmove')
								.addClass('fl-colmove-allowed')
								.removeClass('fl-colmove-not-allowed');
							
							self.dropTarget = dt;
							
						}		
				)
				.mouseleave(
						function ()
						{
							
							var self = $(this).parents('.fl-grid').get(0);
						
							if (self.dragType!='colmove') return true;
							
							$(self)
							.prop('dropTarget','')
							.find('.fl-colmove').removeClass('fl-colmove-allowed')
							.removeClass('fl-colmove-not-allowed');
							;						
						}		
				)
				;


	}
	,set_col_order: function()
		{
			var c_o = [];
			$('.fl-th',this).each(
				function ()
					{
					c_o[c_o.length] = this.column_name;
					}
			);
			//console.log(c_o);
			this.column_order = c_o;
		}			
	//drag events
	,dragStart_colmove: function ()
		{

			var col = this.colTarget;
			var cm = this.colModel[col];

			var xpos = this.mouse_state_start;
			var tpos = $('.fl-col-'+col,this).offset();
			var gpos = $(this).offset();

			
			var t = tpos.top-gpos.top;
			var l = tpos.left-gpos.left;
			var t2 = xpos.pageY-gpos.top;
			var l2 = xpos.pageX-gpos.left;
			
			$('.fl-col-'+col,this).addClass('fl-th-dragged');

			var ow = $('.fl-colmove',this)
				.empty()
				.append(cm.display)
				.css({left:l,top:t})
				.show()
			;
			
			var ow = $('.fl-colmove',this).width('auto').width();
			
			$('.fl-colmove',this)
				.width(cm.width)
				.animate({width:ow,left:l2,top:t2},'fast')
			;
			
		}	
	,dragMove_colmove: function ()
		{
			var xpos = this.mouse_state_now;
			var gpos = $('.fl-hbdiv',this).offset();

			var t = xpos.pageY-gpos.top;
			var l = xpos.pageX-gpos.left;
			
			$('.fl-colmove',this)
				.css({left:l,top:t})
				.show()
				;
				
			pos = null;	
		}
	,dragEnd_colmove: function ()
		{

			var self = this;

			var col = this.colTarget;
			var cm = this.colModel[col];
			
			$('.fl-col-'+col,this).removeClass('fl-th-dragged');
			$('.fl-colmove',this).hide();
			$(this).removeClass('fl-colmoving');
			
			var dcol = this.dropTarget;

			if (!dcol) return true;
			if (dcol)
			
			var dm = this.colModel[dcol];
			
			var ct_i = $('.fl-th',this).index($('.fl-col-'+col,this));
			var dt_i = $('.fl-th',this).index($('.fl-col-'+dcol,this));

			var cpane = '.fl-fpane';
			if (cm.pane) 
				cpane += '-'+cm.pane;			
			else if (this.dpane)
				cpane += '-'+this.dpane;

			var dpane = '.fl-fpane';
			if (dm.pane) 
				dpane += '-'+dm.pane;			
			else if (this.dpane)
				dpane += '-'+this.dpane;
			
			if ($(cpane+' thead .fl-th',this).length<=1) return true;	

			if (ct_i>dt_i)
				{

				$('.fl-col-'+dcol,this).before($('.fl-col-'+col,this));

				var tr_i = 0;	
				$(dpane+' .fl-bdiv tr',this).each(function()
					{
						$('.fl-td-'+dcol,this).before($(cpane+' .fl-bdiv tr:eq(' + tr_i + ') .fl-td-'+col,$(self)));		
						tr_i += 1;
					}
				);
				
				}
			else
				{
				$('.fl-col-'+dcol,this).after($('.fl-col-'+col,this));

				var tr_i = 0;	
				$(dpane+' .fl-bdiv tr',this).each(function()
					{
						$('.fl-td-'+dcol,this).after($(cpane+' .fl-bdiv tr:eq(' + tr_i + ') .fl-td-'+col,$(self)));		
						tr_i += 1;
					}
				);

				}
				
			cm.pane = dm.pane;	
				
			$(this)
				.trigger('set_col_order')
				.trigger('col_resize')
				;					
			
		
		}
		
			
}

fl_events['fl_colmove'] = {afterRender:'addMover'};


})( jQuery );

/*
 * Flexigrid Column Resizer
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_colres
purpose: can place a column in a frozen pane where it always stays on the left
requirement: none
when to load: after core
*/

(function( $ ){

fl_mod['fl_colres'] = {
	
	//appearance
		min_col_width: 50
	//layouts
		,fl_div_coldrag: '<div class="fl-coldrag"></div>'
		,fl_div_colguide: '<div class="fl-colguide"></div>'
	//events
		,fl_colres_addResizer: function () {

			//add guide
			$('.fl-hbdiv',this).prepend(this.fl_div_colguide);
			
			//add dragger
			$('.fl-th-con',this).append(this.fl_div_coldrag);
	
			//add col-resize method
			$('.fl-coldrag',this)
				.mousedown(
					function (e)
						{
						$(this).parents('.fl-grid')
							.prop('dragType','colresize')
							.prop('mouse_state_start',e)
							.prop('colTarget',$(this).parents('th').prop('column_name'))
							.trigger('disableSelection')
							.trigger('dragStart')
							.addClass('fl-colresizing')
							;
						}
				);
		
		
		}
		,set_colwidth_standard: function ()
			{
	
				var start = this.mouse_state_start;
				var end = this.mouse_state_end;
				var col = $('.fl-col-'+this.colTarget,this);
				var w = col.width();
				
				w += end.pageX - start.pageX;
				
				if (w<this.min_col_width) w = this.min_col_width;
				
				this.colModel[this.colTarget].width = w;
	
			}
	// drag events
		,dragMove_colresize: function()
			{
				var pos = this.mouse_state_now;
				var gpos = $('.fl-hbdiv',this).offset();
				
				var l = pos.pageX - gpos.left - 3;
				$('.fl-colguide',this).css('left',l).show();
				
			}	
		,dragEnd_colresize: function ()
			{
			
				$('.fl-colguide',this).hide();
			
				this.dragType = '';
				$(this).removeClass('fl-colresizing');
				
				if (this['set_colwidth_'+this.viewtype])
					this['set_colwidth_'+this.viewtype]();
				else
					this.set_colwidth_standard();	
				
				$(this).trigger('col_resize');
				
			}
		
			
}

fl_events['fl_colres'] = {afterRender:'addResizer'};


})( jQuery );


/*
 * Flexigrid Freeze Pane
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_fp
purpose: can place a column in a frozen pane where it always stays on the left
requirement: none
when to load: after core
*/

(function( $ ){

fl_mod['fl_fp'] = {
	
	
	//layouts
	fl_view_freezepane: function () 
		{ 
		$(this).append('<div class="fl-grid-inner"><div class="fl-hbdiv">' + this.fl_fpane('fl-fpane-left') + this.fl_fpane('fl-fpane-right') + '</div></div>'); 
		}

	//events
	,fl_fp_fixwidth: function ()
		{
		
			if (this.viewtype=='freezepane')
			{

			var w1 = $('.fl-fpane-left .fl-table',this).outerWidth();
			$('.fl-fpane-left',this).width(w1-1);
			$('.fl-fpane-right',this).css('margin-left',$('.fl-fpane-left',this).outerWidth());
	
			
			}
		
		}
	,fl_fp_sync_hover: function()
		{
		
		$('.fl-bdiv tr',this).hover
		(
			function ()
				{
				var tr = this;
				var self = $(this).parents('.fl-grid').get(0);
				
				if (self.dragType) return false;
				
				var i = $('tr',$(this).parent()).index(this);
				$(this).parents('.fl-fpane').siblings().find('.fl-bdiv tr:eq('+i+')').addClass('fl-tr-hover');
				
				}
			,function ()
				{
				var tr = this;
				var self = $(this).parents('.fl-grid').get(0);
				
				if (self.dragType) return false;
				var i = $('tr',$(this).parent()).index(this);
				
				$(this).parents('.fl-fpane').siblings().find('.fl-bdiv tr:eq('+i+')').removeClass('fl-tr-hover');
				
				}

		);

		
		}	
}

fl_events['fl_fp'] = {afterRender:'fixwidth',afterReload: 'sync_hover',afterColResize:'fixwidth'};

  $(window)
  .resize(
  	function()
  		{
  		$('.fl-grid-fw').trigger('fl_fp_fixwidth');
  		}
  );


})( jQuery );

/*
 * Flexigrid Full Width
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_fw
purpose: makes flexigrid use percentage width for columns making use of the full width of the grid
requirement: none
when to load: after core
*/

(function( $ ){

fl_mod['fl_fw'] = {

	//layouts
	fl_view_fullwidth: function () 
		{ 
		$(this).addClass('fl-grid-fw');
		$(this).append('<div class="fl-grid-inner"><div class="fl-hbdiv">' + this.fl_fpane() + '</div></div>'); 
		}

	//events
	,fl_fw_fixwidth: function ()
		{
		
		if (this.viewtype=='fullwidth')
		{
		
		var w2 = $('.fl-bdiv .fl-table',this).outerWidth();
		
		$('.fl-hdiv .fl-hdiv-inner',this).width(w2+2);
		}
		
		}
	,set_colwidth_fullwidth: function ()
		{
		
		if (this.viewtype=='fullwidth')
			{
			var start = this.mouse_state_start;
			var end = this.mouse_state_end;
			var col = $('.fl-col-'+this.colTarget,this);
			
			
			//if (!s_col) return true;
			
			var w = col.width();
			
			var diff = end.pageX - start.pageX;
			
			var tw = $(this).width();
			
			var df = Math.ceil((diff/tw) * 100);


			if ($(col).next().length)
				var s_col = $(col).next().get(0);
			else
				var s_col = $(col).prev().get(0);
				
				
			var s_target = $(s_col).prop('column_name');
			
			var cm = this.colModel[this.colTarget];
			var s_cm = this.colModel[s_target];
						
			var ow = parseInt(cm.width);
			var s_ow = parseInt(s_cm.width);

			var s_pw = s_ow - df;
			var pw = ow + df;
			
			var mw = Math.ceil((this.min_col_width/tw)*100);
			
			if (pw<mw)
				{
				pw = mw;
				s_pw = (ow+s_ow) - mw;
				}
				
			if (s_pw<mw)
				{
				s_pw = mw;
				pw = (ow+s_ow) - mw;
				}	

			cm.width = pw+'%';
			s_cm.width = s_pw+'%';
			
			}
		
		}	
}

})( jQuery );

/*
 * Flexigrid Menu
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_menu
purpose: add context menu on column headers
requirement: none
when to load: after render

*/

(function( $ ){

fl_mod['fl_menu'] = {

			//layouts
			 fl_menu_table: '<table class="fl-menu-table" cellspacing="0" ></table>'
			,fl_coltog: '<div class="fl-coltog"><div class="fl-coltog-inner"></div></div>'
			,fl_menu_item_trigger: function (item)
					{
						var self = this;
					
						var tr = $('<tr class="fl-menu-tr" />')
								.append('<td class="fl-menu-td fl-menu-col1"><span class="fl-icon"></span></td>')
								.append('<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + item.display + '</span></td>')
								.append('<td class="fl-menu-td fl-menu-col3"><span class="fl-icon"></span></td>')
								.click(function()
									{
									
									$(self.fl_menu).hide();
									
									var val = false;
									if (item.value) val = item.value;
									self[item.action](val);
									}
								)
								;
								
						if (item.class) $(tr).addClass(item.class);
						
						return tr;
					}
			,fl_menu_item_separator: function (item)
					{
						var tr = $('<tr class="fl-menu-br" />')
							.append('<td class="fl-menu-td" colspan="3"><div class="fl-menu-br-div"></div></td>')
							;
						return tr;
					}
			,fl_menu_item_submenu: function (item)
					{
						var tr = $('<tr class="fl-menu-tr fl-menu-sm" />')
								.append('<td class="fl-menu-td fl-menu-col1"><span class="fl-icon"></span></td>')
								.append('<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + item.display + '</span></td>')
								.append('<td class="fl-menu-td fl-menu-col3"><span class="fl-submenu"></span></td>')
								;
								
						var sub = $('<div class="fl-menu" />').append(this.fl_menu_table);
						
						$(sub).append(this.fl_menu_build_items(item.subgroup));
						
						$('.fl-submenu',tr).append(sub);
								
						return tr;
					}
			,fl_menu_item_colcheck: function (key,item)
					{
						
						var chk = 'checked="checked"';
						var self = this;
						
						if (item.visible===false) chk = '';
					
						var tr = $('<tr class="fl-menu-tr" />')
								.append('<td class="fl-menu-td fl-menu-col1"><input type="checkbox" autocomplete="off" class="fl-cb" '+chk+' value="'+key+'" /></td>')
								.append('<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + item.display + '</span></td>')
								.append('<td class="fl-menu-td fl-menu-col3"><span class="fl-icon"></span></td>')
								.click( function (e)
									{
									
									var obj = (e.target || e.srcElement);
									var cb = $('.fl-cb',this);
									var tg = cb.val();
									
									if ($('.fl-th:visible',self).length==1&&cb.attr('checked')) return false;
									
									if (obj.nodeName!='INPUT') 
										{
										
										if (cb.attr('checked'))
											{
											cb.attr('checked',false);
											} else {
											cb.attr('checked',true);
											}
											
										}	
										
										$('.fl-col-'+key,self).toggle();
										$('.fl-td-'+key,self).toggle();
											
										
									}
								)
								;
								
						return tr;
					}		
			//menu model
			,menu_items: [
					{type:'togglecol'}
/*
					{type:'trigger',action:'align_column',display:'Align Left',value:'left'}
					,{type:'trigger',action:'align_column',display:'Align Right', value: 'right'}
					,{type:'separator'}
					,{type:'submenu',display:'Toggle Columns',subgroup:[{type:'togglecol'}]}

					 {type:'trigger',action:'sort_asc',display:'Sort Ascending'}
					,{type:'trigger',action:'sort_desc',display:'Sort Ascending'}
					,{type:'separator'}
*/
				]
			//events - to avoid collision with other modules use module_name_functionname for module events
			,fl_menu_init: function () 
				{
				
					var m_i = this.menu_items;
					
					if (!m_i.length) return true;

					this.fl_menu = $('<div class="fl-menu" />').append(this.fl_menu_table);
					
					//add fl-menu
					$(this).prepend(this.fl_menu);
					
					$(this.fl_menu).append(this.fl_menu_build_items(m_i));
					
					this.fl_menu_build_toggle();	
						
				}
			,fl_menu_build_items: function (m_i)
				{
				
					var tbody = $('<tbody class="fl-menu-body" />');

					for (var m = 0; m < m_i.length; m++)
						{
						
							if (m_i[m].type=='togglecol')
							{
								var co = this.column_order;
								for (c=0;c<co.length;c++)
									{
									var cm = this.colModel[co[c]];
									var item = this.fl_menu_item_colcheck(co[c],cm);
									$(tbody).append(item);
									}
							}
							else
							{
						
								if (!this['fl_menu_item_'+m_i[m].type]) continue;
	
								var item = this['fl_menu_item_'+m_i[m].type](m_i[m]);
									
								$(tbody).append(item);
							}
						}
					
					return tbody;	
				
				}	
			,fl_menu_build_toggle: function ()
				{				
					//add coltog button
					$('.fl-th-con',this).append(this.fl_coltog);

					$('.fl-coltog',this).click
					(
						function ()
							{
							
							var self = $(this).parents('.fl-grid').get(0);
							
							$(self).prop('colTarget',$(this).parents('th').prop('column_name'));
							self.trigger_events('beforeTogColClick');

							var l = this.offsetLeft;
							l += $(this).parents('.fl-th').get(0).offsetLeft;
							l += $(this).parents('.fl-fpane').get(0).offsetLeft;
							l += $(this).parents('.fl-hbdiv').get(0).offsetLeft;
							l -= $(this).parents('.fl-hdiv').get(0).scrollLeft;
							
							var t = this.offsetTop;
							
							t = $(this).parents('.fl-hbdiv').find('.fl-bdiv').get(0).offsetTop;
							t += $(this).parents('.fl-hbdiv').get(0).offsetTop;
							
							var w = $(self).width();
							var w2 = $(self).find('.fl-menu:first').width();
							
							if ((l+w2)>w) 
								{
								l = l - w2 + $(this).width();
								}
							
							var k = l+'px';
							var k2 = $(self).find('.fl-menu:first').css('left');
							
							if (k==k2) 
								$(self).find('.fl-menu:first').toggle('fast');
							else
								$(self).find('.fl-menu:first').css({left:l,top:t}).show('fast');
							
							}
							
							
					);


					$('.fl-menu:first',this).mouseleave
					(
						function ()
							{
							$(this).hide();
							}
					);
					
					$(this).mouseleave
					(
						function ()
							{
							$('.fl-menu:first',this).hide();
							}
					);


				}
			//basic trigger events can be transferred to different module
			,align_column: function (atype)
				{
					var col = this.colTarget;
					if (!col) return true;
					if (atype)
						{
						$('.fl-td-'+col,this).css('text-align',atype);
						$('.fl-col-'+col,this).css('text-align',atype);
						}
				}	
			
		};


fl_events['fl_menu'] = {afterRender:'init'};


})( jQuery );

/*
 * Flexigrid Table Parser
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_table_parser
purpose: Parses static table
requirement: none
when to load: manually triggered

*/

(function( $ ){

fl_mod['fl_table_parser'] = {
			//events
			parseTable: function (tableobj)
				{
				//get column headers
				$('thead th',tableobj).each
					(
						function ()
							{
							
							}
					);
				
				//get rows into data
				}

		};


})( jQuery );
