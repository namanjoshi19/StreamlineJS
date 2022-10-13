<?


class function_chain {

	private $data;
	private $chain;
	private $traversable_data;
	private $evaluation;

	function __construct($data, $chain) {
		$this->data = $data;
		$this->chain = $chain;
		//$this->evaluation = new \NumEval\evaluation(); //remove 
		//$this->evaluation->approximate_power_values = true;
		//var_dump($this->chain);
		$chain_result = array();
		$first_result = array();
		$last_result = array();

		//echo "-------chain-----:\n";
		//var_dump($chain);
		//echo "inspect:\n";

		$root_nodes = array();
		foreach($chain as $key => $chains) {
			$is_root_node = true;
			/*foreach($chains as $element) {
				$parents = $element['parents'];
				if($parents != NULL && strlen($parents) > 0) {
					$parents = json_decode($parents, true);
					$root_node = true;
					foreach($parents as $parent_id) {
						var_dump($parent_id);
						var_dump($chain[$parent_id]);
						if(isset($chain[$parent_id])) {
							$root_node = false;
						}
					}
					if($root_node) {
						$root_nodes[] = $element;
					}
				} else {
					$root_nodes[] = $element;
				}
			}*/
			foreach($chain as $key_b => $chains_b) {
				foreach($chains_b as $element) {
					if($element['id'] == $key) {
						$is_root_node = false;
					}
				}
			}
			if($is_root_node) {
				$root_nodes[] = $key;
			}

			//if(!isset($chain_result[$chain_value['id']])
		}
	//	echo "root_nodes:\n";
	//	var_dump($root_nodes);

		$chain_tree = array();

		foreach($root_nodes as $root_node) {
			//var_dump($root_node);
			$chain_tree = $this->assign_root_node($chain_tree, array('id' => $root_node, 'function' => ''), $chain);
			
		}
		//var_dump($chain_tree);
		$result_chain_tree = array();
		//var_dump(count($chain_tree));
		foreach($chain_tree as $key => $tree_root) {
			$result_chain_tree = array_merge($result_chain_tree, $this->set_order($tree_root['children']));
			//$chain_tree = $this->set_order(array_values($chain_tree)[0]['children']);
		}


		//$chain_tree = array('children' => $chain_tree);

		/*foreach($chain as $key => $chain_value) {
			$element = $chain_value;
			$chain_value = $chain_value['function'];
			if(strpos(trim(strrev($chain_value)), strrev(":first")) === 0) {
				$first_result[] = trim(substr(trim($chain_value), 0, -6));

			} else if(strpos(trim(strrev($chain_value)), strrev(":last")) === 0) {
				
				$last_result[] = trim(substr(trim($chain_value), 0, -5));
			
				//$last_result[] = $chain_value;
			} else {
				$chain_result[] = $chain_value;
			}
		}*/
		/*$this->chain = array_merge($first_result, $chain_result);
		$this->chain = array_merge($this->chain, $last_result);
		var_dump($this->chain);*/
		//var_dump($chain_tree);

		$this->chain = $this->flatten_tree($result_chain_tree);
		//var_dump($this->chain);
	}

	function flatten_tree($tree) {
		$result = array();
		foreach($tree as $node) {
			if($node['function'] != '') {
				$result[] = $node['function'];
			}
			$result = array_merge($result, $this->flatten_tree($node['children']));
		}
		return $result;
	}

	function assign_root_node($chain_tree, $root_node, $chain) {
		$chain_tree[$root_node['id']] = array('function' => $root_node['function'], 'children' => array());
		$children = $chain[$root_node['id']];
		unset($chain[$root_node['id']]);
		foreach($children as $child) {
			//var_dump("child object");
			//var_dump($child);
			//$child_addition = array($child['function'], 'children' => array());
			$chain_tree[$root_node['id']]['children'] = array_replace($chain_tree[$root_node['id']]['children'], $this->assign_root_node($chain_tree[$root_node['id']]['children'], $child, $chain));
		}
		return $chain_tree;
	}

