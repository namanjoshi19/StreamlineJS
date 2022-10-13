<?

class query {
	
	private $post_data;
	private $_class;
	private $statement;
	private $enable_pseudo_tables = true;
	private $action;

	function __construct($action, $post_data, $_class, $pseudo_tables=true, $application_id=NULL) {
		$this->action = $action;
		$this->order_data = array(
			'order_column' => $post_data['order_column'],
			'order_direction' => $post_data['order_direction'],
			'offset' => $post_data['offset'],
			'item_offset_limit' => $post_data['item_offset_limit'],
		);
		unset($post_data['order_column']);
		unset($post_data['order_direction']);
		unset($post_data['offset']);
		unset($post_data['item_offset_limit']);
		/*$_order_column = $this->order_data['order_column'];
		//////////////////var_dump($_order_column);
		//unset($v['order_column']);
		$_order_direction = $this->order_data['order_direction'];
		//////////////////var_dump($_order_drection);
		//unset($v['order_direction']);
		$offset = $this->order_data['offset'];
		//unset($v['offset']);
		$item_offset_limit = $this->order_data['item_offset_limit'];
		//unset($v['item_offset_limit']);*/

		//////////////////var_dump($post_data);
		$this->post_data = $post_data;
		$this->_class = $_class;
		$this->statement = $_class->get_statement();
		$this->sql = $_class->get_sql();
		$this->enable_pseudo_tables = $pseudo_tables;
		$this->application_id = $application_id;

		$this->sql->set_plasticity_application_id($this->application_id);
		$this->global_post_data = array();
		$this->global_post_data['global.user_id'] = $this->_class->get_user_id();

		$this->relations = array();
		$this->relations_marked = array();

		$this->sub_queries = array();
	}

	/*function test_function() {
		$sub_query = new query("test", array(), $this->_class, true);
	}*/

	function get() {
		//////////////////////////var_dump((($this->_class->get_user_id());
		if(strpos($this->action, "_") === 0) {
			//unset($this->post_data['global.user_id']);
			$table = explode("_", $this->action);
			unset($table[0]);
			$table = implode("_", $table);
			if(strpos($table, "_alt") === strlen($table)-4) {
				$table = substr($table, 0, strlen($table)-4);
				$data = $this->resolve_alt($table, $this->post_data);
				//////////var_dump($table);
				//////////var_dump($data);
				return $this->_($data[0], $data[1]);
			} else {
				return $this->_($table, $this->post_data);
			}
		} else if(strpos($this->action, "delete_") === 0) {
			$this->delete($this->post_data['id'], substr($this->action, 7));
		} else {
			$action = $this->action;

			/*if(strpos($action, "_alt") === strlen($action)-4) {
				$action = substr($action, 0, strlen($action)-4);
				$data = $this->resolve_alt($table, $this->post_data);
				$this->action = $data[0];
				$this->post_data = $data[1];
			}*/
			$return_relations = false;
			if(isset($this->post_data['__return_relations'])) {
				$return_relations = true;
			}
			if(strpos($action, "__") !== false) {
				////////////////////var_dump("inside");
				return $this->query($this->action, $this->post_data, NULL, $return_relations);
			} else {
				return $this->page_query($this->action, $this->post_data);
			}
		}
	}

	function delete($id, $table, $soft=true, $table_id=NULL) {
		if($table_id == NULL) {
			$table_split = explode("__", $table);
			////////////////////////var_dump((($table_split);
			$query = "SELECT * FROM pages WHERE name = '".$table_split[1]."' AND application_id = ".$this->application_id;
			////////////////////////var_dump((($query);
			$page_row = $this->sql->get_row($query, 1);
			////////////////////////var_dump((($page_row);
			$query = "SELECT * FROM elements WHERE name = '".$table_split[0]."' AND page_id = ".$page_row['id'];
			$element_row = $this->sql->get_row($query, 1);
			////////////////////////var_dump((($element_row);
			$parents = $element_row['parents'];
			if($parents != NULL && strlen($parents) > 0) {
				$parents = json_decode($parents, true);
			} else {
				$parents = array();
			}
			/*$data_element_parents = array();;
			foreach($parents as $parent_id) {
				//////////////////var_dump($parent_id);
				$query = "SELECT * FROM elements WHERE element_type_id = 9 AND id = ".$parent_id;
				$parent_row = $this->sql->get_row($query, 1);
				if($parent_row != NULL) {
					$data_element_parents[] = $parent_row;
				}
			}*/

			if($element_row['element_type_id'] == 1) {
				$query = "SELECT * FROM tables WHERE id = ".$element_row['target_table_id'];
				$table = $this->sql->get_row($query, 1);
			} else {
				$data_element = $this->find_primary_data_source($element_row);
				$query = "SELECT * FROM tables WHERE id = ".$data_element['table_id'];
				$table = $this->sql->get_row($query, 1);
			}
		} else {
			$query = "SELECT * FROM tables WHERE id = ".$table_id;
			$table = $this->sql->get_row($query, 1);
		}

		if($table['user_access_id'] != 2) {
			$access = $this->_class->user_group_member($table['user_access_id'], $this->application_id);
			if(!$access) {
				return array('__user_access' => "-2");
			}
		}
		$query = "SELECT * FROM columns WHERE table_id = ".$table['id'];
		$columns = $this->sql->get_rows($query, 1);

		$delete_rows = [];


		foreach($columns as $column) {
			$query = "SELECT id FROM p_values WHERE row_id = ".$id." AND column_id = ".$column['id'];
			$deleted_row = $this->sql->get_row($query, 1);
			if($deleted_row != NULL) {
				$delete_rows[] = $deleted_row;
			}
		}
		if($soft) {
			foreach($delete_rows as $delete_row) {
				$delete_row['deleted'] = 1;

				$this->statement->generate($delete_row, "p_values");
				$this->sql->execute($this->statement->get());
				//$id = $this->sql->last_id($delete_row);
			}
		} else {
			foreach($delete_rows as $delete_row) {
				$query = "DELETE FROM p_values WHERE id = ".$delete_row['id'];
				$this->sql->execute($query);
			}
		}
		//$this->delete_chain($id, $table);
		//$query = "SELECT p_values.* FROM p_values, columns WHERE row_id = ".$id." AND p_values.column_id = columns.id AND columns.table_id = ".;
		//$query = "SELECT * FROM p_values WHERE ";
		return true;
	}

	function delete_chain($id, $table) {
		$query = "SELECT * FROM columns WHERE foreign_table_id = ".$table['id'];
		$dependent_columns = $this->sql->get_rows($query, 1);

		//$delete_rows = [];
		foreach($depnedent_columns as $column) {
			$query = "SELECT * FROM p_values WHERE column_id = ".$column['id']." AND value = ".$id;
			$delete_rows = $this->sql->get_row($query, 1);
			$this->delete($delete_row['row_id'], NULL, true, $column['table_id']);
		}

		$query = "SELECT * FROM p_values WHERE connect_foreign_table_id = ".$id;
		$dependent_connect_values = $this->sql->get_rows($query, 1);
		foreach($dependent_connect_values as $connect_row) {
			$query = "SELECT * FROM columns WHERE id = ".$connect_row['column_id'];
			$dependent_connect_column = $this->sql->get_row($query, 1);
			$this->delete($connect_row['row_id'], NULL, true, $dependent_connect_column['table_id']);
		}
	}

	function find_primary_data_source($element) {
		$parents = $element['parents'];
		if($parents != NULL && strlen($parents) > 0) {
			$parents = json_decode($parents);
		} else {
			$parents = array();
		}
		$data_sources = [];
		foreach($parents as $parent_id) {
			$query = "SELECT * FROM elements WHERE element_type_id = 9 AND id = ".$parent_id;
			$parent_row = $this->sql->get_row($query, 1);

			if($parent_row != NULL) {
				$data_sources[] = $parent_row;
			}
		}
		$primary_data_source = [];
		foreach($data_sources as $data_source) {
			//////echo "data_source:\n";
			////////////////////var_dump($data_source);
			$primary_data_source[] = $this->find_first_data_element_source($data_source['id']);
		}
		////////////////////var_dump($primary_data_source);
		if(isset($primary_data_source[0][0])) {
			return $primary_data_source[0][0];
		}
		return NULL;
	}

	function resolve_alt($table, $v) {
		/*$query = "SELECT * FROM tables WHERE name = '".$table."'";
		$table_row = $this->sql->get_row($query, 1);
		$query = "SELECT * FROM columns WHERE table_id = ".$table_row['id']." WHERE type != 0";
		$column_rows = $this->sql->get_rows($query, 1);

		$connect_id = NULL;
		$foreign_id = NULL;
		foreach($column_rows as $column) {
			if($column['type'] == 2) {
				$connect_id = $column;
			} else if($column['type'] == 1) {
				$foreign_id = $column;
			}
		}
		if($connect_id != NULL) {

		} else if($foreign_id != NULL) {

		}*/
		//$query = "SELECT * FROM elements, pages WHERE elements.page_id = pages.id AND pages.name = '".."'";
		if(isset($v['connect_value_element'])) {
			$connect_value_element = $v['connect_value_element'];
			unset($v['connect_value_element']);
			$element_split = explode("__", $connect_value_element);
			$element = $element_split[0];
			$page = $element_split[1];

			$query = "SELECT * FROM pages WHERE name = '".$page."' AND application_id = ".$this->application_id;
			$page_row = $this->sql->get_row($query, 1);

			$query = "SELECT * FROM elements WHERE name = '".$element."' AND page_id = ".$page_row['id'];
			$element_row = $this->sql->get_row($query, 1);
			$parents = json_decode($element_row['parents'], true);
			$data_element = NULL;
			foreach($parents as $parent_id) {
				$query = "SELECT * FROM elements WHERE id = ".$parent_id." AND element_type_id = 9";
				$data_element_row = $this->sql->get_row($query, 1);
				if($data_element_row != NULL) {
					$data_element = $data_element_row;
				}
			}

			$first_data_element_source = $this->find_first_data_element_source($data_element['id']);
			////////////////////////////var_dump((($first_data_element_source);
			if(count($first_data_element_source) > 0) {
				$first_data_element_source = $first_data_element_source[0];
				$table_id = $first_data_element_source['table_id'];
				//$query = "SELECT * FROM tables WHERE id = ".$table_id;
				//$table_row = $this->sql->get_row($query, 1);
				$v['connect_value_table_id'] = $table_id;
				return array($table, $v);
				//return $this->_($table, $v);
			}
		}
		return array($table, $v);
	}

	function find_first_data_element_source($element_id) {
		/*$query = "SELECT * FROM data_elements WHERE element_id = ".$element_id." AND (parents IS NULL OR parents = '' OR parents = '".'"'."[]".'"'."'  OR parents = '".'"'.'"'."' )";
		$first_data_source = array();
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $row) {
			$first_data_source = array_merge($first_data_source, $this->find_first_data_element_source_sub($row['id']));
		}
		return $first_data_source;*/
		$this->data_source_looked_at = [];
		$this->first_data_source = array();

		$query = "SELECT * FROM data_elements WHERE element_id = ".$element_id;
		$data_elements = $this->sql->get_rows($query, 1);
		////////////////////////////var_dump((($data_elements);
		$this->data_elements_alt = $data_elements;
		////////////////////var_dump($this->data_elements_alt);
		foreach($this->data_elements_alt as $data_element) {
			if($data_element['parents'] == NULL || count(json_decode($data_element['parents'], true)) == 0) {
				$this->traverse_data_elements($data_element);
			}
		}

		////////////////////var_dump($this->data_source_looked_at);
		////////////////////var_dump($this->first_data_source);
		$result = [];
		////////////////////var_dump($this->first_data_source);
		foreach($this->first_data_source as $potential_child) {
			////////////////////var_dump($potential_child);
			$child_parents = $potential_child['parents'];
			if($child_parents != NULL & strlen($child_parents) > 0) {
				$child_parents = json_decode($child_parents, true);
			} else {
				$child_parents = [];
			}
			$child_input_parents = $this->get_input_parents($child_parents);
			/*foreach($this->data_elements_alt as $potential_child) {
				//////////////////var_dump($potential_child);
				$child_parents = $potential_child['parents'];
				if($child_parents != NULL & strlen($child_parents) > 0) {
					$child_parents = json_decode($child_parents, true);
				} else {
					$child_parents = [];
				}
				if(in_array($first_data_source['id'], $child_parents) && (count($child_parents) == 1 || count($child_parents) == 0)) {
					$result[] = $first_data_source;
				}
			}*/
			if(count($child_input_parents) == count($child_parents) || count($child_input_parents)+1 == count($child_parents)) {
				$result[] = $potential_child;
			}
			/*if((count($child_parents) == 1 || count($child_parents) == 0 || ( count($child_parents) == 2 && in_array($potential_child['id'], $child_parents)))) {
				$result[] = $potential_child;
			}*/
		}

		return $result;
		//return $this->first_data_source;
	}

	function get_input_parents($parents) {
		$input_nodes = array();
		foreach($parents as $parent_id) {
			$query = "SELECT * FROM data_elements WHERE id = ".$parent_id;
			$parent = $this->sql->get_row($query, 1);
			if($parent['data_element_type_id'] == 1) {
				$input_nodes[] = $parent;
			}
		}
		return $input_nodes;
	}

	private $data_elements_alt;
	private $first_data_source = array();
	private $data_source_looked_at = [];

	function traverse_data_elements($data_element) {
		if(isset($this->data_source_looked_at[$data_element['id']])) {
			return;
		}
		////////////////////var_dump($data_element);
		$this->data_source_looked_at[$data_element['id']] = true;
		if($data_element['data_element_type_id'] == 2) {
			$this->first_data_source[] = $data_element;
		}
		foreach($this->data_elements_alt as $next_element) {
			if($next_element['parents'] != NULL && in_array($data_element['id'], json_decode($next_element['parents'], true))) {
				////////////////////var_dump('child');
				$this->traverse_data_elements($next_element);
			}
		}  
	}

	/*function find_first_data_element_source_sub($data_element_id) {

	}*/

	private $schema_id = NULL;

