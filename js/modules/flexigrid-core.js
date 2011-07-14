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


/* 
New - Flexigrid Modules 

You can add/remove additional functionality for flexigrid

Format for making modules:
1. Add comment description at begining specifying:
	name:
	purpose: 
	requirement: 
	when to load:
	
2. Declare as fl_mod[name_of_mod]
3. Declare which module specific events to be trigger at certain times as fl_events[name_of_mod]

*/


var fl_grid = function (){};
var fl_mod = {};
var fl_events = {};

fl_grid.prototype = {
	
	//appearance
	height: 100
	,width: 'auto'
	,className: 'fl-grid'
	,min_col_width: 30
	
	//state
	,page: 1
	,total: 1
	,rp: 15
	,rpOptions: [10,15,20,25,40]
	,fid: 0
	,autorender: true
	,column_order: []
	
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
	,fl_fpane: function () { return '<div class="fl-fpane">' + this.fl_hdiv + this.fl_bdiv +'</div>'; }
	,fl_td: '<div class="fl-td-div"></div>'
	,fl_th: '<div class="fl-th-div"></div>'
	,fl_th_con: '<div class="fl-th-con"><div class="fl-coldrag"></div></div>'  
	,fl_grid: function () { return '<div class="fl-grid-inner"><div class="fl-hbdiv">' + this.fl_fpane() + '</div></div>' }
	

	//default events
	,render: function ()
		{

		//trigger module beforeRender events
		
		this.module_events('beforeRender');
					
		//first unbind and empty then add default content
		$("*",this).unbind();
		$(this).empty();
		
		$(this).append(this.fl_grid());
		$('.fl-bdiv',this).height(this.height);
		
		this.build_header();
		
		//trigger module afterRender events
		
		this.module_events('afterRender');
		
		}
	,build_header: function ()
		{
		
			
			var tr = $('<tr />').addClass('fl-tr');
			
			//if no order specified create one
			if (!this.column_order.length)
				{
				if (this.colModel)
					{
					for (var k in this.colModel)
						{
							/* alert(this.column_order.length); */
							this.column_order[this.column_order.length] = k;
						}
					k = null;	
					}
				}

			//add columns base on column order
			for (var co=0; co<this.column_order.length; co++)
				{


					var th = $('<th />')
							.addClass('fl-th')
							.prop('column_name',this.column_order[co])
							;
							
					var cm = this.colModel[this.column_order[co]];

					$(th)
					.append(cm.display)
					.width(cm.width)
					;
					
					if (cm.align)
						$(th).css('text-alignment',cm.align);
						
					$(th)
					.wrapInner(this.fl_th)
					.append(this.fl_th_con)
					;			

					$(tr).append(th);
				
				}
			co = null;
				
			$('.fl-hdiv thead',this).append(tr);
			
			
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
			
			mod = null;
			ev = null;				
		}
	,parseTable: function (){} // override on a module

};

(function( $ ){
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
						
						m = null;
						f = null;

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
						
						fid = $('fl-grid').length;
						g.fid = fid;
						
						if (g.autorender)
							$(g).trigger('render');
						if (g.autoload)
							$(g).trigger('load');
							
						grid[gid] = g;
						g = null;
						
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
  
  $(window)
  .unload(
  	function()
  		{
  		// destroy and unbind
  		fl_grid = null;
  		fl_mod = null;
  		fl_events = null;
  		}
  );
  
})( jQuery );