	function set_order($tree_children) {
		$chain_result = array();
		$first_result = array();
		$last_result = array();
		foreach($tree_children as $key => $element) {
			//var_dump("set order element");
			//var_dump($element);
			$chain_value = $element['function'];
			$element['children'] = $this->set_order($element['children']);
			//var_dump("chain value");
			//var_dump($chain_value);
			if(strpos(trim(strrev($chain_value)), strrev(":first")) === 0) {
				//var_dump("inside");
				$first_result[] = array('function' => trim(substr(trim($chain_value), 0, -6)), 'children' => $element['children']);

			} else if(strpos(trim(strrev($chain_value)), strrev(":last")) === 0) {
				
				$last_result[] = array('function' => trim(substr(trim($chain_value), 0, -5)), 'children' => $element['children']);
				//if(isset($
				//$last_result[] = $chain_value;
			} else {
				$chain_result[] = array('function' => $chain_value, 'children' => $element['children']);
			}
		}
		$result = array_merge($first_result, $chain_result);
		$result = array_merge($result, $last_result);
		return $result;
	}

	private $current_chain_index = 0;

	function resolve() {
		if($this->current_chain_index >= count($this->chain)) {
			//return $this->data;
			return $this->format_numeric_values($this->data);
		}
		$current_function = $this->chain[$this->current_chain_index];

		$function = $current_function;
		$arguments = NULL;
		if(strpos($function, "{") !== false) {
			$function_split = explode("{", $function);
			$function = $function_split[0];
			$arguments = $function_split[1];
			$arguments = explode("}", $arguments)[0];
		}
		$function = trim($function);
		$function_string = $function;
		if(strpos($function, "count") === 0) {
			$function = 'count';
		}
		switch($function) {
			case 'unset':
				$arguments = explode(",", $arguments);
				foreach($arguments as $value) {
					$value = trim($value);
					if(isset($this->data[$value])) {
						unset($this->data[$value]);
					}
				}
				break;
			case 'count':
				if(strpos($function_string, ":") !== false) {
					//var_dump("inside");
					$output_split = explode(":", $function_string);
					$output_name = trim($output_split[1]);
					$arguments = trim($output_split[0]);
					$this->data[$output_name] = count($this->data);
				} else {
					$this->data = count($this->data);
				}
				break;
			case 'row_transform':
				if(strpos($arguments, ":") !== false) {
					$output_split = explode(":", $arguments);
					$output_name = trim($output_split[1]);
					$arguments = trim($output_split[0]);
					$this->data[$output_name] = $this->row_transform($this->data, $arguments);
				} else {
					$this->data = $this->row_transform($this->data, $arguments);
				}
				break;
			case 'where':
				if(strpos($arguments, ":") !== false) {
					$output_split = explode(":", $arguments);
					$output_name = trim($output_split[1]);
					$arguments = trim($output_split[0]);
					$intermediate_result = $this->where($this->data, $arguments);
					//echo "intermediate_result: \n";
					//var_dump($intermediate_result);
					$this->data[$output_name] = $intermediate_result;
				} else {
					$this->data = $this->where($this->data, $arguments);
				}
				//$this->data = Enumerable::from($this->data)->where($arguments)->toArrayDeep();
				break;
			case 'transform':
				//var_dump($this->data);
				//var_dump($arguments);
				$this->data = $this->transform($this->data, $arguments);
				break;
			case 'first':
				$this->data = $this->first($this->data);
				break;
			case 'reverse':
				$this->data = array_reverse($this->data);
				break;
		}
		$this->current_chain_index++;
		return $this->resolve();
	}

	function format_numeric_values($data) {
		if(!is_array($data)) {
			return $data;
		}
		if((count($data) == 2 && array_keys($data)[0] === 'value' && array_keys($data)[1] === 'remainder') || (array_keys($data)[2] === '_data_info' && array_keys($data)[0] === 'value' && array_keys($data)[1] === 'remainder')) {
			//return $this->evaluation->quick_numeric($data);
		}
		foreach($data as $key => $value) {
			$data[$key] = $this->format_numeric_values($value);
		}
		return $data;
	}

	function format($array, $conditions) {
		//use escape character or &apos; for single quote
		$conditions = "x.comments, x.vote_count;'_'x.voted_count;'__result' : value_d";
	}