	function _($table, $v, $no_duplicates=false, $strip_tags=true) {
		//////////////////////////////var_dump((($table);
		/*if(strpos($table, "y") == strlen($table)-1) {
			$table = substr($table, 0, strlen($table)-1)."ies";
		} else {
			$table .= "s";
		}*/
		//////////////////////////////var_dump((($table);
		//////////////////////////////var_dump((($v);
		////////////////////////var_dump((($table);
		if($strip_tags) {
			/*foreach($v as $key => $value) {
				$v[$key] = strip_tags($value);
			}*/
			/*foreach($v as $key => $value) {
				if(!is_array($value)) {
					$v[$key] = htmlentities($value);
				}
			}*/
		}
		$typeahead_elements = array();
		if($this->_class->get_user_id() == -1) {
			return array('__user_access' => "-2");
		}
		if(strpos($table, "insert_") === 0) {
			$table = substr($table, 7); 
			////////////////////////var_dump((($table);
			$table_split = explode("__", $table);
			////////////////////////var_dump((($table_split);
			$query = "SELECT * FROM pages WHERE name = '".$table_split[1]."' AND application_id = ".$this->application_id;
			////////////////////////var_dump((($query);
			$page_row = $this->sql->get_row($query, 1);
			////////////////////////var_dump((($page_row);
			$query = "SELECT * FROM elements WHERE name = '".$table_split[0]."' AND page_id = ".$page_row['id'];
			$element_row = $this->sql->get_row($query, 1);


			$children = $this->_class->get_children($element_row['id'], $page_row['id'], 1, $return_object=true);
			////////////////////var_dump($children);
			foreach($children as $child) {
				if($child['type_name'] == 'typeahead') {
					$typeahead_elements[$child['name']] = $child;
				}
			}

			////////////////////////var_dump((($element_row);
			$query = "SELECT * FROM tables WHERE id = ".$element_row['target_table_id'];
			$table = $this->sql->get_row($query, 1);
			////////////////////////var_dump((($table);
		} else {
			if(strpos($table, "__") !== false) {
				$table = explode("__", $table)[0];
			}

			$query = "SELECT tables.* FROM tables, nodes WHERE tables.name = '".$table."' AND tables.node_id = nodes.id AND nodes.application_id = ".$this->application_id;
			$table = $this->sql->get_row($query, 1);
		}

		////////////////////var_dump($typeahead_elements);

		foreach($v as $key => $value) {
			if(isset($typeahead_elements[$key])) {
				$definition_typeahead = $typeahead_elements[$key]['definition_addition'];
				if($definition_typeahead != NULL && strlen($definition_typeahead) > 0) {
					$definition_typeahead = json_decode($definition_typeahead, true);
					$definition_typeahead = json_decode($definition_typeahead, true);
					////////////////////var_dump($definition_typeahead['insert_table']);

					if(isset($definition_typeahead['insert_table'])) {
						$sub_v = array(
							'value' => $value
						);
						if(isset($definition_typeahead['post_data'])) {
							foreach($definition_typeahead['post_data'] as $post_data_key => $post_data_value) {
								$sub_v[$post_data_key] = $v[$post_data_value];
							}
						}
						$intermediate_result = $this->_($definition_typeahead['insert_table'], $sub_v, true);
						$v[$key.'_id'] = $intermediate_result;
						unset($v[$key]);
					}
				}
			}
		}

		if($table['user_access_id'] != 2) {
			$access = $this->_class->user_group_member($table['user_access_id'], $this->application_id);
			if(!$access) {
				return array('__user_access' => "-2");
			}
		}
		$this->schema_id = $table['schema_id'];

		$query = "SELECT columns.*, name AS COLUMN_NAME FROM columns WHERE table_id = ".$table['id'];
		$columns = $this->sql->get_rows($query, 1, NULL, true);
		foreach($columns as $column) {
			if($column['foreign_table_id'] != NULL && isset($v[$column['name']]) && $v[$column['name']] != "-1" && $v[$column['name']] != "0") {
				$query = "SELECT * FROM p_values, tables, columns WHERE p_values.column_id = columns.id AND columns.table_id = tables.id AND tables.id = ".$column['foreign_table_id']." AND p_values.row_id = ".$v[$column['name']];
				$row = $this->sql->get_row($query, 1, NULL, true);
				if($row == NULL) {
					return array('__user_access' => "-1");
				} else if($row['user_id'] != $this->_class->get_user_id() && $column['private'] == 1) {
					return array('__user_access' => "-1");
				}
			}
		}
		$columns[] = array(
			'COLUMN_NAME' => 'modified'
		);
		$columns[] = array(
			'COLUMN_NAME' => 'created'
		);
		$this->statement->generate($v, "__plasticity__", $type=NULL, $escape=false, $allow_null=false, $columns);
		$v = $this->statement->get();


		if($no_duplicates) {
			$all_duplicate = true;
			$row_id = NULL;
			foreach($v as $key => $value) {
				$query = "SELECT * FROM columns WHERE table_id = ".$table['id']." AND name = '".$key."'";
				$duplicate_column = $this->sql->get_row($query, 1);
				$query = "SELECT row_id FROM p_values WHERE column_id = ".$duplicate_column['id']." AND value = '".$value."'";
				////////////////////var_dump($query);
				$row_id = $this->sql->get_row($query, 1);
				////////////////////var_dump($row_id);
				if($row_id != NULL) {
					$row_id = $row_id['row_id'];
				} else {
					$all_duplicate = false;
				}
			}
			if($all_duplicate) {
				return $row_id;
			}
		}
		//////////////////////////////var_dump((($v);
		$connect_value = NULL;
		$connect_foreign_table_id = NULL;
		if(isset($v['connect_value'])) {
			$connect_value = $v['connect_value'];
			unset($v['connect_value']);
			$query = "SELECT * FROM tables WHERE schema_id = ".$this->schema_id." AND name = '".$connect_value."'";
			$connect_row = $this->sql->get_row($query, 1);
			$connect_foreign_table_id = $connect_row['id'];
			//////var_dump($connect_row);
		} else if(isset($v['connect_value_table_id'])) {
			if(is_array($v['connect_value_table_id'])) {
				$connect_foreign_table_id = array_values($v['connect_value_table_id'])[0];
			} else {
				$connect_foreign_table_id = $v['connect_value_table_id'];
			}
			//////var_dump($connect_row);
			unset($v['connect_value_table_id']);
		}
		$row_id = NULL;
		//////////////////////////var_dump((($v);
		foreach($v as $v_key => $v_value) {
			if(is_array($v_value) && isset($v_value['__autoincrement'])) {
				$query = "SELECT * FROM columns WHERE table_id = ".$table['id']." AND name = '".$v_key."'";
				$increment_column = $this->sql->get_row($query, 1);
				$query = "SELECT value FROM p_values WHERE column_id = ".$increment_column['id']." ORDER BY id DESC LIMIT 1";
				$increment_value = $this->sql->get_row($query, 1);
				$v[$v_key] = $increment_value['value']+1;
			}
		}
		//////////var_dump($v);
		if(isset($v['id'])) {
			$row_id = $v['id'];
			$query = "SELECT p_values.*, columns.name as column_name FROM p_values, columns WHERE p_values.row_id = ".$v['id']." AND p_values.column_id = columns.id AND columns.table_id = ".$table['id'];
			$p_values = $this->sql->get_rows($query, 1);
			//////////////////////////////var_dump((($p_values);
			foreach($p_values as $key => $value) {
				/*$p_value_column_id = $value['column_id'];
				$query = "SELECT name FROM columns WHERE id = ".$p_value_column_id;
				$column_row = $this->sql->get_row($query, 1);
				$column_name = $column_row['name'];*/
				$column_name = $value['column_name'];
				unset($value['column_name']);
				if(isset($v[$column_name])) {
					/*$value['value'] = $v[$column_name];
					if(isset($v['modified'])) {
						$value['modified'] = $v['modified'];
					}*/
					$value = array(
						'id' => $value['id'],
						'value' => $v[$column_name],
						'modified' => 'NOW()',
					);
					$this->statement->generate($value, "p_values");
					$this->sql->execute($this->statement->get());
					//////var_dump($this->statement->get());
					$id = $this->sql->last_id($value);
				}
				//////////////////////////////var_dump((($value);
			}
		} else {
			$query = "SELECT MAX(p_values.row_id) as last_row_id FROM p_values, columns WHERE p_values.column_id = columns.id AND columns.table_id = ".$table['id'];
			$row_id = $this->sql->get_row($query, 1, NULL, true);
			if(isset($row_id['last_row_id'])) {
				$row_id = $row_id['last_row_id'] + 1;
			} else {
				$row_id = 1;
			}
			////////////////////var_dump($v);	
			foreach($v as $key => $value) {
				if($key != 'created' && $key != 'modified') {
					//////////var_dump($table);
					$query = "SELECT id FROM columns WHERE name = '".$key."' and table_id = ".$table['id'];
					$column_row = $this->sql->get_row($query, 1);
					$column_id = $column_row['id'];
					$insert_values = array(
						'column_id' => $column_id,
						'value' => $value,
						'user_id' => $this->_class->get_user_id(),
						'row_id' => $row_id,
						'created' => $v['created'],
						'modified' => $v['modified']
					);
					if($connect_foreign_table_id != NULL) {
						$insert_values['connect_foreign_table_id'] = $connect_foreign_table_id;
					}
					//////////////////////////////var_dump((($insert_values);

					$this->statement->generate($insert_values, "p_values", NULL, true);
					//////var_dump($this->statement->get());
					//////////var_dump($this->statement->get());
					$this->sql->execute($this->statement->get());
					$id = $this->sql->last_id($insert_values);
				}
			}
		}
		return $row_id;
		//$this->sql->execute($this->statement->get());
		//$id = $this->sql->last_id($v);
	}

	function _alt($table, $v) {

	}

	private $data_elements = NULL;

	function is_action($action, $qualifier) {
		$element_type = $qualifier[1];
		$qualifier = $qualifier[0];
		$page_name = NULL;
		$element_name;
		if(strpos(strrev($action), strrev($qualifier)) === 0) {
			$element_name = substr($action, 0, -strlen($qualifier));
			//$element_type = substr($qualifier, 1);
			/*if(strpos($element_name, "__") !== false) {
				$element_name = explode("__", $element_name);
				$page_name = $element_name[1];
				//unset($element_name[1]);
				$element_name = $element_name[0];//implode("_", $element_name);
			}*/


			return array(
				'element_name' => $element_name,
				'element_type' => $element_type,
				//'page_name' => $page_name
			);
		}
		return false;
	}

	private $return_count = false;

	private $action_qualifiers = array(
		//array('_table_count', 'list'),
		array('_table_count', 'table'),
		array('_table', 'table'),
		array('_list', 'list'),
		array('_list_count', 'list'),
		array('_select', 'select'),
		array('_vote', 'vote'),
		array('_comments', 'comments'),
		array('_typeahead', 'typeahead'),
		array('_tree', 'tree'),
		array('_numericstatus', 'numericstatus'),
	);

	private $element_definition_addition = array();

