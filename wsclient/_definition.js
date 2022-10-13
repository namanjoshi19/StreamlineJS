app.definition = 
{
	"pages": [
		{
			"id": "index",
			"title": "News",
			
			"content": [
				{
					"type": "frame",
					"id": "main",
					"default_page": "nc_main"	
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						"nc_main",
					]
				}
			]
		},
		{
			"id": "nc_main",
			"title": "Main view",
			"content": [
				{
					"type": "content",
					"id": "main_content",
					"content": "test this",
				}
			]
		},
		{
			"id": "articles",
			"title": "articles",
			"click": "article",
			"animation": "slide",
			"content": [
				{
					"type": "list",
					"id": "articles",
					"search": "filter",
					"click": "article",
					//"animation": "slide",
					"target" : "main",
					"content": {
						"username": {
							"target": "main"	
						},
						"keywords": {
								
						}
					}
				}
			]
		},
		{
			"id": "new_article",
			"title": "New Article",
			"user_access": "users",
			"content": [
				{
					"type": "form",
					"id": "article",
					"title": "New Article",
					"content": [
						{
							"type": "radio",
							"id": "content_type",
							"content": {
								"article": "Article",
								"video": "Video",
								"audio": "Audio"		
							}
						},
						{
							"type": "text",
							"id": "title",
							"placeholder": "Title"	
						},
						{
							"type": "textarea",
							"id": "content"	,
							"placeholder": "News Content"
						},
						{
							"type": "text",
							"id": "keywords",
							"placeholder": "Keywords"	
						},
						{
							"type": "select",
							"id": "category",
							"content": "fetch",
							"dependencies": [	//gæti líka verið table með dependency a select, þannig að þegar selectid breytist breytist hverfur og birtist önnur tafla
								{
									"link": "article_form.content_type",
									"value": "article"
								}
							]	
						}
					],
					"save": true,
					"new": true,
					"on_submit": [
						"articles_table"
					]
				},
				{
					"type": "table",
					"id": "articles",
					"edit": true,
					"delete": true,
					"target": "article_form",
					"columns": {
						"title": "Title",
						"content": "Content",
						"created": "Created",
						"keywords": "Keywords"
					},
					"dependencies": [	//gæti líka verið table með dependency a select, þannig að þegar selectid breytist breytist hverfur og birtist önnur tafla
						{
							"link": "article_form.content_type",
							"value": "video"
						}
					]	
				}
			]
		},
		{
			"id": "article",
			"class": "article",
			"content": [
				/*{
					"type": "image",
					"id": "front_image"
				},*/
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
				/*{
					"type": "tags",
					"id": "keywords",
					"caption": "Keywords"	
				},
				/*{
					"type": "comments"
				},*/
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
					"target_page": "edit_user",
					"target_page_load_mask": {
						"id": "id"	
					}
				},
				{
					"type": "title",
					"id": "email"
				},
				{
					"type": "list",
					"id": "articles_user",
					"search": "filter",
					"click": "article",
					//"animation": "slide",
					"target" : "main",
					"post_data": {
						"user_id": "id"
					}
				}
			]	
		},
		{
			"id": "new_category",
			"title": "New Category",
			"user_access": "moderators",
			"content": [
				{
					"type": "form",
					"id": "category",
					"title": "New Category",
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Category Name"	
						},
						{
							"type": "textarea",
							"id": "description"	,
							"placeholder": "Category Description"
						}/*,
						{
							"type": "text",
							"id": "keywords",
							"placeholder": "Keywords"	
						}*/
					],
					"save": true,
					"new": true,
					"on_submit": [
						"categorys_table"
					]
				},
				{
					"type": "table",
					"id": "categorys",
					"edit": true,
					"delete": true,
					"target": "category_form",
					"columns": {
						"name": "Name",
						"description": "Description"
					}
				}
			]
		},
		{
			"id": "new_user_group",
			"title": "User Groups",
			"user_access": "admin",
			"content": [
				{
					"type": "form",
					"id": "user_group",
					"title": "New User Group",
					"content": [
						{
							"type": "text",
							"id": "group_name",
							"placeholder": "User Group Name"	
						},
						{
							"type": "select",
							"id": "parent_group",
							"content": "fetch"	
						}
					],
					"save": true,
					"new": true,
					"on_submit": [
						"user_groups_table"
					],
					"on_load": [
						"user_user_groups_table",
						"user_user_groups_form"
					],
					"on_load_load_mask": {
						"id": "user_group_id"	
					}
				},
				{
					"type": "table",
					"id": "user_groups",
					"edit": true,
					"delete": true,
					"target": "user_group_form",
					"columns": {
						"group_name": "Group Name",
						"parent": "Parent Group"
					}
				},
				{
					"type": "form",
					"id": "user_user_groups",
					"title": "Add User To User Group",
					"no_primary_id": true,
					"content": [
						{
							"type": "hidden",
							"id": "user_group_id"	
						},
						{
							"type": "suggest",
							"id": "username",
							"placeholder": "Username",
							"conditions": [
								"user_group_id"
							],
							"require_id": true	
						}/*,
						{
							"type": "select",
							"id": "user_group",
							"content": "fetch"	
						}*/
					],
					"save": true,
					"new": true,
					"on_submit": [
						"user_user_groups_table"
					]
				},
				{
					"type": "table",
					"id": "user_user_groups",
					"delete": true,
					"target": "user_user_groups_form",
					"require_foreign_id": true,
					/*"column_mask": {
						"user_id": "hidden",
						"user_group_id": "hidden"	
					},*/
					"columns": {
						"email": "Username",
						"user_group": "User Group"	
					}
				}
			]
		},
		{
			"id": "sign_up",
			"title": "Sign Up",
			"requirement_callback": "is_logged_in",
			/*"requirement_data_mask": {
				"id": "id"
			},*/
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "Welcome to News please enter your email as username and create a password."
				},
				{
					"type": "form",
					"id": "user",
					"title": "Sign Up",
					"content": [
						{
							"type": "text",
							"id": "username",
							"placeholder": "Email (Username)",
							"validation": true,
								
						},
						{
							"type": "password",
							"id": "password",
							"placeholder": "Password"	
						}
					],
					"save": "Sign up",
					"target_page": "user",
					/*"target_page_load_mask": {
						"id": "id"	
					}*/
				}
			]	
		},
		{
			"id": "edit_user",
			"no_get_data": true,
			"title": "Edit User Information",
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "Welcome to News please enter your email as username and create a password."
				},
				{
					"type": "form",
					"id": "user_information",
					"title": "Edit User Information",
					"content": [
						{
							"type": "password",
							"id": "old_password",
							"placeholder": "Old Password",
							"no_confirmation": true	
						},
						{
							"type": "password",
							"id": "password",
							"placeholder": "New Password"	
						}
					],
					"save": "Save",
					"get_load_mask": {
						"id": "id"	
					}
				}
			]	
		}
	]
}
;