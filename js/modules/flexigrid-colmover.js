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
	,fl_events_fl_colmove : {afterRender:'addMover'}
	,fl_colmove_addMover: function () {

			//add column move guide
			$('.fl-hbdiv',this).prepend(this.fl_div_colmove);
	

			//add column move feature				
			$('.fl-th-div',this)
				.mousedown(
					function (e)
						{
						var self = $(this).parents('.fl-grid');
						var c = $(this).parent().prop('column_name');
						
						if ($(self).prop('colModel')[c].moveable===false) return true;
						
						$(self)
						.prop('dragType','colmove')
						.prop('mouse_state_start',e)
						.prop('colTarget',c)
						.trigger('disableSelection')
						.trigger('dragStart')
						.addClass('fl-colmoving')
						;
						}
				)		
				.mousemove(
						function (e)
						{
						
							var self = $(this).parents('.fl-grid').get(0);
							
							if (self.dragType!='colmove') return true;
							
							var dt = $(this).parents('th').prop('column_name');
							var cm = self.colModel[self.colTarget];

							if ($(self).prop('colModel')[dt].moveable===false) return true;

							var dropdir = 'left';

							var pos = $(this).offset();
							var w = $(this).width() / 2;
							var l =  e.pageX - pos.left;

							if (l>w) dropdir = 'right'; 
							
							$(this).parent()
								.removeClass('fl-th-dropleft')
								.removeClass('fl-th-dropright')
								.addClass('fl-th-drop'+dropdir);
							
							self.dropDir = dropdir;
							
							var cpane = '.fl-fpane';

							if (cm.pane) 
								cpane += '-'+cm.pane;			
							else if (self.dpane)
								cpane += '-'+self.dpane;
								
								
							if ($(self).find(cpane+' thead .fl-th:visible').length<=1)
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
							
							$(this).parent()
							.removeClass('fl-th-dropleft')
							.removeClass('fl-th-dropright')
							;
							
							$(self)
							.prop('dropTarget','')
							.find('.fl-colmove').removeClass('fl-colmove-allowed')
							.removeClass('fl-colmove-not-allowed')
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
			$('.fl-colmove',this)
				.removeClass('fl-colmove-allowed')
				.removeClass('fl-colmove-not-allowed')
				.hide();
				
			$(this).removeClass('fl-colmoving');

			var dcol = this.dropTarget;

			if (!dcol) return true;
			if (dcol==col) return true;


			$('.fl-col-'+dcol,this)
			.removeClass('fl-th-dropleft')
			.removeClass('fl-th-dropright')
			;
			
			var dm = this.colModel[dcol];
			
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
			
			if ($(cpane+' thead .fl-th:visible',this).length<=1) return true;
			
			if (this.dropDir=='left')
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
				.trigger('resize_column')
				;					
			
			this.colTarget = '';
			this.dropTarget = '';
		
		}
		
			
}


})( jQuery );

