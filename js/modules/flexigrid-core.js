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
	,fl_hdiv: '<div class="fl-hdiv"><div class="fl-hdiv-inner"><table class="fl-table" cellspacing="0" ><thead></thead></table></div></div>'
	,fl_bdiv: '<div class="fl-bdiv"><div class="fl-bdiv-inner"><table class="fl-table" cellspacing="0" ><tbody></tbody></table></div></div>'
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
		
		this.module_events('beforeRender');
					
		//first unbind and empty then add default content
		$("*",this).unbind();
		$(this).empty();
		
		//build view type
		if (this['fl_view_' + this.viewtype ])
			this['fl_view_' + this.viewtype ]();
		else
			this.fl_view_standard();	
		
		this.build_header();
		this.reload();
		this.sync_scroll();
		
		$(this).show().trigger('resize');
		
		//trigger module afterRender events
		
		this.module_events('afterRender');
		
		}
	,build_header: function ()
		{
		
			this.module_events('beforeReload');
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
						
					if (cm.visible===false)
						$(th).hide();	
						
					$(th)
					.wrapInner(this.fl_th)
					.append(this.fl_th_con)
					;
					
					var pane = '.fl-fpane';
					if (cm.pane) 
						pane += '-'+cm.pane;			
					else if (this.dpane)
						pane += '-'+this.dpane;
					
					//handle misconfigured panes --> consider removing and let user fix it	
					if (!$(pane+' thead tr',this).length) 
						{
						pane = '.fl-fpane';
						this.dpane = '';
						cm.pane = '';	
						}
						
					$(pane+' thead tr',this).append(th);
				
				}
				
				this.module_events('afterReload');
			

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
	,disableSelection: function(target) {
	
		if (!target) target = this;
	
		$(target).bind( 'selectstart dragstart mousedown', function( event ) {
				return false;
			});
	}
	,enableSelection: function(target) {
	
		if (!target) target = this;
	
		$(target).unbind('selectstart dragstart mousedown');
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

				$('.fl-bdiv tbody',this).each(
					function ()
						{
						
						var tr = $('<tr />')
							.addClass('fl-tr')
							.prop('rowid',i)
							;
						$(this).append(tr);
						
						}
				)
				
				var c = this.column_order;

				for (var co=0; co<c.length; co++)
					{
						var td = $('<td />')
								.addClass('fl-td')
								.addClass('fl-td-'+c[co])
								;

						var cm = this.colModel[c[co]];

						var row = rows[i][c[co]];
						
						if (cm.beforeDisplay) row = cm.beforeDisplay(c[co],rows[i],this.fid);

						$(td).append(row);

						if (i==start)
							$(td).width(cm.width);
						
						if (cm.align)
							$(td).css({'text-align':cm.align});

						if (cm.visible===false)
							$(td).hide();	
							
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


				//alert($(this).html());

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
	,resize_column: function ()
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
	,toggle_column: function (key)
		{
			var cm = this.colModel[key];
			
			if (cm.visible==undefined) cm.visible = true;
			
			var pane = '.fl-fpane';
			if (cm.pane) 
				pane += '-'+cm.pane;			
			else if (this.dpane)
				pane += '-'+this.dpane;
			
			var c = $(pane+' .fl-th:visible',this).length;
			
			if (cm.visible) 
				{
				if (c==1) return true;
				$('.fl-col-'+key,this).hide();
				$('.fl-td-'+key,this).hide();
				cm.visible = false;
				}
				else
				{
				$('.fl-col-'+key,this).show();
				$('.fl-td-'+key,this).show();
				cm.visible = true;
				}
			
			this.module_events('afterColToggle');
			
			return cm.visible;
			
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