	function query($action, $v, $set_root_element=NULL, $return_relations=false) {
		////////////////////var_dump($action);
		////////////////var_dump($set_root_element);
		$element_name;
		$element_type = 'table';
		$page_name;
		/*if(strpos($action, "_table") == strlen($action)-6) {
			$element_name = explode("_table", $action)[0];
			$element_type = "table";
			$element_name = explode("__", $element_name);
			$page_name = $element_name[1];
			$element_name = $element_name[0];
		}*/
		////////////////////////////var_dump((($action);
		
		//////echo "page_name: \n";
		////////////////////var_dump($page_name);
		$element;
		$set_qualifier = NULL;
		if($set_root_element === NULL) {
			////////////////////var_dump($action);
			if(strpos($action, "__") !== false) {
				$element_name_split = explode("__", $action);
				$action = $element_name_split[0];
				////////////////////var_dump($action);
				$page_name = $element_name_split[1];
				$page_name_split = explode("_", $page_name);
				$page_name = $page_name_split[0];
				unset($page_name_split[0]);
				if(count($page_name_split) > 0) {
					$action .= "_".implode("_", $page_name_split);
				}
			} else {
				$element_type = 'page';
			}
			foreach($this->action_qualifiers as $qualifier) {
				////////////////////////////var_dump((($qualifier);
				////////////////////var_dump($action);
				$is_action = $this->is_action($action, $qualifier);
				if($is_action !== false) {
					$set_qualifier = $qualifier;
					$element_name = $is_action['element_name'];
					$element_type = $is_action['element_type'];
					//$page_name = $is_action['page_name'];
					break;
				}
			}
			////////////////////var_dump($page_name, $element_name, $element_type);
			$qualifier = "get_";
			if(strpos($action, $qualifier) === 0 && $set_qualifier == NULL) {
				$element_name = explode($qualifier, $action)[1];
				////////////////////var_dump($qualifier);
				//$element_type = substr($qualifier, 1);
				/*if(strpos($element_name, "__") !== false) {
					$element_name = explode("__", $element_name);
					$page_name = $element_name[1];
					$element_name = $element_name[0];
					$element_type = 'table'; 
				} else {
					$element = $element_name[1];
					$element_type = 'page';
				}*/	
				$this->select_singular = true;
			}
			/*//////////////////var_dump($page_name);
			//////////////////var_dump($element_name);
			//////////////////var_dump($element_type);*/
			if(strpos($element_name, "get_") === 0) {
				$element_name = substr($element_name, 4);
				$this->select_singular = true;
			}
			////////////////////var_dump($element_name);
			if($element_type == NULL) {
				return array();
			}
			switch($element_type) {
				//case '_list_count':
				//case '_table_count':
				case 'vote':
					$this->return_count = true;
					break;
			}
			/*if($return_relations) {
				////echo "relations:\n";
				//////////////////var_dump($element_name);
				//////////////////var_dump($element_type);
				//////////////////var_dump($page_name);
			}*/
			////////////////////var_dump($this->application_id);
			$query = "SELECT elements.* FROM elements, element_types, pages WHERE elements.name = '".$element_name."' AND elements.element_type_id = element_types.id AND element_types.name = '".$element_type."' AND elements.page_id = pages.id AND pages.application_id = ".$this->application_id;
			if($page_name !== NULL) {
				$query = "SELECT elements.* FROM elements, element_types, pages WHERE elements.name = '".$element_name."' AND elements.element_type_id = element_types.id AND element_types.name = '".$element_type."' AND elements.page_id = pages.id AND pages.name = '".$page_name."' AND pages.application_id = ".$this->application_id;
			}
			////////////////////////////var_dump((($query);
			//////////////////////////////var_dump((($query);
			$element = $this->sql->get_row($query, 1);
			////////////////////var_dump($element);
		} else {
			//$element = $set_root_element;
			$element = NULL;
		}
		$element_definition_addition = $element['definition_addition'];
		if($element_definition_addition != NULL && strlen($element_definition_addition) > 0) {
			$element_definition_addition = json_decode($element_definition_addition, true);
			$element_definition_addition = json_decode($element_definition_addition, true);
			$this->element_definition_addition = $element_definition_addition;
			////////////////////var_dump($element_definition_addition);
		}
		////////////////////var_dump($element_type);
		////////////////////////////var_dump((($this->sql->get_last_query_string());
		$connect_value_table_id = array();
		$result = array();
		if($element != NULL) {
			$table_id = $element['target_table_id'];
			////////////////////////////var_dump((($table_id);
			$element_id = $element['id'];
			$parents = $element['parents'];

			$query = "SELECT user_access_id FROM pages WHERE id = ".$element['page_id'];
			$page_row = $this->sql->get_row($query, 1);
			$access = $this->_class->user_group_member($page_row['user_access_id'], $this->application_id);
			if(!$access) {
				return array('__user_access' => "-2");
			}

			if($element['private_id']) {
				$this->private_element = true;
			}
			////////////////////////var_dump((($parents);
			/*if($element['target_table_id'] != NULL) {
				$table_id = $element['target_table_id'];
				$this->data_elements = array(
					'data_elements' => array(),
					'tables' => array($table_id)
				);
				if(isset($v['connect_value_table_id'])) {
					$this->connect_value_relations($table_id, $v['connect_value_table_id']);
				}
				//////////////////////////var_dump((($this->relations);
				if(!$this->enable_pseudo_tables) {
					$result = $this->query_table($v, $this->relations);
				} else {
					$result = $this->query_pseudo_table($v, $this->relations);
				}
			} else*/
			if($parents != NULL) {
				$parents = json_decode($parents, true);
				foreach($parents as $parent) {
					$query = "SELECT elements.* FROM elements WHERE id = ".$parent." AND element_type_id = 9";
					$parent_element = $this->sql->get_row($query, 1);
					$data_element_definition_addition = $parent_element['definition_addition'];
					////////////////////var_dump($data_element_definition_addition);
					if($data_element_definition_addition != NULL && strlen($data_element_definition_addition) > 0) {
						$data_element_definition_addition = json_decode($data_element_definition_addition, true);
						if(gettype($data_element_definition_addition) === 'string') {
							$data_element_definition_addition = json_decode($data_element_definition_addition, true);
						}
					}
					////////////////////var_dump($data_element_definition_addition);
					////////////////////////var_dump((($parent_element);
					////////////////////////////var_dump((($query);
					////////////////////////////var_dump((($this->sql->get_last_query_string());
					if($parent_element != NULL && count($parent_element) > 0) {
						//$query = "SELECT * FROM data_elements WHERE element_id = ".$parent_element['id']." AND (parents IS NULL OR parents = '[]')";
						//$data_elements = $this->sql->get_rows($query, 1);
						$data_elements = $this->get_data_elements($parent_element['id']);
						////////////////////var_dump($data_elements);
						$this->data_elements = $data_elements;
						////////////////////////////var_dump((($this->data_elements);
						if(count($data_elements) != 0) {
							foreach($data_elements['data_elements']['root'] as $root_element) {
								$this->assign_root_nodes_to_groups($root_element);
								////////////var_dump("root elements");
								////////////var_dump($root_element);
								//$this->find_relations($root_element);
								//break;
							}
							//////////////////////////var_dump((("root_nodes_by_group");
							////////////////////var_dump($this->root_nodes_by_group);
							$auto_discover = false;
							if(isset($data_element_definition_addition['auto_discover']) && $data_element_definition_addition['auto_discover'] == true) {
								$auto_discover = true;
							}
							////////////////////var_dump($this->root_nodes_by_group);
							////////////////////var_dump($auto_discover);
							foreach($this->root_nodes_by_group['root'] as $root_element) {
								$this->find_relations($root_element, $auto_discover);
							}
							////////////////////var_dump($this->relations);
							////////////////////var_dump($this->sub_queries);
							////////////////////var_dump($this->root_nodes_by_group);
							$connect_value_table_id = $this->_class->find_connect_value_table_ids($parent_element);
							////////////////////var_dump(("connect_value_table_id");
							////////////////////var_dump(($connect_value_table_id);
							////////////////////var_dump($this->relations);
							////////////////////var_dump($connect_value_table_id);
							if(count($connect_value_table_id) > 0) {
								////////////////////var_dump("inside-2");
								$this->find_connection_value_relations($connect_value_table_id, 'root');
							}
							if(isset($v['id'])) {
								$primary_data_element = $this->find_primary_data_source($element);
								////////////////////var_dump($primary_data_element);
								//////////var_dump($primary_data_element);
								//////////var_dump($this->relations);
								if($primary_data_element != NULL) {
									/*$this->remove_input_relations($primary_data_element);*/
									//$this->remove_input_relations($primary_data_element);
								}
								//////////var_dump($this->relations);
							}
							////////var_dump($this->relations);
							if($return_relations === true) {
								return $this->relations;
							}
							if($this->self_sub_query) {
								if(!isset($v['companies_id'])) {
									$v['companies_id'] = NULL;
								}
							}
							if(!$this->enable_pseudo_tables) {
								$result = $this->query_table($v, $this->relations);
							} else {
								$result = $this->query_pseudo_table($v, $this->relations);
							}
						} 
					} else if($element['target_table_id'] != NULL) {
						$table_id = $element['target_table_id'];
						////////////////////////////var_dump((($table_id);
						$this->data_elements = array(
							'data_elements' => array(),
							'tables' => array($table_id)
						);
						////////////////////////var_dump((($this->data_elements);
						if(isset($v['connect_value_table_id'])) {
							$this->connect_value_relations($table_id, $v['connect_value_table_id']);
						} else {
							$connect_value_table_id = $this->_class->find_connect_value_table_ids($parent_element);
							////////////////////var_dump(("connect_value_table_id");
							////////////////////var_dump(($connect_value_table_id);
							if(count($connect_value_table_id) > 0) {
								$this->find_connection_value_relations($connect_value_table_id, 'root');
							}
						}
						if(!$this->enable_pseudo_tables) {
							$result = $this->query_table($v, $this->relations);
						} else {
							$result = $this->query_pseudo_table($v, $this->relations);
						}
					}
				}
			}
		} else if($set_root_element != NULL) {
			$parent_element = $set_root_element;
			if($parent_element != NULL && count($parent_element) > 0) {
				//$query = "SELECT * FROM data_elements WHERE element_id = ".$parent_element['id']." AND (parents IS NULL OR parents = '[]')";
				//$data_elements = $this->sql->get_rows($query, 1);
				$data_elements = $this->get_data_elements($parent_element['id']);
				$this->data_elements = $data_elements;
				////////////////////////////var_dump((($this->data_elements);

				

				if(count($data_elements) != 0) {
					foreach($data_elements['data_elements']['root'] as $root_element) {
						$this->assign_root_nodes_to_groups($root_element);
						//$this->find_relations($root_element);
						//break;
					}
					//////////////////////////var_dump((("root_nodes_by_group");
					//////////////////////////var_dump((($this->root_nodes_by_group);
					foreach($this->root_nodes_by_group['root'] as $root_element) {
						//////////////var_dump($root_element);
						$this->find_relations($root_element);
						////////////////var_dump($this->relations);
					}
					/*$table_id = NULL;
					if($parent_element['target_table_id'] != NULL) {
						$table_id = $parent_element['target_table_id'];
					}
					//////////////////////var_dump((($table_id);
					if($table_id != NULL) {*/
					$connect_value_table_id = $this->_class->find_connect_value_table_ids($parent_element);
					////////////////////var_dump(("connect_value_table_id");
					////////////////////var_dump(($connect_value_table_id);
					if(count($connect_value_table_id) > 0) {
						$this->find_connection_value_relations($connect_value_table_id, 'root');
					}
					
					//////////////var_dump($this->relations);
					////////////////var_dump($this->post_data);

					if(!$this->enable_pseudo_tables) {
						$result = $this->query_table($v, $this->relations);
					} else {
						////////////////var_dump("inside");
						$result = $this->query_pseudo_table($v, $this->relations);
					}
					//////////////////////var_dump(($result);
				} 
			} /*else if($element['target_table_id'] != NULL) {
				$table_id = $element['target_table_id'];
				////////////////////////////var_dump((($table_id);
				$this->data_elements = array(
					'data_elements' => array(),
					'tables' => array($table_id)
				);
				////////////////////////var_dump((($this->data_elements);
				if(isset($v['connect_value_table_id'])) {
					$this->connect_value_relations($table_id, $v['connect_value_table_id']);
				} else {
					$connect_value_table_id = $this->_class->find_connect_value_table_ids($parent_element);
					if(count($connect_value_table_id) > 0) {
						$this->connect_value_relations($table_id, $connect_value_table_id[0]);
					}
				}
				if(!$this->enable_pseudo_tables) {
					$result = $this->query_table($v, $this->relations);
				---} else {
					$result = $this->query_pseudo_table($v, $this->relations);
				}
			}*/
		}
		////////////////////var_dump($this->sub_queries);
		/*foreach($this->sub_queries as $sub_query) {
			$merge = false;
			$merge_variables = NULL;
			$merge_variables_set = NULL;
			if(strpos($sub_query['group_element']['function'], "merge") !== false) {
				////////////////////var_dump("merge");
				if(strpos($sub_query['group_element']['function'], "(") !== false) {
					$merge_variables_set = array();
					$merge_split = explode("merge(", $sub_query['group_element']['function']);
					$merge_variables = explode(")", $merge_split[1])[0];
					$merge_variables = explode(",", $merge_variables);
					foreach($merge_variables as $merge_key => $merge_variable) {
						$has_prefix = false;
						if(strpos($merge_variable, "__first") !== false) {
							$merge_variable_split = explode("__first.", $merge_variable);
							$merge_variable = array('__first', $merge_variable_split[1]);
							////////////////////var_dump("inside");
							////////////////////var_dump($merge_variable);
							$merge_variables[$merge_key] = $merge_variable;
							$has_prefix = true;
						} else {
							$merge_variables[$merge_key] = trim($merge_variable);
						}
						$merge_variables_set_key = $merge_variables[$merge_key];
						$prefix = NULL;
						if($has_prefix) {
							$prefix = $merge_variables[$merge_key][0];
							$merge_variables_set_key = $merge_variables[$merge_key][1];
							$merge_variables[$merge_key] = $merge_variables_set_key;
						}

						if(strpos($merge_variables[$merge_key], ".") !== false) {
							$merge_variables_split = explode(".", $merge_variables[$merge_key]);
							$merge_variables[$merge_key] = $merge_variables_split[count($merge_variables_split)-1];
							////////////////////var_dump($merge_variables[$merge_key]);
							$merge_variables_set[$merge_variables_set_key] = $merge_variables[$merge_key];
						} else {
							$merge_variables_set[$merge_variables_set_key] = $merge_variables_set_key;
						}
						if($has_prefix) {
							$merge_variables_set[$merge_variables_set_key] = array($prefix, $merge_variables_set[$merge_variables_set_key]);
						}	
					}
				}
				$merge_variables = $merge_variables_set;
				////////////////////var_dump($merge_variables);
				$merge = true;
			}
			////////////////////var_dump($result);
			if($this->select_singular === true) {
				$query_object = new query("sub_query", $result, $this->_class, $this->enable_pseudo_tables);
				$intermediate_result = $query_object->sub_query($sub_query['group_element'], $sub_query['foreign_table'], $this->data_elements, $this->root_nodes_by_group, $connect_value_table_id);
				////////////////////var_dump($sub_query);
				if($merge) {
					if($merge_variables != NULL) {
						foreach($merge_variables as $merge_key => $merge_variable) {
							////////////////////var_dump("inside");if(is_array($merge_variable)) {
							if(is_array($merge_variable) && $merge_variable[0] == '__first') {
								////////////////////var_dump($intermediate_result);
								$result[$merge_variable[1]] = $intermediate_result[0][$merge_key];
							} else {
								$result[$merge_variable] = $intermediate_result[$merge_key];
							}
						}
					} else {
						$result = array_merge($result, $intermediate_result);
					}
				} else {
					$result[$sub_query['group_element']['name']] = $intermediate_result;
				}
			} else {
				foreach($result as $result_key => $result_row) {
					if($result_key !== '_data_info') {
						////////////////////////var_dump((($result_key);
						$query_object = new query("sub_query", $result_row, $this->_class, $this->enable_pseudo_tables);
						$intermediate_result = $query_object->sub_query($sub_query['group_element'], $sub_query['foreign_table'], $this->data_elements, $this->root_nodes_by_group, $connect_value_table_id);

						if($merge) {
							if($merge_variables == NULL) {
								$result[$result_key] = array_merge($result[$result_key], $intermediate_result);
							} else {
								foreach($merge_variables as $merge_key => $merge_variable) {
									//if(isset($intermediate_result[$merge_variable])) {
										if(is_array($merge_variable)) {
											if($merge_variable[0] == '__first') {
												////////////////////var_dump($intermediate_result);
												$result[$result_key][$merge_variable[1]] = $intermediate_result[0][$merge_key];
											}
										} else {
											$result[$result_key][$merge_variable] = $intermediate_result[$merge_key];
										}
									//}
								}
							}
						} else {
							$result[$result_key][$sub_query['group_element']['name']] = $intermediate_result;
						}
					}
				}
			}
		}*/
		/*if($element['transform'] == 'first') {
			$result = $result[0];
		}*/
		$result = $this->perform_sub_queries($result);
		/*if(strpos($set_qualifier[0], 'count') !== false) {
			//////////////////var_dump($result);
		}*/
		////////////////////////////var_dump((($this->function_chain);
		////////////////////var_dump($this->function_chain);
		//return;
		$result = $this->resolve_function_chain($result);
		if($this->select_singular) {
			if(count($result) > 0) {
				$result =  $result[0];
			} else {
				$result = array();
			}
		}
		if($set_qualifier != NULL) {
			$count_pos = strpos($set_qualifier[0], '_count');
			if($count_pos !== false && $count_pos == strlen($set_qualifier[0])-6) {
				if(isset($v['pagination_item_count'])) {
					$result = ceil(count($result)/$v['pagination_item_count']);
					if($result == 0) {
						$result = 1;
					}	
				} else {
					$result = count($result);
				}
			}
		}
		if($this->return_count && gettype($result) != 'integer') {
			$result = count($result);
		}
		if(gettype($result) != 'integer' && gettype($result) != 'double' && gettype($result) != 'string') {
			$result['_data_info'] = array(
				'select_singular' => $this->select_singular
			);
		} else {
			$result = array('__result' => $result);
		}
		////////////////////var_dump($this->element_definition_addition);
		if(($element_type == 'select' || $element_type == 'tree' || $element_type == 'typeahead') && !$this->select_singular) {
			$select_column = NULL;
			$select_id = NULL;
			//////var_dump($result);
			if(count($result) > 0 && $result != NULL) {
				if(isset($this->element_definition_addition['post_data']['select_column'])) {
					////////////////////var_dump("inside");
					$select_column = $this->element_definition_addition['post_data']['select_column'];
					////////////////////var_dump($select_column);
					if(isset($this->element_definition_addition['post_data']['select_id'])) {
						$select_id = $this->element_definition_addition['post_data']['select_id'];
					}
					if(strpos($select_column, "'") == 0) {
						$select_column = explode("'", $select_column)[1];
						$select_id = explode("'", $select_id)[1];
					}
				} else {
					$first_row = $result[0];
					if(isset($first_row['title'])) {
						$select_column = 'title';
					} else if(isset($first_row['content'])) {
						$select_column = 'content';
					} else if(isset($first_row['value'])) {
						$select_column = 'value';
					} else if(isset($first_row['name'])) {
						$select_column = 'name';
					} else if(isset($fist_row['description'])) {
						$select_column = 'description';
					} else {
						foreach($first_row as $key => $value) {
							if(strpos($key, "name") !== false) {
								$select_column = $key;
							}
						}
						if($select_column == NULL) {
							//////var_dump($first_row);
							$select_column = array_keys($first_row)[1];
						}
					}
				}
				foreach($result as $key => $row) {
					if(isset($row[$select_column])) {
						$result[$key]['title'] = $row[$select_column];
						/*if(isset($select_id) && $select_id != NULL) {
							$result[$key]['id'] = $row[$select_id];
						}*/
					} else {
						$result[$key]['title'] = "";
					}
				}
			}
		}
		//////////var_dump($this->relations);
		if($this->self_sub_query && !$this->select_singular) {
			////////var_dump("inside");
			////////var_dump($result);
			//$assign_to_parent = new assign_to_parent();
			//$result = $assign_to_parent->assign_to_parent($result, $this->self_sub_query_column['name']);
		}

		return $result;
	}

