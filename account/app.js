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
		branch.loading.init();
		branch.user_menu.init();
		branch.interpretation.init();
		branch.overview.init_clock();
	},
	create_user: {
		init: function(data, submit_callback) {
			var branch = this;
			grecaptcha.ready(function() {
				grecaptcha.execute('--set public key from google here--', {action: '_user'}).then(function(token) {
					data.token = token;
					$.post(branch.root.actions, data, function(data) {
						if(data != "-1") {
							location.href = '/plasticity/app_index.php?app=forum#index/categories#';
						} else {
							submit_callback(data);
						}
					});
				});
			});

		}
	}
}

$(document).ready(function() {
	app.init();
});