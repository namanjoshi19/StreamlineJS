app.custom_elements.idiagram = {
	type_name: '_idiagram',
	init: function(content_item, $container, page_data, interpretation, page) {
		var branch = this;
		branch.content_item = content_item;


		$container.append("<div class='diagram_editor' id='"+content_item.id+"_idiagram' class='unselectable'><div class='controls'><div class='add_button'><i class='icofont-ui-add'></i>Add new node</div><div class='parent_button'><i class='icofont-connection'></i>Connect to parent</div></div><svg id='svg1' width='0' height='0'></svg><div class='children'></div><div class='idiagram_console'></div></div>");
		branch.$container = $container.find('#'+content_item.id+'_idiagram').first();

		branch.interpretation = interpretation;
		branch.page = page;
		branch.content_item = content_item;

		function item_object_constructor(id, $element, element_branch, id_singular, content_item, page_data, $page_container, page) {
			this.id = id;
			this.$element = $element;
			this.element_branch = element_branch;
			this.id_singular = id_singular;
			this.content_item = content_item;
			this.page_data = page_data;
			this.$page_container = $page_container;
			this.page = page;
		}

		var item_object = {
			operation: {
				$container: null,
				init: function() {
					var branch = this;
					branch.$console = branch.instance_parent.$element.find('.idiagram_console').first();
					branch.$container = branch.instance_parent.$element.find('.children').first();
					branch.instance_parent.element_branch.root.interpretation.loaded_objects[branch.instance_parent.page.id].loaded_callbacks.push(function() {
						branch.$node_info = branch.instance_parent.$page_container.find('#'+branch.instance_parent.content_item.node_info).first();//branch.instance_parent.$element.find('.node_info').first();
						branch.node_info_form = branch.instance_parent.element_branch.root.elements.forms[branch.instance_parent.content_item.node_info];
					});
					branch.$svg_container = branch.instance_parent.$element.find('#svg1').first();
					branch.$svg_container.click(function(e) {
						branch.$container.find('.node.selected').removeClass('selected');
						branch.$container.find('.node.parent_selected').removeClass('parent_selected');
					});
					$(window).resize(function() {
						branch.draw_connections();
					}).keyup(function(e) {
						if(e.keyCode == 27) {
							branch.connect_parent_in_progress = false;
							branch.$container.find('.node').off('click.set_parent');
						}
					});
				},
				load: function(callback) {
					var branch = this;
					var post_data = {
						'action': branch.instance_parent.id+branch.instance_parent.element_branch.type_name,
						//'page_id': branch.instance_parent.page_data.id
					};
					if(typeof branch.instance_parent.content_item.post_data !== 'undefined') {
						branch.instance_parent.element_branch.root.interpretation.apply_load_mask(post_data, branch.instance_parent.content_item.post_data, branch.instance_parent.page_data);
					}
					branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, post_data, function(data) {
						branch.$container.html("");
						for(var x in data) {
							branch.print_node(data[x]);
						}
						if(typeof callback !== 'undefined') {
							callback();
						}
						branch.draw_connections();

					    //branch.instance_parent.element_branch.connect_elements($("#svg1"), $("#path1"), $("#10_node"), $("#11_node"));
					}, "json");
				},
				print_node: function(node) {
					var branch = this;
					branch.$container.append("<div class='node' id='"+node.id+"_node'><div class='node_shape'><!--<i class='icofont-pencil-alt-5'>--></i></div><div class='label'>"+node.name+"</div></div>");
					var $node = branch.$container.find('#'+node.id+'_node').first();
					if(typeof node.icon !== 'undefined') {
						$node.find('.node_shape').first().html('<i class="'+node.icon+'"></i>');
					}
					$node.css({
						'left': node.position_x+'%',
						'top': node.position_y+'%'
					});
					if(node.parents !== 'undefined' && node.parents != null) {
						$node.attr('parents', node.parents);
					} else {
						$node.attr('parents', '');
					}
					if(!node.node_locked) {
						$node.draggable({
							stop: function() {
								//var $window = $(window);
								var $window = $node.parent();
								var position = $node.position();
						    	//branch.instance_parent.element_branch.connect_elements($("#svg1"), $("#path1"), $("#10_node"), $("#11_node"));
								branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, {
									'action': '_'+branch.instance_parent.id_singular,
									'id': node.id,
									'position_x': (position.left / $window.width())*100,
									'position_y': ((position.top) / $window.height())*100,
									//'page_id': branch.instance_parent.page_data.id
								}, function(data) {

								});
								branch.draw_connections();
							}
						});
						$node.click(function(e) {
							e.stopPropagation();
							var $this = $(this);
							branch.$container.find('.parent_selected').removeClass('parent_selected');
							if(!$this.hasClass('selected')) {
								branch.$container.find('.node').each(function() {
									$(this).removeClass('selected');
								});
								$this.addClass('selected');
								branch.$container.find('.node').each(function() {
									var $child_node = $(this);
									var parents = $child_node.attr('parents');
									if(parents != null && parents.length > 0) {
										parents = JSON.parse(parents);
										if(parents.indexOf(node.id) != -1) {
											$child_node.addClass('parent_selected');
										}
									}
								});
							}
						}).dblclick(function(e) {
							e.stopPropagation();
							var send_data = {
								id: node.id
							};
							if(typeof branch.instance_parent.content_item.post_data !== 'undefined' && typeof branch.instance_parent.content_item.attach_post_data_to_item !== 'undefined') {
								branch.instance_parent.element_branch.root.interpretation.apply_load_mask(send_data, branch.instance_parent.content_item.post_data, branch.instance_parent.page_data);
							}

							branch.root.navigation.navigate_to(branch.instance_parent.content_item.target_page, send_data);
							//branch.node_info_form.operation.load(node);
						});
					}
				},
				add_node: function() {
					var branch = this;
					var post_data = {
						'action': '_'+branch.instance_parent.id_singular,
						'name': 'untitled element',
						'position_x': '25',
						'position_y': '25',
						//'page_id': branch.instance_parent.page_data.id,
						//'element_type_id': 1
					};
					//post_data[branch.instance_parent.content_item.foreign_key_id] = branch.instance_parent.page_data.id;
					if(typeof branch.instance_parent.content_item.post_data !== 'undefined') {
						branch.instance_parent.element_branch.root.interpretation.apply_load_mask(post_data, branch.instance_parent.content_item.post_data, branch.instance_parent.page_data);
					}
					if(typeof branch.instance_parent.content_item.default_new_data !== 'undefined') {
						//branch.instance_parent.element_branch.root.interpretation.apply_load_mask(post_data, branch.instance_parent.content_item.default_new_data, branch.instance_parent.page_data);
						for(var i in branch.instance_parent.content_item.default_new_data) {
							if(i != 'instance_root' && i != 'instance_parent' && i != 'obj_id') {
								post_data[i] = branch.instance_parent.content_item.default_new_data[i];
							}
						}
					}
					console.log(post_data);
					branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, post_data, function(data) {
						var node = {
							id: data,
							name: 'untitled element',
							position_x: '25',
							position_y: '25',
						};
						branch.print_node(node);
					}, "json");
				},
				connect_parent_in_progress: false,
				connect_parent: function() {
					var branch = this;
					var $selected = branch.$container.find('.selected');
					if($selected.length == 0) {
						branch.instance_parent.element_branch.root.dialog.init("You must select a child node first, then click connect parent, then select the parent node", undefined, undefined, function() {

						});
					} else if(!branch.connect_parent_in_progress) {
						branch.connect_parent_in_progress = true;
						branch.$container.find('.node').each(function() {
							var $this = $(this);
							$this.on('click.set_parent', function() {
								branch.connect_parent_in_progress = false;
								branch.console('set_parent');
								var parents = $selected.attr('parents');
								if(parents == "null" || parents == null || parents.trim().length == 0) {
									parents = [];
								} else {
									parents = JSON.parse(parents);
								}
								var id = $this.attr('id').split('_node')[0];
								if(parents.indexOf(id) == -1) {
									parents.push(id);
								}
								var parents_string = JSON.stringify(parents);
								$selected.attr('parents', parents_string);
								if(parents_string != null) {
									branch.console('set parents: '+parents_string+' id: '+$selected.attr('id').split('_node')[0]);
									branch.instance_parent.element_branch.root.post(branch.instance_parent.element_branch.root.actions, {
										'action': '_'+branch.instance_parent.id_singular,
										'id': $selected.attr('id').split('_node')[0],
										'parents': parents_string
									}, function(data) {
										branch.draw_connections();
									});
								}
								branch.$container.find('.node').off('click.set_parent');
							});
						});
					}
				},
				console_timeout: null,
				console: function(message) {
					var branch = this;
					clearTimeout(branch.console_timeout);
					this.$console.html(message).fadeIn('slow');
					branch.console_timeout = setTimeout(function() {
						branch.$console.fadeOut('slow');
					}, 10000);
				},
				connection_colors: {},
				draw_connections: function() {
					var branch = this;
					var $nodes = branch.$container.find('.node');
					branch.$svg_container.html("");
					$nodes.each(function() {
						var $node = $(this);
						var node_id = $node.attr('id').split('_node')[0];
						var parents = $node.attr('parents');
						if(parents != null && parents.trim().length > 0) {
							parents = JSON.parse(parents);
							(function($node, node_id, parents) {
								for(var x in parents) {
									var parent_id = parents[x];
									var color;
									if(typeof branch.connection_colors[node_id] !== 'undefined') {
										color = branch.connection_colors[node_id];
									} else {
										color = branch.root.generate_random_color();
										branch.connection_colors[node_id] = color;
									}
									branch.$svg_container[0].insertAdjacentHTML('beforeend', '<path\
											            id="path_'+node_id+'_'+parent_id+'"\
											            d="M0 0"\
											            stroke="rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.85)"\
											            stroke-width="12px"\
											            style="stroke:rgba('+color[0]+', '+color[1]+', '+color[2]+', 0.85); fill:none;"/>');
									var $path = branch.$svg_container.find('#path_'+node_id+'_'+parent_id).first();
									(function(parent_id, $node, node_id) {
										$path.dblclick(function() {
											alert('remove');
											var parents_removed = parents;
											var parent_id_index = parents_removed.indexOf(parent_id);
											parents_removed.splice(parent_id_index, 1);
											var parents_string = JSON.stringify(parents_removed);
											$node.attr('parents', parents_string);
											branch.root.post(branch.root.actions, {
												'action': '_'+branch.instance_parent.id_singular,
												'id': node_id,
												'parents': parents_string
											}, function(data) {
												branch.draw_connections();
											});
										});
									}(parent_id, $node, node_id));
									var $parent = branch.$container.find('#'+parent_id+'_node').first();
									branch.instance_parent.element_branch.connect_elements(branch.$svg_container, $path, $node, $parent);
								}
							}($node, node_id, parents));
						}
					});
				}
			}
		};

		item_object_constructor.prototype = item_object;

		var item_object = new item_object_constructor(content_item.id, branch.$container, branch, content_item.id_singular, content_item, page_data, $container, page);

		branch.root.assign_root_object(item_object, true);
		item_object.operation.init();


		if(typeof branch.root.elements.diagram_editors === 'undefined') {
			branch.root.elements.diagram_editors = Array();	
		}
		item_object.operation.load(function() {
			branch.interpretation.loaded_objects[branch.page.id].loaded();
		});
		
		branch.root.elements.diagram_editors[content_item.id+"_diagram_editor"] = item_object;

		branch.$container.find('.generate_button').first().click(function() {
			branch.root.post(branch.root.actions, {
				'action': content_item.id+'_generate_structure',
				'page_id': page_data.id
			}, function(data) {
				item_object.operation.load();
			});
		});

		branch.$container.find('.add_button').first().click(function() {
			item_object.operation.add_node();
		});

		branch.$container.find('.clear_button').first().click(function() {
			item_object.operation.clear();
		});

		branch.$container.find('.parent_button').click(function(e) {
			e.stopPropagation();
			item_object.operation.connect_parent();
		});
	},
	signum: function(x) {
	    return (x < 0) ? -1 : 1;
	},
	absolute: function(x) {
	    return (x < 0) ? -x : x;
	},
	draw_path: function(svg, path, startX, startY, endX, endY) {
	    // get the path's stroke width (if one wanted to be  really precize, one could use half the stroke size)
	    var stroke =  parseFloat(path.attr("stroke-width"));
	    // check if the svg is big enough to draw the path, if not, set heigh/width
	    if (svg.attr("height") <  endY)                 svg.attr("height", endY);
	    if (svg.attr("width" ) < (startX + stroke) )    svg.attr("width", (startX + stroke));
	    if (svg.attr("width" ) < (endX   + stroke) )    svg.attr("width", (endX   + stroke));
	    
	    var deltaX = (endX - startX) * 0.15;
	    var deltaY = (endY - startY) * 0.15;
	    // for further calculations which ever is the shortest distance
	    var delta  =  deltaY < this.absolute(deltaX) ? deltaY : this.absolute(deltaX);

	    // set sweep-flag (counter/clock-wise)
	    // if start element is closer to the left edge,
	    // draw the first arc counter-clockwise, and the second one clock-wise
	    var arc1 = 0; var arc2 = 1;
	    if (startX > endX) {
	        arc1 = 1;
	        arc2 = 0;
	    }
	    // draw tha pipe-like path
	    // 1. move a bit down, 2. arch,  3. move a bit to the right, 4.arch, 5. move down to the end 
	    path.attr("d",  "M"  + startX + " " + startY +
	                    " V" + (startY + delta) +
	                    " A" + delta + " " +  delta + " 0 0 " + arc1 + " " + (startX + delta*this.signum(deltaX)) + " " + (startY + 2*delta) +
	                    " H" + (endX - delta*this.signum(deltaX)) + 
	                    " A" + delta + " " +  delta + " 0 0 " + arc2 + " " + endX + " " + (startY + 3*delta) +
	                    " V" + endY );
	},
	draw_self_connection: function($svg, $path, $element) {
		var position = $element.find('.node_shape').first().offset();
		//var start = position.top-160;
		
		var start = position.top-220;
		var stop = 0; //start - 50;
		//var stop = position.top - $element.outerHeight();
		var start_x = position.left+25;
		var stop_x = 300;//position.left-50;

		var id = $path.attr('id');

		var c_1_x = 0;//start_x-25;
		var c_1_y = -150;////start-7;
		var c_2_x = 300;//stop_x-15;
		var c_2_y = -150;//stop-3;

		/*$svg[0].insertAdjacentHTML('beforeend', '<path\
				            id="'+id+'_2"\
				            d="M0 0"\
				            stroke="#000"\
				            stroke-width="12px"\
				            style="stroke:#000; fill:none;"/>');*/
		var d_value = "M"+start_x+","+start+" c-125,125 115,115 -0,-0";//'M'+start_x+','+start+' c'+c_1_x+','+c_1_y+' '+c_2_x+','+c_2_y+' '+stop_x+','+stop;
		console.log(d_value);
		$path.attr("d", d_value);
		//this.draw_path($svg, $path, start, stop, start_x, stop_x);
	},
	connect_elements: function(svg, path, startElem, endElem) {
	    //$("#svg1").attr("height", "auto");
	    //$("#svg1").attr("width", "auto");	
		if(startElem[0] == endElem[0]) {
			return this.draw_self_connection(svg, path, startElem);
		}
	    var svgContainer = svg.parent();//$("#svgContainer");

	    // if first element is lower than the second, swap!
	    if(startElem.offset().top > endElem.offset().top){
	        var temp = startElem;
	        startElem = endElem;
	        endElem = temp;
	    }

	    // get (top, left) corner coordinates of the svg container   
	    var svgTop  = svgContainer.offset().top;
	    var svgLeft = svgContainer.offset().left;

	    // get (top, left) coordinates for the two elements
	    var startCoord = startElem.offset();
	    var endCoord   = endElem.offset();

	    // calculate path's start (x,y)  coords
	    // we want the x coordinate to visually result in the element's mid point
	    var startX = startCoord.left + 0.5*startElem.outerWidth() - svgLeft;    // x = left offset + 0.5*width - svg's left offset
	    var startY = startCoord.top  + startElem.outerHeight() - svgTop;        // y = top offset + height - svg's top offset

	        // calculate path's end (x,y) coords
	    var endX = endCoord.left + 0.5*endElem.outerWidth() - svgLeft;
	    var endY = endCoord.top  - svgTop;

	    // call function for drawing the path
	    //$("#svg1").attr("height", "0");
	    //$("#svg1").attr("width", "0");
	    //startX -= 400;
	    //endX -= 400;
	    /*console.log(startX);
	    console.log(startY);
	    console.log(endX);
	    console.log(endY);*/
	    /*startX = 0;
	    startY = 0;
	    endX = 100;
	    endY = 100;*/
	    startY -= 45;
	    endY -= 45;
	    this.draw_path(svg, path, startX, startY, endX, endY);


	}
};