/*
 * Flexigrid Table Parser
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_tableparser
purpose: Parses static table
requirement: none
when to load: manually triggered

*/

fl_mod['fl_tableparser'] = {
			//events
			parseTable: function (tableobj)
				{
				//get column headers
				//get rows into data
				}
		};

//merge
fl_grid.prototype = $.extend(fl_grid.prototype,fl_mod['fl_tableparser']);
