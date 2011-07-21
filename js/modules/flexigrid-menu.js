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

(function( $ ){

fl_mod['fl_menu'] = {

			//layouts
			 fl_menu_table: '<table class="fl-menu-table" cellspacing="0" ></table>'
			,fl_coltog: '<div class="fl-coltog"><div class="fl-coltog-inner"></div></div>'
			,fl_menu_item_trigger: function (item)
					{
						var self = this;
					
						var tr = $('<tr class="fl-menu-tr" />')
								.append('<td class="fl-menu-td fl-menu-col1"><span class="fl-icon"></span></td>')
								.append('<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + item.display + '</span></td>')
								.append('<td class="fl-menu-td fl-menu-col3"><span class="fl-icon"></span></td>')
								.click(function()
									{
									var val = false;
									if (item.value) val = item.value;
									if (self[item.action])
										self[item.action](val);
									else
										$('.fl-label',this).addClass('fl-label-disabled');	
									}
								)
								;
								
						if (item.class) $(tr).addClass(item.class);
						
						return tr;
					}
			,fl_menu_item_separator: function (item)
					{
						var tr = $('<tr class="fl-menu-br" />')
							.append('<td class="fl-menu-td" colspan="3"><div class="fl-menu-br-div"></div></td>')
							;
						return tr;
					}
			,fl_menu_item_submenu: function (item)
					{
						var tr = $('<tr class="fl-menu-tr fl-menu-sm" />')
								.append('<td class="fl-menu-td fl-menu-col1"><span class="fl-icon"></span></td>')
								.append('<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + item.display + '</span></td>')
								.append('<td class="fl-menu-td fl-menu-col3"><span class="fl-submenu"></span></td>')
								;
								
						var sub = $('<div class="fl-menu" />').append(this.fl_menu_table);
						
						$(sub).append(this.fl_menu_build_items(item.subgroup));
						
						$('.fl-submenu',tr).append(sub);
								
						return tr;
					}
			,fl_menu_item_colcheck: function (key,item)
					{
						
						var chk = 'checked="checked"';
						var self = this;
						
						if (item.visible===false) chk = '';
					
						var tr = $('<tr class="fl-menu-tr" />')
								.append('<td class="fl-menu-td fl-menu-col1"><input type="checkbox" autocomplete="off" class="fl-cb" '+chk+' value="'+key+'" /></td>')
								.append('<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + item.display + '</span></td>')
								.append('<td class="fl-menu-td fl-menu-col3"><span class="fl-icon"></span></td>')
								.click( function (e)
									{
									
									var obj = (e.target || e.srcElement);
									var cb = $('.fl-cb',this);
									var tg = cb.val();
									
									if ($('.fl-th:visible',self).length==1&&cb.attr('checked')) return false;
									
									if (obj.nodeName!='INPUT') 
										{
										
										if (cb.attr('checked'))
											{
											cb.attr('checked',false);
											} else {
											cb.attr('checked',true);
											}
											
										}	
										
										$('.fl-col-'+key,self).toggle();
										$('.fl-td-'+key,self).toggle();
											
										
									}
								)
								;
								
						return tr;
					}		
			//menu model
			,menu_items: [
					{type:'trigger',action:'align_column',display:'Align Left',value:'left'}
					,{type:'trigger',action:'align_column',display:'Align Right', value: 'right'}
					,{type:'separator'}
					,{type:'togglecol'}
/*
					,{type:'submenu',display:'Toggle Columns',subgroup:[{type:'togglecol'}]}
					 {type:'trigger',action:'sort_asc',display:'Sort Ascending'}
					,{type:'trigger',action:'sort_desc',display:'Sort Ascending'}
					,{type:'separator'}
*/
				]
			//events - to avoid collision with other modules use module_name_functionname for module events
			,fl_menu_init: function () 
				{
				
					var m_i = this.menu_items;
					
					if (!m_i.length) return true;

					this.fl_menu = $('<div class="fl-menu" />').append(this.fl_menu_table);
					
					//add fl-menu
					$(this).prepend(this.fl_menu);
					
					$(this.fl_menu).append(this.fl_menu_build_items(m_i));
					
					this.disableSelection(this.fl_menu);
					
					this.fl_menu_build_toggle();	
						
				}
			,fl_menu_build_items: function (m_i)
				{
				
					var tbody = $('<tbody class="fl-menu-body" />');

					for (var m = 0; m < m_i.length; m++)
						{
						
							if (m_i[m].type=='togglecol')
							{
								var co = this.column_order;
								for (c=0;c<co.length;c++)
									{
									var cm = this.colModel[co[c]];
									var item = this.fl_menu_item_colcheck(co[c],cm);
									$(tbody).append(item);
									}
							}
							else
							{
						
								if (!this['fl_menu_item_'+m_i[m].type]) continue;
	
								var item = this['fl_menu_item_'+m_i[m].type](m_i[m]);
									
								$(tbody).append(item);
							}
						}
					
					return tbody;	
				
				}	
			,fl_menu_build_toggle: function ()
				{				
					//add coltog button
					$('.fl-th-con',this).append(this.fl_coltog);

					$('.fl-coltog',this).click
					(
						function ()
							{
							
							var self = $(this).parents('.fl-grid').get(0);
							
							$(self).prop('colTarget',$(this).parents('th').prop('column_name'));
							self.module_events('beforeTogColClick');

							var l = this.offsetLeft;
							l += $(this).parents('.fl-th').get(0).offsetLeft;
							l += $(this).parents('.fl-fpane').get(0).offsetLeft;
							l += $(this).parents('.fl-hbdiv').get(0).offsetLeft;
							l -= $(this).parents('.fl-hdiv').get(0).scrollLeft;
							
							var t = this.offsetTop;
							
							t = $(this).parents('.fl-hbdiv').find('.fl-bdiv').get(0).offsetTop;
							t += $(this).parents('.fl-hbdiv').get(0).offsetTop;
							
							var w = $(self).width();
							var w2 = $(self).find('.fl-menu:first').width();
							
							if ((l+w2)>w) 
								{
								l = l - w2 + $(this).width();
								}
							
							var k = l+'px';
							var k2 = $(self).find('.fl-menu:first').css('left');
							
							if (k==k2) 
								$(self).find('.fl-menu:first').toggle('fast');
							else
								$(self).find('.fl-menu:first').css({left:l,top:t}).show('fast');
							
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
			//basic trigger events can be transferred to different module
			,align_column: function (atype)
				{
					var col = this.colTarget;
					if (!col) return true;
					if (atype)
						{
						$('.fl-td-'+col,this).css('text-align',atype);
						$('.fl-col-'+col,this).css('text-align',atype);
						}
				}	
			
		};


fl_events['fl_menu'] = {afterRender:'init'};


})( jQuery );
