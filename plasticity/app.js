var app = {
	init: function() {
		var branch = this;
		//$.post("/app/base.js", function(data) {
		//	eval(data);
			for(var x in base) {
				branch[x] = base[x];
			}
			branch.assign_root();
			branch.finish_init();
		//});
	},
	finish_init: function() {	
		var branch = this;
		branch.easings.init();

		branch.loading.init();
		branch.user_menu.init();
		branch.overview.init_clock();
		branch.interpretation.init();
		/*var init_interpretation = false;
		if(typeof load_object === 'undefined' || load_object.app == 'builder') {
			init_interpretation = true;

		} else {
			//branch.use_rtc = true;
			branch.app_id = load_object.app;
			branch.navigation.plasticity_delay = true;
		}	
		var final_callback = function() {
			branch.interpretation.init();
			branch.navigation.plasticity_delay = false;
			branch.navigation.poll_hash();
			console.log('final_callback');
		};
		var first_callback = function() {
			if(typeof load_object !== 'undefined' && load_object.app != 'builder') {
				branch.p_app_id = load_object.app;
				//alert('load');
				branch.post(branch.actions, {
					'action': 'generate_definition',
					//'action': 'get_application_definition',
					'application_name': branch.p_app_id
				}, function(data) {
					//alert(data);
					console.log('get_application_definition');
					console.log(data);
					console.log(data);
					branch.update_view.set_table_index();

					final_callback();
				}, "json");
			}
		};
		branch.user_menu.init(function() {
			console.log('user_menu_callback');
			first_callback();
		});
		if(init_interpretation) {
			console.log('interpretation_init');
			branch.interpretation.init();
		}*/

	},
	/*view_containers_table_index: {
		table_index: [
		],
		___update_view_element_index: {
		},
		___view_constraints: {
		},
		set_view_constraint: function(index, constraints) {
			var branch = this;
			var constraints_copy = {...constraints};
			delete constrainst_copy.action;
			if(typeof constraints_copy.__date_interval !== 'undefined') {
				var created = {
					__date_from: constraints_copy.__date_interval.date_from,
					__date_to: constraints_copy.__date_interval.date_to,
				};
				delete constraints_copy.__date_interval;
				constraints_copy.created = created;
			}
			this.___view_constraints[index] = constraints_copy;
			branch.root.update_view.set_table_index();
		},
		update_view: function(tables) {
			var branch = this;
			for(var x in tables) {
				var table = tables[x];
				if(table.indexOf('.') == -1) {
					var element_index = branch.___update_view_element_index[table];
					for(var i in element_index) {
						var element = element_index[i];
						if(element.indexOf('form') != -1 && element.indexOf('.') != -1) {
							var element_split = element.split('.');
							var form = element_split[0];
							var form_element = element_split[1];

							var form_object = branch.root.elements.find_element_object(form);
							if(form_object != null) {
								form_object.operation.elements[form_element].operation.load();
							}
						} else {
							var element_object = branch.root.elements.find_element_object(element);
							if(element_object != null) {
								element_object.operation.load();
							}
						}
					}
				}
			}
		},
	},*/
}

$(document).ready(function() {
	app.init();
});