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
	,fl_events_fl_fw : {afterResize:['fixwidth']}
	,fl_fw_fixwidth: function ()
		{

		if (this.viewtype=='fullwidth')
		{
		
		var w1 = $('.fl-hdiv .fl-table',this).innerWidth();
		var w2 = $('.fl-bdiv .fl-table',this).innerWidth();
		
		if (w1>w2)
			$('.fl-hdiv',this).addClass('fl-addyscroll');
		else if (w2>w1)
			$('.fl-hdiv',this).removeClass('fl-addyscroll');
			
					
		
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
