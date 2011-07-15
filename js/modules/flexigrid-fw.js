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

fl_mod['fl_fw'] = {
			//events
	fullwidth: false		
	,fl_fw_fixfw: function ()
		{
		
		if (this.fullwidth)
		{
		$(this).addClass('fl-grid-fw');
		
		var w2 = $('.fl-bdiv .fl-table',this).outerWidth();
		
		$('.fl-hdiv .fl-hdiv-inner',this).width(w2+2);
		}
		
		}
}

fl_events['fl_fw'] = {afterRender:'fixfw'};		

  $(window)
  .resize(
  	function()
  		{
  		$('.fl-grid-fw').trigger('fl_fw_fixfw');
  		}
  );
