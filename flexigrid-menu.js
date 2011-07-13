/*
 * Flexigrid Menu
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_menu
purpose: add context menu on column headers
requirement: none
when to load: after render

*/


fl_mod['fl_menu'] = {
			//layouts
			 fl_menu_col1: '<td class="fl-menu-td fl-menu-col1"><span class="fl-icon"></span></td>'
			,fl_menu_col2: '<td class="fl-menu-td fl-menu-col2"><span class="fl-label"></span></td>'
			,fl_menu_col3: '<td class="fl-menu-td fl-menu-col3"><span class="fl-icon"></span></td>'
			,fl_menu_item: '<tr class="fl-menu-tr">' + this.fl_menu_col1 + this.fl_menu_col2 + this.fl_menu_col3 + '</tr>'
			,fl_menu: '<div class="fl-menu"><table class="fl-menu-table" cellspacing="0"></table></div>'
			,fl_menu_br: '<tr class="fl-menu-br"><td class="fl-menu-td" colspan="3"><div class="fl-menu-br-div"></div></td></tr>'
			,fl_coltog: '<div class="fl-coltog"><div class="fl-coltog-inner"></div></div>' //insert into th
			
		};

fl_grid.prototype = $.extend(fl_grid.prototype,fl_mod['fl_menu']);

