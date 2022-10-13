var base = {
	obj_id: 'root',
	user_id: "-1",
	actions: "actions.php",
	language: 0,
	use_rtc: false,
	main_settings: {
		get_settings: function() {
			var branch = this;
			$.post(branch.root.actions, {
				'action': 'get_main_settings'
			}, function(data) {
				if(typeof data.bold_font !== 'undefined' && data.bold_font == 1) {
					$('head').first().append("<style id='bold_style'> body, input, select, button { font-weight:100 !important; font-family:'helvetica'; }  </style>");
				} else {
					$('head').find('#bold_style').first().remove();
				}
			}, "json");
		}
	},
	update_view: {
		set_table_index: function() {
			var branch = this;
			branch.root.post(branch.root.actions, {
				'action': 'set_view_containers_table_index',
				'table_index': branch.root.view_containers_table_index.table_index,
				'view_constraints': branch.root.view_containers_table_index.___view_constraints
			}, function(data) {

			});
		}
	},
	download: {
		download_file: function(post_data, item_id, files_table) {
			var branch = this;
			post_data = {...post_data};
			post_data.action = 'download_file';
			post_data.files_table = files_table;
			branch.root.post("actions.php", post_data);
			//branch.root.ws.send(post_data);
			//branch.root.loading.display_loading_overlay(true);
		},
		download_file_alt: function(data, content_item_id_singular) {
			var branch = this;
			var post_data = {
				'action': 'get_'+content_item_id_singular
			};
			for(var x in data) {
				post_data[x] = data[x];
			}
			post_data.part = 0;
			post_data.token = null;
			var total_file = [];
			var filename = null;
			var token = null;
			post_data.force = false;
			branch.root.loading.display_loading_overlay(true);
			var download_file = function(post_data) {
				branch.root.post(branch.root.actions, post_data, function(data) {
					//alert(data.part);
					//alert(data.total_parts);
					////console.log(data);
					if(typeof data.valid !== 'undefined') {
						if(data.valid == -1) {
							branch.root.dialog.init("File could not be downloaded because it is to large, please use the Noob Cloud application to download this file.", undefined, undefined, function() {

							});
							branch.root.dialog.show();
						} else if(data.valid == -2) {
							branch.root.dialog.init("You can only download one file at a time, do you want to cancel the other download?", function() {
								post_data.force = true;
								download_file(post_data);
							}, function() {
							});
							branch.root.dialog.show();
						} else if(data.valid == -3) {
							branch.root.dialog.init("This download was canceled.", undefined, undefined, function() {

							});
							branch.root.dialog.show();
						} 
					} else {
						branch.root.loading.set_progress_bar(data.part, data.total_parts);
						if(typeof data.filename !== 'undefined') {
							filename = data.filename;
						}
						if(typeof data.token !== 'undefined') {
							token = data.token;
						}
						total_file.push(data.file_value);
						if(typeof data.total_parts === 'undefined' || data.part == data.total_parts-1) {
							branch.root.loading.hide_loading_overlay();
							var file_value = total_file.join('');
							if(file_value.indexOf('data:image/png;') == 0 || file_value.indexOf('data:application/pdf;') == 0) { //display images and pdfs download otherwise
								window.open(file_value);
							} else {
								branch.download_file_2(filename, file_value);
							}
						} else {
							var send_data = {
								action: post_data.action,
								token: token,
								part: post_data.part+1,
								__unset_plasticity: true
							};
							download_file(send_data);
						}
					}
				}, "json");
			};
			download_file(post_data);
		},
		download_file_2: function(filename, content) {
			/*var blob = new Blob([content]);
			var evt = document.createEvent("HTMLEvents");
			evt.initEvent("click");
			$("<a>", {
				download: filename,
				href: content//webkitURL.createObjectURL(blob)
			}).get(0).dispatchEvent(evt);*/

			$('#dummy_div').html("<a download='"+filename+"' id='to_download'>download</a>");
			$('#dummy_div').find('#to_download').first().attr('href', content)[0].click();
		}
	},
	/*local_update: {
		init: function() {

		},
		tab_id: null,
		register_tab: function() {
			var milliseconds = Date.now();
			var tab_url = window.location.href;
			var tab_id = tab_url+'-'+milliseconds;
			this.tab_id = tab_id;
		},
		send_post: function(post_data) {

		}
	},*/
	view_update: {
		ws_connection: null,
		init: function() {
			var branch = this;
			var url = "wss://noob.software/services/ws";
			var ws_connection = new WebSocket(url);

			ws_connection.onmessage = function(event) {
				var message_data = JSON.parse(event.data);
				switch(message_data.action) {
					case 'update_view':
						branch.root.elements.reload_elements_on_page(undefined, true);
						break;
				}
			};
			ws_connection.onopen = function(event) {

			};
			ws_connection.onclose = function(event) {

			};
			ws_connection.onerror = function(event) {

			};
			this.ws_connection = ws_connection;
		},
		send: function(message) {
			var branch = this;
			branch.ws_connection.send(JSON.stringify(message));
		}
	},
	post: function(action, post_data, callback, datatype, error_callback, callback_type) {
		var branch = this;
		//console.log(post_data);
		var send_update_view = false;
		if(typeof branch.definition !== 'undefined' && typeof branch.definition.plasticity !== 'undefined' && branch.definition.plasticity === true) {
			post_data.__plasticity__ = true;
			post_data.__plasticity__application_id = branch.p_app_id;
			if(post_data.action.indexOf('_') === 0 || post_data.action.indexOf('_insert') != -1) {
				send_update_view = true;
			}
		}
		//$('.overlay_black').append('<div class="color:white !important;">access_granted: '+JSON.stringify(post_data)+"</div>");
		var callback_wrap = callback;
		if(send_update_view) {
			callback_wrap = function() {
				branch.view_update.send({
					'action': 'update_view'
				});
				if(typeof callback !== 'undefined') {
					callback();
				}
			};
		} else {

		}
		if(post_data.action.indexOf('delete') != -1) {
			branch.dialog.init("Are you sure you want to delete this item?", async function() {
				//$.post(action, post_data, callback);
				//move to sub-call
				if(typeof branch.is_local_app !== 'undefined') {
					branch.send(post_data, callback_wrap);
				} else {
					branch.sub_post(action, post_data, callback_wrap, datatype, error_callback, callback_type);
				}
			});
		} else {
			if(typeof branch.is_local_app !== 'undefined') {
				branch.send(post_data, callback_wrap);
			} else {
				branch.sub_post(action, post_data, callback_wrap, datatype, error_callback, callback_type);
			}
		}
	},
	post_alt: async function(action, post_data, callback, datatype, error_callback, callback_type) {
		var branch = this;
		/*if(typeof rtc === 'undefined') {
			rtc = false;	
		}*/
		////console.log(post_data);

		if(typeof branch.definition !== 'undefined' && typeof branch.definition.plasticity !== 'undefined' && branch.definition.plasticity === true) {
			post_data.__plasticity__ = true;
			post_data.__plasticity__application_id = branch.p_app_id;
		}
		/*if(typeof post_data.__unset_plasticity !== 'undefined') {
			delete post_data.__plasticity__;
			delete post_data.__plasticity__application_id;
			delete post_data.__unset_plasticity;
		}*/
		if(typeof post_data.root !== 'undefined') {
			delete post_data.root;
			delete post_data.parent;
			delete post_data.instance_parent;
			delete post_data.instance_root;
		}
		////console.log(post_data);
		if(post_data.action.indexOf('delete') != -1) {
			branch.dialog.init("Are you sure you want to delete this item?", async function() {
				//$.post(action, post_data, callback);
				//move to sub-call
				branch.sub_post(action, post_data, callback, datatype, error_callback, callback_type);
			});
		} else {
			/*if(branch.use_rtc) {
				//console.log('ws_send: ');
				////console.log({...post_data});
				var send_post_data = {};
				send_post_data.app_id = branch.app_id;
				for(var x in post_data) {
					send_post_data[x] = post_data[x];
				}

				var result_data = await branch.ws.send(send_post_data, true);
				//if(datatype == 'json') {
					//result_data = JSON.parse(result_data);
					result_data = result_data.ws_message;
				//}
				//console.log(result_data);
				if(typeof callback !== 'undefined') {
					callback(result_data);
				}
			} else {
				$.post(action, post_data, callback, datatype);
			}*/
			branch.sub_post(action, post_data, callback, datatype, error_callback, callback_type);
		}
	},
	sub_post: async function(action, post_data, callback, datatype, error_callback, callback_type) {
		var branch = this;
		if(branch.use_rtc && typeof post_data.__unset_rtc === 'undefined') {
			var send_post_data = {};
			send_post_data.app_id = branch.app_id;
			for(var x in post_data) {
				send_post_data[x] = post_data[x];
			}
			////console.log(send_post_data);
			//var await_result = true;
			/*if(typeof callback_type !== 'undefined') {
				if(callback_type === 'poll') {
					//await_result = false;
					branch.ws.send(send_post_data, false);
					return {};
				}
			}*/
			var result_data = await branch.ws.send(send_post_data, true);
			//console.log('result data');
			//console.log(result_data);
			if(result_data != null && typeof result_data.error !== 'undefined') {
				switch(result_data.error) {
					case 'no_nc_client':
						setTimeout(function() {
							branch.dialog.init("Lost connection to shared Noob Cloud, this shared cloud may be inactive.", undefined, undefined, function() {
								branch.user_menu.logout();
								//branch.user_menu.display_login_overlay();
							});
							branch.dialog.show();
						}, 1250);
						if(typeof error_callback !== 'undefined') {
							error_callback();
						}
						break;
					case 'no_nc':
						setTimeout(function() {
							branch.dialog.init("Lost connection to Noob Cloud, please check your Noob Cloud application, and try again.", undefined, undefined, function() {
								branch.user_menu.logout();
								//branch.user_menu.display_login_overlay();
							});
							branch.dialog.show();
						}, 1250);
						if(typeof error_callback !== 'undefined') {
							error_callback();
						}
						break;
				}
			} else {
				if(result_data != null && typeof result_data.__user_access !== 'undefined' && result_data.__user_access == '-2') {
					branch.user_menu.display_login_overlay();
				} else {
					//result_data = result_data.message;
					////console.log(result_data);
					
					if(result_data != null) {
						if(typeof result_data._data_info !== 'undefined') {
							delete result_data._data_info;
						}
						if(typeof result_data.__result !== 'undefined' && result_data.__result != null) {
							result_data = result_data.__result;
						}
					}
					if(typeof callback !== 'undefined') {
						console.log('call callback');
						callback(result_data);
					}
				}
			}
		} else {
			if(typeof post_data.__unset_rtc !== 'undefined') {
				delete post_data.__unset_rtc;
			}
			////console.log(post_data);
			$.post(action, post_data, function(data) {
				////console.log(data);
				try {
					if(typeof data !== 'object' && typeof data !== 'array') {
						data = JSON.parse(data);
						if(typeof data.__user_access !== 'undefined' && data.__user_access == '-2') {
							branch.user_menu.display_login_overlay();
							return;
						}
					}
				} catch(exc) {

				}
				if(typeof data.__user_access !== 'undefined' && data.__user_access == '-2') {
					branch.user_menu.display_login_overlay();
				} else {
					//try {
					if(typeof data._data_info !== 'undefined') {
						delete data._data_info;
					}
					////console.log('iiiinside-3');
					if(typeof data.__result !== 'undefined') {
						data = data.__result;
					}
					/*} catch(exp) {

					}*/
					if(typeof callback !== 'undefined') {
						callback(data);
					}
				}
			}, datatype);
		}
	},
	common_functionality: {
		display_share_item: function(item_id, table_id) {
			var branch = this;
			branch.current_panel = "share_item";
			branch.root.elements.forms['share_item_form'].operation.load({
				'item_id': item_id,
				'table_id': table_id
			});
			$('.body_container').first().addClass('blur');
			branch.$share_item.show().find('#share_item').first().show();
			branch.$overlay_black.find('.close_button').show();
			branch.$overlay_black.css({
				'opacity': 0,
				'display': 'block'
			}).animate({
				'opacity': 1
			}, 1250, 'easeInOutQuad', function() {

			});
		},
		current_panel: null,
		init_common: function() {
			var branch = this;
			var $common = $('.overlay_black_alt').first();
			branch.$overlay_black = $common;
			var keys = Object.keys(branch.common_definition);
			//for(var x in keys) {
			var render_callback = function(x) {
				if(x >= keys.length) {
					return;
				}
				var key = keys[x];
				var page = branch.common_definition[key];
				var $frame = $common.find('#'+key+'_wrap').first();
				branch['$'+key] = $frame;
				//$frame.parent().append("");
				branch.root.interpretation.render_page(page, null, $frame, function() {
					render_callback(++x);
				}, {}, null);
			};
			render_callback(0);
			branch.$overlay_black.find('.close_button').first().click(function() {
				branch.hide_panel(branch.current_panel);
				//branch.hide_share_item();
				//$(this).hide();
			});
		},
		hide_share_item: function() {
			var branch = this;
			$('.body_container').removeClass('blur');
			branch.$overlay_black.animate({
				'opacity': 0
			}, 1250, 'ease_out_x_2', function() {
				$(this).css('display', 'none');
				branch.$share_item.hide();
				branch.$overlay_black.find('.close_button').hide();
			});
		},
		display_panel: function(panel_id, form_data) {
			var branch = this;
			branch.current_panel = panel_id;
			var $panel = branch.$overlay_black.find('#'+panel_id+'_wrap').first();
			$('.body_container').first().addClass('blur');
			$panel.first().show();
			branch.$overlay_black.find('.close_button').show();
			branch.$overlay_black.css({
				'opacity': 0,
				'display': 'block'
			}).animate({
				'opacity': 1
			}, 1250, 'easeInOutQuad', function() {

			});
		},
		hide_panel: function(panel_id) {
			//console.log('hide_panel');
			var branch = this;
			var $panel = branch.$overlay_black.find('#'+panel_id+'_wrap').first();
			$('.body_container').removeClass('blur');
			branch.$overlay_black.animate({
				'opacity': 0
			}, 1250, 'ease_out_x_2', function() {
				$(this).css('display', 'none');
				$panel.hide();
				branch.$overlay_black.find('.close_button').hide();
			});
		},
		common_definition: {
			smart_folder: {
				"id": "smart_folder",
				"title": "",
				"no_get_data": true,
				"content": [
					{
						"id": "new_title",
						"type": "title",
						"value": "New smart folder"
					},
					{
						"type": "form",
						"id": "smart_folder",
						"save": true,
						"new": true,
						"content": [
							{
								"type": "text",
								"id": "folder_name",
								"placeholder": "Folder name"
							},
						]
					},
					{
						"type": "form",
						"id": "smart_folder_condition",
						"auto_save": true,
						"auto_duplicate": true,
						"content": [
							{
								"type": "select",
								"id": "column",
								"content": "fetch",
								"post_data": {
									"type": "type"
								}
							},
							{
								"type": "select",
								"id": "operator",
								"content": [
									{
										"id": "greater",
										"title": "Greater than"
									},
									{
										"id": "less",
										"title": "Less than"
									},
									{
										"id": "equals",
										"title": "Equals"
									}
								]
							},
							{
								"type": "text",
								"id": "value",
								"placeholder": "Value"
							},
							{
								"type": "text",
								"id": "date_value",
								"dependencies": [
									{
										"link": "smart_folder_form.column",
										"value": ["created", "modified"]
									}
								]
							}
						]
					}
				]
			},
			share_item: {
				"id": "share_item",
				"title": "",
				"no_get_data": true,
				"content": [
					{
						"id": "share_title",
						"type": "title",
						"value": "Share this item with user(s)"
					},
					{
						"type": "form",
						"id": "share_item",
						"save": "Share",
						"new_on_save": true,
						"title": "Select User",
						"no_id": true,
						"content": [
							/*{
								"type": "text",
								"id": "email",
								"placholder": "User Email",
								"validation": "exists"
							},*/
							{
								"type": "typeahead",
								"id": "email",
								"post_data": {
									"__unset_rtc": "'true'"
								},
								"disallow_new_values": true
								//"__unset_rtc": true
							},
							/*{
								"id": "bookkeeping",
								"type": "checkbox",
								"caption": "Bookkeeping"
							},
							{
								"id": "housekeeping",
								"type": "checkbox",
								"caption": "Bookkeeping"
							}*/
							{
								"type": "hidden",
								"id": "item_id",
								"persist_value": true
							},
							{
								"type": "hidden",
								"id": "table_id",
								"persist_value": true
							}
						],
						"on_submit": [
							"share_items_table"
						],
						"on_load": [
							"share_items_table",
						]
					},
					{
						"type": "table",
						"id": "share_items",
						"target": "share_item_form",
						"post_data": {
							"item_id": "share_item_form.item_id",
							"table_id": "share_item_form.table_id",
						},
						"columns": {
							"user_id": "Share User",	
							//"application_id": "Application",
						},
						"delete": true,
						"column_width": {
							"delete_button": "150px"
						},
					}
				]
			}
		},
	},
	get_user_information: {
		emails: {},
		get_emails: function($container) {
			var branch = this;
			var user_ids = [];
			$container.find('.email').each(function() {
				var id = $(this).attr('id').split('_user')[0];
				if(user_ids.indexOf(id) == -1) {
					user_ids.push(id);
				}
			});
			var send_user_ids = [];
			/*for(var x in this.emails) {
				if(user_ids.indexOf(this.emails[x].user_id) == -1) {
					//user_ids.splice(x, 1);
					send_user_ids.pusH(
				}
			}*/
			/*var result = Object.keys(this.emails).map((e) => {
				var item = data[e];
				if(*/
			for(var x in user_ids) {
				/*var item_offset = branch.emails.map(function(e) {
	                return e.id;
	            }).indexOf(user_ids[x]);*/
	            if(typeof branch.emails[user_ids[x]] == 'undefined') {
	            	send_user_ids.push(user_ids[x]);
	            }
			}
			var assign_emails = function() {
				$container.find('.email').each(function() {
					var $this = $(this);
					var id = $this.attr('id').split('_user')[0];
					var email = branch.emails[id];
					$this.html(email);
				});
			};
			//console.log(send_user_ids);
			if(send_user_ids.length > 0) {
				$.post(branch.root.actions, {
					'action': 'get_user_information',
					'user_ids': send_user_ids
				}, function(data) {
					//console.log(data);
					for(var x in data) {
						branch.emails[data[x].user_id] = data[x].email;
					}
					assign_emails();
				}, "json");
			} else {
				assign_emails();
			}

		}
	},
	delay: async function(time) {
	    await new Promise(r => setTimeout(r, time)); 
	    return true;
	},
	excluded_properties: Array(
		'inherit',
		'parent',
		'root',
		'obj_id',
		'length',
		'$element'
	),
	assign_root_object: function(object, alt_names) {
		var branch_root = this;
		
		function assign_root(object_path, object) {
			var statement = 'var obj = '+object_path+';';
			//alert(statement);
			eval(statement);
			/*if(typeof obj.inherit !== 'undefined' && typeof obj.inherit === 'string') {
				root.functions.inherit(obj.inherit, obj);	
			}*/
			for(var x in obj) {
				if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
					x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined' && x != 'instance_root' && x != 'instance_parent' && x != 'element_branch' && x.indexOf('branch') == -1 && x != 'page_data' && x != 'post_data' && x != 'content_item' && x.indexOf('___') != 0 && (typeof obj[x].root === 'undefined' || typeof obj[x].instance_root === 'undefined')) {
					if(typeof alt_names === 'undefined') {
						obj[x].root = object;
						obj[x].parent = obj;
					} else {
						//console.log('set: '+x);
						obj[x].root = branch_root;
						//obj[x].root = object;
						obj[x].parent = obj;
						obj[x].instance_root = object;
						obj[x].instance_parent = obj;
					}
					obj[x].obj_id = x;//object.substr(object.lastIndexOf('.')+1, object.length-1);
					var str = object_path + '.' + x;
					assign_root(str, object);	
				}
			}
		}
		assign_root("object", object);
	},
	assign_root: function(path) {
		var root = this;
		function assign_root(object) {
			var statement = 'var obj = '+object+';';
			eval(statement);
			if(typeof obj.inherit !== 'undefined' && typeof obj.inherit === 'string') {
				root.functions.inherit(obj.inherit, obj);	
			}
			for(var x in obj) {
				if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
					x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined' && x.indexOf('___') != 0) {
					obj[x].root = root;
					obj[x].parent = obj;
					obj[x].obj_id = x;//object.substr(object.lastIndexOf('.')+1, object.length-1);
					var str = object + '.' + x;
					assign_root(str);	
				}
			}
		}
		/*function inherit(object) {
			var statement = 'var obj = '+object+';';
			eval(statement);
			if(typeof obj.inherit !== 'undefined' && typeof obj.inherit === 'string') {
				root.functions.inherit(obj.inherit, obj);	
			}
			for(var x in obj) {
				if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
					x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined') {
					var str = object + '.' + x;
					inherit(str);	
				}
			}
		}*/
		if(typeof path === 'undefined') {
			assign_root("root");
			//inherit("root");
		} else {
			assign_root(path);
			//inherit(path);	
		}
	},
	print_rgb: function(rgb, alpha) {
		return "rgba("+rgb.r+","+rgb.g+","+rgb.b+","+alpha+')';
	},
	rgb_to_hsv: function(r, g, b) {
	    if (arguments.length === 1) {
	        g = r.g, b = r.b, r = r.r;
	    }
	    var max = Math.max(r, g, b), min = Math.min(r, g, b),
	        d = max - min,
	        h,
	        s = (max === 0 ? 0 : d / max),
	        v = max / 255;

	    switch (max) {
	        case min: h = 0; break;
	        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
	        case g: h = (b - r) + d * 2; h /= 6 * d; break;
	        case b: h = (r - g) + d * 4; h /= 6 * d; break;
	    }

	    return {
	        h: h,
	        s: s,
	        v: v
	    };
	},
	date: {
		get_ytd_value: function() {
			var d = new Date(new Date().getFullYear(), 0, 1);
			return d.toISOString().split('T')[0];
			//return new Date().toISOString();
		}
	},
	numeval: {
		negative_value: function(value) {
			if(typeof value == 'string' || typeof value == 'number') {
				if(value.trim().indexOf('-') == 0) {
					return value.split('-').join('');
				} else {
					return '-'+value.trim();
				}
			}
		},
		is_negative: function(value) {
			var float_value = parseFloat(value);
			if(float_value < 0) {
				return true;
			}
			return false;
		}
	},
	/*color_tags: {
		hsl_values: [
			"0,60%,50%",
			"30,60%,50%",
			"60,60%,50%",
			"90,60%,50%",
			"120,60%,50%",
			"150,60%,50%",
			"180,60%,50%",
			"210,60%,50%",
			"240,60%,50%",
			"270,60%,50%",
			"380,60%,50%",
		],
	},*/
	colors: {
		hsl_values: [
			"0,60%,50%",
			"36,60%,50%",
			"72,60%,50%",
			"108,60%,50%",
			"144,60%,50%",
			"160,60%,50%",
			"216,60%,50%",
			"252,60%,50%",
			"288,60%,50%",
			"324,60%,50%",
		],
		get: function(index) {
			index += 2;
			if(index >= this.hsl_values.length) {
				index -= this.hsl_values.length;
			}
			return this.hsl_values[index];
		},
		hsl_values_interlaced: [],
		generate_interlaced: function() {
			var counter = 0;
			this.hsl_values_interlaced = [];
			while(counter < 5) {
				this.hsl_values_interlaced.push(this.hsl_values[counter]);
				this.hsl_values_interlaced.push(this.hsl_values[counter+5]);
				counter++;
			}
		},
		color_index: 0,
		get_next_color: function(index, interlaced) {
			if(typeof index === 'undefined' || index == null) {
				index = this.color_index;
				//index = 0;
			}
			if(typeof interlaced !== 'undefined') {
				if(this.hsl_values_interlaced.length == 0) {
					this.generate_interlaced();
				}
				if(index >= this.hsl_values_interlaced.length) {
					index = 0;
				}
				this.color_index = index+1;
				return this.hsl_values_interlaced[index];
			} else {
				if(index >= this.hsl_values.length) {
					index = 0;
				}
				this.color_index = index+1;
				return this.hsl_values[index];
			}
		}
	},
	hex_convert: function(colour) {
      	var r,g,b;
	    if ( colour.charAt(0) == '#' ) {
	        colour = colour.substr(1);
	    }
	    if ( colour.length == 3 ) {
	        colour = colour.substr(0,1) + colour.substr(0,1) + colour.substr(1,2) + colour.substr(1,2) + colour.substr(2,3) + colour.substr(2,3);
	    }
	    r = colour.charAt(0) + '' + colour.charAt(1);
	    g = colour.charAt(2) + '' + colour.charAt(3);
	    b = colour.charAt(4) + '' + colour.charAt(5);
	    r = parseInt( r,16 );
	    g = parseInt( g,16 );
	    b = parseInt( b ,16);
        //var a = parseInt(transparency);
        return {
        	r: r,
        	g: g,
        	b: b,
        	//a: a
        };
	},
	generate_random_color: function() {
		return [
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256),
			Math.floor(Math.random() * 256)
		]
	},
	get_length: function(object) {
		var length = 0;
		for(var x in object) {
			length++;	
		}
		return length;
	},
	gather_form: function($container) {
		var $inputs = $container.find('.input_element');
		var object = {};
		
		$inputs.each(function() {
			var id = $(this).attr('id');
			if(typeof id === 'undefined') {
				id = $(this).attr('class').split(" ")[0];	
			}
			object[id] = $(this).val();
			if(object[id].trim().length == 0 || object[id] == "-1") {
				delete object[id];	
			}
		});
		
		return object;
	},
	app_state: {
		watch_exclude: Array(
			'inherit',
			'value',
			'initialized',
			'alterations',
			'exclude'
		),
		path_exclude: Array(
			'login',
			'loading',
			'alterations',
			'content.html'
		),
		watch_included: function(property) {
			for(var x in this.watch_exclude) {
				if(this.watch_exclude[x] == property) {
					return false;	
				}
			}
			return true;
		},
		path_included: function(property) {
			for(var x in this.watch_exclude) {
				if(this.path_exclude[x] == property) {
					return false;	
				}
			}
			return true;
		},
		assign_watch: function(object) {
			var branch = this;
			var root = this.root;
			function assign_watch(obj, path) {
				/*var statement = 'var obj = '+object+';';
				eval(statement);*/
				if(branch.path_included(path)) {
					for(var x in obj) {
						var included = true;
						if(typeof obj.exclude !== 'undefined') {
							if(obj.exclude[x] !== 'undefined') {
								included = false;	
							}
						}
						if(included) {
							/*if(x == 'list') {
								//console.log('path: '+path+'.'+x);
								//console.log('is_array: '+Array.isArray(obj[x]));
								//console.log('typeof: '+typeof obj[x]);
								//console.log(obj[x]);	
							}*/
							if(typeof obj[x] === 'object' && obj[x] != null && typeof obj[x].length === 'undefined' && 
								x != 'root' && x != 'parent' && typeof obj[x].context === 'undefined' && !(obj[x] instanceof jQuery)) {
								var str;
								if(path.length > 0) {
									str = path + '.' + x;
								} else {
									str = x;	
								}
								/*var statement = "var child = branch."+str+";";
								eval(statement);*/
								//console.log('object assign: '+str);
								assign_watch(obj[x], str);	
							} else if(Array.isArray(obj[x]) && branch.watch_included(x)) {
								//console.log('assign array: '+path+"."+x);
								for(var index in obj[x]) {
									var compound_path = path+"."+x+"["+index+"]";
									//console.log('object assign: '+compound_path);
									assign_watch(obj[x][index], compound_path);	
								}
							} else if(!Array.isArray(obj[x]) && typeof obj[x] !== 'object' && typeof obj[x] !== 'function' && branch.watch_included(x)) {
								var object_path;
								if(path.length > 0) {
									object_path = path + '.' + x;
								} else {
									object_path = x;	
								}
								//console.log('watched property: '+object_path);
								var state_set = function(object_path) {
									return function(id, old_value, new_value) {
										//console.log('app_state_set: '+object_path+': '+new_value);
										branch.set_app_state(object_path, new_value);
										return new_value;
									};
								};
								obj.unwatch();
								obj.watch(x, state_set(object_path)/*function(id, old_value, new_value) {
									//if(obj.initialized) {
										var object_path;
										if(path.length > 0) {
											object_path = path + '.' + id;
										} else {
											object_path = x;	
										}
										//console.log('app_state_set: '+object_path+': '+new_value);
										branch.set_app_state(str, new_value);
									//}
								}*/);
							}
						}
					}
				}
			}
			if(typeof object === 'undefined') {
				assign_watch(root, "");
			} else {
				var path = this.root.abs_path(object);
				assign_watch(object, path);	
			}
		},
		app_state_queue: Array(),
		app_state_submit_timeout: null,
		set_app_state: function(path, value) {
			var branch = this;
			/*var path = this.path(obj)+'.'+property;
			path = path.substr(5, path.length-1);*/
			//var value = eval('this.'+path);
			this.app_state_queue.push({
				property: path,
				value: value
			});
			clearTimeout(this.app_state_submit_timeout);
			this.app_state_submit_timeout = setTimeout(function() {
				branch.submit_app_state();
			}, 1000);
		},
		submit_app_state: function() {
			var branch = this;
			//console.log('app_state_queue');
			//console.log(this.app_state_queue);
			$.post(this.root.responder, {
				action: 'submit_app_state',
				app_state: JSON.stringify(this.app_state_queue)		
			}, function(data) {
			});
			branch.app_state_queue = Array();
		},
	},
	parent: function(object, level) {
		if(level > 0) {
			return this.parent(object.parent(), level-1);
		}
		return object.parent();
	},
	find: function(base, object, sub_call) {
		var self = this;
		var statement = 'var obj = this.'+base+';';
		eval(statement);
		if(object == '') {
			return false;
			//return obj;	
		}
		var return_array = [];
		for(var x in obj) {
			var child = base+'.'+x;
			if(x == object) {
				return_array.push(child);	
			} else if(this.excluded_properties.indexOf(x) === -1 && x.substr(0, 2) !== '__') {
				var children_return = self.find(child, object, true);
				for(var x in children_return) {
					return_array.push(children_return[x]);	
				}
			}
		}
		if(typeof sub_call === 'undefined') {
			return return_array[0];	
		}
		return return_array;
		
	},
	eval_object_path: function(object_path, base) {
		if(typeof base !== 'undefined') {
			base = base+".";	
		}
		var statement = "var object = "+base+object_path+";";
		eval(statement);
		return object;
	},
	depth: function(object, base, depth) {
		if(object == base) {
			return depth;	
		}
		/*if(typeof object === 'undefined') {
			return null;	
		}*/
		return this.depth(object.parent, base, depth+1);
		
	},
	traverse: function(object, level) {
		for(var x in object) {
			if(this.excluded_properties.indexOf(x) == -1) {
				this.traverse(object[x], level+1);	
			}
		}
	},
	obj_length: function(obj) {
		var length = 0;
		for(var x in obj) {
			length++;	
		}
		return length;
	},
	path: function(object) {
		//if(typeof object.parent !== 'undefined') {
		if(object.obj_id != 'root') {
			return this.path(object.parent)+'.'+object.obj_id;
		} else {
			return object.obj_id;	
		}
	},
	abs_path: function(object) {
		var path = this.path(object);
		path = path.substr(5, path.length-1);
		return path;
	},
	create_context: function(obj) {
		if(typeof obj.nodeType == 'number') {
			obj.$this = $(obj);
			obj.self = obj;

		} else if(typeof obj == 'object' && typeof obj.nodeType == 'undefined') {
			obj.$this = obj;
			obj.self = obj[0];
		}
	},
	_self: function(obj) {
		var _self = {};
		if(typeof obj.nodeType == 'number') {
			_self.$this = $(obj);
			_self.self = obj;

		} else if(typeof obj == 'object' && typeof obj.nodeType == 'undefined') {
			_self.$this = obj;
			_self.self = obj[0];
		}
		return _self;
	},
	set_state: function(property, obj) {
		/*var path = this.path(obj)+'.'+property;
		path = path.substr(5, path.length-1);
		var value = eval('this.'+path);
		$.post(this.actions, {
			action: 'set_app_state',
			property: path,
			value : value			
		});*/
	},
	/*html: {
		html_data: Array(),
		get_html: function(ids, callback) {
			var self = this;
			var id = ids.pop();
			$.get('/control/html/'+id, 
				function(data) {
					self.html_data[id.substr(0, id.indexOf('.html'))] = data;
					if(ids.length > 0) {
						self.get_html(ids, callback);
					} else {
						callback();	
					}
			});
		}
	},*/
	frame_init: function() {
		var branch = this;
		var win = window.parent;
		window.addEventListener("message", function(event) {
			alert( "received: " + event.data );
			if(event.origin == 'http://noob.software' || event.origin == 'http://www.noob.software') {
				var split;
				var hash = "";
				if(event.data.indexOf('hash') != -1) {
					split = event.data.split('hash:');
					hash = split[1];
					window.location.hash = hash;
				}
			}
		});
		
		
		
	},
	loading_completed: Array(),
	add_event_listeners: function() {
		var branch = this;
		/*window.addEventListener("pageshow", 
			function(evt){
		        if(evt.persisted){
		        setTimeout(function(){
		            window.location.reload();
		        },10);
		    }
		}, false);

		window.addEventListener("hashchange", function(event){
			setTimeout(function() {
				branch.navigation.poll_hash();
			}, 10);
		});*/
	},
	app_init: function(ws_server) {
		var self = this;
		this.extensions();
		//self.assign_root();
		/*$.post(this.actions, {
			action: 'get_sess_id'	
		}, function(data) {
			alert(data);
		});*/
		/*if(window.location.href.trim().indexOf('https') != 0 && window.location.href.trim().indexOf('myndasaga') == -1  && window.location.href.trim().indexOf('192.168') == -1) {
			window.location.href = "https://"+window.location.href.split('http://').join('');
		}*/
		$.post(this.actions, {
			action: 'assets',
			ws_server: ws_server
		}, function(data) {
			//alert(data);
			eval(data);
			for(x in root_assign) {
				var path = root_assign[x];
				//alert(path);
				path = path.substr(0,path.lastIndexOf('.'));
				self.assign_root(path);
			}
			
			if(typeof self.loading !== 'undefined') {
				self.loading.init();
			}
			/*if(typeof self.view_containers_table_index === 'undefined') {
				self.view_containers_table_index = {
					table_index: [
					],
					___update_view_element_index: {
					},
					___view_constraints: {
					},
					___element_update_main_table: {

					},
					set_view_constraint: function(index, constraints) {
						var branch = this;
						index = branch.___element_update_main_table[index];
						var constraints_copy = {...constraints};
						delete constraints_copy.action;
						if(typeof constraints_copy.__date_interval !== 'undefined') {
							var created = {
								__date_from: constraints_copy.__date_interval.date_from,
								__date_to: constraints_copy.__date_interval.date_to,
							};
							delete constraints_copy.__date_interval;
							constraints_copy.created = created;
						}
						this.___view_constraints[index] = constraints_copy;
						branch.root.update_view.set_table_index();
					},
					update_view: function(tables) {
						var branch = this;
						for(var x in tables) {
							var table = tables[x];
							if(table.indexOf('.') == -1) {
								var element_index = branch.___update_view_element_index[table];
								for(var i in element_index) {
									var element = element_index[i];
									if(element.indexOf('form') != -1 && element.indexOf('.') != -1) {
										var element_split = element.split('.');
										var form = element_split[0];
										var form_element = element_split[1];

										var form_object = branch.root.elements.find_element_object(form);
										if(form_object != null) {
											form_object.operation.elements[form_element].operation.load();
										}
									} else {
										var element_object = branch.root.elements.find_element_object(element);
										if(element_object != null) {
											element_object.operation.load();
										}
									}
								}
							} else {
								switch(table) {
									case 'nc.files':
									case 'nc.folders':
										for(var i in branch.root.elements["filebrowsers"]) {
											var filebrowser = branch.root.elements["filebrowsers"][i];
											if(typeof filebrowser !== 'undefined' && filebrowser != null) {
												filebrowser.operation.load();
											}
										}
										break;
								}
							}
						}
					},
				};
			}*/

			self.finish_init();
			
			//self.loading_completed['app_state'] = false;
			//self.loading.init();

			self.main_settings.get_settings();
			self.add_event_listeners();
			//alert(self.login);
			
			/*self.login.init(function() {
				$.post(self.responder, {
					action: 'get_app_state'
				}, function(data) {
					//var data = eval(data);
					for(x in data) {
						var row = data[x];
						var handler = '';
						var obj = data[x].property.split('.');
						for(x = 0; x < (obj.length-1); x = x+1) {
							if(x > 0) {
								handler += '.';
							}
							handler += obj[x];
						}
						var obj = obj[obj.length-2];
						//((row.value.toLowerCase() == 'true' || row.value.toLowerCase() == 'false') && typeof eval(row.value) === 'bool')
						if(isNaN(row.value) && row.value.toLowerCase() != 'false' && row.value.toLowerCase() != 'true') { // && 
							row.value = "'"+row.value+"'";	
						}
						var prop_statement = 'var property = self.'+row.property+';';
						eval(prop_statement);
						if(typeof property !== 'undefined') {
							var statement = 'self.'+row.property+" = "+row.value+";";
							eval(statement);
						} else {
							var init_parent = self.functions.find_init_parent(row.property, 0);
							if(typeof init_parent.post_init_state === 'undefined') {
								init_parent.post_init_state = Array();	
							}
							//var statement = 'this.root.'+row.property+" = "+row.value+";";
							init_parent.post_init_state.push(row);
							init_parent.init_parent_level = 1;	
						}
						//eval('var init = self.'+handler+'.initialized');
						//if(init == false || typeof init === 'undefined') {
						//	statement = 'self.'+handler+'.init();';
						//	eval(statement);
						//	statement = 'self.'+handler+'.initialized = true;';
						//	eval(statement);
						//}
					}
					self.loading.complete('app_state');
					//self.colors.generate_colors(true);
					self.loading.init();	
					self.finish_init();
					//self.menu.init();
					//self.input.init();
					//self.home.init();
					//self.app_state.assign_watch(self.home);
					//$(window).unload(function() {
					$(window).on('unload', function() {
						clearTimeout(self.app_state.app_state_submit_timeout);
						self.app_state.submit_app_state();
					});
					//self.finish_init();
					//self.assign_root();
					//self.user.init();
					//calculator
				}, "json");
			});*/
			
		});
	},
	extensions: function() {
		/*$.extend($.easing, {
			smooth_switch: function (x, t, b, c, d) {
				//console.log('x: '+x);
				//console.log('t: '+t);
				//console.log('b: '+b);
				//console.log('c: '+c);
				//console.log('d: '+d);
				//return c*(t/=d)*t + b;
				return Math.pow(x, 0.22222);
				//return x;
				//return c*Math.pow(x*d, 0.22222)+b;
				//return c*Math.pow(t*d, 0.22222)+b;
			}
		});*/
		if (!Object.prototype.watch) {
			Object.defineProperty(
			Object.prototype,
			"watch", {
				enumerable: false,
				configurable: true,
				writable: false,
				value: function (prop, handler) {
					var old = this[prop];
					var cur = old;
					var getter = function () {
						return cur;
					};
					var setter = function (val) {
						old = cur;
						cur = handler.call(this,prop,old,val);
						return cur;
					};
					
					//if(delete this[prop]) {
						Object.defineProperty(this,prop,{
							get: getter,
							set: setter,
							enumerable: true,
							configurable: true
						});
					//}
				}
			});
		}
		/*if (!Object.prototype.unwatch) {
			Object.defineProperty(Object.prototype, "unwatch", {
				  enumerable: false
				, configurable: true
				, writable: false
				, value: function (prop) {
					var val = this[prop];
					delete this[prop]; // remove accessors
					this[prop] = val;
				}
			});
		}*/
	},
	post_init_state: Array(),
	dump_list: Array(),
	dump: function(html) {
		$('#div_manipulation').html(html);
		return $('#div_manipulation');
	},
	manipulate: {
		list: Array(),
		counter: 0,
		dump: function(html) {
			var class_string = "dump_container_"+(this.counter++);
			var html = "<div class='"+class_string+"'>"+html+"</div>";
			$('#dummy_div').append(html);
			return { 
				$item: $('#dummy_div').find('.'+class_string),
				clear: function() {
					$('#dummy_div').find('.'+class_string).remove();
				}
			};
		}
	},
	manipulate_div: function(html, obj) {
		if(typeof html === 'object') {
			html = html.html();	
		}
		$div_man = $('#div_manipulation');
		$div_man.html(html);
		$div_man.get_html = function() {
			var html = $div_man.html();
			$div_man.html("");
			return html;
		};
		return $div_man;
	},
	shift_phase: false,
	shift_init: function() {
		var self = this;
		$(document).keydown(function(e) {
			var key;
			if(e.which) {
				key = e.which;
			}
			if(e.keyCode) {
				key = e.keyCode;
			}
			if(key == 16) {
				self.shift_phase = true;	
			}
		});
		$(document).keyup(function(e) {
			if(self.shift_phase) {
				var key;
				if(e.which) {
					key = e.which;
				}
				if(e.keyCode) {
					key = e.keyCode;
				}
				if(key == 16) {
					self.shift_phase = false;
				}
			}
		});
	},
	//custom_elements: {},
	current_user: -1,
	functions: {
		copy_object: function(object, copy) {
			for(x in copy) {
				//var str = 'object.'+x+' = copy.'+x;
				//eval(str);
				object[x] = copy[x];
			}	
			//return object;
		},
		inherit: function(parent_path, child) {
			var statement = "var parent_object = this.root."+parent_path+";";
			eval(statement);
			for(x in parent_object) {
				if(typeof child[x] === 'undefined') {
					var str = 'child.'+x+' = parent_object.'+x+';';
					eval(str);
				}
			}	
			return child;
		},
		find_init_parent: function(path, level, cutoff) {
			var prefix;
			if(typeof cutoff === 'undefined') {
				cutoff = 0;	
			}
			/*if(path.indexOf('[') != -1) {
				prefix = path.substr(0, path.indexOf('[', cutoff.length));
			}*/
			if(path.indexOf('.', cutoff) != -1) {
				var end_index = path.indexOf('.', cutoff);
				prefix = path.substr(0, end_index);
				var statement = "var object = this.root."+prefix+";";	
				eval(statement);
				if(typeof object.init !== 'undefined' && level == 0) {
					return object;	
				} else if(object.init !== 'undefined') {
					return this.find_init_parent(path, level-1, end_index);	
				} else if(object.init === 'undefined' && level > 0) {
					return this.find_init_parent(path, level, end_index);	
				} else {
					return this.root;	
				}
			} else {
				return this.root;	
			}
			/*if(typeof object.parent === 'undefined') {
				return null;	
			}
			if(typeof object.parent.init !== 'undefined') {
				return object.parent;	
			} else {
				return this.find_init_parent(object.parent);	
			}*/
		}
	},
	events: {
		press_enter: function($element, event, keyup) {
			$element.keypress(function(e) {
				if(e.which == 13) {
					event();
				}
			});
			if(typeof keyup !== 'undefined') {
				$element.keyup(function(e) {
					if(e.which == 13) {
						keyup();
					}
				});
			}
		},
		double_click_objects: Array(),
		double_click: function($element, callback) {
			var object = {
				$element: $element,
				callback: callback,
				interlope: 0,
				init: function() {
					var self = this;
					this.$element.click(function() {
						if(self.interlope == 0) {
							self.interlope = 1;	
							setTimeout(function() {
								self.interlope = 0;
							}, 250);
						} else if(self.interlope == 1) {
							self.callback();	
							self.interlope = 0;
						}
					});
				}
			};
			object.init();
			this.double_click_objects.push(object);
		}
	},
	set_app_state: function(prop, val) {
		//Gera Queue
		if(!this.init_in_progress) {	//ekki vista upphafsstillingu, einhvernveginn halda utan um hvenær init er í gangi
			$.post('actions.php', {
				action: 'set_app_state',
				property: prop,
				value: val
			}, function(data) {
			});
		}
	},
	replace_append: function($html, $container, $last_item, set_id, prefix) {
		var id = null;
		if(typeof set_id === 'undefined') {
			id = $html.attr('id');//$(html).attr('id');
		} else {
			id = set_id;	
		}
		
		var $pre = $container.find('#'+id);
		if($pre.length == 0) {
			if($last_item == null) {
				$container.append($html);	
			} else {
				$last_item.after($html);	
			}
		} else {
			var focused = false;
			if($pre.find('textarea').is(':focus') || $pre.find('input').is(':focus')) {
				focused = true;	
			}
			if(!focused) {
				$pre.after($html);
				$pre.remove();	
			}
		}
		/*if(typeof prefix !== 'undefined') {
			id = prefix+'_'+id;
		}*/
		return $container.children().last();
		//return $container.find('#'+id).first();
	},
	clear_removed_items: function(items, $container, id_prefix, li_class) {
		var assoc_data = Array();
		for(var x in data) {
			assoc_data[data[x].id] = data[x];			
		}
		
		$container.find('.'+li_class).each(function() {
			var id = $(this).attr('id');
			var id_split = id.split(id_prefix);
			var id_suffix = id_split[1];
			if(typeof assoc_data[id_suffix] === 'undefined') {
				$(this).remove();	
			}
			
		});
	},
	menu: {
		interlope: 0,
		init_menu_items: function() {
			var branch = this;
			$('.logout_button').click(function() {
				branch.root.login.logout();
			});
		},
		been_initialized: false,
		init: function() {
			var branch = this;
			if(!this.been_initialized) {
				this.init_menu_items();
				$('#menu_first').mouseover(function() {
					$('#user_menu_arrow > .menu_arrow').css('background', '#F7F7F7');
				}).mouseleave(function() {
					$('#user_menu_arrow > .menu_arrow').css('background', '#FFF');
				});
				$('#login_panel').click(function() {
					////console.log(branch.interlope);
					//if(branch.interlope == 0) {
						branch.display();
						branch.interlope = 1;	
					/*} else {
						//branch.hide();
						$('#user_menu_focus').blur();
						branch.interlope = 0;	
					}*/
				});
				$('#user_menu_focus').blur(function() {
					
					setTimeout(function() {
						if(document.activeElement != $('#user_menu_focus')[0]) {
							branch.hide();
						}
					}, 300);
				});
				this.been_initialized = true;
			}
		},
		display: function() {
			var branch = this;
			$('#user_menu').show();
			$('#user_menu_arrow').show();
			branch.interlope = 1;
			if(document.activeElement != $('#user_menu_focus')[0]) {
				$('#user_menu_focus').focus();
			}
		},
		hide: function() {
			var branch = this;
			$('#user_menu').hide();
			$('#user_menu_arrow').hide();
			branch.interlope = 0;	
		}
	},
	login_attempts: 0,
	/*user_menu: {

	},*/
	easings: {
		init: function() {
			var NEWTON_ITERATIONS = 4;
			var NEWTON_MIN_SLOPE = 0.001;
			var SUBDIVISION_PRECISION = 0.0000001;
			var SUBDIVISION_MAX_ITERATIONS = 10;
			
			var kSplineTableSize = 11;
			var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);
			
			var float32ArraySupported = typeof Float32Array === 'function';
			
			function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
			function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
			function C (aA1)      { return 3.0 * aA1; }
			
			function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }
			
			function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }
			
			function binarySubdivide (aX, aA, aB, mX1, mX2) {
			  var currentX, currentT, i = 0;
			  do {
				currentT = aA + (aB - aA) / 2.0;
				currentX = calcBezier(currentT, mX1, mX2) - aX;
				if (currentX > 0.0) {
				  aB = currentT;
				} else {
				  aA = currentT;
				}
			  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
			  return currentT;
			}
			
			function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
			 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
			   var currentSlope = getSlope(aGuessT, mX1, mX2);
			   if (currentSlope === 0.0) {
				 return aGuessT;
			   }
			   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
			   aGuessT -= currentX / currentSlope;
			 }
			 return aGuessT;
			}
			
			function LinearEasing (x) {
			  return x;
			}
			
			function bezier (mX1, mY1, mX2, mY2) {
			  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
			  }
			
			  
			
			  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
			  for (var i = 0; i < kSplineTableSize; ++i) {
				sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
			  }
			
			  function getTForX (aX) {
				var intervalStart = 0.0;
				var currentSample = 1;
				var lastSample = kSplineTableSize - 1;
			
				for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
				  intervalStart += kSampleStepSize;
				}
				--currentSample;
				
				var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
				var guessForT = intervalStart + dist * kSampleStepSize;
			
				var initialSlope = getSlope(guessForT, mX1, mX2);
				if (initialSlope >= NEWTON_MIN_SLOPE) {
				  return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
				} else if (initialSlope === 0.0) {
				  return guessForT;
				} else {
				  return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
				}
			  }
			
			  return function BezierEasing (x) {
				if (x === 0 || x === 1) {
				  return x;
				}
				return calcBezier(getTForX(x), mY1, mY2);
			  };
			}
			
			
			var bezier_function = bezier(0.13, 0.88, 0.21, 0.88);
			
			var ease_x_2 = bezier(0.68, 0.04, 0.41, 0.67);
			
			
			var s_results_easing = bezier(0.79, 0.25, 0, 0.93);
			
			var teal = bezier(1, 0.21, 0.29, 0.47);
			var ease_in_out = bezier(1, 0.2, 0.2, 0.77);
			var ease_out = bezier(0.14, 0.47, 0.02, 0.77);
			var ease_out_x = bezier(0.17, 0.62, 0, 0.97);
			var ease_out_x_2 = bezier(0.02, 1, 0, 0.97);
			var ease_out_x_3 = bezier(0.02, 1, 0.76, 0.99);
			var ease_out_x_4 = bezier(0.64, 0.14, 0.23, 0.73);
			var ease_out_x_5 = bezier(0.76, 0.36, 0.26, 0.66);
			var ease_out_x_6 = bezier(0.31, 0.76, 0.35, 0.68);
			var ease_out_x_7 = bezier(0.09, 0.84, 0.48, 0.97);
			
			$.extend($.easing,
			{
				ease_x: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*bezier_function(t/=d)+b; 
				},
				ease_x_2: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_x_2(t/=d)+b; 
				},
				x_results_easing: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*s_results_easing(t/=d)+b; 
				},
				teal: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*teal(t/=d)+b; 
				},
				ease_in_out: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_in_out(t/=d)+b; 
				},
				ease_out: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out(t/=d)+b; 
				},
				ease_out_x: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out_x(t/=d)+b; //t/=d 
				},
				ease_out_x_2: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out_x_2(t/=d)+b; 
				},
				ease_out_x_3: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out_x_3(t/=d)+b; 
				},
				ease_out_x_4: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out_x_4(t/=d)+b; 
				},
				ease_out_x_5: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out_x_5(t/=d)+b; 
				},
				ease_out_x_6: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out_x_6(t/=d)+b; 
				},
				ease_out_x_7: function (x, t, b, c, d) {
				   //return c*(t/=d)*t + b;
				   return c*ease_out_x_7(t/=d)+b; 
				},
				ease_in_out_x: function (x, t, b, c, d) {
					if ((t/=d/2) < 1) return c/2*t*Math.pow(t, 1.5) + b;
					return c/2*((t-=2)*Math.pow(t, 1.5) + 2) + b;
				}
			});
		}
	},
	drag: {
		init: function($body_container, leave_window_callback) {
			var branch = this;
			$body_container.click(function(event) {
				if(event.target == this || typeof $._data(event.target, "events") === 'undefined' || $._data(event.target, "events").click == null) {
					event.stopPropagation();
					$(this).find('.selected:not(.menu_button)').removeClass('selected');
				}
			});
			this.init_secondary(leave_window_callback);
		},
		init_secondary: function(leave_window_callback) {
			var branch = this;
			$(document).on('mousedown', function(e) {
				branch.mouse_is_down = true;
			});
			$(document).on('mouseup', function(e) {
				branch.mouse_is_down = false;
			});
			$(document).on('drop', function(e) {
				branch.mouse_is_down = false;
			});
			$(window).on('mouseout', function(e) {
				e = e ? e : window.event;
			    var from = e.relatedTarget || e.toElement;
			    if(!from || from.nodeName == "HTML") {
			    	//console.log(branch.mouse_is_down);
			    	//console.log(branch.root.user_id);
			    	if(branch.mouse_is_down && branch.root.user_id != -1) {
				    	$('.hover_selected').removeClass('hover_selected');
				    	if(typeof leave_window_callback !== 'undefined') {
					    	leave_window_callback();
					    }
					}
			    }
			});
		},
		mouse_is_down: false,
		assign_pages_unselect: function($body_container) {
			$body_container.find('.page').each(function() {
				$(this).off('click.unselect').on("click.unselect", function(event) {
					if(event.target == this || typeof $._data(event.target, "events") === 'undefined' || $._data(event.target, "events").click == null) {
						event.stopPropagation();
						$body_container.find('.selected:not(.menu_button)').removeClass('selected');
					}
				});
			});
		},
		select_item: function(e, $item, $main_container, $body_container) {
			//console.log($item[0]);
			if(e.shiftKey) {

			} else {
				$body_container.find('.selected:not(.menu_button)').removeClass('selected');
			}
			$item.addClass('selected');
			e.stopPropagation();
		},
		drag_reorder: function($container, $items, callback, children_callback) {
			if(typeof $container.attr('sort_column') === 'undefined' || $container.attr('sort_column') != 'order') {
				$container.on('drop', function(event) {
					event.preventDefault();  
					event.stopPropagation();
					event.dataTransfer = event.originalEvent.dataTransfer;
					var id_value = event.dataTransfer.getData("id");
					var id = id_value.split('_');
					var id_prefix = id[0];
					var id_suffix = id[1];
					
					callback(id_prefix, null, id_suffix);
				
				});
				$container.on('dragover', function(event) {
					event.preventDefault();
				});
				$items.each(function() {
					var $li = $(this);
					$li.attr('draggable', 'true');
					$li.on('dragstart', function drag(event) {
						event.stopPropagation();
						event.dataTransfer = event.originalEvent.dataTransfer;
						event.dataTransfer.setData("id", $(this).attr('id')); 
						
					});
					$li.on('dragover', function(event) {
						event.preventDefault();
					});
					$li.on('drop', function(event) {
						var _this = this;
						event.preventDefault();  
						event.stopPropagation();
						event.dataTransfer = event.originalEvent.dataTransfer;
						var id_value = event.dataTransfer.getData("id");
						var id = id_value.split('_');
						var id_prefix = id[0];
						var id_suffix = id[1];
						var $this = $(this);
						if($container.find('#'+id_value).length == 0) {
							var this_id_split = this.id.split('_');
							callback(id_prefix, this_id_split[0], id_suffix);
						} else {
							$this.before($container.find('#'+id_value).first());
							callback();
						}
					});
					if(typeof children_callback !== 'undefined') {
						$li.find('.children').first().on('drop', function(event) {
							event.preventDefault();  
							event.stopPropagation();
							event.dataTransfer = event.originalEvent.dataTransfer;
							var id_value = event.dataTransfer.getData("id");
							children_callback($li.attr('id'), id_value);  
						}).on('dragover', function(event) {
							$(this).addClass('hover_selected');
						}).on('dragleave', function(event) {
							$(this).removeClass('hover_selected');
						});

					}
				});
			}
		}
	},
	init: function() {
		this.easings.init();
		this.user_menu.init();
	},
	/*post: function(data, datatype) {

	},*/
	/*user_menu: {
		$user_menu: null,
		$overlay: null,
		$main_wrap: null,
		login_callbacks: Array(),
		init: function() {
			var branch = this;
			branch.$user_menu = $('.user_menu');
			branch.$overlay_black = $('.overlay_black').first();
			branch.$main_wrap = $('.main_wrap').first();

			if(typeof branch.root.navigation !== 'undefined') {
				branch.root.navigation.poll_hash();
			}
			
			var $sign_in = branch.$user_menu.find('button.sign_in').first();
			$sign_in.click(function() {
				var username = branch.$user_menu.find('.username').first().val();
				var password = branch.$user_menu.find('.password').first().val();
				branch.$user_menu.find('.username').first().val("");
				branch.$user_menu.find('.password').first().val("");

				$.post(branch.root.actions, {
					'action': 'login',
					'username': username,
					'password': password
				}, function(data) {
					if(data.result === true) {
						branch.remove_login_overlay();
					} else {

					}
				}, "json");

			});

			$.post(branch.root.actions, {
				'action': 'is_logged_in'
			}, function(data) {
				if(data.result === true) {
					branch.remove_login_overlay();
				} else {
					//branch.display_login_overlay();
				}
			}, "json");
		},
		remove_login_overlay: function() {
			var branch = this;

			if(branch.login_callbacks.length > 0) {
				for(var x in branch.login_callbacks) {
					branch.login_callbacks[x]();
				}
				branch.login_callbacks = Array();
			}

			branch.$main_wrap.removeClass('blur');
			branch.$overlay_black.animate({
				'opacity': 0
			}, 650, 'ease_out_x_4', function() {
				branch.$overlay_black.css('display', 'none');
			});
		},
		display_login_overlay: function() {
			var branch = this;
			
			branch.$main_wrap.addClass('blur');
			branch.$overlay_black.css({
				'display': 'unset',
				'opacity': 1
			}).animate({
				'opacity': 1
			}, 650, 'ease_out_x_3', function() {
			});
		}
	},*/
	user_menu: {
		username: null,
		password: null,
		main_callback_store: null,
		main_callback: null,
		continue_get_username: function() {
			var branch = this;
			////console.log('noob_login_token: '+localStorage.getItem('noob_login_token'));
			////console.log('-----continue');
			//var callback = function() {
				/*if(branch.root.use_rtc) {
					if(branch.root.user_id == -1) {
						branch.display_login_overlay();
					} else {
						branch.remove_login_overlay();
						if(typeof branch.root.navigation !== 'undefined') {
							branch.root.navigation.poll_hash();
						}
						if(typeof branch.main_callback !== 'undefined' && branch.main_callback != null) {
							var callback = branch.main_callback;
							////console.log('callback---');
							////console.log(callback);
							branch.main_callback = null;
							callback();
						}
						if(typeof localStorage.getItem('noob_login_token') !== 'undefined' && localStorage.getItem('noob_login_token') != null && localStorage.getItem('noob_login_token') != '-1'  && branch.root.use_rtc) {
							var local_storage_token = JSON.parse(localStorage.getItem('noob_login_token'));
							$('a#user_name.user_name').html(local_storage_token.email);
						}
					}
				} else {*/
					$.post(branch.root.actions, {
						action: 'get_user_id'	
					}, function(data) {
						//console.log(data);
						branch.root.user_id = data.user_id;
						var get_user_id_callback = function(data) {
							//console.log('user_id_callback');
							//console.log(data);

							if(data.user_id == '-1') {
								console.log('in');
								if(typeof branch.root.use_rtc === 'undefined' || branch.root.use_rtc === false) {
									console.log('in');
									if(typeof branch.root.navigation !== 'undefined') {			
									console.log('in');
										branch.root.navigation.poll_hash_wrap();
									} else {
										branch.display_login_overlay();
									}
									//console.log('poll');
								} else {
									branch.display_login_overlay();
								}
							} else {

								if(typeof branch.root.navigation !== 'undefined' && !branch.root.navigation.plasticity_delay) {//!branch.root.navigation.hash_polling_in_progress) {		
									branch.root.navigation.poll_hash_wrap();
								}
								console.log('---remove_login_overlay');
								branch.remove_login_overlay();
								if(typeof branch.main_callback !== 'undefined' && branch.main_callback != null) {
									var callback = branch.main_callback;
									console.log('callback---');
									////console.log(callback);
									branch.main_callback = null;

									callback();
								}
								/*if(branch.root.use_rtc && branch.root.user_id != -1) {

									if(typeof branch.root.navigation !== 'undefined') { 		
										branch.root.navigation.reload_hash();
									}
								}*/
								$('a#user_name.user_name').html(data.email);
								/*branch.root.post(branch.root.actions, {
									action: 'get_username'	
								}, function(data) {
								});*/
							}
						};
						if(typeof branch.root.use_rtc !== 'undefined' && branch.root.use_rtc && branch.root.user_id != -1) {
							if(!branch.root.logged_in_rtc) {
								branch.root.ws.login(data.email, data.password, get_user_id_callback, data);
							} else {
								console.log('is logged in rtc');
								get_user_id_callback(data);
							}
						} else {
							if(typeof get_user_id_callback !== 'undefined') {
								get_user_id_callback(data);
							}
						}
						//alert(branch.root.ws.client_id);
						/*if(data == "-1" || (branch.root.use_rtc && branch.root.ws.client_id == -1)) {
							//$('.logged_in_options').hide();
							//$('.logged_out_options').show();
							if(typeof branch.root.definition.preferences !== 'undefined' && typeof branch.root.definition.preferences.app_login !== ' undefined' && branch.root.definition.preferences.app_login == true || typeof branch.root.definition.preferences === 'undefined' || typeof branch.root.definition.preferences.app_login === 'undefined') {
								
								//alert(branch.root.ws.client_id);
								branch.display_login_overlay();
							}
						} else {	
							if(typeof branch.root.definition.preferences !== 'undefined' && typeof branch.root.definition.preferences.app_login !== ' undefined' && branch.root.definition.preferences.app_login == true || typeof branch.root.definition.preferences === 'undefined' || typeof branch.root.definition.preferences.app_login === 'undefined') {
								branch.remove_login_overlay();
								// else {
								branch.root.post(branch.root.actions, {
									action: 'get_username'	
								}, function(data) {
									$('a#user_name.user_name').html(data);
								});
								//}
							}
							if($('.console').length > 0) {
								$('.console').addClass('console_back');
							}
							if(typeof branch.main_callback !== 'undefined' && branch.main_callback != null && (typeof branch.root.use_rtc === 'undefined' || branch.root.use_rtc === false)) {
							
								var callback = branch.main_callback;

								branch.main_callback = null;
								callback();
							}
						}
						//alert(data);
						if(!(typeof branch.root.definition.preferences !== 'undefined' && typeof branch.root.definition.preferences.app_login !== ' undefined' && branch.root.definition.preferences.app_login == true || typeof branch.root.definition.preferences === 'undefined' || typeof branch.root.definition.preferences.app_login === 'undefined')) {
							branch.remove_login_overlay();
						}*/
					}, "json");
				//}
			//};
			//callback();
		},
		get_username: function() {
			var branch = this;
			
			/*if(typeof localStorage.getItem('noob_login_token') !== 'undefined' && localStorage.getItem('noob_login_token') != null && localStorage.getItem('noob_login_token') != '-1' && branch.root.use_rtc) {
				//alert('token');
				//alert(localStorage.getItem('noob_login_token'));
				branch.root.ws.client_login_init(localStorage.getItem('noob_login_token'));
			} else {*/
				this.continue_get_username();
				//callback();
			//}
		},
		login_callbacks: Array(),
		init: function(callback) {
			var branch = this;
			branch.main_callback = callback;
			branch.main_callback_store = callback;
			if(typeof branch.root.use_rtc !== 'undefined' && branch.root.use_rtc === true) {
				branch.root.loading.display_loading_overlay(undefined, true);
			}
			$('#body.night').click(function() {
				$('.console').addClass('console_back');
				$('.body_container').removeClass('blur');
				$('#body').animate({
					'opacity': "0"
				}, 700, 'easeOutQuad', function() {
					$(this).css({
						'display': 'none'
					});	
				});
				
				$('.overlay_black').animate({
					'opacity': "0"
				}, 1000, 'easeOutQuad', function() {
					$(this).css({
						'opacity': '0',
						'display': 'none'
					});
				});
			});
			$('#overview_button').click(function() {
				$('.console').removeClass('console_back');
				$('.body_container').addClass('blur');
				$('#body').css({
					'opacity': '1',
					'display': 'block'
				});
				/*$('.app_select').css({
					'opacity': '1',
					'display': 'block'
				});*/
				$('.overlay_black').css({
					'opacity': '0',
					'display': 'block'
				}).animate({
					'opacity': "1"
				}, 900, 'easeInOutQuad', function() { //easeInOutExpo
					
				});
				/*setTimeout(function() {
					$('#body').css({
						'opacity': '0',
						'display': 'block'
					}).	animate({
						'opacity': "1"
					}, 700, 'easeInOutQuint');
				}, 20);*/
			});
			$('.user_button').click(function() {
				$('.overlay_black .loading').hide();
				$('.console').removeClass('console_back');
				$('.body_container').addClass('blur');
				$('.overlay_black').css({
					'opacity': '0',
					'display': 'block'
				}).animate({
					'opacity': "1"
				}, 700, 'easeInOutQuint', function() {
					
				});
				setTimeout(function() {
					$('.user_options').css({
						'opacity': '0',
						'display': 'block'
					}).	animate({
						'opacity': "1"
					}, 300, 'easeOutQuad');
				}, 100);
			});
			$('.back').click(function() {
				$('.console').addClass('console_back');
				$('.body_container').removeClass('blur');
				$('.user_options').animate({
					'opacity': "0"
				}, 1000, 'easeInOutQuint', function() {
					$(this).css({
						'display': 'none'
					});	
				});
				
				$('.overlay_black').animate({
					'opacity': "0"
				}, 1000, 'easeOutQuad', function() {
					$(this).css({
						'opacity': '0',
						'display': 'none'
					});
				});
			});
			$('.logout').click(function() {
				$.post(branch.root.actions, {
					action: 'logout'	
				}, function(data) {
					//window.location.reload();
					branch.main_callback = branch.main_callback_store;
					localStorage.setItem('noob_login_token', "-1");
					//console.log('unset_login_token');
					branch.root.user_id = "-1";
					if(branch.root.use_rtc) {
						branch.root.ws.close_connection();
					}
					$('.logged_in_options').hide();
					$('.logged_out_options').show();
					$('.user_options').animate({
						'opacity': "0"
					}, 700, 'easeInOutQuint', function() {
						$(this).css({
							'display': 'none'
						});	
					});
					setTimeout(function() {
						$('.login').css({
							'opacity': '0',
							'display': 'block'
						}).animate({
							'opacity': "1"
						}, 1000, 'easeOutExpo');
					}, 300);
				});
			});
			$('.option_title.sign_in_button').click(function() {
				$('.user_options').animate({
						'opacity': "0"
				}, 700, 'easeInOutQuint', function() {
					$(this).css({
						'display': 'none'
					});	
				});
				setTimeout(function() {
					$('.login').css({
						'opacity': '0',
						'display': 'block'
					}).animate({
						'opacity': "1"
					}, 1000, 'easeOutExpo');
				}, 300);
			});
			/*$('.user_options > .account').click(function() {
				window.location.href = '/account';
			});*/
			this.root.events.press_enter($('#username'), function() { $('button.sign_in').click() });
			this.root.events.press_enter($('#password'), function() { $('button.sign_in').click() });
			$('button.sign_in').click(function() {
				branch.username = $('.login #username').val();
				branch.password = $('.login #password').val();
				$.post(branch.root.actions, {
					action: 'login',
					username: $('.login #username').val(),
					password: $('.login #password').val()	
				}, function(data) {
					if(data != "-1") {
						branch.root.user_id = data;		
						/*if(typeof branch.root.navigation === 'undefined') {
							branch.remove_login_overlay();
						}*/
						/*branch.root.navigation.recent_hash = "";
						branch.root.navigation.poll_hash();*/
						$('.console').addClass('console_back');
						/*$('.body_container').removeClass('blur');
						$('.login').animate({
							'opacity': "0"
						}, 2500, 'easeOutQuart', function() {
							$(this).css({
								'display': 'none'
							});	
						});
						
						$('.overlay_black').animate({
							'opacity': "0"
						}, 2500, 'easeOutExpo', function() {
							$(this).css({
								'opacity': '0',
								'display': 'none'
							});
						});*/
						var login_callback = function() {
							if(typeof branch.root.navigation !== 'undefined') { 		
								branch.root.navigation.reload_hash();
							}
							//branch.remove_login_overlay();
							branch.get_username();
							

							/*if(typeof callback !== 'undefined') {
								callback();
							}*/
							for(var x in branch.login_callbacks) {
								branch.login_callbacks[x]();	
							}
							branch.login_callbacks = [];
						};
						if(branch.root.use_rtc && !branch.root.logged_in_rtc) {
							//await branch.root.ws.client_login_init();
							console.log('----ws login');
							var data = {
								user_id: data,
								email: branch.username,
								password: branch.password
							};
							console.log(data);
							branch.root.ws.login(data.email, data.password, login_callback, data);
						} else {
							login_callback();
						}
					} else {
						branch.root.dialog.init("Incorrect login information, you have a maximum of 5 login attempts.", undefined, undefined, function() {

						}, true);
						branch.get_password_attempts();
					}
				});
			});
			$('.sign_up_button').click(function() {
				$('.back').click();
			});
			$('button.learn_more').click(function() {
				document.location.href = '/account/#new/sign_up#';
				branch.remove_login_overlay();
			});
			branch.get_password_attempts();

			branch.get_username();	
		},
		perform_login: function(username, password, app_id) {
			var branch = this;
			var $login_container = $('.overlay_black .login').first();
			$login_container.find('#username').first().val(username);
			$login_container.find('#password').first().val(password);
			$login_container.find('.sign_in').first().trigger('click');
			if(typeof app_id !== 'undefined') {
				branch.root.ws.application_service.register_application_instance(app_id);
			}
		},
		get_password_attempts: function() {
			$.post(this.root.actions, {
				'action': 'get_password_attempts'
			}, function(data) {
				if(data > 5) {
					$('.login .login_elements').html("<div>To many incorrect login attempts. You can try to login again in two days.</div>");	
				}
			});
		},
		logout: function() {
			$('.logout').trigger('click');
		},
		remove_in_progress: false,
		login_overlay_displayed: true,
		remove_login_overlay: function() {
			console.log('remove_login_overlay');
			var branch = this;
			//$('.loading').hide();
			if(branch.root.user_id != -1) {
				$('.logged_in_options').show();
				$('.logged_out_options').hide();
			}
			branch.root.loading.hide_loading_contents();
			///if(this.login_overlay_displayed && !this.remove_in_progress && !branch.root.loading.loading_overlay_on_display) {
				this.remove_in_progress = true;
				if($('.body_container').hasClass('blur')) {
					$('.body_container').removeClass('blur');
					$('.login').animate({
						'opacity': "0"
					}, 800, 'easeOutQuart', function() {
						$(this).css({
							'display': 'none'
						});	
					});
					
					$('.overlay_black').animate({
						'opacity': "0"
					}, 800, 'easeOutExpo', function() {
						$(this).css({
							'opacity': '0',
							'display': 'none'
						});
						branch.remove_in_progress = false;
					});
				}
			/*} else {
				//$('.login').hide();
				setTimeout(function() {
					branch.remove_login_overlay();
				}, 1500);
				//branch.root.loading.show_loading_contents();
			}*/
		},
		display_login_overlay: function() {
			var branch = this;
			branch.root.loading.hide_loading_contents();
			$('.logged_in_options').hide();
			$('.logged_out_options').show();
			$('.body_container').addClass('blur');
			$('.overlay_black').css({
				'display': 'block'
			}).animate({
				'opacity': "1"
			}, 1000, 'easeInOutQuad', function() {
				
			});
			
			$('.login').css({
				'display': 'block',
				'opacity': '0'
			}).animate({
				'opacity': "1"
			}, 1500, 'easeInQuart', function() {
				branch.main_callback_called = false;
				branch.login_overlay_displayed = true;	
			});
		}
	},
	loading: {
		loading_completed: false,
		overlay_interlope: 1,
		$progress_bar: null,
		$progress_bar_container: null,
		init: function(loaded_callback) {
			var branch = this;

			branch.$overlay_black = $('.overlay_black').first();
			branch.$progress_bar_container = branch.$overlay_black.find('.progress_bar_container').first();
			branch.$progress_bar = branch.$progress_bar_container.find('.progress_bar').first();
			branch.$body_container = $('.body_container').first();
		},
		complete: function(id) {
			var branch = this;
			if(typeof id !== 'undefined') {
				this.root.loading_completed[id] = true;
			}
			if(this.completed()) {
				setTimeout(function() {
					branch.hide_loading_screen();
					setTimeout(function() {
						if(branch.root.current_user != -1 && branch.overlay_interlope == 1) {
							branch.remove_overlay();
						}
					}, 500);
				}, 500);
			}
		},
		set_progress_bar: function(part, total_parts) {
			var branch = this;
			var progress = Math.round(part/total_parts*1000);
			branch.$progress_bar.val(progress);
		},
		loading_overlay_on_display: false,
		display_loading_overlay: function(progress_bar, no_animation) {
			var branch = this;
			var time = 1250;
			if(typeof no_animation !== 'undefined') {
				time = 0;
			}
			if(this.loading_overlay_on_display == false && !this.hiding_in_progress) {
				this.loading_overlay_on_display = true;
				branch.$body_container.addClass('blur');
				$('.overlay_black').find('.loading').show();
				$('.overlay_black').css({
					'display': 'block',
					'opacity': 0
				}).animate({
					'opacity': 1
				}, 1250, 'easeInOutQuint', function() {
					if(typeof progress_bar !== 'undefined') {
						branch.$progress_bar_container.show();
					}
				});
			}
		},
		hiding_in_progress: false,
		hide_loading_contents: function() {
			var branch = this;
			branch.$overlay_black.find('.loading').hide();
			branch.loading_overlay_on_display = false;
		},
		show_loading_contents: function() {
			var branch = this;
			branch.$overlay_black.find('.loading').show();
		},
		hide_loading_overlay: function() {
			var branch = this;
			if(!$('.overlay_black .login').is(':visible') && this.loading_overlay_on_display && !this.hiding_in_progress) {
				this.hiding_in_progress = true;
				$('.overlay_black').animate({
					'opacity': 0
				}, 1250, 'easeInOutQuint', function() {
					$('.overlay_black').find('.loading').hide();
					$(this).css({
						'display': 'none',
						'opacity': 0
					});
					branch.$body_container.removeClass('blur');
					branch.loading_overlay_on_display = false;
					//branch.$progress_bar_container.hide();
					branch.hiding_in_progress = false;
				});
			}
		},
		completed: function() {
			var completed = true;
			for(var x in this.root.loading_completed) {
				if(!this.root.loading_completed[x]) {
					completed = false;	
				}
			}
			return completed;
		},
		set_uncompleted: function() {
			for(var x in this.root.loading_completed) {
				if(x != 'app_state') {
					this.root.loading_completed[x] = false;
				}
			}
		},
		display_logo: function() {
			var branch = this;
			$('#loading_screen').css({
				'display': 'block',
				'backgroundSize': '200px',
				'opacity': 0.5
			}).animate({
				'opacity': 1
			}, 200, 'easeInQuint');
			setTimeout(function() {
				$('#loading_screen').animate({
					backgroundSize:'500px',
					opacity: 0
				}, 600, 'easeInOutQuad', function() {
					$(this).css('display', 'none');
				});
			}, 700);
		},
		hide_loading_screen: function() {
			$('.loading_window').animate({
				opacity	: 0
			}, 800, 'easeOutQuad', function() {
				$(this).css('display', 'none');	
			});
		},
		display_loading_screen: function() {
			$('.loading_window').css('display', 'block').animate({
				opacity	: 0.6
			}, 800, 'easeInQuint', function() {
			});
		},
		remove_overlay: function() {
			var branch = this;
			branch.overlay_interlope = 0;
			this.root.unblur_body();
			branch.display_logo();
			$('#login_overlay').animate({
				'opacity': 0
			}, 400, 'easeOutQuint', function() {
				$(this).css('display', 'none');
				branch.root.login.clear_login_image();
			});
		}
	},
	overview: {
		init_clock: function() {
			var branch = this;
			setInterval(function() {
				branch.run_second_hand();
			}, 500);
			var counter = 0;
			var value_label = 3;
			while(counter < 12) {
				var print_label = (counter+value_label);
				if(print_label > 12) {
					print_label = print_label - 12;	
				}
				$('#clock_center').prepend(
						"<div class='clock_value_container'>"+
							"<div class='clock_value'>"+
								print_label+
							"</div>"+
						"</div>");
				$('#clock_center').find('.clock_value_container').first().css("transform", "rotate("+(counter*30)+"deg)");
				$('#clock_center').find('.clock_value_container').first().find('.clock_value').css("transform", "rotate(-"+(counter*30)+"deg)");
				//alert("rotate("+(counter*30)+"deg);");
				counter++;
			}	
		
			var interlope = 0;
			$('#clock').click(function() {
				if(interlope == 0) {
					$('#clock_center').hide();
					$('#digital_clock').show();
					interlope = 1;
				} else {
					$('#clock_center').show();
					$('#digital_clock').hide();
					interlope = 0;
				}
			});
			
			var date = new Date();
			this.current_second = -90 + 6*date.getSeconds();
			this.current_minute = -90 + 6*date.getMinutes();	
			this.current_hour = -this.hour_offset_radius+30*(date.getHours());
			this.init_date();
			/*setTimeout(function() {
				branch.init_clock();
			}, 1000*60*60);*/
			setInterval(function() {
				branch.init_date();
			}, 60*60*6);
		},
		hour_offset_radius: 90,
		current_second: 90,
		run_second_hand: function() {
			var date = new Date();
			this.current_second = -90 + date.getSeconds()*6;
			this.current_minute = -90 + 6*date.getMinutes();	
			this.current_hour = -this.hour_offset_radius+30*(date.getHours());
			
			$('#clock_center').find('#second_container').css("transform", "rotate("+(this.current_second)+"deg)");
			$('#clock_center').find('#minute_container').css("transform", "rotate("+(this.current_minute)+"deg)");
			$('#clock_center').find('#hour_container').css("transform", "rotate("+(this.current_hour+((90+this.current_minute)/12))+"deg)"); //(this.current_minute/12)		
					
			/*if(this.current_second == (360-90)) {
				//this.current_second = -90;
				//this.current_minute += 6;					
				this.current_minute = -90 + 6*date.getMinutes();	
				this.current_hour = -this.hour_offset_radius+30*(date.getHours());
			}
			if(this.current_minute == (360-90)) {
				//this.current_minute = -90;
				//this.current_hour += (6*5);	
				this.current_minute = -90 + 6*date.getMinutes();	
				this.current_hour = -this.hour_offset_radius+30*(date.getHours());
			}
			/*if(this.current_hour == (360-90)) {
				this.init_date();	
			}*/
			/*if(this.current_hour >= (360-this.hour_offset_radius)) {
				this.current_hour -= this.hour_offset_radius;	
			}*/
			/*setTimeout(function() {
				run_second_hand();
			}, 1000);*/
		},
		init_date: function() {
			var date = new Date();
			var month = new Array();
			month[0] = "January";
			month[1] = "February";
			month[2] = "March";
			month[3] = "April";
			month[4] = "May";
			month[5] = "June";
			month[6] = "July";
			month[7] = "August";
			month[8] = "September";
			month[9] = "October";
			month[10] = "November";
			month[11] = "December";
			var month_name = month[date.getMonth()];
			var month_date = date.getDate();
			$('#date_month').html(month_name);
			$('.date_content').html(month_date);
			var start_digit = (""+month_date).substring(0, 1);
			if(start_digit != "1") {
				$('.date_content').css({
					'margin-left': '-10px',
					'margin-right': '-10px'
				});
			}
		}
	},
	message_counter: -1,
	messages: [],
	send_messages: [],
	sleep: function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	send: async function(data, callback, await_result) {
		var branch = this;
		branch.message_counter++;
		data.message_counter = branch.message_counter;
		//data.app_id = branch.root.app_id;
		branch.send_messages.push(data);
		if(typeof callback !== 'undefined' || (typeof await_result !== 'undefined' && await_result === true)) {
			//await branch.sleep(2);
			while(typeof branch.messages[data.message_counter] === 'undefined') {
				await branch.sleep(25);
			}

			//branch.message_counter--;
			var result = branch.messages[data.message_counter];
			/*if(Array.isArray(branch.messages[data.message_counter])) {
				result = [...branch.messages[data.message_counter]];
				//console.log('result');
				//console.log(result);
			} else {
				result = {...branch.messages[data.message_counter]};
			}*/
			//console.log(branch.messages[data.message_counter]);
			//result = JSON.parse(JSON.stringify(branch.messages[data.message_counter]));
			//console.log(result);
			delete branch.messages[data.message_counter];

			/*if(typeof result.result !== 'undefined' && result.result.indexOf('<') != -1) {
				result = result.result.split('&apos;').join("'");
			}*/
			if(data.action == 'calendar_days' && typeof result.result !== 'undefined') {
				result.result = result.result.split('&apos;').join("'");
			}

			if(typeof callback !== 'undefined') {
				//$('.sidebar_content').append(JSON.stringify(result).substr(0, 10));
				callback(result);

				if(Object.keys(branch.send_messages).length == 0 && Object.keys(branch.messages).length == 0) {
					branch.message_counter = -1;
					branch.messages = [];
					branch.send_messages = [];
				}
			} else {
				
				if(Object.keys(branch.send_messages).length == 0 && Object.keys(branch.messages).length == 0) {
					branch.message_counter = -1;
				}
				return result;
			}
		}
	},
	get_messages: function() {
		var messages = this.send_messages.splice(0, this.send_messages.length);
		return messages;
	},
	receive_messages: function(data) {
		var branch = this;
		data = data.split("&apos;").join("'").split("&bsol;").join("\\");
		//$('.side_content').append("<div style='height:200px; width:200px; background:red'>test</div>");
		//$('.side_content').append(data);
		//console.log(data);
		data = JSON.parse(data);
		//console.log(data);
		for(var x in data) {
			var received_data = data[x];
			//var message = received_data.message;
			//message.ws_message_counter = received_data.ws_message_counter;
			//$('.sidebar_content').append(JSON.stringify(received_data.message).substr(0, 10));
			
			branch.messages[received_data.message_counter] = received_data.message;
		}
		return {
			result: true
		};
	},
	torrent: {
		client: null,
		init: function() {
			this.client = new WebTorrent();
			//this.poll_queue();
		},
		poll_queue: function() {
			var branch = this;
			var queue_items = branch.queue.splice(0, 1);
			//console.log(queue_items);
			$(document).find('a').each(function() {
				$(this).remove();
			});
			if(queue_items.length == 0) {
				setTimeout(function() {
					branch.poll_queue();
				}, 250);
			} else {
				branch.download_nc(queue_items[0].magnet, queue_items[0].callback);
			}
		},
		seed: function(file, callback) {
			var branch = this;
			console.log('seed');
			branch.client.seed(file, function(data) {
				console.log('magnet');
				console.log(data);
				callback(data.magnetURI);
			});
		},
		seed_nc: function(file_path, filename, callback) {
			var branch = this;
			var oReq = new XMLHttpRequest();
			oReq.open("GET", "file://"+file_path, true);
			oReq.responseType = "arraybuffer";
			console.log('seed nc');
			oReq.onload = function(oEvent) {
				var arrayBuffer = oReq.response;

				var byteArray = new Uint8Array(arrayBuffer);

				var blob = new Blob([arrayBuffer]); //, {type: "image/png"}

				branch.client.seed(blob, {
					name: filename
				}, function(data) {
					console.log(data);
					if(typeof callback !== 'undefined') {
						callback(data);
					}
				});
			};

			oReq.send();
		},
		queue: [],
		enqueue: function(magnet_uri, callback) {
			var branch = this;
			branch.queue.push({
				magnet: magnet_uri,
				callback: callback
			});
		},
		download_client: function(magnet_uri, callback) {
			var branch = this;

			branch.client.add(magnet_uri, function(torrent) {
				torrent.files.forEach(function(file) {
					file.getBlobURL(function (err, url) {
						//if (err) throw err
						var a = document.createElement('a');
						a.download = file.name;
						a.href = url;
						a.textContent = 'Download ' + file.name;
						$(a).css({
							'display': 'none'
						});
						document.body.appendChild(a);
						a.click();
						if(typeof callback !== 'undefined') {
							callback();
							$(a).remove();
							torrent.destroy();
						}
					});
				});
			});
		},
		download_nc: function(magnet_uri, callback) {
			var branch = this;
			console.log('download nc');
			console.log(magnet_uri);
			this.client.add(magnet_uri, function (torrent) {
				console.log(torrent);
				/*var file = torrent.files.find(function (file) {
					return file.name.endsWith('.mp4');
				});
				console.log(file);*/
				torrent.files.forEach(function(file) {
					file.getBlob(function(err, blob) {
						var reader = new FileReader();
						reader.readAsDataURL(blob); 
						reader.onloadend = function() {
							var base64data = reader.result;  
							var a = document.createElement('a');
							a.download = file.name;
							a.href = base64data;
							a.textContent = 'Download ' + file.name;
							document.body.appendChild(a);
							a.click();
							//console.log('saveas');              
							//console.log(base64data);
							if(typeof callback !== 'undefined') {
								callback();
								torrent.destroy();
							}
						};
						console.log('saveas');
						//saveAs(blob, "sintel2.mp4");

						//saveBlob(blob, "blob_test.mp4");
					});
				});
			});
		}
	},
	share_indicies: {
		index: null,
		get: function(callback) {
			branch = this;
			$.post(branch.root.actions, {
				'action': 'get_shared_indicies'
			}, function(data) {
				branch.index = data;
				if(typeof callback !== 'undefined') {
					callback(data);
				}
			}, "json");
		}
	}
};	







