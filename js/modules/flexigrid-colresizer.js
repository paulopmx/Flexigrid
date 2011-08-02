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
		,fl_events_fl_colres : {afterRender:'addResizer'}	
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
		,dragStart_colresize: function()
			{
				var pos = this.mouse_state_start;
				var gpos = $('.fl-hbdiv',this).offset();
				
				var l = pos.pageX - gpos.left - 3;
				$('.fl-colguide',this).css('left',l).fadeIn();
			
			}
		,dragMove_colresize: function()
			{
				var pos = this.mouse_state_now;
				var gpos = $('.fl-hbdiv',this).offset();
				
				var l = pos.pageX - gpos.left - 3;
				$('.fl-colguide',this).css('left',l);
				
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
				
				$(this).trigger('resize_column');
				
			}
		
			
}


})( jQuery );

