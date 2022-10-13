if(typeof app === 'undefined') {
	app = {};
}
if(typeof app.custom_elements === 'undefined') {
	app.custom_elements = {};
}

app.elements = {
	menus: Array(),
	frames: {
		body: {
			level: 0	
		},
		search_results: {
			level: 0	
		}
	},
	element_names: [
		"diagram_editor"
	],
	tables: Array(),
	forms: Array(),
	lists: Array(),
	grids: Array(),
	calendars: Array(),
	find_element_object: function(callback_item_reference) {
		var branch = this;
		if(callback_item_reference.indexOf('.') != -1) {
			var split = callback_item_reference.split('.');
			var form_object = branch.find_element_object(split[0]);
			return form_object.operation.elements[split[1]];
		}
		var callback_item = callback_item_reference;
		var split = callback_item.split("_");
		var type = split[split.length-1]+"s";
		/*var statement = "var element = branch.root.elements."+type+"['"+callback_item+"']";
		eval(statement);	*/
		//if(typeof branch.root.elements[type][callback_item] !== 'undefined') {
			var element = branch.root.elements[type][callback_item];
			return element;
		/*}
		return null;*/
	},
	elements_store: null,
	store_elements: function() {
		this.elements_store = {
			tables: this.tables,
			forms: this.forms,
			lists: this.lists,
			grids: this.grids,
			calendars: this.calendars
		};
		//console.log(this.elements_store);
		this.tables = Array();
		this.forms = Array();
		this.lists = Array();
		this.grids = Array();
		this.calendars = Array();
		
		/*for(var x in this.tables) {
			this.elements_store.tables[x] = this.tables[x];
		}
		for(var x in this.forms) {
			this.elements_store.forms[x] = this.forms[x];
		}
		for(var x in this.lists) {
			this.elements_store.lists[x] = this.lists[x];
		}
		for(var x in this.grids) {
			this.elements_store.grids[x] = this.grids[x];
		}
		for(var x in this.calendars) {
			this.elements_store.calendars[x] = this.calendars[x];
		}*/
	},
	restore_elements: function() {
		if(this.elements_store != null) {
			this.tables = this.elements_store.tables;
			this.forms = this.elements_store.forms;
			this.lists = this.elements_store.lists;
			this.grids = this.elements_store.grids;
			this.calendars = this.elements_store.calendars;
		}
		this.elements_store = null;
	},
	search_elements: Array(),
	assign_element: function(type_name, item_object, page_id, content_item_id) {
		var branch = this;
		var type_name_branch = type_name.substr(1)+"s";
		if(this.elements_index.indexOf(type_name_branch) == -1) {
			this.elements_index.push(type_name_branch);
		}
		if(typeof branch[type_name_branch] === 'undefined') {
			branch[type_name_branch] = Array();	
		}
		item_object.operation.load(function() {
			branch.root.interpretation.loaded_objects[page_id].loaded();
		});

		branch[type_name_branch][content_item_id+type_name] = item_object;
	},
	elements_index: [
		"tables",
		"forms",
		"lists",
		"grids",
		"calendars"
	],
	reload_elements_on_page: function(page, skip_inputs) {
		var keys = Object.keys(this);
		console.log(keys);
		for(var x in keys) { //this.elements_index) {
			var key = keys[x];
			if(Array.isArray(this[key])) {
				console.log(key);
				if(typeof skip_inputs !== 'undefined' && key == 'forms') {

				} else {
					for(var i in this[key]) {
						if(typeof this[key][i].operation !== 'undefined') {
							this[key][i].operation.load();
						}
					}
				}
			}
		}
	} 
};

app.dialog = {
	$dialog: null,
	$overlay_black: null,
	$yes_button: null,
	$no_button: null,
	$ok_button: null,
	init: function(message, yes_callback, no_callback, ok_callback, no_hide) {
		var branch = this;
		branch.$overlay_black = $('.overlay_black');
		branch.$dialog = branch.$overlay_black.find('.dialog');
		branch.$yes_button = branch.$dialog.find('.yes_button');
		branch.$no_button = branch.$dialog.find('.no_button');
		branch.$ok_button = branch.$dialog.find('.ok_button');
		branch.$controls_ok = branch.$dialog.find('.controls_ok').first();
		branch.$controls_yes = branch.$dialog.find('.controls_yes').first();
		branch.$dialog.find('.message').html(message);
		branch.no_hide = no_hide;
		if(typeof yes_callback !== 'undefined') {
			branch.$controls_yes.show();
			branch.$controls_ok.hide();
			branch.$yes_button.off('click.dialog').on('click.dialog', function() {
				yes_callback();
				branch.hide();
			});
			branch.$no_button.off('click.dialog').on('click.dialog', function() {
				if(typeof no_callback !== 'undefined') {
					no_callback();	
				}
				branch.hide();
			});
		}
		if(typeof ok_callback !== 'undefined') {
			branch.$controls_yes.hide();
			branch.$controls_ok.show();

			branch.$ok_button.off('click.dialog').on('click.dialog', function() {
				if(typeof ok_callback !== 'undefined') {
					ok_callback();	
				}
				branch.hide();
			});
		}
		branch.show();
	},
	show: function() {
		var branch = this;
		$('.body_container').addClass('blur');
		branch.$dialog.css({
			'display': 'block',
			'opacity': 1
		});
		if(typeof branch.no_hide === 'undefined') {
			if(branch.$overlay_black.css('display') != 'none') {
				branch.$overlay_black.animate({
					'opacity': 1
				}, 1250, 'easeInOutQuint');
			
			} else {
				branch.$overlay_black.css({
					'display': 'block',
					'opacity': 0
				}).animate({
					'opacity': 1
				}, 1250, 'easeInOutQuint');
			}
		}
	},
	hide: function() {
		var branch = this;
		branch.$dialog.animate({
			'opacity': 0
		}, 435, 'ease_out_x_3', function() {
			branch.$dialog.css({
				'display': 'none',
				'opacity': 0
			});
		});
		if(typeof branch.no_hide === 'undefined') {
			$('.body_container').removeClass('blur');
			branch.$overlay_black.animate({
				'opacity': 0
			}, 1250, 'easeInOutQuad', function() {
				$(this).css({
					'display': 'none'
				});
			});
		}/* else {
			branch.$dialog.animate({
				'opacity': 0
			}, function() {
				$(this).hide();
			});	
		}*/
	}
};

app.custom_elements.datepicker = {
	init: function(content_item, $container, page_data, interpretation_branch, page) {
		var branch = this;
		
		var calendar_object = {
			toggle: 0,
			current_hour: null,
			$calendar_container: null,
			operation: {
				load: function(send_data, search_string, deny_on_load) {
					var self = this;
					//self.root.load_calendar_events(undefined, deny_on_load);	
				}
			},
			$input: null,
			init: function() {
				var self = this;
				/*setInterval(function() {
					var date = new Date();
					var hour = date.getHours();
					if(self.current_hour != hour) { // && (hour == 0 || hour == 12)
						var editing_in_progress = self.root.global.editing_in_progress();
						if(!editing_in_progress) {
							self.current_hour = hour;
							//self.load();	
						}
					}
				}, 1800000);*/
				
				var html = $('#templates').first().find('#calendar_template').first()[0].outerHTML;
				////console.log($container[0]);
				$container.append("<input type='hidden' id='"+content_item.id+"' class='form_input' value='' />");
				self.$input = $container.find('#'+content_item.id+'.form_input').first();
				self.$input.change(function() {
					var $this = $(this);
					var val = $this.val();
					var current_date_string = new Date().toISOString().split('T')[0];
					//alert(val);
					if(val == "-1") {
						$this.val(current_date_string);	
						self.loaded_callback = function() {
							$('.day_'+current_date_string).first().addClass('selected');
						};
						$this.trigger('change');
					}
					if(val != null && val.trim().length > 0 && val.indexOf('-') != -1 && val != "-1") {
						//alert(val);
						var val_split = val.split('-');
						var year = val_split[0];
						//alert(year);
						var month = parseInt(val_split[1]);
						var day = val_split[2];
						
						self.$year_select.val(year);
						self.$month_select.val(month);
						self.set_select_callback(function() {
							self.$calendar_container.find('.calendar_cell.day_'+val).addClass('selected');
						});
						self.load(year, month);
					}
				});
				$container.append(html);
				var $calendar_container = $container.find('#calendar_template').first();
				$calendar_container.attr('id', content_item.id+'_calendar').show();
				self.$calendar_container = $calendar_container.find('.calendar_container');
				
				if(!content_item.no_controls) {
					$calendar_container.prepend("<div class='calendar_controls'><select class='year_select'><option disabled selected value>Select Year</option></select><select class='month_select'><option disabled selected value>Select Month</option></select></div>");
					var current_year = new Date().getFullYear();
					var year = current_year-100;
					var max_year = year+150;
					var $calendar_controls = $calendar_container.find('.calendar_controls').first();
					var $year_select = $calendar_controls.find('.year_select');
					while(year < max_year) {
						$year_select.append("<option value='"+year+"'>"+year+"</option>");
						year++;	
					}
					var $month_select = $calendar_controls.find('.month_select');
					var counter = 1;
					var months = [
						"January", "February", "March", "April", "May",
						"June", "July", "August", "September", "October",
						"November", "December"
					];
					while(counter <= 12) {
						$month_select.append("<option value='"+counter+"'>"+months[counter-1]+"</option>");
						counter++;	
					}
					$year_select.on('change', function() {
						if(typeof content_item.no_day !== 'undefined') {
							self.month_year_value();
						} else {
							self.load($(this).val(), $month_select.val());
						}
					});
					$month_select.on('change', function() {
						if(typeof content_item.no_day !== 'undefined') {
							self.month_year_value();
						} else {
							self.load($year_select.val(), $(this).val());
						}
					});
					
					var date_object = new Date();
					var current_monht = date_object.getMonth()+1;
					$year_select.val(current_year);
					$month_select.val(current_monht);
					
					self.$year_select = $year_select;
					self.$month_select = $month_select;
					
					var current_date_string = new Date().toISOString().split('T')[0];
					self.$input.val(current_date_string);
					self.loaded_callback = function() {
						$('.day_'+current_date_string).first().addClass('selected');
					};
				}
				
				$('.calendar_day_view .close_button').click(function() {
					self.current_day_view = null;
					$('.calendar_container').removeClass('blur');
					$('.time_container').removeClass('blur');
					$('.calendar_day_view').animate({
						'opacity': 0
					}, 1250, 'ease_out_x', function() {
						$(this).css({
							'display': 'none'
						})
					});
				});
				
				self.load();
			},
			month_year_value: function() {
				var self = this;
				var year_value = self.$year_select.val();
				var month_value = self.$month_select.val();
				if(month_value.length == 1) {
					month_value = "0"+month_value;
				}
				var date = year_value+"-"+month_value+"-01";
				self.$input.val(date);
			},
			select_callbacks: Array(),
			set_select_callback: function(callback, temporary) {
				this.select_callbacks = Array();
				if(typeof temporary !== 'undefined') {

					this.select_callbacks.push({
						temporary: true,
						callback: callback
					});
				} else {
					this.select_callbacks.push(callback);
				}
			},
			get_value: function() {
				return this.$input.val();
			},
			current_date: null,
			year: null,
			month: null,
			load_calendar_events: function(reload_view, deny_on_load) {
				var self = this;
				var post_data = {
					'action': 'events',
					'year': self.year,
					'month': self.month
				};
				if(typeof content_item.post_data !== 'undefined') {
					interpretation_branch.apply_load_mask(post_data, content_item.post_data, page_data);	
				}
				branch.root.post(branch.root.actions, post_data, function(data) {
					if(self.current_day_view != null) {
						self.load_day_view(self.current_day_view);	
					}
					self.clear_events(data);
					for(var x in data) {
						self.add_events(x, data[x], undefined, reload_view);
					}
					
					if(!deny_on_load) {
						if(content_item.on_load) {
							branch.root.interpretation.on_load(content_item);
						}
					}
				}, "json");
			},
			clear_events: function(dates) {
				var self = this;
				self.$calendar_container.find('.calendar_cell').each(function() {
					var $this = $(this);
					$this.find('.events').html("");
					//var date = $this.attr('id').split('day_')[1];
				});
			},
			row_height: null,
			add_events: function(date, events, $container, reload_view) {
				var self = this;
				var $events = self.$calendar_container.find('#day_'+date).find('.events').first();
				if(typeof $container !== 'undefined') {
					$events = $container;	
				}
				if(!reload_view) {
					$events.html("");
				} else {
					branch.root.clear_removed_items(events, $events, "event", "event");	
				}
				var html = $('#event_template').first()[0].outerHTML;
				//this.row_height = $('.calendar_container').find('#day_'+date).parent().height();
				var $last_item = null;
				for(var x in events) {
					if(reload_view) {
						$events.append(html);
					} else {
						$last_Item = branch.root.replace_append(html, $events, $last_item, events[x].id);
					}
					$events.find('#event_template').first().attr('id', "event_"+events[x].id);
					var $event = $events.find('#event_'+events[x].id).first();
					$event.find('.project_bullet').css({
						'background-color': 'hsla('+events[x].color+')'
					});
					$event.attr('title', events[x].value);
					$event.find('.event_value').html(events[x].value);
					$event.attr('draggable', 'true');
					$event.on('dragstart', function drag(event) {
						event.dataTransfer = event.originalEvent.dataTransfer;
						event.dataTransfer.setData("id", event.target.id);
						event.dataTransfer.setData("date", $event.parent().parent().attr('id'));
					});
					$event.show();
					$event.on('dragover', function(event) {
						event.preventDefault();
					});
					$event.on('drop', function(event) {
						event.preventDefault();  
						event.stopPropagation();
						event.dataTransfer = event.originalEvent.dataTransfer;
						var id = event.dataTransfer.getData("id").split("_");
						var date = event.dataTransfer.getData("date").split("day_")[1];
						
						var event_date = $event.parent().parent().attr('id').split("day_")[1];
						var add_to_day = false;
						if(event_date != date) {
							add_to_day = true;	
						}
						
						var id_prefix = id[0];
						var id_suffix = id[1];
						var this_id = this.id.split('event_')[1];
						switch(id_prefix) {
							case 'event':
								if(!add_to_day) {
									self.save_order(id_suffix, this_id, $events);
								} else {
									branch.root.post(branch.root.actions, {
										'action': '_event',
										'id': id_suffix,
										'event_date': event_date,
										'calendar_id': content_item.id
									}, function(data) {
										self.load_calendar_events();
										//self.save_order(id_suffix, this_id, $events);
									});	
								}
								break;	
						}
						if($events.parent().hasClass('calendar_cell')) {
							$events.parent().css({
								'background-color': 'transparent'
							});
						}
					});
					/*$event.dblclick(function() {
						
					});*/
					$event.click(function(event) {
						event.stopPropagation();
						self.select_li($(this));
					});
					(function(item) {
						var $checkbox = $event.find('input.complete').first();
						if(item.completed == 1) {
							$checkbox[0].checked = true;	
						}
						$checkbox.click(function() {
							if(this.checked) {
								branch.root.post(branch.root.actions, {
									'action': 'complete_objective',
									'id': item.objective_id
								}, function(data) {
									//self.root.library.load_objectives_library();
									//self.root.current_agenda.load();
								});
							} else {
								branch.root.post(branch.root.actions, {
									'action': 'complete_objective',
									'id': item.objective_id,
									'completed': 0
								}, function(data) {
									//self.root.library.load_objectives_library();
									//self.root.current_agenda.load();
								});
							}
						});
					}(events[x]));
					/*var height = $('.calendar_container').find('#day_'+date).parent().height();
					if(height > this.row_height) {
						$event.hide();	
					}*/
					//$events.append(events[x].objective_id);
				}
			},
			$selected_li: null,
			selected_li: null,
			select_li: function($li, set) {
				var self = this;
				if(typeof set === 'undefined' || set === false) { 
					self.$calendar_container.find('.event.selected').removeClass('selected');
				}
				if($li != null) {
					$li.addClass('selected');
					this.$selected_li = $li;
					this.selected_li = this.$selected_li.attr('id');
				} else {
					this.$selected_li = null;	
					this.selected_li = null;
				}
			},
			save_order: function(dragged_value, dropped_value, $events, callback) {
				var self = this;
				var order_values = Array();
				$events.children().each(function() {
					var id = $(this).attr('id').split('event_')[1];//find('.id').first().html();
					order_values.push(id);
				});
				if(dropped_value == null) {
					var index_dragged = order_values.indexOf(dragged_value);
					order_values[index_dragged] = "-1";
					order_values.push(dragged_value);
				} else {
					var index_dragged = order_values.indexOf(dragged_value);
					if(index_dragged != -1) {
						order_values[index_dragged] = "-1";
					}
					var index_dropped = order_values.indexOf(dropped_value);
					order_values.splice(index_dropped, 0, dragged_value);
				}
				
				branch.root.post(branch.root.actions, {
					'action': 'events_set_order',
					'v': JSON.stringify(order_values)
				}, function(data) {
					self.load_calendar_events();
					if(typeof callback !== 'undefined') {
						callback();	
					}
				});
			},
			load_day_view: function(date) {
				var self = this;
				$('.calendar_day_view').attr('id', "day_"+date);
				var date_formatted = branch.root.interpretation.view.date.date_format(date);
				$('.calendar_day_view .day_name').html(date_formatted);
				branch.root.post(branch.root.actions, {
					'action': 'events_date',
					'date': date,
					'calendar_id': content_item.id
				}, function(data) {
					self.add_events(null, data, $('.calendar_day_view .events_container').first());
					$('.calendar_container').addClass('blur');
					$('.time_container').addClass('blur');
					$('.calendar_day_view').css({
						'display': 'unset',
						'opacity': 0
					}).animate({
						'opacity': 1
					}, 1250, 'ease_out_x', function() {
						
					});
				}, "json");
			},
			current_day_view: null,
			load: function(year, month, force_reload) {
				var self = this;
				var reload_view = false;
				if(typeof content_item.no_day !== 'undefined') {
					return;
				}
				if(month != self.month || year != self.year || !force_reload) {
					reload_view = true;	
				}
				var post_data = {
					'action': 'calendar'
				};
				if(typeof year !== 'undefined') {
					post_data.year = year;
					this.year = year;	
				} else if(self.year != null) {
					post_data.year = self.year;
				}
				if(typeof month !== 'undefined') {
					post_data.month = month;
					this.month = month;	
				} else if(self.month != null) {
					post_data.month = self.month;
				}
				//alert('datepicker');
				$.post(branch.root.actions, post_data, function(data) {
					////console.log(data);
					data = data.result;
					self.$calendar_container.html(data);
					self.$calendar_container.find('.prev_month').click(function() {
						self.load($(this).attr('year'), $(this).attr('month'));
					});
					self.$calendar_container.find('.next_month').click(function() {
						self.load($(this).attr('year'), $(this).attr('month'));
					});
					//self.load_calendar_events(reload_view);
					//alert(self.select_callbacks);
					
					//self.select_callbacks = Array();

					self.$calendar_container.find('.calendar_cell').each(function() {
						var date = this.id.split('day_')[1];
						var $this = $(this);
						$this.click(function() {
							self.$calendar_container.find('.calendar_cell').removeClass('selected');
							$this.addClass('selected');
							self.$input.val(date);

							for(var z in self.select_callbacks) {
								if(typeof self.select_callbacks[z] === 'object') {
									var select_callback = self.select_callbacks.splice(z, 1)[0];
									////console.log(self.select_callbacks);
									////console.log(select_callback);
									select_callback.callback();
								} else {
									self.select_callbacks[z]();	
								}
							}
						});
					});
					if(typeof self.loaded_callback !== 'undefined' && self.loaded_callback !== null) {
						self.loaded_callback();
						self.loaded_callback = null;	
					}
				}, "json");	
			}
		};
		
		branch.root.assign_root_object(calendar_object);
		
		branch.root.elements.calendars[content_item.id+"_calendar"] = calendar_object;
		calendar_object.init();
		return calendar_object;		
		//interpretation_branch.loaded_objects[page.id].loaded();
	}
};

app.components = {
	vote: {
		new: function($container, item_id, item_name, element, component_item, page) {
			var branch = this;
			/*this.$container = null;
			this.item_id = null;
			this.item_name = null;
			this.element = null;*/
			function vote_object($container, item_id, item_name, element, page) {
				this.$container = $container;
				this.item_id = item_id;
				this.item_name = item_name;
				this.___element = element;
				this.component_item = component_item;
				this.page = page;
			}
			/*vote_object.prototype = branch;
			var item_object = new vote_object($container, item_id, item_name, element, page);*/

			var item_source = {
				initialized: false,
				init: function() {
					var branch = this;
					if(this.initialized) {
						return;
					}
					this.initialized = true;
					var post_data = {
						//'action': '_'+branch.component_item.table_name+"_alt",
						'connect_id': branch.item_id,
						'connect_value_element': branch.item_name,
						'connect_value_table_id': branch.component_item.___connect_value_table_id,
					};
					if(typeof branch.component_item.table_name !== 'undefined') {
						post_data.action = '_'+branch.component_item.table_name+"_alt";
					} else {
						post_data.action = '_insert_'+branch.component_item.id+"_alt";
					}
					////console.log(branch.$container[0].innerHTML);
					if(branch.$container.parent().find('.votes').length == 0) {
						branch.$container.append("<div class='votes'><div class='vote_count'>0</div><div class='vote_button'><i class='icofont-arrow-up'></i></div></div>");
						branch.$container = branch.$container.find('.votes').first();
					}
					branch.$container.find('.vote_button').first().click(function() {
						if(branch.root.user_id != -1 && !branch.$container.hasClass('voted')) {
							branch.root.post(branch.root.actions, post_data, function(data) {
								branch.get_votes();
							});
						}
					});
				},
				get_votes: function() {
					var branch = this;
					////console.log(branch.component_item.connect_value_table_id);
					branch.root.post(branch.root.actions, {
						'action': branch.component_item.id+'_vote',
						'connect_id': branch.item_id,
						'connect_value_table_id': branch.component_item.___connect_value_table_id,	
					}, function(data) {
						branch.$container.find('.vote_count').html(data);
						branch.$container.addClass('voted');
					}, "json");
				},
				load: function(data_row) {
					////console.log(data_row);
					var branch = this;
					branch.$container.find('.vote_count').html(data_row.vote_count);
					if(data_row.voted_count >= 1) {
						branch.$container.addClass('voted');	
					}
				}
			};

			var item_object = {...item_source};
			item_object.$container = $container;
			item_object.item_id = item_id;
			item_object.item_name = item_name;
			item_object.___element = element;
			item_object.component_item = component_item;
			item_object.page = page;

			branch.root.assign_root_object({ item_object: item_object }, true);
			//console.log('item_object');
			//console.log(item_object);
			return item_object;
		}
		
	},
	tags: {
		new: function($container, item_id, item_name, element, component_item, page) {
			var self = this;
			function tags_object($container, item_id, item_name, element) {
				this.$container = $container;
				this.item_id = item_id;
				this.item_name = item_name;
				this.element = element;
				this.component_item = component_item;
				this.page = page;
			}
			tags_object.prototype = self;
			//tags_object.root_branch = this;
			return new tags_object($container, item_id, item_name, element);
		},
		init: function() {
			var $tags_container = this.$container;//this.$container.find('.tags').first();
			//alert($tags_container.html());
			var split = $tags_container.text().split(',');
			$tags_container.html("");

			for(var x in split) {
				var href;
				var tag = split[x].trim();
				var post_data = {
					'tag': tag
				};
				if(this.component_item.target == 'self') {
					href = this.root.navigation.generate_href(this.page.id, null, null, post_data, this.page.frame_id);
				}
				$tags_container.append("<a href='"+href+"'>"+tag+"</a>, ");
			}
		}
	}
};

app.custom_elements.componentcontainer = {
	//new: function($container, item_id, item_name, element, component_item) {
	type_name: "_componentcontainer",
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = this;
		/*this.$container = null;
		this.item_id = null;
		this.item_name = null;
		this.element = null;*/
		if(typeof content_item.inject_element !== 'undefined') {
			
		}

		function item_object_constructor(content_item, $container, page_data, interpretation, page) {
			this.content_item = content_item;
			this.$container = $container;
			this.page_data = page_data;
			this.interpretation = interpretation;
			this.page = page;
			//this.component_item = component_item;
		}
		/*item_object_constructor.prototype = branch.item_object;
	 	var item_object = new item_object_constructor(content_item, $container, page_data, interpretation, page);*/

	 	var item_source = {
			operation: {
				components: {},
				init: function() {
					var branch = this;
					/*var branch = this;
					branch.get_votes();
					branch.$container.find('.vote_button').click(function() {
						$.post(branch.root.actions, {
							'action': branch.item_name+'_vote',
							'id': branch.item_id
						}, function(data) {
							branch.get_votes();
						});
					});*/
					branch.instance_parent.$container.append("<div class='componentcontainer' id='"+branch.instance_parent.content_item.id+"_componentcontainer'></div>");
					branch.$container = branch.instance_parent.$container.find('.componentcontainer#'+branch.instance_parent.content_item.id+"_componentcontainer").first();
					//this.load();
					//branch.root.interpretation.loaded_objects[branch.instance_parent.page.id].loaded();
					var self = this;
					/*if(self.loaded) {
						if(typeof callback !== 'undefined') {
							callback();
						}
						return;
					}*/
					var content_item = self.instance_parent.content_item;
					var data = self.instance_parent.page_data;
					var page = self.instance_parent.page;
					var $li = self.$container;
					if(typeof content_item.components !== 'undefined') {
						var x = content_item.id;
						console.log(x);
						//if(!self.loaded) {
							self.components[x] = ({});
						//}
						for(var v in content_item.components) {
							(function($li, x, v) {
								if(!self.loaded) {
									self.components[x][v] = self.root.components[content_item.components[v].type].new($li, data.id, content_item.id, self, content_item.components[v], page);
									self.components[x][v].init();
								}
								//self.components[x][v].load(data);
							}($li, x, v));
						}
					}
					console.log('selfcomponents');
					console.log(self.components);
					/*if(typeof callback !== 'undefined') {
						callback();
					}*/
					self.loaded = true;
				},
				loaded: false,
				load: function(callback) {
					var self = this;
					/*if(self.loaded) {
						if(typeof callback !== 'undefined') {
							callback();
						}
						return;
					}*/
					var content_item = self.instance_parent.content_item;
					var data = self.instance_parent.page_data;
					var page = self.instance_parent.page;
					var $li = self.$container;
					if(typeof content_item.components !== 'undefined') {
						/*if(!self.loaded) {
							self.components[x] = ({});
						}*/
						var x = content_item.id;
						console.log('selfcomponents');
						console.log(self.components);
						for(var v in content_item.components) {

							(function($li, x, v) {
								/*if(!self.loaded) {
									self.components[x][v] = self.root.components[content_item.components[v].type].new($li, data.id, content_item.id, self, content_item.components[v], page);
									self.components[x][v].init();
								}*/
								self.components[x][v].load(data);
							}($li, x, v));
						}
					}
					if(typeof callback !== 'undefined') {
						callback();
					}
					//self.loaded = true;
				}
			}
		};

	 	var item_object = {...item_source};
	 	item_object.content_item = content_item;
	 	item_object.$container = $container;
	 	item_object.page_data = page_data;
	 	item_object.intepretation = interpretation;
	 	item_object.page = page;
		branch.root.assign_root_object({ item: item_object }, true);
	 	item_object.operation.init();
		branch.root.elements.assign_element(branch.type_name, item_object, page.id, content_item.id);
	}
};

app.custom_elements.comments = {
	type_name: '_comments',
	item_object: {
		operation: {
			$container: null,
			$children: null,
			init: function() {
				var branch = this;
				//branch.$children = branch.instance_parent.$element.find('.children').first();	
				branch.threads_id = branch.instance_parent.page_data.id;

				if(typeof branch.instance_parent.content_item.li_html === 'undefined') {
					branch.instance_parent.content_item.li_html = "<div class='comment' id='comment_li_template'><div class='auto_height'><div class='value_container'><div class='thread_votes votes'><div class='vote_count'>121</div><div class='vote_button'><i class='icofont-arrow-up'></i></div></div><div class='value'></div></div><div class='li_info'><div class='email'></div><div class='created'></div></div><div class='reply_button'>Reply</div><div class='reply_form'></div></div><div class='children'></div></div>";
					branch.instance_parent.content_item.li_template_id = "comment_li_template";
				}
				
				branch.$container = branch.instance_parent.$element;
				if(typeof branch.instance_parent.content_item.base_html !== 'undefined') {
					branch.$container.append(branch.instance_parent.content_item.base_html);
				} else {
					branch.$container.append("<div class='children main_start_comments'></div><div class='reply_form'><textarea class='comments_reply' placeholder='Type reply here'></textarea><button class='reply_button'>Reply</button></div>");
				}
				$li = branch.$container;
				var $reply_textarea = $li.find('.comments_reply').first();
				var $reply_button = $li.find('.reply_button').first();
				$reply_button.click(function() {
					var value = $reply_textarea.val();
					var post_data = {
						'action': '_insert_'+branch.instance_parent.content_item.id,
						'value': value,
						'threads_id': branch.threads_id
					};
					branch.root.post(branch.root.actions, post_data, function(data) {
						//alert(data);
						$reply_textarea.val("");
						branch.load();
					});
				});
				branch.$container = branch.$container.find('.children.main_start_comments').first();
				var data = null;
				var element_id = branch.instance_parent.content_item.data_name;
				////console.log(branch.instance_parent.page_data);
				////console.log(element_id);

				if(typeof branch.instance_parent.page_data[element_id] !== 'undefined') {
					data = branch.instance_parent.page_data[element_id];
					//alert('set');
				}
				/*branch.load(null, function() {
					branch.root.interpretation.loaded_objects[branch.instance_parent.page.id].loaded();
				}, data);*/		
			},
			load: function(callback, send_data, data) {
				var branch = this;
				//alert(callback);
				//alert(data);
				if(typeof data !== 'undefined' && data != null) {
					this.update_view(data);
					if(typeof callback !== 'undefined' && callback != null) {
						callback();
					}
					return;
				}
				var post_data = {
					'action': branch.instance_parent.id+branch.instance_parent.element_branch.type_name,
					'order_direction': 'ASC'
					//'threads_id': branch.threads_id
					//'page_id': branch.instance_parent.page_data.id
				};
				if(typeof branch.instance_parent.content_item.post_data !== 'undefined') {
					branch.instance_parent.element_branch.root.interpretation.apply_load_mask(post_data, branch.instance_parent.content_item.post_data, branch.instance_parent.page_data);
				}
				////console.log('post_data');
				////console.log(post_data);
				branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, post_data, function(data) {
					//branch.$container.html("");
					/*for(var x in data) {
						branch.print_node(data[x]);
					}*/
					//setTimeout(function() {
						branch.update_view(data);
						if(typeof callback !== 'undefined' && callback != null) {
							callback();
						}
					//}, 1500);

					//branch.root.interpretation.loaded_objects[branch.instance_parent.page.id].loaded();
				    //branch.instance_parent.element_branch.connect_elements($("#svg1"), $("#path1"), $("#10_node"), $("#11_node"));
				}, "json");
			},
			components: Array(),
			update_view: function(data) {
				var branch = this;
				if(branch.$container.hasClass('in_progress')) {
					//alert('test');
					return;
				}
				branch.$container.addClass('in_progress');
				//branch.$container.html("");
				////console.log(data);
				for(var x in data) {
					var parent_id = data[x].comments_id;
					////console.log(parent_id);
					var $container = branch.$container;
					var interlope = 0;
					if(typeof parent_id !== 'undefined' && parent_id != null && parent_id != data[x].id) {
						$container = branch.$container.find('#'+parent_id+'_comment').first().find('.children').first();
						if($container.parent().hasClass('interlope')) {
							interlope = 1;
						} else {
						}
 						//alert($container[0]);
					}
					////console.log($container.length);
					if($container.find('#'+data[x].id+'_comment').length == 0) {
						$container.append(branch.instance_parent.content_item.li_html);
						////console.log($container.html());
						var $li = $container.find('#'+branch.instance_parent.content_item.li_template_id).first();
						if(interlope == 0) {
							$li.addClass('interlope');
						}
						////console.log(data[x]);
						////console.log($li.length);
						(function($li, x) {
							$li.attr('id', data[x].id+'_comment');
							$li.find('.value').first().text(data[x].value);
							if(typeof data[x]['users.email'] !== 'undefined') {
								$li.find('.email').first().html(data[x]['users.email']);
							}
							if(typeof data[x].created !== 'undefined') {
								$li.find('.created').first().html(data[x].created);
							}
							$li.find('.reply_button').first().click(function() {
								$li.find('.reply_form').first().html("<textarea class='comments_reply' placeholder='Type reply here'></textarea><button class='post_reply_button'>Post reply</button><button class='cancel_reply_button'>Cancel reply</button>").css({
									//'height': '0px',
									'opacity': 0,
								}).animate({
									'opacity': 1
									//'height': 'auto'
								}, 750, 'easeInQuad', function() {

								});
								var $reply_textarea = $li.find('.comments_reply').first();
								var $reply_button = $li.find('.post_reply_button').first();
								$reply_textarea.focus();
								$reply_button.click(function() {
									var value = $reply_textarea.val();
									var post_data = {
										'action': '_insert_'+branch.instance_parent.content_item.id,
										'value': $reply_textarea.val(),
										'threads_id': branch.threads_id,
										'comments_id': data[x].id
									};
									branch.root.post(branch.root.actions, post_data, function(data) {
										branch.load();
										$li.find('.reply_form').hide().find('textarea.comments_reply').val("");
									});
								});
								var $cancel_reply_button = $li.find('.cancel_reply_button').first().click(function() {
									$reply_textarea.val("");
									$li.find('.reply_form').animate({
										//'height': '0px',
										'opacity': 0
									}, 1200, 'easeInOutQuint', function() {
										$li.find('.reply_form').html("");
									});
								});
								/*branch.root.events.press_enter($reply_textarea, function() {

								});*/

							});
							if(typeof branch.instance_parent.content_item.components !== 'undefined') {
								branch.components[x] = ({});
								for(var v in branch.instance_parent.content_item.components) {
									(function($li, x, v) {
										branch.components[x][v] = branch.root.components[branch.instance_parent.content_item.components[v].type].new($li.find('.'+branch.instance_parent.content_item.components[v].container).first(), data[x].id, branch.instance_parent.content_item.id, branch, branch.instance_parent.content_item.components[v], branch.instance_parent.page);
										branch.components[x][v].init();
										branch.components[x][v].load(data[x]);
									}($li, x, v));
								}
							}
						}($li, x));
					}
					//$li.find('.email').first().html(data[x].email);
				}
				branch.$container.removeClass('in_progress');
			}
		}
	},
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = {...this};
		branch.content_item = content_item;
		//alert($container.length);
		$container.append("<div class='comments' id='"+content_item.id+"_comments'></div>");
		branch.$container = $container.find('#'+content_item.id+branch.type_name).first();

		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;

		/*function item_object_constructor(id, $element, element_branch, id_singular, content_item, page_data, $page_container, page) {
			this.id = id;
			this.$element = $element;
			this.element_branch = element_branch;
			this.id_singular = id_singular;
			this.content_item = content_item;
			this.page_data = page_data;
			this.$page_container = $page_container;
			this.page = page;
		}
		item_object_constructor.prototype = branch.item_object;

		var item_object = new item_object_constructor(content_item.id, branch.$container, branch, content_item.id_singular, content_item, page_data, $container, page);*/
		item_object = branch.item_object;
		item_object.id = content_item.id;
		item_object.$element = branch.$container;
		item_object.element_branch = branch;
		item_object.id_singular = content_item.id_singular;
		item_object.content_item = content_item;
		item_object.page_data = page_data;
		item_object.$page_container = $container;
		item_object.page = page;

		//var item_object = branch;

		branch.root.assign_root_object(item_object, true);
		item_object.operation.init();
		/*item_object.operation.load(function() {
			branch.interpretation.loaded_objects[branch.page.id].loaded();
		});*/

		branch.root.elements.assign_element(branch.type_name, item_object, page.id, content_item.id);

	}
};