	/*function format_date($array, $conditions) {
		$conditions = "x.date, x.day', 'x.month'. 'x.year";
	}*/

	function row_transform($rows, $conditions) {
		//echo "row_transform:\n";
		//var_dump($conditions);
		$conditions_split = explode(",", $conditions);

		$from_y = NULL;
		if(count($conditions_split) == 2) {
			$from = trim($conditions_split[0]);
			//var_dump($from);

			$conditions = trim($conditions_split[1]);
		} else {
			$from_y = trim($conditions_split[0]);
			$from = trim($conditions_split[1]);
			$conditions = trim($conditions_split[2]);
		}
		//var_dump($from);
		//var_dump($rows);
		/*
		$sum = 0;
		foreach($from_array as $value) {

		}*/
		/*if($constrain != NULL) {
			$constrain_split = explode(",", $constrain);
		}*/
		if($from_y != NULL) {
			$from_y = "x.".substr($from_y, 2);
			$rows = $this->from_array($rows, $from_y);
		}
		/*echo "from_y:\n";
		var_dump($from_y);
		echo "rows:\n";
		var_dump($rows);*/

		//$transformation_resolution = $this->resolve_transformation_value($conditions);
		//$variables_list = $transformation_resolution['variables_list'];
		$total_value = 0;//array('value' => '0', 'remainder' => '0/1');
		//var_dump($rows);
		foreach($rows as $key => $array) {
			//var_dump($array);
			$from_array = $this->from_array($array, $from);
			if($from_array != NULL) {
				//echo "from_array:\n";
				//var_dump($from_array);
				switch($conditions) {
					case 'sum':
						$value = $from_array; //$this->evaluation->whole_common_string($from_array, true);
						$total_value = $value + $total_value;//$this->evaluation->add_total($value, $total_value);
						break;
				}
			}
		}
		//var_dump($total_value);
		return $total_value;
	}

	function where($array, $conditions) {
		/*$array = array(
			'comments' => array(
				array(
					'vote_count' => 4,
					'voted_count' => 3
				),
				array(
					'vote_count' => 0,
					'voted_count' => 0
				),
				array(
					'vote_count' => 0,
					'voted_count' => 5
				),
				array(
					'vote_count' => 2,
					'voted_count' => 0
				),
				array(
					'vote_count' => -1,
					'voted_count' => 1
				),
				array(
					'vote_count' => -1,
					'voted_count' => 0
				)
			)
		);
		$conditions = "x.comments, ((x.vote_count; < 0 and x.voted_count; >= 1) or (x.vote_count; = 0 and x.voted_count; = 0 or x.vote_count; = 2))";*/ //x er main array, i x.comments velja thar sem vote_count > 3
		$conditions_split = explode(",", $conditions);

		$from = trim($conditions_split[0]);
		//echo "array:\n";
		//var_dump($array);
		$from_array = $this->from_array($array, $from);
		//echo "from_array:\n";
		//var_dump($from_array);
		$logic_parse = new logic_parse($conditions_split[1]);

		$logic_parse->parse();

		//echo "from_array:\n";
		//var_dump($from_array);

		//foreach($from_array as $key => $value) {
		$logic_parse->resolve($from_array);
		//}
		//var_dump($from_array);
		//$array = $this->set_array($array, $from_array, $from);

		return $from_array;
	}

	function set_array(&$array, $set_array, $from) {
		$from_array = &$array;
		$from_list = array();
		if($from == 'x') {
			return $set_array;
		} else {
			$from_split = explode(".", $from);
			foreach($from_split as $key => $from_index) {
				if($key == 0 && $from_index == 'x') {

				} else {
					$from_list[] = $from_index;
				}
			}
			foreach($from_list as $key => $from_index) {
				if($key == count($from_list)-1) {
					$from_array[$from_index] = $set_array;
				} else {
					try {
						$from_array = &$from_array[$from_index];
					} catch(Exception $exception) {
						return $array;
					}
				}
			}
		}
		return $array;
	}	

	private $nested_parent = false;

