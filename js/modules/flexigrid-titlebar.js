/*
 * Flexigrid Titlebar
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_titlebar
purpose: adds Title bar feature
requirement: none
when to load: after core

consider merging to core. too small as a module
*/

(function( $ ){

fl_mod['fl_titlebar'] = {
	
	//state
	titleText: false
	,gridToggle: true
	//layouts
	,fl_title: '<div class="fl-title" ><div class="fl-title-inner"></div></div>'
	,fl_titletog: '<button type="button" type="button" class="fl-button fl-title-tog" ><span class="fl-icon"></span></button>'
	//events
	,fl_events_fl_titlebar: {afterRender:'init'}
	,fl_titlebar_init: function ()
		{
		
		if (!this.titleText) 
			return false;
		
		
		$('.fl-grid-inner',this).prepend(this.fl_title);
		$('.fl-title-inner',this).append(this.titleText);
		if (this.titleIcon)
			{
			$('.fl-title-inner',this).prepend(this.fl_icon);
			}	
		
		//add toggle command here
		if (this.gridToggle)
			{
				$('.fl-title',this).append(this.fl_titletog);
				$('.fl-title-tog',this).click(
						function ()
							{
							$(this).toggleClass('fl-title-tog-up');
							$(this).parents('.fl-title').siblings().slideToggle();
							}
				);	
			}
			
		
		}

}


})( jQuery );

