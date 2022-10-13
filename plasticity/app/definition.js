app.definition = 
{
	/*"preferences": {
		"app_login": true	
	}*/
	"routes": {
		"default_route": {
			"everyone": "index/my_apps",
			"user": "index/my_apps"	
		}
	},
	"pages": [
		{
			"id": "index",
			"title": "App Builder",
			"user_access": "user",
			"icon_i": "icofont-code",
			//"icon": "noob_plasticity",
			"display_title": true,
			//"icon_blend_mode": "luminosity",
			"content": [
				{
					"type": "frame",
					"id": "main",
					"default_page": "my_apps"	
				},
				{
					"type": "menu",
					"id": "index_main",
					"position": "top",
					"target": "main",
					"content": [
						//"definition",
						"my_apps"
					]
				}
			]
		},
		{
			"id": "my_apps",
			"title": "My Apps",
			"breadcrumb_no_get_data": true,
			//"icon_i": 'icofont-bars',
			//"animation": "slide",
			//"click": "exam",
			"no_get_data": true,
			"user_access": "user",
			"content": [
				{
					"type": "form",
					"id": "application",
					"title": "Manage Applications",
					"save": true,
					"new": true,
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Application Name"	
						},
						{
							"type": "text",
							"id": "app_name",
							"placeholder": "Application Name Identifier (all lowercase with no spaces or special characters)"	
						},
						{
							"type": "textarea",
							"id": "description",
							"placeholder": "Application Description"	
						},		
						{
							"type": "textarea",
							"id": "definition_addition",
							"placeholder": "Application Definition Addition",
							"json_content": true,
							"enable_tab": true,	
						},			
					],
					"on_submit": [
						{	
							"link": "applications_table",
							"load_mask": "false"
						},
						//"news_images_table"
					],
					"on_load": [
						"user_group_form",
						"user_groups_table",
					],
					"on_load_load_mask": {
						"id": "application_id"	
					},
					/*"on_submit_load_mask": {
						"id": "news_id"	
					},*/
					/*"on_load": [
						"expense_receipts_table"
					],
					"on_load_load_mask": {
						"id": "connect_id"	
					}*/
				},
				{
					"type": "table",
					"id": "applications",
					//"connect_value": "character",
					"delete": true,
					"edit": true,
					"search": true,
					//"require_foreign_id": true,
					"target": "application_form",
					"columns": {
						"name": "name",
						//"description": "description"
					},
					"column_width": {
						"title": "auto",
						//"description": "auto",
						"edit_button": "100px",
						"delete_button": "100px",
						"relational_column_privacy": "250px",
						"interface_design_button": "150px",
						"data_structure_button": "150px",
						//"definition": "120px",
						"view": "100px"
					},
					"custom_actions": {
						"view": {
							"defined_action": "p_view_app",
							//"target_href": "stats",
							"href_data": {
								"user_group_id": "id"
							},
							"value": "View App"
						},
						"relational_column_privacy": {
							"target_href": "columns",
							"href_data": {
								"id": "id"
							},
							"value": "Relational Column Privacy"
						},
						"data_structure_button": {
							"target_href": "data_structure",
							"href_data": {
								"id": "id"
							},
							"value": "Data Structure"
						},
						"interface_design_button": {
							"target_href": "interface_design",
							"href_data": {
								"id": "id"
							},
							"value": "Interface Design"
						}
						/*"definition": {
							"target_href": "definition",
							"href_data": {
								"id": "id"
							},
							"value": "Definition"
						},*/
						
					}
				},
				{
					"type": "form",
					"id": "user_group",
					"title": "Manage User Groups",
					"save": true,
					"new": true,
					"content": [
						{
							"type": "text",
							"id": "group_name",
							"placeholder": "User Group Name"	
						},
						{
							"type": "select",
							"id": "parent_group",
							"caption": "Parent Group",
							"content": "fetch",
							"post_data": {
								"application_id": "application_form.id"
							}
						},
						{
							"type": "hidden",
							"id": "application_id",
							"persist_value": true
						}	
					],
					"on_submit": [
						{	
							"link": "user_groups_table",
							"load_mask": "false"
						},
						//"news_images_table"
					],
					"dependencies": [
						{
							"link": "application_form.id",
							"value": "set"
						}
					],
				},
				{
					"type": "table",
					"id": "user_groups",
					//"connect_value": "character",
					"delete": true,
					"edit": true,
					//"search": true,
					//"require_foreign_id": true,
					"target": "user_group_form",
					"columns": {
						"group_name": "name",
						//"description": "description"
					},
					"post_data": {
						"application_id": "user_group_form.id",
					},
					"column_width": {
						"title": "auto",
						//"description": "auto",
						"edit_button": "100px",
						//"definition": "120px",
					},
					"dependencies": [
						{
							"link": "application_form.id",
							"value": "set"
						}
					],
				},
			]	
		},
		{
			"id": "definition",
			"title": "App Definition",
			//"icon_i": 'icofont-bars',
			//"animation": "slide",
			//"click": "exam",
			"user_access": "user",
			"content": [
				{
					"id": "application",
					"type": "form",
					"title": "Definition",
					"content": [
						{
							"type": "textarea",
							"id": "definition",
							"placeholder": "Application definition",
							"enable_tab": true,
						}
					],
					"save": true
				}
			]	
		},
		{
			"id": "data_structure",
			"title": "App Data Structure",
			"no_get_data": true,
			//"icon_i": 'icofont-bars',
			//"animation": "slide",
			//"click": "exam",
			"breadcrumb": {
				"parent": "my_apps",
				"children": [

				]
			},
			"user_access": "user",
			"content": [
				{
					"type": "breadcrumb",
					"id": "breadcrumb"
				},
				{	
					"id": "nodes",
					"id_singular": "node",
					"type": "diagram_editor",
					"post_data": {
						"application_id": "id"
					},
					"node_info": "node_form"
				},
				{
					"type": "form",
					"id": "node",
					"save": true,
					"cancel": true,
					"delete": true,
					//"cancel_callback": "cancel_callback",
					"hide_on_cancel": true,
					"show_on_cancel": [
						"nodes_diagram_editor"
					],
					"hidden": true,
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Node name"
						},
						{
							"type": "radio",
							"id": "node_type",
							"content": {
								"additive": "Additive",
								"subtractive": "Subtractive"
							}
						},
						{
							"caption": "User Access",
							"type": "select",
							"id": "user_access",
							"content": "fetch",
							"post_data": {
								"application_id": "id"
							}	
						},
						/*{
							"type": "auto_add_field",
							"sub_type": "text",
							"id": "node_properties",
							"field_id": "name",
							"post_data": {
								"node_id": "id"
							}
						}*/
					],
					"on_submit": [
						"nodes_diagram_editor"
					]
				}
			]	
		},
		{
			"id": "interface_diagram",
			"title": "Interface Diagram",
			//"no_get_data": true,
			"user_access": "user",
			"breadcrumb": {
				"parent": "interface_design",
				"children": [
					"element"
				]
			},
			"content": [
				{
					"type": "breadcrumb",
					"id": "breadcrumb"
				},
				{
					"id": "elements",
					"id_singular": "element",
					"type": "idiagram",
					"post_data": {
						"page_id": "id"
					},
					"target_page": "element",
					"foreign_key_id": "page_id",
					"default_new_data": {
						"element_type_id": 1
					},
					"attach_post_data_to_item": true
				},
			]
		},
		{
			"id": "columns",
			"title": "Edit Column Privacy",
			"user_access": "user",
			"get_data_load_mask": {
				"id": "id"
			},
			"no_get_data": true,
			"breadcrumb": {
				"parent": "my_apps",
				"children": [
					//"data_element_diagram"
				]
			},
			"content": [
				{
					"type": "breadcrumb",
					"id": "breadcrumb"
				},
				{
					"type": "form",
					"id": "column",
					"save": true,
					//"cancel": true,
					"delete": true,
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Column name",
							"disabled": true
						},
						{
							"type": "select",
							"id": "private",
							"caption": "Column Privacy",
							"content": [
								{
									"value": 0,
									"title": "Public"
								},
								{
									"value": 1,
									"title": "Private"
								}
							]
						},
					],
					"get_load_mask": {
						"id": "id",
						"name": "name",
						"private_id": "private_id"
					},	
					"on_submit": [
						"columns_table"
					]
				},
				{
					"type": "table",
					"id": "columns",
					"target": "column_form",
					//"connect_value": "character",
					//"delete": true,
					//"require_foreign_id": true,
					//"pagination": true,
					//"resize": true,
					"post_data": {
						"application_id": "id"
					},
					"columns": {
						"name": "Name",
						"private_id": "Private"
					},
					"edit": true,
					"column_width": {
						"name": "auto",
						"edit_button": "130px",
						"private": "130px"
						//"edit_button": "100px",
						//"delete_button": "100px"
					},
				},
			]
		},
		{
			"id": "element",
			"title": "Edit Element",
			"user_access": "user",
			"get_data_load_mask": {
				"id": "id"
			},
			"breadcrumb": {
				"parent": "interface_diagram",
				"children": [
					"data_element_diagram"
				]
			},
			"content": [
				{
					"type": "breadcrumb",
					"id": "breadcrumb"
				},
				{
					"type": "form",
					"id": "element",
					"save": true,
					"cancel": true,
					"delete": true,
					"navigate_back_on_complete": true,
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Element name"
						},
						{
							"caption": "Element Type",
							"type": "select",
							"id": "element_type",
							"title": "Element name",
							"content": "fetch"
						},
						{
							"type": "select",
							"id": "target_table",
							"content": "fetch",
							"caption": "Target (Input Table)",
							"dependencies": [
								{
									"link": "element_form.element_type_id",
									"value": ["1", "21", "23"] /*"18", 7*/
								}
							],
							"post_data": {
								"id": "element_form.id"
							},
						},
						{
							"type": "select",
							"id": "page_reference",
							"content": "fetch",
							"caption": "Page Reference",
							"dependencies": [
								{
									"link": "element_form.element_type_id",
									"value": ["14"]
								}
							],
							"post_data": {
								"id": "page_id"
							},
						},
						/*{
							"type": "select",
							"id": "private",
							"caption": "Column Privacy",
							"content": [
								{
									"value": 0,
									"title": "Public"
								},
								{
									"value": 1,
									"title": "Private"
								}
							]
						},
						/*{
							"type": "select",
							"id": "private_column",
							"content": [
								{
									"value": 0,
									"title": "Public"	
								},
								{
									"value": 1,
									"title": "Private"	
								},
							],
							"caption": "Private Column",
							"dependencies": [
								{
									"link": "element_form.element_type_id",
									"value": ["12"]
								}
							],
							"post_data": {
								"id": "page_id"
							},
						},*/
						{
							"type": "textarea",
							"json_content": true,
							"enable_tab": true,
							"id": "definition_addition",
							"placeholder": "Definition Addition",
							"display_title": true,
							"optional_field": true
						}
					],
					"get_load_mask": {
						"id": "id",
						"name": "name",
						"element_type_id": "element_type_id",
						"page_reference_id": "page_reference_id",
						"target_table_id": "target_table_id",
						"definition_addition": "definition_addition",
						"private_id": "private_id"
					},	
				},
				{
					"type": "link",
					"id": "edit_data_diagram",
					"target_page_load_mask": {
						"id": "id"
					},
					"target_page": "data_element_diagram",
					"target": "main",
					"value": "Edit Data Element Diagram",
					"dependencies": [
						{
							"link": "element_form.element_type_id",
							"value": ["9", "24"]
						}
					]
				},
				{
					"type": "link",
					"id": "generate_table_columns",
					"target_page_load_mask": {
						"id": "id"
					},
					"post_action": "generate_table_columns",
					//"target": "main",
					"value": "Generate Target Table Columns",
					"dependencies": [
						{
							"link": "element_form.element_type_id",
							"value": ["1", "7", "21"]
						}
					]
				},
				{
					"id": "reorder_content",
					"type": "content",
					"content": "Element Order"
				},
				{
					"type": "table",
					"id": "elements",
					//"connect_value": "character",
					//"delete": true,
					//"require_foreign_id": true,
					"no_header": true,
					"post_data": {
						"page_id": "page_id"
					},
					"drag_reorder": true,
					"columns": {
						"name": "Name",
						"type": "Type"
					},
					"column_width": {
						"name": "auto",
						//"edit_button": "100px",
						//"delete_button": "100px"
					},
				},
			]
		},
		{
			"id": "data_element_diagram",
			"title": "Data Element Diagram",
			//"no_get_data": true,
			"user_access": "user",
			"breadcrumb": {
				"parent": "element",
				"children": [
					"data_element"
				]
			},
			"content": [
				{
					"type": "breadcrumb",
					"id": "breadcrumb"
				},
				{
					"id": "data_elements",
					"id_singular": "data_element",
					"type": "idiagram",
					"post_data": {
						"element_id": "id"
					},
					"target_page": "data_element",
					"default_new_data": {
						"data_element_type_id": 1
					},
					//"foreign_key_id": "element_id"
				},
			]
		},
		{
			"id": "data_element",
			"title": "Edit Data Element",
			"user_access": "user",
			"breadcrumb": {
				"parent": "data_element_diagram",
				"children": [
					//"data_element"
				]
			},
			"content": [
				{
					"type": "breadcrumb",
					"id": "breadcrumb"
				},
				{
					"type": "form",
					"id": "data_element",
					"save": true,
					"cancel": true,
					"delete": true,
					"navigate_back_on_complete": true,
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Data Element name"
						},
						{
							"type": "select",
							"caption": "Data Element Type",
							"id": "data_element_type",
							"title": "Element name",
							"content": "fetch"
						},
						{
							"type": "select",
							"caption": "Data Source Table",
							"id": "table",
							"content": "fetch",
							"dependencies": [
								{
									"link": "data_element_form.data_element_type_id",
									"value": "2"
								}
							],
							"post_data": {
								"id": "data_element_form.id"
							},
							"optional_field": true,
							"unrequired_on_edit": true
						},
						{
							"type": "text",
							"id": "transform_name",
							"placeholder": "Transform name",
							"optional_field": true,
							"dependencies": [
								{
									"link": "data_element_form.data_element_type_id",
									"value": "1"
								}
							]
						},
						{
							"type": "text",
							"id": "function",
							"placeholder": "Function",
							"optional_field": true,
							"dependencies": [
								{
									"link": "data_element_form.data_element_type_id",
									"value": ["3", "5", "2", "1"]
								}
							]
						},
					],
					"get_load_mask": {
						"id": "id",
						"name": "name",
						"data_element_type_id": "data_element_type_id",
						"table_id": "table_id",
						"function": "function",
						"transform_name": "transform_name"
					},	
				},
				/*{
					"type": "link",
					"id": "edit_data_diagram",
					"target_page_load_mask": {
						"id": "id"
					},
					"target_page": "data_element_diagram",
					"target": "main",
					"value": "Edit Data Element Diagram",
					"dependencies": [
						{
							"link": "element_form.element_type_id",
							"value": "9"
						}
					]
				}*/
			]
		},
		{
			"id": "interface_design",
			"title": "Interface Design",
			"no_get_data": true,
			"user_access": "user",
			//"breadcrumb_no_get_data": true,
			"breadcrumb": {
				"parent": "my_apps",
				"children": [
					"interface_diagram"
				]
			},
			"content": [
				{
					"type": "breadcrumb",
					"id": "breadcrumb"
				},
				{
					"type": "form",
					"id": "page",
					"content": [
						{
							"type": "text",
							"id": "name",
							"placeholder": "Page Name"	
						},
						{
							"type": "text",
							"id": "title",
							"placeholder": "Page Title"	
						},
						{
							"type": "text",
							"id": "icon",
							"placeholder": "Page Icon (icofont / fontawesome class)",
							"optional_field": true	
						},
						{
							"caption": "User Access",
							"type": "select",
							"id": "user_access",
							"content": "fetch",
							"post_data": {
								"application_id": "id"
							}	
						},
						{
							"id": "application_id",
							"type": "hidden",
							"persist_value": true
						},
						{
							"type": "textarea",
							"id": "definition_addition",
							"json_content": true,
							"placeholder": "Definition Addition",
							"display_title": true,
							"enable_tab": true,
							"optional_field": true
						}
					],
					"save": true,
					"new": true,
					//new_on_save": true,
					"on_submit": [
						"pages_table"
					],
					"get_load_mask": {
						"id": "application_id",
					},	
					//"error_message": "Make sure you choose a name for your property and select a property type from the drop down menu."
				},
				{
					"id": "pages",
					"type": "table",
					"post_data": {
						"application_id": "id"
					},
					"columns": {
						"name": "Name",
						"title": "Title",
					},
					/*"custom_columns": {
						"complete": "Complete",
					},*/
					"column_width": {
						"name": "auto",
						"title": "auto",
						"edit_button": "120px",
						"delete_button": "120px",
						"interface_diagram_button": "150px",
					},
					"extra_class": {
						"title": "truncate"
					},
					"target": "page_form",
					"delete": true,
					"edit": true,
					"custom_actions": {
						"interface_diagram_button": {
							"target_href": "interface_diagram",
							"href_data": {
								"id": "id"
							},
							"value": "Interface Diagram"
						}
					}
					/*"on_load": [
						"object_calendar"
					],*/
					/*"custom_actions": {
						"complete": {
							"action": "complete_objective_table",
							"value": "checkbox"
						},
					}*/
				}
			]
		}
	]
}
;