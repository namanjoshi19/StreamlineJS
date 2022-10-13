app.definition = 
{
	"routes": {
		"default_route": {
			"everyone": "index/software_updates",
			"user": "index/software_updates"	
		}
	},
	/*"search": {
		"search_type": "filter",
		"objects": [
		
		]	
	},*/
	"pages": [
		{
			"title_link": "/index.php#home",
			"id": "index",
			"title": "Noob Updates",
			"user_access": "everyone",
			"icon": "logo",
			"display_title": true,
			"content": [
				{
					"type": "frame",
					"id": "main",
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						"software_updates",
						//"news",
						//"wallpapers"
					]
				}
			]
		},
		{
			"id": "wallpapers",
			"title": "Wallpapers",
			"user_access": "everyone",
			//"click": "software_update",
			//"animation": "slide",
			"no_get_data": true,
			"content": [
				{
					"id": "content",
					"type": "content",
					"content": "Noob Desktop Wallpapers"
				},
				{
					"type": "images",
					"id": "wallpapers",
					"target" : "main",
					"image_location": "/images",
					"content": "fetch",
					//"search": "filter",
					//"click": "software_update",
					//"animation": "slide",
					/*"post_data": {
						"search_field": "search_field"
					},*/
					/*"columns": {
						"app": "Application",
						"version": "Version",
						"release_notes": "Release Notes",
						"created": "Released",
						"mac_download": "macOS Download",
						"win_download": "Windows Download"	
					}*/
				}
			]
		},
		{
			"id": "software_updates",
			"title": "Software Updates",
			"user_access": "everyone",
			"click": "software_update",
			"animation": "slide",
			"no_get_data": true,
			"content": [
				{
					"id": "content",
					"type": "content",
					"content": "Noob Desktop Application Software Updates (macOS & Windows)"
				},
				{
					"type": "list",
					"id": "software_updates",
					"target" : "main",	
					"search": "filter",
					"click": "software_update",
					"animation": "slide",
					"post_data": {
						"search_field": "search_field"
					},
					"columns": {
						"app": "Application",
						"version": "Version",
						"release_notes": "Release Notes",
						"created": "Released",
						"mac_download": "macOS Download",
						"win_download": "Windows Download",
						//"play_store_link": "Play Store Download"		
					}
				}
			]
		},
		{
			"id": "news",
			"title": "News",
			"user_access": "everyone",
			"click": "article",
			"animation": "slide",
			"content": [
				{
					"type": "content",
					"content": "Recent software releases, and other news"
				},
				{
					"type": "list",
					"id": "news",
					"target" : "main",	
					"search": "filter",
					"click": "article",
					"animation": "slide",
					"columns": {
						//"app": "Application",
						/*"version": "Version",
						"mac_download": "macOS Download",
						"win_download": "Windows Download",	
						"play_store_link": "Play Store Download"*/	
					}
				}
			]
		},
		{
			"id": "manage_updates",
			"title": "Manage Updates",
			"user_access": "admin",
			"no_get_data": true,
			"content": [
				{
					"type": "form",
					"id": "software_update",
					"save": true,
					"new_on_save": true,
					"content": [
						{
							"type": "select",
							"id": "app",
							"content": "fetch"	
						},
						{
							"type": "text",
							"id": "version",
							"placeholder": "Version number (integer)"	
						},
						{
							"type": "text",
							"id": "win_download",
							"placeholder": "Windows Download Link",
							"optional_field": true	
						},
						{
							"type": "text",
							"id": "mac_download",
							"placeholder": "Mac Download Link",
							"optional_field": true	
						},
						/*{
							"type": "text",
							"id": "custom_download_link",
							"placeholder": "Custom Download Link",
							"optional_field": true	
						},
						{
							"type": "text",
							"id": "mac_store_link",
							"placeholder": "Custom Mac Store Download Link",
							"optional_field": true	
						},
						{
							"type": "text",
							"id": "win_store_link",
							"placeholder": "Custom Windows Store Download Link",
							"optional_field": true	
						},
						{
							"type": "text",
							"id": "play_store_link",
							"placeholder": "Custom Play Store Download Link",
							"optional_field": true	
						},*/
						{
							"type": "textarea",
							"id": "release_notes",
							"placeholder": "Release notes"	
						}
					]
				}
			]
		},
		{
			"id": "manage_wallpapers",
			"title": "Manage Wallpapers",
			"user_access": "admin",
			"no_get_data": true,
			"content": [
				{
					"type": "form",
					"id": "wallpaper",
					"save": true,
					"new_on_save": true,
					"content": [
						{
							"type": "text",
							"id": "image_name",
							"placeholder": "Image Name"	
						}
					]
				}
			]
		},
		{
			"id": "manage_news",
			"title": "Manage News",
			"user_access": "admin",
			"no_get_data": true,
			"content": [
				{
					"type": "form",
					"id": "new",
					"save": true,
					"new_on_save": true,
					"content": [
						{
							"type": "text",
							"id": "title",
							"placeholder": "Title"	
						},
						{
							"type": "textarea",
							"id": "content",
							"placeholder": "Content"	
						}
					],
					"on_submit": [
						"news_table"
					]
				},
				{
					"type": "table",
					"id": "news",
					"columns": {
						"title": "Title",
						"content": "Content"
					}
						
				}
			]
		},
		{
			"id": "software_update",
			"class": "article",
			"click": "software_updates",
			"animation": "slide",
			"content": [
				{
					"type": "title",
					"id": "title"
				},
				{
					"type": "date",
					"id": "created",
					"caption": "Released",
					"popover": false,
					"time": false
				},
				{
					"type": "information",
					"caption": "Version",
					"id": "version"	
				},
				{
					"type": "content",
					"id": "release_notes"	
				},
				{
					"type": "content",
					"id": "mac_download"	
				},
				{
					"type": "content",
					"id": "win_download"	
				},
				/*{
					"type": "image",
					"id": "image",
					"image_location": "news"
				},*/
			]	
		},
		{
			"id": "article",
			"class": "article",
			"click": "news",
			"animation": "slide",
			"content": [
				{
					"type": "title",
					"id": "title"
				},
				{
					"type": "date",
					"id": "created",
					"caption": "Published",
					"popover": false,
					"time": false
				},
				{
					"type": "content",
					"id": "content"	
				},
				/*{
					"type": "image",
					"id": "image",
					"image_location": "news"
				},*/
			]	
		},
		/*{
			"id": "flow",
			"title": "Flow",
			"user_access": "everyone",
			"content": [
				{
					"type": "content",
					"id": "flow_description",
					"content": "Here you see the flow of submitted articles"
				},
				{
					"type": "custom_list",
					"id": "flow",
					"template": "flow",				
					"target_frame" : "main",	
				}
			]
		},
		{
			"id": "top",
			"title": "Top Articles",
			"user_access": "everyone",
			"no_get_data": true,
			"click": "article",
			"animation": "slide",
			"content": [
				{
					"type": "content",
					"id": "flow_description",
					"content": "<a href='#index/submit_article'><i class='icofont-plus'></i> Submit Article</a>"
				},
				{
					"type": "options",
					"id": "categories",
					"content": "fetch",
					"target": "self",
					"load_mask": {
						"id": "id"	
					}
				},
				{
					"type": "list",
					"custom": true,
					"id": "top_articles",
					"template": "flow",				
					"target" : "main",	
					"search": true,
					"click": "article",
					"animation": "slide",
					"post_data": {
						"category_id": "id",
						"source": "source",
						"date": "date"	
					},
					"default_values": {
						"category_id": "-1",
						"source": null,
						"date": null
					},
					"class_mask": {
						"title": "title_content"	
					},
					"columns_click": {
						"comments": "click",
						"created": {
							"target": "self",
							"click": "top",
							"post_data": {
								"date": "value"	
							}
						},
						"category": {
							"target": "self",
							"click": "top",
							"post_data": {
								"id": "value"	
							}
						},
						"source": {
							"target": "self",
							"click": "top",
							"post_data": {
								"source": "value"	
							}
						},
						"user": {
							"target": "self",
							"click": "user",
							"post_data": {
								"id": "value"	
							}
						}
					},
					"components": {
						"votes": {
							"type": "vote"
						}
					}
				}
			]
		},
		{
			"id": "my",
			"title": "My News",
			"user_access": "everyone",
			"content": [
				{
					"type": "content",
					"id": "flow_description",
					"content": "Here you see the top articles"
				}
			]
		},
		{
			"id": "article",
			"title": "article",
			"class": "article",
			"click": "top",
			"animation": "slide",
			"content": [
				{
					"type": "title",
					"id": "title"	
				},
				{
					"type": "content",
					"id": "link"	
				},
				{
					"type": "content",
					"id": "description"	
				},
				{
					"type": "date",
					"caption": "Submitted",
					"id": "created"	
				},
				{
					"type": "user",
					"id": "user",
					"caption": "Submitted by"
				},
				{
					"type": "discussion",
					"load_mask": {
						"id": "page_data.id",
						"reference_type": "page.id"	
					}
				}
			]	
		},
		{
			"id": "submit_article",
			"title": "Submit Article",
			"user_access": "user",
			"content": [
				{
					"title": "Submit Article",
					"type": "form",
					"id": "article",
					"content": [
						{
							"type": "text",
							"id": "title",
							"placeholder": "Title"
						},
						{
							"type": "link",
							"id": "link",
							"placeholder": "Link"	
						},
						{
							"type": "textarea",
							"id": "description",
							"placeholder": "Description"	
						},
						{
							"type": "select",
							"id": "category",
							"content": "fetch"
						}
					],
					"save": true	
				}
			]	
		},
		{
			"id": "user",
			"user_page": true,
			"class": "article",
			"content": [
				{
					"type": "link",
					"id": "edit_user_information",
					"value": "Edit user information",
					"requirement_callback": "is_user",
					"requirement_data_mask": {
						"id": "id"
					},
					"target": "main",
					"manual_link": "/account/#edit"
				},
				{
					"type": "title",
					"id": "email"
				},
				
			]	
		},
		{
			"id": "admin",
			"title": "Settings",
			"user_access": "admin",
			"display_title": true,
			"content": [
				{
					"type": "frame",
					"id": "main",
					"default_page": "manage_categories"
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						"manage_categories"
					]
				}
			]
		},
		{
			"id": "manage_categories",
			"title": "Manage Categories",
			"content": [
				{
					"type": "form",
					"id": "category",
					"title": "New Category",
					"new_on_save": true,
					"content": [
						{
							"type": "text",
							"id": "title",
							"placeholder": "Category Title"
						},
						{
							"type": "textarea",
							"id": "description",
							"placeholder": "Category Description"
						}
					],
					"save": true,
					"new": true,
					"on_submit": [
						"categories_table",
						"category_order_table"
					],
				},
				{
					"type": "table",
					"id": "categories",
					"edit": true,
					"delete": true,
					"search": true,
					"target": "category_form",
					"columns": {
						"title": "Title"
					},
					"column_width": {
						"title": "auto",
						"edit_button": "100px",
						"delete_button": "100px",
						"custom_action": "100px" 
					},
				},	
				{
					"type": "content",
					"content": "Reorder categories"
				},
				{
					"type": "table",
					"id": "category_order",
					"no_header": true,
					"drag_reorder": true,
					"columns": {
						"title": "Title"
					},
					"column_width": {
						"title": "auto",
						"drag": "25px"
					},
				},
			]
		}*/
	]
}
;