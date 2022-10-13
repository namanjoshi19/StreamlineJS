app.definition = 
{
	"routes": {
		"default_route": {
			"everyone": "index/instructions",
			"user": "index/instructions"	
		}
	},
	/*"search": {
		"search_type": "filter",
		"objects": [
			{
				"type": "table",
				"id": "bug_reports",
				"title": "Bug Reports",
				"search": "filter",
				"on_click": "bug_report",
				"animation": "slide",
				"target_frame" : "main",
				"search_object": true,
				"columns": {
					"title": "Title",
					"content": "Description",
					"username": "User",
					"created": "Created",
					"app_name": "Application"	
				}
			},
			{
				"type": "table",
				"id": "instructions_view",
				"title": "Instructions",
				"search_object": true,
				"columns": {
					"title": "Title",
					"app_name": "Application"
				},
				"on_click": "instruction",
				"target_frame": "main"
			},
			{
				"type": "table",
				"id": "examples",
				"search_object": true,
				"title": "Examples",
				"columns": {
					"title": "Title",
					"app_name": "Application"
				},
				"on_click": "instruction",
				"target_frame": "main"
			},
		]	
	},*/
	"pages": [
		{
			"title_link": "/index.php#home",
			"id": "index",
			"title": "Support",
			"user_access": "everyone",
			"icon": "logo",
			"display_title": true,
			"content": [
				{
					"type": "frame",
					"id": "main",
					"default_page": "instructions"	
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						"instructions",
						//"forum"
					]
				}
			]
		},
		/*{
			"id": "forum",
			"title": "Forum",
			"page_href": "/plasticity/app_index.php?app=forum#index/categories#",
			"icon_i": 'icofont-ui-text-chat',	//icofont-credit-card //"icofont-envelope //icofont-data //"icofont-clip //icofont-alarm //icofont-listing-box //"icofont-layers //icofont-library //icofont-minus-circle
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "No settings available at this time."	
				}
			]	
		},*/
		{
			"id": "features",
			"title": "Feature Requests",
			"content": [
				{
					"type": "frame",
					"id": "sub_features",
					"default_page": "new_feature"	
				},
				{
					"type": "menu",
					"id": "features_sub",
					"position": "top",
					"target": "sub_features",
					"content": [
						"new_feature",
						"top_features"
					]
				}
			]
		},
		{
			"id": "new_feature",
			"title": "New Feature Request",
			"click": "feature_request",
			"animation": "slide",
			"content": [
				{
					"type": "form",
					"id": "feature_request",
					"title": "New Feature Request",
					"content": [
						{
							"caption": "Application",
							"type": "select",
							"id": "app",
							"content": "fetch"	
						},
						{
							"type": "text",
							"id": "title",
							"placeholder": "Title"
						},
						{
							"type": "textarea",
							"id": "description",
							"placeholder": "Feature request description"
						}
					],
					"save": true,
					"new_on_save": true	
				},
				{
					"type": "list",
					"id": "feature_requests",
					"search": "filter",
					"click": "feature_request",
					"animation": "slide",
					"target" : "main",
					"content": {
						"username": {
							"target": "main"	
						},
					}
				}
			]	
		},
		{
			"id": "feature_request",
			"title": "Feature Request",
			"class": "article",
			"content": [
				{
					"type": "information",
					"id": "app_name",
					"caption": "Application"
				},
				{
					"type": "information",
					"id": "status",
					"caption": "Status"
				},
				{
					"type": "title",
					"id": "title"
				},
				{
					"type": "date",
					"id": "created",
					"caption": "Created"
				},
				{
					"type": "user",
					"id": "user",
					"caption": "Submitted by"
				},
				{
					"type": "content",
					"id": "content"	
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
			"id": "top_features",
			"title": "Top Feature Requests",
			"content": [
				{
					"type": "list",
					"id": "feature_requests",
					"search": "filter",
					"click": "feature_request",
					"animation": "slide",
					"target" : "main",
					"content": {
						"username": {
							"target": "main"	
						},
					}
				}
			]	
		},
		/*{
			"id": "bugs",
			"title": "Bug Reports",
			"click": "bug_report",
			"animation": "slide",
			"user_access": "user",
			"content": [
				{
					"type": "form",
					"id": "bug_report",
					"title": "New Bug Report",
					"content": [
						{
							"caption": "Application",
							"type": "select",
							"id": "app",
							"content": "fetch"	
						},
						{
							"type": "text",
							"id": "title",
							"placeholder": "Title"
						},
						{
							"type": "textarea",
							"id": "description",
							"placeholder": "Bug report",
							"height": "400px"
						}
					],
					"save": true,
					"new_on_save": true,
					"on_submit": [
						"bug_reports_list"
					]	
				},
				{
					"type": "list",
					"id": "bug_reports",
					"search": "filter",
					"click": "bug_report",
					"animation": "slide",
					"target" : "main",
					"content": {
						"username": {
							"target": "main"	
						},
					}
				}
			]
		},
		{
			"id": "bug_report",
			"title": "Bug Report",
			"class": "article",
			"content": [
				{
					"type": "information",
					"id": "app_name",
					"caption": "Application"
				},
				{
					"type": "information",
					"id": "status",
					"caption": "Status"
				},
				{
					"type": "title",
					"id": "title"
				},
				{
					"type": "date",
					"id": "created",
					"caption": "Created"
				},
				{
					"type": "user",
					"id": "user",
					"caption": "Submitted by"
				},
				{
					"type": "content",
					"id": "content"	
				},
				{
					"type": "discussion",
					"load_mask": {
						"id": "page_data.id",
						"reference_type": "page.id"	
					}
				}
			]	
		},*/
		{
			"id": "instructions",
			"title": "Support",
			"user_access": "everyone",
			"no_get_data": true,
			"icon_i": "icofont-support-faq",
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"set_html": true,
					"content": "Here you can find instructions and examples for Noob applications. For further support, reporting bugs or feature requests please contact <a href='mailto:sigginoob@icloud.com'>sigginoob@icloud.com</a>"
				},
				{
					"type": "table",
					"id": "apps",
					"title": "Application Instructions",
					"columns": {
						"image": "",
						"name": "Application",
						"description": "Description"
					},
					"content": {
						"image": "image"
					},
					"image_location": "/images",
					"column_width": {
						"image": "50px",
						"name": "200px",
						"description": "auto"	
					},
					"extra_class": {
						"description": "truncate"
					},
					"on_click": "app_instructions",
					"target_frame": "main"
				}
			]
		},
		{
			"id": "app_instructions",
			"title": "Instructions",
			"user_access": "everyone",
			"click": "instruction",
			"animation": "slide",
			"content": [
				{
					"type": "content",
					"id": "instructions_description",
				},
				{
					"type": "title",
					"value": "Introduction",
					"id": "title1",
				},
				{
					"type": "content",
					"id": "introduction",
				},
				{
					"type": "title",
					"value": "Instructions",
					"id": "title2",
				},
				{
					"type": "table",
					"id": "instructions_view",
					"no_header": true,
					"columns": {
						"title": "Title"
					},
					"post_data": {
						"app_id": "id"
					},
					"on_click": "instruction",
					"target_frame": "main"
				},
				{
					"type": "title",
					"value": "Examples",
					"id": "title3",
				},
				{
					"type": "table",
					"id": "examples",
					"no_header": true,
					"columns": {
						"title": "Title"
					},
					"post_data": {
						"app_id": "id"
					},
					"on_click": "instruction",
					"target_frame": "main"
				},
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
				{
					"type": "list",
					"title": "Feature Requests",
					"id": "feature_requests",
					"search": "filter",
					"click": "feature_request",
					"target" : "main",
					"post_data": {
						"user_id": "id"
					}
				}
			]	
		},
		{
			"id": "new_instructions",
			"title": "New Instructions",
			"user_access": "admin",
			"no_get_data": true,
			"content": [
				{
					"type": "form",
					"id": "instructions",
					"title": "New Instructions",
					"content": [
						{
							"caption": "Application",
							"type": "select",
							"id": "app",
							"content": "fetch"	
						},
						{
							"type": "text",
							"id": "title",
							"placeholder": "Title"
						},
						{
							"type": "textarea",
							"id": "content",
							"placeholder": "Content"
						},
						{
							"type": "select",
							"id": "type",
							"content": "fetch"
						},
					],
					"save": true,
					"new": true,
					"on_submit": [
						"instructions_table"
					]	
				},
				{
					"type": "table",
					"id": "instructions",
					"edit": true,
					"delete": true,
					"target": "instructions_form",
					"columns": {
						"title": "Title",
						"name": "App",
						"type_id": "Type"
					},
				}
			]
		},
		{
			"id": "instruction",
			"title": "Instructions",
			"user_access": "everyone",
			"class": "article",
			"content": [
				{
					"type": "title",
					"id": "title"
				},
				{
					"type": "content",
					"id": "content"	
				}
			]	
		},
	]
}
;