	function from_array(&$array, $from) {
		$from_array = &$array;
		//var_dump($from_array);
		if(strpos($from, "parent.") !== false) {
			$from = substr(trim($from), 7);
			$from_array = array($from_array);
			//var_dump("inside1");
			$this->nested_parent = true;
		}
		$from_list = array();
		if($from == 'x') {
		} else {
			$from_split = explode(".", $from);
			foreach($from_split as $key => $from_index) {
				/*if($from_index == '__first') {
					$from_list
				} else*/
				if(strpos($from_index, "@") !== false) {
					$from_index = explode("@", $from_index);
					$from_index = implode(".", $from_index);
				}
				if($key == 0 && $from_index == 'x') {

				} else {
					$from_list[] = $from_index;
				}
			}
			foreach($from_list as $from_index) {
				try {
					//var_dump($from_array);
					//var_dump($from_index);
					if($from_index == '__first') {
						//var_dump("inside---");
						//var_dump($from_index);
						$from_array = &$from_array[0];
					} else {
						$from_array = &$from_array[$from_index];
					}
				} catch(Exception $exception) {
					return $array;
				}
			}
		}
		return $from_array;
	}

	function resolve_transformation_value($transformation) {
		$transformation = explode(",", $transformation);

		$from = trim($transformation[0]);

		$transformation = trim($transformation[1]);

		$transformation_split = explode(":", $transformation);
		$transformation = trim($transformation_split[0]);

		$output_name = trim($transformation_split[1]);

		$transformation_variable_split = explode("x.", $transformation);
		$variable_list = array();
		$whole_string = array();
		$singular_value = false;
		if(gettype($array) != 'array') {
			$singular_value = true;
		}
		foreach($transformation_variable_split as $key => $value) {
			/*if(strpos($value, ".") === 0) {
				$value = substr($value, 1);
			}*/
			if($value == ";") {
				$variable_list[] = "x";
				$whole_string[] = "x";
			} else if(strpos($value, ";") !== false) {
				$variable_name_split = explode(";", $value);
				$variable_list[] = $variable_name_split[0];
				$whole_string[] = $variable_name_split[0];
				$whole_string[] = $variable_name_split[1];
			} else {
				$whole_string[] = $value;
			}
		}

		return array(
			'from' => $from,
			'variable_list' => $variable_list
		);
	}

