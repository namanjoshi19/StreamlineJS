app.custom_elements.filebrowser = {
	type_name: '_filebrowser',
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = this;
		branch.content_item = content_item;

		$container.append("<div class='filebrowser' id='"+content_item.id+"_filebrowser'><!--<div class='drop_zone'>Drop files here to upload</div>--><div class='filebrowser_container'>\
			<div class='controls'>\
				<div class='root_button button'></div>\
				<div class='up_button button'></div>\
				<div class='new_folder_button button'></div>\
				<div class='refresh_filebox button' style=''><i class='icofont-cloud-refresh'></i>Refresh File Box</div>\
				<div class='share_folder_button button' style='display:none;'></div>\
			</div>\
			<div class='folder_title'></div>\
			<div class='filelist'>\
			</div>\
			<div class='folder_shared_wrap' style='display:none;'>\
			<div class='folder_title shared_folders_title'>Shared folders</div>\
			<div class='shared_filelist'>\
			</div>\
			</div>\
			</div></div>");

		branch.$container = $container.find('#'+content_item.id+'_filebrowser').first();

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
		//var self_context = this;

		var item_object = {
			operation: {
				init: function() {
					var branch = this;
					var root_href = branch.root.navigation.generate_href("mainstart", null, null, {
						id: 0
					}, branch.instance_parent.content_item.target_frame);
					branch.instance_parent.$element.find('.root_button').first().html("<a href='"+root_href+"'><i class='icofont-cloud'></i>Root</a>");
					branch.instance_parent.$element.find('.refresh_filebox').first().click(function() {
						branch.root.loading.display_loading_overlay();
						branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, {
							'action': 'index_files',
						}, function(data) {
							branch.load();
							branch.root.loading.hide_loading_overlay();
						});
					});
					/*branch.instance_parent.$element.find('.upload_button').first().click(function() {
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
					});*/
				},
				load: function() {
					var branch = this;

					//branch.instance_parent.element_branch.root.interpretation.loaded_objects[branch.instance_parent.page.id].loaded();
					//return;


					var post_data = {
						action: 'get_folder_contents'
					};
					branch.root.interpretation.apply_load_mask(post_data, branch.instance_parent.content_item.post_data, branch.instance_parent.page_data);
					if(typeof post_data.folder_id === 'undefined') {
						post_data.folder_id = 0;
					}
					/*if(typeof post_data.user_id !== 'undefined' && post_data.user_id != branch.root.user_id) {
						post_data.intercept = true;
					}*/
					//
					branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, post_data, function(data) {
						var share_href = branch.instance_parent.element_branch.root.navigation.generate_href('share_folder', null, null, {
							id: data.folder_id
						}, branch.instance_parent.content_item.target_frame);
						branch.instance_parent.$element.find('.controls .share_folder_button').first().html("<a href='"+share_href+"'><i class='icofont-share-alt'></i>Share this folder</a>");

						var new_href = branch.instance_parent.element_branch.root.navigation.generate_href('new_folder', null, null, {
							id: data.folder_id
						}, branch.instance_parent.content_item.target_frame);
						branch.instance_parent.$element.find('.controls .new_folder_button').first().html("<a href='"+new_href+"'><i class='icofont-ui-folder'></i>New folder</a>");
						var parent_href = branch.root.navigation.generate_href("mainstart", null, null, {
							id: data.parent_id
						}, branch.instance_parent.content_item.target_frame);
						branch.instance_parent.$element.find('.controls .up_button').first().html("<a href='"+parent_href+"'><i class='icofont-rounded-up'></i>Up</a>");
						branch.instance_parent.$element.find('.folder_title').first().html(data.folder_name);
						var template = "<div class='file_item'><span title='Download to my Noob Cloud' style='display:none'><i class='icofont-cloud-download' ></i></span><span class='download_file_button' title='Download'><i class='icofont-download'></i></span><span class='filename'>Filename.txt</span></div>";
						var $template = $(template);
						var folder_template = "<div class='file_item'><span title='Download to my Noob Cloud' style='display:none'><i class='icofont-cloud-download'></i></span><span title='Download'><i class='icofont-folder'></i></span><span class='filename'>Filename.txt</span></div>";
						var $folder_template = $(folder_template);
						var $filelist = branch.instance_parent.$element.find('.filelist').first();
						$filelist.html("");
						for(var folder of data.folders) {
							(function(folder) {
								var send_data = {
									id: folder.id
								};
								var href = branch.root.navigation.generate_href("mainstart", null, null, send_data, branch.instance_parent.content_item.target_frame);
								var $item = $folder_template.clone();
								$item.find('.filename').html("<a href='"+href+"'>"+folder.name+"</a>");
								$filelist.append($item);
							}(folder));
						}
						for(var file of data.files) {
							(function(file) {
								var $item = $template.clone();
								$item.find('.filename').html(file.name);
								$item.find('.download_file_button').first().click(function() {
									branch.root.loading.display_loading_overlay();
									branch.root.post(branch.root.actions, {
										'action': 'client_download',
										'file_id': file.id,
										'intercept': true
									}, function(data) {
										branch.root.torrent.download_client(data.magnet_uri, function() {

											branch.root.torrent.client.remove(data.magnet_uri);
											branch.root.loading.hide_loading_overlay();
										});
									});
								});
								$filelist.append($item);
							}(file));
						}
						branch.instance_parent.element_branch.root.interpretation.loaded_objects[branch.instance_parent.page.id].loaded();

						var $shared_filelist = branch.instance_parent.$element.find('.shared_filelist').first();
						if(post_data.folder_id == 0) {
							/*$shared_filelist.parent().show();
							var shared_post_data = {
								action: 'get_shared_folders',
								intercept: true,
							};
							branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, shared_post_data, function(data) {
								console.log(data);
								if(data == null) {
									$shared_filelist.html("<div class='files_message'>No shared folders available.</div>");
								} else {
									for(var folder of data) {

									}
								}
							});*/
						} else {

							$shared_filelist.parent().hide();
						}
					});
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
