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
	,min_col_width: 50
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
	,fl_hdiv: '<div class="fl-hdiv"><div class="fl-hdiv-inner"><table class="fl-table" cellspacing="0"><thead></thead></table></div></div>'
	,fl_bdiv: '<div class="fl-bdiv"><div class="fl-bdiv-inner"><table class="fl-table" cellspacing="0"><tbody></tbody></table></div></div>'
	,fl_fpane: function (c) 
		{
		if (!c) c = this.dpane;
		return '<div class="fl-fpane '+ c +' ">' + this.fl_hdiv + this.fl_bdiv +'</div>'; 
		}
	,fl_td: '<div class="fl-td-div"></div>'
	,fl_th: '<div class="fl-th-div"></div>'
	,fl_th_con: '<div class="fl-th-con"><div class="fl-coldrag"></div></div>'  
	,fl_view_standard: function () 
		{ 
		$(this).append('<div class="fl-grid-inner"><div class="fl-hbdiv">' + this.fl_fpane() + '</div></div>'); 
		}

	//default events
	,render: function ()
		{

		//trigger module beforeRender events
		
		this.module_events('beforeRender');
					
		//first unbind and empty then add default content
		$("*",this).unbind();
		$(this).empty();
		
		//build view type
		this['fl_view_' + this.viewtype ]();
		
		this.build_header();
		this.reload();
		this.sync_scroll();
		
		$(this).show().trigger('resize');
		
		$('.fl-hbdiv',this).prepend('<div class="fl-colguide"></div>');
		$('.fl-hbdiv',this).prepend('<div class="fl-colmove"></div>');
		
		//trigger module afterRender events
		
		this.module_events('afterRender');
		
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
			
			
			//add col-resize feature
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
				.trigger('col_resize')
				.trigger('set_col_order')
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
	,col_resize: function ()
		{
			
			var co = this.column_order;
		
			for (var c=0; c<co.length; c++)
				{
				var cm = this.colModel[co[c]];

				
				$('.fl-col-'+co[c],this).width(cm.width);
				$('.fl-td-'+co[c]+':first',this).width(cm.width);
				
				}

			this.module_events('afterColResize');			
							
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
			this.module_events('afterReload')
			
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
			
			this.module_events('afterResize');

			
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
		
		this.module_events('afterSyncScroll');	

		}
	,module_events: function (mtype)
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


