<?

class logic_parse_node {

	private $parent;
	private $children = [];
	private $variables = [];
	private $inner_operators = [];
	private $outer_operator = 'and';

	function __construct($parent) {
		$this->parent = $parent;
	}

	function add_child($child) {
		$this->children[] = $child;
	}

	function set_operator($operator) {
		$this->inner_operators[] = $operator;
	}

	function set_outer_operator($operator) {
		$this->outer_operator = $operator;
	}

	function add_variable($variable) {
		$this->variables[] = $variable;
		return count($this->variables);
	}

	function get_parent() {
		return $this->parent;
	}

	function get_children() {
		return $this->children;
	}

	function get_inner_operators() {
		return $this->inner_operators;
	}

	function get_outer_operator() {
		return $this->outer_operator;
	}

	function get_variables() {
		return $this->variables;
	}

}

?>