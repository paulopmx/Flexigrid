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

	//options
	toolbars_header: {
			'pager': 
				{
				items: 
					{
					'first':{type:'button',class:'fl-button-first',title:"Go to First"}
					,'prev':{type:'button',class:'fl-button-prev'}
					,'next':{type:'button',class:'fl-button-next'}
					,'last':{type:'button',class:'fl-button-last'}
					,'reload':{type:'button',class:'fl-button-reload'}
					}
				}
			}	
/*
	toolbars_header: {
			'pager': 
				{
				items: 
					{
					'first':{type:'button',class:'fl-button-first',title:"Go to First"}
					,'prev':{type:'button',class:'fl-button-prev'}
					,'next':{type:'button',class:'fl-button-next'}
					,'last':{type:'button',class:'fl-button-last'}
					,'reload':{type:'button',class:'fl-button-reload'}
					}
				,width:'50%'
				}
			,'pager2': 
				{
				items: 
					{
					'first':{type:'button',class:'fl-button-first',title:"Go to First"}
					,'prev':{type:'button',class:'fl-button-prev'}
					,'next':{type:'button',class:'fl-button-next'}
					,'last':{type:'button',class:'fl-button-last'}
					,'reload':{type:'button',class:'fl-button-reload'}
					}
				,width:'50%'
				}
			}
*/

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
		if (this.toolbars_header)
			{
			//$('.fl-grid-inner',this).prepend(this.fl_header);
			$(this.fl_header).insertBefore($('.fl-hbdiv',this));
			this.build_toolbars('header');
			}
		if (this.toolbars_footer)	
			{
			//$('.fl-grid-inner',this).append(this.fl_footer);
			$(this.fl_footer).insertAfter($('.fl-hbdiv',this));

			this.build_toolbars('footer');
			}

		//$('.fl-header, .fl-footer',this).append('<div style="clear:both"></div>');

		}
	,build_toolbars: function (ttype)
		{
			var tb_o = this['toolbars_'+ttype];
			
			for (var tb_i in tb_o) //for each toolbars
				{
					var tb = $(this.fl_toolbar);
					
					tb.addClass(".fl-toolbar-"+tb_i);
					
					var tbm = tb_o[tb_i];
					if (tbm.width) $(tb).width(tbm.width);
					if (tbm.align) $(tb).css('text-align',tbm.align);
					if (tbm.visible===false) $(tb).hide();
					
					for (var bs in tbm) //for each items
						{
							if (bs=='items')
								{
								for (var b in tbm[bs]) // for each button
									{
									var item = '';
									var i = tbm[bs][b];
									if ('fl_toolbar_item_'+i.type)
										item = this['fl_toolbar_item_'+i.type](b,i);	
									$(tb).append(item);	
									}
								}
						}
					$(tb).wrapInner('<div class="fl-toolbar-inner"></div>');	
					$('.fl-'+ttype,this).append(tb);	
				}
			
		}
	,fl_toolbar_item_button: function (k,i)
		{
			var item = $(this.fl_button);
				
				if (i.class)
					{
					item.addClass(i.class);
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

			
			return item;
		}			

}


})( jQuery );

