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
			,fl_menu_col3: '<td class="fl-menu-td fl-menu-col3"><span class="fl-icon"></span></td>'
			,fl_menu_item: function (lbl) { return this.fl_menu_col1 + '<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + lbl + '</span></td>' + this.fl_menu_col3; }
			,fl_menu: '<div class="fl-menu"><table class="fl-menu-table" cellspacing="0"><tbody></tbody></table></div>'
			,fl_menu_br: '<td class="fl-menu-td" colspan="3"><div class="fl-menu-br-div"></div></td>'
			,fl_coltog: '<div class="fl-coltog"><div class="fl-coltog-inner"></div></div>' //insert into th

			//menu model
			,menu_items: [
					 {type:'link',name:'sortasc',display:'Sort Ascending',onpress:'sort'}
					,{type:'link',name:'sortdesc',display:'Sort Ascending',onpress:'sort'}
					,{type:'separator'}
/*
					,{type:'submenu',name:'togglecol',display:'Toggle Columns'}
					,{type:'separator'}
*/
					,{type:'link',name:'alignleft',display:'Align Left',onpress:'align'}
					,{type:'link',name:'alignright',display:'Align Right',onpress:'align'}
				]
			//events - to avoid collision with other modules use module_name_functionname for module events
			,fl_menu_init: function () 
				{
					//add fl-menu
					$(this).prepend(this.fl_menu);
					
					//menu items processor --> move to a function for recursion
					for (var m = 0; m < this.menu_items.length; m++)
						{
							var tr = $('<tr />');

							switch (this.menu_items[m].type)
								{
								case 'link':
									$(tr)
									.append(this.fl_menu_item(this.menu_items[m].display))
									.addClass('fl-menu-tr')
									.click(function()
										{
										var colTarget = $(this).parents('.fl-grid').prop('colTarget');
										}
									)
									;
									break;
								case 'separator':
									$(tr).append(this.fl_menu_br).addClass('fl-menu-br');
									break;
								}
								
							$('.fl-menu tbody',this).append(tr);
/* 							tr = null; */
						}
				
					//add coltog button
					$('.fl-th-con',this).append(this.fl_coltog);

					$('.fl-coltog',this).click
					(
						function ()
							{
							$(this).parents('.fl-grid').prop('colTarget',$(this).parents('th').prop('column_name'));
			
							var l = this.offsetLeft+$(this).parents('div.fl-hbdiv').get(0).offsetLeft+$(this).parents('.fl-th').get(0).offsetLeft;
							var t = this.offsetTop+$(this).parents('div.fl-hdiv').next().get(0).offsetTop+$(this).height()+$(this).parents('div.fl-hbdiv').get(0).offsetTop;
							
							var w = $(this).parents('.fl-grid').width();
							var w2 = $('.fl-menu:first').width();
							
							if ((l+w2)>w) 
								{
								l = l - w2 + $(this).width();
								}
							
							var k = l+'px';
							var k2 = $('.fl-menu:first').css('left');
							
							if (k==k2) 
								$('.fl-menu:first').toggle('fast');
							else
								$('.fl-menu:first').css({left:l,top:t}).show('fast');
							
							}
					);


					$('.fl-menu:first',this).mouseleave
					(
						function ()
							{
							$(this).hide();
							}
					);
					
					$(this).mouseleave
					(
						function ()
							{
							$('.fl-menu:first',this).hide();
							}
					);


				}
			
		};


fl_events['fl_menu'] = {afterRender:'init'};