	function remove_input_relations($primary_data_source) {
		////////////////////var_dump($primary_data_source);
		$bound_relations = array();
		foreach($this->relations as $key => $relation) {
			if($relation[0][0] == 0) {
				$bound_relations[$relation[1][1]] = true;
				unset($this->relations[$key]);
			}
		}
		foreach($this->relations as $key => $relation) {
			if(isset($bound_relations[$relation[0][1]]) || isset($bound_relations[$relation[1][1]])) {
				unset($this->relations[$key]);
			}
		}
		//if(count($this->relations) > 0) {
		if(isset($this->post_data['id'])) {
			$query = "SELECT * FROM columns WHERE table_id = ".$primary_data_source['table_id'].""; //AND type = 0
			$data_element_column = $this->sql->get_row($query, 1);
			$this->relations[] = array(
				array(0, 'id', false, 'id'),
				array($primary_data_source['table_id'], $data_element_column['id'])
			);
		}
	}

	function perform_sub_queries($result) {
		foreach($this->sub_queries as $sub_query) {
			$merge = false;
			$merge_variables = NULL;
			$merge_variables_set = NULL;
			$merge_and_copy = false;
			if(strpos($sub_query['group_element']['function'], "merge") !== false) {
				////////////////////var_dump("merge");
				if(strpos($sub_query['group_element']['function'], "copy_and_merge") !== false) {
					$merge_and_copy = true;
				}
				if(strpos($sub_query['group_element']['function'], "(") !== false) {
					$merge_variables_set = array();
					$merge_prefix = "merge(";
					if($merge_and_copy) {
						$merge_prefix = "copy_and_merge(";
					}
					$merge_split = explode($merge_prefix, $sub_query['group_element']['function']);
					$merge_variables = explode(")", $merge_split[1])[0];
					$merge_variables = explode(",", $merge_variables);
					foreach($merge_variables as $merge_key => $merge_variable) {
						$has_prefix = false;
						if(strpos($merge_variable, "__first") !== false) {
							$merge_variable_split = explode("__first.", $merge_variable);
							$merge_variable = array('__first', $merge_variable_split[1]);
							////////////////////var_dump("inside");
							////////////////////var_dump($merge_variable);
							$merge_variables[$merge_key] = $merge_variable;
							$has_prefix = true;
						} else {
							$merge_variables[$merge_key] = trim($merge_variable);
						}
						$merge_variables_set_key = $merge_variables[$merge_key];
						$prefix = NULL;
						if($has_prefix) {
							$prefix = $merge_variables[$merge_key][0];
							$merge_variables_set_key = $merge_variables[$merge_key][1];
							$merge_variables[$merge_key] = $merge_variables_set_key;
						}

						if(strpos($merge_variables[$merge_key], ".") !== false) {
							$merge_variables_split = explode(".", $merge_variables[$merge_key]);
							$merge_variables[$merge_key] = $merge_variables_split[count($merge_variables_split)-1];
							////////////////////var_dump($merge_variables[$merge_key]);
							$merge_variables_set[$merge_variables_set_key] = $merge_variables[$merge_key];
						} else {
							$merge_variables_set[$merge_variables_set_key] = $merge_variables_set_key;
						}
						if($has_prefix) {
							$merge_variables_set[$merge_variables_set_key] = array($prefix, $merge_variables_set[$merge_variables_set_key]);
						}	
					}
				}
				$merge_variables = $merge_variables_set;
				////////////////////var_dump($merge_variables);
				$merge = true;
			}
			////////////////////var_dump($result);
			if($this->select_singular === true) {
				$query_object = new query("sub_query", $result, $this->_class, $this->enable_pseudo_tables, $this->application_id);
				$intermediate_result = $query_object->sub_query($sub_query['group_element'], $sub_query['foreign_table'], $this->data_elements, $this->root_nodes_by_group, $connect_value_table_id);
				////////////////////var_dump($sub_query);
				if($merge) {
					if($merge_variables != NULL) {
						foreach($merge_variables as $merge_key => $merge_variable) {
							////////////////////var_dump("inside");if(is_array($merge_variable)) {
							if(is_array($merge_variable) && $merge_variable[0] == '__first') {
								////////////////////var_dump($intermediate_result);
								$result[$merge_variable[1]] = $intermediate_result[0][$merge_key];
								unset($intermediate_result[0][$merge_key]);
							} else {
								$result[$merge_variable] = $intermediate_result[$merge_key];
								unset($intermediate_result[$merge_key]);
							}
						}
					} else {
						$result = array_merge($result, $intermediate_result);
					}
					if($merge_and_copy) {
						$result[$sub_query['group_element']['name']] = $intermediate_result;
					}
				} else {
					$result[$sub_query['group_element']['name']] = $intermediate_result;
				}
			} else {
				foreach($result as $result_key => $result_row) {
					if($result_key !== '_data_info') {
						////////////////////////var_dump((($result_key);
						$query_object = new query("sub_query", $result_row, $this->_class, $this->enable_pseudo_tables, $this->application_id);
						$intermediate_result = $query_object->sub_query($sub_query['group_element'], $sub_query['foreign_table'], $this->data_elements, $this->root_nodes_by_group, $connect_value_table_id);

						if($merge) {
							if($merge_variables == NULL) {
								$result[$result_key] = array_merge($result[$result_key], $intermediate_result);
							} else {
								foreach($merge_variables as $merge_key => $merge_variable) {
									//if(isset($intermediate_result[$merge_variable])) {
										if(is_array($merge_variable)) {
											if($merge_variable[0] == '__first') {
												////////////////////var_dump($intermediate_result);
												$result[$result_key][$merge_variable[1]] = $intermediate_result[0][$merge_key];
												unset($intermediate_result[0][$merge_key]);
											}
										} else {
											$result[$result_key][$merge_variable] = $intermediate_result[$merge_key];
											unset($intermediate_result[$merge_key]);
										}
									//}
								}
							}
							if($merge_and_copy) {
								$result[$result_key][$sub_query['group_element']['name']] = $intermediate_result;
							}
						} else {
							$result[$result_key][$sub_query['group_element']['name']] = $intermediate_result;
						}
					}
				}
			}
		}
		return $result;
	}

	private $private_element = false;

	function page_query($action, $v) {
		$page = explode("get_", $action)[1];
		$query = "SELECT * FROM pages WHERE name = '".$page."' AND application_id = ".$this->application_id;
		$page_row = $this->sql->get_row($query, 1);
		$access = $this->_class->user_group_member($page_row['user_access_id'], $this->application_id);
		if(!$access) {
			return array('__user_access' => "-2");
		}
		/*$this->page_data_elements = array();
		$this->page_data_elements_marked = array();
		foreach($root_elements as $root_element) {
			$this->gather_data_elements($root_element, $page_row['id']);
		}*/
		/*$result = $v;
		foreach($root_elements as $root_element) {
			////////////////////////var_dump((($root_element);
			$intermediate_result = $this->page_data_element_query($root_element, $result);
			if($intermediate_result === NULL) {
				$result = array_merge($result, $intermediate_result);
			} else {
				$result[$root_element['name']] = $intermediate_result;
			}

			//////////////////////var_dump((("Result:\n");
			//////////////////////var_dump((($result);
		}*/
		$this->index_page_data_elements($page_row['id']);
		////////////////////////var_dump((($this->page_data_element_index);
		////////////////////var_dump($page_row);
		$query = "SELECT * FROM elements WHERE page_id = ".$page_row['id']." AND element_type_id = 8"; //hvad er element_type_id = 8 ??? page_data?
		$root_elements = $this->sql->get_rows($query, 1);
		$result = array();
		if(count($root_elements) > 0) {
			$query = "SELECT * FROM elements WHERE page_id = ".$page_row['id']." AND element_type_id = 24";//.$root_elements[0]['id'];
			$data_query_element = $this->sql->get_row($query, 1);
			////////var_dump($data_query_element);
			if($data_query_element != NULL) {

				//$root_elements = [$data_query_element];
				$result = $this->page_data_element_query($data_query_element, $v);
				if(isset($result[0])) {
					return $result[0];
				}
			} else {

			//} else {
				////////////////var_dump($root_elements);
				////////////////////var_dump($root_elements);
				$this->page_data_marked = [];
				$result = $this->traverse_page_data_elements(0, $v);
				if($result == NULL) {
					$result = array();
				}
				foreach($root_elements as $root_element) {
					$intermediate_result = $this->traverse_page_data_elements($root_element['id'], $v);
					if($intermediate_result != NULL) {
						$result = array_merge($result, $intermediate_result);
					}
				}
				////////var_dump($this->page_data_element_index);
				//////////var_dump($result);
				$first_key = array_keys($result)[0]; //array_key_first
				$result = array_merge($result, $result[$first_key]);
			}
		}
		return $result;
	}

	private $page_data_element_index = [];
	private $page_data_marked = [];

