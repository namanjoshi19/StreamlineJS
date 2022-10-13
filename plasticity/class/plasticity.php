<?
error_reporting(E_ERROR | E_PARSE);
class plasticity extends _class {	
	public $function_access = array(
		'public' => array(
			'generate_definition'
		),
		'user' => array(
			'*'
		)
	);
	
	function __construct($sql, $statement, $user_id) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
		
		$this->items = array();
		$this->items["user_groups"] = new user_group("user_group", "user_groups", $this, false, $this->language, "application_id");
		$this->items["columns"] = new column("column", "columns", $this, false, $this->language);
		$this->items["data_element_types"] = new data_element_type("data_element_type", "data_element_types", $this, false, $this->language);
		$this->items["data_element"] = new data_element("data_element", "data_elements", $this, false, $this->language, "element_id");
		$this->items["element_types"] = new element_type("element_type", "element_types", $this, false, $this->language);
		$this->items["elements"] = new element("element", "elements", $this, false, $this->language, "page_id");
		$this->items["applications"] = new application("application", "applications", $this, false, $this->language);
		$this->items["nodes"] = new node("node", "nodes", $this, false, $this->language, "application_id");
		$this->items["node_properties"] = new node_property("application", "node_properties", $this, false, $this->language, "node_id");
		$this->items["pages"] = new page("page", "pages", $this, false, $this->language, "application_id", 100);
		$this->items["tables"] = new table("table", "tables", $this, false, $this->language, "application_id");
		$this->calendar = new calendar();
	}

	private $calendar;

	function calendar($year='', $month='') {
		return $this->calendar->month($year, $month, '', '', true);	
	}

	function lowest_user_group() {

	}

	function get_interface_diagram($id) {
		$query = "SELECT name as title FROM pages WHERE id = ".$id;
		return $this->sql->get_row($query, 1);
	}

	function get_data_element_diagram($id) {
		$query = "SELECT name as title FROM elements WHERE id = ".$id;
		return $this->sql->get_row($query, 1);
	}


	/*function get_edit_element($id) {
		$query = "SELECT name as title FROM elements WHERE id = ".$id;
		return $this->sql->get_row($query, 1);
	}*/

	function get_parent_group_select($application_id) {
		if($application_id == -1) {
			return array();
		}
		$rows = array(
			array(
				'id' => '2',
				'title' => 'User',
				'children' => $this->user_group_value(0, $application_id)
			)
		);
		return $rows;	
	}
	
	/*function get_select() {
		$rows = array(
			array(
				'id' => '0',
				'title' => 'No expense type',
				'children' => $this->expense_category_value(0)
			)
		);
		return $rows;	
	}*/

	function unlock_data_structure($application_id) {
		$query = "UPDATE nodes SET node_locked = 0 WHERE application_id = ".$application_id;
		$this->sql->execute($query);
		return true;
	}
	
	function user_group_value($parent_id=0, $application_id=NULL) {
		//$query = "SELECT id, name as title FROM expense_categories WHERE expense_category_parent_id = ".$parent_id." AND user_id = ".$this->_class->get_user_id();
		$query = "SELECT * FROM user_groups WHERE application_id = ".$application_id." AND parent_group_id = ".$parent_id;
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $key => $row) {
			$rows[$key]['children'] = $this->user_group_value($row['id']);	
		}
		return $rows;	
	}

	function user_group_member($group_name_id, $application_id, $group_object=NULL) {
		/*if($group_name_id == 6) {
			return true;
		}*/
		//return true;
		if($this->user_id == -1) {
			return false;
		}
		/*if($this->user_id != -1 && $group_name_id == 5) {
			return true;
		}*/
		//var_dump($group_name_id, $group_object);
		$group;
		if($group_object == NULL) {
			$query = "SELECT * FROM user_groups WHERE id = '".$group_name_id."' AND (application_id IS NULL or application_id = ".$application_id.")";
			$group = $this->sql->get_row($query, 1);
		} else {
			$group = $group_object;
		}

		$query = "SELECT user_groups.* FROM user_group_users, user_groups WHERE user_group_users.user_group_id = user_groups.id AND user_group_users.user_id = ".$this->user_id." AND (user_groups.application_id IS NULL OR user_groups.application_id = ".$application_id.")";
		$user_groups = $this->sql->get_rows($query, 1);

		foreach($user_groups as $user_group) {
			if($user_group['id'] == $group['id']) {
				return true;
			}
			$result = false;
			$query = "SELECT * FROM user_groups WHERE id = ".$user_group['parent_group_id'];
			$parents = $this->sql->get_rows($query, 1);
			foreach($parents as $parent) {
				$intermediate_result = $this->user_group_sub($group, $parent, $application_id);
				if($intermediate_result === true) {
					return true;
				}
			}
		}
		return false;
	}

	function user_group_sub($group, $user_group, $application_id) {
		if($user_group['id'] == $group['id']) {
			return true;
		}
		$result = false;
		$query = "SELECT * FROM user_groups WHERE id = ".$user_group['parent_group_id'];
		$parents = $this->sql->get_rows($query, 1);
		foreach($parents as $parent) {
			$intermediate_result = $this->user_group_member(NULL, $application_id, $parent);
			if($intermediate_result === true) {
				return true;
			}
		}
	}

	function user_group_member_by_name($user_group_name, $application_id) {
		$user_group_name = strtolower($user_group_name);
		$query = "SELECT * FROM user_groups WHERE name = '".$group_name_id."' AND (application_id IS NULL or application_id = ".$application_id.")";
		$group = $this->sql->get_row($query, 1);
		return $this->user_group_member($group['id'], $application_id);
	}
		
	function get_state() {
		return array(
		);	
	}
	
	function get_user_access_select($application_id) {
		$query = "SELECT id, group_name as title FROM plasticity.user_groups WHERE application_id IS NULL OR application_id = ".$application_id." ORDER BY title ASC ";
		return $this->sql->get_rows($query, 1);
	}

	function get_table_select($data_element_id=NULL) {
		$query = "SELECT tables.id, tables.name as title FROM tables, data_elements, elements, pages, p_schemas WHERE data_elements.element_id = elements.id AND elements.page_id = pages.id AND pages.application_id = p_schemas.application_id AND tables.schema_id = p_schemas.id AND data_elements.id = ".$data_element_id;
		$rows = $this->sql->get_rows($query, 1);
		$query = "SELECT tables.id, tables.name as title FROM tables WHERE tables.schema_id = 0";
		$rows = array_merge($rows, $this->sql->get_rows($query, 1));
		return $rows;
	}

	function get_target_table_select($element_id=NULL) {
		$query = "SELECT tables.id, tables.name as title FROM tables, elements, pages, p_schemas WHERE elements.page_id = pages.id AND pages.application_id = p_schemas.application_id AND tables.schema_id = p_schemas.id AND elements.id = ".$element_id;
		return $this->sql->get_rows($query, 1);
	}

	function columns_table($search_term=NULL, $offset=0, $item_id=NULL, $post_data=NULL, $select_columns=NULL) {
		$query = "SELECT columns.*, tables.name as table_name FROM columns, tables, p_schemas WHERE columns.table_id = tables.id AND tables.schema_id = p_schemas.id AND p_schemas.application_id = ".$item_id." AND columns.foreign_table_id IS NOT NULL";
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $key => $row) {
			$rows[$key]['name'] = $row['table_name'].".".$row['name'];
		}
		return $rows;
	}


	function columns_list_count($search_term=NULL, $offset=0, $item_id=NULL, $post_data=NULL, $select_columns=NULL) {
		return -1;
	}

	
	private $view_containers_table_index = array();


	private $element_type_index = array();
	private $data_element_primary_data_source_index = array();

	function generate_definition($application_name='forum') {
		$this->data_element_primary_data_source_index = array();

		$query = "SELECT * FROM applications WHERE app_name = '".$application_name."'";
		$application = $this->sql->get_row($query, 1);

		$application_id = $application['id'];

		$this->sql->set_plasticity_application_id($application_id);

		$query = "SELECT * FROM element_types";
		$element_types = $this->sql->get_rows($query, 1);

		$element_type_index = array(
			/*'elements' => [],
			'form_elements' => []*/
		);
		foreach($element_types as $element_type) {
			$array_index = NULL;
			if($element_type['form_element'] == 1) {
				$array_index = 'form_elements';
			} else if($element_type['content_element'] == 1) {
				$array_index = 'elements';
			}
			//if($array_index !== NULL) {
				$element_type_index[$element_type['id']] = $element_type['name']; //[$array_index]
			//}
		}
		$this->element_type_index = &$element_type_index;

		$query = "SELECT * FROM applications WHERE id = ".$application_id;
		$application = $this->sql->get_row($query, 1, NULL, true);
		$definition = '
			{
				"application_id": '.$application_id.',
				"plasticity": true,
				"routes": {
					"default_route": {
						"everyone": "index",
						"user": "index"	
					}
				},
				"pages": [

				]
			}
		';

		$definition_object = json_decode($definition, true);

		$definition_object = $this->apply_definition_addition($application['definition_addition'], $definition_object);

		$query = "SELECT * FROM pages WHERE application_id = ".$application_id;
		$pages = $this->sql->get_rows($query, 1);
		foreach($pages as $page) {
			/*$definition_object["pages"][] = array(
				'id' => $page['name'],
				'title' => $page['title'],
				'user_access' => 'user', //fix later
				'content' => [],
				'icon_i' => $page['icon']
			);*/
			$pre_element_data = array();
			$page_object = array(
				'id' => $page['name'],
				'title' => $page['title'],
				'user_access' => 'user', //fix later
				'content' => [],
				'icon_i' => $page['icon']
			);
			//$page_definition_object = &$definition_object["pages"][count($definition_object)-1];
			$query = "SELECT elements.* FROM elements, element_types WHERE elements.element_type_id = element_types.id AND (content_element = 1 OR content_element = 3) AND form_element = 0 AND page_id = ".$page['id'];
			$elements = $this->sql->get_rows($query, 1);
			$elements = $this->get_order($elements, "elements");
			foreach($elements as $element) {
				$element_name = $element['name']."__".$page['name'];
				$element_type_name = $element_type_index[$element['element_type_id']];
				$element_fullname = $element_name."_".$element_type_name;
				$element_definition = array(
					'id' => $element_name,
					//'content' => array(),
					'type' => $element_type_name,
					'fullname' => $element_fullname
				);
				$parents = $element['parents'];
				if($parents != NULL && strlen($parents) > 0) {
					$parents = json_decode($parents, true);
				} else {
					$parents = array();
				}
				$parents_fullnames = [];
				foreach($parents as $parent) {
					$parents_fullnames[$parent] = $this->get_element_fullname($parent);
				}

				$children = $this->get_children($element['id'], $page['id'], 0, true);

				$children = $this->get_order($children, "elements");
				$children_fullnames = [];
				foreach($children as $child) {
					$children_fullnames[$child['id']] = $this->get_element_fullname($child['id']);
				}
				$parent_objects = array();
				$data_elements = array();
				foreach($parents as $parent) {
					$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE elements.element_type_id = element_types.id AND elements.id = ".$parent;
					$parent_object = $this->sql->get_row($query, 1);
					$parent_objects[] = $parent_object;
					if($parent_object['type_name'] == 'dataelement') {
						$parent_object['parent_object'] = $this->traverse_data_elements($parent_object);
						$data_elements[] = $parent_object;
					}
				}
				if(!isset($element_definition['post_data'])) {
					$element_definition['post_data'] = array();
				}
				$post_data_tables = array();
				$data_element_child_table = NULL;
				//var_dump("--init--");
				$crawl_up = true;
				$immediate_data_element_parent = NULL;
				//var_dump($data_elements);
				//var_dump($element);
				foreach($data_elements as $data_element) {
					while(isset($data_element['parent_object'][0]) && $crawl_up) {
						if($data_element['element_type_id'] == 9 && $immediate_data_element_parent == NULL) {
							//var_dump("inside1");
							$immediate_data_element_parent = $data_element;
						}
						if($data_element['parent_object'][0]['type_name'] == 'pagedata') {
							//var_dump("inside2");
							$this->index_data_elements($data_element['id']);
							$query = "SELECT * FROM data_elements WHERE element_id = ".$data_element['id'];
							$data_element_rows = $this->sql->get_rows($query, 1);
							foreach($data_element_rows as $data_element_row) {
								/*if($data_element_row['data_element_type_id'] == 2) {
									$data_element_child_table = $data_element_row['table_id'];
								}*/
								if($data_element_row['data_element_type_id'] == 1 && $data_element_row['function'] != 'ignore') {
									$data_element_child_table_value = $this->find_primary_data_source($data_element_row);
									//var_dump($data_element_child_table_value);
									if($data_element_child_table_value !== false && $data_element_child_table == NULL) {
										//var_dump("set");
										$data_element_child_table = $data_element_child_table_value;
										//$this->data_element_primary_data_source_index[$element['id']] = $data_element_child_table;
									}
									//var_dump("data_element_child_table");
									//var_dump($data_element_child_table);
									$post_data_column_set = false;
									if(isset($data_element_row['transform_name']) && $data_element_row['transform_name'] !== NULL && strlen($data_element_row['transform_name']) > 0 && strpos($data_element_row['transform_name'], '.') === false) {
										$element_definition['post_data'][$data_element_row['transform_name']] = $data_element_row['name'];
										$post_data_column_set = true;
										if($data_element_child_table !== false) {
											$post_data_tables[$data_element_row['transform_name']] = $data_element_child_table;
										}
									} else if($data_element_row['name'] !== NULL && strpos($data_element_row['name'], '.') === false && strlen($data_element_row['name']) > 0) {
										$element_definition['post_data'][$data_element_row['name']] = $data_element_row['name'];
										$post_data_column_set = true;
										if($data_element_child_table !== false) {
											$post_data_tables[$data_element_row['name']] = $data_element_child_table;
										}
									}
									if($post_data_column_set) {
										//$post_data_tables[$data_element
									}
								}
							}
							/**/
							//$element_definition['post_data']
						}
						/* else if($data_element['element_type_id'] == 9 && $data_element['parent_object'][0]['element_type_id'] == 9) {
							$data_element_child_table = $this->find_primary_data_source($data_element_row);
							$crawl_up = false;
						}*/
						$data_element = $data_element['parent_object'][0];
					}
				}
				//var_dump($element);
				//var_dump($data_element_child_table);
				if(isset($element['target_table_id']) && $element['target_table_id'] != NULL && $element_type_name != 'form' && $element_type_name != 'comments' && $data_element_child_table != NULL) { // { //&& $crawl_up
					//var_dump($post_data_tables);
					foreach($post_data_tables as $post_data_key => $post_data_table) {
						$query = "SELECT * FROM columns WHERE table_id = ".$element['target_table_id']." AND foreign_table_id = ".$post_data_table;
						//var_dump($query);
						$post_data_table_row = $this->sql->get_row($query, 1);
						//var_dump($post_data_table_row);
						$post_data_value = $element_definition['post_data'][$post_data_key];
						unset($element_definition['post_data'][$post_data_key]);
						$element_definition['post_data'][$post_data_table_row['name']] = $post_data_value;
					} 
				}
				$reference_children = $this->get_children($element['id'], $page['id'], 0, true, 0);
				$reference_children = $this->get_order($reference_children, "elements");
				//$element_definition['content'] = array();
				switch($element_type_name) {
					case 'filebrowser':
						$parent_forms = [];
						foreach($parent_objects as $parent_object) {
							if($parent_object['element_type_id'] == 1) {
								$parent_forms[] = $parent_object;
							}
						}
						$element_definition['unset_plasticity'] = true;
						if(count($parent_forms) > 0) {
							$parent_form = $parent_forms[0];

							$element_definition['submit_mask'] = array(
								'connect_id' => $parents_fullnames[$parent_form['id']].'.id',
								'foreign_table_name' => "'".$parents_fullnames[$parent_form['id']]."'",
								'plasticity_element_id' => "'".$element['id']."'"
							);
							if(!isset($element_definition['dependencies'])) {
								$element_definition['dependencies'] = array();
							}
							$element_definition['dependencies'][] = array(
								'link' => $parents_fullnames[$parent_form['id']].'.id',
								'value' => 'set'
							);
						}
						break;
					case 'menu':
						$menu_pages = [];
						foreach($reference_children as $child) {
							switch($child['type_name']) {
								case 'pagereference':
									$query = "SELECT * FROM pages WHERE id = ".$child['page_reference_id'];
									$menu_pages[] = $this->sql->get_row($query, 1);
									break;
							}
						}
						foreach($children as $child) {
							switch($child['type_name']) {
								case 'frame':
									$element_definition['target'] = $child['name'];
									break;
							}
						}
						$element_definition['position'] = 'top';

						foreach($menu_pages as $menu_page) {
							$element_definition['content'][] = $menu_page['name'];	
						}
						break;
					case 'form':
						$element_definition['content'] = array();
						$parent_forms = [];
						foreach($parent_objects as $parent_object) {
							if($parent_object['element_type_id'] == 1) {
								$parent_forms[] = $parent_object;
							}
						}
						foreach($parent_forms as $parent_form) {
							if(!isset($element_definition['dependencies'])) {
								$element_definition['dependencies'] = array();
							}
							$element_definition['dependencies'][] = array(
								'link' => $parents_fullnames[$parent_form['id']].'.id',
								'value' => 'set'
							);
						}
						foreach($children as $child) {
							//$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE element_types.id = elements.element_type_id AND elements.id = ".$child;
							//$child_element = $this->sql->get_row($query, 1);
							$child_element = $child;
							$child_element_type_name = $element_type_index[$child['element_type_id']];
							switch($child_element['type_name']) {
								/*case 'form':
									//var_dump($child);
									break;*/
								case 'filebrowser':
									//$filebrowser_definition_element_key = $this->find_element_definition_element($page_object, $children_fullnames[$child['id']], "filebrowser", true);

									if(!isset($element_definition['on_submit'])) {
										$element_definition['on_submit'] = array();
									}
									if(!isset($element_definition['on_load'])) {
										$element_definition['on_load'] = array();
									}
									$element_definition['on_submit'][] = $children_fullnames[$child['id']];
									$element_definition['on_load'][] = $children_fullnames[$child['id']];
									break;
								case 'tree':
								case 'table':
									if(!isset($element_definition['on_submit'])) {
										$element_definition['on_submit'] = array();
									}
									$element_definition['on_submit'][] = array('link' => $children_fullnames[$child['id']], 'load_mask' => false);
									//var_dump("child_name: ".$child['name']);
									//var_dump($parent_forms);

									//Ef parent hefur parent form?
									if(count($parent_forms) > 0) {
										//var_dump($action);
										//$action = NULL;
										$action = $child['name'].'__'.$page['name'].'_'.$child_element_type_name;
										//var_dump($action);
										//$v = array();
										$v = array(
											'__return_relations' => true
										);

										$query = new query($action, $v, $this, true, $application_id);
										$relations = $query->get();


										$relations_values = array();
										foreach($relations as $relation) {
											$relation = $relation[0];
											$set_relation;
											if($relation[1] != NULL) {
												//$form_element_definition['post_data'][$relation[1]] = $relation[1];
												$set_relation = $relation[1];
												//$relations_values[] = $relation[1];
											} else if(isset($relation[3]) && $relation[3] != NULL) {
												//$form_element_definition['post_data'][$relation[3]] = $relation[3];
												$set_relation = $relation[3];
												//$relations_values[] = $relation[3];
											}
											$query = "SELECT * FROM columns WHERE id = ".$set_relation;
											$column = $this->sql->get_row($query, 1);
											//$relations_values['id'] = $column['name'];
										}
										//echo "relations:\n";
										//var_dump($relations_values);
										//var_dump($action);
										$main_foreign_key_name = array_keys($relations_values)[0];

										foreach($parent_forms as $parent_form) {
											$form_element_definition_parent_form_key = $this->find_element_definition_element($page_object, $parents_fullnames[$parent_form['id']], "form", true);
											if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_submit'])) {
												$page_object['content'][$form_element_definition_parent_form_key]['on_submit'] = array();
											}
											$page_object['content'][$form_element_definition_parent_form_key]['on_submit'][] = $children_fullnames[$child['id']];
											if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_submit_load_mask'])) {
												$page_object['content'][$form_element_definition_parent_form_key]['on_submit_load_mask'] = array();
											}
											//$page_object['content'][$form_element_definition_parent_form_key]['on_submit_load_mask']["id"] = $foreign_key_column['name'];
											if($main_foreign_key_name != NULL) {
												$page_object['content'][$form_element_definition_parent_form_key]['on_submit_load_mask'][$main_foreign_key_name] = $main_foreign_key_name;
											}


											if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_load'])) {
												$page_object['content'][$form_element_definition_parent_form_key]['on_load'] = array();
											}
											$page_object['content'][$form_element_definition_parent_form_key]['on_load'][] = $children_fullnames[$child['id']];
											if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_load_load_mask'])) {
												$page_object['content'][$form_element_definition_parent_form_key]['on_load_load_mask'] = array();
											}
											//$page_object['content'][$form_element_definition_parent_form_key]['on_load_load_mask']["id"] = $foreign_key_column['name'];
											if($main_foreign_key_name != NULL) {
												$page_object['content'][$form_element_definition_parent_form_key]['on_load_load_mask'][$main_foreign_key_name] = $main_foreign_key_name;
											}
											//var_dump($form_element_definition_parent_form);

										}
									}
									/*"on_submit": [
										{	
											"link": "property_entries_table",
											"load_mask": "false"
										},
										"property_files_table"
									],*/
									//foreach($definition_object
									break;
							}
						}
						$form_element_ids = array();
						$form_content = $this->get_children($element['id'], $page['id'], 1, true);
						$form_content = $this->get_order($form_content, "elements");
						foreach($form_content as $form_element) {
							$form_element_definition = array(
								'id' => $form_element['name'],
								'type' => $form_element['type_name'],
								'fullname' => $this->get_element_fullname($form_element['id'])
							);
							switch($form_element['type_name']) {
								/*case 'hidden':
									if(!isset($element_definition['get_load_mask'])) {
										$element_definition['get_load_mask'] = array();
									}
									$element_definition['get_load_mask'][$form_element['name']] = $form_element['name'];
									break;*/
								case 'typeahead':
									$target_table_id = $form_element['target_table_id'];
									$query = "SELECT name FROM tables WHERE id = ".$target_table_id;
									$target_table = $this->sql->get_row($query, 1);
									$form_element_definition['insert_table'] = $target_table['name'];
									break;
								case 'select':
									$form_element_definition['content'] = 'fetch';
									$form_element_definition['page_name'] = $page['name'];
									if(count($parent_forms) == 0) {
										$action = $form_element['name'].'__'.$page['name'].'_'.$form_element['type_name'];
										$v = array(
											'__return_relations' => true
										);
										//var_dump($action);
										$query = new query($action, $v, $this, true, $application_id);
										$relations = $query->get();
										if(!isset($form_element_definition['post_data'])) {
											$form_element_definition['post_data'] = array();
										}	
										//var_dump($action);
										foreach($relations as $relation) {
											$relation = $relation[0];
											if($relation[1] != NULL) {
												$form_element_definition['post_data'][$relation[1]] = $relation[1];
											} else if(isset($relation[3]) && $relation[3] != NULL) {
												$form_element_definition['post_data'][$relation[3]] = $relation[3];
											}
										}
										//var_dump($form_element_definition);
										//echo "relations: \n";
										//var_dump($relations);
										//$this->sql->set_plasticity_application_id(NULL);
										//$relations = $this->query
									} else {
										$action = $form_element['name'].'__'.$page['name'].'_'.$form_element['type_name'];
										$query = new query($action, $v, $this, true, $application_id);
										$relations = $query->get();
										if(!isset($form_element_definition['post_data'])) {
											$form_element_definition['post_data'] = array();
										}
										//var_dump($action);	
										//var_dump($relations);
										$relations_values = array();
										foreach($relations as $relation) {
											$relation = $relation[0];
											if($relation[1] != NULL) {
												//$form_element_definition['post_data'][$relation[1]] = $relation[1];
												$relations_values[$relation[1]] = $relation[1];
											} else if(isset($relation[3]) && $relation[3] != NULL) {
												//$form_element_definition['post_data'][$relation[3]] = $relation[3];
												$relations_values[$relation[3]] = $relation[3];
											}
										}
										//var_dump($relations_values);
										foreach($parent_forms as $parent_form) {
											//var_dump($parents_fullnames[$parent_form["id"]]);
											$form_element_definition_parent_form = $this->find_element_definition_element($page_object, $parents_fullnames[$parent_form['id']], "form");

											//var_dump($form_element_definition_parent_form);
											foreach($form_element_definition_parent_form['content'] as $parent_form_child) {
												//var_dump($parent_form_child);
												if(isset($relations_values[$parent_form_child['id']])) {
													$relations_values[$parent_form_child['id']] = $form_element_definition_parent_form['id'].'_form.'.$relations_values[$parent_form_child['id']];
												} else if(isset($relations_values[$parent_form_child['id'].'_id'])) {

													$relations_values[$parent_form_child['id'].'_id'] = $form_element_definition_parent_form['id'].'_form.'.$relations_values[$parent_form_child['id'].'_id'];
												}
											}
											//var_dump($relations_values);
										}
										foreach($relations_values as $key => $value) {
											//var_dump($value);
											$form_element_definition['post_data'][$key] = $value;
										}
										//var_dump($relations_values);
									}
									$select_parents = $this->get_parents($form_element['id'], 1, true);
									foreach($select_parents as $select_parent) {
										if($select_parent['element_type_id'] == 14) {
											if(!isset($form_element_definition['post_data'])) {
												$form_element_definition['post_data'] = array();
											}
											$form_element_definition['post_data'][$select_parent['name'].'_id'] = $element_definition['fullname'].'.'.$select_parent['name'].'_id';
										}
									}
									/*$select_children = $this->get_children($form_element['id'], $page['id'], 1, true);
									foreach($select_children as $select_child) {
										if($select_child['type_name'] = 'select') {
											$child_fullname = $this->get_element_fullname($select_child['id']);
											$pre_element_data[$child_fullname] = array(
												'post_data' => array

												)
											);

										}
									}*/
									break;
							}
							/*if($form_element['type_name'] == "select") {
								$form_element_ids[$form_element['name'].'_id'] = true;
							} else {*/
								$form_element_ids[$form_element['name']] = true;
							//}
							//var_dump($form_element_ids);
							$form_element_definition = $this->apply_definition_addition($form_element['definition_addition'], $form_element_definition);
							$element_definition['content'][] = $form_element_definition;
						}
						$query = "SELECT * FROM columns WHERE table_id = ".$element['target_table_id']." AND type = '1'";
						$foreign_key_columns = $this->sql->get_rows($query, 1);

						$query = "SELECT * FROM columns WHERE table_id = ".$element['target_table_id']." AND type = '2'";
						$connect_key_columns = $this->sql->get_rows($query, 1);

						//foreach($connect_key_columns as $connect_key_column) {
						if(count($connect_key_columns) > 0 && count($foreign_key_columns) == 0 && count($parent_forms) > 0) {
							//$query = "SELECT * foreign_table_ids WHERE table_id = ";
							$foreign_key_columns = [
								[
									'name' => 'connect_id',
									'foreign_table_id' => $parent_forms['target_table_id']
								]
							];
						}

						foreach($foreign_key_columns as $foreign_key_column) {
							$id_stripped_name = explode("_id", $foreign_key_column['name'])[0];
							if(!isset($form_element_ids[$foreign_key_column['name']]) && !isset($form_element_ids[$id_stripped_name])) {
								$form_element_definition = array(
									'id' => $foreign_key_column['name'],
									'type' => 'hidden',
									'persist_value' => true
								);
								if($foreign_key_column['foreign_table_id'] == $element['target_table_id']) {
									$form_element_definition['allow_empty'] = true;
									$form_element_definition['default_value'] = 0;
								}
								$element_definition['content'][] = $form_element_definition;

								if(!isset($element_definition['get_load_mask'])) {
									$element_definition['get_load_mask'] = array();
								}
								$element_definition['get_load_mask'][$foreign_key_column['name']] = $foreign_key_column['name'];

								if(count($parent_forms) > 0) {
									//var_dump($parent_forms);
									foreach($parent_forms as $parent_form) {
										$form_element_definition_parent_form_key = $this->find_element_definition_element($page_object, $parents_fullnames[$parent_form['id']], "form", true);
										//var_dump($form_element_definition_parent_form_key);
										if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_submit'])) {
											$page_object['content'][$form_element_definition_parent_form_key]['on_submit'] = array();
										}
										$page_object['content'][$form_element_definition_parent_form_key]['on_submit'][] = $element_fullname;
										if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_submit_load_mask'])) {
											$page_object['content'][$form_element_definition_parent_form_key]['on_submit_load_mask'] = array();
										}
										$page_object['content'][$form_element_definition_parent_form_key]['on_submit_load_mask']["id"] = $foreign_key_column['name'];


										if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_load'])) {
											$page_object['content'][$form_element_definition_parent_form_key]['on_load'] = array();
										}
										$page_object['content'][$form_element_definition_parent_form_key]['on_load'][] = $element_fullname;
										if(!isset($page_object['content'][$form_element_definition_parent_form_key]['on_load_load_mask'])) {
											$page_object['content'][$form_element_definition_parent_form_key]['on_load_load_mask'] = array();
										}
										$page_object['content'][$form_element_definition_parent_form_key]['on_load_load_mask']["id"] = $foreign_key_column['name'];
										//var_dump($form_element_definition_parent_form);

									}
								}
							}
						}


						/*foreach($element_definition['content'] as $content_key => $form_element_value) {
							if($form_element_value['type'] == 'select') {
								foreach($foreign
							}
						}*/

						break;
					case 'tree':
						$table_data_element_parent;
						foreach($parents as $parent) {
							$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE element_types.id = elements.element_type_id AND elements.id = ".$parent;
							$parent_element = $this->sql->get_row($query, 1);
							switch($parent_element['type_name']) {
								case 'form':
									$element_definition['target'] = $parents_fullnames[$parent];
									//foreach($definition_object
									break;
								case 'data':
									$table_data_element_parent = $parent_element;
									break;
							}
						}
						break;
					case 'table':
						$table_data_element_parent;
						foreach($parents as $parent) {
							$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE element_types.id = elements.element_type_id AND elements.id = ".$parent;
							$parent_element = $this->sql->get_row($query, 1);
							switch($parent_element['type_name']) {
								case 'form':
									$element_definition['target'] = $parents_fullnames[$parent];
									//var_dump($this->find_element_definition_element($page_object, $parents_fullnames[$parent], 'form'));
									if(isset($element_definition['dependencies'])) {
										$element_definition['dependencies'] = array_merge($element_definition['dependencies'], $this->find_element_definition_element($page_object, $parents_fullnames[$parent], 'form')['dependencies']);
									} else {
										$element_definition['dependencies'] = $this->find_element_definition_element($page_object, $parents_fullnames[$parent], 'form')['dependencies'];
									}
									//foreach($definition_object
									break;
								case 'dataelement':
									$table_data_element_parent = $parent_element;
									break;
							}
						}
						foreach($reference_children as $child) {
							//var_dump($child);
							switch($child['type_name']) {
								case 'pagereference':
									$query = "SELECT * FROM pages WHERE id = ".$child['page_reference_id'];
									$page = $this->sql->get_row($query, 1);
									//var_dump($page);
									if(!isset($element_definition['custom_actions'])) {
										$element_definition['custom_actions'] = array();
									}
									$element_definition['custom_actions'][$page['name'].'_button'] = array(
										'target_href' => $page['name'],
										/*'href_data' => array(
											'id' => 'id'
										),*/
										'value' => $page['title']
									);
									if(isset($child['definition_addition']) && $child['definition_addition'] != NULL) {
										$element_definition['custom_actions'][$page['name'].'_button'] = $this->apply_definition_addition($child['definition_addition'], $element_definition['custom_actions'][$page['name'].'_button']);
									}
									break;
							}
						}
						if(!isset($element_definition['post_data'])) {
							$element_definition['post_data'] = array();
						}
						$element_definition['post_data'] = $this->find_unconnected_foreign_relations($table_data_element_parent, $element_definition['post_data']);
						break;
					case 'frame':
						$element_definition['id'] = $element['name'];

						foreach($reference_children as $child) {
							if($child['type_name'] == 'pagereference') {
								$query = "SELECT * FROM pages WHERE id = ".$child['page_reference_id'];
								$page_row = $this->sql->get_row($query, 1);
								$element_definition['default_page'] = $page_row['name'];
							}
						}
						break;
					/*case 'menu':

						break;*/
					case 'list':

						break;
					case 'wrap':
						$element_definition['element'] = "div";
						$element_definition['wrap_elements'] = array();
						//var_dump($children);
						foreach($children as $child) {
							$element_definition['wrap_elements'][] = $children_fullnames[$child['id']];
						}
						//var_dump($parents);
						if(count($parents) == 1) {
							//var_dump($parents[0]);
							if($this->get_element_by_id($parents[0])['type_name'] != 'wrap') {
								$element_definition['inject'] = $parents_fullnames[$parents[0]];//
							}
						} else {
							$element_definition['inject'] = array();
							foreach($parents as $parent) {
								if($this->get_element_by_id($parent)['type_name'] != 'wrap') {
									$element_definition['inject'][] = $parents_fullnames[$parent];//$this->get_element_by_id($parents[0])['name'];
								}
							}
						}
						break;
				}

				switch($element_type_name) {
					case 'componentcontainer':
					case 'list':
					case 'comments':
						$components = $this->get_children($element['id'], $page['id'], 0, true, 2);
						if(!isset($element_definition['components'])) {
							$element_definition['components'] = array();
						}
						foreach($components as $component) {
							$connect_value_table_ids = $this->find_connect_value_table_ids($component);
							$element_definition['components'][$component['name']] = array(
								'type' => $component['type_name'],
								'id' => $component['name']."__".$page['name'],
								'container' => $component['name'],
								'___connect_value_table_id' => $connect_value_table_ids,
							);
							if($immediate_data_element_parent != NULL) {
								$element_definition['data_name'] = $immediate_data_element_parent['name'];
							}
							$element_definition['components'][$component['name']] = $this->apply_definition_addition($component['definition_addition'], $element_definition['components'][$component['name']]);
						}
						break;
				}
				/*if($element['definition_addition'] != NULL && strlen($element['definition_addition']) > 0) {
					//var_dump($element['definition_addition']);
					$definition_addition = json_decode($element['definition_addition'], true);
					//var_dump($definition_addition);
					if($definition_addition !== NULL) {
						foreach($definition_addition as $definition_addition_key => $definition_addition_value) {
							$element_definition[$definition_addition_key] = $definition_addition_value;
						}
					}
				}*/
				//var_dump($element['definition_addition']);
				//var_dump($element_definition);
				$element_definition = $this->apply_definition_addition($element['definition_addition'], $element_definition);
				//var_dump($element_definition);
				$page_object['content'][] = $element_definition;
				//$definition_object['pages'][count($definition_object['pages'])-1]['content'][] = $element_definition;
			}
			$definition_object["pages"][] = $page_object;
			$definition_object['pages'][count($definition_object['pages'])-1] = $this->apply_definition_addition($page['definition_addition'], $definition_object['pages'][count($definition_object['pages'])-1]);
		}
		$this->sql->set_plasticity_application_id(NULL);
		return $definition_object;
	}

	function find_element_definition_element($page_definition, $element_id, $element_type, $return_key=false) {
		//var_dump($page_definition);
		foreach($page_definition['content'] as $key => $element) {
			if($element['id'] == $element_id && $element['type'] == $element_type || (isset($element['fullname']) && $element['fullname'] == $element_id)) {
				if($return_key) {
					return $key;
				}
				return $element;
			}
		}
		return NULL;
	}

	function find_unconnected_foreign_relations($data_element, $post_data) {
		$this->index_data_elements($data_element['id']);
		//var_dump($this->data_elements['children']);
		$primary_data_source = $this->find_primary_data_source(NULL, true);
		$table_id = $primary_data_source['table_id'];
		//var_dump($table_id);
		$query = "SELECT * FROM columns WHERE type != 0 AND table_id = ".$table_id;
		$columns = $this->sql->get_rows($query, 1);
		//var_dump($columns);
		foreach($columns as $column) {
			//var_dump($column);
			if(!isset($post_data[$column['name']])) {
				$post_data[$column['name']] = $column['name'];
			}
		}
		//echo "post_data:\n";
		//var_dump($post_data);
		return $post_data;
	}

	function get_element_by_id($id) {
		$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE element_types.id = elements.element_type_id AND elements.id = ".$id;
		$element = $this->sql->get_row($query, 1);
		return $element;
	}

	function find_primary_data_source($data_element, $extra_validation=false) {
		//var_dump($this->data_elements);
		//var_dump($this->data_elements);
		$potential_children = [];

		foreach($this->data_elements['children'] as $root_child) {
			if($extra_validation == true || $data_element['id'] == $root_child['id']) {
				if(isset($root_child['children'])) {
					foreach($root_child['children'] as $immediate_child) {
						if($immediate_child['data_element_type_id'] == 2) {
							$potential_children[] = $immediate_child;
						}
					}
				}
				$potential_children[] = $root_child;
			}
		}
		//var_dump("potential children");
		//var_dump($potential_children);
		if($extra_validation) {
			foreach($potential_children as $child) {
				$parents = $child['parents'];
				if($parents != NULL && strlen($parents) > 0) {
					$parents = json_decode($parents, true);
				} else {
					$parents = [];
				}
				//var_dump($parents);
				if(count($parents) == 1 || count($parents) == 0) {
					return $child;
				}
			}
		} else {
			if(count($potential_children) > 0) {
				return $potential_children[0]['table_id'];
			}
		}
		/*$query = "SELECT * FROM data_elements WHERE element_id = ".$data_element['id']." AND (parents IS NULL OR parents = '' OR parents = '[]')";
		$data_elements_root = $this->sql->get_rows($query, 1);
		foreach($data_elements_root as $root_element) {
			$query = "SELECT * FROM data_elements";
			$children = $this->sql->get_rows($query, 1);
			foreach($children as $child) {
				$parents = $child['parents'];
				if($parents != NULL && strlen($parents) > 0) {
					$parents = json_decode($parents, true);
				} else {
					$parents = [];
				}
				if(in_array($root_element['id'], $parents) && $child['data_element_type_id'] == 2) {
					return $child['table_id'];
				}
			}
		}*/
		return false;
	}

	function traverse_data_elements($data_element) {
		$parents = $data_element['parents'];
		if($parents != NULL && strlen($parents) > 0) {
			$parents = json_decode($parents, true);
		} else {
			$parents = array();
		}
		$parent_objects = array();
		foreach($parents as $parent) {
			$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE elements.element_type_id = element_types.id AND elements.id = ".$parent;
			$parent_object = $this->sql->get_row($query, 1);
			if($parent_object['type_name'] == 'data' || $parent_object['type_name'] == 'pagedata') {
				$parent_object['parent_object'] = $this->traverse_data_elements($parent_object);
				$parent_objects[] = $parent_object;
			}
		}
		/*foreach($parent_objects as $parent_object) {
			$parent_objects = array_merge($parent_objects, $this->traverse_data_element($parent_object));
		}*/
		return $parent_objects;
	}

	function apply_definition_addition($definition_addition, $element_definition) {
		if($definition_addition != NULL && strlen($definition_addition) > 0) {
			//var_dump($definition_addition);
			//var_dump($element['definition_addition']);
			$definition_addition = json_decode($definition_addition, true);
			if(gettype($definition_addition) === 'string') {
				$definition_addition = json_decode($definition_addition, true);
			}
			//echo "set: \n";
			//var_dump($definition_addition);
			if($definition_addition !== NULL) {
				foreach($definition_addition as $definition_addition_key => $definition_addition_value) {
					//var_dump($definition_addition_key);
					if(isset($element_definition[$definition_addition_key])) {
						$element_definition[$definition_addition_key] = array_merge($element_definition[$definition_addition_key], $definition_addition_value);
					} else {
						$element_definition[$definition_addition_key] = $definition_addition_value;
					}
				}
			}
		}
		return $element_definition;
	}

	function get_children($element_id, $page_id, $form_element=0, $return_object=false, $content_element=1) {
		$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE elements.element_type_id = element_types.id AND form_element = ".$form_element." AND content_element = ".$content_element." AND page_id = ".$page_id;
		$elements = $this->sql->get_rows($query, 1);

		$children = array();
		foreach($elements as $element) {
			$parents = $element['parents'];
			if($parents != NULL && strlen($parents) > 0) {
				$parents = json_decode($parents, true);
			} else {
				$parents = array();
			}
			if(!$return_object) {
				if(in_array($element_id, $parents) && !in_array($element['id'], $children)) {
					$children[] = $element['id'];
				}
			} else {
				if(in_array($element_id, $parents)) {
					$children[] = $element;
				}
			}
		}
		return $children;
	}

	private $connect_value_table_ids = [];

	function find_connect_value_table_ids($element) {
		//var_dump($element);
		$this->connect_value_table_ids = [];
		$this->connect_value_table_input_reference = [];
		$this->data_elements = array('table_id' => -1, 'children' => array());
		$this->data_elements_marked = array();
		$this->find_connect_value_table_ids_sub($element);
		//var_dump($this->connect_value_table_ids);
		//var_dump($this->data_elements);
		return $this->connect_value_table_ids;
	}

	function find_connect_value_table_ids_sub($element) {
		if($element['element_type_id'] == 9 || $element['element_type_id'] == 24) {
			//var_dump($element['name']);
			$this->index_data_elements($element['id']);
			//var_dump($this->data_elements);
			$this->traverse_data_elements_find_connect_ids($this->data_elements);
		} else {
			$parents = $this->get_parents($element['id']);
			foreach($parents as $parent) {
				$this->find_connect_value_table_ids_sub($parent);
			}
		}
	
	}

	private $connect_value_table_input_reference = array();
	private $connect_value_set_input_node = NULL;
	private $connect_value_set_input_node_name = NULL;
	private $connect_value_set_input_table = NULL;

	function traverse_data_elements_find_connect_ids($data_element, $parent_table_id=-1) {
		if($data_element['table_id'] != NULL && $data_element['table_id'] != 0 && $data_element['table_id'] != -1) {
			$parent_table_id = $data_element['table_id'];
		}/* else if(isset($data_element['data_element_type_id']) && $data_element['data_element_type_id'] == 1) {
			$set_input_node_name = explode(".", $data_element['name'])[0];
			if($set_input_node_name != 'global') {
				$this->connect_value_set_input_node = $data_element;
				$this->connect_value_set_input_node_name = $set_input_node_name;
				//$this->connect_value_set_input_node_name = $set_input_node_name;
				var_dump("connect_value_table_input_reference");
			}
		}*/
		/*if($this->connect_value_set_input_node != NULL) {
			if($data_element['name'] == $this->connect_value_set_input_node_name && isset($data_element['node_type']) && $data_element['node_type'] == 'subtractive') {
				$this->connect_value_table_ids[$this->connect_value_table_input_reference[$this->connect_value_set_input_node_name]] = $data_element['table_id'];
				//$this->connect_value_table_ids[$data_element['table_id']] = $this->connect_value_table_input_reference[$this->connect_value_set_input_node_name];
			}
		}*/
		//var_dump($data_element['name']);
		if(isset($data_element['children'])) {
			foreach($data_element['children'] as $child_data_element) {
				$child_table_id = $child_data_element['table_id'];
				if($child_table_id != 0) {
					//var_dump($child_table_id);
					$query = "SELECT nodes.name as name, nodes.node_type as node_type FROM tables, nodes WHERE tables.node_id = nodes.id AND tables.id = ".$child_table_id;
					$child_table_row = $this->sql->get_row($query, 1);
					if($child_table_row !== NULL && count($child_table_row) > 0) {
						//var_dump($child_table_row);
						if(isset($child_table_row['node_type']) && $child_table_row['node_type'] == 'subtractive' && $parent_table_id != -1) {
							//echo "table_id: ".$parent_table_id." - child_table_id: ".$child_table_id."\n";
							$this->connect_value_table_ids[$child_table_id] = $parent_table_id;
						}
						//var_dump($child_table_row['node_type']);
						//var_dump($child_table_row['name']);
						/*var_dump($data_element['data_element_type_id']);
						if($child_table_row['node_type'] && $child_table_row['node_type'] == 'subtractive' && $this->connect_value_set_input_node_name != NULL) {
							$this->connect_value_table_input_reference[$this->connect_value_set_input_node_name] = $child_table_id;
							//$this->connect_value_table_ids[$this->connect_value_table_input_reference[$this->connect_value_set_input_node_name]] = $data_element['table_id'];
							//$this->connect_value_table_input_reference
						}*/
					}
				}
				$this->traverse_data_elements_find_connect_ids($child_data_element, $parent_table_id);
			}
		}
	}

	function get_parents($element_id, $form_element=-1, $return_object=true, $content_element=-1) {
		$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE elements.element_type_id = element_types.id AND elements.id = ".$element_id;
		if($form_element != -1) {
			$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE elements.element_type_id = element_types.id AND form_element = ".$form_element." AND elements.id = ".$element_id;
			if($content_element != -1) {
				$query = "SELECT elements.*, element_types.name as type_name FROM elements, element_types WHERE elements.element_type_id = element_types.id AND form_element = ".$form_element." AND content_element = ".$content_element." AND elements.id = ".$element_id;
			} 
		}
		$element = $this->sql->get_row($query, 1);
		$parents = $element['parents'];
		if($parents != NULL && strlen($parents) > 0) {
			$parents = json_decode($parents, true);
		} else {
			$parents = array();
		}
		$parents_result = [];
		foreach($parents as $parent_id) {
			$query = "SELECT * FROM elements WHERE id = ".$parent_id;
			$parents_result[] = $this->sql->get_row($query, 1);
		}
		return $parents_result;
	}

	private $data_elements;
	private $data_elements_marked = array();

	private $last_indexed_data_element = NULL;

	function index_data_elements($element_id) {
		if($this->last_indexed_data_element == $element_id) {
			return;
		}
		$this->data_elements = [];
		$this->data_elements_marked = [];
		$query = "SELECT * FROM data_elements WHERE element_id = ".$element_id;
		$data_elements = $this->sql->get_rows($query, 1);
		//var_dump("root data elements");
		foreach($data_elements as $data_element) {
			if($data_element['parents'] == NULL || strlen($data_element['parents']) == 0 || $data_element['parents'] == "[]") {
				$this->data_elements_marked[$data_element['id']] = true;
				$this->data_elements['children'][] = $data_element;
				//var_dump($data_element['id']);
			}
		}
		//var_dump($data_elements);
		$this->index_data_elements_sub($this->data_elements['children'], $data_elements);
		$this->last_indexed_data_element = $element_id;
	}

	function index_data_elements_sub(&$data_elements, $all_data_elements, $key=NULL) {
		//var_dump("index key: ".$key);
		foreach($data_elements as $key => $data_element) {
			foreach($all_data_elements as $potential_child) {
				if(!isset($this->data_elements_marked[$potential_child['id']])) {
					if($potential_child['parents'] != NULL && strlen($potential_child['parents']) > 0 && $potential_child['parents'] != "[]") {
						$parents = json_decode($potential_child['parents'], true);
						foreach($parents as $parent_id) {
							//var_dump("child parent");
							//var_dump($parent_id);
							if($parent_id == $data_element['id']) {
								$this->data_elements_marked[$potential_child['id']] = true;
								//var_dump("index: ".$data_element['name']);
								if(!isset($data_elements[$key]['children'])) {
									$data_elements[$key]['children'] = array();
								}
								$data_elements[$key]['children'][] = $potential_child;
							}
						}
					}
				}
			}
			if(isset($data_elements[$key]['children'])) {
				$this->index_data_elements_sub($data_elements[$key]['children'], $all_data_elements, $key);
			}
		}
	}

	/*function find_first_data_element_source($element_id) {
		$this->data_source_looked_at = [];
		$this->first_data_source = array();

		$query = "SELECT * FROM data_elements WHERE element_id = ".$element_id;
		$data_elements = $this->sql->get_rows($query, 1);
		//var_dump($data_elements);
		$this->data_elements_alt = $data_elements;
		foreach($this->data_elements_alt as $data_element) {
			if($data_element['parents'] == NULL || count(json_decode($data_element['parents'], true)) == 0) {
				$this->traverse_data_elements_alt($data_element);
			}
		}

		return $this->first_data_source;
	}

	private $data_elements_alt;
	private $first_data_source = array();
	private $data_source_looked_at = [];

	function traverse_data_elements_alt($data_element) {
		if(isset($this->data_source_looked_at[$data_element['id']])) {
			return;
		}
		$this->data_source_looked_at[$data_element['id']] = true;
		if($data_element['data_element_type_id'] == 2) {
			$this->first_data_source[] = $data_element;
		}
		foreach($this->data_elements_alt as $next_element) {
			if($next_element['parents'] != NULL && in_array($data_element['id'], json_decode($next_element['parents'], true))) {
				//var_dump('child');
				$this->traverse_data_elements_alt($next_element);
			}
		}  
	}*/

	function generate_table_columns($element_id) {
		$query = "SELECT * FROM elements WHERE id = ".$element_id;
		$element = $this->sql->get_row($query, 1);
		$page_id = $element['page_id'];
		$target_table_id = $element['target_table_id'];
		if($target_table_id == NULL) {
			return;
		}
		switch($element['element_type_id']) {
			case 21:
			case 7:	
				$columns = array(
					'value'
				);
				foreach($columns as $name) {
					$name = trim($name);
					$query = "SELECT * FROM columns WHERE table_id = ".$target_table_id." AND name = '".$name."'";
					$column = $this->sql->get_row($query, 1);
					$id = NULL;
					if($column != NULL && count($column) != 0) {
						$id = $column['id'];
					}
					$v = array(
						'name' => $name,
						'type' => '0',
						'table_id' => $target_table_id,
						'deleted' => 0
					);
					if($id != NULL) {
						$v['id'] = $id;
					}
					$this->statement->generate($v, "columns");
					$this->sql->execute($this->statement->get());
					$id = $this->sql->last_id($v);
				}
				break;
			case 1:
				$children = $this->get_children($element_id, $page_id, 1, true);
				foreach($children as $child) {
					if($child['element_type_id'] != 14) {
						$name = trim($child['name']);
						$query = "SELECT * FROM columns WHERE table_id = ".$target_table_id." AND name = '".$name."'";
						$column = $this->sql->get_row($query, 1);
						$id = NULL;
						if($column != NULL && count($column) != 0) {
							$id = $column['id'];
						}
						$v = array(
							'name' => $name,
							'type' => '0',
							'table_id' => $target_table_id,
							'deleted' => 0
						);
						if($id != NULL) {
							$v['id'] = $id;
						}
						$this->statement->generate($v, "columns");
						$this->sql->execute($this->statement->get());
						$id = $this->sql->last_id($v);
					}
				}
				break;
		}
	}

	//function element_by_id($definition

	function get_element_fullname($element_id) {
		$query = "SELECT * FROM elements WHERE id = ".$element_id;
		$element = $this->sql->get_row($query, 1);
		$element_type_name = $this->element_type_index[$element['element_type_id']];
		$query = "SELECT * FROM pages WHERE id = ".$element['page_id'];
		$page_row = $this->sql->get_row($query, 1);
		$element_fullname = $element['name']."__".$page_row['name']."_".$element_type_name;
		return $element_fullname;
	}

	function test_function() {
		//$this->user_group_member("admin", "5", $group_object=NULL);
		//return;
		//$action = "threads__view_threads_list";
		$action = "get_thread";
		//$action = "categories__view_categories_list";
		//$v = array('companies_id' => 1, 'select_column' => 'productname', 'select_id' => 'articles_products.id', 'product_categories_id' => 1);
		/*$v = array('categories_id' => 3, 'offset' => 0, 'item_offset_limit' => 10, 'order_direction' => 'DESC'
		);*/
		$v = array(
			'id' => 4
		);
		//$v = array('companies_id' => 1); //, 'supplier_id' => 5);
		$query = new query($action, $v, $this, true, 5);
		var_dump($query->get());

	
		//$query->test_function();
	}

	function test_function_alt() {
		$action = "threads__threads_table";
		//$action = "get_thread";
		//$action = "categories__view_categories_list";
		//$v = array('id' => 8);
		//$v = array('categories_id' => 1);
		$v = array('categories_id' => 2, 'item_offset_limit' => 10, 'offset' => 0, 'order_column' => 'threads.created', 'order_direction' => 'DESC', 'search_term' => 'testa');
		$query = new query($action, $v, $this, true, 5);
		var_dump($query->get());

	
		//$query->test_function();
	}

	function test_function_2() {
		$action = "categories__viewcategories_list";
		//$action = "get_view_thread";
		//$action = "categories__view_categories_list";
		//$v = array();
		$v = array(
			//'companies_id' => 1,
			//'order_column' => 'suppliername',
			//'order_direction' => 'ASC'
		);
		//$v = array('id' => 1);
		$query = new query($action, $v, $this, true, 1);
		var_dump($query->get());

	
		//$query->test_function();
	}

	function test_function_3() {
		/*$action = "comments_element__view_thread_comments";
		//$action = "get_view_thread";
		//$action = "categories__view_categories_list";
		//$v = array();
		$v = array('threads_id' => 4);
		//$v = array('id' => 1);
		$query = new query($action, $v, $this, true, 1);
		var_dump($query->get());*/

		$function_chain = new function_chain(NULL, NULL);
		$result = $function_chain->where(NULL, NULL);
		var_dump($result);

	
		//$query->test_function();
	}

	function query($action, $v) {
		$application_id = $v['__plasticity__application_id'];
		unset($v['__plasticity__application_id']);
		$query = "SELECT * FROM applications WHERE app_name = '".$application_id."'";
		$application_id = $this->sql->get_row($query, 1)['id'];
		if($action == 'get_state') {
			return array();
		}
		$query = new query($action, $v, $this, true, $application_id);
		$result = $query->get();
		$this->sql->set_plasticity_application_id(NULL);
		if($result != NULL) {
			return $result;
		}	
		/*if($query != NULL) {
			return $query;
		}*/
		return array();
	}

	function get_application_definition($application_name='bookkeeping') {
		$query = "SELECT * FROM application_definitions WHERE application = '".$application_name."'";
		return $this->sql->get_row($query, 1);
	}

	function _application_definition($v) {
		$query = "DELETE FROM application_definitions WHERE application = '".$v['application']."'";
		$this->sql->execute($query);
		//$v['definition'] = json_encode($v['definition'])
		foreach($v as $key => $value) {
			if($key != 'application') {
				//$v[$key] = json_encode($value);
				//$v[$key] = str_replace("'", "\'", $v[$key]);
				//$v[$key] = mysqli_escape_string($this->sql->get_connection(), $v[$key]);
				var_dump(substr($v[$key], 0, 30));
			}
		}
		$this->statement->generate($v, "application_definitions");
		$this->sql->execute($this->statement->get());
		//var_dump($this->statement->get());
		$id = $this->sql->last_id($v);
	}

}

?>