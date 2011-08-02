/*
 * Flexigrid Toolbar
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_toolbar
purpose: adds toolbar functionality
requirement: none
when to load: after core
*/

(function( $ ){

fl_mod['fl_toolbar'] = {

	//built-in toolbars
	fl_tb_pager: {
			items: 
				{
				'first':{type:'button',class_name:'fl-button-first',title:"Go to First"}
				,'prev':{type:'button',class_name:'fl-button-prev'}
				,'next':{type:'button',class_name:'fl-button-next'}
				,'last':{type:'button',class_name:'fl-button-last'}
				,'reload':{type:'button',class_name:'fl-button-reload',display:'Reload'}
				}
			,place:'header'	
			}

	//layouts
	,fl_header: '<div class="fl-header"></div>'
	,fl_footer: '<div class="fl-footer"></div>'  
	,fl_toolbar: '<div class="fl-toolbar" />'
	,fl_button: '<button type="button" class="fl-button" />'
	,fl_icon: '<span class="fl-icon"></span>'
	,fl_button_label: '<span class="fl-button-label"></span>'
	
	//events
	,fl_events_fl_toolbar: {afterRender:'init'}
	,fl_toolbar_init: function ()
		{

		//add header and footer --> add conditions later
		if (this.toolbars)
			{
			this.build_toolbars();
			}

		//$('.fl-header, .fl-footer',this).append('<div style="clear:both"></div>');

		}
	,build_toolbars: function ()
		{
			var tb_o = this.toolbars;
			
			for (var tb_i in tb_o) //for each toolbars
				{
					var tbm = tb_o[tb_i]; 
					
					if ((typeof tbm)=='string')
						tbm = {type:tbm};
					
					if (tbm.type)
						if (this['fl_tb_'+tbm.type])
							tbm = $.extend(true,{},this['fl_tb_'+tbm.type],tbm); 

					if (!tbm.place)
						tbm.place = 'header';

					
					//create container	
					if (!$('.fl-'+tbm.place,this).length)
						{
						if (tbm.place=='header')
							$(this.fl_header).insertBefore($('.fl-hbdiv',this));
						else
							$(this.fl_footer).insertAfter($('.fl-hbdiv',this));						
						}	
					
				
					var tb = $(this.fl_toolbar);
					
					tb.addClass("fl-toolbar-"+tb_i);
					
					if (tbm.width) $(tb).width(tbm.width);
					if (tbm.align) $(tb).css('text-align',tbm.align);
					if (tbm.visible===false) $(tb).hide();
					
					if (tbm.items)
						{

						
						if (!tbm.item_order)
							{
								var o = [];
								for (var b in tbm.items)
								{
									o[o.length] = b;
								}
								tbm.item_order = o;
							}
						
						
						for (var c=0;c<tbm.item_order.length;c++) // for each button
							{
							var item = '';
							var b = tbm.item_order[c];
							var i = tbm.items[b];
							if ('fl_toolbar_item_'+i.type)
								item = this['fl_toolbar_item_'+i.type](b,i);	
							$(tb).append(item);	
							}
						}
						
					$(tb).wrapInner('<div class="fl-toolbar-inner"></div>');
					
					$('.fl-'+tbm.place,this).append(tb);	
				}
			
		}
	,fl_toolbar_item_button: function (k,i)
		{
			var item = $(this.fl_button);
				
				if (i.class_name)
					{
					item.addClass(i.class_name);
					item.append(this.fl_icon);
					}
				
				if (i.title)
					{
					item.attr('title',i.title);
					}
				
				if (i.visible===false)
					item.hide();
				
				if (i.display)
					{
					var d = $(this.fl_button_label).append(i.display);
					item.append(d);
					}
				
				var self = this;
					
				if (i.action)
					{
					item.click(function()
						{
						var val = false;
						if (i.value) val = i.value;
						if (self[i.action])
							self[i.action](val,self.fid);
						
						}
						);
					}	

			
			return item;
		}			

}


})( jQuery );