app.custom_elements.calendar = {
	init: function(content_item, $container, page_data, interpretation_branch, page) {
		var branch = this;
		
		var calendar_object = {
			toggle: 0,
			current_hour: null,
			$calendar_container: null,
			operation: {
				load: function(send_data, search_string, deny_on_load) {
					var self = this;
					self.root.load_calendar_events(undefined, deny_on_load);	
				}
			},
			$month_select: null,
			$year_select: null,
			init: function() {
				var self = this;
				/*setInterval(function() {
					var date = new Date();
					var hour = date.getHours();
					if(self.current_hour != hour) { // && (hour == 0 || hour == 12)
						var editing_in_progress = self.root.global.editing_in_progress();
						if(!editing_in_progress) {
							self.current_hour = hour;
							//self.load();	
						}
					}
				}, 1800000);*/
				
				var html = $('#templates').first().find('#calendar_template').first()[0].outerHTML;
				$container.append(html);
				var $calendar_container = $container.find('#calendar_template').first();
				$calendar_container.attr('id', content_item.id+'_calendar').show();
				self.$calendar_container = $calendar_container.find('.calendar_container');
				
				if(!content_item.no_controls) {
					$calendar_container.prepend("<div class='calendar_controls'><select class='year_select'><option disabled selected value>Select Year</option></select><select class='month_select'><option disabled selected value>Select Month</option></select></div>");
					var year = new Date().getFullYear();
					var current_year = year;
					var max_year = year+30;
					var $calendar_controls = $calendar_container.find('.calendar_controls').first();
					var $year_select = $calendar_controls.find('.year_select');
					while(year < max_year) {
						$year_select.append("<option value='"+year+"'>"+year+"</option>");
						year++;	
					}
					var $month_select = $calendar_controls.find('.month_select');
					var counter = 1;
					var months = [
						"January", "February", "March", "April", "May",
						"June", "July", "August", "September", "October",
						"November", "December"
					];
					while(counter <= 12) {
						$month_select.append("<option value='"+counter+"'>"+months[counter-1]+"</option>");
						counter++;	
					}
					$year_select.on('change', function() {
						self.load($(this).val(), $month_select.val());
					});
					$month_select.on('change', function() {
						self.load($year_select.val(), $(this).val());
					});
					var date_object = new Date();
					var current_monht = date_object.getMonth()+1;
					$year_select.val(current_year);
					$month_select.val(current_monht);
					//alert(current_year);
					//alert(current_month);
					self.$month_select = $month_select;
					self.$year_select = $year_select;
				}
				
				/*$('.calendar_day_view .close_button').click(function() {
					self.current_day_view = null;
					$('.calendar_container').removeClass('blur');
					$('.time_container').removeClass('blur');
					$('.calendar_day_view').animate({
						'opacity': 0
					}, 1250, 'ease_out_x', function() {
						$(this).css({
							'display': 'none'
						})
					});
				});*/
				
				self.load();
			},
			current_date: null,
			year: '',
			month: '',
			loaded_calendar: false,
			//load_in_progress: false,
			//load_timeout_callback: null,
			load_calendar_events: function(reload_view, deny_on_load) {
				var self = this;
				////console.log('self.loaded_calendar');
				////console.log(self.loaded_calendar);
				if(!self.loaded_calendar) {
					return;
				}
				var post_data = {
					'action': 'events',
					'year': self.year,
					'month': self.month,
					'first_day': self.first_day,
					'last_day': self.last_day
				};
				//post_data.calendar_app_id = branch.root.app_id;
				if(typeof content_item.post_data !== 'undefined') {
					post_data.post_data = {};
					interpretation_branch.apply_load_mask(post_data.post_data, content_item.post_data, page_data);	
				}
				////console.log('self.load_in_progress');
				////console.log(self.load_in_progress);
				//self.load_in_progress = true;
				branch.root.post(branch.root.actions, post_data, function(data) {
					//if(self.current_day_view != null) {
					//	self.load_day_view(self.current_day_view);	
					//}
					/*self.calendar_id = data.calendar_id;
					delete data.calendar_id;*/
					//console.log('----calendar data----');
					//console.log(data);

					//if(!self.load_in_progress) {
					//clearTimeout(self.load_timeout_callback);
					//self.load_timeout_callback = setTimeout(function() {
					self.clear_events(data);
					//}

					for(var x in data) {
						self.add_events(x, data[x], undefined, reload_view);
					}
					
					/*if(!deny_on_load) {
						if(content_item.on_load) {
							branch.root.interpretation.on_load(content_item);
						}
					}*/
						//self.load_in_progress = false;
					//}, 20);
				}, "json");
				
			},
			clear_events: function(dates) {
				var self = this;
				self.$calendar_container.find('.calendar_cell').each(function() {
					var $this = $(this);
					$this.find('.events').html("");
					//var date = $this.attr('id').split('day_')[1];
				});
			},
			row_height: null,
			add_events: function(date, events, $container, reload_view) {
				var self = this;
				var $day = self.$calendar_container.find('#day_'+date).first();
				var $events = $day.find('.events').first();
				/*if($events.length == 0) {
					$day.append("<div class='events'></div>");
					$events = $day.find('.events').first();
				}*/
				//console.log(self.$calendar_container.length);
				//console.log('inside_events: '+$events.length);
				if(typeof $container !== 'undefined') {
					$events = $container;	
				}
				/*if(!reload_view) {
					$events.html("");
				} else {
					branch.root.clear_removed_items(events, $events, "event", "event");	
				}*/
				var $html = $('#event_template').first();//first()[0].outerHTML;
				//this.row_height = $('.calendar_container').find('#day_'+date).parent().height();
				var $last_item = null;
				for(var x in events) {
					//if(reload_view) {
					var item = events[x];
					var $event = $html.clone();
					$event.attr('id', "event_"+events[x].id);
					$events.append($event);
					/*} else {
						$last_item = branch.root.replace_append(html, $events, $last_item, events[x].id);
					}*/
					//$events.find('#event_template').first().attr('id', "event_"+events[x].id);
					//var $event = $events.find('#event_'+events[x].id).first();
					$event.find('.project_bullet').css({
						'background-color': 'hsla('+events[x].color+')'
					});
					$event.attr('title', events[x].value);
					$event.find('.event_value').html(events[x].value);
					$event.attr('draggable', 'true');
					$event.on('dragstart', function drag(event) {
						event.dataTransfer = event.originalEvent.dataTransfer;
						event.dataTransfer.setData("id", event.target.id);
						event.dataTransfer.setData("date", $event.parent().parent().attr('id'));
					});
					$event.show();
					$event.on('dragover', function(event) {
						event.preventDefault();
					});
					$event.on('drop', function(event) {
						event.preventDefault();  
						event.stopPropagation();
						event.dataTransfer = event.originalEvent.dataTransfer;
						var id = event.dataTransfer.getData("id").split("_");
						var date = event.dataTransfer.getData("date").split("day_")[1];
						
						var event_date = $event.parent().parent().attr('id').split("day_")[1];
						var add_to_day = false;
						if(event_date != date) {
							add_to_day = true;	
						}
						
						var id_prefix = id[0];
						var id_suffix = id[1];
						var this_id = this.id.split('event_')[1];
						switch(id_prefix) {
							case 'event':
								if(!add_to_day) {
									self.save_order(id_suffix, this_id, $events);
								} else {
									branch.root.post(branch.root.actions, {
										'action': '_event',
										'id': id_suffix,
										'event_date': event_date,
										'calendar_id': content_item.id
									}, function(data) {
										self.load_calendar_events();
										//self.save_order(id_suffix, this_id, $events);
									});	
								}
								break;	
						}
						if($events.parent().hasClass('calendar_cell')) {
							$events.parent().css({
								'background-color': 'transparent'
							});
						}
					});
					if(typeof content_item.on_dblclick !== 'undefined') {
						(function(item) {
							$event.dblclick(function() {
								//console.log('dblclick');
								if(Array.isArray(content_item.on_dblclick.post_data)) {
									for(var i in content_item.on_dblclick.post_data) {
										var found = false;
										for(var y in content_item.on_dblclick.post_data[i]) {
											if(typeof item[content_item.on_dblclick.post_data[i][y]] !== 'undefined' && item[content_item.on_dblclick.post_data[i][y]] != null && item[content_item.on_dblclick.post_data[i][y]].length > 0) {
												found = true;
											}
										}
										if(found) {
											var send_data = {

											};
											branch.root.interpretation.apply_load_mask(send_data, content_item.on_dblclick.post_data[i], item);
											//console.log('dblclick');
											//console.log(send_data);
											branch.root.navigation.navigate_to(content_item.on_dblclick.page[i], send_data);
										}
									}
								}
							});
						}(item));
					}
					$event.click(function(event) {
						event.stopPropagation();
						self.select_li($(this));
					});
					(function(item) {
						var $checkbox = $event.find('input.complete').first();
						if(item.completed == 1) {
							$checkbox[0].checked = true;	
						}
						$checkbox.click(function() {
							if(this.checked) {
								branch.root.post(branch.root.actions, {
									'action': 'complete_objective',
									'id': item.objective_id,
									'completed': 1
								}, function(data) {
									self.on_load();
								});
							} else {
								branch.root.post(branch.root.actions, {
									'action': 'complete_objective',
									'id': item.objective_id,
									'completed': 0
								}, function(data) {
									self.on_load();
								});
							}
						});
					}(events[x]));
					/*var height = $('.calendar_container').find('#day_'+date).parent().height();
					if(height > this.row_height) {
						$event.hide();	
					}*/
					//$events.append(events[x].objective_id);
				}
			},
			on_load: function() {
				if(content_item.on_load) {
					branch.root.interpretation.on_load(content_item);
				}
			},
			$selected_li: null,
			selected_li: null,
			select_li: function($li, set) {
				var self = this;
				if(typeof set === 'undefined' || set === false) { 
					self.$calendar_container.find('.event.selected').removeClass('selected');
				}
				if($li != null) {
					$li.addClass('selected');
					this.$selected_li = $li;
					this.selected_li = this.$selected_li.attr('id');
				} else {
					this.$selected_li = null;	
					this.selected_li = null;
				}
			},
			save_order: function(dragged_value, dropped_value, $events, callback) {
				var self = this;
				var order_values = Array();
				$events.children().each(function() {
					var id = $(this).attr('id').split('event_')[1];//find('.id').first().html();
					order_values.push(id);
				});
				if(dropped_value == null) {
					var index_dragged = order_values.indexOf(dragged_value);
					order_values[index_dragged] = "-1";
					order_values.push(dragged_value);
				} else {
					var index_dragged = order_values.indexOf(dragged_value);
					if(index_dragged != -1) {
						order_values[index_dragged] = "-1";
					}
					var index_dropped = order_values.indexOf(dropped_value);
					order_values.splice(index_dropped, 0, dragged_value);
				}
				
				branch.root.post(branch.root.actions, {
					'action': 'events_set_order',
					'v': JSON.stringify(order_values)
				}, function(data) {
					self.load_calendar_events();
					if(typeof callback !== 'undefined') {
						callback();	
					}
				});
			},
			load_day_view: function(date) {
				var self = this;
				$('.calendar_day_view').attr('id', "day_"+date);
				var date_formatted = branch.root.interpretation.view.date.date_format(date);
				$('.calendar_day_view .day_name').html(date_formatted);
				branch.root.post(branch.root.actions, {
					'action': 'events_date',
					'date': date,
					'calendar_id': content_item.id
				}, function(data) {
					self.add_events(null, data, $('.calendar_day_view .events_container').first());
					$('.calendar_container').addClass('blur');
					$('.time_container').addClass('blur');
					$('.calendar_day_view').css({
						'display': 'unset',
						'opacity': 0
					}).animate({
						'opacity': 1
					}, 1250, 'ease_out_x', function() {
						
					});
				}, "json");
			},
			first_day: null,
			last_day: null,
			current_day_view: null,
			load: function(year, month, force_reload) {
				var self = this;
				var reload_view = false;
				if(month != self.month || year != self.year || !force_reload) {
					reload_view = true;	
				}
				var post_data = {
					'action': 'calendar_days'
				};
				if(typeof year !== 'undefined') {
					post_data.year = year;
					this.year = year;	
				} else if(self.year != null) {
					post_data.year = self.year;
				}
				if(typeof month !== 'undefined') {
					post_data.month = month;
					this.month = month;	
				} else if(self.month != null) {
					post_data.month = self.month;
				}
				if(typeof year !== 'undefined' && year.trim() != '') {
					self.$year_select.val(year);
				}
				if(typeof month !== 'undefined' && month.trim() != '') {
					self.$month_select.val(month);
				}
				branch.root.post(branch.root.actions, post_data, function(data) {
					////console.log('calendar object');
					////console.log(data);
					data = data.result;
					self.$calendar_container.html(data);
					self.first_day = self.$calendar_container.find('.calendar_cell').first().attr('id').split('day_')[1];
					self.last_day = self.$calendar_container.find('.calendar_cell').last().attr('id').split('day_')[1];
					self.$calendar_container.find('.prev_month').click(function() {
						self.load($(this).attr('year'), $(this).attr('month'));
					});
					self.$calendar_container.find('.next_month').click(function() {
						self.load($(this).attr('year'), $(this).attr('month'));
					});
					self.loaded_calendar = true;
					self.load_calendar_events();
					self.$calendar_container.find('.calendar_cell').each(function() {
						var date = this.id.split('day_')[1];
						var $this = $(this);
						/*$this.find('.day_counter').first().click(function() {
							self.current_day_view = date;
							self.load_day_view(date);
						});*/
						$this.on('dragover', function(event) {
							event.preventDefault();
							$this.css({
								'background-color': 'rgba(0, 0, 0, 0.1)'
							});
						});
						$this.on('dragleave', function(event) {
							event.preventDefault();
							$this.css({
								'background-color': 'transparent'
							});
						});
						$this.on('drop', function(event) {
							event.preventDefault();  
							event.stopPropagation();
							event.dataTransfer = event.originalEvent.dataTransfer;
							var id = event.dataTransfer.getData("id").split("_");
							var prefix = id[0];
							var id_suffix = id[1];
							var this_id = this.id.split('day_')[1];
							switch(prefix) { 	
								/*case 'objective':
									branch.root.post(branch.root.actions, {
										'action': '_event',
										'objective_id': id_suffix,
										'event_date': this_id
									}, function(data) {
										self.load_calendar_events();
									});
									break;*/
								case 'event':
									branch.root.post(branch.root.actions, {
										'action': '_event',
										'id': id_suffix,
										'event_date': this_id,
										'calendar_id': content_item.id
									}, function(data) {
										self.load_calendar_events();
									});
									break;;
							}
							$this.css({
								'background-color': 'transparent'
							});
						});
						if(typeof content_item.no_add_event === 'undefined') {
							$this.dblclick(function(e) {
								e.preventDefault();
								e.stopPropagation();
								/*if(typeof self.calendar_id === 'undefined') {
									alert('no calendar');
									return;
								}*/
								var $html = $('#event_template_edit').clone();//.first()[0].outerHTML;
								$this.find('.events').first().append($html);
								var $edit = $html;//$this.find('#event_template_edit').first();
								$edit.find('textarea').first().focusout(function() {
									var post_data = {
										'action': '_calendar_event',
										'value': $edit.find('textarea').first().val(),
										'event_date': $edit.parent().parent().attr('id').split('day_')[1],
										'calendar_id': self.calendar_id
									};
									if(typeof content_item.post_data !== 'undefined') {
										interpretation_branch.apply_load_mask(post_data, content_item.post_data, page_data);	
									}
									branch.root.post(branch.root.actions, post_data, function(data) {
										self.load_calendar_events();
									});
								});
								branch.root.events.press_enter($edit.find('textarea'), function() {
									$edit.find('textarea').first().trigger('focusout');
								});
								$edit.show();
								$edit.find('textarea').focus();
							});
						}
					});
				}, "json");	
			}
		};
		
		branch.root.assign_root_object(calendar_object);
		
		branch.root.elements.calendars[content_item.id+"_calendar"] = calendar_object;
		calendar_object.init();
				
		interpretation_branch.loaded_objects[page.id].loaded();
	}
};

app.custom_elements.autoaddfield = {
	init: function(content_item, $container, page_data, interpretation, page, form_object) {
		var branch = this;
		branch.content_item = content_item;
		return;

		$container.append("<div class='numeric_status' id='"+content_item.id+"_numeric_status'></div>");
		branch.$numeric_status_container = $container.find('#'+content_item.id+'_numeric_status').first();
		/*var form_object;
		if(typeof content_item.target !== 'undefined') {
			form_object = branch.root.elements.find_element_object(content_item.target);
		}
		branch.form_object = form_object;
		
		$container.append("<div id='"+content_item.id+"_tree' class='tree'><div class='caption'>"+content_item.caption+"</div><div class='contents'></div></div>");
		var $tree = $container.find('#'+content_item.id+'_tree').first();
		branch.$tree_content = $tree.find('.contents').first();
		branch.load();
		
		*/

		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;

		var numeric_status_object = {
			id: content_item.id,
			printed: false,
			$element: branch.$numeric_status_container,
			operation: {
				load: function() {
					var self = this;
					branch.root.post(branch.root.actions, {
						'action': branch.content_item.id+'_numeric_status'
					}, function(data) {
						//branch.$tree_content.html("");
						//branch.print_tree_item(data, 20, branch.$tree_content);
						if(!self.printed) {
							branch.print_status(data);
							self.printed = true;
						} else {
							branch.update_view(data);
						}
						branch.interpretation.loaded_objects[branch.page.id].loaded();
					}, "json");
				}
			}
		};
		if(typeof branch.root.elements.numeric_statuss === 'undefined') {
			branch.root.elements.numeric_statuss = Array();	
		}
		branch.load();
		
		branch.root.elements.numeric_statuss[content_item.id+"_numeric_status"] = numeric_status_object;
	},
	load: function() {

	}
};

app.custom_elements.auto_add_field = {
	init: function(content_item, $container, page_data, interpretation, page, form_object) {
		var branch = this;
		branch.content_item = content_item;
		return;

		$container.append("<div class='numeric_status' id='"+content_item.id+"_numeric_status'></div>");
		branch.$numeric_status_container = $container.find('#'+content_item.id+'_numeric_status').first();
		/*var form_object;
		if(typeof content_item.target !== 'undefined') {
			form_object = branch.root.elements.find_element_object(content_item.target);
		}
		branch.form_object = form_object;
		
		$container.append("<div id='"+content_item.id+"_tree' class='tree'><div class='caption'>"+content_item.caption+"</div><div class='contents'></div></div>");
		var $tree = $container.find('#'+content_item.id+'_tree').first();
		branch.$tree_content = $tree.find('.contents').first();
		branch.load();
		
		*/

		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;

		var numeric_status_object = {
			id: content_item.id,
			printed: false,
			$element: branch.$numeric_status_container,
			operation: {
				load: function() {
					var self = this;
					branch.root.post(branch.root.actions, {
						'action': branch.content_item.id+'_numeric_status'
					}, function(data) {
						//branch.$tree_content.html("");
						//branch.print_tree_item(data, 20, branch.$tree_content);
						if(!self.printed) {
							branch.print_status(data);
							self.printed = true;
						} else {
							branch.update_view(data);
						}
						branch.interpretation.loaded_objects[branch.page.id].loaded();
					}, "json");
				}
			}
		};
		if(typeof branch.root.elements.numeric_statuss === 'undefined') {
			branch.root.elements.numeric_statuss = Array();	
		}
		branch.load();
		
		branch.root.elements.numeric_statuss[content_item.id+"_numeric_status"] = numeric_status_object;
	},
	load: function() {

	}
};

app.vote = {
	//new: function($container, item_id, item_name, element, component_item) {
	type_name: "_vote",
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = this;
		/*this.$container = null;
		this.item_id = null;
		this.item_name = null;
		this.element = null;*/
		if(typeof content_item.inject_element !== 'undefined') {
			
		}

		function vote_object($container, item_id, item_name, element) {
			this.$container = $container;
			this.item_id = item_id;
			this.item_name = item_name;
			this.element = element;
			this.component_item = component_item;
		}
		vote_object.prototype = branch;
	 	var item_object = new vote_object($container, item_id, item_name, element);

		branch.root.elements.assign_element(branch.type_name, item_object, page.id, content_item.id);
	},
	init: function() {
		var branch = this;
		branch.get_votes();
		branch.$container.find('.vote_button').click(function() {
			$.post(branch.root.actions, {
				'action': branch.item_name+'_vote',
				'id': branch.item_id
			}, function(data) {
				branch.get_votes();
			});
		});
	},
	get_votes: function() {
		var branch = this;
		$.post(branch.root.actions, {
			'action': branch.item_name+'_votes',
			'id': branch.item_id
		}, function(data) {
			branch.$container.find('.vote_count').html(data.votes);
			if(data.voted == 1) {
				branch.$container.addClass('voted');	
			}
		}, "json");
	}
};

app.custom_elements.tree = {
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = this;
		branch.content_item = content_item;
		var form_object;
		if(typeof content_item.target !== 'undefined') {
			form_object = branch.root.elements.find_element_object(content_item.target);
		}
		branch.form_object = form_object;
		
		$container.append("<div id='"+content_item.id+"_tree' class='tree'><div class='caption'>"+content_item.caption+"</div><div class='contents'></div></div>");
		var $tree = $container.find('#'+content_item.id+'_tree').first();
		branch.$tree_content = $tree.find('.contents').first();
		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;
		//branch.load();
		
		var tree_object = {
			id: content_item.id,
			$element: $tree,
			operation: {
				load: function() {
					var self = this;
					var post_data = {
						'action': branch.content_item.id+'_tree'
					};
					branch.root.interpretation.apply_load_mask(post_data, branch.content_item.post_data, page_data);
					branch.root.post(branch.root.actions, post_data, function(data) {
						branch.$tree_content.html("");
						self.print_tree_item(data, 20, branch.$tree_content);
						branch.interpretation.loaded_objects[branch.page.id].loaded();
					}, "json");
				},
				print_tree_item: function(data, padding, $container) {
					var self = this;
					for(var x in data) {
						(function(x) {
							$container.append("<div style='padding-left:"+padding+"px' class='node_wrap'><div id='"+data[x].id+"' class='node'><span>"+data[x].title+"</span><span class='controls'><i class='icofont-ui-edit edit_button'></i><i class='icofont-trash delete_button'></i></span></div><div class='children'></div></div>");
							var $node = $container.find('#'+data[x].id).first();
							var $edit = $node.find('.controls').find('.edit_button').first().click(function() {
								branch.root.post(branch.root.actions, {
									'action': 'get_'+branch.content_item.id+'_tree',
									'id': data[x].id
								}, function(data) {
									branch.form_object.operation.load(data);
								}, "json");
							});
							var $delete = $node.find('.controls').find('.delete_button').first().click(function() {
								//branch.root.dialogs.delete_dialog.display("Are you sure you want to delete this tree node (and it's children)?", function() {
									branch.root.post(branch.root.actions, {
										'action': 'delete_'+branch.content_item.id,
										'id': data[x].id
									}, function(data) {
										self.load();
									});
								//});
							});
							var $children = $container.find('#'+data[x].id).first().parent().find('.children').first();
							self.print_tree_item(data[x].children, padding+20, $children);	
						}(x));
					}
				}
			}
		};
		//tree_object.operation.prototype = branch;
		if(typeof branch.root.elements.trees === 'undefined') {
			branch.root.elements.trees = Array();	
		}
		branch.root.elements.trees[content_item.id+"_tree"] = tree_object;
		tree_object.operation.load();
		
	},
	/*load: function() {
		var branch = this;
		branch.root.post(branch.root.actions, {
			'action': branch.content_item.id+'_tree'
		}, function(data) {
			branch.$tree_content.html("");
			branch.print_tree_item(data, 20, branch.$tree_content);
			branch.interpretation.loaded_objects[branch.page.id].loaded();
		}, "json");
	},*/
	/*print_tree_item: function(data, padding, $container) {
		var branch = this;
		for(var x in data) {
			(function(x) {
				$container.append("<div style='padding-left:"+padding+"px' class='node_wrap'><div id='"+data[x].id+"' class='node'><span>"+data[x].title+"</span><span class='controls'><i class='icofont-ui-edit edit_button'></i><i class='icofont-trash delete_button'></i></span></div><div class='children'></div></div>");
				var $node = $container.find('#'+data[x].id).first();
				var $edit = $node.find('.controls').find('.edit_button').first().click(function() {
					branch.root.post(branch.root.actions, {
						'action': 'get_'+branch.content_item.id+'_tree',
						'id': data[x].id
					}, function(data) {
						branch.form_object.operation.load(data);
					}, "json");
				});
				var $delete = $node.find('.controls').find('.delete_button').first().click(function() {
					//branch.root.dialogs.delete_dialog.display("Are you sure you want to delete this tree node (and it's children)?", function() {
						branch.root.post(branch.root.actions, {
							'action': 'delete_'+branch.content_item.id+'_tree',
							'id': data[x].id
						}, function(data) {
							branch.load();
						});
					//});
				});
				var $children = $container.find('#'+data[x].id).first().parent().find('.children').first();
				branch.print_tree_item(data[x].children, padding+20, $children);	
			}(x));
		}
	}*/
};

app.custom_elements.numericstatus = {
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = this;

				//branch.root.interpretation.loaded_objects[page.id].loaded();
				//return;

		branch.content_item = content_item;

		$container.append("<div class='numeric_status numericstatus' id='"+content_item.id+"_numericstatus'></div>");
		branch.$numeric_status_container = $container.find('#'+content_item.id+'_numericstatus').first();
		branch.$numeric_status_container.append("<div class='table_settings'><input type='text' placeholder='Date From' class='date_from datepicker' /><input type='text' placeholder='Date To' class='date_to datepicker' /><button class='filter'>Filter</button></div><div class='numericstatus_container'></div><div class='graph_container'><canvas id='numeric_status_chart'></canvas><canvas id='quarter_status_chart'></canvas></div>");
		if(typeof content_item.no_default_from_date !== 'undefined') {

		} else {
			branch.$numeric_status_container.parent().find('.table_settings .date_from').first().val(branch.root.date.get_ytd_value());
		}
		branch.$numeric_status_container = branch.$numeric_status_container.find('.numericstatus_container').first();
		/*var form_object;
		if(typeof content_item.target !== 'undefined') {
			form_object = branch.root.elements.find_element_object(content_item.target);
		}
		branch.form_object = form_object;
		
		$container.append("<div id='"+content_item.id+"_tree' class='tree'><div class='caption'>"+content_item.caption+"</div><div class='contents'></div></div>");
		var $tree = $container.find('#'+content_item.id+'_tree').first();
		branch.$tree_content = $tree.find('.contents').first();
		branch.load();
		
		*/

		//branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;
		////console.log(branch.content_item);
		/*var numeric_status_object = {
			id: content_item.id,
			printed: false,
			$element: branch.$numeric_status_container,
			operation: {
				
			}
		};*/

		function constructor_numeric_status_object(content_item, printed, $element, page_data, page) {
			this.content_item = content_item;
			this.id = content_item.id;
			this.printed = printed;
			this.$element = $element;
			this.$numeric_status_container = $element;
			this.page_data = page_data;
			this.page = page;
			this.rand_id = Math.random();
			this.rand_id_2 = Math.random();
			//alert(this.rand_id);
		}

		var item_object = {
			operation: {
				init: function() {
					this.content_item = this.instance_parent.content_item;
					this.$numeric_status_container = this.instance_parent.$numeric_status_container;
					this.page = this.instance_parent.page;
				},
				load: function() {
					//alert('load');
					var branch = this;
					var self = this;
					var post_data = {
						'action': branch.instance_parent.content_item.id+'_numericstatus'
					};
					branch.root.interpretation.apply_load_mask(post_data, branch.instance_parent.content_item.post_data, branch.instance_parent.page_data);
					//alert(self.instance_parent.rand_id);
					//if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
					var date_from = self.instance_parent.$element.parent().find('.table_settings').find('.date_from').val();
					var date_to = self.instance_parent.$element.parent().find('.table_settings').find('.date_to').val();
					if(date_from.length > 0 || date_to.length > 0) {
						post_data.__date_interval = {
						};
						if(date_from.length > 0) {
							post_data.__date_interval.date_from = date_from;
						}
						if(date_to.length > 0) {
							post_data.__date_interval.date_to = date_to;
						}
					}
					//}

					branch.root.post(branch.root.actions, post_data, function(data) {
						//branch.$tree_content.html("");
						//branch.print_tree_item(data, 20, branch.$tree_content);
						if(!self.printed) {
							self.print_status(data);
							self.printed = true;
						} else {
							self.update_view(data);
						}
						branch.root.interpretation.loaded_objects[branch.page.id].loaded();
					}, "json");
				},
				$elements: {},
				set_colors: [],
				print_status: function(data) {
					var branch = this;
					//var color_index = 0;
					for(var x in branch.content_item.labels) {
						////console.log(x);
						////console.log(data[x]);
						//if(typeof branch.content_item.labels[x] !== 'undefined') {
						//var set_color = branch.root.colors.get_next_color(null, true);
						//color_index++;
						//branch.set_colors[x] = set_color;
						var is_negative = false;
						if(typeof branch.content_item.negative_value !== 'undefined') {
							if(branch.content_item.negative_value.indexOf(x) !== -1) {
								data[x] = branch.root.numeval.negative_value(data[x]);
							}
						}
						if(branch.root.numeval.is_negative(data[x])) {
							is_negative = true;
						}
						var label = branch.content_item.labels[x];
						branch.$numeric_status_container.append("<div class='numeric_status_item' id='"+x+"_numeric_status_item'><div class='header'>"+label+"</div><div class='numeric_status_value'>"+data[x]+"</div></div>");
						branch.$elements['$'+x] = branch.$numeric_status_container.find('#'+x+'_numeric_status_item').first();
						//set_color = 'hsl('+set_color+')';
						//branch.set_colors[x] = set_color;
						/*branch.$elements['$'+x].css({
							'color': set_color
						});*/
						if(!is_negative) {
							branch.$elements['$'+x].removeClass('currency_negative').removeClass('currency_positive').addClass('currency_positive');
						} else {
							branch.$elements['$'+x].removeClass('currency_negative').removeClass('currency_positive').addClass('currency_negative');
						}
						var is_vat = false;
						if(typeof branch.content_item.classes[x] !== 'undefined') {
							for(var i in branch.content_item.classes[x]) {
								branch.$elements['$'+x].find('.numeric_status_value').first().addClass(branch.content_item.classes[x][i]);
								if(branch.$elements['$'+x].find('.numeric_status_value').first().hasClass('currency_vat')) {
									is_vat = true;
								}
							}
						}
						if(is_vat && !is_negative) {
							branch.set_colors[x] = 'rgb(51, 204, 128)';
						} else if(is_negative) {
							branch.set_colors[x] = 'rgb(204, 51, 51)';
						} else {
							branch.set_colors[x] = 'rgb(51, 204, 204)';
						}
						branch.$elements['$'+x].css({
							'color': branch.set_colors[x]
						});
					}
					var ctx = branch.$numeric_status_container.parent().find('#numeric_status_chart').first()[0].getContext('2d');
					var chart = new Chart(ctx, {
					    type: 'bar',
					    data: {},
					    options: {
					        scales: {
					            y: {
					                beginAtZero: true
					            }
					        }
					    }
					});
					chart.data = branch.prepare_data(data);
					chart.update();
					branch.chart = chart;
				},
				prepare_data: function(data) {
					var branch = this;
					var keep_values = {};
					for(var x in branch.content_item.labels) {
						keep_values[x] = data[x];
					}
					var data_values = Object.values(keep_values);
					////console.log( Object.values(branch.set_colors));
					data = {
				        labels: Object.values(branch.content_item.labels),
				        datasets: [{
				            label: 'value in currency',
				            data: data_values,
				            borderWidth: 1,
				            borderColor: Object.values(branch.set_colors),/*[
				                'rgba(15, 250, 13)',
				            ],*/
				            backgroundColor: Object.values(branch.set_colors), /*[
				                'rgba(15, 250, 13)',
				            ]*/
				        },/*{
				            label: '# of Votes',
				            data: [14, 3, 2, 7],
				            borderWidth: 1,
				            borderColor: [
				                'rgba(15, 250, 13)',
				            ],
				            backgroundColor: [
				                'rgba(15, 250, 13)',
				            ]
				        }*/]
				    };
				    return data;
				},
				update_view: function(data) {
					var branch = this;
					for(var x in branch.content_item.labels) {
						if(typeof branch.$elements['$'+x] !== 'undefined') {
							if(typeof data[x] === 'undefined') {
								data[x] = 0;
							}
							if(typeof branch.content_item.negative_value !== 'undefined') {
								if(branch.content_item.negative_value.indexOf(x) !== -1) {
									data[x] = branch.root.numeval.negative_value(data[x]);
								}
							}
							if(branch.root.numeval.is_negative(data[x])) {
								branch.$elements['$'+x].removeClass('currency_negative').removeClass('currency_positive').addClass('currency_positive');
							} else {
								branch.$elements['$'+x].removeClass('currency_negative').removeClass('currency_positive').addClass('currency_negative');
							}
							var $item = branch.$elements['$'+x];
							$item.find('.numeric_status_value').html(data[x]);

							if($item.hasClass('currency_vat') && !branch.root.numeval.is_negative(data[x])) {
								branch.set_colors[x] = 'rgb(51, 204, 128)';
							} else if(is_negative) {
								branch.set_colors[x] = 'rgb(204, 51, 51)';
							} else {
								branch.set_colors[x] = 'rgb(51, 204, 204)';
							}
							branch.$elements['$'+x].css({
								'color': branch.set_colors[x]
							});
						}
					}
					branch.chart.data = branch.prepare_data(data);
					branch.chart.update();
				}
			}
		};

		constructor_numeric_status_object.prototype = item_object;
		var numeric_status_object = new constructor_numeric_status_object(content_item, false, branch.$numeric_status_container, page_data, page);


		//numeric_status_object.operation.
		branch.root.assign_root_object(numeric_status_object, true);

		//numeric_status_object.operation.content_item = numeric_status_object.content_item;
		//numeric_status_object.operation.$numeric_status_container = numeric_status_object.$numeric_status_container;

		branch.$numeric_status_container.parent().find('.table_settings').first().find('.filter').first().click(function() {
			numeric_status_object.operation.load();
		});

		/*if(typeof branch.root.elements.numericstatuss === 'undefined') {
			branch.root.elements.numericstatuss = Array();	
		}
		branch.root.elements.numericstatuss[content_item.id+"_numericstatus"] = numeric_status_object;*/

		numeric_status_object.operation.init();

		branch.root.elements.assign_element("_numericstatus", numeric_status_object, page.id, content_item.id);

		//branch.load();
		
	}
};

app.custom_elements.numeric_status = {
	init: function(content_item, $container, $page_data, interpretation, page) {
		var branch = this;
		branch.content_item = content_item;

		$container.append("<div class='numeric_status' id='"+content_item.id+"_numeric_status'></div>");
		branch.$numeric_status_container = $container.find('#'+content_item.id+'_numeric_status').first();
		/*var form_object;
		if(typeof content_item.target !== 'undefined') {
			form_object = branch.root.elements.find_element_object(content_item.target);
		}
		branch.form_object = form_object;
		
		$container.append("<div id='"+content_item.id+"_tree' class='tree'><div class='caption'>"+content_item.caption+"</div><div class='contents'></div></div>");
		var $tree = $container.find('#'+content_item.id+'_tree').first();
		branch.$tree_content = $tree.find('.contents').first();
		branch.load();
		
		*/

		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;

		var numeric_status_object = {
			id: content_item.id,
			printed: false,
			$element: branch.$numeric_status_container,
			operation: {
				load: function() {
					var self = this;
					branch.root.post(branch.root.actions, {
						'action': branch.content_item.id+'_numeric_status'
					}, function(data) {
						//branch.$tree_content.html("");
						//branch.print_tree_item(data, 20, branch.$tree_content);
						if(!self.printed) {
							branch.print_status(data);
							self.printed = true;
						} else {
							branch.update_view(data);
						}
						branch.interpretation.loaded_objects[branch.page.id].loaded();
					}, "json");
				}
			}
		};
		if(typeof branch.root.elements.numeric_statuss === 'undefined') {
			branch.root.elements.numeric_statuss = Array();	
		}
		branch.load();
		
		branch.root.elements.numeric_statuss[content_item.id+"_numeric_status"] = numeric_status_object;
	},
	load: function() {
		var branch = this;
		branch.root.post(branch.root.actions, {
			'action': branch.content_item.id+'_numeric_status'
		}, function(data) {
			branch.print_status(data);
			branch.interpretation.loaded_objects[branch.page.id].loaded();
		}, "json");
	},
	print_status: function(data) {
		var branch = this;
		for(var x in data) {
			var label = branch.content_item.labels[x];
			branch.$numeric_status_container.append("<div class='numeric_status_item' id='"+x+"_numeric_status_item'><div class='header'>"+label+"</div><div class='numeric_status_value'>"+data[x]+"</div></div>");
			branch['$'+x] = branch.$numeric_status_container.find('#'+x+'_numeric_status_item').first();
		}
	},
	update_view: function(data) {
		var branch = this;
		for(var x in data) {
			var $item = branch['$'+x];
			$item.find('.numeric_value_status').html(data[x]);
		}
	}
};