	function index_page_data_elements($page_id) {
		$this->page_data_marked = [];
		$this->page_data_element_index = [0 => array()];
		$query = "SELECT * FROM elements WHERE page_id = ".$page_id." AND element_type_id = 9";
		////////////////////////var_dump((($query);
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $row) {
			$parents = $row['parents'];
			if($parents != NULL && strlen($parents) > 0) {
				$parents = json_decode($parents, true);
			} else {
				$parents = [];
			}
			if(count($parents) > 0) {
				foreach($parents as $parent_id) {
					if(!isset($this->page_data_element_index[$parent_id])) {
						$this->page_data_element_index[$parent_id] = array();
					}
					$this->page_data_element_index[$parent_id][] = $row;
				}
			} else {
				$this->page_data_element_index[0][] = $row;
			}
		}
	}


	function traverse_page_data_elements($element_id=0, $v, $unset_id=false) {
		$result = [];
		if($unset_id) {
			unset($v['id']);
		}
		if($element_id == 0 && count($this->page_data_element_index[$element_id]) == 0) {
			return NULL;
		} else if(!isset($this->page_data_element_index[$element_id]) || count($this->page_data_element_index[$element_id]) == 0 || isset($this->page_data_marked[$element_id])) {
			return NULL;
		}
		////////////////////////var_dump((("traversed");
		////////////////////////var_dump((($element_id);
		$this->page_data_marked[$element_id] = true;
		foreach($this->page_data_element_index[$element_id] as $child) {
			////////////////var_dump($child);
			$result[$child['name']] = $this->page_data_element_query($child, $v, !$unset_id);
			////////////////var_dump($result);
			//////////////////////var_dump((($v);
			//////////////////////var_dump((("----");
			//////////////////////var_dump((($child['name']);
			//////////////////////var_dump((($result[$child['name']]);
			//$result = array_merge($result, $this->page_data_element_query($child, $v));
			$intermediate_result = $this->traverse_page_data_elements($child['id'], $result[$child['name']], true);
			////////////////////////var_dump((($intermediate_result);
			if($intermediate_result != NULL) {
				$result = array_merge($result, $intermediate_result);
				//$result[$child['id']['name']] = $intermediate_result;
			}
		}
		return $result;
	}

	function page_data_element_query($root_element, $v, $select_singular=false) {
		////////////////////////var_dump((($root_element);
		////////////////////////var_dump((($v);
		$query_object = new query("element_query", $v, $this->_class, $this->enable_pseudo_tables, $this->application_id);
		$query_object->set_select_singular($select_singular);
		$result = $query_object->query("element_query", $v, $root_element);
		////////////////////////var_dump((($result);
		return $result;
	}

	function set_select_singular($select_singular) {
		$this->select_singular = $select_singular;
	}

	//EINFALDA OG LAGA
	function page_data_element_query_alt($root_element, $v, $unset_id=false) {
		if($unset_id) {
			unset($v['id']);
		}
		if(!isset($this->page_data_elements[$root_element['id']])) {
			return NULL;
		}
		$data_children = $this->page_data_elements[$root_element['id']];
		//////////////////////////var_dump((($data_children);
		$result = array();
		foreach($data_children as $data_child) {
			$data_elements = $this->get_data_elements($data_child['id']);
			$this->data_elements = $data_elements;
			////////////////////////////var_dump((($this->data_elements);
			$this->relations = array();
			if(count($data_elements) != 0) {
				foreach($data_elements['data_elements']['root'] as $root_element) {
					$this->assign_root_nodes_to_groups($root_element);
					//$this->find_relations($root_element);
					//break;
				}
				//////////////////////////var_dump((("root_nodes_by_group");
				//////////////////////////var_dump((($this->root_nodes_by_group);
				foreach($this->root_nodes_by_group['root'] as $root_element) {
					$this->find_relations($root_element);
				}
				if(!$this->enable_pseudo_tables) {
					//$result = array_merge($result, $this->query_table($v, $this->relations));
				} else {
					//Tharf mogulega foreach fyrir sub-data-element sem er fyrir hverja rod og parent hefur fleiri en eina rod-----
					$intermediate_result = $this->query_pseudo_table($v, $this->relations);
					if(!$unset_id) {
						$result = array_merge($result, $intermediate_result);
					} else {
						$result[$data_child['name']] = $intermediate_result;
					}
					if(!$unset_id) {
						/*if($intermediate_result['_data_info']['select_singular']) {
							foreach($this->sub_queries as $sub_query) {
								$send_result = $result;
								unset($send_result['_data_info']);
								$query_object = new query("sub_query", $send_result, $this->_class, $this->enable_pseudo_tables);
								$result[$sub_query['group_element']['name']] = $query_object->sub_query($sub_query['group_element'], $sub_query['foreign_table'], $this->data_elements, $this->root_nodes_by_group);
							}
						} else {
							foreach($this->sub_queries as $sub_query) {
								foreach($result as $result_key => $result_row) {
									if($result_key != '_data_info') {
										$query_object = new query("sub_query", $result_row, $this->_class, $this->enable_pseudo_tables);
										$result[$result_key][$sub_query['group_element']['name']] = $query_object->sub_query($sub_query['group_element'], $sub_query['foreign_table'], $this->data_elements, $this->root_nodes_by_group);
									}
								}
							}
						}*/
					} else {

						/*if($intermediate_result['_data_info']['select_singular']) {

						} else {
							if($unset_id) {
								foreach($this->sub_queries as $sub_query) {
									foreach($result[$data_child['name']] as $result_key => $result_row) {
										if($result_key != '_data_info') {
											unset($result_row['_data_info']);
											$query_object = new query("sub_query", $result_row, $this->_class, $this->enable_pseudo_tables);
											$result[$data_child['name']][$result_key][$sub_query['group_element']['name']] = $query_object->sub_query($sub_query['group_element'], $sub_query['foreign_table'], $this->data_elements, $this->root_nodes_by_group);
										}
									}
								}
							}
						}*/
					}
					////////////////////////var_dump((($result);
				}
			}
			/*////////////////////////var_dump((($this->relations);
			////////////////////////var_dump((("result");
			////////////////////////var_dump((($result);*/
			////////////////////////var_dump((($data_child['name']);
			$intermediate_result = $this->page_data_element_query_alt($data_child, $result, true);
			////////////////////////var_dump((($data_child['name']);
			if($intermediate_result !== NULL) {
				////////////////////////var_dump((($data_child['name']);
				////////////////////////var_dump((($intermediate_result);
				/*if(count($result) == 0) {
					foreach($intermediate_result as $intermediate_key => $intermediate_values) {
						$result = array_merge($result, $intermediate_result[$intermediate_key]);
					}
				} else {
				}*/
				$result = array_merge($result, $intermediate_result);
				//$result[$data_child['name']] = $intermediate_result;
			}

		}
		return $result;
	}

	private $page_data_elements = array();
	private $page_data_elements_marked = array();

	function gather_data_elements($root_element, $page_id) {
		$query = "SELECT * FROM elements WHERE page_id = ".$page_id." AND element_type_id = 9";
		$data_elements = $this->sql->get_rows($query, 1);
		foreach($data_elements as $data_element) {
			$parents = $data_element['parents'];
			if($parents != NULL && strlen($parents) > 0) {
				$parents = json_decode($parents, true);
			} else {
				$parents = array();
			}
			foreach($parents as $parent_id) {
				if(!isset($this->page_data_elements[$parent_id])) {
					$this->page_data_elements[$parent_id] = [];
				}
				if(!in_array($data_element, $this->page_data_elements[$parent_id])) {
					////////////////////////var_dump((($parent_id);
					$this->page_data_elements[$parent_id][] = $data_element;
					//////////////////////////var_dump((($this->page_data_elements);
				}
			}
		}
	}

	private $root_nodes_by_group = ['root' => []];
	private $root_tables = [];
	private $root_nodes_by_group_has_input_node = false;

	function assign_root_nodes_to_groups($root_node) {
		//$query = "SELECT * FROM data_elements WHERE "; 
		//$this->root_nodes_by_group = [];
		////////////////////var_dump($this->data_elements);
		$this->retrace_group_queue = [];
		$this->retrace_group_marked = [];
		if(!isset($this->data_elements['data_elements'][$root_node['id']]) && !in_array($root_node, $this->root_nodes_by_group['root'])) {
			$this->root_nodes_by_group['root'][] = $root_node;
			if($root_node['data_element_type_id'] == 1) {
				$this->root_nodes_by_group_has_input_node = true;
			}
			return;
		}
		$children = $this->data_elements['data_elements'][$root_node['id']];
		////////////////////////////var_dump((($children);
		foreach($children as $child) {
			////////////////////var_dump($child['name']);
			$parents = $child['parents'];
			if($parents != NULL && $parents != "" && strlen($parents) > 0) {
				$parents = json_decode($parents, true);
			} else {
				$parents = [];
			}
			////////////////////////////var_dump((($parents);
			if(count($parents) > 1) {
				$group_parent = $this->retrace_first_group_parent($child);
				//////echo "group_parent:\n";
				////////////////////var_dump($group_parent);
				if($group_parent === false) {
					$this->root_nodes_by_group['root'][] = $root_node;
				} else {
					if(!isset($this->root_nodes_by_group[$group_parent['id']])) {
						$this->root_nodes_by_group[$group_parent['id']] = array();
					}
					if(!in_array($root_node, $this->root_nodes_by_group[$group_parent['id']])) {
						$this->root_nodes_by_group[$group_parent['id']][] = $root_node;
					}
				}
			} else if(!in_array($root_node, $this->root_nodes_by_group['root'])) {
				////////////////////////////var_dump((("inside");
				if($root_node['data_element_type_id'] != 1 && $this->root_nodes_by_group_has_input_node) {

				} else {
					$this->root_nodes_by_group['root'][] = $root_node;
				}
				if($root_node['data_element_type_id'] == 1) {
					$this->root_nodes_by_group_has_input_node = true;
				}
			}
		}
	}
	private $gather_root_tables_marked = array();

	function gather_root_tables($root_node=NULL) {
		$query = "SELECT * FROM data_elements WHERE element_id = ".$root_node['element_id'];
		$rows = $this->sql->get_rows($query, 1);
		foreach($rows as $row) {
			$parents = $row['parents'];
			if($parents != NULL) {
				$parents = json_decode($parents, true);
			} else {
				$parents = array();
			}
			foreach($parents as $parent_id) {
				//////////////////////var_dump(("parent_id: ".$parent_id);
				if($parent_id == $root_node['id'] && !isset($this->gather_root_tables_marked[$row['id']])) {
					$this->gather_root_tables_marked[$row['id']] = true;
					if($row['table_id'] != NULL) {
						if(!in_array($row['table_id'], $this->root_tables)) {
							if(!isset($this->root_tables)) {
								$this->root_tables = array();
							}
							$this->root_tables[] = $row['table_id'];
						}
					}
					if($row['data_element_type_id'] != 5) {
						$this->gather_root_tables($row);
					}
				}
			}
		}	
	}

	private $retrace_group_queue = [];
	private $retrace_group_marked = [];

	function retrace_first_group_parent($data_element) {
		//////echo "search data_elenet: ".$data_element['name']."\n";
		$parents = $data_element['parents'];
		$this->retrace_group_marked[$data_element['id']] = true;
		if($parents != NULL && $parents != "" && strlen($parents) > 0) {
			$parents = json_decode($parents, true);
		} else {
			$parents = [];
		}
		foreach($parents as $parent_id) {
			$query = "SELECT * FROM data_elements WHERE id = ".$parent_id;
			$parent_row = $this->sql->get_row($query, 1);
			if($parent_row['data_element_type_id'] == 5) {
				return $parent_row;
			} else {
				$this->retrace_group_queue[] = $parent_row;
				/*$intermediate_result = $this->retrace_first_group_parent($parent_row);
				if($intermediate_result !== false) {
					return $intermediate_result;
				}*/
			}
		}
		while(count($this->retrace_group_queue) > 0) {
			$data_element = array_shift($this->retrace_group_queue);
			if(!isset($this->retrace_group_marked[$data_element['id']])) {
				$this->retrace_group_marked[$data_element['id']] = true;
				$parents = $data_element['parents'];
				if($parents != NULL && $parents != "" && strlen($parents) > 0) {
					$parents = json_decode($parents, true);
				} else {
					$parents = [];
				}
				foreach($parents as $parent_id) {
					$query = "SELECT * FROM data_elements WHERE id = ".$parent_id;
					$parent_row = $this->sql->get_row($query, 1);
					if($parent_row['data_element_type_id'] == 5) {
						return $parent_row;
					} else {
						$this->retrace_group_queue[] = $parent_row;
						/*$intermediate_result = $this->retrace_first_group_parent($parent_row);
						if($intermediate_result !== false) {
							return $intermediate_result;
						}*/
					}
				}
			}
		}
		return false;
	}

	function find_connection_value_relations($connect_value_table_id, $group_name, $group_element=NULL) {
		////////////////////var_dump("inside-2");
		/*foreach($this->root_nodes_by_group[$group_name] as $node) {
			$table_id = $node['table_id'];*/
		if($group_element !== NULL) {
			$this->gather_root_tables($group_element);
		}
		/*////////////////////var_dump(($this->root_nodes_by_group[$group_name]);
		$this->gather_root_tables($this->root_nodes_by_group[$group_name]);
		////////////////////var_dump(("root_tables");
		////////////////////var_dump(($this->root_tables);
		////////////////////var_dump(($connect_value_table_id);*/
		////////////////////var_dump(($this->root_tables);
		//if(isset($this->root_tables[$group_name])) {
		foreach($this->root_tables as $table_id) {
			if($table_id != NULL) {
				if(isset($connect_value_table_id[$table_id])) {
					////////////////////var_dump(("exists: ".$table_id);
					$this->connect_value_relations($table_id, $connect_value_table_id, 'connect_id', true);
				} else {
					/*foreach($connect_value_table_id as $key => $value) {
						if($value == $table_id) {
							$this->connect_value_relations($table_id, $connect_value_table_id, 'connect_id', true);
						}
					}*/
				}
			}
		}
		//}
		//}
		//////////////////////var_dump((($this->relations);
	}

	private $add_post_data = [];

	function connect_value_relations($table_id, $connect_value_table_id, $input_column_name='connect_id', $find_column_name=false) {
		$query = "SELECT * FROM columns WHERE table_id = ".$table_id." ORDER BY id DESC LIMIT 1";
		$column_a = $this->sql->get_row($query, 1);
		//////echo "column_a:\n";
		////////////////////var_dump($column_a);
		//////////////////////////var_dump((($connect_value_table_id[$table_id]);
		////////////////////////var_dump((($column_a);
		$query = "SELECT * FROM columns WHERE table_id = ".$connect_value_table_id[$table_id]." ORDER BY id DESC LIMIT 1";
		$column_b = $this->sql->get_row($query, 1);
		////////////////////var_dump($column_b);
		if($find_column_name) {
			$query = "SELECT * FROM tables WHERE id = ".$connect_value_table_id[$table_id];
			$table_row = $this->sql->get_row($query, 1);
			$input_column_name = $table_row['name'].'.id';
		}
		if(!isset($this->post_data['connect_value_table_id'])) {
			$this->add_post_data['connect_value_table_id'] = $connect_value_table_id[$table_id];
		}
		////////////////////////var_dump((($column_b);
		$addition_a = array(
			array(0, $input_column_name),
			array($table_id, $column_a['id'])
		);
		$addition_b = array(
			array($connect_value_table_id[$table_id], $column_b['id'], true),
			array($table_id, $column_a['id'], true)
		);
		if(!in_array($addition_a, $this->relations) && !in_array($addition_b, $this->relations)) {
			$this->relations[] = $addition_a;
			$this->relations[] = $addition_b;
		}
		//////////////////////var_dump((($this->data_elements['tables']);
	}

	function sub_query($data_element, $foreign_table, $data_elements, $root_nodes_by_group, $connect_value_table_id=NULL) {
		/*$query = "SELECT * FROM tables WHERE id = ".$foreign_table;
		$table_row = $this->sql->get_row($query, 1);
		$query = "SELECT * FROM columns WHERE table_id = ".$table_row['id']." ORDER BY id DESC LIMIT 1";
		$column_row = $this->sql->get_row($query, 1);*/

		/*$this->relations[] = array(
			array(0, 'id'),

		);*/
		//////////////////////var_dump(($this->post_data);
		////////////////////var_dump(($data_element['name']);
		////////////////////var_dump("sub_query");
		$this->root_nodes_by_group = $root_nodes_by_group;
		$this->data_elements = $data_elements;
		$data_element['foreign_table'] = $foreign_table;
		$this->find_relations($data_element);
		////////////////////var_dump(("root node:");
		////////////////////var_dump(("group root node:::");
		////////////////////var_dump(($this->root_nodes_by_group);
		//////////////////////var_dump(($this->root_nodes_by_group[$data_element['id']]);
		////////////////////var_dump(($data_element['id']);
		////////////////////var_dump(($data_element['name']);
		if(isset($this->root_nodes_by_group[$data_element['id']])) {
			foreach($this->root_nodes_by_group[$data_element['id']] as $root_node) {
				//////////////////////////var_dump((("root_node by group");
				//////////////////////////var_dump((($root_node);
				$this->find_relations($root_node);
			}
		} else {
			////////////////////var_dump("inside");
			//$this->find_relations($data_element);
		}
		////////////////////var_dump($this->relations);
		//$this->root_nodes_by_group = $root_nodes_by_group;
		////////////////////var_dump(($connect_value_table_id);
		if($connect_value_table_id != NULL) {
			////////////////////var_dump(("set");
			//////////////////////var_dump(($this->root_nodes_by_group[$data_element['id']]);
			$this->find_connection_value_relations($connect_value_table_id, 'root', $data_element);
		}
		//////////////////////var_dump(("sub query relations");
		////////////////////var_dump($this->relations);
		if(!$this->enable_pseudo_tables) {
			$result = $this->query_table($this->post_data, $this->relations);
		} else {
			$result = $this->query_pseudo_table($this->post_data, $this->relations);
		}
		////////////////////////var_dump((($result);
		////////////////////////var_dump((($this->function_chain);
		////////////////////////var_dump((($result);
		////////////////////var_dump($data_element);
		////////////////////var_dump($this->function_chain);
		/*//////////////////var_dump($result);
		//////////////////var_dump($this->post_data);
		//////////////////var_dump($this->relations);*/
		$result = $this->perform_sub_queries($result);
		$result = $this->resolve_function_chain($result);
		if($this->select_singular) {
			if(count($result) > 0) {
				$result =  $result[0];
			} else {
				$result = array();
			}
		}
		if(gettype($result) != 'integer' && gettype($result) != 'string') {
			$result['_data_info'] = array(
				'select_singular' => $this->select_singular
			);
		}
		return $result;
	}

	private $relations = array();
	private $relations_marked = array();

	private $sub_queries = array();

	function find_relations($data_element, $auto_discover=false) {
		//////////////var_dump("find_relations call");
		//////////////var_dump($data_element['name']);
		if(isset($this->relations_marked[$data_element['id']])) {
			return;
		}
		$base_schema = false;
		$this->relations_marked[$data_element['id']] = true;
		$children = array();
		if(isset($this->data_elements['data_elements'][$data_element['id']])) {
			$children = $this->data_elements['data_elements'][$data_element['id']];
		}
		if($data_element['table_id'] != NULL && $data_element['table_id'] != 0) {
			////////////////////////////var_dump((($data_element['table_id']);
			$query = "SELECT * FROM tables WHERE id = ".$data_element['table_id'];
			$data_element_table_row = $this->sql->get_row($query, 1);
			if($data_element_table_row['schema_id'] == 0) {
				$base_schema = true;
			}
		}
		if($auto_discover) {
			$data_element_parents_decoded = $data_element['parents'];
			if($data_element_parents_decoded != NULL && strlen($data_element_parents_decoded) > 0) {
				$data_element_parents_decoded = json_decode($data_element_parents_decoded, true);
			}
			if($data_element['data_element_type_id'] == 2 && count($data_element_parents_decoded) == 0) {
				$query = "SELECT * FROM columns WHERE table_id = ".$data_element['table_id'];
				$data_element_columns = $this->sql->get_rows($query, 1);
				/*$primary_id_column = false;
				if($column == "id" || strpos($column, ".id") === strlen($column)-4) {
					$primary_id_column = true;
				}
				////echo "primary_id_column----\n";
				////////////////var_dump($primary_id_column);*/
				foreach($data_element_columns as $data_element_column) {
					if($data_element_column['type'] == 1) {// && !$primary_id_column) {
						$this->relations[] = array(
							array(0, $column, false, $data_element_column['name']),
							array($data_element['table_id'], $data_element_column['id'])
						);
					}/* else if($primary_id_column && $data_element_column['type'] == 0) {
						$this->relations[] = array(
							array(0, $column, false, $data_element_column['name']),
							array($data_element['table_id'], $data_element_column['id'])
						);
					}*/
				}
			}

		}
		$parent_table_name = NULL;
		if($data_element['table_id'] != 0) {
			$parent_table_name = $this->sql->get_row("SELECT name FROM tables WHERE id = ".$data_element['table_id']);
		}
		//////////////////////////////var_dump((($children);
		foreach($children as $child) {
			////echo "child:\n";
			////////////var_dump($child);
			$traverse_child = true;
			$table_name = "";
			$child_base_schema = false;
			if($child['table_id'] != 0) {
				$query = "SELECT * FROM tables WHERE id = ".$child['table_id'];
				$table_row = $this->sql->get_row($query, 1);
				$table_name = $table_row['name'];
				if($table_row['schema_id'] == 0) {
					$child_base_schema = true;
				}
			}
			$ignore_tables = array();
			$ignore_string = $child['function'];
			if(strpos($ignore_string, "ignore:") !== false) {
				$ignore_string = explode("ignore:", $ignore_string)[1];
				$ignore_tables = explode(",", $ignore_string);
				foreach($ignore_tables as $ignore_key => $ignore_table) {
					$ignore_tables[$ignore_key] = trim($ignore_table);
				}
			}
			//////////////////////////var_dump((($ignore_tables);
			$column = NULL;
			if($data_element['data_element_type_id'] == 1 || $data_element['data_element_type_id'] == 5) {
				$column = $data_element['name'];
				////////////////////var_dump($data_element['name']);
				////////////////////var_dump($child['name']);
				//////////////////////////var_dump((("query_set_column");
				//////////////////////////var_dump((($column);
				if($data_element['transform_name'] != NULL) {
					$column = $data_element['transform_name'];
				} else if($data_element['data_element_type_id'] == 5 && $data_element['function'] != 'disrupt') {
					//$query = 
					$query = "SELECT * FROM tables WHERE id = ".$data_element['foreign_table']['id'];
					$sub_query_table = $this->sql->get_row($query, 1);
					if($sub_query_table != NULL) {
						$column = $sub_query_table['name'].".id";
					}
				}
				//////////////////////////////var_dump((("inside: ".$column);
				if($child['data_element_type_id'] == 2) {
					if(!$child_base_schema) {

						$column_row = NULL;
						$query_set_column = $column;
						//////////////////////////var_dump((("query_set_column");
						//////////////////////////var_dump((($column);
						if(isset($data_element['foreign_table']) && $data_element['foreign_table'] != NULL) {
							$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." AND foreign_table_id = ".$data_element['foreign_table']['id'];
							////////////////////var_dump($query);
							$column_row = $this->sql->get_row($query, 1);
						}
						//////////////var_dump("query_set_column");
						//////////////var_dump($query_set_column);
						if($column_row == NULL && strpos($query_set_column, ".") !== false || $query_set_column == 'id') {
							//$query_set_column = 'id';
							if($query_set_column == 'id') {
								$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." AND type = 0 ORDER BY id DESC LIMIT 1";
								$column_row = $this->sql->get_row($query, 1);
							} else {
								$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." ORDER BY id DESC LIMIT 1";
								$column_row = $this->sql->get_row($query, 1);
							}
						} else if($column_row == NULL) {
							$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." AND name = '".$query_set_column."'";
							$column_row = $this->sql->get_row($query, 1);
						}
						////////////////////////////var_dump((($child);
						//////////////////////////var_dump((("query_set_column");
						//////////////////////////var_dump((($column);
						//////////var_dump("inside");
						$this->relations[] = array(
							array(0, $column, false, $data_element['name']),
							array($child['table_id'], $column_row['id'])
						);
						//////////var_dump($this->relations);
					} else {
						/*$this->relations[] = array(
							array(0, $column),
							array($child['table_id'], -1)
						);*/
						if(!isset($this->additional_queries_relations[$child['id']])) {
							$this->additional_queries_relations[$child['id']] = [];
						}
						if(!in_array($parent_table_name, $ignore_tables)) {
							$this->additional_queries_relations[$child['id']][] = array(
								array(0, $column),
								array($child['table_id'], -1),
							);
						}
					}
				}
			} else if($data_element['data_element_type_id'] == 2 && $child['data_element_type_id'] == 5) {	//Lata 3 vera fyrir oll function og bua til nyjan dalk i data_element fyrir function
				////////////////////var_dump("--sub query");
				
				if($data_element['function'] != 'disrupt') {
					$sub_query_object = array(
						'group_element' => $child,
						'foreign_table' => array(
							'id' => $data_element['table_id'],
							//'name' => $table_name
						),
						'parent_element_id' => $data_element['element_id']
					);
					if(!in_array($sub_query_object, $this->sub_queries)) {
						$this->sub_queries[] = $sub_query_object;
					}
				} else {
					$sub_query_object =  array(
						'group_element' => $child,
						'parent_element_id' => $data_element['element_id']
						/*'foreign_table' => array(
							'id' => $data_element['table_id'],
							//'name' => $table_name
						)*/
					);
					if(!in_array($sub_query_object, $this->sub_queries)) {
						$this->sub_queries[] = $sub_query_object;
					}
				}
				$traverse_child = false;
			} else if($data_element['data_element_type_id'] == 2 && $child['data_element_type_id'] == 2) {
				//////////////var_dump($data_element['name'].' - '.$child['name']);
				////////////var_dump("---inside---");
				////////////var_dump($data_element);
				////////////var_dump($base_schema);
				////////////var_dump($child_base_schema);
				if($data_element['id'] != $child['id']) {
					if(!$base_schema && !$child_base_schema) {
						//////////////var_dump("inside");
						$query = "SELECT * FROM columns WHERE table_id = ".$data_element['table_id']." AND foreign_table_id = ".$child['table_id'];
						//////////////////////////var_dump((($query);
						$data_element_column = $this->sql->get_row($query, 1);
						////////////var_dump($data_element_column);
						if($data_element_column != NULL) {
							$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." ORDER BY id DESC LIMIT 1";
							$child_column = $this->sql->get_row($query, 1);
							if($data_element_column['id'] != $child_column['id']) {
								$this->relations[] = array(
									array($data_element['table_id'], $data_element_column['id']),
									//array($child['table_id'], 0),
									array($child['table_id'], $child_column['id'], true),
								);
							}
							
						} else {
							////////////var_dump("inside");
							$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." AND foreign_table_id = ".$data_element['table_id'];
							$data_element_column = $this->sql->get_row($query, 1);
							//////////////var_dump("data_element_column");
							////////////var_dump($data_element_column);
							if($data_element_column != NULL) {
								//////////////var_dump("child table_id: ".$child['table_id']);
								$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." ORDER BY id DESC LIMIT 1";
								$child_column = $this->sql->get_row($query, 1);
								////////////var_dump($data_element_column['id'].' - '.$child_column['id']);
								if($data_element_column['id'] != $child_column['id']) {
									$this->relations[] = array(
										array($data_element['table_id'], $data_element_column['id']),
										//array($child['table_id'], 0),
										array($child['table_id'], $child_column['id'], true),
									);
								} else if($data_element_column['id'] == $child_column['id']) {
									$query = "SELECT * FROM columns WHERE table_id = ".$data_element['table_id']." AND type = 0";
									$data_element_correct_column = $this->sql->get_row($query, 1);
									$this->relations[] = array(
										array($child['table_id'], $child_column['id']),
										array($data_element['table_id'], $data_element_correct_column['id'], true),
										//array($child['table_id'], 0),
									);
								}
								/*$query = "SELECT * FROM columns WHERE table_id = ".$data_element['table_id']." AND type = 0";
								$child_column = $this->sql->get_row($query, 1);
								//////////////var_dump($data_element_column['id'].' - '.$child_column['id']);
								if($data_element_column['id'] != $child_column['id']) {
									$this->relations[] = array(
										array($data_element['table_id'], $data_element_column['id']),
										//array($child['table_id'], 0),
										array($child['table_id'], $child_column['id'], true),
									);
								}*/
							} else {
								$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." AND type = 2";
								$child_column = $this->sql->get_row($query, 1);

								$query = "SELECT * FROM columns WHERE table_id = ".$data_element['table_id']." ORDER BY id DESC LIMIT 1";
								$data_element_column = $this->sql->get_row($query, 1);
								////////////var_dump($child_column);
								////////////var_dump($data_element_column);
								if($data_element_column['id'] != $child_column['id']) {
									////////////var_dump("inside4");
									$this->relations[] = array(
										array($data_element['table_id'], $data_element_column['id'], true),
										//array($child['table_id'], 0),
										array($child['table_id'], $child_column['id'], true),
									);
								} else {
									$query = "SELECT * FROM columns WHERE table_id = ".$child['table_id']." AND type = 1 AND foreign_table_id = ".$data_element['table_id'];
									$foreign_key_column = $this->sql->get_row($query, 1);
									$query = "SELECT * FROM columns WHERE table_id = ".$data_element['table_id']." AND type = 0";
									//////////////var_dump($query);
									$referenced_column = $this->sql->get_row($query, 1);
									//////////////var_dump($referenced_column);
									$this->relations[] = array(
										array($child['table_id'], $foreign_key_column['id']),
										array($data_element['table_id'], $referenced_column['id'], true),
										//array($child['table_id'], 0),
									);
								}
							}
						}
					} else if($child_base_schema) {
						/*if(!isset($this->additional_queries_relations[$child['id']])) {
							$this->additional_queries_relations[$child['id']] 
						}*/
						if(!isset($this->additional_queries_relations[$child['id']])) {
							$this->additional_queries_relations[$child['id']] = [];
						}
						if(!in_array($parent_table_name, $ignore_tables)) {
							$this->additional_queries_relations[$child['id']][] = array(
								array($data_element['table_id'], -1),
								array($child['table_id'], -1),
							);
						}
					} else if($base_schema && !$child_base_schema) {

					}
				} else {
					$this->self_sub_query = true;
					$query = "SELECT * FROM columns WHERE table_id = ".$data_element['table_id']." AND foreign_table_id = ".$data_element['table_id'];
					$this->self_sub_query_column = $this->sql->get_row($query, 1);
				}
				/*if($data_element_column != NULL) {

				}*/
			} else if($child['data_element_type_id'] == 3) {
				if(!isset($this->function_chain[$data_element['id']])) {
					$this->function_chain[$data_element['id']] = array();
				}
				$this->function_chain[$data_element['id']][] = $child;
			}
			if($traverse_child) {
				$this->find_relations($child);
			}
		}
		if(count($children) == 0) {
			$this->find_relations = array();
		}
	}
	private $self_sub_query = false;
	private $self_sub_query_column = NULL;

	private $additional_queries_relations = array();
	private $function_chain = array();

	function resolve_function_chain($data) {
		////////////////////var_dump($this->function_chain);
		$function_chain = new function_chain($data, $this->function_chain);
		return $function_chain->resolve();
	}

	function get_data_elements($element_id) {
		$result = array(
			'root' => array()
		);
		$tables = array();

		$query = "SELECT * FROM data_elements WHERE element_id = ".$element_id;
		$data_elements = $this->sql->get_rows($query, 1);
		////////////////////////////var_dump((($this->sql->get_last_query_string());
		foreach($data_elements as $data_element) {
			$parents = $data_element['parents'];
			$table_id = $data_element['table_id'];
			if($table_id != 0) {
				$tables[] = $table_id;
			}
			if($parents != NULL && $parents != "[]") {
				$parents = json_decode($parents, true);
				foreach($parents as $parent_id) {
					if(!isset($result[$parent_id])) {
						$result[$parent_id] = array();
					}
					$result[$parent_id][] = $data_element;
				}
			} else {
				$result['root'][] = $data_element;
			}
		}
		return array(
			'data_elements' => $result,
			'tables' => $tables
		);
	}

	function primary_order_column($relations) {
		$primary_column = NULL;
		$columns = [];
		foreach($relations as $relation_value) {
			if($relation_value[0][0] != 0) {
				if(!in_array($relation_value[0][1], $columns)) {
					$columns[] = $relation_value[0][1];
				}
			}
		}
		foreach($columns as $column) {
			$query = "SELECT name FROM columns WHERE id = ".$column." AND type != 2";
			$row = $this->sql->get_row($query, 1);
			if($row != NULL) {
				return $column;
			}
		}
		return NULL;
	}

	private $order_data = array();

	function query_pseudo_table($v, $relations, $deleted_flag=0) {
		foreach($this->add_post_data as $key => $value) {
			if(!isset($v[$key])) {
				$v[$key] = $value;
			}
		}
		//////////var_dump($this->relations);

		//////////////////var_dump($v);
		$_order_column = $this->order_data['order_column'];
		//////////////////var_dump($_order_column);
		//unset($v['order_column']);
		$_order_direction = $this->order_data['order_direction'];
		//////////////////var_dump($_order_drection);
		//unset($v['order_direction']);
		//unset($v['item_offset_limit']);


		//////////////////var_dump($v);
		/*$v = array(
			'order_column' => $order_column,
			'order_direction' => $order_direction,
			'offset' => $offset,
			'item_offset_limit' => $item_offset_limit
		);*/
		/*$query = "SELECT data_a.row_id as row_a, datab.row_id as row_b FROM 
					(SELECT p_values.*, columns.name FROM p_values, columns WHERE p_values.column_id = columns.id and columns.table_id = 1 GROUP BY p_values.row_id, columns.id) as data_a, 
					(SELECT p_values.*, columns.name FROM p_values, columns WHERE p_values.column_id = columns.id and columns.table_id = 2 GROUP BY p_values.row_id, columns.id) as data_b 
					WHERE data_a.value = data_b.value AND (data_a.name = 'a' AND data_b.name = 'c')";*/
		$query = "";
		$select_rows = array();
		$from_tables = array();
		$where_clauses = array();
		//$data_counter = 0;
		$table_index = array();
		$inverse_table_index = array();
		$counter = 0;
		$select_singular = false;
		////////////////////////////var_dump((("relations");
		//////////////////////////var_dump((($this->relations);
		$counter_a; //= 0;
		$counter_b; //= 0;
		$table_index_by_table = [];
		////////var_dump($relations);
		////////////////////var_dump($table_index);

		$connect_index = [];
		foreach($relations as $relation) {
			$column_relation_name = $relation[0][1];
			if(strpos($relation[0][1], ".") !== false) {
				$split = explode('.', $relation[0][1]);
				$table_name = $split[0];
				//echo "table_name:---\n";
				////var_dump($table_name);
				$query = "SELECT * FROM columns WHERE id = ".$relation[1][1];
				$column_row = $this->sql->get_row($query, 1, NULL, true);
				if($column_row['type'] == 2) {
					////var_dump($table_name);
					$query = "SELECT tables.* FROM tables, p_schemas WHERE tables.name = '".$table_name."' AND tables.schema_id = p_schemas.id AND p_schemas.application_id = ".$this->application_id."";
					////var_dump($query);
					$table_row = $this->sql->get_row($query, 1, NULL, true);
					/*if($table_row != NULL) {
						$query = "SELECT * FROM foreign_table_ids WHERE table_id = ".$table_row['id']." AND foreign_table_id = ".$column_row['id'];
						$connect_row = $this->sql
					}*/
					////var_dump($table_row);
					if($table_row['id'] != NULL) {
						$connect_index[$column_row['id']] = $table_row['id'];
					}
				}
			}
		}
		////var_dump("connect index");
		////var_dump($connect_index);

		foreach($relations as $relation) {
			//////////////////////////var_dump((($counter);
			////echo "relation:---\n";
			//////var_dump($relation);
			if(isset($relation[1])) { //&& $relation[1][1] != NULL
				if(!isset($table_index[$relation[1][1]])) { // 
					/*if($relation[1][1] == NULL) {
						$relation[1][1]
					}*/
					//////echo "relation_1:\n";
					////////////////////var_dump($relation[1][1]);
					$connect_relation_query_value = "";
					if(isset($connect_index[$relation[1][1]])) {
						$connect_relation_query_value = " AND p_values.connect_foreign_table_id = ".$connect_index[$relation[1][1]];
					}

					$select_rows[] = "data_".$counter.".row_id as row_".$counter;
					$from_tables[] = "(SELECT p_values.*, columns.name FROM p_values, columns WHERE p_values.deleted = ".$deleted_flag." AND p_values.column_id = columns.id and columns.id = ".$relation[1][1]." ".$connect_relation_query_value." GROUP BY p_values.row_id, columns.id ) as data_".$counter;
				
					$counter_b = $counter;
					if(!isset($table_index_by_table[$relation[1][0]])) {
						$table_index_by_table[$relation[1][0]] = [];
					}
					$table_index_by_table[$relation[1][0]][] = $counter_b;
					$table_index[$relation[1][1]] = $counter_b;
					$inverse_table_index["row_".$counter_b] = $relation[1][0];
					$counter++;
				} else {
					$counter_b = $table_index[$relation[1][1]];
				}
			}
			//////////////////////////var_dump((($counter);
			if($relation[0][0] == 0) {
				/*$elect_rows[] = "data_".$counter.".row id as row_".$counter;
				$counter++;*/
				if($relation[0][1] == 'global.user_id') {
					$where_clauses[] = "data_".$counter_b.".user_id = '".$this->global_post_data[$relation[0][1]]."'";
					//////////////////////////var_dump((('global_user_id set');
				} else if($relation[0][1] != -1 && $relation[0][1] != 'id') { // && strpos($relation[0][1], ".id") === false
					////////////////////////var_dump((($relation);
					////////////////////var_dump($v);
					if(isset($relation[0][3]) && isset($v[$relation[0][3]])) {
						$where_clauses[] = "data_".$counter_b.".value = '".$v[$relation[0][3]]."'";
					} else if(isset($v[$relation[0][1]])) {
						$where_clauses[] = "data_".$counter_b.".value = '".$v[$relation[0][1]]."'";
					} else {
						//////////////////////var_dump((($v);
						$where_clauses[] = "data_".$counter_b.".value = '".$v['id']."'";
					}
					////////////////////var_dump($where_clauses);
				} else {
					////////////////////////var_dump((($relation);
					////////////////////////var_dump((($v);
					if(isset($relation[0][3]) && isset($v[$relation[0][3]])) {
						////////////////////var_dump("inside");
						$where_clauses[] = "data_".$counter_b.".row_id = '".$v[$relation[0][3]]."'";
					} else if(isset($v[$relation[0][1]])) {
						////////////////////var_dump("inside");
						////////////////////var_dump($v);
						$where_clauses[] = "data_".$counter_b.".row_id = '".$v[$relation[0][1]]."'";
					} else {
						$where_clauses[] = "data_".$counter_b.".row_id = '".$v['id']."'";
					}
				}
			} else {
				if(!isset($table_index[$relation[0][1]])) {
					$select_rows[] = "data_".$counter.".row_id as row_".$counter;
					$from_tables[] = "(SELECT p_values.*, columns.name FROM p_values, columns WHERE p_values.deleted = ".$deleted_flag." AND p_values.column_id = columns.id and columns.id = ".$relation[0][1]." GROUP BY p_values.row_id, columns.id) as data_".$counter;
					$counter_a = $counter;
					if(!isset($table_index_by_table[$relation[1][0]])) {
						$table_index_by_table[$relation[1][0]] = [];
					}
					$table_index_by_table[$relation[0][0]][] = $counter_a;
					$table_index[$relation[0][1]] = $counter_a;
					$inverse_table_index["row_".$counter_a] = $relation[0][0];
					$counter++;
				} else {
					$counter_a = $table_index[$relation[0][1]];
				}

				if(isset($relation[0][2]) && $relation[0][2] == true) {
					$where_clauses[] = "data_".$counter_a.".row_id = data_".$counter_b.".value";
					if(isset($v['connect_value_table_id'])) {
						if(gettype($v['connect_value_table_id']) == 'string') {
							$where_clauses[] = "data_".$counter_b.".connect_foreign_table_id = ".$v['connect_value_table_id'];
							unset($v['connect_value_table_id']);
						} else {
							$where_clauses[] = "data_".$counter_b.".connect_foreign_table_id = ".$v['connect_value_table_id'][$relation[1][0]];
						}
					}
				} else if(isset($relation[1][2]) && $relation[1][2] == true) {
					$where_clauses[] = "data_".$counter_a.".value = data_".$counter_b.".row_id";
				} else {
					$where_clauses[] = "data_".$counter_a.".value = data_".$counter_b.".value"; //AND (data_".$counter_a.".name = 'a' AND data_".$counter_b.".name = 'c')";
				}
			}
			////////////var_dump($where_clauses);
			////////////////////var_dump($from_tables);
			//////////////////////////var_dump((($counter);
		}
		//foreach($where_clauses as $wher_cl
		foreach($table_index_by_table as $same_table_relation) {
			foreach($same_table_relation as $key => $table_id) {
				if(isset($same_table_relation[$key+1])) {
					$where_clauses[] = "data_".$table_id.".row_id = data_".$same_table_relation[$key+1].".row_id";
				}
			}

		}
		if(isset($v['__date_interval'])) {
			foreach($table_index as $table_id) {
				if(isset($v['__date_interval']['date_from']) && isset($v['__date_interval']['date_to'])) {
					$where_clauses[] = " data_".$table_id.".created BETWEEN '".$v['__date_interval']['date_from']."' AND '".$v['__date_interval']['date_to']."' "; 
				} else if(isset($v['__date_interval']['date_from'])) {
					$where_clauses[] = " data_".$table_id.".created > '".$v['__date_interval']['date_from']."' "; 
				} else if(isset($v['__date_interval']['date_to'])) {
					$where_clauses[] = " data_".$table_id.".created < '".$v['__date_interval']['date_to']."' "; 
				}
				////////////////////var_dump($where_clauses);
			}
		}
		//echo "from tables:\n";
		////var_dump($from_tables);
		////////////////var_dump($where_clauses);
		/*if(isset($v['id'])) {
			$select_singular = true;
		}*/
		$select_singular = $this->select_singular;
		$order_clause = NULL;
		if(count($relations) == 0) {
			/*$select_rows[] = "data_".$counter.".row id as row_".$counter;
			$from_tables[] = "(SELECT p_values.*, columns.name FROM p_values, columns WHERE p_values.column_id = columns.id and columns.table_id = ".$relation[1][1]." GROUP BY p_values.row_id, columns.id) as data_".$counter;*/
			$where_addition = " ";
			$excluded_columns = array(
				'modified',
				'created'
			);
			if(isset($_order_column) && $_order_column != NULL && $_order_column != 'id' && !in_array($_order_column, $excluded_columns) && strpos($_order_column, '.created') === false && strpos($_order_column, '.modified') === false) {
				$order_column_name = $_order_column;
				if(strpos($_order_column, ".") !== false) {
					$order_split = explode(".", $_order_column);

					$order_column_name = 'id';
					//if($order_split[0] == $table_name)
					$order_column_name = $order_split[1];
				}
				$where_addition = " AND columns.name = '".$_order_column."'";
			}
			//////////////////var_dump($where_addition);
			$query = "SELECT * FROM columns WHERE table_id = ".$this->data_elements['tables'][0].$where_addition." ORDER BY id DESC LIMIT 1";
			////////////////////var_dump($query);
			$column_row = $this->sql->get_row($query, 1);
			if(count($column_row) == 0) {
				$query = "SELECT * FROM columns WHERE table_id = ".$this->data_elements['tables'][0]." ORDER BY id DESC LIMIT 1";
				$column_row = $this->sql->get_row($query, 1);

			}
			$inverse_table_index['row_id'] = $this->data_elements['tables'][0];
			$select_rows[] = "p_values.row_id";
			$from_tables[] = "p_values";
			$where_clauses[] = " p_values.column_id = ".$column_row['id'];
			if(isset($v['id'])) {
				$where_clauses[] = " p_values.row_id = ".$v['id'];
				$select_singular = true;
			}
			////////////////////var_dump($where_clauses);
			//////////////////var_dump($_order_direction);
			//////////////////var_dump($_order_column);
			if(isset($_order_direction)) {
				if(isset($_order_column)) {
					$order_clause = " ORDER BY p_values.value ".$_order_direction;
				} else {
					$order_clause = " ORDER BY p_values.row_id ".$_order_direction;
				}
			}
		}
		//////////////////var_dump($order_clause);
		$offset = NULL;
		$item_offset_limit = NULL;
		$limit_clause = NULL;
		if(isset($v['offset'])) {
			$offset = $v['offset'];
			$item_offset_limit = 10;
			if(isset($v['item_offset_limit'])) {
				$item_offset_limit = $v['item_offset_limit'];
			}
			$limit_clause = " LIMIT ".$offset.", ".$item_offset_limit;
		}
		////////////////////var_dump($this->relations);
		$order_clause_post = false;//array();
		//$order_direction = $v['order_direction'];
		if(count($relations) > 0 && $order_clause == NULL && isset($_order_column)) {
			if(!isset($_order_direction)) {
				$_order_direction = ' DESC ';
			}

			$order_column = explode('.', $_order_column);
			$order_table = $order_column[0];
			$order_column = $order_column[1];
			if(strpos($_order_column, '.created') !== false || strpos($_order_column, '.modified') !== false) {
				$query = "SELECT tables.* FROM tables, p_schemas WHERE tables.name = '".$order_table."' AND tables.schema_id = p_schemas.id AND p_schemas.application_id = ".$this->application_id."";
				////////////////////var_dump($query);
				$order_table_row = $this->sql->get_row($query, 1);
				if(isset($table_index_by_table[$order_table_row['id']])) {
					$column_index_value = $table_index_by_table[$order_table_row['id']][0];
					$column_query_name = "data_".$column_index_value;
					$order_clause = " ORDER BY ".$column_query_name.".".$order_column." ".$_order_direction;
					////////////////////var_dump($order_clause);
				}
			} else if(strpos($_order_column, '.id') === false && $_order_column != 'id') {
				$query = "SELECT columns.* FROM columns, tables, p_schemas WHERE columns.name = '".$order_column."' AND columns.table_id = tables.id AND tables.schema_id = p_schemas.id AND p_schemas.application_id = ".$this->application_id." AND tables.name = '".$order_table."'";
				////////////////////var_dump($query);
				$column_ids = $this->sql->get_rows($query, 1);
				foreach($column_ids as $column_id) {
					////////////////////var_dump($column_id);
					////////////////////var_dump($table_index);
					if(isset($table_index[$column_id['id']])) {
						$column_index_value = $table_index[$column_id['id']];
						//$column_query_name = "data_".explode("row_", $column_index_value)[1];
						$column_query_name = "data_".$column_index_value;
						$order_clause = " ORDER BY ".$column_query_name.".value ".$_order_direction;
					} else {
						$order_clause_post = true;//[] = array($order_column, $v['order_direction']);//$column_id['id'];
					}
				}
				if(count($column_ids) == 0) {
					$order_clause_post = true;
				}
			} else {
				//$order_column_split = explode('.', $v['order_column']);
				/*$query = "SELECT columns.* FROM columns, tables, p_schemas WHERE AND columns.table_id = tables.id AND tables.schema_id = p_schemas.id AND p_schemas.application_id = ".$this->application_id." AND tables.name = '".$order_table."'";
				$column_ids = $this->sql->get_rows($query, 1);
				foreach($column_ids as $column_id) {
					if(isset($table_index[$column_id['id']])) {
						$column_index_value = $table_index[$column_id['id']];
						//$column_query_name = "data_".explode("row_", $column_index_value)[1];
						$column_query_name = "data_".$column_index_value;
						//$order_clause = " ORDER BY ".$column_query_name.".value ".$v['order_direction'];
						$order_clause = " ORDER BY ".$column_query_name.".row_id ".$v['order_direction'];
					}
				}*/
				$column_query_name = "data_0";
				if(isset($_order_direction)) {
					$order_clause = " ORDER BY ".$column_query_name.".row_id ".$_order_direction;
				} else {
					$order_clause = " ORDER BY ".$column_query_name.".row_id DESC";
				}
			}
			//////////////////////////////var_dump((($order_clause);
			//$order_clause = "ORDER BY ".$v['order_column'];
		} else {
			/*$primary_order_column = $this->primary_order_column($relations);
			//////////////////var_dump($primary_order_column);
			if($primary_order_column != NULL) {
				if(isset($table_index[$primary_order_column])) {
					$column_index_value = $table_index[$primary_order_column];
					////////////////////var_dump($column_index_value);
					$column_query_name = "data_".$column_index_value;
					if(isset($v['order_direction'])) {
						$order_clause = " ORDER BY ".$column_query_name.".row_id ".$v['order_direction'];
					} else {
						$order_clause = " ORDER BY ".$column_query_name.".row_id DESC";
					}
				}
			}*/
			if(count($relations) == 0) {
				$column_query_name = "p_values";
			} else {
				$column_query_name = "data_0";
			}
			if(isset($_order_direction)) {
				$order_clause = " ORDER BY ".$column_query_name.".row_id ".$_order_direction;
			} else {
				$order_clause = " ORDER BY ".$column_query_name.".row_id DESC";
			}
		}
		//////////////////var_dump($order_clause);
		////////////////////var_dump($select_rows);
		$query = "SELECT ".implode(", ", $select_rows)." FROM ".implode(", ", $from_tables);
		if(count($where_clauses) > 0) {
			$query .= " WHERE ".implode(" AND ", $where_clauses);
		}
		if($order_clause != NULL) {
			$query .= $order_clause;
		}
		if($limit_clause != NULL && !$order_clause_post) {
			$query .= $limit_clause;
		}
		////var_dump($this->relations);
		//var_dump($query);
		/*//////////////////var_dump($this->relations);
		//////////////////var_dump($result);*/
		////////////////////var_dump($this->relations);
		////////////////////var_dump($query);
		/*//////////////////////var_dump((($this->relations);
		//////////////////////var_dump((($from_tables);
		//////////////////////var_dump((($where_clauses);
		//$query .= " GROUP BY row_id";
		//////////////////////var_dump((("output query: ");
		//////////////////////var_dump((($query);*/
		$row_id_rows = $this->sql->get_rows($query, 1, NULL, true);
		//var_dump($row_id_rows);
		////////////////////var_dump($row_id_rows);
		//////////////////////////var_dump((($row_id_rows);
		////var_dump($row_id_rows);
		$result = [];
		foreach($row_id_rows as $row_ids) {
			$result_row = [];
			$add_row = true;
			if(isset($v['search_term'])) {
				$add_row = false;
			}
			foreach($row_ids as $column_id_index => $row_id) {
				/*$query = "SELECT * FROM columns WHERE id = ".$inverse_table_index[$column_id_index];
				////////////////////////////var_dump((($query);
				$column_row = $this->sql->get_row($query, 1);
				$table_id = $column_row['table_id'];*/
				$table_id = $inverse_table_index[$column_id_index];
				$query = "SELECT p_values.*, columns.name as column_name FROM p_values, columns WHERE  p_values.deleted = ".$deleted_flag." AND p_values.row_id = ".$row_id." AND p_values.column_id = columns.id AND columns.table_id = ".$table_id."";
				if($this->private_element) {
					$query .= " AND p_values.user_id = ".$this->_class->get_user_id();

				}
				//var_dump($query);
				//////////////////////////////var_dump((($query);
				$value_rows = $this->sql->get_rows($query, 1, NULL, true);
				$query = "SELECT name FROM tables WHERE id = ".$table_id;
				$table_name = $this->sql->get_row($query, 1, NULL, true)['name'];
				////////////////////var_dump($value_rows);
				
				foreach($value_rows as $value_row_key => $value_row_value) {
					$table_index = array_search($table_id, $this->data_elements['tables']);
					if($table_index == 0) {
						$result_row['id'] = $value_row_value['row_id'];
					}
					////////////////////var_dump($value_row_key);
					////////////////////var_dump($value_row_value['row_id']);
					$result_row[$table_name.".id"] = $value_row_value['row_id'];
					$result_row[$table_name.".".$value_row_value['column_name']] = $value_row_value['value'];
					if(!$add_row && strpos($value_row_value['value'], $v['search_term']) !== false) {
						$add_row = true;
					}
					if(!isset($result_row[$value_row_value['column_name']]) || $table_index == 0) {
						$result_row[$value_row_value['column_name']] = $value_row_value['value'];
					}
					if(!isset($result_row['created'])) {
						$result_row['created'] = $value_row_value['created'];
					}
					$result_row[$table_name.'.created'] = $value_row_value['created'];
					if(!isset($result_row['user_id'])) {
						$result_row['user_id'] = $value_row_value['user_id'];
					} else {
						$result_row[$table_name.'.user_id'] = $value_row_value['user_id'];
					}
					if(!isset($result_row['modified'])) {
						$result_row['modified'] = $value_row_value['modified'];
					}
					/*if(isset($result_row['modified'])) {
						$result_modified = new DateTime($result_row['modified']);
						$modified_value = new DateTime($value_row_value['modified']);
						if($modified_value > $result_modified) {*/
							$result_row[$table_name.'.modified'] = $value_row_value['modified'];
						/*}
					}*/
				}
			}
			if($add_row) {
				$result[] = $result_row;
			}
		}
		////////////////////var_dump($relations);
		//////var_dump($result);
		/*//////////////////////////var_dump((($query);
		//////////////////////////var_dump((("additional_queries");
		//////////////////////////var_dump((($this->additional_queries_relations);*/
		$additional_query = "";
		$remove_indicies = array();
		foreach($result as $result_key => $result_row) {
			$additional_from = [];
			$additional_where = [];

			foreach($this->additional_queries_relations as $additional_query_relations) {
				foreach($additional_query_relations as $additional_query_relation) {
					////////////////////////////var_dump((($additional_query_relation);
					$table_a = $additional_query_relation[0];
					$table_b = $additional_query_relation[1];
					$foreign_data = false;
					if($table_a[0] != 0) {
						$query = "SELECT * FROM tables WHERE id = ".$table_a[0];
						$table_a_row = $this->sql->get_row($query, 1);
					} else {
						$foreign_data = true;
					}
					//////////////////////////var_dump((($table_a[0]);
					//////////////////////////var_dump((($foreign_data);
					/*$query = "SELECT * FROM columns WHERE id = ".$table_a[1];
					$column_a_row = $this->sql->get_row($query, 1);*/

					$query = "SELECT * FROM tables WHERE id = ".$table_b[0];
					$table_b_row = $this->sql->get_row($query, 1);

					$table_b_public_name = $table_b_row['name'];
					if(isset($this->public_table_name_projection[$table_b_public_name])) {
						$table_b_public_name = $this->public_table_name_projection[$table_b_public_name];
					}
					$column_name_composite = $this->public_column_name_projection[$table_b_row['name']];

					$from_part = "app.".$table_b_public_name;
					if(!in_array($from_part, $additional_from)) {
						$additional_from[] = $from_part;
					}
					if(!$foreign_data) {
						$where = "app.".$table_b_public_name.".id = ".$result_row[$column_name_composite];
						if(!in_array($where, $additional_where)) {
							$additional_where[] = $where;
						}
					} else {
						$where = "app.".$table_b_public_name.".id = ".$v[$column_name_composite];
						if(!in_array($where, $additional_where)) {
							$additional_where[] = $where;
						}
					}
				}
				$query = "SELECT * FROM ".implode(",", $additional_from)." WHERE ".implode(" AND ", $additional_where);
				//////////////////////////var_dump((($query);
				/*$query;
				if(!$foreign_data) {
					$query = "SELECT * FROM app.".$table_b_public_name." WHERE id = ".$result_row[$column_name_composite];
				} else {
					$query = "SELECT * FROM app.".$table_b_public_name." WHERE id = ".$v[$column_name_composite];
					//////////////////////////var_dump((($query);
				}*/
				$intermediate_result = $this->sql->get_row($query, 1);
				//////////////////////////var_dump((("intermediate_result");
				//////////////////////////var_dump((($intermediate_result);
				if($intermediate_result == NULL) {
					$remove_indicies[] = $result_key;
				}
				foreach($intermediate_result as $intermediate_key => $intermediate_value) {
					if(!isset($result[$result_key][$intermediate_key])) {
						$result[$result_key][$intermediate_key] = $intermediate_value;
					}
					$result[$result_key][$table_b_row['name'].'.'.$intermediate_key] = $intermediate_value;
				}
			}
		}

		$offset = $this->order_data['offset'];
		//unset($v['offset']);
		$item_offset_limit = $this->order_data['item_offset_limit'];
		$v = array(
			'order_column' => $_order_column,
			'order_direction' => $_order_direction,
			'offset' => $offset,
			'item_offset_limit' => $item_offset_limit
		);


		foreach($remove_indicies as $remove_key) {
			array_splice($result, $remove_key, 1);
		}
		//////////////////var_dump($result);
		//////////////////var_dump($order_clause_post);
		if($order_clause_post) { /* pagination vesen */
			usort($result, function($a, $b) use ($v) {
				////////////////////var_dump($v['order_column']);
				/*if(strpos($v['order_column'], ".modified") !== false || strpos($v['order_column'], '.created') !== false) {
					////////////////////var_dump("inside");
					$result_modified = new DateTime($a[$v['order_column']]);
					$modified_value = new DateTime($b[$v['order_column']]);
					if($v['order_direction'] == 'DESC') {
						if($result_modified > $modified_value) {
							return 1;
						}
					} else {
						if($result_modified < $modified_value) {
							return 1;
						}
					}
					if($result_modified == $modified_value) {
						return 0;
					}
					return -1;
				}*/

				$strcmp = strcmp($a[$v['order_column']], $b[$v['order_column']]);
				////////////////////var_dump($v['order_direction']);
				if(trim($v['order_direction']) == 'DESC') {
					return -$strcmp;
				}
				return $strcmp;
			});
		}
		//////////////////var_dump($v);
		if(isset($v['offset'])) {
			//////////////////var_dump('offset----');
			$offset = $v['offset'];
			$item_offset_limit = 10;
			if(isset($v['item_offset_limit'])) {
				$item_offset_limit = $v['item_offset_limit'];
			}
			$result = array_slice($result, $offset, $item_offset_limit);
		}
		/*if($select_singular) {
			if(count($result) > 0) {
				$result =  $result[0];
			} else {
				$result = array();
			}
		}*/
		$this->select_singular = $select_singular;
		////////////////////var_dump($result);
		return $result;
	}

	private $select_singular = false;

	private $public_table_name_projection = array(
		'users' => 'users_public'
	);
	private $public_column_name_projection = array(
		'users' => 'user_id'
	);

	function query_table($v, $relations) {
		return NULL;
		$from_string = "";
		$counter = 0;
		foreach($this->data_elements['tables'] as $table) {
			if($counter > 0) {
				$from_string .= ", ";
			}
			$from_string .= $table." ";
			$counter++;
		}
		$query_string = "SELECT * FROM ".$from_string;
		if(count($relations) > 0) {
			$query_string .= " WHERE ";
			foreach($relations as $relation) {
				$query = "SELECT name FROM tables WHERE id = ".$relation[1][0];
				$table_b_row = $this->sql->get_row($query, 1);
				$query = "SELECT name FROM columns WHERE id = ".$relation[1][1];
				$column_b_column = $this->sql->get_row($query, 1);
				if($relation[0][0] != 0) {
					$query = "SELECT name FROM tables WHERE id = ".$relation[0][0];
					$table_a_row = $this->sql->get_row($query, 1);
					$query = "SELECT name FROM columns WHERE id = ".$relation[0][1];
					$column_a_column = $this->sql->get_row($query, 1);

					$query_string .= " ".$table_a_row['name'].".".$column_a_column['name']." = ".$table_b_row['name'].".".$column_b_column['name'];
				} else {
					$query_string .= " ".$table_b_row['name'].".".$column_b_column['name']." = '".$v[$relation[0][1]]."'";
				}
			}
		}
		return $this->sql->get_row($query, 1);
	}

}

?>