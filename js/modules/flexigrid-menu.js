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

			//menu model
			menu_items: [
				 {type:'submenu',display:'Toggle Columns',subgroup:[{type:'column_tog',sub_list:'column_order'}]}
				,{type:'separator'}
				,{type:'trigger',action:'align_column',display:'Align Left',value:'left'}
				,{type:'trigger',action:'align_column',display:'Align Center',value:'center'}
				,{type:'trigger',action:'align_column',display:'Align Right',value:'right'}
				,{type:'trigger',action:'freeze_pane',display:'Freeze Pane',name:'freeze_pane'}
				]
			//layouts
			,fl_menu_table: '<table class="fl-menu-table" cellspacing="0" ></table>'
			,fl_menu_col1: '<td class="fl-menu-td fl-menu-col1"><span class="fl-icon"></span></td>'
			,fl_menu_col2: function (d) {return '<td class="fl-menu-td fl-menu-col2"><span class="fl-label">' + d + '</span></td>'}
			,fl_menu_col3: '<td class="fl-menu-td fl-menu-col3"><span class="fl-icon"></span></td>'
			,fl_coltog: '<div class="fl-coltog"><div class="fl-coltog-inner"></div></div>'

			//events - to avoid collision with other modules use module_name_functionname for module events
			,fl_events_fl_menu : {afterRender:['init'],afterColToggle:'update_togs'}		
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
						
						
							if (m_i[m].sub_list)
							{
								var s_l = this[m_i[m].sub_list];
								for (var k in s_l)
									{
									var item = this['fl_menu_item_'+m_i[m].type](k,s_l[k]);
									$(tbody).append(item);
									}
							}
							else
							{
								if (!this['fl_menu_item_'+m_i[m].type]) continue;
								var item = this['fl_menu_item_'+m_i[m].type](m,m_i[m]);
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
							
							//add events to set status of menu items --> can make code to big consider as optional only
							self.trigger_events('beforeTogColClick');

							var pos = $(this).offset();
							var gpos = $(self).offset();
							
							var l = pos.left - gpos.left;
							var t = pos.top - gpos.top + $(this).height();
							
							var w = $(self).width();
							var w2 = $(self.fl_menu).width();
							
							if ((l+w2)>w) 
								{
								l = l - w2 + $(this).width();
								}
							
							var k = l+'px';
							var k2 = $(self.fl_menu).css('left');
							
							if (k==k2) 
								$(self.fl_menu).toggle('fast');
							else
								$(self.fl_menu).css({left:l,top:t}).show('fast');
							
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
			// item builders	
			,fl_menu_item_trigger: function (key,item)
					{
						var self = this;
						
						if (item.name) key = item.name;
						
						var tr = $('<tr class="fl-menu-tr fl-menu-key-'+key+'" />')
								.append(this.fl_menu_col1)
								.append(this.fl_menu_col2(item.display))
								.append(this.fl_menu_col3)
								.click(function()
									{
									var val = false;
									if (item.value) val = item.value;
									if (self[item.action])
										self[item.action](val,self.fid);
									else
										$('.fl-label',this).addClass('fl-label-disabled');	
									}
								)
								;
								
						if (item.class) $(tr).addClass(item.class);
						
						return tr;
					}
			,fl_menu_item_separator: function (key,item)
					{
						var tr = $('<tr class="fl-menu-br" />')
							.append('<td class="fl-menu-td" colspan="3"><div class="fl-menu-br-div"></div></td>')
							;
						return tr;
					}
			,fl_menu_item_submenu: function (key,item)
					{
						var tr = $('<tr class="fl-menu-tr fl-menu-sm" />')
								.append(this.fl_menu_col1)
								.append(this.fl_menu_col2(item.display))
								.append('<td class="fl-menu-td fl-menu-col3"><span class="fl-submenu"></span></td>')
								;
								
						var sub = $('<div class="fl-menu" />').append(this.fl_menu_table);
						
						$(sub)
							.append(this.fl_menu_build_items(item.subgroup));
						
						$(tr)	
							.mouseover( function ()
								{
									var self = $(this).parents('.fl-grid').get(0);
									var l = parseInt($(self.fl_menu).css('left'));
									var w = $(self).width();
									var w2 = $(self.fl_menu).width();
									var w3 = $('.fl-menu:first',this).width();
									var w4 = $('.fl-submenu',this).position();
									
									if ((l+w2+w3)>=w)
										$('.fl-menu:first',this).css('left',(0-w3-w4.left));
									else
										$('.fl-menu:first',this).css('left',(w2-w4.left));	
									
								}
							)
							;
						
						
						$('.fl-submenu',tr).append(sub);
								
						return tr;
					}
			,fl_menu_update_togs: function ()
					{
						//update our column togs if toggle_column was triggered externally
						var key = this.lastToggled;
						cm = this.colModel[key];
						$('.fl-cb[value='+key+']',this.fl_menu).prop('checked',cm.visible);
					}		
			,fl_menu_item_column_tog: function (k,i)
					{
					
						if (i.display)
						{
							var item = i;
							var key = k;
						}
						else
						{
							var item = this.colModel[i];
							var key = i;
						}
						
						var chk = 'checked="checked"';
						var self = this;
						
						if (item.visible===false) chk = '';
						if (item.toggleable===false) return true;
					
						var tr = $('<tr class="fl-menu-tr fl-column-tog" />')
								.append('<td class="fl-menu-td fl-menu-col1"><input type="checkbox" autocomplete="off" class="fl-cb" '+chk+' value="'+key+'" /></td>')
								.append(this.fl_menu_col2(item.display))
								.append(this.fl_menu_col3)
								;
							$('input',tr).change(function(e)
								{
								var toggle = $(this).parents('.fl-grid').get(0).toggle_column(key);
								this.checked = toggle;
								}
							)
							.parent().siblings().click(function(e)
								{
								$(this).siblings().find('input').trigger('change');
								}
								);	
								
						return tr;
					}		
			//sample trigger events can be transferred to different module
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

})( jQuery );