app.navigation = {
	recent_hash: null,
	hash_value: null,
	last_hash_value: null,
	previous_hash_value: null,
	state_set: false,
	reload_hash: function() {
		if(this.default_route_set) {
			window.location.hash = "";
		}
	},
	init: function() {
		/*$(window).on('unload', function() {
			//alert('reload');
		});*/
		var branch = this;
		if(typeof branch.root.use_links !== 'undefined') {
			/*addEventListener("popstate", function (e) {
				//document.getElementById('p').textContent--;
				//e.preventDefault();
				console.log('popstate');
			});*/
			$(window).bind("popstate", function (e) {
				var hash_value = window.location.href.split('?path=')[1];
				if(typeof hash_value !== 'undefined' && hash_value.length > 0) {
					branch.load_hash(decodeURIComponent(hash_value));
				} else {
					branch.poll_hash();
				}
			});
		}
	},
	last_valid_navigation: null,
	default_route_set: false,
	refresh: false,
	plasticity_delay: false,
	hash_history: [],
	compare_hash: function(hash, recent_hash) {
		if(hash != null && hash.substr(0, 1) == '#') {
			hash = hash.substr(1);
		}
		if(recent_hash != null && recent_hash.substr(0, 1) == '#') {
			recent_hash = recent_hash.substr(1);
		}
		if(hash == recent_hash) {
			return true;
		}
		return false;
	},
	bread_crumb: {
		page_history: [],
		last_page: null
	},
	register_anchors: function() {
		var branch = this;
		if(typeof branch.root.use_links === 'undefined') {
			return;
		}
		$('a:not(.registered)').each(function() {
			if(typeof $(this).attr('href') !== 'undefined' && $(this).attr('href').indexOf('#') == 0) {
				$(this).addClass('registered');
				var href = $(this).attr('href');
				var hash = href;
				$(this).attr('hash_link', hash);
				var href = "?path="+encodeURIComponent(hash);
				$(this).attr('href', href);
				$(this).click(function(e) {
					if(!e.metaKey) {
						e.preventDefault();
						branch.load_hash($(this).attr('hash_link'));
						window.history.pushState({}, window.title, $(this).attr('href'));
					}
				});
			}
		});
	},
	fix_hash: function(hash) {
		var split = hash.split('/');
		if(split[split.length-1].indexOf('#') == -1) {
			return hash+"#";
		}
		return hash;
	},
	back_hash: function() {
		var branch = this;
		var this_hash = branch.hash_history.pop();
		var next_hash = branch.hash_history.pop();
		//console.log('this_hash: '+this_hash);
		//console.log('next_hash: '+next_hash);
		if(next_hash != null) {
			this.set_hash(next_hash, false);
		} else if(this_hash != null) {
			this.set_hash(this_hash, false);
		}
		//console.log('set_hash');
	},
	load_hash: function(hash_input_value) {
		////console.log('poll hash');
		var branch = this;
		var self = this;
		var set_hash_value;
		/*if((typeof branch.plasticity_delay !== 'undefined' && branch.plasticity_delay) || typeof branch.root.no_navigation !== 'undefined') {
			return;
		}*/
		this.hash_polling_in_progress = true;
		////console.log(hash_input_value);
		hash_input_value = this.fix_hash(hash_input_value);
		if(!this.compare_hash(hash_input_value, this.recent_hash)) {
			this.previous_hash_value = this.recent_hash;
			this.hash_history.push(hash_input_value);
			////alert(hash_input_value);
			////alert(this.recent_hash);
			if(this.recent_hash == null) {
				this.refresh = true;	
			} else {
				this.refresh = false;	
			}
			/*//alert('not same');
			//alert(hash_input_value);
			//alert(this.recent_hash);*/
			branch.default_route_set = false;
			if(hash_input_value != "" && typeof branch.root.definition !== 'undefined' && typeof branch.root.definition.routes !== 'undefined') {
				for(var x in branch.root.definition.routes.default_route) {
					if(hash_input_value == "#"+branch.root.definition.routes.default_route[x]) {
						branch.default_route_set = true;	
					}
				}
			}
			////console.log(branch.root.definition.routes.default_route);
			this.recent_hash = hash_input_value;
			if(this.recent_hash.substr(0, 1) == '#') {
				this.hash_value = this.recent_hash.substr(1);
			}/* else {
				this.hash_value = this.recent_hash;
			}*/
			/*if(branch.root.definition.developer_mode) {
				var $developer_overlay = $('.developer_overlay');
				if(this.refresh) {
					branch.root.interpretation.sub_render_page(branch.root.developer_definition.pages[0], null, $developer_overlay.find('.add_form_element').first());
				} else {
					$developer_overlay.fadeOut('fast');
				}
			}*/
			if(!this.state_set) {
				branch.root.post(branch.root.actions, {
					'action': 'get_state'	
				}, function(state_data) {
					branch.state_set = true;
					for(var x in state_data) {
						branch.root[x] = state_data[x];
					}
					if(hash_input_value == "") {
						if(typeof branch.root.definition.routes !== 'undefined') {
							if(typeof branch.root.definition.routes.default_route !== 'undefined') {
								if(branch.root.user_id == "-1" || typeof branch.root.user_id === 'undefined') {
									set_hash_value = "#"+branch.root.definition.routes.default_route.everyone;	
								} else {
									if(typeof branch.root.user_group !== 'undefined' && typeof branch.root.definition.routes.default_route[branch.root.user_group] !== 'undefined') {
										set_hash_value = "#"+branch.root.definition.routes.default_route[branch.root.user_group];
									} else {
										set_hash_value = "#"+branch.root.definition.routes.default_route.user;
									}
								}
							}
						} else {
							set_hash_value = "#index";	
						}
						//alert(set_hash_value);
						if(typeof set_hash_value !== 'undefined') {
							branch.default_route_set = true;
							branch.recent_hash = set_hash_value;
							branch.hash_value = set_hash_value.substr(1);
							history.replaceState(undefined, undefined, set_hash_value)	
						}
					}
					//alert('open_tab_a');
					branch.open_tab();
					branch.state_set = true;
					console.log('state_data');
					console.log(state_data);
					if(typeof branch.root.state_callback !== 'undefined') {
						console.log(state_data);
						branch.root.state_callback(state_data);
					}
				}, "json", function() {
					branch.set_last_valid_navigation();
				});
			} else {
				//alert('open_tab');
				branch.open_tab();	
			}
		}
		branch.register_anchors();
		/*setTimeout(function() {
			self.poll_hash();
		}, 400);*/
	},
	hash_polling_in_progress: false,
	poll_hash_wrap: function() {
		//console.log('init poll hash');
		if(!this.hash_polling_in_progress) {
			this.poll_hash();
		}
	},
	poll_hash: function() {
		//console.log('poll_hash');
		var branch = this;
		var self = this;
		var set_hash_value;
		this.hash_polling_in_progress = true;
		/*if((typeof branch.plasticity_delay !== 'undefined' && branch.plasticity_delay) || typeof branch.root.no_navigation !== 'undefined') {
			return;
		}*/
		if(typeof branch.root.use_links !== 'undefined') {
			if(typeof json_get !== 'undefined' && json_get.length > 0) {
				var parsed = JSON.parse(json_get);
				if(typeof parsed.path !== 'undefined') {
					branch.load_hash(parsed.path);
					//return;
				} else {
					if(typeof branch.root.definition.routes.default_route.everyone !== 'undefined') {
						branch.load_hash("#"+branch.root.definition.routes.default_route.everyone);
					} else if(typeof branch.root.definition.routes.default_route.user !== 'undefined' && branch.root.user_id != -1) {
						branch.load_hash("#"+branch.root.definition.routes.default_route.user);
					}
				}
			}

			return;
		}	
		////console.log(window.location.hash);
		window.location.hash = this.fix_hash(window.location.hash);
		if(!this.compare_hash(window.location.hash, this.recent_hash)) {
			this.previous_hash_value = this.recent_hash;
			this.hash_history.push(window.location.hash);
			////alert(window.location.hash);
			////alert(this.recent_hash);
			if(this.recent_hash == null) {
				this.refresh = true;	
			} else {
				this.refresh = false;	
			}
			/*//alert('not same');
			//alert(window.location.hash);
			//alert(this.recent_hash);*/
			branch.default_route_set = false;
			if(window.location.hash != "" && typeof branch.root.definition !== 'undefined' && typeof branch.root.definition.routes !== 'undefined') {
				for(var x in branch.root.definition.routes.default_route) {
					if(window.location.hash == "#"+branch.root.definition.routes.default_route[x]) {
						branch.default_route_set = true;	
					}
				}
			}
			////console.log(branch.root.definition.routes.default_route);
			this.recent_hash = window.location.hash;
			if(this.recent_hash.substr(0, 1) == '#') {
				this.hash_value = this.recent_hash.substr(1);
			}
			/*if(branch.root.definition.developer_mode) {
				var $developer_overlay = $('.developer_overlay');
				if(this.refresh) {
					branch.root.interpretation.sub_render_page(branch.root.developer_definition.pages[0], null, $developer_overlay.find('.add_form_element').first());
				} else {
					$developer_overlay.fadeOut('fast');
				}
			}*/
			if(!this.state_set) {
				branch.root.post(branch.root.actions, {
					'action': 'get_state'	
				}, function(state_data) {
					//console.log(state_data);
					branch.state_set = true;
					for(var x in state_data) {
						branch.root[x] = state_data[x];
					}
					if(window.location.hash == "") {
						if(typeof branch.root.definition.routes !== 'undefined') {
							if(typeof branch.root.definition.routes.default_route !== 'undefined') {
								if(branch.root.user_id == "-1" || typeof branch.root.user_id === 'undefined') {
									set_hash_value = "#"+branch.root.definition.routes.default_route.everyone;
								} else {
									if(typeof branch.root.user_group !== 'undefined' && typeof branch.root.definition.routes.default_route[branch.root.user_group] !== 'undefined') {
										set_hash_value = "#"+branch.root.definition.routes.default_route[branch.root.user_group];
									} else {
										set_hash_value = "#"+branch.root.definition.routes.default_route.user;
									}
								}
							}
						} else {
							set_hash_value = "#index";	
						}
						//alert(set_hash_value);
						if(typeof set_hash_value !== 'undefined') {
							branch.default_route_set = true;
							branch.recent_hash = set_hash_value;
							branch.hash_value = set_hash_value.substr(1);
							history.replaceState(undefined, undefined, set_hash_value)	
						}
					}
					//alert('open_tab_a');
					console.log('open tab');
					branch.open_tab();
					if(typeof branch.root.state_callback !== 'undefined') {
						console.log(state_data);
						branch.root.state_callback(state_data);
					}
					branch.state_set = true;
				}, "json", function() {
					branch.set_last_valid_navigation();
				});
			} else {
				//alert('open_tab');
				branch.open_tab();	
			}
		}
		branch.register_anchors();
		if(typeof branch.root.use_links === 'undefined') {
			setTimeout(function() {
				self.poll_hash();
			}, 400);
		}	
	},
	parse_get_data: function(get_string) {
		var split = get_string.split("&");
		var id = split[0];
		delete split[0];
		var get_data = {};
		for(var x in split) {
			var sub_split = split[x].split("=");
			if(sub_split.length >= 2) {
				get_data[sub_split[0]] = sub_split[1].split('%20').join(' ');
			}
		}
		if(id.trim().length > 0) {
			get_data.id = id;
		}
		return get_data;
	},
	current_breadcrumb: null,
	generate_breadcrumb: function() {
		var current_hash = this.hash_value;
		if(current_hash.indexOf('#') == 0) {
			current_hash = current_hash.substr(1);
		}
		if(current_hash.indexOf('!') != -1) {
			var split = current_hash.split('!');

			return split[0];
		}
		return current_hash;
	},
	get_link_to_last_breadcrumb: function() {
		return "";
		//return this.current_breadcrumb;
	},
	current_page: null,
	generate_breadcrumb_element: function() {
		var branch = this;
		var breadcrumb_trail = [];
		if(this.current_page != null) {
			if(typeof this.current_page.breadcrumb !== 'undefined') {
				var parent = this.current_page.breadcrumb.parent;
				if(breadcrumb_trail.indexOf(parent) == -1) {
					breadcrumb_trail.push(parent);
					var parent_object = branch.root.interpretation.find_page(parent);
					var continue_loop = true;
					while(continue_loop) {
						if(typeof parent_object !== 'undefined' && typeof parent_object.breadcrumb !== 'undefined') {
							parent = parent_object.breadcrumb.parent;
							if(breadcrumb_trail.indexOf(parent) == -1) {
								breadcrumb_trail.push(parent);
								parent_object = branch.root.interpretation.find_page(parent);
							} else {
								continue_loop = false;
							}
						} else {
							continue_loop = false;
						}
					}
				}
			}
		}
		return breadcrumb_trail;	
	},
	post_data_index: {},
	get_last_post_data: function(page_id) {
		//console.log(this.post_data_index);
		if(typeof this.post_data_index[page_id] === 'undefined') {
			return null;
		}
		//console.log({...this.post_data_index[page_id]});
		return {...this.post_data_index[page_id]};
	},
	access_granted: true,
	$parse_render_frame: null,
	accumulated_get_data: {},
	confirm_hash_data: function() {
		var branch = this;
		var hash = this.hash_value.split('/');
		var pages = [];
		var get_data = [];
		for(var x in hash) {
			var split = hash[x].split('#');
			pages.push(split[0]);
			get_data.push(split[1]);
		}
		if(typeof branch.get_data_by_page !== 'undefined') {
			var keys = Object.keys(branch.get_data_by_page);
			for(var i in keys) {
				if(pages.indexOf(keys[i]) == -1) {
					delete branch.get_data_by_page[keys[i]];
				}
			}
		}
	},
	parse_render: function(split, frame, $frame, id, get_data, frame_depth_offset) {
		this.access_granted = true;
		var branch = this;
		branch.$parse_render_frame = $frame;
		var split_index = 0;
		////console.log(split);
		var continue_render = function(x) {
			console.log(x);
			var last_level_rendered = -1;
			//for(var x in split) {
				if(split[x].indexOf('#') != -1) {
					var id_split = split[x].split('#');
					split[x] = id_split[0];
					id = id_split[1];
					/*if(id.indexOf('!') != -1) {
						var breadcrumb_split = id.split('!');
						id = breadcrumb_split[0];
						var breadcrumb = breadcrumb_split[1];
						branch.current_breadcrumb = breadcrumb;
						//console.log(breadcrumb);
						//console.log(id);
					}*/
					get_data = branch.parse_get_data(id);
					branch.get_data_by_page[split[x]] = get_data;
					//console.log(branch.get_data_by_page);
					/*branch.accumulated_get_data = {
						...branch.accumulated_get_data,
						...get_data
					};*/
					//for(var i in branch.get_data_by_page) {
					branch.confirm_hash_data();
					var keys = Object.keys(branch.get_data_by_page);
					for(var i in keys) {
						if(keys[i] != 'obj_id' && keys[i] != 'parent' && keys[i] != 'root') {
							branch.accumulated_get_data = {
								...branch.accumulated_get_data,
								...branch.get_data_by_page[keys[i]]
							};
						}
					}
					//console.log('accumulated get data');
					//console.log(branch.accumulated_get_data);
				}
				console.log(split[x]);
				(function(frame, $frame, page, get_data) {
					var callback = function(split_length) {
							/*var parent_level = x-1;
							if(parent_level >= 0) {
								$parent_frame = branch.frames.find_frame(parent_level);
								
								if($parent_frame.find('.menu_top').length > 0) {
									var $menu_button = $parent_frame.find('.menu_button.'+page+'_button');
									$menu_button.parent().children().each(function() {
										$(this).css('color', 'inherit');
									});
									$menu_button.first().css('color', '#fff');
								}
							}*/
						last_level_rendered = x;
						frame = null;
						if(split_length-1 != x) {
							$frame = branch.frames.find_frame(parseInt(x)+1+parseInt(frame_depth_offset));
							branch.$parse_render_frame = $frame;
						}
						var send_x = x+1;
						branch.access_granted = true;
						if(send_x < split_length) {
							continue_render(send_x);
						}
						console.log(page);
						if(x == split_length-1 || !branch.access_granted) {

							/*var keys = Object.keys(branch.get_data_by_page);
							for(var i in keys) {
								if(keys[i] >= split_length) {
									//console.log('delete key: '+keys[i]);
									delete branch.get_data_by_page[keys[i]];
								}
							}*/
							/*branch.accumulated_get_data = {};
							var keys = Object.keys(branch.get_data_by_page);
							for(var i in keys) {
								if(keys[i] != 'obj_id' && keys[i] != 'parent' && keys[i] != 'root') {
									branch.accumulated_get_data = {
										...branch.accumulated_get_data,
										...branch.get_data_by_page[keys[i]]
									};
								}
							}*/

							var $bottom_frame = branch.frames.get_bottom_frame();
							var hash_default_split = branch.hash_value.split('/');
							/*//console.log(hash_default_split.length, $bottom_frame.attr('level'));
							//console.log(branch.previous_hash_value);
							//console.log(branch.hash_value);*/
							if(typeof $bottom_frame.attr('default_page') !== 'undefined' && (branch.refresh || branch.previous_hash_value != branch.hash_value) && hash_default_split.length == $bottom_frame.attr('level')) {
								var href = branch.hash_value+"/"+$bottom_frame.attr('default_page')+'#';
								branch.set_hash(href, false);
							}
							console.log('acces: '+branch.access_granted);
							if(branch.access_granted) {
								branch.root.user_menu.remove_login_overlay();
							} else {
								branch.root.user_menu.display_login_overlay();	
							}
						}
					}
					var page_object = null;
					if(page.length > 0) {
						page_object = {...branch.root.interpretation.find_page(page)};
						branch.current_page = page_object;

						if(typeof get_data !== 'undefined' && Object.keys(get_data).length > 0) {
							branch.post_data_index[page] = {...get_data};
						}
					} else {
						return;	
					}
					if(typeof $frame !== 'undefined' && $frame.hasClass('merge_get_data')) {
						get_data = branch.accumulated_get_data;
						////console.log('get_data');
						////console.log(get_data);
					}
					var page_render = function() {
						if((typeof id !== 'undefined' && typeof page_object.no_get_data === 'undefined') || typeof page_object.no_get_id !== 'undefined') { // 
							var post_data = {
								'action': 'get_'+page,
								//'id': id	
							};
							if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true && typeof page_object.get_page !== 'undefined') {
								post_data.action = page_object.get_page;
							}
							if(typeof get_data !== 'undefined') {
								if(typeof page_object.get_data_load_mask !== 'undefined') {
									for(var x in page_object.get_data_load_mask) {
										post_data[page_object.get_data_load_mask[x]] = get_data[x];
									}
								} else {
									for(var x in get_data) {
										post_data[x] = get_data[x];
									}
								}
							}
							branch.root.post(branch.root.actions, post_data, function(data) {
								if(data == null || data == "") {
									data = {};
								}
								if(typeof get_data !== 'undefined') {
									data.id = get_data.id;
									for(var x in get_data) {
										if(typeof data[x] === 'undefined') {
											data[x] = get_data[x];
										}
									}
								}
								if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
									for(var x in data) {
										var x_altered = x.split('.').join('_');
										data[x_altered+'__'+page] = data[x];
									}
								}
								//console.log('set get_data_data');
								//console.log(data);
								//alert('render_page_a');
								branch.root.interpretation.render_page(page_object, frame, $frame, function() {
									callback(split.length);

									branch.register_anchors();
								}, data);
								return false;
							}, "json");
						} else {
							//alert('render_page_b');
							branch.root.interpretation.render_page(page_object, frame, $frame, function() {
								callback(split.length);
								branch.register_anchors();
							}, get_data);
						}	
					}
					//alert(page_object.user_access);
					//console.log(page_object.user_access);
					if(typeof page_object.user_access !== 'undefined' && page_object.user_access !== 'user' && page_object.user_access !== 'everyone') {
						if(branch.root.user_id == -1) {
							branch.access_granted = false;					
							branch.root.user_menu.login_callbacks.push(function() {
								page_render();
							});
						} else {
							var user_group_post_data = {
								action: '_user_group_member',
								group_name: page_object.user_access
							};
							if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
								user_group_post_data.action = 'user_group_member_by_name';
								user_group_post_data.application_id = branch.root.definition.application_id;
							}
							$.post(branch.root.actions, user_group_post_data, function(data) {
								console.log('useraccess');
								console.log(data);
								if(data == 1) {
									page_render();	
								} else {
									/*branch.root.user_menu.login_callbacks.push(function() {
										page_render();
									});*/
									//branch.access_granted = false;
									branch.root.interpretation.view.pop_up.display("You do not have access to this page.", "fadeout");
								}
								//return false;
							});
						}
					} else {
						//alert(branch.root.user_id);
						if(typeof page_object.user_access !== 'undefined' && page_object.user_access == 'user') {
							if(branch.root.user_id == -1) {
								branch.access_granted = false;
								branch.root.user_menu.login_callbacks.push(function() {
									page_render();
								});
								branch.root.user_menu.display_login_overlay();
							} else {						
								page_render();	
							}
						} else {
							page_render();	
						}
					};
				}(frame, branch.$parse_render_frame, split[x], get_data));
				
			//}/* else {*/
			//if(x == split.length-1 || !branch.access_granted) {
				
				/*if(branch.root.interpretation.bottom_frame != branch.root.interpretation.current_render_frame && branch.root.interpretation.bottom_frame !== null && typeof branch.root.interpretation.bottom_frame.__default_page !== 'undefined') {
					if(last_level_rendered != branch.root.interpretation.bottom_frame.level) { // && !branch.refresh
						var href = branch.hash_value+"/"+branch.root.interpretation.bottom_frame.__default_page;
						branch.set_hash(href, false);
					}
					//alert(branch.root.interpretation.bottom_frame.__default_page);
				}*/
				/*var $bottom_frame = branch.frames.get_bottom_frame();
				//console.log(split);
				//console.log(x);
				/*
				if(typeof $bottom_frame.attr('default_page') !== 'undefined') {
					var href = branch.hash_value+"/"+$bottom_frame.attr('default_page');
					alert(href);
					branch.set_hash(href, false);
				}*/
				/*if(branch.access_granted) {
					branch.root.user_menu.remove_login_overlay();
				} else {
					branch.root.user_menu.display_login_overlay();	
				}
			}*/
			//}
		};
		
		/*if(!branch.state_set) {
			$.post(branch.root.actions, {
				'action': 'get_state'	
			}, function(state_data) {
				branch.state_set = true;
				////alert(state_data);
				for(var x in state_data) {
					////alert(x);
					////alert(state_data[x]);
					branch.root[x] = state_data[x];
				}
				continue_render(split_index);
			}, "json");
			////alert('test');
		} else {
			continue_render(split_index);	
		}*/
		continue_render(split_index);	
		
		/*if(!this.search_initialized) {
			branch.root.search.init();	
			branch.search_initialized = true;
		}*/
	},
	search_initialized: false,
	get_data_by_page: {},
	open_tab: function() {
		var branch = this;
		var hash_value = this.hash_value;
		console.log('in open tab');
		if(this.hash_value !== null) {
			/*if(hash_value.indexOf('!') != -1) {
				var breadcrumb_split = hash_value.split('!');
				hash_value = breadcrumb_split[0];
				var breadcrumb = breadcrumb_split[1];
				branch.current_breadcrumb = breadcrumb;
				//console.log(breadcrumb);
				//console.log(hash_value);
			}*/
			var split = hash_value.split("/");
		}
		this.accumulated_get_data = {};
		if(this.last_hash_value === null) {
			/*if(this.hash_value.indexOf('/') === -1) {
				split = Array(this.hash_value);	
			}*/
			console.log('is null');
			console.log(split);
			var frame = 'body';
			var $frame;
			var id;
			var get_data;
			this.parse_render(split, frame, $frame, id, get_data, 0);
		} else {
			var split_last_hash = this.last_hash_value.split("/");
			var altered_level = -1;
			var page;
			for(var x in split) {
				if(split[x] != split_last_hash[x] && altered_level == -1) {
					altered_level = x;	
					page = split[x];
				}
			}
			console.log(split);
			//var id;
			
			var altered_string = Array();
			for(var x in split) {
				if(x >= altered_level) {
					////alert(split[x]);
					altered_string.push(split[x]);	
				}
			}
			if(altered_level != -1) {
				$frame = this.frames.find_frame(altered_level);
				this.parse_render(altered_string, null, $frame, id, get_data, altered_level);
			}
			
			/*if(page.indexOf('#') != -1) {
				var id_split = page.split('#');
				page = id_split[0];
				id = id_split[1];
				get_data = branch.parse_get_data(id);
			}
			$frame = this.frames.find_frame(altered_level);
			var parent_level = altered_level-1;
			if(parent_level >= 0) {
				$parent_frame = this.frames.find_frame(parent_level);
				if($parent_frame.find('.menu_top').length > 0) {
					if($parent_frame.find('.menu_button.'+page+'_button').length > 0) {
						$parent_frame.find('.menu_button.'+page+'_button').parent().children().each(function() {
							$(this).css('color', 'inherit');
						});
						$parent_frame.find('.menu_button.'+page+'_button').first().css('color', '#fff');
					}
				}
			}
			var page_object = branch.root.interpretation.find_page(page);
			var page_render = function() {
				if(typeof id !== 'undefined' && typeof page_object.no_get_data === 'undefined') {
					var post_data = {
						'action': 'get_'+page,
						groupd_name: page_object.user_access
						//'id': id	
					};
					for(var x in get_data) {
						post_data[x] = get_data[x];
					}	
					$.post(branch.root.actions, post_data, function(data) {
						data.id = id;
						branch.root.interpretation.render_page(page_object, null, $frame, function() {}, data);	
					}, "json");
				} else {
					branch.root.interpretation.render_page(page_object, null, $frame, function() {}, get_data);	
				}
			}
			
			if(typeof page_object.user_access !== 'undefined') {
				$.post(branch.root.actions, {
					action: 'user_group_member'	
				}, function(data) {
					if(data == 1) {
						page_render();	
					} else {
						//alert('no access');	
					}
				});
			} else {
				page_render();	
			}*/
		}
		this.last_valid_navigation = this.hash_value;
		this.last_hash_value = this.hash_value;
	},
	set_last_valid_navigation: function() {
		//this.set_hash(this.last_valid_navigation);
		if(this.last_valid_navigation != null) {
			this.recent_hash = this.last_valid_navigation;
			this.hash_value = this.last_valid_navigation;//.substr(1);
			window.location.hash = this.last_valid_navigation;
		}
	},
	set_hash: function(value, set_recent) {
		window.location.hash = value;
		if(typeof set_recent === 'undefined') {
			this.recent_hash = value.substr(1);
			this.hash_value = this.recent_hash;
		}
	},
	generate_href: function(page, level, id, get_data, frame_id) {
		////console.log('-----get_data-----');
		////console.log(get_data);
		if(page.indexOf('/') != -1) {
			return page;
		}
		if(page == 'self') {
			page = this.root.interpretation.current_page;
		}
		if(frame_id == 'self') {
			frame_id = page.frame_id;
		}
		var page_object = this.root.interpretation.find_page(page);
		if(typeof page_object.page_href !== 'undefined') {

			return page_object.page_href;
		}
		if(typeof frame_id !== 'undefined') {
			level = this.frames.find_frame_depth(frame_id);	
		}
		var hash = this.hash_value;
		if(hash.indexOf('!') != -1) {
			hash = hash.split('!')[0];
		}
		var split = hash.split("/");
		var result = "";
		for(var x in split) {
			if(x < level) {
				if(x > 0) {
					result += "/";	
				}
				result += split[x];	
			} else if(x == level) {
				if(x > 0) {
					result += "/";	
				}
				result += page;	
			}
		}
		if(split.length-1 < level) {
			result += "/"+page;	
		}
		var hash_inserted = false;
		var result = '#'+result;
		if(typeof id !== 'undefined' && id != null) {
			result += "#"+id;
			hash_inserted = true;	
		}
		if(typeof get_data !== 'undefined' && get_data !== null) {
			if(typeof get_data.id !== 'undefined') {
				result += "#"+get_data.id;	
				delete get_data.id;
				hash_inserted = true;
			}
			//if(typeof id === 'undefined' && get_data.id === 'undefined') {
			if(!hash_inserted) {
				result += '#';	
			} else if(!id) {
				result += "&";	
			}
			var counter = 0;
			for(var x in get_data) {
				//if(counter > 0) {
					result += "&";	
				//}
				result += x+"="+get_data[x];
				counter++;	
			}
		}
		//if(this.current_breadcrumb != null) {
			//result += "!"+this.generate_breadcrumb();
		//}
		return result;
	},
	navigate_back: function() {
		if(typeof this.previous_hash_value !== 'undefined' && this.previous_hash_value != "" && this.previous_hash_value != null) {
			this.set_hash(this.previous_hash_value, false);
		} else {
			history.back();
		}
	},
	navigate_to: function(page_id, send_data, return_value) {
		if(typeof send_data === 'undefined') {
			send_data = {
				
			};
		}
		//console.log('-----get_data-----');
		//console.log(send_data);
		
		var last_hash_split = this.hash_value.split("/");
		last_hash_split[last_hash_split.length-1] = page_id;
		//if(send_data.length > 0) {
			last_hash_split[last_hash_split.length-1] += '#';
		//}
		
		
		var counter = 0;
		if(typeof send_data.id !== 'undefined') {
			last_hash_split[last_hash_split.length-1] += send_data.id;	
			delete send_data.id;
			counter++;
		}
		for(var x in send_data) {
			last_hash_split[last_hash_split.length-1] += "&";	
			last_hash_split[last_hash_split.length-1] += x+"="+send_data[x];
			counter++;	
		}
		
		var new_hash_value = last_hash_split.join("/");
		//if(this.current_breadcrumb != null) {
			//new_hash_value += "!"+this.generate_breadcrumb();
		//}
		if(typeof return_value === 'undefined') {
			this.set_hash(new_hash_value, false);
		} else {
			return '#'+new_hash_value;	
		}
	},
	frames: {
		find_frame: function(depth) {
			return this.find_frame_sub(depth, $('.body_wrap'));
		},
		find_frame_sub: function(depth, $parent) {
			var branch = this;
			$parent = $parent.find('.frame').first();
			////alert(depth+" - "+$parent.attr('id'));
			if($parent.length == 0) {
				//var set_hash_value = "#";	
				l//ocation.hash = set_hash_value;
				//window.location.reload();
				window.location.hash = '#';
				/*setTimeout(function() {
					
				});*/
				return;
				
				////alert('no frame');	
			}
			if(depth == 0) {
				return $parent;	
			}
			return this.find_frame_sub(depth-1, $parent);	
		},
		find_frame_by_element: function($frame) {

		},
		get_bottom_frame: function($frame) {
			if(typeof $frame === 'undefined') {
				$frame = $('.body_wrap');
			}
			var $first_child_frame = $frame.find('.frame').first();
			if($first_child_frame.length == 0) {
				return $frame;
			}
			return this.get_bottom_frame($first_child_frame);
		},
		find_frame_depth: function(target_frame) {
			var branch = this;
			//this.root.traverse(this.root.elements.frames, 0);
			////alert(target_frame);
			var target_frame_object = this.root.eval_object_path(this.root.find("elements.frames", target_frame), "this");
			////alert(target_frame_object.id);
			////alert(target_frame_object.sub_features);
			var target_frame_depth = target_frame_object.level;
			////alert(target_frame_depth);
			//var target_frame_depth = branch.root.depth(target_frame_object, branch.root.elements.frames, 0);
			return target_frame_depth;
		}
	}
};

