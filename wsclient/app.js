var app = {
	init: function() {
		var branch = this;
		
		for(var x in base) {
			branch[x] = base[x];
		}
		branch.assign_root();
		branch.finish_init();
	},
	finish_init: function() {	
		var branch = this;
		branch.use_rtc = true;
		branch.state_callback = function(state) {
			//console.log('state');
			//console.log(state);
			if(!state.is_root_directory_set) {
				setTimeout(function() {
					branch.dialog.init("Warning : The root directory for Noob Cloud is not set, please set the root directory in settings then restart the application.", undefined, undefined, function() {
						branch.navigation.navigate_to('settings');
					});
					branch.dialog.show();
				}, 2500);
			}
		};
		//console.log('branch state callback');
		branch.easings.init();
		branch.torrent.init();
		branch.ws.init();
		branch.loading.init();
		branch.user_menu.init();
		branch.interpretation.init();
		branch.overview.init_clock();
		/*branch.console.init();
		branch.settings.init();
		branch.user_menu.init();
		branch.overview.init_clock();*/
		//branch.login.init();
	},
	share_media: function(data, callback, $save) {
		var branch = this;
		
	},
	share_folder: function(data, callback, $save) {
		var branch = this;
		//console.log(data);
		$.post(branch.actions, {
			'action': 'share_folder',
			'username': data.username,
			'folder_id': data.folder_id
		}, function(post_data) {
			//console.log(post_data);
			if(post_data.id === false || post_data.id === -1) {
				branch.dialog.init("Error : could not share this folder, make sure you have the correct username.", undefined, undefined, function() {
						//branch.navigation.navigate_to('settings');
				});
				branch.dialog.show();
			} else {

				data.to_user_id = post_data.to_user_id;
				//console.log(data);
				branch.post(branch.actions, data, function(result) {
					branch.ws.shared_callback = function() {
						callback(data, $save);
					};
					branch.ws.ws_connection.send(JSON.stringify({
						'action': 'gather_shared_instances'
					}));
				});
			}
		}, "json");
	},
	//use_rtc: true,
	//is_local_app: true,
	logged_in_rtc: false,
	ws: {
		shared_callback: null,
		ws_connection: null,
		peer_connection: null,
		messages: Array(),
		/*get_messages: function() {
			var messages = this.messages.splice(0, this.messages.length);
			return messages;
		},*/
		client_index: -1,
		init: function() {
			var branch = this;
			var url = "wss://noob.software/services/rtc";//"wss://noob.software:10443";
			var ws_connection = new WebSocket(url);

			ws_connection.onmessage = function(event) {
				////console.log(event.data);
				var message_data = JSON.parse(event.data);
				switch(message_data.action) {
					/*case "offer": 
					case "answer":*/
					case 'shared_callback':
						if(branch.shared_callback != null) {
							branch.shared_callback();
							branch.shared_callback = null;
						}
						break; 
					case "sdp":
						//console.log(message_data.message);
						branch.peer_connection.signal(message_data.message);
						//onCandidate(data.candidate); 
						break; 
					case 'set_client_index':
						branch.client_index = message_data.value;
						break;
					case 'no_nc_instance':
						//console.log('no nc instance');
						if(branch.login_callback != null) {
							var callback = branch.login_callback;
							callback('login_error');
						}
						break;
					case 'login_success':
						//alert('login success');
						var peer_connection = new SimplePeer({
							initiator: true,
							channelName: 'noob_cloud',
						});
						branch.peer_connection = peer_connection;

						peer_connection.on('signal', data => {
							//console.log(data);
							var message_data = {
								//'to_nc': true,
								'action': 'to_nc',
								'message': data,
								'ws_user_id': 'unset'
							};
							////console.log('to_nc---');
							////console.log(message_data);
							branch.ws_connection.send(JSON.stringify(message_data));
						});
						peer_connection.on('data', data => {
							var received_data = JSON.parse(data);
							//console.log(received_data);
							branch.messages[received_data.ws_message_counter] = received_data.message;
						});
						peer_connection.on('connect', data => {
							//console.log(data);
							//console.log('connected complete');

							if(branch.login_callback != null) {
								//console.log('branch rtc login callback is not null');
								//setTimeout(function() {
									var callback = branch.login_callback;
									var callback_data = branch.login_callback_data;
									branch.root.logged_in_rtc = true;
									//branch.login_callback = null;
									//branch.login_callback_data = null;
									callback(callback_data);
								//}, 4200);
							} else {
								//console.log('rtc callback is null');
							}
						});
						peer_connection.on('error', () => {
							//console.log('peer closed');

							/*var callback = function(data) {
								//console.log('callback login error');
								if(data === 'login_error') {
									setTimeout(function() {
										branch.login(undefined, undefined, callback);
									}, 5350);
								}
							};*/
							callback('login_error');
							/*setTimeout(function() {
								branch.login(undefined, undefined, callback);
							}, 1350);*/
							//delete branch.peer_connection;
						});
						/*branch.ws_connection.send(JSON.stringify({
							'to_nc': true,
							'action': 'make_peer_connection'
						}));*/
						break;
					case 'login_error':
						//alert('login error please try again');
						if(branch.login_callback != null) {
							var callback = branch.login_callback;
							callback('login_error');
						}
						break;
					/*case 'sdp':
						////console.log('sdp received');
						var peer_connection = new SimplePeer({
							channelName: 'noob_cloud',
						});

						peer_connection.on('signal', data => {
							var message_data = {
								'action': 'to_nc',
								'sdp_data': data,
								'ws_user_id': 'unset'
							};
							////console.log('to_nc---');
							////console.log(message_data);
							branch.ws_connection.send(JSON.stringify(message_data));
						});
						peer_connection.on('data', data => {
							////console.log(data);
							var received_data = JSON.parse(data);
							branch.messages[received_data.message_counter] = received_data;
						});
						peer_connection.on('connect', data => {
							////console.log(data);
							////console.log('connected complete');

							if(branch.login_callback != null) {
								var callback = branch.login_callback;
								var callback_data = branch.login_callback_data;

								branch.login_callback = null;
								branch.login_callback_data = null;
								callback(callback_data);
							}
						});
						////console.log('received sdp_data');
						////console.log(message_data.sdp_data);
						peer_connection.signal(message_data.sdp_data);
						branch.peer_connection = peer_connection;

						break;*/
				}
			};
			ws_connection.onopen = function(event) {
				//console.log('open');
				if(branch.on_open_callback != null) {
					branch.on_open_callback();
					branch.on_open_callback = null;
				}
				//branch.login('test_user', 'test');
				//perform login
				//branch.login('siggi', 'noob');
				//branch.login(branch.root.user_menu.username, branch.root.user_menu.password);
			};
			ws_connection.onclose = function(event) {
				setTimeout(function() {
					//branch.init();
				}, 5350);
			};
			ws_connection.onerror = function(event) {

			};
			this.ws_connection = ws_connection;
			//alert('init complete');
		},
		on_open_callback: null,
		login: function(username, password, callback, data) {
			var branch = this;
			if(typeof username === 'undefined') {
				username = branch.username;
				password = branch.password;
			} else {
				branch.username = username;
				branch.password = password;
			}
			//console.log('ws_login');
			//if(branch.peer_connection == null) {
				if(branch.ws_connection == null || branch.ws_connection.readyState !== WebSocket.OPEN) {
					//console.log('is not open');
					if(typeof callback !== 'undefined') {
						branch.login_callback = callback;
						branch.login_callback_data = data;
					}
					branch.on_open_callback = function() {
						//console.log('callback perform ws_login');
						var message_data = {
							action: 'login',
							username: username,
							password: password
						};
						branch.ws_connection.send(JSON.stringify(message_data));
					};
				} else {
					//console.log('perform ws_login');
					var message_data = {
						action: 'login',
						username: username,
						password: password
					};
					if(typeof callback !== 'undefined') {
						branch.login_callback = callback;
						branch.login_callback_data = data;
					}
					branch.ws_connection.send(JSON.stringify(message_data));
				}
			//}
		},
		close_connection: function() {
			this.ws_connection.close();
		},
		message_counter: -1,
		send: async function(data, await_result) {
			var branch = this;

			if(branch.peer_connection == null) {
				////console.log(data);
				if(branch.peer_connection == null) {
					//await branch.sleep(2500);
					//console.log('no peer');
				}
				return {
					error: 'no_peer'
				};
			}

			if(typeof await_result !== 'undefined' && await_result === true) {
				branch.message_counter++;
				var message_prefix = '';//branch.root.user_id+'_'+branch.client_index+'_';
				data.ws_message_counter = branch.message_counter;
				data.app_id = branch.root.app_id;
				//data.ws_client_index = branch.client_index;
				branch.peer_connection.send(JSON.stringify(data));
				//await branch.sleep(2);
				var timeout_max = 10000;
				var timeout_counter = 0;
				while(typeof branch.messages[data.ws_message_counter] === 'undefined' && timeout_counter < timeout_max) {
					await branch.sleep(25);
					timeout_counter++;
				}
				var message = branch.messages[data.ws_message_counter];//JSON.parse(JSON.stringify(branch.messages[data.ws_message_counter]));
				////console.log('ws return message');
				////console.log(message);
				delete branch.messages[data.ws_message_counter];
				if(Object.keys(branch.messages).length == 0) { //---mogulega breyta thessu.
					branch.message_counter = -1;
					branch.messages = [];
				}
				return message;
			}
		},
		sleep: function(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		},
		post: async function(data, callback) {
			var branch = this;
			if(typeof callback !== 'undefined') {
				var result = await this.send(data, true);
				callback(result);
			}/* else {
				this.send(data);
			}*/
		}
	},
}

$(document).ready(function() {
	app.init();
});