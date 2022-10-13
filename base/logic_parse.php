<?

class logic_parse {

	private $statement;

	function __construct($statement) {
		$this->statement = $statement;
	}

	private $logic_parse_nodes = [];

	function parse() {
		$statement = $this->statement;

		$root_node = new logic_parse_node(NULL);
		$this->logic_parse_nodes[] = $root_node;


		/*$child_node = new logic_parse_node($root_node);
		$root_node->add_child($child_node);
		$root_node = $child_node;*/

		$current_node = $root_node;

		$altered_digits = array();
		$digits = str_split($statement);
		foreach($digits as $key => $digit) {
			$altered_digits[] = $digit;
			if($digit == "(" || $digit == ")") {
				$altered_digits[] = " ";
			}
			$next_digit = NULL;
			if(isset($digits[$key+1])) {
				$next_digit = $digits[$key+1];
				if($next_digit == ")") {
					$altered_digits[] = " ";
				}
			}
		}
		$crawl_up = false;
		$atoms = explode(" ", implode("", $altered_digits));
		$next_operator = NULL;
		foreach($atoms as $key => $atom) {
			//var_dump($atom);
			if($atom == "(") {
				$child_node = new logic_parse_node($current_node);
				$current_node->add_child($child_node);
				$current_node = $child_node;
				$child_node = new logic_parse_node($current_node);
				$current_node->add_child($child_node);
				$current_node = $child_node;
			} else if(in_array($atom, $this->inner_operators)) {
				$current_node->set_operator($atom);
			} else if(in_array($atom, $this->outer_operators)) {
				if($crawl_up) {

					if($next_operator != NULL) {
						$current_node->set_outer_operator($next_operator);
						$next_operator = NULL;
					}
					//var_dump("get parent");
					if($current_node->get_parent() != NULL) {
						//var_dump("get parent2");
						$current_node = $current_node->get_parent();
					}
					$crawl_up = false;
					$next_operator = $atom;
				} else {
					$current_node->set_outer_operator($atom);
				}
			} else if($atom == ")") {
				$current_node = $current_node->get_parent();
				if($next_operator != NULL) {
					$current_node->set_outer_operator($next_operator);
					$next_operator = NULL;
				}
				$crawl_up = true;
			} else if($atom != "") {
				$count = $current_node->add_variable($atom);	//if atom contains x. is variable else is constant
				$next_atom = NULL;
				if(isset($atoms[$key+1])) {
					$next_atom = $atoms[$key+1];
				}
				if($count == 2 && ($next_atom != ")" || $next_atom == NULL)) {
					$current_parent = $current_node->get_parent();
					$child_node = new logic_parse_node($current_parent);
					$current_parent->add_child($child_node);
					$current_node = $child_node;
				}
			} else {
				
			}
		}
		//var_dump($root_node);
		/*if($crawl_up) {

			if($next_operator != NULL) {
				$current_node->set_outer_operator($next_operator);
				$next_operator = NULL;
			}
			var_dump("get parent");
			if($current_node->get_parent() != NULL) {
				var_dump("get parent2");
				$current_node = $current_node->get_parent();
			}
			$crawl_up = false;
			$next_operator = $atom;
		}*/ 

		//var_dump($root_node);
	}

	private $inner_operators = array('<', '>', '=', '<=', '>=', '!=');
	private $outer_operators = array('and', 'or');

	private $current_values = NULL;

	function resolve(&$values_array) {
		$remove_indicies = array();
		//var_dump($values_array);
		foreach($values_array as $key => $values) {
			$root_node = $this->logic_parse_nodes[0];
			$this->current_values = $values;
			//var_dump($values);
			$keep_row = $this->resolve_sub($root_node);
			//var_dump($keep_row);
			//echo "keep_row---\n";
			//var_dump($keep_row);
			if(!$keep_row) {
				$remove_indicies[] = $key;
			}
		}
		foreach($remove_indicies as $remove_index) {
			//var_dump($remove_index);
			unset($values_array[$remove_index]);
		}
		return true;
	}

	private $builtin_constants = array('true', 'false');

	private $tab_index = 0;

