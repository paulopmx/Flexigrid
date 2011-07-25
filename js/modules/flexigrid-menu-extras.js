/* test of extending modules */

(function( $ ){

var freeze_menu_option = {

			fl_events_freeze_menu : {beforeTogColClick:'set_freeze_status'}
			,freeze_menu_set_freeze_status: function ()
					{
					if ($('.fl-col-'+this.colTarget,this).parents('.fl-fpane-left').length)
						$('.fl-menu-key-freeze_pane .fl-label',this).html('Unfreeze Pane');
					else	
						$('.fl-menu-key-freeze_pane .fl-label',this).html('Freeze Pane');
					}
			,freeze_pane: function ()
					{
					var stat = $('.fl-menu-key-freeze_pane .fl-label',this).text();
					if (stat=='Freeze Pane')
						this.dropTarget = $(".fl-fpane-left .fl-th:last",this).prop("column_name");
					else
						this.dropTarget = $(".fl-fpane-right .fl-th:last",this).prop("column_name");
					this.dropDir = 'right';
					$(this).trigger('dragEnd_colmove');
					$(this.fl_menu).hide();
					}

		};

$.extend(fl_mod['fl_menu'],freeze_menu_option);
					
})( jQuery );
					
