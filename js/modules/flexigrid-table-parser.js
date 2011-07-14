/*
 * Flexigrid Table Parser
 *
 * Copyright (c) 2011 Paulo P. Marinas (www.flexigrid.info)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.

name: fl_table_parser
purpose: Parses static table
requirement: none
when to load: manually triggered

*/

fl_mod['fl_table_parser'] = {
			//events
			parseTable: function (tableobj)
				{
				g = this;
				//get column headers
				$('thead th',tableobj).each
					(
						function ()
							{
							
							}
					);
				
				g = null;	
				//get rows into data
				}

		};