	private function debug_tab($tab_index) {
		$counter = 0;
		$result = "\t";
		while($counter <= $tab_index) {
			$result .= "\t";
			$counter++;
		}
		return $result;
	}

	function resolve_sub($node, $tab_index=0) {
		//echo "--".$tab_index."\n";
		//var_dump($node->get_variables());
		$intermediate_results = [];
		$children = $node->get_children();
		//var_dump(count($children));
		foreach($children as $child) {
			$intermediate_results[] = $this->resolve_sub($child, $tab_index+1);
		}
		//echo $this->debug_tab($tab_index)."intermediate_result: \n";
		//var_dump($intermediate_results);
		$variables = $node->get_variables();
		if(count($variables) > 0) {
			foreach($variables as $key => $variable) {
				if(in_array($variable, $this->builtin_constants)) {
					if($variable == 'true') {
						$variables[$key] = true;
					} else {
						$variables[$key] = false;
					}
				} else if(strpos($variable, "x.") !== false) {
					$variable = substr($variable, 2);
					$variable = substr($variable, 0, strlen($variable)-1);
					if(isset($this->current_values[$variable])) {
						$variables[$key] = $this->current_values[$variable];
					}
				}
			}
			$intermediate_result = true;
			switch($node->get_inner_operators()[0]) {
				case '=':
					if($variables[0] != $variables[1]) {
						$intermediate_result = false;
					}
					break;
				case '!=':
					if($variables[0] == $variables[1]) {
						$intermediate_result = false;
					}
					break;
				case '>':
					if($variables[0] <= $variables[1]) {
						$intermediate_result = false;
					}
					break;
				case '<':
					if($variables[0] >= $variables[1]) {
						$intermediate_result = false;
					}
					break;
				case '>=':
					if($variables[0] < $variables[1]) {
						$intermediate_result = false;
					}
					break;
				case '=<':
					if($variables[0] > $variables[1]) {
						$intermediate_result = false;
					}
					break;
			}
			/*var_dump($node->get_inner_operators()[0]);
			var_dump($variables);
			var_dump($intermediate_result);*/
			return $intermediate_result;
		} else {
			/*switch($node->get_outer_operator) {
				'or':
					if($intermediate_result[0] || $intermediate_result[1]) {
						return true;
					}
					break;
				'and':
					if($intermediate_result[0] && $intermediate_result[1]) {
						return true;
					}
					break;
			}*/
			$last_child = NULL;
			$last_value = NULL;
			$intermediate_result_value = $intermediate_results[0];
			//echo $this->debug_tab($tab_index)."primary__intermediate_result: \n";
			//var_dump($intermediate_result_value);
			$last_outer_operator = NULL;
			foreach($intermediate_results as $key => $value) {
				$child = $children[$key];
				/*$next_child = NULL;
				if(isset($intermediate_results[$key+1])) {
					$next_child = $children[$key+1];
				}*/
				//if($next_child != NULL) {
					$operator = $child->get_outer_operator();
					/*if($operator == 'unset') {
						$operator = $last_outer_operator;
					}*/
					switch($child->get_outer_operator()) {
						case 'or':
							/*if(!$value && !$last_value) {
								$intermediate_result_value = false;
							}*/
							if($value || $intermediate_result_value) {
								$intermediate_result_value = true;
							}
							break;
						case 'and':
							if(!$value || !$intermediate_result_value) {
								$intermediate_result_value = false;
							}
							break;
					}
					//echo $this->debug_tab($tab_index)."intermediate_result: --".$tab_index." \n";
					//var_dump($intermediate_result_value);
				//}	
				//$last_child = $child;
				//$last_value = $value;
				/*var_dump('child');
				var_dump($value);
				var_dump($last_value);
				var_dump($child->get_outer_operator());*/
				/*var_dump($child->get_outer_operator());
				var_dump($intermediate_result_value);*/
				$last_outer_operator = $child->get_outer_operator();
			}
			//echo $this->debug_tab($tab_index)."final_result:  --".$tab_index."\n";
			//var_dump($intermediate_result_value);
			return $intermediate_result_value;
		}
		return false;
	}
}

?>