	function transform($array, $transformation) {
		/*$array = array(
			'income' => array(
				array('a' => 1, 'b' => 2),
				array('a' => "3+(2/10)", 'b' => "2+(1/2)"),
				array('a' => 1.1, 'b' => -2),
				array('a' => 1, 'b' => 3),
			)
		);
		//$transformation = "x.comments, (x.vote_count*3-2)*x.voted_count";
		$transformation = "x.income, ((x.a;*3-2)*x.b;)^(2/3) : value_c";*/
		$unaltered_transformation = $transformation;
		$transformation = explode(",", $transformation);

		$from = trim($transformation[0]);

		$transformation = trim($transformation[1]);

		$transformation_split = explode(":", $transformation);
		$transformation = trim($transformation_split[0]);

		$output_name = trim($transformation_split[1]);

		$transformation_variable_split = explode("x.", $transformation);
		$variable_list = array();
		$whole_string = array();
		$singular_value = false;
		if(gettype($array) != 'array') {
			$singular_value = true;
		}
		foreach($transformation_variable_split as $key => $value) {
			if(strpos($value, ".") === 0) {
				$value = substr($value, 1);
			}
			if($value == ";") {
				$variable_list[] = "x";
				$whole_string[] = "x";
			} else if(strpos($value, ";") !== false) {
				$variable_name_split = explode(";", $value);
				//$variable_name_split[0] = implode(".", explode("@", $variable_name_split[0]));
				$variable_list[] = $variable_name_split[0];
				$whole_string[] = $variable_name_split[0];
				$whole_string[] = $variable_name_split[1];
			} else {
				$whole_string[] = $value;
			}
		}
		//var_dump($variable_list);
		//var_dump($array);
		/*if(count($variable_list) == 0) {
			$transformation_variable_split = explode("x;", $transformation);

			foreach($transformation_variable_split as $key => $value) {

			}
		}*/
		//var_dump($from);
		$from_array = &$array;
		$from_list = array();
		if(strpos($from, "parent.") !== false) {
			$from = substr(trim($from), 7);
			$from_array = array($from_array);
			//var_dump("inside1");
			$this->nested_parent = true;
		}
		if($from == 'x') {
		} else {
			$from_split = explode(".", $from);
			foreach($from_split as $key => $from_index) {
				if($key == 0 && $from_index == 'x') {

				} else {
					$from_list[] = $from_index;
				}
			}
			foreach($from_list as $from_index) {
				try {
					$from_array = &$from_array[$from_index];
				} catch(Exception $exception) {
					return $array;
				}
			}
		}
		if(!$singular_value) {
			foreach($from_array as $key => $x) {
				$array_values = [];
				//var_dump($variable_list);
				foreach($variable_list as $variable_key => $variable_name) {
					$array_values[$variable_name] = $x[$variable_name];
				}
				//var_dump($variable_list);
				//var_dump($array_values);
				$string_value_result = "";
				//var_dump($whole_string);
				foreach($whole_string as $string_value) {
					//var_dump($string_value);
					//var_dump($array_values[$string_value]);
					if(isset($array_values[$string_value])) {
						$string_value_result .= $array_values[$string_value]; //"(".$this->evaluation->whole_common_string($array_values[$string_value]).")";
					} else {
						$string_value_result .= $string_value;
					}
				}
				//var_dump($string_value_result);
				/*$value = "1|(0/1)";
				var_dump($unaltered_transformation);
				var_dump($string_value_result);*/
				$value = eval("return ".$string_value_result);
				//$value = $evaluation_parse->parse();

				//var_dump($value);
				$from_array[$key][$output_name] = $value;//$this->format_common($value);
			}
		} else {
			$x = $array;
			$array_values = [];
			//var_dump($variable_list);
			//var_dump($array_values);
			foreach($variable_list as $variable_key => $variable_name) {
				$array_values[$variable_name] = $x;
			}
			$string_value_result = "";
			foreach($whole_string as $string_value) {
				//var_dump($string_value);
				if(isset($array_values[$string_value])) {
					$string_value_result .= $array_values[$string_value]; //"(".$this->evaluation->whole_common_string($array_values[$string_value]).")";
				} else {
					$string_value_result .= $string_value;
				}
			}
			//var_dump($string_value_result);
			

			/*$evaluation_parse = new \NumEval\evaluation_parse($string_value_result, $this->evaluation);
			$value = $evaluation_parse->parse();*/
			$value = eval("return ".$string_value_result);

			//$value = "1|(0/1)";

			//var_dump($value);
			$array = $value;//$this->format_common($value);
			//$from_array[$key][$output_name] = $this->format_common($value);
		}
		if($this->nested_parent) {
			//var_dump("inside");
			$this->nested_parent = false;
			return $array[0];
		}
		return $array;
	}

	private $real_fraction_flag = true;
	private $maximum_decimal_value = 100;
	private $fraction_decimal_points = 15;

	function format_common($value) {
		/*if(strpos($value, "|") !== false) {
			$var_result = $value;//$this->variable_results[$variable_name];
			if(strpos($var_result, "|") !== false) {
				$var_split = explode("|", $var_result);
				$fraction_values = $this->evaluation->fraction_values($var_split[1]);
				if($fraction_values[0] != 0) {
					if(!$this->real_fraction_flag || strlen($fraction_values[0]) > $this->maximum_decimal_value || strlen($fraction_values[1]) > $this->maximum_decimal_value) {
						$var_result = $var_split[0]."+(".$var_split[1].")";		
					} else {
						$var_result = $this->evaluation->quick_numeric(array('value' => $var_split[0], 'remainder' => $var_split[1]), $this->fraction_decimal_points);
					}
				} else {
					$var_result = $var_split[0];	
				}
			}
			//$var_result = "(".$var_result.")";
			return $var_result;
		} else {
			return $value;	
		}*/
		return $value;
	}
	
	function first($data) {
		if(count($data) > 0) {
			return $data[0];
		}
		return $data;
	}

	/*
		-Performance improvement parsea transformation bara einu sinni og geyma array med function calls og beita thvi a array
	*/
}

?>