app.interpretation = {
	init: function(global_objects_init) {
		var branch = this;
		//this.render_page(this.root.definition.pages[0], "body");
		//this.display_page("index");
		//this.traverse(this.root.definition);
		branch.$body_container = $('.body_container').first();
		if((typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) || typeof global_objects_init !== 'undefined') {
			var global_date_content_item = {
				id: 'global_date_picker',
				no_controls: false
			};
			var $container = $('.calendar_popover').first();
			var page_data = {};
			var interpretation_branch = branch;
			var page = {};
			var calendar_object = null;
			if(typeof $container !== 'undefined') {
				calendar_object = branch.root.custom_elements.datepicker.init(global_date_content_item, $container, page_data, interpretation_branch, page);
			}
			branch.global_date_picker = calendar_object;
			branch.$calendar_popover = $container;

			branch.root.drag.init(branch.$body_container, function() {
				branch.root.elements.reload_elements_on_page();
			});
		}
		//calendar_object.load();

		//$container.show();
	},
	display_global_datepicker: function($callback_element) {
		var branch = this;

		branch.$body_container.addClass('blur');
		branch.$calendar_popover.css({
			'display': 'block',
			'opacity': 0
		}).animate({
			'opacity': 1
		}, 1250, 'ease_in_out_x', function() {

		});
		branch.global_date_picker.set_select_callback(function() {
			var value = branch.global_date_picker.get_value();
			$callback_element.val(value);
			branch.$body_container.removeClass('blur');
			branch.$calendar_popover.animate({
				'opacity': 0
			}, 1250, 'ease_out_x_2', function() {
				$(this).css({
					'display': 'none',
					'opacity': 0
				});
			});
		}, true);
	},
	global_date_picker_assigned: false,
	assign_global_datepicker: function($container) {
		var branch = this;
		if(!this.global_date_picker_assigned) {
			$container.find('.datepicker').each(function() {
				var $this = $(this);
				if(typeof $this.attr('datepicker_parsed') === 'undefined') {
					$this.wrap("<div class='datepicker_wrap'></div>");
					var $datepicker_wrap = $this.parent();
					$datepicker_wrap.append("<button class='datepicker_button'><i class='icofont-ui-calendar'></i></button>");
					$this.attr('datepicker_parsed', true);
					$datepicker_wrap.find('.datepicker_button').click(function() {
						branch.display_global_datepicker($this);
					});
				}
			});
			this.global_date_picker_assigned = true;
		}
	},
	traverse: function(definition_element) {
		
	},
	on_load: function(content_item) {
		var branch = this;
		if(typeof content_item.on_load === 'undefined') {
			return;
		}
		for(var x in content_item.on_load) {
			var callback_item_reference = content_item.on_load[x];
			var callback_object = branch.root.elements.find_element_object(callback_item_reference);
			var send_data = {
				//id: data.id	
			};
			if(typeof content_item.on_load_load_mask !== 'undefined') {
				for(var x in content_item.on_load_load_mask) {
					if(x.indexOf("'") !== -1) {
						x = x.split("'").join('');
						send_data[content_item.on_load_load_mask[x]] = x;	
					} else {
						send_data[content_item.on_load_load_mask[x]] = data[x];
					}
				}
			}
			callback_object.operation.load(send_data, null, true);
		}
	},
	get_title: function() {
		return document.title;
	},
	call_on_submit: function(on_submit, send_data) {
		var branch = this;
		for(var x in on_submit) {
			var callback_item = on_submit[x];
			var split = callback_item.split("_");
			var type = split[split.length-1]+"s";
			var statement = "var element = branch.root.elements."+type+"['"+callback_item+"']";
			eval(statement);
			switch(type) {
				default:
					//alert('on submit');
					element.operation.load(send_data);	
					break;
			}
		}	
	},
	illegal_characters: Array(
		"'",
		'"',
	),
	loaded_objects: Array(),
	loaded_object: {
		new: function() {
			var self = this;
			this.callback = this.parent.callback;
			this.$container = this.parent.$container;
			this.animation = this.parent.animation;
			this.current_page = this.parent.current_page;
			
			//this.animation = this.current_page.animation;
			var self = this;
			function loaded_object() {
				this.random_id = Math.random();
				this.callback = self.parent.callback;
				this.$container = self.parent.$container;
				this.animation = self.parent.animation;
				this.current_page = self.parent.current_page;
				this.loaded_callbacks = [];
				//self.root.functions.copy_object(this, self);
			}
			loaded_object.prototype = this;
			if(typeof self.parent.loaded_objects[this.parent.current_page.id] !== 'undefined') {
				delete self.parent.loaded_objects[this.parent.current_page.id];
			}
			self.parent.loaded_objects[this.parent.current_page.id] = new loaded_object();
			//return new loaded_object();
		},
		current_loaded_callback: 0,
		loaded_callbacks: Array(),
		render_completed_count: 0,
		dependencies_set: 0,
		loaded_count: 0,
		loading_completed: false,
		loaded: function() {
			if(!this.loading_completed) {
				this.loaded_count++;
			}
			if(this.dependencies_set == this.render_completed_count) {
				this.do_load();
			}/* else if(this.loading_completed) {
			}*/
		},
		dependency_set: function() {
			this.dependencies_set++;
			if(this.dependencies_set == this.render_completed_count) {
				this.do_load();
			}
		},
		set_completed: function() {
			this.loaded_count = this.render_completed_count;
		},
		call_next_callback: function() {
			this.current_loaded_callback++;
			////console.log('call: '+this.current_loaded_callback);
			if(this.current_loaded_callback < this.loaded_callbacks.length) {
				this.loaded_callbacks[this.current_loaded_callback](this);
			} else {
				//this.root.interpretation.global_loaded_callbacks.call();
				/*this.loaded_callbacks.push(function(self) {*/
					/*$('select').each(function() {
						//////alert('trigger');
						$(this).trigger('change');
					});*/
					/*self.call_next_callback();
				});*/
			}
		},
		pre_loaded_callbacks: Array(),
		global_loaded_callback_timeout: null,
		do_load: function() {
			var branch = this;
			if(this.loaded_count >= this.render_completed_count) {
				clearTimeout(branch.global_loaded_callback_timeout);
				branch.global_loaded_callback_timeout = setTimeout(function() {
					branch.root.interpretation.global_loaded_callbacks.call();
				}, 1750);
			}
			if(this.loading_completed) {
				//this.root.interpretation.global_loaded_callbacks.call();
				return false;	
			}
			var pre_loaded_callbacks = this.pre_loaded_callbacks;
			this.pre_loaded_callbacks = Array();
			for(var x in pre_loaded_callbacks) {
				pre_loaded_callbacks[x]();
			}
			if(this.loaded_count == this.render_completed_count) {
				/*if(branch.$container.find('.menu_top_container').children().length == 0) {
					branch.$container.find('.menu_top_container').remove();	
				}*/

				var clean_pages = function() {
					if(branch.animation != 'overlay') {
						branch.$container.parent().children().each(function() {
							if($(this).attr('id') == branch.current_page.id) {
								
							} else {
								$(this).remove();	
							}
						});
					} else if(branch.animation == 'overlay') {
						branch.$container.parent().children().each(function() {
							if($(this).attr('id') == branch.current_page.id) {
								
							} else {
								$(this).addClass('blur');
							}
						});	
					}
				};
				if(typeof branch.animation === 'undefined') {
					branch.animation = false;	
				}
				
				if(branch.animation == false) {
					clean_pages();
					branch.$container.show();
				} else {
					setTimeout(function() {
						switch(branch.animation) {
							case 'slide':
								branch.$container.css({ 
									'margin-left': '110%',
									'margin-right': '-110%',
									
								});
								branch.$container.show();
								branch.$container.animate({
									'margin-left': '0%',
									'margin-right': '0%'
								}, 750, 'easeOutQuad', clean_pages);
								break;
							case 'overlay':
								clean_pages();
								branch.$container.append('<i class="icofont-close-line-circled close_overlay_button"></i>');
								branch.$container.find('.close_overlay_button').first().click(function() {
									history.back();
								});
								branch.$container.css({
									'position': 'absolute',
									'top': '0px',
									'left': '0px',
									'right': '0px',
									'display': 'unset',
									'opacity': 0
								}).animate({
									'opacity': 1
								}, 1250, 'easeInOutExpo', function() {
								});
								$(".body_container").animate({ scrollTop: '0px' }, 1250, 'easeInOutQuad');	
								break;
							case 'unset_overlay':
								//branch.$container.show();
								branch.$container.parent().children().each(function() {
									branch.$container.removeClass('blur');
									if($(this).attr('id') != branch.current_page.id) {
										$(this).animate({
											'opacity': 0
										}, 565, 'ease_out_x_7', function() {
											$(this).remove();
										});
									}
								});
								break;	
						}
					}, 350);
				}
				if(this.callback != null) {
					this.callback();
				}
				if(typeof branch.root.use_rtc !== 'undefined' && branch.root.use_rtc === true) {
					setTimeout(function() {
						branch.root.loading.hide_loading_overlay();
					}, 1500);
				}
				/*for(var x in this.loaded_callbacks) {
					this.loaded_callbacks[x]();	
				}*/
				if(this.loaded_callbacks.length > 0) {
					this.loaded_callbacks[this.current_loaded_callback](this);
				} else {
					////console.log('do_load callback called');
				}
				if(typeof tinyMCE !== 'undefined') {
					/*setTimeout(function() {
						tinyMCE.init({
							 selector:'textarea.rich_text',
							 plugins: 'paste',
							 paste_auto_cleanup_on_paste : true,
							 paste_remove_styles: true,
							 paste_remove_styles_if_webkit: true,
							 paste_strip_class_attributes: true
						});	
					}, 1000);*/
				}
				//////alert('loaded'+branch.current_page.id);
				/**/

				branch.root.interpretation.assign_global_datepicker(branch.$container);
				this.loading_completed = true;
			}
		},
	},
	current_render_frame: null,
	callback: null,
	$container: null,
	current_page: null,
	animation: false,
	bottom_frame: null,
	list_addition_length: 10,
	/*render_page: function(page, frame, $frame, callback, page_data, animation) {
		var branch = this;
		if(page.developer_mode) {
			$.post(branch.root.actions, {
				'action': 'get_page_extension',
				'module': 'developer',
				'page': page.id
			}, function(data) {
				var parsed = data.extension;
				parsed = JSON.parse(parsed);
				parsed = JSON.parse(parsed);
				
				//////console.log(parsed);
				branch.sub_render_page(parsed, frame, $frame, callback, page_data, animation);
			}, "json");
		} else {
			this.sub_render_page(page, frame, $frame, callback, page_data, animation);	
		}
	},*/
	format_numeric: {
		remove_trailing_zeros: function(value) {
			var chars = value.split('');
			chars = chars.reverse();
			var non_zero_found = false;
			var result = [];
			for(var i in chars) {
				if(chars[i] != '0') {
					non_zero_found = true;
				}
				if(non_zero_found) {
					result.push(chars[i]);
				}
			}
			return result.reverse().join('');
		}
	},
	global_loaded_callbacks: {
		callbacks: [
			function(self, index) {
				//alert('load1');
				////console.log('global callback called sub');
				self.parent.$container.find('.currency').each(function() {
					var $this = $(this);
					if($this.find('.currency_parsed').length == 0) {
						var value = $this.html();
						if(!isNaN(value)) {
							if(value >= 0) {
								$this.removeClass('currency_negative').removeClass('currency_positive').addClass('currency_positive');
							} else {
								$this.removeClass('currency_negative').removeClass('currency_positive').addClass('currency_negative');
							}
							var whole_value = value;
							var fraction = "";
							if(value.indexOf('.') !== -1) {
								var split = value.split('.');
								whole_value = split[0];
								fraction = split[1];
								fraction = self.root.interpretation.format_numeric.remove_trailing_zeros(fraction);
							}
							var whole_value_split = whole_value.split('').reverse();
							var output_whole = [];
							var comma_counter = 0;
							for(var x in whole_value_split) {
								if(comma_counter == 3 && whole_value_split[x] != '-') {
									comma_counter = 0;
									output_whole.push(',');
								}
								output_whole.push(whole_value_split[x]);
								comma_counter++;
							}
							whole_value = output_whole.reverse().join('');
							if(fraction.length > 0) {
								whole_value += '.'+fraction;
							}
							//console.log(whole_value);
							$this.html("<span class='currency_parsed'>"+whole_value+"</span>");
						} else {
							$this.html("<span class='currency_parsed'>"+value+"</span>");
						}
					}
				});
				self.parent.$container.find('.percentage_format').each(function() {

					var $this = $(this);
					if($this.find('.percentage_parsed').length == 0) {
						var precentage_value = parseFloat($this.html()).toFixed(2)+"%";
						$this.html("<span class='percentage_parsed'>"+precentage_value+"</span>");
					}
				});
				self.parent.$container.find('.format_fraction').each(function() {

					var $this = $(this);
					if($this.find('.format_fraction_parsed').length == 0) {
						var value = $this.html();//parseFloat($this.html()).toFixed(2)+"%";
						if(value.indexOf('.') == -1) {
							value += ".0";
						} else {
							var split = value.split('.');
							var value_whole = split[0];
							var remainder = split[1].substr(0, 4);
							value = value_whole+'.'+remainder;
						}
						$this.html("<span class='format_fraction_parsed'>"+value+"</span>");
					}
				});
				self.call(index+1);
			},
			function(self, index) {
				self.root.drag.assign_pages_unselect(self.parent.$body_container);
				self.call(index+1);
			},
			function(self, index) {
				var branch = self;
				//alert('call');
				//console.log('form_element_dependencies_linked_elements');
				//console.log(branch.root.interpretation.form_element_dependencies_linked_elements);
				for(var x in branch.root.interpretation.form_element_dependencies_linked_elements) {
					var $linked_element = branch.root.interpretation.form_element_dependencies_linked_elements[x];
					//console.log('linked_element');
					//console.log($linked_element.attr('id'));
					$linked_element.trigger('change');
				}
				branch.root.interpretation.form_element_dependencies_linked_elements = [];
				self.call(index+1);
			},
			/*function(self, index) {
				self.parent.assign_global_datepicker(self.parent.$container);
				self.call(index+1);
			}*/
		],
		callbacks_by_page: [],
		set_callback_by_page: function(page_id, callback, callback_name) {
			if(typeof this.callbacks_by_page[page_id] === 'undefined') {
				this.callbacks_by_page[page_id] = [];
			}
			this.callbacks_by_page[page_id][callback_name] = callback;
		},	
		init: function() {

		},
		page_global_callback_in_progress: false,
		call_callbacks_by_page: function(page, index) {
			if(!this.page_global_callback_in_progress || typeof index !== 'undefined') {
				////console.log('global callback');
				this.global_callback_in_progress = true;

				////console.log('global callback called');
				if(typeof index === 'undefined') {
					index = 0;
				}
				if(index < Object.values(this.callbacks_by_page[page]).length) {
					this.callbacks[Object.keys(this.callbacks_by_page[page])[index]](this, index, page);
				} else {
					this.page_global_callback_in_progress = false;
				}
			}
		},
		call: function(index) {
			//if(!this.global_callback_in_progress || typeof index !== 'undefined') {
				////console.log('global callback');
				this.global_callback_in_progress = true;

				////console.log('global callback called');
				if(typeof index === 'undefined') {
					index = 0;
				}
				if(index < this.callbacks.length) {
					this.callbacks[index](this, index);
				} else {
					this.global_callback_in_progress = false;
				}
			//}
		},
	},
	form_element_dependencies_linked_elements: [],
	page_data: [],
	render_page: function(page, frame, $frame, callback, page_data, animation) {
		var branch = this;
		var animation = false;
		this.global_date_picker_assigned = false;
		if(typeof page_data !== 'undefined') {
			branch.page_data[page.id] = page_data;
		}
		//////alert(poge.id);
		if(page.id != 'search' && page.title != "") {
			if(document.title == "") {
				document.title = page.title
			} else {
				document.title = page.title;
			}
		}
		if(typeof page.use_rtc !== 'undefined') {
			if(page.use_rtc) {
				branch.root.use_rtc = true;
			} else {
				branch.root.use_rtc = false;
			}
		}
		if(typeof page.custom_css !== 'undefined') {
			var $head = $('head').first();
			var $stylesheet = $head.find('style#'+page.id).first();
			if($stylesheet.length == 0) {
				$head.append("<style>"+page.custom_css+"</style>");
			}
		}
		//////console.log('page_data');
		//////console.log(page_data);
		this.loaded_callbacks = Array();
		//var animation_click_page = null;
		if(this.current_page !== null) {
			if(typeof this.current_page.animation !== 'undefined') {
				if(!Array.isArray(this.current_page.click) && this.current_page.click == page.id) {
					animation = this.current_page.animation;
				} else if(Array.isArray(this.current_page.click) && Array.isArray(this.current_page.animation)) {
					for(var x in this.current_page.click) {
						if(this.current_page.click[x] == page.id) {
							animation = this.current_page.animation[x];	
							animation_click_page = this.current_page.click[x];
						}
					}
				}
			}
		}
		if(typeof page_data !== 'undefined') {
			if(typeof page_data.title !== 'undefined' && page_data.title != "") {
				if(document.title == "") {
					document.title = page_data.title;	
				} else {
					document.title = page_data.title;	
				}
				//page.title = page_data.title;
			}
		}
		if(typeof page_data == 'undefined') {
			page_data = {};	
		}
		branch.form_element_dependencies_linked_elements = [];
		if(typeof page.title_fetch !== 'undefined' && page.title_fetch == true) {
			$.post(this.root.actions, {
				'action': 'get_title'
			}, function(data) {
				document.title = data;
				$('#'+page.id+' .main_title').first().html(data);
			});
		}
		if(typeof page.user_menu !== 'undefined' && page.user_menu === false) {
			$('.user_info').hide();	
		}
		this.animation = animation;
		this.current_page = page;
		if(typeof page.hide_user_info !== 'undefined') {
			$('.user_info').hide();	
		}
		if(typeof callback !== 'undefined') {
			this.callback = callback;
		} else {
			this.callback = null;	
		}
		var $container;
		var frame_id;
		if(typeof $frame !== 'undefined') {
			if(page.id == 'article') {
				//$frame.append("testetestest");
			}
			$container = $frame;
			frame_id = $frame.attr('id').split("_frame")[0];
			this.current_render_frame = this.root.eval_object_path(this.root.find("elements.frames", frame_id), "this");
		} else {
			frame_id = frame;
			this.current_render_frame = this.root.eval_object_path(this.root.find("elements.frames", frame), "this");
			$container = $(".body_wrap");
			if(typeof frame !== 'undefined' && frame != 'index') {
				$container = $('.body_wrap #'+frame+'_frame');	
			}
		}
		page.frame_id = frame_id;
		this.bottom_frame = this.current_render_frame;
		var class_value = "";
		if(typeof page.class !== 'undefined') {
			class_value = page.class;	
		}
		if(animation != false) {
			var $last_page = $container.find('.page').first();
			var width = $last_page.width();
			switch(animation) {
				case 'slide':
					$last_page.css({
						'position': 'absolute',
						'width': width
					});
					$last_page.animate({
						'margin-left': '-110%',
						//'margin-right': '110%'
					}, 750, 'easeInOutQuint', function() {
					});
					break;
				case 'unset_overlay':	
					break;
			}
		}
		var unset_overlay_dismissed = false;
		var has_self_as_child = false;
		$container.children().each(function() {
			//////alert(this.id);
			//////alert(page.id);
			if(this.id == page.id) {
				has_self_as_child = true;	
			}
		});
		if(animation == 'overlay') {
			//branch.elements_store = {};
			//branch.root.functions.copy_object(branch.elements_store, branch.elements);	
			//$.extend(true, branch.elements_store, branch.elements)
			//branch.root.elements.store_elements();
		}
		if(animation == 'unset_overlay' && !has_self_as_child) {
			animation = false;	
			branch.animation = false;
			//branch.elements = branch.elements_store;
			//branch.elements_store = null;
		}
		if(animation != 'unset_overlay') {
			unset_overlay_dismissed = true;
			if($container.find('#'+page.id).length > 0) {
				$container.find('#'+page.id).remove();	
			}
			var style = 'display:none; visibility:collapse;'	
			//if(this.current_render_frame.level != 0) {
				//style = 
			//}
			var icon = "";
			if(typeof page.icon !== 'undefined' && typeof page.display_title !== 'undefined') {
				var icon_value;
				if(page.icon === true) {
					icon_value = page.title;
				} else {
					icon_value = page.icon;
				}
				//alert(icon_value);
				icon = "<div class='logo' style='background-image:url(/images/"+icon_value+".png)'></div>";	
			}
			if(typeof page.icon_i !== 'undefined' && typeof page.display_title !== 'undefined') {
				icon = "<i class='"+page.icon_i+" logo_i'></i>";
			}
			var set_title_page_data = page.title;
			if(typeof page.title === 'undefined' || page.title == null || page.title.length == 0 || typeof page.gather_title_from_page_data !== 'undefined') {
				Object.keys(page_data).forEach(function(e) {
					if(e.indexOf('title') != -1) {
						set_title_page_data = page_data[e];
					}
				});
			}
			$container.append("<div class='page "+class_value+"' id='"+page.id+"' style='display:none;'><div class='title_icon_wrap'>"+icon+"<div class='title main_title' style='"+style+"'>"+page.title+"</div></div><div class='sub_main_title' style='visibility:collapse;'>"+set_title_page_data+"</div><div class='menu_top_container'></div></div>");
			var $title_element = $('#'+page.id+' .main_title').first();
			
			var $sub_title_element = $('#'+page.id+' .sub_main_title').first();
			var $logo_element = $('#'+page.id+' .logo').first();
			if(typeof page.title_link !== 'undefined') {
				var title_href = branch.root.navigation.generate_href(page.title_link);
				$('.title_icon_wrap').wrap("<a href='#"+title_href+"'></a>");	

				//$elements = $([$title_element[0], $logo_element[0]]).wrap("<a href='"+title_href+"'>"+page.title+"</a>");
				//$logo_element.html("<a href='"+title_href+"'><img src='/images/"+icon_value+".png' /></a>");	
				//$logo_element.wrap("<div style='float:left;' class='logo_wrap'><a href='"+title_href+"' style=''><div style='height:auto; overflow:hidden; display:inline-block;'></div></a></div>");
			}
			if(typeof page.icon_blend_mode !== 'undefined') {
				$logo_element.css({
					'mix-blend-mode': page.icon_blend_mode
				});		
			}
			/*////alert(frame);
			if(typeof $frame !== 'undefined') {
				////alert($frame[0].id);
			}*/	
			/*if((frame == 'body' && typeof $frame === 'undefined') || frame == null && typeof $frame === 'object') {
				$container.find('.title').first().show();	
			}*/
			//if((frame == 'body' && typeof $frame === 'undefined') || (typeof $frame !== 'undefined' && $frame[0].id == 'body_frame')) {
			if(page.id == 'index' || typeof page.display_title !== 'undefined') {
				$title_element.show().css({
					'visibility': 'visible'
				});
				$sub_title_element.css({
					'visibility': 'visible'
				});;
			}
			/*if(animation == 'unset_overlay') {
				animation = false;			
				branch.animation = false;	
			}*/
		} else {
			//branch.root.elements.restore_elements();	
		}
		delete page.main_color;
		if(typeof page.main_color !== 'undefined') {
			$title_element = $('#'+page.id+' .main_title').first();
			$title_element.css('color', page.main_color);
			branch.main_color_rgb = branch.root.hex_convert(page.main_color);

							
		}
		$container = $container.find('#'+page.id);
		branch.$container = $container;
		this.loaded_object.loaded_count = 0;
		this.loaded_object.loading_completed = false;
		this.loaded_object.render_completed_count = page.content.length;
		this.loaded_object.new();
		var content = page.content;
		////console.log('page_content:');
		////console.log(content);

		branch.loaded_objects[page.id].loaded_callbacks.push(function(self) {
			//branch.$body_container.find('.menu_button').removeClass('selected');
			//if(typeof page !== 'undefined') {
				//alert(branch.$body_container.find('.menu_button#'+page.id+'_button')[0]);
				//branch.$body_container.find('.menu_button#'+page.id+'_button').first().addClass('selected');
			//}
			var selected_menu_items = [];
			if(typeof branch.$body_container !== 'undefined') {
				branch.$body_container.find('.page').each(function() {
					selected_menu_items.push($(this).attr('id'));
				});
				branch.$body_container.find('.menu_button').removeClass('selected');
				branch.$body_container.find('.menu_button').each(function() {
					$(this).find('.arrow').remove();
				});
				var selected_menus = [];
				for(var x in selected_menu_items) {
					var $menu_selected = branch.$body_container.find('.menu_button#'+selected_menu_items[x]+'_button').first().addClass('selected');
					selected_menus.push($menu_selected);
				}

				for(var x in selected_menus) {
					var $menu_selected = selected_menus[x];
					if(x < selected_menus.length-1) {
						$menu_selected.append("<div class='arrow'><div class='arrow_sub'></div></div>");
					}
				}
			}

			self.call_next_callback();
			//self.call(index+1);
		});

		//branch.selected_menu_items.push(page.id);
		
		/*if(page.developer_mode) {
			branch.loaded_objects[page.id].loaded_callbacks.push(function() {
				branch.root.developer.init($container, page);
			});
		}*/
		//var $element;
		//////alert(animation);
		if(animation == 'unset_overlay') {
			branch.loaded_objects[page.id].set_completed();
			branch.loaded_objects[page.id].do_load();
			if(typeof page.no_reload_after_overlay_unset === 'undefined') {
				branch.root.elements.reload_elements_on_page();
			}
			return;	
		}
		var post_data_linked_elements = {};
		
		var form_element_linked_elements = {};

		for(var x in content) {
			var id = content[x].id;
			var type = content[x].type;
			if(typeof content[x].post_data !== 'undefined') {
				for(var z in content[x].post_data) {
					var post_data_item = content[x].post_data[z];
					if(post_data_item.indexOf('.') !== -1) {
						var split = post_data_item.split('.');
						var form = split[0];
						var form_element = split[1];
						if(typeof post_data_linked_elements[form] === 'undefined') {
							post_data_linked_elements[form] = {};	
						}
						if(typeof post_data_linked_elements[form][form_element] === 'undefined') {
							post_data_linked_elements[form][form_element] = Array();	
						}
						post_data_linked_elements[form][form_element].push(id+'_'+type);
					}
				}
			}
			if(type == 'form') {
				for(var e in content[x].content) {
					if(typeof content[x].content[e].post_data !== 'undefined') {
						//console.log('post_data');
						//console.log(content[x].content[e].post_data);
						for(var z in content[x].content[e].post_data) {
							var post_data_item = content[x].content[e].post_data[z];
							if(post_data_item.indexOf('.') !== -1) {
								var split = post_data_item.split('.');
								var form = split[0];
								var form_element = split[1];
								if(typeof post_data_linked_elements[form] === 'undefined') {
									post_data_linked_elements[form] = {};	
								}
								if(typeof post_data_linked_elements[form][form_element] === 'undefined') {
									post_data_linked_elements[form][form_element] = Array();	
								}
								post_data_linked_elements[form][form_element].push(id+'_'+type+"."+content[x].content[e].id);
							}
						}
					}
				}
			}
		}
		//console.log('linked_elements');
		//console.log(form_element_linked_elements);
		//console.log(post_data_linked_elements);
		////console.log('page:');
		////console.log(page);
		//console.log('custom_elements');
		//console.log(branch.root.custom_elements);
		for(var x in content) {
			var content_item = {};
			branch.root.functions.copy_object(content_item, content[x]);
			
			var content_item_object;
			(function(content_item){
				var $templates = $('#templates');
				if(typeof content_item.custom_inject_html !== 'undefined') {
					var id = $(content_item.custom_inject_html).first().attr('id');
					if($templates.find('#'+id).length == 0) {
						//alert(content_item.custom_inject_html);
						$templates.first().append(content_item.custom_inject_html);
					}
				}
				////console.log('---content_item');
				////console.log(content_item);
				//////alert(content_item.id);
				//////alert(content_item.id);
				//////console.log(content_item);
				var content_item_id_singular = content_item.id;
				//if(ontent_item.id.substr(content_item.id.length-1, content_item.id.length) == 's') {
				if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
					/*var content_item_id_split = content_item.id.split('__');
					var singular_id_value = content_item_id_split[0];
					if(singular_id_value.indexOf('ies') == singular_id_value.length-3) {
						singular_id_value.substr(0, singular_id_value.length-3)+'y';
					} else {
						singular_id_value.substr(0, singular_id_value.length-1);
					}
					content_item_id_singular += '__'+content_item_id_split[1];*/
					content_item_id_singular = content_item.id;
				} else {
					content_item_id_singular = content_item.id.substr(0, content_item.id.length-1);
				}
				//}
				if(typeof content_item.id_singular !== 'undefined') {
					content_item_id_singular = content_item.id_singular;	

					if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
						//content_item_id_singular += '__'+page.id;
						content_item_id_singular = content_item.id;
					}
				}
				var $content_item_element;
				var style_requirment = "";
				if(typeof content_item.requirement_callback !== 'undefined') {
					style_requirment = "display:none;";	
				}
				switch(content_item.type) {
					case 'breadcrumb':
						var breadcrumb = branch.root.navigation.generate_breadcrumb_element();
						////console.log('breadcrumb');
						////console.log(breadcrumb);
						if(breadcrumb.length > 0) {
							breadcrumb = breadcrumb.reverse();
							breadcrumb.push(page.id);
							var breadcrumb_links = [];
							for(var x in breadcrumb) {
								////console.log(breadcrumb[x]);
								var link_get_data = branch.root.navigation.get_last_post_data(breadcrumb[x]);
								////console.log(link_get_data);
								var link_page_object = branch.root.interpretation.find_page(breadcrumb[x]);
								if((link_get_data != null && typeof link_get_data.id !== 'undefined') || (typeof link_page_object !== 'undefined' && typeof link_page_object.breadcrumb_no_get_data !== 'undefined')) {
									var href = branch.root.navigation.generate_href(breadcrumb[x], null, null, link_get_data, frame_id);
									var title_value = "";
									var bold_prefix = "";
									var bold_suffix = "";
									if(link_page_object.id == page.id) {
										title_value = " - "+branch.get_title();
										bold_prefix = "<span style='font-weight:bold;'>";
										bold_suffix = "</span>";
									}
									var breadcrumb_value = "<a href='"+href+"'>"+bold_prefix+link_page_object.title+title_value+bold_suffix+"</a>";
									breadcrumb_links.push(breadcrumb_value);
								
								}
							}
							var link_string = "";
							if(breadcrumb_links.length == 1) {
								link_string = breadcrumb_links[0];
							} else {
								link_string = breadcrumb_links.join(' > ');
							}
							if(link_string != "") {
								$container.append("<div class='breadcrumb'> > "+link_string+"</div>");
							}
						}
						branch.loaded_objects[page.id].loaded();
						break;
					case "wrap":
						//branch.loaded_objects[page.id].pre_loaded_callbacks.push(function() {
							switch(content_item.element) {
								default:
								case 'a':
									var wrap_elements = Array();
									for(var i in content_item.wrap_elements) {
										var $wrap_element_item = $container.find('#'+content_item.wrap_elements[i]);
										if($wrap_element_item.length > 0) {
											//wrap_elements.push($wrap_element_item)[0]);
										} else {
											var wrap_id_split = content_item.wrap_elements[i].split('_');
											wrap_id_split.splice(wrap_id_split.length-1, 1);
											var wrap_id = wrap_id_split.join('_');
											$wrap_element_item = $container.find('#'+wrap_id).first();
										}
										wrap_elements.push($wrap_element_item[0]);
											
									}
									var properties_string = "";
									for(var x in content_item.properties) {
										var value = content_item.properties[x];
										if(typeof page_data !== 'undefined') {
											value = page_data[content_item.properties[x]];
										}	
										properties_string += " "+x+"='"+value+"'";	
									}
									/*if(content_item.element == 'div') {
										$(wrap_elements).wrapAll("<div id='"+content_item.id+"_wrap'><"+content_item.element+" "+properties_string+"></"+content_item.element+"></div>");
									} else {*/
									$(wrap_elements).wrapAll("<div id='"+content_item.id+"_wrap' class='wrap_element'><"+content_item.element+" "+properties_string+"></"+content_item.element+"></div>");
									break;	
							}
							var $wrapped = $container.find('#'+content_item.id+'_wrap').first();
							if(typeof content_item.inject !== 'undefined' && content_item.inject != '' && content_item.inject.length > 0) {
								var $inject_element = $container.find('#'+content_item.inject).first();
								$inject_element.wrap("<div id='"+content_item.inject+"_container'></div>");
								$inject_element.parent().append("<br>"+$wrapped.first()[0].outerHTML);	
								$wrapped.remove();
								$wrapped = $inject_element.parent().find('#'+content_item.id+'_wrap').first();
							}
							$content_item_element = $wrapped;
							branch.loaded_objects[page.id].loaded();
						//});
						break;
					case "function_call":
						$container.append("<div class='function_call content_light' id='function_"+content_item.id+"'><button class='button' style='width:unset'>"+content_item.value+"</button><div style='display:none;' class='loading_spinner'><div><i class='icofont-spinner-alt-2'></i></div></div></div>");
						var $function_button = $container.find('#function_'+content_item.id).first();
						$function_button.find('.button').first().click(function() {
							$(this).hide();
							var $this = $(this);
							$function_button.find('.loading_spinner').show();
							branch.root.post(branch.root.actions, {
								'action': content_item.action
							}, function(data) {
								setTimeout(function() {							
									$function_button.find('.loading_spinner').hide();
									$this.show();
								}, 1000);
							});
						});
						branch.loaded_objects[page.id].loaded();
						break;
					case "status":
						var icon = "icofont-cloudapp";
						if(typeof content_item.icon !== 'undefined') {
							icon = content_item.icon;	
						}
						$container.append("<div class='status content_light' id='"+content_item.id+"'><div><div class='status_icon'><i class='"+icon+"'></i></div><div class='status_name'>"+content_item.name+"</div></div><br><div><div class='status_message'></div></div></div>");
						var $status_element = $container.find('#'+content_item.id).first();
						var status_object = {
							load: function() {
								branch.root.post(branch.root.actions, {
									'action': content_item.id+"_status"
								}, function(data) {
									if(data == 1) {
										$status_element.find('.status_message').html(content_item.status_message_true).css('color', '#fff');
									} else {
										$status_element.find('.status_message').html(content_item.status_message_false).css('color', '#000');
									}
								});
							}
						};
						status_object.load();
						$content_item_element = $status_element;
						branch.loaded_objects[page.id].loaded();
						break;
					case "image":
						var id = content_item.id;
						var value;
						if(typeof content_item.content !== 'undefined') {
							value = content_item.content;
						} else {
							var statement = "value = page_data."+id+";";
							eval(statement);
						}
						if(typeof value !== 'undefined') {
							$container.append("<div class='image' id='"+content_item.id+"'><img src='"+content_item.image_location+'/'+value+"' class='max_original_size' /></div>");
							$content_item_element = $container.find('.image#'+content_item.id).first();
						}
						branch.loaded_objects[page.id].loaded();
						break;
					case 'images':
						$container.append("<div class='images' id='"+content_item.id+"_images'><div class='images_container'></div><div class='bulbs'></div></div>");
						$content_item_element = $container.find('.images#'+content_item.id+"_images").first();
						var images_object = {
							load: function(data) {
								var self = this;
								var loaded_callback = function(data) {
									var $image_container = $content_item_element.find('.images_container').first();
									var $bulbs = $content_item_element.find('.bulbs').first();
									var images = data;//page_data['images'];
									var hide_arrows = false;
									if(images.length == 1) {
										hide_arrows = true;	
									}
									var max_height = -1;
									for(var x in images) {
										$image_container.append("<div class='image' id='"+images[x].id+"'><img src='"+content_item.image_location+"/"+images[x].image+"'/></div>");
										var $image = $image_container.find('.image#'+images[x].id).first();
										(function($image) {
											$bulbs.append("<div class='bulb' id='"+images[x].id+"_bulb'></div>");
											var $bulb = $bulbs.find('.bulb#'+images[x].id+'_bulb').first();
											$bulb.click(function() {
												$bulbs.children().removeClass('bulb_selected');
												$(this).addClass('bulb_selected');
												$image_container.find('.current_image').css({
													//'position': 'absolute'
												}).removeClass('current_image').fadeOut('slow', function() {
													//$bulbs.find('.bulb#'+image[x].id+'_bulb').addClass('bulb_selected');
													$image.addClass('current_image').fadeIn('fast');
													$(this).css({
														'position': 'unset'
													});
												});
											});
											//$image_container.find('.image').hide();
											//$image.show();
											//if(max_height == -1 || $image.height() > max_height) {
											//	max_height = $image_container.height();	
											//}
											if(x > 0) {
												$image.hide();	
											} else {
												$image.addClass('current_image');	
												$bulb.addClass('bulb_selected');
											}
										}($image));
									}
									branch.loaded_objects[page.id].loaded();
								};
								if(typeof data === 'undefined') {
									branch.root.post(branch.root.actions, {
										'action': content_item.id+'_images',
									}, function(data) {
										loaded_callback(data);
									}, "json");
								} else {
									loaded_callback(data);
								}
							}
						};
						if(typeof content_item.content !== 'undefined' && content_item.content == 'fetch') {
							images_object.load();
						} else if(typeof page_data['images'] !== 'undefined') {
							images_object.load(page_data['images']);
							/*////alert(max_height);
							$image_container.css({
								'height': max_height+'px'
							});*/
						}
						break;
					case 'options':
						$container.append("<div class='menu_wrap menu_options'><div class='menu_top' id='"+content_item.id+"_options'></div></div>");
						var target_object;
						if(typeof content_item.target_object !== 'undefined') {
							target_object = branch.root.elements.find_element_object(content_item.target_object);
						}
						var $options = $container.find('#'+content_item.id+'_options').first();
						if(content_item.content == 'fetch') {
							branch.root.post(branch.root.actions, {
								'action': content_item.id+'_options'
							}, function(data) {
								for(var i in data) {
									var item = data[i];
									var image = "";
									if(typeof data[i].image !== 'undefined') {
										image = "<br><div style='background-image:url(/images/"+data[i].image+".png);' class='option_image' style='max-width:'100%'></div>";	
									}
									$options.append("<div class='menu_button' id='"+data[i].id+"_option'><a>"+data[i].value+""+image+"</a></div>");	
									var $option = $options.find('#'+data[i].id+'_option').first();
									var post_data = {};
									for(var y in content_item.load_mask) {
										post_data[content_item.load_mask[y]] = data[i][y];	
									}
									
									if(typeof content_item.target_object !== 'undefined') {
										$option.click(function() {
											//target_object.load('', post_data);
											branch.load_object(target_object, post_data);
										});
									} else if(typeof content_item.target !== 'undefined') {
										if(content_item.target == 'self') {
											var href = branch.root.navigation.generate_href(page.id, null, null, post_data, frame_id);
											$option.find('a').first().attr('href', href);
										} else if(content_item.target == 'href' && typeof data[i].href !== 'undefined') {
											$option.find('a').first().attr('href', data[i].href);	
										}
									}
								}
								$options.children().last().addClass('last_menu_item');
							}, "json");
						}
						$content_item_element = $options;
						branch.loaded_objects[page.id].loaded();
						break;
					case 'file_upload':
						var action = "upload.php?";
						if(typeof content_item.form_action !== 'undefined') {
							action = content_item.form_action;
						}
						$container.append('<form action="'+action+'" id="'+content_item.id+'_file_upload" class="dropzone dropzone_'+content_item.id+'"></form>');
						//Dropzone.discover();
						var _dropzone = new Dropzone(".dropzone_"+content_item.id+"#"+content_item.id+'_file_upload');
						$upload_form = $container.find('#'+content_item.id+'_file_upload').first();
						var upload_object = {
							rtc_upload_count: 0,
							load: function() {
								_dropzone.removeAllFiles(true);	
							}
						};
						(function(){
							var post_data = {};
							if(typeof content_item.submit_mask !== 'undefined') {
								if(branch.root.use_rtc) {
									_dropzone.options.autoProcessQueue = false;
									$upload_form.removeAttr('action');
									_dropzone.on('addedfile', function(file) {
										if(file.size > 2000000000) {
											branch.root.dialog.init("Maximum filesize exceeded.", undefined, undefined, function() {

											});
											branch.root.dialog.show();
											return;
										}
										upload_object.rtc_upload_count++;
										var post_data = {};
										branch.root.loading.display_loading_overlay();
										post_data.action = 'enqueue_file';//'_'+content_item.rtc_send_id;
										/*for(var i in content_item.submit_mask) {
											var item = content_item.submit_mask[i];
											if(item.indexOf("'") !== -1) {
												post_data[i] = item.split("'").join('');
											} else if(item.indexOf('.') !== -1) {
												var item_split = item.split(".");
												var item_object = item_split[0];
												var item_property = item_split[1];	
												var target_object = branch.root.elements.find_element_object(item_object);
												var $target_element = target_object.$element.find('#'+item_property);
																							
												var value = $target_element.val();
												post_data[i] = value;
											} else {
												post_data[i] = page_data[item];	
											}
										}*/
										branch.apply_load_mask(post_data, content_item.submit_mask, page_data);
										//var filename_split = file.name;
										/*var last_index = filename_split.lastIndexOf('.');
										var extension = filename_split.substr(last_index, filename_split.length);
										filename_split = filename_split.substr(0, last_index);
										post_data.filename = filename_split;
										post_data.extension = extension;
										////alert(filename_split);
										////alert(file.name);*/
										/*if(filename_split.indexOf('.') != -1) {
											filename_split = filename_split.split('.');
											post_data.extension = filename_split[filename_split.length-1];
											filename_split.splice(filename_split.length-1, 1);
											post_data.filename = filename_split.join('.');
										} else {
											post_data.filename = filename_split;
										}*/
										post_data.filename = file.name;
										if(typeof post_data.folder_id === 'undefined') {
											post_data.folder_id = 0;
										}

										branch.root.torrent.seed(file, function(magnet) {
											/*var post_data = {
												'action': '_enqueue_file',
												'magnet': magnet,
											};
											branch.apply_load_mask(post_data, content_item.post_data, page_data);*/
											post_data.magnet = magnet;
											post_data.intercept = true;
											console.log(post_data);
											branch.root.post(branch.root.actions, post_data, function(torrent_data) {
												branch.root.torrent.client.remove(torrent_data.magnet);
												console.log('file sent');
												upload_object.rtc_upload_count--;
												var send_post_data = {};
												if(typeof content_item.on_submit_load_mask !== 'undefined') {
													branch.apply_load_mask(send_post_data, content_item.on_submit_load_mask, page_data);
												}
												
												branch.call_on_submit(content_item.on_submit, send_post_data);
												if(upload_object.rtc_upload_count == 0) {
													_dropzone.removeAllFiles();
													branch.root.loading.hide_loading_overlay();
												}
											});
										});

										/*reader = new FileReader();
							            reader.onload = handleReaderLoad;
							            reader.readAsDataURL(file);
							            function handleReaderLoad(evt) {
							            	post_data.file_value = evt.target.result;
							            	//////console.log('file_value: ');
							            	//////console.log(post_data.file_value);
											branch.root.post(branch.root.actions, post_data, function(data) {
												upload_object.rtc_upload_count--;
												var send_post_data = {};
												if(typeof content_item.on_submit_load_mask !== 'undefined') {
													branch.apply_load_mask(send_post_data, content_item.on_submit_load_mask, page_data);
												}
												
												branch.call_on_submit(content_item.on_submit, send_post_data);
												if(upload_object.rtc_upload_count == 0) {
													_dropzone.removeAllFiles();
													branch.root.loading.hide_loading_overlay();
												}
											});
										}*/
									});
								} else {
									for(var i in content_item.submit_mask) {
										var item = content_item.submit_mask[i];
										if(item.indexOf("'") !== -1) {
											post_data[i] = item.split("'").join('');
										} else if(item.indexOf('.') !== -1) {
											var item_split = item.split(".");
											var item_object = item_split[0];
											var item_property = item_split[1];	
											var target_object = branch.root.elements.find_element_object(item_object);
											var $target_element = target_object.$element.find('#'+item_property);
											
											$target_element.change(function() {
												for(var y in content_item.submit_mask) {
													var item = content_item.submit_mask[y];
													if(item.indexOf('.') !== -1) {
														var item_split = item.split(".");
														var item_object = item_split[0];
														var item_property = item_split[1];	
														var target_object = branch.root.elements.find_element_object(item_object);
														var $target_element = target_object.$element.find('#'+item_property);															
														var value = $target_element.val();
														post_data[y] = value;
													}
												}
												var action_string = action;
												for(var i in post_data) {
													action_string += "&"+i+"="+post_data[i];	
												}
												$upload_form.attr('action', action_string);
												_dropzone.options.url = action_string;
											});
											
											var value = $target_element.val();
											post_data[i] = value;
										} else {
											post_data[i] = page_data[item];	
										}
									}
									var action_string = action;
									for(var i in post_data) {
										action_string += "&"+i+"="+post_data[i];	
									}
									$upload_form.attr('action', action_string);
									_dropzone.options.url = action_string;
									
									content_item_object = upload_object;
								}
							}
							if(typeof content_item.on_submit !== 'undefined') {
								if(branch.root.use_rtc) {

								} else {
									_dropzone.on("queuecomplete", function(file) {
										var send_post_data = {};
										if(typeof content_item.on_submit_load_mask !== 'undefined') {
											branch.apply_load_mask(send_post_data, content_item.on_submit_load_mask, page_data);
										}
										
										branch.call_on_submit(content_item.on_submit, send_post_data);
									});
								}
							}
							$content_item_element = $upload_form;
							branch.loaded_objects[page.id].loaded();
						})();

						break;
					case "carousel":
						$container.append("<div class='carousel_wrap'><div class='carousel "+content_item.id+"_carousel' style='height:"+content_item.height+";' id='"+content_item.id+"_carousel'></div><div class='"+content_item.id+"_carousel_bulbs carousel_bulbs'></div></div>");
						var $carousel = $container.find('#'+content_item.id+'_carousel').first();
						var $carousel_bulbs = $container.find('.'+content_item.id+'_carousel_bulbs').first();
						var carousel_object = {
							load: function() {
								var self = this;
								branch.root.post(branch.root.actions, {
									action: content_item.id+"_carousel"	
								}, function(data) {
									for(var i in data) {
										var current_class = '';
										if(i == 0) {
											current_class = "current_slide";	
										}
										var content_wrap = "";
										if(typeof data[i].title !== 'undefined' && data[i].content !== 'undefined') {
											content_wrap = "<div class='carousel_content_wrap'><div class='carousel_text'><div class='title'>"+data[i].title+"</div><div>"+data[i].content+"</div></div></div>";
										}
										$carousel.append("<div class='carousel_item "+current_class+"' style='background-image:url(/images/"+data[i].image+")'>"+content_wrap+"</div>");	
									}
									if(typeof content_item.bulbs !== 'undefined') {
										$carousel.children().each(function(i) {
											if(i > 0) {
												$(this).css('left', '-100%');	
											}
											$carousel_bulbs.append("<div class='bulb' id='bulb_"+i+"'></div>");
											var $bulb = $carousel_bulbs.find('#bulb_'+i);
											//(function(k){
												$bulb.click(function() {
													self.slide_to(i);
												});
											//}(i));
										});
									}
									//self.play();
									//self.slide_to(0);
									var timeout = 0;
									if(typeof content_item.timeout !== 'undefined') {
										timeout = content_item.timeout;	
									}
									//self.current_index = $carousel.children().length-1;
									setTimeout(function() {
										if(typeof content_item.play !== 'undefined') {
											self.play();
										}
									}, timeout+1500);
								}, "json");
							},
							current_index: 0,
							play: function() {
								var self = this;
								var next_slide = this.current_index+1;
								this.slide_to(next_slide, true);
							},
							timeout: null,
							slide_to: function(index, play) {
								var self = this;
								if(typeof play === 'undefined') {
									clearTimeout(self.timeout);	
								}
								if(index >= $carousel.children().length) {
									index = 0;	
								}
								self.current_index = index;
								var $next_slide;
								$carousel.children().each(function(i) {
									if(i == index) {
										$next_slide = $(this);	
									}
								});
								if($next_slide.hasClass('current_slide')) {
									return;	
								}
								$carousel_bulbs.children().each(function(i) {
									if(i == index) {
										var $bulb = $(this);
										$carousel_bulbs.children().each(function() {
											$(this).removeClass('bulb_selected');
										});
										$bulb.addClass('bulb_selected');
									}
								});
								$current_slide = $carousel.find('.current_slide').first();
								if(typeof content_item.animation === 'undefined' || typeof content_item.animation !== 'undefined' && content_item.animation == 'slide') {
									
									$next_slide.css({
										'left': '-100%',
										//'right': '100%'
									});
									$current_slide.animate({
										//'right': '-100%',
										'left': '100%'
									}, 1000, 'easeInOutQuint');	
									$current_slide.removeClass('current_slide');
									
									$next_slide.addClass('current_slide');
									$next_slide.animate({
										'left': '0px',
										//'right': '0px'		
									}, 1000, 'easeInOutQuint', function() {
										if(typeof play !== 'undefined') {
											self.timeout = setTimeout(function() {
												self.play();
											}, content_item.time_interval);
										}
									});
								} else if(content_item.animation == 'fade') {
									$current_slide.fadeOut('slow');
									$next_slide.fadeIn('slow', function() {
										$current_slide.removeClass('current_slide');
										$next_slide.addClass('current_slide');	
										
										if(typeof play !== 'undefined') {
											self.timeout = setTimeout(function() {
												self.play();
											}, content_item.time_interval);
										}
									});	
								}
							}
						};
						carousel_object.load();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'custom_frame':
						var custom_frame_html = $('.custom_frames').find('.'+content_item.link)[0].outerHTML;
						$container.append("<div id='"+content_item.id+"'>"+custom_frame_html+"</div>");
						var page_data_string = "";
						if(typeof page_data_string !== 'undefined') {
							page_data_string = "page_data";	
						}
						var statement = "branch.root."+content_item.id+".init("+page_data_string+")";
						eval(statement);
						branch.loaded_objects[page.id].loaded();
						break;
					case 'link':
						var get_data = {};
						if(typeof content_item.target_page_load_mask !== 'undefined') {
							for(var x in content_item.target_page_load_mask) {
								get_data[content_item.target_page_load_mask[x]] = page_data[x];	
							}
						}
						var href = "";
						if(typeof content_item.manual_link !== 'undefined') {
							href = content_item.manual_link;	
						} else if(typeof content_item.post_action !== 'undefined') {
							get_data.action = content_item.post_action;
						} else {
							href = branch.root.navigation.generate_href(content_item.target_page, null, null, get_data, content_item.target);
						}
						if(href != "") {
							$container.append("<div class='link' id='"+content_item.id+"_link' style='"+style_requirment+"'><a href='"+href+"'>"+content_item.value+"</a></div>");
						} else {
							$container.append("<div class='link' id='"+content_item.id+"_link' style='"+style_requirment+"'>"+content_item.value+"</div>");
						}
						var $link = $container.find('.link#'+content_item.id+"_link").first();
						if(typeof content_item.post_action !== 'undefined') {
							$link.click(function() {
								var $this = $(this);
								branch.root.post(branch.root.actions, get_data, function(data) {
									$this.addClass('saved');
									setTimeout(function() {
										$this.removeClass('saved');
									}, 1500);
								});
							});
						}
						$content_item_element = $link;
						
						branch.loaded_objects[page.id].loaded();
						break;
					case 'menu':
						var parse_menu = function(fetched) {
							var custom_pages = Array();
							var set_pages = Array();
							if(!fetched) {
								set_pages = content_item.content;	
							} else {
								for(var i in content_item.content) {
									if(typeof content_item.content[i].page === 'undefined') {
										set_pages.push(content_item.content[i].id);	
									} else {
										custom_pages.push(content_item.content[i]);	
									}
								}
							}
							content_item.content_parsed = branch.get_pages_data(set_pages);
							$container.find('.menu_top_container').first().append("<div class='menu_wrap'><div class='menu_"+content_item.position+" "+content_item.id+"_menu'></div></div>");
							var $menu_container = $container.find('.'+content_item.id+'_menu').first();
							//
							if(typeof page.main_color !== 'undefined') {
								var main_color = branch.root.hex_convert(page.main_color);

								var rgba_color_value = "rgba("+main_color.r+','+main_color.g+','+main_color.b+",0.4)";
								//alert(rgba_color_value);
								$menu_container.css('background-color', rgba_color_value);
							}
							var menu_buttons_html = Array();
							for(var i in content_item.content_parsed) {
								var item = content_item.content_parsed[i];
								var title = item.title;
								if(branch.root.language != 0) {
									var suffix = parseInt(branch.root.language)+1;
									suffix = "_"+suffix;
									if(typeof item["title"+suffix] !== 'undefined') {
										title = item["title"+suffix];
									}
								}
								var icon_i = "";
								if(typeof item.icon_i !== 'undefined') {
									icon_i = "<i class='"+item.icon_i+"'></i>";	
								}
								$menu_container.append("<div class='menu_button "+item.id+"_button' id='"+item.id+"_button'><a>"+icon_i+title+"</a></div>");
								var $menu_button = $menu_container.find('#'+item.id+'_button').first();
								/*console.log(i);
								if(i == 0) {
									$menu_button.css({
										'border-radius': '5px 0px 0px 5px'
									});
								}
								if(i == content_item.content_parsed.length-1) {
									$menu_button.css({
										'border-radius': '0px 5px 5px 0px'
									});
								}
								if(i == 0 && i == content_item.content_parsed.length-1) {
									$menu_button.css({
										'border-radius': '5px 5px 5px 5px'
									});
								}*/

							}
							var content = content_item.content_parsed;
							var page_send_data = null;
							if(typeof content_item.post_data !== 'undefined' && typeof page_data !== 'undefined') {
								page_send_data = {};
								for(var x in content_item.post_data) {
									page_send_data[x] = page_data[content_item.post_data[x]];	
								}
							}
							$menu_container.children().each(function(index) {
								var menu_data = content[index];
								////console.log(menu_data.id, page_send_data, content_item.target);
								
								//console.log('menu');
								//console.log(content_item.redirect_index);
								//console.log(menu_data.id);
								if(typeof content_item.redirect_index !== 'undefined' && typeof content_item.redirect_index[menu_data.id] !== 'undefined') {
									//alert(menu_data.id);
									$(this).find('a').first().attr('href', content_item.redirect_index[menu_data.id]);
								} else {
									var page_object = branch.find_page(menu_data.id);
									delete page_object.main_color;
									if(typeof page_object.is_back_button !== 'undefined') {
										$(this).click(function() {
											branch.root.navigation.back_hash();
											//console.log('back');
										});
									} else {
										if(typeof page_object.main_color !== 'undefined') {
											$(this).find('a').first().css('color', page_object.main_color);
										}
										$(this).find('a').first().attr('href', branch.root.navigation.generate_href(menu_data.id, null, null, page_send_data, content_item.target));
									}
								}
							});
							for(var i in custom_pages) {
								var item = custom_pages[i];
								$menu_container.append("<div class='menu_button "+item.id+"_button' id='"+item.id+"_button'><a>"+item.title+"</a></div>");
								$menu_container.find('.'+item.id+'_button > a').first().attr('href', branch.root.navigation.generate_href(item.page, null, null, {
									id: item.id	
								}, content_item.target));
							}
							var menu_item_html = Array();
							if(typeof content_item.order !== 'undefined') {
								$menu_container.children().each(function() {
									menu_item_html.push({
										element: $(this).detach()
									});
									var page_item_id = $(this)[0].id.split("_button")[0];
									if(typeof content_item.order[page_item_id] !== 'undefined') {
										menu_item_html[menu_item_html.length-1].order = content_item.order[page_item_id];	
									} else {
										menu_item_html[menu_item_html.length-1].order = "-1";	
									}
								});
							}
							menu_item_html.sort(function(a, b) {
								if(a.order > b.order) {
									return 1;	
								} else if(a.order < b.order) {
									return -1	
								}
								return 0;
							});
							for(var i in menu_item_html) {
								$menu_container.append(menu_item_html[i].element);
							}
							/*for(var i in menu_buttons_html) {
								////alert('append');
								$menu_container.append(menu_buttons_html[i]);	
							}*/
							$menu_container.children().last().addClass('last_menu_item');
							if(typeof branch.$body_container !== 'undefined') {
								branch.$body_container.find('.last_menu').removeClass('last_menu');
							}
							$menu_container.addClass('last_menu');
							branch.loaded_objects[page.id].loaded();
						};
						if(content_item.content === 'fetch') {
							var post_data = {
								'action': 'get_menu_'+content_item.id
							};
							if(typeof content_item.post_data !== 'undefined' && typeof page_data !== 'undefined') {
								for(var x in content_item.post_data) {
									post_data[x] = page_data[content_item.post_data[x]];	
								}
							}
							////console.log(post_data);
							branch.root.post(branch.root.actions, post_data, function(data) {
								content_item.content = data.pages;
								if(typeof data.order !== 'undefined') {
									content_item.order = data.order;
								}
								parse_menu(true);
							}, "json");
						} else {
							parse_menu(false);	
						}
						break;
					case 'frame':
						$container.append("<div class='frame' id='"+content_item.id+"_frame'></div>");
						$frame = $container.find('#'+content_item.id+"_frame");
						$content_item_element = $frame;
						var frame_object = {
							$element: $frame,
							parent: branch.current_render_frame,
							level: branch.current_render_frame.level+1,
							__default_page: content_item.default_page	
						};
						if(typeof content_item.merge_get_data !== 'undefined') {
							$frame.addClass('merge_get_data');
						}
						$frame.attr('default_page', content_item.default_page);
						$frame.attr('level', frame_object.level);
						var assign_parent = branch.current_render_frame;//this.root.find("elements.frames", frame);
						branch.bottom_frame = frame_object;
						var assign_statement = "assign_parent."+content_item.id+" = frame_object;";
						eval(assign_statement);
						branch.loaded_objects[page.id].loaded();
						break;
					case 'grid':
						$container.append("<div id='"+content_item.id+"_grid' class='grid'></div>");
						var $grid = $container.find('#'+content_item.id+"_grid").first();
						$content_item_element = $grid;
						/*if(typeof content_item.title !== 'undefined') {
							var remove_items_button = "";
							if(typeof content_item.remove_items !== 'undefined') {
								remove_items_button += "<span style='margin-left:15px; font-size:16px;'>Remove items <i class='icofont-delete'></i></span>";	
							}
							$grid.append("<div class='title'>"+content_item.title+remove_items_button+"</div>");	
						}*/
						var grid_operation = {
							offset: 0,
							$grid: $grid,
							components: Array(),
							load: function(send_data, search_term) {
								var self = this;
								self.components = Array();
								/*if(typeof no_refresh === 'undefined') {
								}*/
								/*if(typeof no_refresh !== 'undefined') {
									$list = $('.dummy_div').first();	
								} else {
									$list = self.$list;	
								}*/
								if(typeof search_term === 'undefined') {
									search_term = '';	
								}
								$list_values_container = self.$list;//branch.view.dummy_div.new();	//$('.dummy_div').first();
								//$list_values_container.html("");	
								var post_data = {
									action: content_item.id+"_grid",
									search_term: search_term,
									offset: self.offset	
								};
								if(typeof content_item.default_values !== 'undefined') {
									for(var x in content_item.default_values) {
										post_data[x] = content_item.default_values[x];	
									}
								}
								if(typeof content_item.post_data !== 'undefined' && typeof page_data !== 'undefined') {
									for(var x in content_item.post_data) {
										if(typeof page_data[content_item.post_data[x]] !== 'undefined') {
											var statement = "post_data."+x+" = page_data."+content_item.post_data[x];
											eval(statement);
										}
										/*if(typeof post_data[x] === 'undefined') {
											post_data[x] = null;	
										}*/
									}
								}
								if(typeof send_data !== 'undefined') {
									for(var x in send_data) {
										var statement = "post_data."+x+" = page_data."+send_data[x];
										eval(statement);	
									}
								}
								/*if(typeof post_data.search_field !== 'undefined') {
									var $search_field = $list.parent().find('.search_bar').find('.search').first();
									$search_field.val(post_data.search_field);
									if(content_item.search === true) {
										post_data.search_term = post_data.search_field;	
									}
									delete post_data.search_field;
								}*/
								branch.root.post(branch.root.actions, post_data, function(data) {
									var $grid_template = $('#templates > #'+content_item.id+'_grid_template').first();
									var grid_template = $grid_template[0].outerHTML;
									$grid.html(grid_template);
									if(typeof content_item.remove_items !== 'undefined') {
										$grid.prepend("<div class='remove_items_main_button'>Remove items <i class='icofont-delete'></i></div>");	
										var toggle_grid_remove_items = false;
										$grid.find('.remove_items_main_button').click(function() {
											if(!toggle_grid_remove_items) {
												$grid.find('.delete_grid_item').show();
												toggle_grid_remove_items = true;
											} else {
												$grid.find('.delete_grid_item').hide();
												toggle_grid_remove_items = false;	
											}
										});
									}
									var column_template = $grid_template.find('#grid_column_template').first()[0].outerHTML;
									//var column_template = $(column_template).find('#grid_column_template').html("")[0].outerHTML;
									var row_template = $grid_template.find('#grid_row_template').first()[0].outerHTML;
									
									var $grid_container = $grid.find('#'+content_item.id+'_grid_template').first();
									$grid_container.attr('id', content_item.id+'_grid').html("");
									//for(var x in data) {
									var item_index = 0;
									var $row;
									var row_count = 0;
									var $column;
									var image_directory = 'images';
									if(typeof content_item.image_location !== 'undefined') {
										image_directory = content_item.image_location;	
									}
									
									var click_get_data = null;
									if(typeof content_item.click_get_data !== 'undefined') {
										click_get_data = {};
										for(var d in content_item.click_get_data) {											
											if(typeof page_data[d] !== 'undefined') {
												click_get_data[content_item.click_get_data[d]] = page_data[d];	
											}
										}
									}
									//var width_set = null;
									while(item_index < data.length) {
										var column_count = 0;
										while(column_count < 5 && item_index < data.length) {
											if(column_count == 0) {
												$grid_container.append(row_template);
												$row = $grid_container.find('#grid_row_template').first();
												$row.attr('id', row_count);	
												$row.html("");
												row_count++;
											}
											$row.append(column_template);
											$column = $row.find('#grid_column_template').first();
											$column.attr('id', data[item_index].id);
											if(typeof data[item_index].image !== 'undefined') {
												$column.append("<img src='"+image_directory+"/"+data[item_index].image+"' />");
												if(typeof content_item.image_max_size !== 'undefined') {
													$column.find('img').first().css('max-width', content_item.image_max_size);
												}
											}
											if(typeof data[item_index].icon !== 'undefined') {		
												$column.append("<i class='"+data[item_index].icon+" large_icon' />");
											}
											if(typeof data[item_index].title !== 'undefined') {
												$column.append("<br><span class='grid_item_title' style=''>"+data[item_index].title+"</span>");	//display:none;
											}
											
											$column.children().wrap("<a></a>");
																				
											if(typeof content_item.remove_items !== 'undefined') {
												$column.prepend("<i class='icofont-delete delete_grid_item' style='display:none;'></i>");
											}
											if(typeof content_item.click !== 'undefined') {
												$column.find('a').attr('href', branch.root.navigation.generate_href(content_item.click, null, data[item_index].id, click_get_data, content_item.target_frame));
											} else if(data[item_index].href !== 'undefined') {
												$column.find('a').attr('href', data[item_index].href);
											}
											
											if(typeof content_item.remove_items !== 'undefined') {
												(function(item_id) {
													$column.find('.delete_grid_item').click(function() {
														var post_data = {
															action: 'delete_'+content_item_id_singular
														};
														post_data.id = item_id;
														
														branch.root.post(branch.root.actions, post_data, function(data) {
															self.load();
														});
													});
												}(data[item_index].id));
											}
											/*if(typeof content_item.remove_items !== 'undefined') {
												var hover_timeout = null;
												$column.mouseover(function() {
													var $this = $(this);
													clearTimeout(hover_timeout);
													hover_timeout = setTimeout(function() {
														$this.find('.delete_grid_item').show();
													}, 2250);
												});
												$column.find('.delete_grid_item').mouseout(function() {
													$this = $(this);
													setTimeout(function() {
														clearTimeout(hover_timeout);
														$this.hide();
													}, 1250);
												});
											}*/
											/*.click(function() {
												branch.animation = content_item.animation;
												////alert(branch.animation);
											});*/
											
											column_count++;
											if(column_count == 5) {
												/*$row.find('img').each(function() {
													var width = $(this).width();
													var height = $(this).height();
													width_set = width;
													$(this).css({
														width: width+'px',
														height: height+'px'
													});
												});*/
												column_count = 0;	
											}
											item_index++;
										}
									}
									/*setTimeout(function() {
										$grid_container.find('.grid_item_title').fadeIn('fast');
									}, 2250);*/
									$grid_container.css({
										'width': '5%',
										'opacity': 0
									}).animate({
										'width': '100%',
										'opacity': 1
									}, 3500, 'easeInOutQuint', function() {
									});
									branch.loaded_objects[page.id].loaded();
								}, "json");
							}
						};
						var grid_object = {
							id: content_item.id,
							$element: $list,
							operation: grid_operation	
						};
						branch.root.elements.grids[content_item.id+"_grid"] = grid_object;
						grid_object.operation.load();
						break;
					case 'list':
						$container.append("<div id='"+content_item.id+"_list' class='list'></div>");
						var $list = $container.find('#'+content_item.id+"_list").first();
						$content_item_element = $list;
						var $search;
						if(typeof content_item.title !== 'undefined') {
							$list.append("<div class='title'>"+content_item.title+"</div>");	
						}
						var template_selector;
						var li_template;
						if(typeof content_item.custom !== 'undefined' && content_item.custom === true) {								
							template_selector = '#'+content_item.template+'_li_template';
							li_template = $('#templates > '+template_selector).first()[0].outerHTML;	
						}
						var target_frame = content_item.target;
						var target_frame_object = branch.root.eval_object_path(branch.root.find("elements.frames", target_frame), "this");
						var target_frame_depth = branch.root.depth(target_frame_object, branch.root.elements.frames, 0) - 1;
						$list.append("<div class='list_content'></div>");
						$list.append("<div class='list_load_button'>Load more items</div>");
						var $list_container = $list;
						var $list_load_button = $list_container.find('.list_load_button').first();
						$list = $list.find('.list_content');
						var image_root = "images";
						if(typeof content_item.image_location !== 'undefined') {
							image_root = content_item.image_location;	
						}
						var list_operation = {
							offset: 0,
							$list: $list,
							components: Array(),
							send_data: null,
							load: function(send_data, search_term) {
								var self = this;
								self.components = Array();
								/*if(typeof no_refresh === 'undefined') {
								}*/
								/*if(typeof no_refresh !== 'undefined') {
									$list = $('.dummy_div').first();	
								} else {
									$list = self.$list;	
								}*/
								if(typeof search_term === 'undefined') {
									search_term = '';	
								}
								var $list_values_container = self.$list;//branch.view.dummy_div.new();	//$('.dummy_div').first();
								//$list_values_container.html("");	
								var post_data = {
									action: content_item.id+"_list",
									search_term: search_term,
									offset: self.offset	
								};
								if(typeof content_item.default_values !== 'undefined') {
									for(var x in content_item.default_values) {
										post_data[x] = content_item.default_values[x];	
									}
								}
								/*if(typeof content_item.post_data !== 'undefined' && typeof page_data !== 'undefined') {
									for(var x in content_item.post_data) {
										if(typeof page_data[content_item.post_data[x]] !== 'undefined') {
											var statement = "post_data."+x+" = page_data."+content_item.post_data[x];
											eval(statement);
										}
									}
								}*/
								branch.apply_load_mask(post_data, content_item.post_data, page_data);
								if(typeof send_data !== 'undefined') {
									for(var x in send_data) {
										var statement = "post_data."+x+" = page_data."+send_data[x];
										eval(statement);	
									}
								}
								if(typeof post_data.search_field !== 'undefined') {
									var $search_field = $list.parent().find('.search_bar').find('.search').first();
									$search_field.val(post_data.search_field);
									if(content_item.search === true) {
										post_data.search_term = post_data.search_field;	
									}
									delete post_data.search_field;
								}
								this.send_data = post_data;
								branch.root.post(branch.root.actions, post_data, function(data) {
									//console.log(data);
									if(typeof content_item.column_projection !== 'undefined') {
										data = branch.column_projection(data, content_item.column_projection);
									}
									//console.log(data);
									self.list_data = data;
									//self.offset += data.length;
									var username_target_depth = 1;			
									if(typeof content_item.content !== 'undefined') {					
										if(typeof content_item.content.username !== 'undefined' && typeof content_item.content.username.target !== 'undefined') {
											username_target_depth = branch.root.navigation.frames.find_frame_depth(content_item.content.username.target);	
										}
									}
									$list_values_container.html("");	
									for(var x in data) {
										var list_item_href = "";
										if(typeof content_item.click !== 'undefined') {
											list_item_href = branch.root.navigation.generate_href(content_item.click, target_frame_depth, data[x].id);
										} else if(typeof content_item.custom_href !== 'undefined') {
											list_item_href = data[x].custom_href;
											delete data[x].custom_href;
										}
										
										
										if(typeof content_item.custom !== 'undefined' && content_item.custom === true) {
											var row_item = li_template;
											
											$list_values_container.append(row_item);
											
											var li_id = content_item.id+'_'+data[x].id;
											$list_values_container.find(template_selector).first().attr('id', li_id);
											var $li = $list_values_container.find('#'+li_id).first();
											for(var v in data[x]) {
												if(v.indexOf('_column_value') == -1) {
													var li_id_suffix = v;
													if(typeof content_item.class_mask !== 'undefined') {
														if(typeof content_item.class_mask[li_id_suffix] !== 'undefined') {
															li_id_suffix = content_item.class_mask[li_id_suffix];
														}
													}
													var $column = $li.find('.'+li_id_suffix).first();
													////console.log($column[0]);
													$column.html(data[x][v]);
													////console.log($column[0]);
													if(typeof data[x][v+'_column_value'] !== 'undefined') {
														$column.attr('value', data[x][v+'_column_value']);
													}
													////console.log($column[0]);
													
													if(typeof content_item.columns_click !== 'undefined') {
														if(typeof content_item.columns_click[v] !== 'undefined') {
															////console.log($column[0]);
															////console.log(content_item.columns_click[v]);
															if(content_item.columns_click[v] == 'click') {
																$column.html("<a href='"+list_item_href+"'>"+$column.html()+"</a>");
																////console.log($column.html());
															} else {
																var click_item = content_item.columns_click[v];
																var post_data = {
																	
																};
																var click_value = content_item.click;
																if(typeof click_item.click !== 'undefined') {
																	click_value = click_item.click;	
																}
																if(typeof click_item.post_data !== 'undefined') {
																	for(var p in click_item.post_data) {
																		if(click_item.post_data[p] == "value") {
																			post_data[p] = data[x][v];
																			if(typeof $column.attr('value') !== 'undefined') {
																				post_data[p] = $column.attr('value');	
																			}
																		} else if(typeof page_data !== 'undefined') {
																			post_data[p] == page_data[click_Item.post_data[p]];	
																		}
																	}
																}
																var id = null;
																if(typeof post_data.id !== 'undefined') {
																	id = post_data.id;
																	delete post_data.id;
																}
																var column_href = "";
																if(click_item.target == 'self') {
																	column_href = branch.root.navigation.generate_href(click_value, null, id, post_data, frame_id);	
																} else {
																	var target_frame_object_column = branch.root.eval_object_path(branch.root.find("elements.frames", click_item.target), "this");
																	var target_frame_depth_column = branch.root.depth(target_frame_object_column, branch.root.elements.frames, 0) - 1;
																	column_href = branch.root.navigation.gernerate_href(click_value, target_frame_depth_column, id, post_data, frame_id);
																}
																$column.html("<a href='"+column_href+"'>"+$column.html()+"</a>");
															}
														}
													}
												}
											}
										} else {
											var external_link;
											if(typeof data[x].external_link !== 'undefined') {
												external_link = data[x].external_link;
												delete data[x].external_link;
											}
											var row_item = "<div class='list_item' id='"+data[x].id+"'>";
											if(typeof data[x].title !== 'undefined') {
												if(list_item_href != "") {
													row_item += "<div class='title list_element'><a href='"+list_item_href+"'>"+data[x].title+"</a></div>";
												} else {
													row_item += "<div class='title list_element'>"+data[x].title+"</div>";
												}
												delete data[x].title;
											}
											if(typeof data[x].image !== 'undefined') {
												//row_item += "<div class='list_image' style='background-image:url("+image_root+"/"+data[x].image+")'></div>";	
												if(list_item_href != "") {
													row_item += "<a href='"+list_item_href+"'><img src='"+image_root+"/"+data[x].image+"' class='max_original_size' /></a>";
												} else {
													row_item += "<img src='"+image_root+"/"+data[x].image+"' class='max_original_size' />";
												}
												delete data[x].image;
											}
											var line_clamp = "";
											if(typeof content_item.clamp_content !== 'undefined') {
												line_clamp = "line_clamp";
											}
											if(typeof data[x].content !== 'undefined') {
												row_item += "<div class='content list_element "+line_clamp+"'>"+data[x].content+"</div>";
												delete data[x].content;
											}
											var row_id = data[x].id;
											delete data[x].id;
											if(typeof data[x].username !== 'undefined') {
												var user_href = branch.root.navigation.generate_href("user", username_target_depth, data[x].user_id);
												row_item += "<div class='username list_element'><a href='"+user_href+"'>"+data[x].username+"</a></div>";
												delete data[x].username;
												delete data[x].user_id;
											}
											if(typeof data[x].username !== 'undefined') {
												
												delete data[x].user_id;
											}
											var li_hide = false;
											//row_item += "<div class='list_item_information'>";
											var li_information_count = 0;
											for(var y in data[x]) {
												if(li_information_count > 0) {
													//row_item += "<div class='list_element column_split'>|</div>";	
												}
												
												var caption = "";
												var column_title = y;
												if(typeof content_item.columns !== 'undefined') {
													if(typeof content_item.columns[y] !== 'undefined') {
														if(typeof content_item.columns[y] !== 'object') {
															column_title = content_item.columns[y];	
														} else {
															if(typeof branch.root.language !== 'undefined') {
																column_title = content_item.columns[y][parseInt(branch.root.language)+1];	
															}
														}
													} else {
														//$row.hide();

													}
												}
												if(column_title != null) {
													caption = "<div class='caption'>"+column_title+"</div>";
												}
												if(typeof content_item.columns === 'undefined' || typeof content_item.columns[y] !== 'undefined') { 
													row_item += "<div class='list_element_wrap'>"+caption+"<div class='"+y+" list_element'>"+data[x][y]+"</div></div>";
													li_information_count++;
												}
												
											}
											/*if(typeof content_item.share_links !== 'undefined') {
												row_item += '<div class="sharethis-inline-share-buttons"></div>';	
											}*/
											row_item += "</div>";//</div>";
											$list_values_container.append(row_item);
											var $li = $list_values_container.find('#'+row_id).first();
											if(typeof content_item.link_item !== 'undefined') {
												$li.wrap("<a href='"+list_item_href+"'></a>");
											}
											if(li_hide) {
												//$li.hide();
											}
											if(typeof external_link !== 'undefined') {
												//////alert(data[x].external_link);
												$li.wrap("<a href='"+external_link+"'></a>");	
											}
										}
										if(typeof content_item.link_divs !== 'undefined') {
											for(var z in content_item.link_divs) {
												(function(z, $li) {
													if(content_item.link_divs[z] == 'wrap') {
														$li.find('.'+z).each(function() {
															var $this = $(this);
															$this.wrap("<a href='"+list_item_href+"'></a>");
														});
													} else {
														var $column = $li.find('.'+z).first();
														$column.html("<a href='"+list_item_href+"'>"+$column[0].innerHTML+"</a>"); 
													}
												}(z, $li));
											}
										}
										
										if(typeof content_item.components !== 'undefined') {
											self.components[x] = ({});
											for(var v in content_item.components) {
												(function($li, x, v, self) {
													self.components[x][v] = branch.root.components[content_item.components[v].type].new($li.find('.'+content_item.components[v].container).first(), data[x].id, content_item.id, self, content_item.components[v], page);
													self.components[x][v].init();
													self.components[x][v].load(data[x]);
												}($li, x, v, self));
											}
										}
									}
									
									if(typeof content_item.show_all_items === 'undefined' || content_item.show_all_items !== true) {
										var list_count_post_data = {
											action: content_item.id+"_list_count"	
										};
										if(self.send_data != null) {
											for(var y in self.send_data) {
												if(y.indexOf('_id') == y.length-3) {
													list_count_post_data[y] = self.send_data[y];
												}
											}
										}
										branch.root.post(branch.root.actions, list_count_post_data, function(data) {
											if(typeof data.result !== 'undefined') {
												data = data.result;
											}
											if(typeof data.__result !== 'undefined') {
												data = data.__result;
											}
											if(data <= self.list_data.length) { //data != '' &&
												$list_load_button.hide();	
											} else {
												$list_load_button.show();	
											}
										});
									} else {
										$list_load_button.hide();	
									}
									
									
									if(typeof content_item.date_columns !== 'undefined') {
										for(var c in content_item.date_columns) {
											(function(c) {
												var date_column_class = content_item.date_columns[c];
												var popover = true;
												var time = true;
												if(typeof date_column_class === 'object') {
													var date_column_object = date_column_class;
													date_column_class = date_column_class.class;	
													if(typeof date_column_object.popover !== 'undefined') {
														popover = date_column_object.popover;	
													}
													if(typeof date_column_object.time !== 'undefined') {
														time = date_column_object.time;	
													}
												}
												$list_values_container.find('.'+date_column_class).each(function() {
													if(!$(this).parent().hasClass('table_header')) {
														var $this = $(this);
														branch.view.date.date_cell($this, time, popover);
													}
												});
											}(c));
										}
									}
									
									//branch.view.display_changes(self.$list, $list_values_container);
									/*$list_values_container.find('.list_item_information').each(function() {				
										branch.root.interpretation.view.single_row_columns($(this));
									});*/
									if(typeof $search_field !== 'undefined') {
										$search_field.trigger('keyup');
									}
									branch.loaded_objects[page.id].loaded();
								}, "json");
							},
							scroll_call: function() {
								var scroll_point = $list.offset().top + $list.height();
								var scroll_bottom = $(document).scrollTop() + $(window).height();
								if(scroll_bottom > scroll_point-200) {
									//////alert(scroll_point);
									this.load(true);	
								}
							}
						};
						
						$list_load_button.click(function() {
							list_operation.offset += branch.list_addition_length;
							list_operation.load();
						});
						var list_object = {
							id: content_item.id,
							$element: $list,
							operation: list_operation	
						};
						branch.root.elements.lists[content_item.id+"_list"] = list_object;
						
						if(typeof content_item.search !== 'undefined') {
							$list.parent().prepend("<div class='search_bar'><input type='text' class='search' placeholder='search' /></div>");
							$search = $list.parent().find('.search_bar').find('.search').first();
							if(content_item.search != 'filter') {
								$search.keyup(function(e) {
									var search_term = $(this).val().toLowerCase().trim();
									if(search_term != "") {
										/*$list.find('.list_item').each(function() {
											if($(this).text().toLowerCase().indexOf(search_term) != -1) {
												$(this).show();	
											} else {
												$(this).hide();	
											}
										});*/							
										list_operation.load(null, search_term);
									} else {
										/*$list.find('.list_item').each(function() {
											$(this).show();
										});*/						
										list_operation.load();
									}
								});
							} else {
								$search.keyup(function(e) {
									var search_term = $(this).val().toLowerCase().trim();
									if(search_term != "") {
										$list.find('.list_item').each(function() {
											if($(this).text().toLowerCase().indexOf(search_term) != -1) {
												$(this).show();	
											} else {
												$(this).hide();	
											}
										});						
									} else {
										$list.find('.list_item').each(function() {
											$(this).show();
										});				
									}
								});	
							}
						}
						list_operation.load();
						
						/*$(window).scroll(function() {
							//////alert($(document).scrollTop());
							if(content_item.search !== 'undefined') {
								var search_term = $search.val().toLowerCase().trim();
								if(search_term == "") {
									list_operation.scroll_call();	
								}
							} else {
								list_operation.scroll_call();
							}
						});*/
						break;
					case 'table':
						var is_search_object = false;
						if(typeof content_item.search_object !== 'undefined') {
							is_search_object = true;
							if(typeof content_item.title !== 'undefined') {
								$container.append("<div class='title'>"+content_item.title+"</div>");	
							}
						}
						$container.append("<div><div id='"+content_item.id+"_table' class='table'></div></div>");
						(function($container) {
							var $list = $container.find('#'+content_item.id+"_table").first();
							if(typeof content_item.pagination !== 'undefined') {
								$list.parent().append("<div class='list_load_button'><!--<span class='pagination_previous'><i class='icofont-thin-left'></i></span>-->Page <input type='number' class='pagination_input' value='1' increment='1' /> of <span class='pagination_total_count'>1</span><!--<span class='pagination_next'><i class='icofont-thin-right'></i></span>--></div>");
							} else {
								$list.parent().append("<div class='list_load_button'>Load more items</div>");
							}
							if(typeof branch.main_color_rgb !== 'undefined') {
								//alert(branch.main_color_rgb);
								$list.css('background-color', branch.root.print_rgb(branch.main_color_rgb, 0.2));
							}
							var $list_load_button = $list.parent().find('.list_load_button').first();
							$content_item_element = $list;
							var $search;
							/*if(typeof content_item.search !== 'undefined') {
								$list.append("<div class='search_bar'><input type='text' class='search' placeholder='search' /></div>");
								if(content_item.search == 'filter') {
									$search = $list.find('.search_bar').find('.search').first();
									$search.keyup(function(e) {
										var search_term = $(this).val().toLowerCase().trim();
										if(search_term != "") {
											$list.find('.list_item').each(function() {
												if($(this).text().toLowerCase().indexOf(search_term) != -1) {
													$(this).show();	
												} else {
													$(this).hide();	
												}
											});
										} else {
											$list.find('.list_item').each(function() {
												$(this).show();
											});
										}
									});
								} else if(content_item.search == 'search') {
										
								}
							}*/
							if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true && typeof content_item.no_date_interval === 'undefined') {
								$list.parent().prepend("<div class='table_settings'><input type='text' placeholder='Date From' class='date_from datepicker' /><input type='text' placeholder='Date To' class='date_to datepicker' /><button class='filter'>Filter</button></div>");
								if(typeof content_item.no_default_from_date !== 'undefined') {

								} else {
									$list.parent().find('.table_settings .date_from').first().val(branch.root.date.get_ytd_value());
								}
							}
							var form_object;
							if(typeof content_item.target !== 'undefined') {
								form_object = branch.root.elements.find_element_object(content_item.target);
							}
							
							var image_directory = 'images';
							if(typeof content_item.image_location !== 'undefined') {
								image_directory = content_item.image_location;	
							}

							var init_order = function() {
								var order_values = Array();
								$list.children().each(function() {
									var id = $(this).find('.id').first().html();
									order_values.push(id);
								});
								branch.root.post(branch.root.actions, {
									'action': content_item.id+'_set_order',
									'v': JSON.stringify(order_values)
								}, function(data) {
								});
							};
							var save_order = function(dragged_value, dropped_value, list_object) {
								var order_values = Array();
								$list.children().each(function() {
									var id = $(this).find('.id').first().html();
									order_values.push(id);
								});
								var index_dragged = order_values.indexOf(dragged_value);
								order_values[index_dragged] = "-1";
								var index_dropped = order_values.indexOf(dropped_value);
								order_values.splice(index_dropped, 0, dragged_value);
								branch.root.post(branch.root.actions, {
									'action': content_item.id+'_set_order',
									'v': JSON.stringify(order_values)
								}, function(data) {
									list_object.load();
								});
							};
							var list_operation = {
								offset: 0,
								perist_send_data: null,
								$list: $list,
								components: Array(),
								send_data: null,
								pagination_page: 1,
								//order_direction: 'DESC',
								//order_column: 'created',
								widths: {},
								load: function(send_data, search_string, deny_on_load) {
									//alert('load');
									var self = this;
									self.components = Array();
									//if(typeof no_refresh === 'undefined' && no_refresh != false) {
										//$list.html("");	
									//}
									if(typeof search_string === 'undefined') {
										search_string = '';	
									}
									var $list_values_container = self.$list;//branch.view.dummy_div.new();//= $('.dummy_div').first();
									var post_data = {
										action: content_item.id+"_table",
										search_term: search_string,
										offset: self.offset	
									};
									/*if(typeof content_item.post_data !== 'undefined' && typeof page_data !== 'undefined') {
										for(var x in content_item.post_data) {
											if(content_item.post_data[x] == "null") {
												post_data[x] = null;	
											} else {
												var statement = "post_data."+x+" = page_data."+content_item.post_data[x];
												////console.log(statement);
												eval(statement);
											}
										}
									}*/
									if(typeof content_item.consolidate_post_data !== 'undefined') {
										post_data.post_data = {};
										post_data.app_id = branch.root.app_id;
										branch.apply_load_mask(post_data.post_data, content_item.post_data, page_data);
									} else {
										branch.apply_load_mask(post_data, content_item.post_data, page_data);
									}
									if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true  && typeof content_item.no_date_interval === 'undefined') {
										var date_from = $list.parent().find('.table_settings').find('.date_from').val();
										var date_to = $list.parent().find('.table_settings').find('.date_to').val();
										if(date_from.length > 0 || date_to.length > 0) {
											post_data.__date_interval = {
											};
											if(date_from.length > 0) {
												post_data.__date_interval.date_from = date_from;
											}
											if(date_to.length > 0) {
												post_data.__date_interval.date_to = date_to;
											}
										}
									}
									if(typeof send_data === 'undefined') {
										if(this.persist_send_data != null) {
											send_data = this.persist_send_data;	
										}
									}
									if(typeof send_data !== 'undefined') {
										for(var x in send_data) {
											post_data[x] = send_data[x];	
										}
										self.persist_send_data = send_data;
									}
									/*if(typeof self.pagination_page !== 'undefined') {
										post_data.pagination_page = self.pagination_page;
										post_data.pagination_item_count = content_item.pagination_item_count;
									}*/
									if(typeof content_item.pagination !== 'undefined') {
										post_data.offset = (self.pagination_page-1) * content_item.pagination_item_count;
										post_data.item_offset_limit = content_item.pagination_item_count;
									}
									if(typeof content_item.resize !== 'undefined') {
										post_data.order_column = self.order_column;
										post_data.order_direction = self.order_direction;
									}
									self.send_data = post_data;
									if(typeof branch.root.view_containers_table_index !== 'undefined') {
										branch.root.view_containers_table_index.set_view_constraint(post_data.action, post_data);
									}
									branch.root.post(branch.root.actions, post_data, function(data) {
										console.log('table_data: '+post_data.action);
										console.log(data);
										self.list_data = data;
										$list_values_container.html("");	
										//self.offset += data.length;
										if(data.length > 0) {
											var x = 0;
											if(typeof data[x].id === 'undefined') {
												content_item.no_id = true;	
											}
										}
										//for(var y in data[x]) {
										if(typeof content_item.no_header === 'undefined') {
											var row_item = "<div class='table_row table_header' id='header'>";
											var li_information_count = 0;
											row_item += "<div class='id table_column' style='display:none;'></div>";
											for(var y in content_item.columns) {
												if(y != 'id') {
													var style = "";
													if(li_information_count == 0) {
														//row_item += "<div class='list_element column_split'>|</div>";	
														style = "border-left:none;";
													}
													row_item += "<div id='"+y+"' class='"+y+" table_column' style='"+style+"'>"+content_item.columns[y]+"</div>";
													li_information_count++;
												}
											}	
													
											if(typeof content_item.edit !== 'undefined') {
												row_item += "<div id='edit_button' class='action table_column' style=''>Action</div>";	
											}				
											if(typeof content_item.delete !== 'undefined') {
												row_item += "<div id='delete_button' class='action table_column' style=''>Action</div>";	
											}			
											if(typeof content_item.custom_actions !== 'undefined') {
												var action_column = "Action";
												for(var x in content_item.custom_actions) {
													
													if(typeof content_item.custom_columns !== 'undefined') {
														action_column = content_item.custom_columns[x];	
													}
													row_item += "<div id='"+x+"' class='custom_action table_column' style=''>"+action_column+"</div>";
												}
											}
											row_item += "</div></div>";	
											$list_values_container.append(row_item);	

											if(data.length == 0) {
												row_item = "<div class='no_rows'>No rows in this table</div>";
												$list_values_container.append(row_item);
											}			
										}

										for(var x in data) {
											//function(
											if(typeof data[x].id === 'undefined') {
												data[x].id = x;
												data[x].id_undefined = true;	
											}
											if(typeof content_item.column_order !== 'undefined') {
												var column_order = content_item.column_order;
												var store = data[x];
												data[x] = {};
												for(var i in column_order) {
													data[x][column_order[i]] = store[column_order[i]];
												}
											}
											var row_item = "<div class='table_row' id='"+data[x].id+"'>";
											var li_information_count = 0;
											row_item += "<div id='id' class='id table_column' style='display:none;'>"+data[x].id+"</div>";
											if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
												for(var y in content_item.columns) {
													var style = "";
													var class_value = 'table_column';
													if(li_information_count == 0) {
														//row_item += "<div class='list_element column_split'>|</div>";	
														style = "border-left:none;";
													}
													/*if(typeof content_item.column_mask !== 'undefined') {
														if(typeof content_item.column_mask[y] !== 'undefined' && content_item.column_mask[y] == 'hidden') {
															style += "display:none;";	
														}
													}*/
													if(typeof content_item.columns[y] === 'undefined') {
														style += "display:none;";	
														class_value = 'table_column_hidden';
													}
													var column_value = "";
													if(y == 'user_id') {
														row_item += "<div id='"+y+"' class='"+y+" "+class_value+"' style='"+style+"'>"+"<span class='email' id='"+data[x][y]+"_user'>"+"</span></div>"
													} else if(typeof content_item.content !== 'undefined' && typeof content_item.content[y] !== 'undefined') {
														if(content_item.content[y] == 'image') {
															column_value = data[x][y]+".png";
															row_item += "<div id='"+y+"' class='"+y+" "+class_value+" table_column_image' style='"+style+" background-image:url(\""+image_directory+"/"+column_value+"\");'>"+"</div>";	
														} else if(content_item.content[y] == 'checkbox') {
															var checked = data[x][y];
															if(checked) {
																checked = "checked";	
															} else {
																checked = "";	
															}
															row_item += "<div id='"+y+"'  class='"+y+" "+class_value+"' ><input type='checkbox' class='"+y+"_checkbox' "+checked+" /></div>";	
														}
													} else {
														column_value = data[x][y];
														if(y == 'bulletin') {
															column_value = "<i class='icofont-ui-press' style='color:hsl("+column_value+")'></i>";	
														}
														row_item += "<div id='"+y+"' class='"+y+" "+class_value+"' style='"+style+"'>"+column_value+"</div>";
													}
													li_information_count++;
												}
											} else {
												for(var y in data[x]) {
													if(y != 'id') {
														var style = "";
														var class_value = 'table_column';
														if(li_information_count == 0) {
															//row_item += "<div class='list_element column_split'>|</div>";	
															style = "border-left:none;";
														}
														/*if(typeof content_item.column_mask !== 'undefined') {
															if(typeof content_item.column_mask[y] !== 'undefined' && content_item.column_mask[y] == 'hidden') {
																style += "display:none;";	
															}
														}*/
														if(typeof content_item.columns[y] === 'undefined') {
															style += "display:none;";	
															class_value = 'table_column_hidden';
														}
														var column_value = "";
														if(typeof content_item.columns[y] !== 'undefined' && y == 'user_id') {
															row_item += "<div id='"+y+"' class='"+y+" "+class_value+"' style='"+style+"'>"+"<span class='email' id='"+data[x][y]+"_user'>"+"</span></div>"
														} else if(typeof content_item.content !== 'undefined' && typeof content_item.content[y] !== 'undefined') {
															if(content_item.content[y] == 'image') {
																column_value = data[x][y]+".png";
																row_item += "<div id='"+y+"' class='"+y+" "+class_value+" table_column_image' style='"+style+" background-image:url(\""+image_directory+"/"+column_value+"\");'>"+"</div>";	
															} else if(content_item.content[y] == 'checkbox') {
																var checked = data[x][y];
																if(checked) {
																	checked = "checked";	
																} else {
																	checked = "";	
																}
																row_item += "<div id='"+y+"'  class='"+y+" "+class_value+"' ><input type='checkbox' class='"+y+"_checkbox' "+checked+" /></div>";	
															}
														} else {
															column_value = data[x][y];
															if(y == 'bulletin') {
																column_value = "<i class='icofont-ui-press' style='color:hsl("+column_value+")'></i>";	
															}
															row_item += "<div id='"+y+"' class='"+y+" "+class_value+"' style='"+style+"'>"+column_value+"</div>";
														}
														li_information_count++;
													}
												}
											}
											row_item += "</div></div>";
											$list_values_container.append(row_item);
											var $row = $list_values_container.find('.table_row#'+data[x].id).first();
											if(typeof content_item.on_click !== 'undefined') {
												var get_data = {
													id: data[x].id
												};
												var href = branch.root.navigation.generate_href(content_item.on_click, null, null, get_data, content_item.target_frame); 
												$row.find('.table_column').each(function() {
													if(!$(this).hasClass('table_column_image')) {
														var text = $(this).text();
														var link_replacement = "<a href='"+href+"'>"+text+"</a>";
														$(this).html(link_replacement);	
													}
												});
											}
											if(typeof data[x].href !== 'undefined') {
												var href = data[x].href;
												$row.find('.table_column').each(function() {
													if(!$(this).hasClass('table_column_image')) {
														var text = $(this).text();
														var link_replacement = "<a href='"+href+"'>"+text+"</a>";
														$(this).html(link_replacement);	
													}
												});	
											}
											if(typeof content_item.edit !== 'undefined') {
												$row.append("<div id='edit_button' class='edit_button table_column'><i class='icofont-ui-edit'></i> Edit</div>");
												(function(data){
													$row.find('.edit_button').click(function() {
														var $this = $(this);
														$this.addClass('saved');
														setTimeout(function() {
															$this.removeClass('saved');
														}, 500);
														if(typeof data.id_undefined === 'undefined') {
															branch.root.post(branch.root.actions, {
																action: 'get_'+content_item_id_singular,
																id: data.id	
															}, function(data) {
																form_object.operation.load(data);
															}, "json");
														} else {
															form_object.operation.load(data);
														}
													});
												}(data[x]));
											}
											if(typeof content_item.delete !== 'undefined') {
												$row.append("<div id='delete_button' class='delete_button table_column'><i class='icofont-trash'></i> Delete</div>");	
												(function(data){
													$row.find('.delete_button').click(function() {
														var post_data = {
															action: 'delete_'+content_item_id_singular
														};
														if(typeof content_item.no_id !== 'undefined') {
															for(var x in data) {
																post_data[x] = data[x];	
															}
														} else {
															post_data.id = data.id;	
														}
														branch.root.post(branch.root.actions, post_data, function(data) {
															self.load();
														});
													});
												}(data[x]));
											}
											if(typeof content_item.custom_actions !== 'undefined') {
												(function(data){
													for(var action_name in content_item.custom_actions) {
														var href = "";
														if(typeof content_item.custom_actions[action_name].target_href !== 'undefined') {
															var send_data = {};
															for(var i in content_item.custom_actions[action_name].href_data) {
																var href_data_index = content_item.custom_actions[action_name].href_data[i];
																send_data[i] = data[href_data_index];	
																//delete data[href_data_index];
															}
															if(content_item.custom_actions[action_name].target_href !== 'self') {
																if(typeof content_item.custom_actions[action_name].target_frame !== 'undefined') {
																	href = branch.root.navigation.generate_href(content_item.custom_actions[action_name].target_href, null, null, send_data, content_item.custom_actions[action_name].target_frame);
																} else {
																	href = branch.root.navigation.navigate_to(content_item.custom_actions[action_name].target_href, send_data, true);
																}
															} else {
																	
															}
														}
														var action_value = action_name;
														if(typeof content_item.custom_actions[action_name].value !== 'undefined') {
															action_value = content_item.custom_actions[action_name].value;
														}
														var is_checkbox = false;
														if(action_value == "checkbox") {
															is_checkbox = true;
															action_value = '<input type="checkbox" id="'+action_name+'" />';	
														}
														if(href == "") {
															$row.append("<div id='"+action_name+"' class='custom_action table_column'>"+action_value+"</div>");
														} else {
															$row.append("<div id='"+action_name+"' class='custom_action table_column'><a href='"+href+"'>"+action_value+"</a></div>");	
														}
														var $row_action_item = null;
														if(typeof content_item.custom_actions[action_name].defined_action !== 'undefined') {
															$row_action_item = $row.find('#'+action_name).first();
															switch(content_item.custom_actions[action_name].defined_action) {
																case 'download':	
																	$row_action_item.click(function() {
																		var send_download_data = {};
																		for(var i in content_item.custom_actions[action_name].href_data) {
																			var href_data_index = content_item.custom_actions[action_name].href_data[i];
																			send_download_data[i] = data[href_data_index];	
																		}
																		var files_table = null;
																		if(typeof content_item.custom_actions[action_name].files_table !== 'undefined') {
																			files_table = content_item.custom_actions[action_name].files_table;
																		}
																		branch.root.download.download_file(send_download_data, content_item_id_singular, files_table);
																	});
																	break;
															}
														}
														var $row_input;
														if(is_checkbox) {
															$row_input = $row.find('input#'+action_name);
															if(data[action_name]) {
																$row_input.first().prop('checked', true);	
															}
														}
														if(typeof content_item.custom_actions[action_name].action !== 'undefined') {
															$row_input.click(function() {
																branch.root.post(branch.root.actions, {
																	'action': content_item.custom_actions[action_name].action,
																	'id': data.id,
																	'completed': ($row_input.prop('checked') ? 1 : 0)
																}, function(data) {
																	if(typeof content_item.on_load !== 'undefined') {
																		branch.on_load(content_item);
																	}
																});
															});
														}
														/*$row.find('.delete_button').click(function() {
															var post_data = {
																action: 'delete_'+content_item_id_singular
															};
															if(typeof content_item.no_id !== 'undefined') {
																for(var x in data) {
																	post_data[x] = data[x];	
																}
															} else {
																post_data.id = data.id;	
															}
															$.post(branch.root.actions, post_data, function(data) {
																self.load();
															});
														});*/
													}
												}(data[x]));
											}
											if(typeof content_item.content !== 'undefined') {
												(function($row) {
													for(var c in content_item.content) {
														switch(content_item.content[c]) {
															case 'checkbox':
																(function(c, $row) {
																	$row.find('.'+c+'_checkbox').click(function() {
																		var checked = $(this).prop('checked');
																		if(checked) {
																			checked = "1";	
																		} else {
																			checked = "0";	
																		}
																		//var $this = $(this);
																		branch.root.post(branch.root.actions, {
																			'action': c+'_checked',
																			'item_id': $row.find('#id').text(),
																			'checked': checked
																		}, function(data) {
																		});
																	});
																}(c, $row));
																break;	
														}
													}
												}($row));
											}
											if(typeof content_item.drag_reorder !== 'undefined') {
												(function(data) {
													$row.attr('draggable', 'true');
													$row.on('drop', function(event) {
														event.preventDefault();  
														event.stopPropagation();
														event.dataTransfer = event.originalEvent.dataTransfer;
														var id = event.dataTransfer.getData("id");
														save_order(id, data.id, self)
													});
													$row.on('dragstart', function drag(event) {
														event.dataTransfer = event.originalEvent.dataTransfer;
														event.dataTransfer.setData("id", event.target.id);
													});
													$row.on('dragover', function(event) {
														event.preventDefault();
													});
												}(data[x]));
												//$row.append("<div class='table_column drag' id='drag'><i class='icofont-navigation-menu'></i></div>");
											}
											var $li = $row;
											
											if(typeof content_item.components !== 'undefined') {
												self.components[x] = ({});
												for(var v in content_item.components) {
													self.components[x][v] = branch.root.components[content_item.components[v].type].new($li.find('.'+v).first(), data[x].id, content_item.id, self);
													self.components[x][v].init();
												}
											}
										}
											
										if(typeof content_item.date_columns !== 'undefined') {
											for(var c in content_item.date_columns) {
												(function(c) {
													var date_column_class = content_item.date_columns[c];
													var popover = true;
													var time = true;
													if(typeof date_column_class === 'object') {
														var date_column_object = date_column_class;
														date_column_class = date_column_class.class;	
														if(typeof date_column_object.popover !== 'undefined') {
															popover = date_column_object.popover;	
														}
														if(typeof date_column_object.time !== 'undefined') {
															time = date_column_object.time;	
														}
													}
													$list_values_container.find('.'+date_column_class).each(function() {
														if(!$(this).parent().hasClass('table_header')) {
															var $this = $(this);
															branch.view.date.date_cell($this, time, popover);
														}
													});
												}(c));
											}
										}
										if(typeof content_item.column_width !== 'undefined') {
											//for(var w in content_item.column_width) {
											$list_values_container.find('.table_row').each(function() {
												//////alert($(this).attr('id'));
												$(this).children().each(function() {
													var index = $(this).attr('id');
													//////alert(index);
													//////alert($(this).html());
													//////alert(content_item.column_width[index]);
													$(this).css('width', content_item.column_width[index]);
												});
											});
										} else {
											/*$list_values_container.find('.table_row').each(function() {				
												branch.root.interpretation.view.single_row_columns($(this), true);
											});*/
										}
										if(typeof content_item.extra_class !== 'undefined') {
											$list_values_container.find('.table_row').each(function() {
												var $this = $(this);
												if(!$this.hasClass('table_header')) {
													for(var c in content_item.extra_class) {
														//alert(content_item.extra_class[c]);
														var selector_c = $.escapeSelector(c);
														//alert(c);
														$this.find('.'+selector_c).first().addClass(content_item.extra_class[c]);
														//alert($this.find('.'+c).length);	
													}
												}
											});
										}
										//branch.root.interpretation.view.single_row_columns($list_values_container.find('.table_row'), true);
										
										
										
										/*branch.view.display_changes(self.$list, $list_values_container, function() {
											if(typeof content_item.drag_reorder !== 'undefined') {
												init_order();	
											}
										});*/
										if(typeof content_item.drag_reorder !== 'undefined') {
											init_order();	
										}
										
										if(typeof content_item.show_all_items === 'undefined' || content_item.show_all_items !== true) {
											var list_count_post_data = {
												action: content_item.id+"_list_count",
												post_data: {}	
											};
											if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
												list_count_post_data.action = content_item.id+'_table_count';
											}
											if(typeof content_item.pagination !== 'undefined') {
												list_count_post_data.pagination_item_count = 10;
												if(typeof content_item.pagination_item_count !== 'undefined') {
													list_count_post_data.pagination_item_count = content_item.pagination_item_count;
												}
												//list_count_post_data.pagination_page = $list_load_button.find('.pagination_input').first().val();
											}
											/*if(self.send_data.post_data) {
												list_count_post_data.post_data = self.send_data.post_data;
											} else*/ 
											if(self.send_data != null) {
												for(var y in self.send_data) {
													if(y.indexOf('_id') == y.length-3) {
														if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {

															list_count_post_data[y] = self.send_data[y];
														} else {
															list_count_post_data.post_data[y] = self.send_data[y];
														}
													}
												}
											}
											branch.root.post(branch.root.actions, list_count_post_data, function(data) {
												if(typeof data.result !== 'undefined') {
													data = data.result;
												}
												if(typeof data.__result !== 'undefined') {
													data = data.__result;
												}
												if(typeof content_item.pagination === 'undefined') {
													if(data <= self.list_data.length || data == -1) {
														$list_load_button.hide();	
													} else {
														$list_load_button.show();	
													}
												} else {
													$list_load_button.find('.pagination_total_count').first().html(data);
												}
											});
										} else {
											$list_load_button.hide();	
										}
										
										if(typeof content_item.on_load !== 'undefined' && !deny_on_load) {
											branch.on_load(content_item);
										}
										if(typeof content_item.resize !== 'undefined') {
											$list_values_container.find('.table_header').children().each(function() {
												var $this = $(this);
												$this.addClass('ui-widget-content');
												$this.resizable({
													 //handles: 'e, w'
													 maxHeight: 35,
													 stop: function() {
													 	self.widths[$this[0].id] = $this.width()
													 }
												});
												$this.click(function() {
													var column_id = $this.attr('id');
													if(column_id.indexOf('button') == -1) {
														if(self.order_column == column_id) {
															if(self.order_direction == 'DESC') {
																self.order_direction = 'ASC';
															} else {
																self.order_direction = 'DESC';
															}
														} else {
															self.order_column = column_id;
														}
													}
													self.load();
												});
												if(typeof self.widths[this.id] !== 'undefined') {
													$this.width(self.widths[this.id]);
												}
											});

										}
										branch.root.get_user_information.get_emails($list_values_container);
										branch.loaded_objects[page.id].loaded();
									}, "json"); //
								},
								scroll_call: function() {
									/*var scroll_point = $list.offset().top + $list.height();
									var scroll_bottom = $(document).scrollTop() + $(window).height();
									if(scroll_bottom > scroll_point-200) {
										//////alert(scroll_point);
										this.load(true);	
									}*/
								}
							};
							if(typeof content_item.pagination !== 'undefined') {
								$list_load_button.find('.pagination_input').on('change', function() {
									var $this = $(this);
									var max_value = $list_load_button.find('.pagination_total_count').first().html();
									if(parseInt($this.val()) > parseInt(max_value) || parseInt($this.val()) <= 0) {
										$this.val(max_value);
									}
									list_operation.pagination_page = $this.val();

									list_operation.load();
								});
							} else {
								$list_load_button.click(function() {
									list_operation.offset += branch.list_addition_length;
									list_operation.load();
								});
							}
							
							if(typeof content_item.search !== 'undefined' && typeof content_item.search_object === 'undefined') {
								$list.parent().prepend("<div class='search_bar'><input type='text' class='search' placeholder='search' /></div>");
								$search = $list.parent().find('.search_bar').find('.search').first();
								$search.keyup(function(e) {
									var search_term = $(this).val().toLowerCase().trim();
									if(search_term != "") {
										if(content_item.search == 'filter') {
											$list.find('.table_row').each(function() {
												if(!$(this).hasClass('table_header')) {
													if($(this).text().toLowerCase().indexOf(search_term) != -1) {
														$(this).show();	
													} else {
														$(this).hide();	
													}
												}
											});
										} else {
											list_operation.load(null, search_term);
										}
									} else {
										if(content_item.search == 'filter') {
											$list.find('.table_row').each(function() {
												$(this).show();
											});	
										} else {
											list_operation.load();
										}
									}
								});
							}
							$list.parent().find('.table_settings').find('.filter').first().click(function() {
								list_operation.load();
							});
							if(typeof content_item.require_foreign_id === 'undefined') {
								list_operation.load();
							} else {
								branch.loaded_objects[page.id].loaded();
							}
							/*$(window).scroll(function() {
								//////alert($(document).scrollTop());
								if(content_item.search !== 'undefined') {
									var search_term = $search.val().toLowerCase().trim();
									if(search_term == "") {
										list_operation.scroll_call();	
									}
								} else {
									list_operation.scroll_call();
								}
							});*/
							var table_object = {
								id: content_item.id,
								$element: $list,
								operation: list_operation
							};
							
							if(!is_search_object) {
								branch.root.elements.tables[content_item.id+"_table"] = table_object;
							} else {
								branch.root.elements.search_elements[content_item.id+"_table"] = table_object;
							}
						}($container));
						break;
					case 'form':
						(function(content_item) {
							////alert('create_form');
							$container.append("<div id='"+content_item.id+"_form' class='form'></div>");
							var $form = $container.find('#'+content_item.id+'_form');
							$content_item_element = $form;
							if(typeof content_item.no_primary_id === 'undefined') {
								$form.append("<input type='hidden' id='id' class='id form_input optional_field' value='-1' />");
							}
							if(typeof content_item.title !== 'undefined') {
								$form.append("<div class='title'>"+content_item.title+"</div>");
							}
							//branch.main_color_rgb
							if(typeof branch.main_color_rgb !== 'undefined') {
								//alert(branch.main_color_rgb);
								$form.css('background-color', branch.root.print_rgb(branch.main_color_rgb, 0.27));
							}
							//
							//var random_id = Math.random();
							////alert('new random id: '+random_id);
							var form_object = {
								$element: $form,
								element_loaded_count: 0,
								//random_id: random_id,
								operation: {
									element_loaded_count: 0,
									elements: Array(),
									code_elements: Array(),
									/*find_element: function(reference) {
										
									},*/
									last_set_data: null,
									load: function(data, callback, callback_2) {
										var self = this;
										////alert(self.parent.random_id);
										////console.log('load form');
										////console.log(data);
										//self.element_loaded_count = 0;
										if(data === 'self') {
											data = {};
											$form.find('.form_input').each(function() {
												if($(this).hasClass('rich_text')) {
													data[this.id] = tinyMCE.get(id).getContent();	
												} else {
													data[this.id] = $(this).val();
												}
											});
										}
										
										$form.find('.form_input').each(function() {
											var id = $(this).attr('id');
											if($(this).hasClass('rich_text')) {
												tinyMCE.get(id).setContent("");
											} else if(!$(this).hasClass('ignore_reset') && !$(this).hasClass('persist_value')) {
												if(typeof $(this).data("default_value") !== 'undefined') {
													$(this).val($(this).data("default_value")).trigger("change");	
												} else if(typeof $(this).attr("default_value") !== 'undefined') {
													$(this).val($(this).attr("default_value")).trigger("change");	
												} else {
													$(this).val("").trigger('change');
												}
											}
										});
										for(var x in this.code_elements) {
											this.code_elements[x].operation.load(null);
										}
										$form.find('input[type=hidden]').each(function() {
											if(!$(this).hasClass('ignore_reset') && !$(this).hasClass('persist_value')) {
												$(this).val("-1").trigger('change');
											}
										});
										$form.find('input[type=checkbox]').each(function() {
											$(this).prop('checked', false);
										});
										if(typeof data !== 'undefined') {
											for(var x in data) {
												var $set_element = self.root.$element.find('#'+x);
												if($set_element.hasClass('rich_text')) {
													var id = $set_element.attr('id');
													tinyMCE.get(id).setContent(data[x]);
												} else if($set_element.hasClass('checkbox')) {
													if(data[x] == 1) {
														$set_element.prop('checked', true);	
													} else {
														$set_element.prop('checked', false);
													}
												} else {
													if($set_element.length > 0 && $set_element[0].type == 'select') {
														if($set_element.find('option[value="'+data[x]+'"]').length == 0) {
															$set_element.attr('next_value', data[x]);
														}
													}
													if(data[x] == '') {

													} else {
														$set_element.val(data[x]).attr('next_value', data[x]).trigger('change');
													}	
												}
											}

											for(var x in this.code_elements) {
												this.code_elements[x].operation.load(data[x]);
											}
											$form.find('.json_content.json_is_parsed').removeClass('json_is_parsed');
											self.last_set_data = data;
										}
										if(typeof data === 'undefined') {
											var element_length = branch.root.get_length(self.elements);
											for(var x in this.elements) {
												this.elements[x].operation.load(undefined, function() {
													//////alert(this.$element[0]);
													self.element_loaded_count++;
													if(self.element_loaded_count == element_length && typeof callback !== 'undefined') {
														////console.log('final callback');
														//////console.log($form.find('select').first()[0].innerHTML);
														callback(self);	
													}
												});	
											}
											if(element_length == 0 && typeof callback !== 'undefined') {
												////console.log('final callback');
												callback(self);
											}
										}
										if(typeof callback_2 !== 'undefined') {
											var element_length = branch.root.get_length(self.elements);
											//////alert(self.element_loaded_count);
											if(self.element_loaded_count == element_length && typeof callback_2 !== 'undefined') {
												//////console.log('final');
												//////console.log($form.find('select').first()[0].innerHTML);
												callback_2(self);	
											}
											if(element_length == 0 && typeof callback_2 !== 'undefined') {
												callback_2(self);
											}
										}
										if(typeof data === 'undefined') {
											data = {
												
											}
											self.root.$element.find('.form_input').each(function() {
												var id = $(this).attr('id');
												data[id] = $(this).val();
											});
										}
										for(var x in content_item.on_load) {
											var callback_item_reference = content_item.on_load[x];
											var callback_object = branch.root.elements.find_element_object(callback_item_reference);
											var send_data = {
												//id: data.id	
											};
											if(typeof content_item.on_load_load_mask !== 'undefined') {
												for(var x in content_item.on_load_load_mask) {
													if(x.indexOf("'") !== -1) {
														x = x.split("'").join('');
														send_data[content_item.on_load_load_mask[x]] = x;	
													} else {
														send_data[content_item.on_load_load_mask[x]] = data[x];
													}
												}
											}
											callback_object.operation.load(send_data);
										}
										$form.find('.json_content').each(function() {
											var $this = $(this);
											$this.keyup(function() {
												var value = $this.val();
												try {
													value = JSON.parse(value);
													$this.removeClass('invalid');
													//console.log(value);


												} catch(exc) {
													//console.log(exc);
													$this.addClass('invalid');
												}
											});
											if(!$this.hasClass('json_is_parsed')) {
												var value = $this.val();
												////alert(value);
												try {
													value = JSON.parse(value);
													////alert(value);
													//value = JSON.stringify(value, null, 4);
													////alert(value);
													$this.val(value);
												} catch(exc) {

												}
												$this.addClass('json_is_parsed');
											}
										});
										this.conditionals();
									},
									condition_valid: true,
									condition_validation: Array(),
									conditionals: function() {
										var self = this;
										for(var y in content_item.content) {
											var form_item = content_item.content[y];
											var $form_element = $form.find('#'+form_item.id);
											if(typeof form_item.conditions !== 'undefined') {
												//////alert('conditionals');
												//////alert(form_item.conditions.length);
												self.condition_validation[form_item.id] = Array();
												for(var x in form_item.conditions) {
													var condition_object = form_item.conditions[x];
													
													self.condition_validation[form_item.id][condition_object] = true;
													
													var $element = $form.find('#'+condition_object).first();
													
													//////alert('#'+condition_object);
													//////alert('value condition object: '+$element.val());
													if($element.val().trim() == "" || $element.val() == "-1") {
														self.condition_validation[form_item.id][condition_object] = false;
													}
													$element.change(function() {
														//////alert("changed: "+$(this).val());
														if($(this).val().trim() == "" || $(this).val() == "-1") {
															self.condition_validation[form_item.id][condition_object] = false;
														} else {
															self.condition_validation[form_item.id][condition_object] = true;	
														}
														var condition_valid = true;
														for(var k in self.condition_validation[form_item.id]) {
															if(!self.condition_validation[form_item.id][k]) {
																condition_valid = false;	
															}
														}
														if(condition_valid) {
															$form_element.removeAttr('disabled');	
														} else {
															$form_element.prop('disabled', 'true');	
														}
													});
													$element.trigger('change');
												}
												/*(function($form_element) {
													self.watch("condition_valid", function(obj, old_value, new_value) {
														//////alert('watch changed');
														//////alert("old: "+old_value);
														//////alert("new: "+new_value);
														if(!new_value) {
															$form_element.prop('disabled', 'true');	
														} else {
															$form_element.removeAttr('disabled');	
														}
													});
												}($form_element));*/
											}
										}
									}
								}
							};
							var form_elements = content_item.content;
							for(var x in form_elements) {
								var form_element = form_elements[x];
								var $input;
								var $input_extra;
								(function(form_element, form_object) {
									if(typeof form_element.post_data !== 'undefined') {
										for(var z in form_element.post_data) {
											var post_data_item = form_element.post_data[z];
											if(post_data_item.indexOf('.') !== -1) {
												var split = post_data_item.split('.');
												var form_name_id = split[0];
												var form_element_name = split[1];
												////console.log(split);
												if(form != 'page_data') {
													if(typeof form_element_linked_elements[form_name_id] === 'undefined') {
														form_element_linked_elements[form_name_id] = {};	
													}
													if(typeof form_element_linked_elements[form_name_id][form_element_name] === 'undefined') {
														form_element_linked_elements[form_name_id][form_element_name] = Array();	
													}
													form_element_linked_elements[form_name_id][form_element_name].push({ element_name: form_element.id, form_name: content_item.id });
												}
											}
										}
									}
									var form_element_attributes = "";
									if(typeof form_element.regex !== 'undefined') {
										form_element_attributes += ' pattern="'+form_element.regex+'" '
									}
									if(typeof form_element.placeholder === 'undefined') {
										form_element.placeholder = form_element.id;
									}

									switch(form_element.type) {
										case 'typeahead':
											$form.append("<div class='form_element typeahead'><input type='hidden' class='hidden form_input optional_field' id='"+form_element.id+"_id' value='-1' /><input type='text' id='"+form_element.id+"' class='form_input'   autocomplete='off' placeholder='"+form_element.placeholder+"' /><div class='suggestions'></div></div>");
											$input = $form.find('#'+form_element.id).first();
											(function($input, form_object) {
												var typeahead_object = {
													$element: $input,
													operation: {
														suggestion_data: Array(),
														init: function() {
															var self = this;
															var $hidden_id = $input.parent().find('#'+form_element.id+'_id').first();
															var $hidden = $hidden_id;
															MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
															var trackChange = function(element) {
																var observer = new MutationObserver(function(mutations, observer) {
																	if(mutations[0].attributeName == "value") {
																		$(element).trigger("change");
																	}
																});
																observer.observe(element, {
																	attributes: true
																});
															}
															//var $hidden = $form.find('input#'+form_element.id).first();
															trackChange($hidden[0]);

															$hidden.change(function() {
																var $this = $(this);
																var val = $this.val();
																//alert(val);
																var item_index = self.suggestion_data.map((e) => {
																	return e.id;
																}).indexOf(val);
																if(item_index != -1) {
																	if($this.attr('mirror_value') != self.suggestion_data[item_index].value) {
																		//alert(item_index);
																		$input.val(self.suggestion_data[item_index].value);
																		//alert($input[0].id);
																		$this.attr('mirror_value', self.suggestion_data[item_index].value);
																	}
																} else {
																	//self.load(self.suggestion_data[item_index]);
																}
																if(typeof form_element.disallow_new_values !== 'undefined') {
																	if($this.val() == -1) {
																		self.parent.$element.addClass('invalid');
																	} else {
																		self.parent.$element.removeClass('invalid');
																	}
																}
															});

															var $suggestions = $input.parent().find('.suggestions').first();
															var set_value = null;
															//var suggestion_data = Array();
															$input.on('focusout.suggestions', function(event) {
																setTimeout(function() {
																	$suggestions.hide();
																}, 150);
															});
															$input.on('keyup.suggestions', function(event) {
																var $this = $(this);
																var value = $this.val();
																if(value != set_value) {
																	$hidden_id.val("-1");
																}
																if(event.which == 13) {
																	var suggestion_object = $suggestions.find('.suggestion').first().data("suggestion_object");
																	$hidden_id.val(suggestion_object.id);
																	$this.val(suggestion_object.title);
																	$suggestions.html("").show();
																	return;	
																}
																$suggestions.html("").show();
																//$suggestions.slideDown('fast');
																for(var y in self.suggestion_data) {
																	var suggestion_value = self.suggestion_data[y];
																	(function(suggestion_value) {
																		if(value.toLowerCase() == suggestion_value.title.toLowerCase()) {
																			$hidden_id.val(suggestion_value.id);
																			set_value = suggestion_value.title;
																		} else if(value.trim() != "" && suggestion_value.title.toLowerCase().indexOf(value.toLowerCase().trim()) != -1) {
																			$suggestions.append("<div id='"+suggestion_value.id+"_suggestion' class='suggestion'>"+suggestion_value.title+"</div>");
																			var $suggestion = $suggestions.find('#'+suggestion_value.id+'_suggestion').first();
																			$suggestion.data("suggestion_object", suggestion_value);
																			$suggestion.click(function() {
																				$hidden_id.val(suggestion_value.id);
																				$this.val(suggestion_value.title);
																				set_value = suggestion_value.title;
																				$suggestions.html("");
																				//$suggestions.slideUp('fast');
																			});
																		}
																	}(suggestion_value));
																}
															});
														},
														load: function(send_data, callback) {
															var self = this;
															var post_data = {
																'action': form_element.id+'_typeahead'	
															};
															if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
																post_data.action = form_element.fullname;
															}

															branch.apply_load_mask(post_data, form_element.post_data, page_data);

															branch.root.post(branch.root.actions, post_data, function(data) {
																/*self.suggestion_data = data.filter((value, index, self) => {
																	return self.indexOf(value) === index;
																});*/
																if(typeof data === 'object') {
																	data = Object.values(data);
																}
																//console.log(data);
																self.suggestion_data = data;//self.distinct(data);
																if(typeof callback !== 'undefined') {
																	callback();	
																}
																if(typeof send_data !== 'undefined') {
																	$input.val(send_data.value);
																	$hidden_id.val(send_data.id);
																}
															}, "json");
														},
														distinct: function(data) {
															var found = {};
															var result = Array();
															for(var x in data) {
																if(typeof found[data[x].title] === 'undefined') {
																	result.push(data[x]);
																	found[data[x].title] = true;
																} else {
																}
															}
															return result;
														}
													}
												};

												branch.root.assign_root_object(typeahead_object);
												form_object.operation.elements[form_element.id] = typeahead_object;
												typeahead_object.operation.init();
												typeahead_object.operation.load();
											}($input, form_object));
											/*branch.root.post(branch.root.actions, {
												'action': form_element.id+'_typeahead'	
											}, function(data) {
												suggestion_data = data;
											}, "json");*/
											break;
										case 'currency':
											var caption = "";
											if(typeof form_element.caption !== 'undefined') {
												caption = "<div class='caption'>"+form_element.caption+"</div>";	
											}
											$form.append('<div class="form_element currency">'+caption+'<input id="'+form_element.id+'" placeholder="Amount in '+branch.root.currency+'" class="currency form_input" /></div>');
											$input = $form.find('#'+form_element.id).first();
											var input_timeout = null;
											$input.keypress(function() {
												var $this = $(this);
												clearTimeout(input_timeout);
												input_timeout = setTimeout(function() {
													var $value = $this.val();
													var float_value = parseFloat($value);
													if($value != float_value) {
														$this.addClass('invalid');	
													} else {
														$this.removeClass('invalid');	
													}
												}, 50);
											});
											break;
										case 'checkbox':
											var caption = "";
											if(typeof form_element.caption !== 'undefined') {
												caption = "<label for='"+form_element.id+"'>"+form_element.caption+"</label>";	
												//caption = form_element.caption;
											}
											$form.append("<div class='form_element checkbox'><input type='checkbox' id='"+form_element.id+"' class='form_input checkbox' value='' />"+caption+"</div>");
											$input = $form.find('#'+form_element.id).first();
											break;
										case 'year':
											var caption = "";
											if(typeof form_element.caption !== 'undefined') {
												caption = "<div class='caption'>"+form_element.caption+"</div>";	
											}
											$form.append("<div class='form_element'>"+caption+"<input type='number' id='"+form_element.id+"' maxlength='4' class='form_input' value='' /></div>");
											$input = $form.find('#'+form_element.id).first();
											$input.keydown(function() {
												var $this = $(this);
												setTimeout(function() {
													var $value = $this.val();
													if($value.length > 4) {
														$this.val($value.substr(0, 4));	
													}
													$value = $this.val();
													var int_value = parseInt($value);
													if(int_value < 1800) {
														$this.addClass('invalid');	
													} else {
														$this.removeClass('invalid');	
													}
												}, 500);
											});
											break;
										case 'date':
											var caption = "";
											if(typeof form_element.caption !== 'undefined') {
												caption = "<div class='caption'>"+form_element.caption+"</div>";	
											}
											var attributes = "";
											if(typeof form_element.max !== 'undefined') {
												attributes += " max='"+form_element.max+"' ";
											}
											if(typeof form_element.minlength !== 'undefined') {
												attributes += " min='"+form_element.min+"' ";
											}
											$form.append("<div class='form_element'>"+caption+"<input type='date' id='"+form_element.id+"' "+attributes+" class='form_input' value='' /></div>");
											$input = $form.find('#'+form_element.id).first();
											if(typeof form_element.default_value !== 'undefined') {
												var date = new Date();
												var split;
												if(form_element.default_value.indexOf('Y') !== -1) {
													split = form_element.default_value.split('Y').join(date.getFullYear());
												}
												if(form_element.default_value.indexOf('M') !== -1) {
													split = form_element.default_value.split('M').join(date.getMonth());
												}
												if(form_element.default_value.indexOf('D') !== -1) {
													split = form_element.default_value.split('D').join(date.getDate());
												}
												$input.data('default_value', split);
											}
											/*if($input[0].type === 'text') {
												$input.datepicker();	
											}*/
											break;
										case 'radio':
											var append_value = "<div class='form_element flex'><div class='radio_buttons form_input' id='"+form_element.id+"'>";
											var counter = 0;
											for(var z in form_element.content) {
												var checked = "";
												if(counter == 0) {
													checked = "checked='checked'";	
												}
												append_value += "<div class='radio_container'><input type='radio' name='"+form_element.id+"' class='' id='"+form_element.id+"' value='"+z+"' "+checked+" />"+form_element.content[z]+"</div>";	
												counter++;
											}
											append_value += "</div></div>";
											$form.append(append_value);
											var $radio = $form.find('#'+form_element.id).first();
											$input = $radio;
											break;
										case 'hidden':
											$form.append("<div class='form_hidden'><input type='hidden' id='"+form_element.id+"' class='form_input' value='-1' /></div>");

											MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
											var trackChange = function(element) {
												var observer = new MutationObserver(function(mutations, observer) {
													if(mutations[0].attributeName == "value") {
														$(element).trigger("change");
													}
												});
												observer.observe(element, {
													attributes: true
												});
											}
											var $hidden = $form.find('input#'+form_element.id).first();
											trackChange($hidden[0]);

											if(typeof form_element.default_value !== 'undefined') {
												$hidden.val(form_element.default_value);
											}
											$input = $hidden;
											break;
										case 'link':
											$form.append("<div class='form_element'><input type='text' id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"' /></div>");
											$input = $form.find('#'+form_element.id).first();
											$input.on('keypress', function(e) {
												if($(this).val().indexOf('http://') == 0 || $(this).val().indexOf('https://') == 0) {
													$(this).removeClass('invalid');		
												} else {
													$(this).addClass('invalid');
												}
											});	
											break;
										case 'tel':
											$form.append("<div class='form_element'><input type='tel' "+form_element_attributes+" id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"' /></div>");
											$input = $form.find('#'+form_element.id).first();
											break;
										case 'number':
											var attributes = "";
											if(typeof form_element.max !== 'undefined') {
												attributes += " max='"+form_element.max+"' ";
											}
											if(typeof form_element.min !== 'undefined') {
												attributes += " min='"+form_element.min+"' ";
											}
											$form.append("<div class='form_element'><input type='number' "+form_element_attributes+" id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"' /></div>");
											$input = $form.find('#'+form_element.id).first();
											if(typeof form_element.autoincrement !== 'undefined') {
												$input.attr('disabled', 'true').addClass('autoincrement').addClass('optional_field');
											}
											break;
										case 'range':
											var attributes = "";
											if(typeof form_element.max !== 'undefined') {
												attributes += " max='"+form_element.max+"' ";
											}
											if(typeof form_element.min !== 'undefined') {
												attributes += " min='"+form_element.min+"' ";
											}
											if(typeof form_element.step !== 'undefined') {
												attributes += " step='"+form_element.step+"' ";
											}
											$form.append("<div class='form_element'><span class='form_label'>"+form_element.placeholder+"</span><input type='range' "+form_element_attributes+" id='"+form_element.id+"' class='form_input' /></div>");
											$input = $form.find('#'+form_element.id).first();
											break;
										case 'email':
											$form.append("<div class='form_element'><input type='email' "+form_element_attributes+" id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"' /></div>");
											$input = $form.find('#'+form_element.id).first();
											if(form_element.id == 'username' || form_element.id == 'email') {
												$input.on('keypress', function(e) {
													if(e.which == 32){
														return false;
													}
													var contains = false;
													for(var c in branch.illegal_characters) {
														if($(this).val().indexOf(branch.illegal_characters[c]) != -1) {
															contains = true;
														}
													}
													if(contains) {
														$(this).attr('invalid_base', 'true');
														$(this).addClass('invalid');
													} else {

														$(this).attr('invalid_base', 'false');
														$(this).removeClass('invalid');
													}
													//if($(this).val().i
												});	
											}
											break;
										case 'text':
											var placeholder = form_element.id;
											if(typeof form_element.placeholder !== 'undefined') {
												placeholder = form_element.placeholder;
											}
											var attributes = "";
											if(typeof form_element.maxlength !== 'undefined') {
												attributes += " maxlength='"+form_element.maxlength+"' ";
											}
											if(typeof form_element.minlength !== 'undefined') {
												attributes += " minlength='"+form_element.minlength+"' ";
											}
											$form.append("<div class='form_element'><input type='text' id='"+form_element.id+"' "+form_element_attributes+" "+attributes+" class='form_input' placeholder='"+placeholder+"' /></div>");
											$input = $form.find('#'+form_element.id).first();
											break;
										case 'password':
											$form.append("<div class='form_element'><input type='password' maxlength='20' id='"+form_element.id+"' "+form_element_attributes+" class='form_input' placeholder='"+form_element.placeholder+"' /></div>");
											
											var $form_password = $form.find('#'+form_element.id).first();
											$input = $form_password;
											$form_password.on('keypress', function(e) {
												var contains = false;
												var $this = $(this);
												for(var c in branch.illegal_characters) {
													if($this.val().indexOf(branch.illegal_characters[c]) != -1) {
														contains = true;
													}
												}
												if(contains) {
													$this.addClass('invalid');
												} else {
													$this.removeClass('invalid');
												}
											});
											
											if(typeof form_element.no_confirmation === 'undefined') {
												$form.append("<div class='form_element'><input type='password' maxlength='20' id='"+form_element.id+"_confirm' class='form_input pseudo_value' placeholder='"+form_element.placeholder+" (confirm)' /></div>");
												var $form_confirmation = $form.find('#'+form_element.id+'_confirm').first();
												$input_extra = $form_confirmation;
												$form_confirmation.keyup(function() {
													var value = $(this).val();
													if(value != $form_password.val()) {
														$(this).addClass('invalid');	
													} else {
														$(this).removeClass('invalid');	
													}
												});
											}
											break;
										case 'textarea':
											if(typeof form_element.rich_text !== 'undefined' && form_element.rich_text == true || typeof form_element.display_title !== 'undefined') {
												$form.append("<div class='title small'>"+form_element.placeholder+"</div>");
											}
											/*if($('textarea#'+form_element.id).length > 0) {
												form_element.id += "-2";	
											}*/
											if(typeof tinyMCE !== 'undefined') {
												tinyMCE.EditorManager.execCommand('mceRemoveEditor', true, form_element.id);
											}
											$form.append("<div class='form_element'><textarea id='"+form_element.id+"' class='form_input' placeholder='"+form_element.placeholder+"'></textarea></div>");
											var $textarea = $form.find('#'+form_element.id).first();
											$input = $textarea;
											if(typeof form_element.rich_text !== 'undefined' && form_element.rich_text == true) {
												$input.addClass('rich_text');
												$input.parent().addClass('rich_text');
												tinyMCE.init({
													 selector:'#'+content_item.id+'_form > .rich_text > textarea.rich_text#'+form_element.id,
													 plugins: 'paste',
													 paste_auto_cleanup_on_paste : true,
													 paste_remove_styles: true,
													 paste_remove_styles_if_webkit: true,
													 paste_strip_class_attributes: true
												});	
											}
											if(typeof form_element.default_value !== 'undefined') {
												$input.attr('default_value', form_element.default_value);
											}
											if(typeof form_element.json_content !== 'undefined') {
												$textarea.addClass('json_content');
												$textarea.keyup(function() {
													var $this = $(this);
														var value = $this.val();
														try {
															value = JSON.parse(value);
															//console.log(value);
															if(typeof form_element.json_callback !== 'undefined') {
																console.log(form_element.json_callback);
																var send_data = {};
																branch.apply_load_mask(send_data, form_element.json_post_data, page_data);
																branch.root[form_element.json_callback](value, send_data);
															}

														} catch(exc) {
														}
													
												});
												//--restore
												/*var code_mirror_object = CodeMirror.fromTextArea($textarea[0], {
													lineNumbers: true,
													mode: "javascript"
												});

												var textarea_object = {
													___object: code_mirror_object,
													operation: {
														load: function(value) {
															if(value != null) {
																try {
																	value = JSON.parse(value);
																	this.parent.___object.setValue(value);
																} catch(exception) {

																}
															} else {
																this.parent.___object.setValue("");
															}
														},
														get: function() {
															return this.parent.___object.getValue();
														}
													}
												};
												branch.root.assign_root_object(textarea_object);
												form_object.operation.code_elements[form_element.id] = textarea_object;*/
											}
											if(typeof form_element.enable_tab !== 'undefined') {
												$input.keydown(function(e) {
												    if(e.keyCode === 9) { // tab was pressed
												        // get caret position/selection
												        var start = this.selectionStart;
												            end = this.selectionEnd;

												        var $this = $(this);

												        // set textarea value to: text before caret + tab + text after caret
												        $this.val($this.val().substring(0, start)
												                    + "\t"
												                    + $this.val().substring(end));

												        // put caret at right position again
												        this.selectionStart = this.selectionEnd = start + 1;

												        // prevent the focus lose
												        return false;
												    }
												});
											}
											break;
										case 'tags':
											$form.append("<div class='form_element'><input type='text' id='"+form_element.id+"' class='form_input tags_input' placeholder='"+form_element.placeholder+"' /></div>");
											$form.append("<div class='form_element tags_container' id='"+form_element.id+"_container'></div>");
											break;
										case 'select':
											//////alert('create');
											var caption = "";
											if(typeof form_element.caption !== 'undefined') {
												caption = "<div class='form_element_caption'>";
												caption += form_element.caption;
												caption += "</div>";
											}	
											$form.append("<div class='form_element'>"+caption+"<select id='"+form_element.id+"_id' class='form_input'></select></div>");
											var $select = $form.find('select#'+form_element.id+"_id").first();
											//////alert($select[0]);
											//var random_id = Math.random();
											var select_object = {
												$element: $select,
												//init_rand_id: Math.random(),
												operation: {
													/*load: function() {
														
													}*/
													init: function() {
														var self = this;
														this.parent.$element.change(function() {
															self.last_value = $(this).val();
														});
														
													},
													load: function() {

													}
												}
											}
											//select_object.init_rand_id = random_id;
											//////alert(random_id);
											/*function select_object_constructor() {}
											select_object_constructor.prototype = select_object_proto;
											var select_object = new select_object_constructor();*/
											if(form_element.content === 'fetch') {
												(function(form_element, select_object, $select){
													select_object.operation.load = function(send_data, callback) {
														//alert('load');
														////console.log(send_data);
														var self = this;
														var post_data = {
															action: 'get_'+form_element.id+'_select'	
														};
														if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity == true) {
															post_data.action = form_element.id+"__"+form_element.page_name+'_select';
														}
														branch.apply_load_mask(post_data, form_element.post_data, page_data);
														//////console.log(post_data);
														if(typeof branch.root.view_containers_table_index !== 'undefined') {
															branch.root.view_containers_table_index.set_view_constraint(post_data.action, post_data);
														}
														branch.root.post(branch.root.actions, post_data, function(data) {
															////alert(self.parent.init_rand_id);
															//////console.log('clear_select');
															/*if(typeof data === 'object') {
																data = Object.values(data);
															}*/
															//console.log('select data');
															//console.log(data);
															$select.html("");
															var is_tree = false;
															if(typeof form_element.is_tree !== 'undefined') {
																is_tree = true;
															}
															var option_name = "option";
															if(typeof form_element.caption !== 'undefined') {
																option_name = form_element.caption;	
															}
															$select.append("<option disabled selected value>Select "+option_name+"</option>");
															if(is_tree) {
																$select.append("<option selected value='0'>No parent</option>");
															}
															if(data.length == 0) {
																if(typeof callback !== 'undefined') {
																	callback();	
																}
																return;
															}
															if(typeof data[0] === 'undefined') {
																if(typeof callback !== 'undefined') {
																	callback();	
																}
																return;
															}
															if(typeof data[0].children !== 'undefined') {
																is_tree = true;
															}
															var first_val = data[0].id;
															var print_children = function(children, padding) {
																for(var x in children) {
																	var option = "<option style='padding-left:"+padding+"px;' value='"+children[x].id+"'>"+children[x].title+"</option>";
																	$select.append(option);
																	//////console.log(option);
																	print_children(children[x].children, padding+20);	
																}
															};
															
															for(var x in data) {
																if(typeof form_element.data_mask !== 'undefined') {
																	for(var z in form_element.data_mask) {
																		data[x][form_element.data_mask[z]] = data[x][z];
																	}
																}
																var option = "<option value='"+data[x].id+"'>"+data[x].title+"</option>";	
																$select.append(option);
																//////console.log(option);
																//////console.log($select[0]);
																//////console.log($select[0].innerHTML);
																/*////alert(option);
																////alert($select[0].innerHTML);
																////alert($select[0]);
																$select.hide();*/
																
																print_children(data[x].children, 20);
															}
															if(typeof form_element.persist_value !== 'undefined' && form_element.persist_value == true) {
																//////alert(self.last_value);
																if(typeof self.last_value !== 'undefined') {
																	$select.val(self.last_value);	
																}/* else {
																	////alert(first_val);
																	$select.val(first_val);
																}*/
															}
															if(typeof form_element.on_change !== 'undefined') {
																//$select.trigger('change');	
															}
															if(typeof callback !== 'undefined') {
																callback();	
															}
															if(typeof send_data !== 'undefined' && send_data === true) {
																var last_value = form_object.operation.last_set_data[form_element.id+"_id"];
																////console.log(last_value);
																$select.val(last_value);
															}
															if(typeof $select.attr('next_value') !== 'undefined' && $select.attr('next_value') != null && $select.attr('next_value') != '') {
																$select.val($select.attr('next_value'));
																$select.attr('next_value', '');
															}
															$select.trigger('change');
														}, "json");
													};
												}(form_element, select_object, $select));
											} else {
												$select.html("");
												var option_name = "option";
												if(typeof form_element.caption !== 'undefined') {
													option_name = form_element.caption;	
												}
												$select.append("<option disabled selected value>Select "+option_name+"</option>");
												for(var c in form_element.content) {
													$select.append("<option value='"+form_element.content[c].value+"'>"+form_element.content[c].title+"</option>");	
												}
												select_object.operation.load = function(send_data, callback) {
													if(typeof callback !== 'undefined') {
														callback();	
													}
												};
											}
											if(typeof form_element.on_change !== 'undefined') {
												$select.change(function() {
													//alert('change');
													var send_data = {};
													send_data[form_element.on_change_load_mask['id']] = $select.val();
													//setTimeout(function() {
														branch.call_on_submit(form_element.on_change, send_data);
													//}, 5200);
												});
											}
											
											/*for(var e in post_data_linked_elements) {
												
											}*/
											var post_data_item_id = content_item.id+'_form';
											if(typeof post_data_linked_elements[post_data_item_id] !== 'undefined') {
												if(typeof post_data_linked_elements[post_data_item_id][form_element.id+'_id'] !== 'undefined') {
													$select.change(function() {
														if(typeof select_object.operation.last_value === 'undefined' || select_object.operation.last_value != $(this).val()) {
															for(var x in post_data_linked_elements[post_data_item_id][form_element.id+'_id']) {
																var split = post_data_linked_elements[post_data_item_id][form_element.id+'_id'][x].split('.');
																var form = split[0];
																var element = split[1];
																if(form == post_data_item_id) {
																	form_object.operation.elements[element].operation.load();	
																} else {
																	var callback_object = branch.root.elements.find_element_object(form);
																	callback_object.operation.elements[element].operation.load();	
																}
															}
														}
													});
												}
											}
											
											branch.root.assign_root_object(select_object);
											select_object.operation.init();
											if(typeof select_object.operation.load !== 'undefined') {
												if(typeof form_element.dependencies === 'undefined') {
													select_object.operation.load();
												}
											}
											form_object.operation.elements[form_element.id] = select_object;
											//$select.attr('object_id', form_element.id);
											$input = $select;
											break;
										case 'suggest':
											$form.append("<div class='form_element'><input type='hidden' id='"+form_element.id+"_value' class='form_input' value='-1' /><input type='text' id='"+form_element.id+"'  autocomplete='off' class='form_input form_suggest ' placeholder='"+form_element.placeholder+"' /></div><div class='suggestion_results' id='"+form_element.id+"_results'></div>");
											var $suggest = $form.find('#'+form_element.id).first();
											var $suggest_value = $form.find('#'+form_element.id+"_value").first();
											var $suggestion_results = $form.find('#'+form_element.id+"_results").first();
											var suggest_object = {
												$element: $suggest,
												operation: {
													load: function() {
														
													},
													init: function() {
														if(form_element.require_id !== 'undefined') {
															$suggest.focusout(function() {
																if($suggest_value.val() == "-1") {
																	branch.root.post(branch.root.actions, {
																		action: 'get_'+form_element.id+'_suggest_validation',
																		search_term: $suggest.val()		
																	}, function(data) {
																		if(typeof data.id !== 'undefined') {
																			$suggest_value.val(data.id);
																			$suggestion_results.hide('fast', function() {
																				$suggestion_results.html("");
																			});
																		} else {
																			$suggest.addClass('invalid');	
																		}
																	}, "json");
																}
															});
														}
														$suggest.focus(function() {
															$suggest.removeClass('invalid');
														});
														$suggest.keyup(function() {
															var value = $(this).val();
															$suggest_value.val("-1");
															branch.root.post(branch.root.actions, {
																action: 'get_'+form_element.id+'_suggest',
																search_term: value	
															}, function(data) {
																$suggestion_results.html("");
																$suggestion_results.show();
																for(var x in data) {
																	(function(data) {
																		$suggestion_results.append("<div id='"+data.id+"'>"+data.value+"</div>");	
																		$suggestion_results.find('#'+data.id).click(function() {
																			$suggest.val(data.value);
																			$suggest_value.val(data.id);
																			$suggest.removeClass('invalid');
																			$suggestion_results.hide('fast', function() {
																				$suggestion_results.html("");
																			});
																		});
																	}(data[x]));
																}
															}, "json");
														});
													}
												}
											};
											suggest_object.operation.init();
											form_object.operation.elements[form_element.id] = suggest_object;
											$input = $suggest;
											break;
										default:
											//var statement = "branch.root.custom_elements."+form_element.type+".init(form_element, $form, page_data, branch, page, form_object)";
											//eval(statement);
											branch.root.custom_elements[form_element.type].init(form_element, $form, page_data, branch, page, form_object);
											break;
									}

									$input.change(function() {
										////console.log(content_item.id);
										////console.log(form_element.id);
										var $this = $(this);
										if(typeof $this.attr('last_value') !== 'undefined' && $this.attr('last_value') == $this.val()) {

										} else {
											if(typeof form_element_linked_elements[content_item.id+'_form'] !== 'undefined' && typeof form_element_linked_elements[content_item.id+'_form'][form_element.id] !== 'undefined') {
												for(var linked_index in form_element_linked_elements[content_item.id+'_form'][form_element.id]) {
													var linked_reference = form_element_linked_elements[content_item.id+'_form'][form_element.id][linked_index];

													if(typeof branch.root.elements.forms[linked_reference.form_name+'_form'] !== 'undefined') {
														var linked_form = branch.root.elements.forms[linked_reference.form_name+'_form'];
														var linked_element = linked_form.operation.elements[linked_reference.element_name];
														linked_element.operation.load();
													}
												}
												////console.log();
											}
										}
										$this.attr('last_value', $input.val());
									});
									if(typeof form_element.validation !== 'undefined') {

										var validation_function = function(self) {
											var $this = $(self);
											var suffix = "";
											if(form_element.validation !== true) {
												suffix = '_'+form_element.validation;
											}
											if(typeof branch.validation_timeout !== 'undefined') {
												clearTimeout(branch.validation_timeout);
											}
											branch.validation_timeout = setTimeout(function() {
												var validation_post_data = {
													action: form_element.id+'_validation'+suffix,
													value: $this.val(),
													//id: $form.find('#id').val()
												};
												if($form.find('#id').length > 0) {
													validation_post_data.id = $form.find('#id').val();
												}
												branch.root.post(branch.root.actions, validation_post_data, function(data) {
													if(data) {;
														if(typeof $this.attr('invalid_base') === 'undefined' || $this.attr('invalid_base') == null || $this.attr('invalid_base') == false) {
															$this.removeClass('invalid');
														}	
													} else {
														$this.addClass('invalid');
													}
												});
											}, 200);
										};
										//if(form_element.type != 'email') {
											$input.keyup(function() {
												validation_function(this);
											});
										/*} else {
											$input.on('keyup', function() {
												validation_function(this);
											}).on('focus', function() {
												validation_function(this);
											}).on('focusout', function() {
												validation_function(this);
											}).on('click', function() {
												validation_function(this);
											}).on('change', function() {
												validation_function(this);
											});
										}*/
									}
									/*if(typeof form_element.regex !== 'undefined') {
										$input.change(function() {
											var $this = $(this);
											var value = $this.val();
											if(value.length > 0) {
												var regex = new RegExp(form_element.regex);
												var matches = value.match(regex);
												if(matches.length == 0) {
													$this.addClass('invalid');
												} else {
													if(typeof $this.attr('invalid_base') === 'undefined' || $this.attr('invalid_base') == null || $this.attr('invalid_base') == 'false') {
														$this.removeClass('invalid');
													}	
												}
											}
										});
									}*/
									if(typeof form_element.disabled !== 'undefined') {
										$input.attr('disabled', 'true');	
									}
									if(typeof form_element.allow_empty !== 'undefined' && form_element.allow_empty === true) {
										$input.addClass('allow_empty');	
									}
									if(typeof form_element.ignore_reset !== 'undefined' && form_element.ignore_reset == true) {
										$input.addClass('ignore_reset');	
									}
									if(typeof form_element.persist_value !== 'undefined' && form_element.persist_value == true) {
										$input.addClass('persist_value');	
									}
									if(typeof form_element.optional_field !== 'undefined') {
										$input.addClass('optional_field');	
									}
									if(typeof form_element.default_value !== 'undefined') {
										$input.attr('default_value', form_element.default_value);
									}
									if(typeof form_element.required_on_edit !== 'undefined' && form_element.required_on_edit == false) {
										$input.addClass('unrequired_on_edit');
										if(typeof $input_extra !== 'undefined') {
											$input_extra.addClass('unrequired_on_edit');
										}
									}
									$input.attr('object_id', form_element.id);
									if(typeof form_element.dependencies !== 'undefined') {
										var self_object_id = $input.attr('object_id');
										if(typeof self_object_id === 'undefined') {
											self_object_id = $input.attr('id');
										}
										var self_element_object = null;
										if(typeof form_object.operation.elements[self_object_id] !== 'undefined') {
											self_element_object = form_object.operation.elements[self_object_id];
											self_element_object.dependencies = [];
										}
										var dependency_callback = function(dependencies, $input) {
											return function(self) {
												for(var z in dependencies) {
													var dependency = dependencies[z];
													var link = dependency.link;
													link = link.split(".");
													var form = link[0];
													var form_element = link[1];
													var form_object = branch.root.elements.forms[form];
													var $linked_form = form_object.$element;
													var $linked_element = $linked_form.find('#'+form_element).first();
													var object_id = $linked_element.attr('object_id');
													if(typeof object_id === 'undefined') {
														object_id = form_element;
													}
													var element_object = form_object.operation.elements[object_id];
													var self_object_id = $input.attr('object_id');
													////console.log('self_object_id:');
													////console.log(self_object_id);
													if(typeof self_object_id === 'undefined') {
														self_object_id = $input.attr('id');
													}
													var self_element_object = null;
													if(typeof form_object.operation.elements[self_object_id] !== 'undefined') {
														self_element_object = form_object.operation.elements[self_object_id];
													}
													$linked_element.on('change.dependency', function() {
														var linked_value;
														if($(this).hasClass('radio_buttons')) {
															linked_value = $(this).find('input[type=radio]:checked').val();	
														} else {
															linked_value = $(this).val();
														}
														if(linked_value != null) {
															if(linked_value.trim().length == 0) {
																linked_value = null;	
															}
														}
														var show = false;
														if(Array.isArray(dependency.value)) {
															if(dependency.value.indexOf(linked_value) !== -1) {
																show = true;
															} else {
															}
														} else if(linked_value == dependency.value || (dependency.value === 'set' && linked_value != null)) {
															show = true;
														} else {
														}
														if(show) {
															$input.parent().show();
															$input.removeClass('allow_empty');	
															if(typeof element_object !== 'undefined') {
																if(self_element_object != null) {
																	self_element_object.operation.load(true);
																}
															}
														} else {
															$input.parent().hide();		
															if(!$input.hasClass('optional_field')) {
																$input.addClass('allow_empty');
															}
														}
													}); //.trigger('change');
													//if(branch.form_element_dependencies_linked_elements.indexOf($linked_element
													$input.parent().hide();
													branch.form_element_dependencies_linked_elements[form+'_'+$linked_element.attr('id')] = $linked_element;
													/*setTimeout(function() {
														$linked_element.trigger('change');
													}, 100);*/
												}
												self.call_next_callback();
												//self.loaded_callbacks[++self.current_loaded_callback](self);
											};

										}(form_element.dependencies, $input);
										branch.loaded_objects[page.id].loaded_callbacks.push(dependency_callback);


									}
								}(form_element, form_object));
							}
							var cancel_callback_main = function(content_item) {
								if(typeof content_item.hide_on_cancel !== 'undefined') {
									$form.fadeOut('slow');
								}
								if(typeof content_item.show_on_cancel !== 'undefined') {
									for(var y in content_item.show_on_cancel) {
										$container.find('#'+content_item.show_on_cancel).first().fadeIn('slow');	
									}
								}
								if(typeof content_item.navigate_back_on_complete !== 'undefined') {
									//history.back();
									branch.root.navigation.navigate_back();
								}
							};
							$form.append("<div class='form_buttons'></div>");
							var $form_buttons = $form.find('.form_buttons').first();
							if(typeof content_item.cancel !== 'undefined') {
								$form_buttons.append("<button class='cancel'>Cancel</button>");
								var $cancel_button = $form_buttons.find('.cancel').first();
								$cancel_button.click(function() {
									form_object.operation.load();
									if(typeof content_item.cancel_callback !== 'undefined') {
										var cancel_callback_function;
										var callback_statement = "cancel_callback_function = branch.root."+content_item.cancel_callback;
										eval(callback_statement);
										cancel_callback_function();
									}
									cancel_callback_main(content_item);
								});
							}
							var $save;
							if(typeof content_item.save !== 'undefined') {
								var text_value = "Save";
								if(content_item.save !== true) {
									text_value = content_item.save;
								}
								$form_buttons.append("<button class='save'>"+text_value+"</button>");
								$save = $form_buttons.find('button.save');

								var submit_callback = function(data, $save) {
									////console.log('submit_callback data');
									////console.log(data);
									//return;
									$form.find('#id').first().val(data).trigger('change');
									if(data == -1) {
										form_object.operation.load();
									} else {
											
									}
									if(typeof content_item.target_page !== 'undefined') {
										var send_data = {};
										/*if(typeof content_item.target_page_load_mask !== 'undefined') {
											for(var x in content_item.target_page_load_mask) {
												send_data[content_item.target_page_load_mask[x]] = data[x];
											}
										}*/
										send_data.id = data;
										/*var target_page = branch.find_page(content_item.target_page);
										branch.render_page(target_page, 'main', null, function() {
											
										}, send_data);*/
										branch.root.navigation.navigate_to(content_item.target_page, send_data);
									}
									
									for(var x in content_item.on_submit) {
										var callback_item = content_item.on_submit[x];
										var load_mask_value = true;
										//////console.log(callback_item);
										//////alert(typeof callback_item);
										//////alert(typeof callback_item.link);
										var continue_parse = true;
										if(typeof callback_item == 'object' && typeof callback_item.link !== 'undefined') {
											//////console.log('inside');
											load_mask_value = callback_item.load_mask;
											callback_item = callback_item.link;	
										} else if(typeof callback_item === 'string' && callback_item.indexOf('_app') == 0) {
											var statement = "branch.root"+callback_item.split('_app')[1]+"();";
											eval(statement);
											continue_parse = false;
										}
										if(continue_parse) {
											var found_index = -1;
											for(var y in branch.root.elements.element_names) {
												if(callback_item.indexOf(branch.root.elements.element_names[y]) != -1) { //== callback_item.length - branch.root.elements.element_names[y].length
													found_index = y;
													break;
												}
											}
											var split = callback_item.split("_");
											var type = split[split.length-1]+"s";
											if(found_index != -1) {
												type = branch.root.elements.element_names[found_index]+"s";
											}
											var statement = "var element = branch.root.elements."+type+"['"+callback_item+"']";
											eval(statement);
											if(typeof content_item.on_submit_load_mask !== 'undefined' && load_mask_value === true) {
												var on_submit_send_data;
												if(typeof on_submit_send_data === 'undefined') {
													on_submit_send_data = {
														
													}
													form_object.$element.find('.form_input').each(function() {
														var id = $(this).attr('id');
														on_submit_send_data[id] = $(this).val();
													});
												}
											
												var on_submit_send_data_value = {};
												if(typeof content_item.on_load_load_mask !== 'undefined') {
													for(var x in content_item.on_submit_load_mask) {
														on_submit_send_data_value[content_item.on_load_load_mask[x]] = on_submit_send_data[x];
													}
												}
												element.operation.load(on_submit_send_data_value);	
											} else {
												element.operation.load();	
											}
										}
									}
									if(typeof content_item.new_on_save !== 'undefined') {
										form_object.operation.load();	
									}
									/*if(content_item.id == 'user') {
										if(data != "-1") {
											branch.root.user_id = data;	
										}
									}*/
									if(typeof content_item.redirect !== 'undefined' && data != -1) {
										document.location.href = content_item.redirect;
									}
									//console.log(data);
									//console.log($save.length);
									if(data != -1) {
										$save.addClass('saved');
										setTimeout(function() {
											$save.removeClass('saved');
										}, 1500);
									} else {
										$save.addClass('submit_error');
										setTimeout(function() {
											$save.removeClass('submit_error');
										}, 500);
									}
									cancel_callback_main(content_item);
								};
								form_object.operation.submit_callback = submit_callback;
								$form_buttons.find('button.save').click(function() {
									var submit_data = {
										action: "_"+content_item.id	
									};
									if(typeof branch.root.definition.plasticity !== 'undefined' && branch.root.definition.plasticity === true) {
										submit_data.action = "_insert_"+content_item.id
									}
									var valid = true;
									var id_set = false;
									if($form.find('#id').val() != "-1") {
										id_set = true;	
									}
									$form.find('.form_input').each(function() {
										//if(this.tagName == 'input' && this.type == 'radio') {
										if($(this).hasClass('radio_buttons') || $(this).hasClass('rich_text') || $(this).hasClass('checkbox') || $(this).hasClass('json_content')) {
											
										} else {
											if($(this).hasClass('invalid') || (typeof this.validity !== 'undefined' && !this.validity.valid)) {
												valid = false;	
											}
											if(($(this).val() == null || $(this).val() == "" || $(this).val() == "-1") && !$(this).hasClass('allow_empty') && !$(this).hasClass('optional_field') && !(id_set && $(this).hasClass('unrequired_on_edit'))) {												
												valid = false;	
											}
										}
									});
									if(!valid) {
										var error_message_text = "Form is not valid, please fix invalid fields.";
										if(typeof content_item.error_message !== 'undefined') {
											error_message_text = content_item.error_message;	
										}
										branch.view.pop_up.display(error_message_text, "fadeout");
										return false;
									}
									$form.find('.form_input').each(function() {
										var $this = $(this);
										if($this.hasClass('autoincrement')) {
											var id = $this.attr('id');
											var value = { __autoincrement: true };
											submit_data[id] = value;
										} else if($(this).hasClass('checkbox') && !$(this).hasClass('pseudo_value') && !$(this).hasClass('ignore_value')) {
											var id = $(this).attr('id');
											var value = $(this).prop('checked');
											if(value) {
												value = 1;	
											} else {
												value = 0;	
											}
											submit_data[id] = value;
										} else if(!$(this).hasClass('rich_text') && !$(this).hasClass('pseudo_value') && !$(this).hasClass('ignore_value') && !($(this).hasClass('unrequired_on_edit') && $(this).val() == "")) {
											var id = $(this).attr('id');
											/*if(this.tagName.toLowerCase() == 'select') {
												id += "_id";	
											}*/
											var value;
											if($(this).hasClass('radio_buttons')) {
												value = $(this).find('input[type=radio]:checked').val();	
											} else {
												value = $(this).val();
											}
											if($(this).hasClass('json_content')) {
												value = JSON.stringify(value);
											}
											var statement = "submit_data."+id+" = value;";
											eval(statement);
										} else if($(this).hasClass('rich_text')) {
											var id = $(this).attr('id');
											var value = tinyMCE.get(id).getContent();
											var statement = "submit_data."+id+" = value;";
											eval(statement);	
										}
									});
									for(var code_element_index in form_object.operation.code_elements) {
										submit_data[code_element_index] = JSON.stringify(form_object.operation.code_elements[code_element_index].operation.get());
										//alert(submit_data[code_element_index]);
									}
									////console.log(submit_data);
									if(typeof content_item.custom_action !== 'undefined') {
										var statement = "branch.root."+content_item.custom_action+"(submit_data, submit_callback, $save)";
										eval(statement);	
									} else {
										branch.root.post(branch.root.actions, submit_data, function(data) {
											if(typeof data === 'object' && typeof data[0] !== 'undefined') {
												data = data[0];
											}
											submit_callback(data, $save);
										});
									}
								});
							}
							if(typeof content_item.new !== 'undefined') {
								$form_buttons.append("<button class='new'>New</button>");
								$form_buttons.find('button.new').first().click(function() {
									/*$form.find('.form_input').each(function() {
										$(this).val("");
									});
									$form.find('input[type=hidden]').val("-1");*/
									form_object.operation.load();
								});
							}
							if(typeof content_item.delete !== 'undefined') {
								$form_buttons.append("<button class='delete'>Delete</button>");
								$form_buttons.find('button.delete').first().click(function() {
									var post_data = {
										action: 'delete_'+content_item.id,
										id: $form.find('#id').first().val()
									};
									branch.root.post(branch.root.actions, post_data, function(data) {
										//////alert(form_object);
										//////alert(form_object.operation.submit_callback);
										if(typeof form_object.operation.submit_callback !== 'undefined') {
											form_object.operation.submit_callback(null, $save);
										}
										if(typeof content_item.on_delete_navigate !== 'undefined') {
											branch.root.navigation.navigate_to(content_item.on_delete_navigate);
										} else {
											cancel_callback_main(content_item);
										}
									});
								});
							}
							branch.root.assign_root_object(form_object);
							if(typeof branch.root.elements.forms[content_item.id+"_form"] !== 'undefined') {
								delete branch.root.elements.forms[content_item.id+"_form"];
							}
							branch.root.elements.forms[content_item.id+"_form"] = form_object;


							$form.find('#id').first().change(function() {
								if(typeof form_element_linked_elements[content_item.id+'_form'] !== 'undefined' && typeof form_element_linked_elements[content_item.id+'_form'].id !== 'undefined') {
									for(var linked_index in form_element_linked_elements[content_item.id+'_form'].id) {
										var linked_reference = form_element_linked_elements[content_item.id+'_form'].id[linked_index];
										setTimeout(function() {
											if(typeof branch.root.elements.forms[linked_reference.form_name+'_form'] !== 'undefined') {
												var linked_form = branch.root.elements.forms[linked_reference.form_name+'_form'];
												var linked_element = linked_form.operation.elements[linked_reference.element_name];
												if(typeof linked_element.dependencies === 'undefined') {
													linked_element.operation.load(true);
												}
											}
										}, 50);
									}
								}
							});

							(function(form_object) {
								////alert('push: '+form_object.random_id);
								branch.loaded_objects[page.id].loaded_callbacks.push(function(self) {
									//////console.log(page_data);
									////alert('loaded_callback id: '+form_object.random_id);
									form_object.operation.load(undefined, function(form_self) {
										//////alert('form loaded');
										//console.log('form callback');
										//console.log('page_data:');
										//console.log(page_data);
										var form_object_load_values = {};
										var continue_callback = true;
										if(typeof content_item.get_load_mask !== 'undefined') {
											////console.log('inside 1');
											//console.log(content_item.get_load_mask);
											for(var x in content_item.get_load_mask) {
												////console.log('inside 2'+x);
												if(typeof page_data[x] !== 'undefined') {
													//console.log(page_data[x]);
													//$form.find('#'+content_item.get_load_mask[x]).val(page_data[x]);
													form_object_load_values[content_item.get_load_mask[x]] = page_data[x];
													continue_callback = false;
												}
											}
											if(!continue_callback) {
												form_self.load(form_object_load_values, undefined, function(form_self) {
													////alert('loaded');
													//////alert('final');
													////console.log('final-----');
													////console.log($form.find('select').first()[0].innerHTML);
													self.call_next_callback();
												});
											}
										}
										if(continue_callback) {
											if(typeof content_item.peristant_values !== 'undefined') {
												var post_data = {
													'action': 'get_'+content_item.id
												};
												var $id = $form.find('#id');
												if($id.length > 0) {
													var id = $id.first().val();
													if(id != -1 && id != '') {
														post_data.id = id;
													}
												}
												branch.root.post(branch.root.actions, post_data, function(data) {
													form_self.load(data);	
												}, "json");
											}
											self.call_next_callback();
										}
										//self.loaded_callbacks[++self.current_loaded_callback](self);
									});
								});
							}(form_object));
							branch.loaded_objects[page.id].loaded();
							//form_object.operation.load();
							
						}(content_item));
						break;
					case 'title':
						var id = content_item.id;
						var value;
						if(typeof content_item.value !== 'undefined') {
							value = content_item.value;	
						} else {
							var statement = "value = page_data."+id+";";
							//console.log(statement);
							eval(statement);
						}
						$container.append("<div class='title' id='"+content_item.id+"'>"+"</div>");//+value
						$content_item_element = $container.find('.title#'+content_item.id).first();
						$content_item_element.text(value);
						branch.loaded_objects[page.id].loaded();
						break;
					case 'date':
						var id = content_item.id;
						var statement = "var value = page_data."+id+";";
						eval(statement);
						var caption = "";
						var class_value = "";
						var popover = true;
						var time = true;
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
							class_value = "caption_container"
						}
						if(typeof content_item.popover !== 'undefined') {
							popover = content_item.popover;	
						}
						if(typeof content_item.time !== 'undefined') {
							time = content_item.time;	
						}
						$container.append("<div class='date "+class_value+"' id='"+content_item.id+"'>"+caption+"<div class='date_value_wrap'>"+value+"</div></div>");
						$content_item_element = $container.find('.date#'+content_item.id).first();
						branch.view.date.date_cell($content_item_element.find('.date_value_wrap').first(), time, popover);
						branch.loaded_objects[page.id].loaded();
						break;
					case 'information':
						var id = content_item.id;
						//var statement = "var value = page_data."+id+";";
						//eval(statement);
						var value = page_data[id];
						if(typeof content_item.get_load_mask !== 'undefined') {
							value = page_data[content_item.get_load_mask];
						}
						var caption = "";
						var class_value = "";
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
							class_value = "caption_container"
						}
						$container.append("<div class='article_information "+class_value+"' id='"+content_item.id+"'>"+caption+value+"</div>");
						$content_item_element = $container.find('.article_information#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'user':
						var id = content_item.id;
						//var statement = "var value = page_data."+id+";";
						//eval(statement);

						var value = page_data[id];
						if(typeof content_item.get_load_mask !== 'undefined') {
							value = page_data[content_item.get_load_mask];
						}
						var caption = "";
						var class_value = "";
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
							class_value = "caption_container"
						}
						var inner_value = caption+value;
						if(typeof content_item.click !== 'undefined') {
							var href = branch.root.navigation.generate_href("user", null, null, {
								id: page_data['user_id']
							}, frame_id);
							inner_value = "<a href='"+href+"'>"+inner_value+"</a>";
						}
						$container.append("<div class='user "+class_value+"' id='"+content_item.id+"'>"+inner_value+"</div>");
						$content_item_element = $container.find('.user#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;
					case 'content':
						var id = content_item.id;
						var value;
						if(typeof content_item.content !== 'undefined') {
							value = content_item.content;
						} else {
							var statement = "value = page_data."+id+";";
							eval(statement);
						}
						if(typeof value !== 'undefined') { 
							$container.append("<div class='content' id='"+content_item.id+"'>"+"</div>");//+value+
							$content_item_element = $container.find('.content#'+content_item.id).first();
							//if(typeof content_item.set_html !== 'undefined') {
								$content_item_element.html(value);
							/*} else {
								$content_item_element.text(value.split('<br>').join('\n'));
							}*/
						}
						if(value == 'fetch') {
							branch.root.post(branch.root.actions, {
								'action': 'get_'+content_item.id	
							}, function(data) {
								$content_item_element.html(data);
							});
						}
						
						branch.loaded_objects[page.id].loaded();
						break;
					case 'discussion':
						$container.append("<div class='discussion' id='"+content_item.id+"'><div class='discussion_content'></div><div class='comment'><textarea class='comment_value' placeholder='Type comment here and press Enter to send'></textarea></div></div>");
						var $discussion = $container.find('.discussion#'+content_item.id).first();
						var $comment_object = $discussion.find('.comment_value');
						var discussion_object = {
							$element: $discussion,
							operation: {
								parent_id: "-1",
								load: function() {
									var self = this;
									var post_data = {
										action: 'get_discussion'
									};
									for(var z in content_item.load_mask) {
										if(content_item.load_mask[z].indexOf('.') != -1) {
											var statement = "var value = "+content_item.load_mask[z]+";";
											eval(statement);
											post_data[z] = value;	
										} else {
											post_data[z] = page_data[content_item.load_mask[z]];	
										}
									}	
									branch.root.post(branch.root.actions, post_data, function(data) {
										$discussion.find('.discussion_content').first().html("");
										self.parse(data, $discussion.find('.discussion_content').first());
									}, "json"); // "json"								
									branch.loaded_objects[page.id].loaded();
								},
								parse: function(data, $parent_object) {
									var self = this;
									for(var x in data) {
										(function(data_value) {
											$parent_object.append("<div class='discussion_comment' id='"+data_value.id+"'><div class='username'>"+data_value.email+":<div class='reply_button'>reply</div></div><div>"+data_value.content+"</div></div>");
											var $comment = $parent_object.find('.discussion_comment#'+data_value.id).first();
											$comment.find('.reply_button').click(function() {
												self.parent_id = data_value.id;
												$comment_object.focus();
											});
											self.parse(data_value.children, $comment);
										}(data[x]));
									}
								}
							}
						};
						/*$discussion.find('.comment').keyup(function(e) {
							 
						});*/
						branch.root.events.press_enter($comment_object, function() {
							branch.root.post(branch.root.actions, {
								action: '_make_comment',
								content: $comment_object.val(),
								reference_id: page_data.id,
								reference_type: page.id,
								parent_id: discussion_object.operation.parent_id
							}, function(data) {
								//////alert(data);
							});
						}, function() {
							$comment_object.val("");
							discussion_object.operation.load();
							discussion_object.operation.parent_id = -1;	
						});
						discussion_object.operation.load();
						break;
					/*case 'calendar':
						break;*/
					default:
						/*if(typeof branch.root.elements[content_item.type] !== 'undefined') {
							alert(content_item.type);
							branch.root.elements[content_item.type].init(content_item, $container, page_data, branch, page);
						} else {*/
						if(typeof branch.root.custom_elements !== 'undefined') {
							var statement = "var custom_element_object = branch.root.custom_elements."+content_item.type+".init(content_item, $container, page_data, branch, page)";
							eval(statement);
							if(typeof custom_element_object !== 'undefined' && custom_element_object != null) {
								$content_item_element = custom_element_object.$element;
								content_item_object = custom_element_object;
							}
						}
						break;
					/*case 'tags':
						var id = content_item.id;
						var statement = "var value = page_data."+id+";";
						eval(statement);
						var caption = "";
						if(typeof content_item.caption !== 'undefined') {
							caption = "<div class='caption'>"+content_item.caption+"</div>";
						}
						$container.append("<div class='tags' id='"+content_item.id+"'>"+caption+value+"</div>");
						$content_item_element = $container.find('.title#'+content_item.id).first();
						branch.loaded_objects[page.id].loaded();
						break;*/
				}
				if(typeof content_item.requirement_callback !== 'undefined') { // && typeof $content_item_element !== 'undefined'
					var post_data = {
						action: content_item.requirement_callback	
					};
					
					for(var x in content_item.requirement_data_mask) {
						post_data[content_item.requirement_data_mask[x]] = page_data[x];
					}
					branch.root.post(branch.root.actions, post_data, function(data) {
						if(data == 1) {
							$content_item_element.show();	
						} else {
							$content_item_element.hide();	
						}
					});
				}
				if(typeof content_item.dependencies !== 'undefined') {
					var dependency_callback = function(dependencies, $input) {
						return function(self) {
							for(var z in dependencies) {
								var dependency = dependencies[z];
								var link = dependency.link;
								link = link.split(".");
								var form = link[0];
								var form_element = link[1];
								//var form_object = branch.root.elements.forms[form];
								
								var split = form.split("_");
								var type = split[split.length-1]+"s";
								if(form == "page_data") {
									type = "page_data";
								}
								if(type == 'page_data') {
									var show = false;
									var hide = false;
									if(typeof page_data === 'undefined') {
										page_data = {};	
									}
									//////console.log(page_data);
									//////alert(form_element);
									//var statement = "var linked_value = page_data."+form_element+";";
									var linked_value = page_data[form_element];
									//////alert("instance_count: "+page_data.instance_count);
									//////alert(page_data);
									//////alert("instance_count: "+page_data.instance_count);
									//eval(statement);
									if(dependency.value == 'unset') {
										if(typeof linked_value === 'undefined' || linked_value == "-1") {
											show = true;
											/*if(typeof content_item_object !== 'undefined') {
												content_item_object.operation.load();	
											}*/
										} else {
											hide = true;
											//$content_item_element.hide();	
										}
									} else if(dependency.value == "set") {
										if(typeof linked_value !== 'undefined' && linked_value != "-1") {
											show = true;
											/*if(typeof content_item_object !== 'undefined') {
												content_item_object.operation.load();	
											}*/
										} else {
											hide = true;
										}
									} else {
										//////alert(linked_value);
										//////alert(dependency.value);

										if(Array.isArray(dependency.value)) {
											if(dependency.value.indexOf(linked_value) !== -1) {
												show = true;
											} else {
											}
										} else if(typeof linked_value !== 'undefined' && linked_value == dependency.value) {
											show = true;
											/*if(typeof content_item_object !== 'undefined') {
												content_item_object.operation.load();	
											}*/	
										} else {
											hide = true;	
										}
									}
									if(show) {
										if($content_item_element.attr('id').indexOf('table') != -1) {
											$content_item_element.parent().show();
										} else {
											$content_item_element.show();
										}
									}
									if(hide) {
										if($content_item_element.attr('id').indexOf('table') != -1) {
											$content_item_element.parent().hide();
										} else {
											$content_item_element.hide();
										}
									}
								} else {
									var statement = "var form_object = branch.root.elements."+type+"['"+form+"']";
									eval(statement);
									
									var $linked_form = form_object.$element;
									var $linked_element = $linked_form.find('#'+form_element).first();

									var is_table = false;
									//alert($content_item_element.attr('id').lastIndexOf('table'));
									//alert($content_item_element.attr('id').length-5);
									if($content_item_element.attr('id').lastIndexOf('table') == $content_item_element.attr('id').length-5) {
										is_table = true;
									}
									$linked_element.change(function() {
										var linked_value;
										if($(this).hasClass('radio_buttons')) {
											linked_value = $(this).find('input[type=radio]:checked').val();	
										} else {
											linked_value = $(this).val();
										}
										//////alert(dependency.link);
										//////alert(linked_value);
										/*var is_table = false;
										//alert($content_item_element.attr('id').lastIndexOf('table'));
										//alert($content_item_element.attr('id').length-5);
										if($content_item_element.attr('id').lastIndexOf('table') == $content_item_element.attr('id').length-5) {
											is_table = true;
										}*/
										if(dependency.value == "set") {
											if(linked_value != "-1") {
												if(is_table) {
													$content_item_element.parent().show();
												} else {
													$content_item_element.show();
												}
												/*if(typeof content_item_object !== 'undefined') {
													content_item_object.operation.load();	
												}*/
											} else {
												if(is_table) {
													$content_item_element.parent().hide();
												} else {
													$content_item_element.hide();
												}
											}
										} else {
											if(Array.isArray(dependency.value)) {
												if(dependency.value.indexOf(linked_value) !== -1) {
													//show = true;
													if(is_table) {
														$content_item_element.parent().show();
													} else {
														$content_item_element.show();
													}
												} else {
												}
											} else if(linked_value == dependency.value) {
												if(is_table) {
													$content_item_element.parent().show();
												} else {
													$content_item_element.show();
												}
												//$content_item_element.show();
												/*if(typeof content_item_object !== 'undefined') {
													content_item_object.operation.load();	
												}*/	
											} else {
												if(is_table) {
													$content_item_element.parent().hide();
												} else {
													$content_item_element.hide();
												}
											}
										}
									}); //.trigger('change');
									if(is_table) {
										$content_item_element.parent().hide();
									} else {
										$content_item_element.hide();
									}
									branch.form_element_dependencies_linked_elements[form+'_'+$linked_element.attr('id')] = $linked_element;
								}
							}
							self.call_next_callback();
							//self.loaded_callbacks[++self.current_loaded_callback](this);
						};
					}(content_item.dependencies, $content_item_element);
					branch.loaded_objects[page.id].loaded_callbacks.push(dependency_callback);
				}
				if(typeof content_item.hidden !== 'undefined') {
					$content_item_element.hide();
				}
				branch.loaded_objects[page.id].dependency_set();
			}(content_item));
		}
		/*branch.loaded_objects[page.id].loaded_callbacks.push(function(self) {
			//$container.find('input').trigger('change');
			$container.find('select').each(function() {
				//////alert('trigger');
				$(this).trigger('change');
			});
			self.call_next_callback();
		});*/
		branch.loaded_objects[page.id].do_load();
	},
	display_page: function(id) {
		var pages = this.root.definition.pages;
		/*for(var x in pages) {
			if(id == pages[x].id) {
				document.title = pages[x].title;	
			}
		}*/
		var page_object = this.find_page(id);
		if(typeof page_objec.title !== 'undefined') {
			document.title = page_object.title;
		}
	},
	get_pages_data: function(page_ids) {
		var pages = this.root.definition.pages;
		var result = Array();
		for(var y in page_ids) {
			var id = page_ids[y];
			for(var x in pages) {
				if(id == pages[x].id) {
					result.push(pages[x]);	
				}
			}
		}
		return result;
	},
	find_page: function(page_id) {
		return this.get_pages_data(Array(page_id))[0];	
	},
	apply_load_mask: function(post_data, load_mask, page_data, conform_ids) {
		var branch = this;
		for(var z in load_mask) {
			if(load_mask[z].indexOf("'") === 0) {
				post_data[z] = load_mask[z].split("'").join("");
				//alert(post_data[z]);
			} else if(load_mask[z].indexOf('.') != -1 && load_mask[z].indexOf('page_data.') != 0) {
				//var statement = "var value = "+load_mask[z]+";";
				//eval(statement);
				var link = load_mask[z];
				link = link.split(".");
				var form = link[0];
				var form_element = link[1];
				

				var callback_object = branch.root.elements.find_element_object(form);
				if(typeof callback_object === 'undefined') {
					branch.loaded_objects[branch.current_page.id].loaded_callbacks.push(function(self) {
						branch.apply_load_mask(post_data, load_mask, page_data, conform_ids);
						self.call_next_callback();
					});
				} else {
				
					var value = callback_object.$element.find('#'+form_element).val();
					
					post_data[z] = value;	
				}
			} else if(load_mask[z] == "null") {
				post_data[z] = null;
			} else {
				post_data[z] = page_data[load_mask[z]];	
				if(load_mask[z] == 'user_id' && typeof page_data[load_mask[z]] === 'undefined') {
					post_data[z] = branch.root.user_id;
				}
			}
		}
		////console.log(post_data);
		////console.log(load_mask);
		////console.log(page_data);
		if(conform_ids) {
			
		}
	},
	column_projection: function(data, projection_map) {
		if(typeof data === 'object') {

			var result = Object.keys(data).map((e) => {
				var item = data[e];
				for(var x in projection_map) {
					if(typeof data[e][x] !== 'undefined') {
						item[projection_map[x]] = item[x];
					}
				}
				return item;
			});
			return result;
		}
		var result = data.map((e) => {
			var item = e;
			for(var x in projection_map) {
				if(typeof e[x] !== 'undefined') {
					item[projection_map[x]] = e[x];
				}
			}
			return item;
		});
		return result;
	},
	view: {
		textarea: {
			call_resize: function($textarea) {
				var text = $textarea[0];//document.getElementById('text');
				text.style.height = 'auto';
				text.style.height = text.scrollHeight+'px';
			
			},
			init: function($textarea) {
				var branch = this;
				var observe;
				if (window.attachEvent) {
					observe = function (element, event, handler) {
						element.attachEvent('on'+event, handler);
					};
				} else {
					observe = function (element, event, handler) {
						element.addEventListener(event, handler, false);
					};
				}
				function init() {
					var text = $textarea[0];//document.getElementById('text');
					function resize () {
						text.style.height = 'auto';
						text.style.height = text.scrollHeight+'px';
					}
					/* 0-timeout to get the already changed text */
					function delayedResize () {
						window.setTimeout(resize, 0);
					}
					observe(text, 'change',  resize);
					observe(text, 'cut',     delayedResize);
					observe(text, 'paste',   delayedResize);
					observe(text, 'drop',    delayedResize);
					observe(text, 'keydown', delayedResize);
				
					text.focus();
					text.select();
					resize();
				}
				init();
			}
		},
		dummy_div: {
			current_id: 0,
			new: function() {
				this.current_id++;
				$('.dummy_div').first().append("<div id='dummy_"+this.current_id+"'></div>");
				var $dummy_div = $('.dummy_div').find('#dummy_'+this.current_id).first();
				return $dummy_div;
			},
			garbage_collection: function($dummy_div) {
				//var id = $dummy_div.attr('id');
				//var id = id.split("_")[1];
				$dummy_div.remove();
			}
		},
		disappear_count: 0,
		display_changes: function($container, $dummy_div, callback) {
			var self = this;
						
			this.disappear_count = 0;
			var container_ids = [];
			var new_ids = [];
			$container.children().each(function() {
				var id = $(this).attr('id');
				container_ids[id] = true;//container_ids.push(id);
			});
			$dummy_div.children().each(function() {
				var id = $(this).attr('id');
				new_ids[id] = true;
				//new_ids.push(id);
			});
			
			var disappear = [];
			var appear = [];
			for(var x in container_ids) {
				if(typeof new_ids[x] === 'undefined') {
					disappear.push(x);	
				}
			}
			for(var x in new_ids) {
				if(typeof container_ids[x] === 'undefined') {
					appear.push(x);	
				}
			}
			var appear_callback = function() {
				for(var z in appear) {
					$dummy_div.find('#'+appear[z]).css('display', 'none');//hide();	 //addClass('hidden');
					//////alert(x);
				}
				$container.html("");
				$dummy_div.children().each(function() {
					$(this).clone(true, true).appendTo($container);
				});
				//$container.html($dummy_div.html());
				setTimeout(function() {
					for(var z in appear) {
						$container.find('#'+appear[z]).slideDown('slow');	
					}
				}, 150);
				//$dummy_div.remove();
			}
			
			for(var x in disappear) {
				$container.find('#'+disappear[x]).slideUp('fast',
				function() {
					self.disappear_count++;				
					if(self.disappear_count == disappear.length) {
						appear_callback();
					}
				});	
			}
			if(disappear.length == 0) {
				appear_callback();
				if(typeof callback !== 'undefined') {		
					callback();
				}
			}
		},
		date: {
			date_cell: function($container, time, popover) {
				var branch = this;
				var date_content = $container.text();
				$container.data("original_date", date_content);
				var date_formatted = branch.date_format(date_content, time);
				$container.html(date_formatted);
				if(popover) {
					branch.date_popover($container);
				}
			},
			date_popover: function($container) {
				//////alert($container.text());
				var branch = this;
				var original_date = $container.data("original_date");
				original_date = original_date.split(" ")[0];
				var date_split = original_date.split("-");
				$container.click(function() {
					branch.root.post(branch.root.actions, {
						action: 'calendar_popover',
						year: date_split[0],
						month: date_split[1],
						day: date_split[2]
					}, function(data) {
						$('.calendar_popover').html(data);
						$('.calendar_popover').find('.day_'+date_split[1]+"-"+date_split[2]+"-"+date_split[0]).css('background', 'rgba(255,255,255,0.1)');
						$('.body_container').addClass('blur');	
						$('.calendar_popover').css({
							'top': '150px',
							'left': '150px',
							'right': '150px',
							'bottom': '150px',
							'display': 'block',
							'opacity': '0'
						}).animate({
							'top': '0px',
							'left': '0px',
							'right': '0px',
							'bottom': '0px',
							'opacity': '1'
						}, 650, 'easeInOutQuint', function() {
							$(this).click(function() {
								$('.body_container').removeClass('blur');	
								$('.calendar_popover').animate({
									'opacity': '0'
								}, 350, 'easeInOutQuad', function() {
									$(this).css('display', 'none');	
								});
							});
						});
					});
				});
			},
			date_picker: function($input) {
				/*$input.focus(function() {
					
				});*/
			},
			date_format: function(datetime, display_time) {
				var datetime = datetime.split(" ");
				var date = datetime[0];
				var time = "";
				if(datetime.length > 1) {
					time = datetime[1];	
				}
				var date_split = date.split("-");
				var year = date_split[0];
				var month = date_split[1];
				var day = date_split[2];
				month = parseInt(month);
				month += "";
				var month_string = "";
				switch(month) {
					case "1":
						month_string = "Jan";				
						break;
					case "2":
						month_string = "Feb";				
						break;	
					case "3":
						month_string = "Mar";				
						break;	
					case "4":
						month_string = "Apr";				
						break;	
					case "5":
						month_string = "May";				
						break;	
					case "6":
						month_string = "Jun";				
						break;	
					case "7":
						month_string = "Jul";				
						break;	
					case "8":
						month_string = "Aug";				
						break;	
					case "9":
						month_string = "Sep";				
						break;	
					case "10":
						month_string = "Oct";				
						break;	
					case "11":
						month_string = "Nov";				
						break;	
					case "12":
						month_string = "Dec";				
						break;			
				}
				
				
				var result = "";
				result += day+" "+month_string+" "+year;
				if(time != "" && display_time) {
					time = time.substr(0, time.length-3);	
					result += " "+time;
				}
				return result;
			}
		},
		single_row_columns: function($parent, set_width) {
			/*var max_widths = Array();
			$parent_container.each(function() {
				$parent = $(this);
				$parent.children().each(function(index) {
					var width = $(this).widht();
					if(typeof max_widths[index] === 'undefined' || max_widths[index] < width) {
						max_widths[index] = width;	
					}
				});
			});*/
			
			var child_count = 0;
			$parent.find('.table_column').each(function() {
				if($(this).css('display') != 'none') {
					child_count++;	
				}
			});
			var width = 100;//$parent.width();
			var max_width = width/child_count;
			//////alert(max_width);
			$parent.children().each(function() {
				/*var child_width = $(this).width();
				if(child_width > max_width) {
						
				}*/
				if(typeof set_width !== 'undefined') {
					$(this).css('width', max_width+"%");
				} else {
					$(this).css('max-width', max_width+"%");
				}
			});
		},
		pop_up: {
			queue: Array(),
			display: function(message, type) {
				var $popup = $('.overlay_black').find('.pop_up').first();
				$popup.find('.message').html(message);
				switch(type) {
					case 'fadeout':
						$('.overlay_black').css('display', 'block');
						$('.body_container').addClass('blur');
						$('.overlay_black').animate({
							'opacity': 1
						}, 600, 'easeOutCirc');
						$popup.css('display', 'block').animate({
							'opacity': 1
						}, 800, 'easeInOutQuad', function() {
							setTimeout(function() {
								$('.body_container').removeClass('blur');
								$('.overlay_black').animate({
									'opacity': 0
								}, 600, 'easeOutExpo', function() {
									$(this).css('display', 'none');	
									
								});
								$popup.animate({
									'opacity': 0
								}, 600, 'easeOutCirc', function() {
									
									$(this).css('display', 'none');	
								});
							}, 2500);
						});
						break;	
				}
			}
		},
	}
};

