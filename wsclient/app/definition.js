app.definition = 
{
	"routes": {
		"default_route": {
			"everyone": "index/mainstart",
			"user": "index/mainstart"	
		}
	},
	"pages": [
		{
			"id": "index",
			"title": "Noob Cloud",
			"icon": "nc",
			"display_title": true,
			"content": [
				{
					"type": "frame",
					"id": "main",
					"default_page": "mainstart"	
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						//"request",
						"mainstart",
						//"media",
						"settings"
					]
				}
			]
		},
		{
			"id": "share_folder",
			"title": "Share Folder",
			"no_get_data": true,
			"user_access": "user",
			"animation": ["unset_overlay"],
			"click": ["mainstart"],
			"content": [
				/*{
					"type": "content",
					"id": "instructions",
					"content": "Here you can set settings for Noob Cloud. To see what settings can be set, use the <a href='/support/'>Support</a> page for reference"	
				},*/
				{
					"type": "form",
					"id": "share_folder",
					"title": "Share Folder",
					"content": [
						{
							"type": "text",
							"id": "username",
							"placeholder": "Noob user username",
						},
						{
							"type": "hidden",
							"id": "folder_id"
						}
					],
					"custom_action": "share_folder",
					"new_on_save": true,
					"on_submit": [
						"sharedfolders_table"
					],
					//"delete": true,
					//"on_delete_navigate": "manage_images",
					"save": true,
					"get_load_mask": {
						"id": "folder_id",
						//"description": "description",
						//"description_2": "description_2"	
					}
				},
				{
					"type": "table",
					"id": "sharedfolders",
					//"edit": true,
					"delete": true,
					"target": "share_folder_form",
					"post_data": {
						"folder_id": "id"
					},
					"column_width": {
						//"edit_button": "100px",
						"delete_button": "100px",
					},
					"columns": {
						//"property": "Property",
						"username": "Username"
					},
					"extra_class": {
						//"property": "truncate",
						"username": "truncate"
					},
				}
			]
		},
		{
			"id": "new_folder",
			"title": "New Folder",
			"no_get_data": true,
			"user_access": "user",
			"animation": ["unset_overlay"],
			"click": ["mainstart"],
			"content": [
				/*{
					"type": "content",
					"id": "instructions",
					"content": "Here you can set settings for Noob Cloud. To see what settings can be set, use the <a href='/support/'>Support</a> page for reference"	
				},*/
				{
					"type": "form",
					"id": "folder",
					"title": "New Folder",
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Folder name",
						},
						{
							"type": "hidden",
							"id": "folder_id"
						}
					],
					/*"on_submit": [

					],*/
					//"delete": true,
					//"on_delete_navigate": "manage_images",
					"save": true,
					"get_load_mask": {
						"id": "folder_id",
						//"description": "description",
						//"description_2": "description_2"	
					}
				}
			]
		},
		{
			"id": "mediashare",
			"title": "Share Media",
			"no_get_data": true,
			"user_access": "user",
			//"animation": ["unset_overlay"],
			//"click": ["mainstart"],
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "Here you can add users which can access your media, and download items to their cloud."	
				},
				{
					"type": "form",
					"id": "sharemedia",
					"title": "Share Media",
					"content": [
						{
							"type": "text",
							"id": "username",
							"placeholder": "Noob user username",
						},
						/*{
							"type": "hidden",
							"id": "folder_id"
						}*/
					],
					"custom_action": "share_media",
					"new_on_save": true,
					"on_submit": [
						"sharedfolders_table"
					],
					//"delete": true,
					//"on_delete_navigate": "manage_images",
					"save": true,
					/*"get_load_mask": {
						"id": "folder_id",
						//"description": "description",
						//"description_2": "description_2"	
					}*/
				},
				{
					"type": "table",
					"id": "sharedmedia",
					//"edit": true,
					"delete": true,
					"target": "sharemedia_form",
					/*"post_data": {
						"folder_id": "id"
					},*/
					"column_width": {
						//"edit_button": "100px",
						"delete_button": "100px",
					},
					"columns": {
						//"property": "Property",
						"username": "Username"
					},
					"extra_class": {
						//"property": "truncate",
						"username": "truncate"
					},
				}
			]
		},
		{
			"id": "media",
			"title": "Media",
			"no_get_data": true,
			"user_access": "user",
			"content": [
				{
					"type": "frame",
					"id": "media",
					"default_page": "noobtv"	
				},
				{
					"type": "menu",
					"id": "media_main",
					"position": "top",
					"target": "media",
					"content": [
						//"request",
						"noobtv",
						"mediashare",
						//"media",
						//"settings"
					]
				}
			]
		},	
		{
			"id": "noobtv",
			"title": "Noob TV",
			"no_get_data": true,
			"user_access": "user",
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": ""	
				},
				/*{
					"type": "file_upload",
					"id": "tv",
					//"on_submit_load_mask": {
					//	"folder_id": "folder_id"
					//},
					"submit_mask": {
						"folder_id": "'noobtv_library'"
					},
					"on_submit": [
						"tvlibrary_noobtvbrowser"
					]

				},*/
				{
					"type": "noobtvbrowser",
					"id": "tvlibrary",
					"post_data": {
						//"folder_id": "id"
					},
					"target_frame": "media"
				}
			]
		},
		{
			"id": "settings",
			"title": "Settings",
			"user_access": "user",
			"no_get_data": true,
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "Here you can set settings for Noob Cloud. To see what settings can be set, use the <a href='/support/'>Support</a> page for reference. Warning: Changing values after initialization can cause problems and possibly corrupt data."	
				},
				{
					"type": "form",
					"id": "setting",
					"new": true,
					"save": true,
					"content": [
						{
							"type": "text",
							"id": "property",
							"placeholder": "Property Name"
						},
						{
							"type": "text",
							"id": "value",
							"placeholder": "Property Value"
						}
					],
					"on_submit": [
						"settings_table"
					]
				},
				{
					"type": "table",
					"id": "settings",
					"edit": true,
					"delete": true,
					"target": "setting_form",
					"column_width": {
						"edit_button": "100px",
						"delete_button": "100px",
					},
					"columns": {
						"property": "Property",
						"value": "Value"
					},
					"extra_class": {
						"property": "truncate",
						"value": "truncate"
					},
				}
			]
		},	
		{
			"id": "mainstart",
			"title": "Files",
			"user_access": "everyone",
			"no_get_data": true,
			"animation": ["overlay", "overlay"],
			"click": ["new_folder", "share_folder"],
			"content": [
				/*{
					"type": "content",
					"id": "instructions",
					"content": "WS and RTC."	
				},*/
				{
					"type": "file_upload",
					"id": "mainfiles",
					/*"on_submit_load_mask": {
						"folder_id": "folder_id"
					},*/
					"submit_mask": {
						"folder_id": "id"
					},
					"on_submit": [
						"mainfiles_filebrowser"
					]

				},
				{
					"type": "filebrowser",
					"id": "mainfiles",
					"post_data": {
						"folder_id": "id",
						//"ws_nc_to_user_id": "user_id" //if user_id != branch.root.user_id intercept?
					},
					"target_frame": "main"
				}
				/*{
					"type": "content",
					"id": "instructions_2",
					"content": "Template description should contain a rough description of the intendend functionality of the web page/web app. Once you have downloaded the template it can be fully completed/altered by changing the JSON definition found in definition.js and changing the corrosponding php code."	
				},
				{
					"type": "form",
					"id": "template",
					"title": "Template Request",
					"save": true,
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Template Name"
						},
						{
							"type": "textarea",
							"id": "description",
							//"rich_text": true,
							"placeholder": "Template description"
						},
						{
							"type": "text",
							"id": "user_name",
							"placeholder": "Your Name"
						},
						{
							"type": "text",
							"id": "email",
							"placeholder": "Your Email"
						},
					],
					"on_submit": [
						"template_requests_table"
					]	
				},
				{
					"type": "content",
					"id": "submitted",
					"content": "Requested Templates:"
				},
				{
					"type": "table",
					"id": "template_requests",
					"columns": {
						"name": "Name",
						"description": "Description"
					}
				},*/
				/*{	
					"type": "content",
					"id": "instructions_3",
					"content": "Upload designs or written description."
				},
				{
					"type": "file_upload",
					"id": "files"	
				}*/
			]	
		},
		{
			"id": "browse",
			"title": "Browse Templates",
			"user_access": "everyone",
			"content": [
				{
					"type": "content",
					"id": "description_2",
					"content": "Note you must first install <a href='https://www.noob.software/#streamline'>Streamline</a> to use a template."
				},
				{
					"type": "list",
					"id": "templates",
					"search": "filter",
					"click": "article",
					//"animation": "slide",
					"target" : "main",
					"columns": {
						"name": "Name",
						"description": "Description",
						"preview": "Preview",
						"download": "Download"
					},
					"show_all_items": true
					/*"content": {
						"username": {
							"target": "main"	
						},
						"keywords": {
								
						}
					}*/	
				}
			]	
		}
	]
}
;