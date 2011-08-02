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
	,fl_events_fl_fp : {beforeRender:'setPane',afterRender:'fixwidth',afterReload: 'sync_hover',afterColResize:'fixwidth',afterColToggle:'fixwidth'}		
	,fl_events_fl_fw: {}
	,fl_fp_setPane: function () 
		{
		if (this.viewtype=='freezepane')
			this.dpane = 'right';
		}
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

  $(window)
  .resize(
  	function()
  		{
  		$('.fl-grid-fw').trigger('fl_fp_fixwidth');
  		}
  );


})( jQuery );