app.custom_elements.files = {
	type_name: '_files',
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = this;
		branch.content_item = content_item;

		$container.append("<div class='file_upload' id='"+content_item.id+"_files'><div class='upload_button'>Click here to add files</div></div>");

		branch.$container = $container.find('#'+content_item.id+'_files').first();

		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;

		function item_object_constructor(id, $element, element_branch, id_singular, content_item, page_data, $page_container, page) {
			this.id = id;
			this.$element = $element;
			this.element_branch = element_branch;
			this.id_singular = id_singular;
			this.content_item = content_item;
			this.page_data = page_data;
			this.$page_container = $page_container;
			this.page = page;
		}

		var item_object = {
			operation: {
				init: function() {
					var branch = this;
					branch.instance_parent.$element.find('.upload_button').first().click(function() {
						var post_data = {
							'action': 'add_files',
						};

						branch.root.interpretation.apply_load_mask(post_data, branch.instance_parent.content_item.submit_mask, branch.instance_parent.page_data);
						branch.instance_parent.element_branch.root.send(post_data, function(data) {
							//console.log(branch.instance_parent.content_item.on_submit);
							//console.log('call on submit');
							branch.root.interpretation.call_on_submit(branch.instance_parent.content_item.on_submit);
							//branch.instance_parent.$element.find('.upload_button').append(JSON.stringify(data));
						});
					});
				},
				load: function() {
					var branch = this;
					branch.instance_parent.element_branch.root.interpretation.loaded_objects[branch.page.id].loaded();
				},
				submit: function() {
					var branch = this;
					var post_data = {};
				}
			}
		};

		/*item_object_constructor.prototype = {...item_object};

		var item_object = new item_object_constructor(content_item.id, branch.$container, branch, content_item.id_singular, content_item, page_data, $container, page);*/

		var set_item_object = {...item_object};
		set_item_object.id = content_item.id;
		set_item_object.$element = branch.$container;
		set_item_object.element_branch = branch;
		set_item_object.id_singular = content_item.id_singular;
		set_item_object.content_item = content_item;
		set_item_object.page_data = page_data;
		set_item_object.$page_container = $container;
		set_item_object.page = page;
		//set_item_object.branch_root = branch.root;

		branch.root.assign_root_object(set_item_object, true);
		set_item_object.operation.init();

		branch.root.elements.assign_element(branch.type_name, set_item_object, page.id, content_item.id);

		return item_object;
	}
};

