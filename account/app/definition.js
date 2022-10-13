app.definition = 
{
	"routes": {
		"default_route": {
			"everyone": "new/sign_up",
			"user": "index/account"	
		}
	},
	/*"search": {
		"search_type": "filter",
		"objects": [
		
		]	
	},*/
	"pages": [
		{
			"id": "new",
			"title": "Sign Up",
			"user_access": "everyone",
			"display_title": true,
			"no_get_data": true,
			"icon": "logo",
			"content": [
				{
					"type": "frame",
					"id": "main",
				},
			]
		},
		{
			"id": "sign_up",
			"title": "Sign Up",
			"user_access": "everyone",
			"no_get_data": true,
			"content": [
				{
					"type": "content",
					"id": "captcha_info",
					"content": "This site is protected by reCAPTCHA and the Google <a href='https://policies.google.com/privacy'>Privacy Policy</a> and <a href='https://policies.google.com/terms'>Terms of Service</a> apply."
				},
				{
					"type": "form",
					"id": "user",
					"title": "Create Account",
					"content": [
						{
							"type": "text",
							"id": "email",
							"validation": true,
							"placeholder": "Username"
						},
						{
							"type": "password",
							"id": "password",
							"placeholder": "Password"
						}
					],
					"save": true,
					"custom_action": "create_user.init",
				},
				/*{
					"type": "form",
					"id": "reset_password",
					"title": "Reset Password",
					"content": [
						{
							"type": "text",
							"id": "email",
							"placeholder": "Email (username)"
						}
					],
					"save": "Reset",
					//"custom_action": "create_user.init",
				},*/
				/*{
					"type": "content",
					"id": "instructions",
					"content": "This account gives you access to Noob cloud subscription applications which are currently under constructions, and the XUL addons page."	
				}*/
			]	
		},
		{
			"id": "index",
			"title": "Account",
			"display_title": true,
			
			"icon": "logo",
			"user_access": "everyone",
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
						//"subscriptions",
						//"downloads",
						//"cloud",
						"account",
						"settings",
					]
				}
			]
		},
		{
			"id": "settings",
			"title": "Application Settings",
			"user_access": "user",
			"no_get_id": true,
			"content": [
				{
					"title": "Application Settings",
					"type": "form",
					"save": true,
					"id": "main_settings",
					"peristant_values": true,
					"content": [
						{
							"type": "checkbox",
							"caption": "Bold Font",
							"id": "bold_font"
						}
					],
					"on_submit": [
						"_app.main_settings.get_settings"
					],
					"get_load_mask": {
						"bold_font": "bold_font"
					},
				}
			]
		},
		{
			"id": "subscriptions",
			"title": "Subscriptions",
			"user_access": "user",
			"content": [
				{
					"type": "table",
					"id": "subscriptions",
					"columns": {
						"name": "Application",
						"description": "Description",	
						"subscribed": "Subscribed",
					},
					"column_width": {
						"name": "150px",
						"description": "auto",
						"subscribed": "150px"	
					},
					"content": {
						"subscribed": "checkbox"	
					}
				},
				{
					"id": "nc_instructions",
					"type": "content",
					"content": "Noob cloud applications are currently in ongoing development and are being tested, so all apps are free for the time being. But you can expect any application to require a subscription in the future. All Noob cloud apps require that the <a href='/#cloud'>Noob Cloud</a> app is running on your desktop computer connected to the internet. Noob Cloud serves and stores your data for your Noob apps."	
				},
				{
					"type": "content",
					"id": "link_nc",
					"content": "<a href='/noob_cloud'>Click here to configure your Noob Cloud</a>"
				}
			]
		},
		{
			"id": "cloud",
			"title": "Noob Cloud",
			"user_access": "user",
			"page_href": "/noob_cloud/",
			"content": [

			]
		},
		/*{
			"id": "cloud",
			"title": "Noob Cloud",
			"user_access": "user",
			"no_get_id": true,
			"content": [
				{
					"type": "content",
					"id": "instructions"
				},
				{
					"type": "form",
					"id": "init_admin",
					"title": "Initialize Noob Cloud",
					"save": true,
					"content": [
						{
							"type": "text",
							"id": "server_url",
							"placeholder": "Your Noob Cloud Server URL (Starting with https://)"		
						},
						{
							"type": "text",
							"id": "team_name",
							"placeholder": "Team/Organization Name"		
						},
						{
							"type": "text",
							"id": "username",
							"placeholder": "Your Account Username"
						},
						{
							"type": "password",
							"id": "password",
							"placeholder": "Your Account Password",
							"no_confirmation": true		
						}
					],
					"dependencies": [
						{
							"link": "page_data.init",
							"value": "1"
						}
					],
					"custom_action": "init_admin.init"	
				}
			]
		},*/
		/*{
			"id": "downloads",
			"title": "Downloads",
			"user_access": "user",
			"content": [
				{
					"type": "table",
					"id": "downloads",
					"title": "Downloads",
					"columns": {
						"image": "",
						"title": "Download",
						"description": "Description"
					},
					"content": {
						"image": "image"
					},
					"column_width": {
						"image": "50px",
						"title": "300px",
						"description": "auto"	
					},
					"target_frame": "main"
				}
			]
		},*/
		{
			"id": "account",
			"title": "Account",
			/*"animation": "slide",*/
			"user_access": "user",
			"content": [
				{
					"type": "form",
					"id": "user",
					"title": "Change Password",
					"content": [
						{
							"type": "password",
							"id": "password",
							"placeholder": "Password"
						}
					],
					"save": true,	
				},
			]	
		},
		/*{
			"id": "applications",
			"title": "Applications",
			"user_access": "everyone",
			"content": [
				{
					"type": "content",
					"id": "instructions",
					"content": "Here you find Noob Web Applications"
				},
				{
					"type": "table",
					"id": "web_applications",
					"title": "Web Applications",
					"columns": {
						"image": "",
						"title": "Application",
						"description": "Description"
					},
					"content": {
						"image": "image"
					},
					"column_width": {
						"image": "50px",
						"title": "300px",
						"description": "auto"	
					},
					"target_frame": "main"
				}
			]
		}*/
	]
}
;