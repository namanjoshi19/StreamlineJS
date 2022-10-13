<?

class data_element extends item {

	function idiagram($element_id) {
		$query = "SELECT data_elements.*, data_element_types.icon FROM data_elements, data_element_types WHERE data_elements.data_element_type_id = data_element_types.id AND data_elements.element_id = ".$element_id;
		return $this->sql->get_rows($query, 1);
	}
	
	function _($v) {
		if(isset($v['parents'])) {
			$v['parents'] = json_encode($v['parents']);
		}

		return parent::_($v);
	}

	function get($id) {
		$row = parent::get($id);
		$row['title'] = $row['name'];
		//$row['definition_addition'] = json_decode($row['definition_addition'], true);
		return $row;
	}

	function delete($id) {
		$query = "SELECT * FROM data_elements WHERE id = ".$id;
		$delete_node = $this->sql->get_row($query, 1);

		$element_id = $delete_node['element_id'];
		$query = "SELECT * FROM data_elements WHERE element_id = ".$element_id;
		$nodes = $this->sql->get_rows($query, 1);
		foreach($nodes as $node) {
			$parents = json_decode($node['parents'], true);
			if($parents != NULL && in_array($id, $parents)) {
				array_splice($parents, array_search($id, $parents), 1);
				$v = array(
					'id' => $node['id'],
					'parents' => $parents
				);
				$this->_($v);
			}
		}

		parent::delete($id);
	}

}

?>