if(typeof app !== 'undefined') {
	var app_stored = app;
}
var app = {
	init: function() {
		var branch = this;
		for(var x in base) {
			branch[x] = base[x];
		}
		if(typeof app_stored !== 'undefined') {
			for(var x in app_stored) {
				branch[x] == app_stored[x];
			}
		}
		branch.assign_root();
		branch.finish_init();
	},
	//use_rtc: false,
	finish_init: function() {	
		var branch = this;
		branch.loading.init();
		branch.user_menu.init();
		branch.interpretation.init();
		branch.overview.init_clock();
	}
};

$(document).ready(function() {
	app.init();
});