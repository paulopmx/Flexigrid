/*
 * Flexigrid Column Mover
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_colmove
purpose: can switch columns
requirement: none
when to load: after core
*/

(function( $ ){

fl_mod['fl_colmove'] = {
	
	
	//layouts
	fl_div_colmove: '<div class="fl-colmove"></div>'
	//events
	,fl_colmove_addMover: function () {

			//add column move guide
			$('.fl-hbdiv',this).prepend(this.fl_div_colmove);
	

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
	//drag events
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
				.trigger('set_col_order')
				.trigger('col_resize')
				;					
			
		
		}
		
			
}

fl_events['fl_colmove'] = {afterRender:'addMover'};


})( jQuery );

