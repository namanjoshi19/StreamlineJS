var app = {
	init: function() {
		var branch = this;
		//$.get("/app/base.js", function(data) {
			//eval(data);
			for(var x in base) {
				branch[x] = base[x];
			}
			branch.assign_root();
			branch.finish_init();
		//});
	},
	//use_rtc: false,
	use_links: true,
	finish_init: function() {	
		var branch = this;
		branch.loading.init();
		branch.navigation.init();
		branch.user_menu.init();
		branch.interpretation.init();
		branch.overview.init_clock();
	}
}

$(document).ready(function() {
	app.init();
});