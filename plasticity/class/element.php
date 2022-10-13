<?

class element extends item {

	function idiagram($page_id) {
		$query = "SELECT elements.*, element_types.icon FROM elements, element_types WHERE elements.element_type_id = element_types.id AND page_id = ".$page_id;
		return $this->sql->get_rows($query, 1);
	}
	
	function _($v) {
		if(isset($v['parents'])) {
			$v['parents'] = json_encode($v['parents']);
		}
		if(isset($v['definition_addition'])) {
			var_dump($v['definition_addition']);
			/*$v['definition_addition'] = json_encode($v['definition_addition']);
			var_dump($v['definition_addition']);*/
		}

		return parent::_($v);
	}

	function get($id) {
		$row = parent::get($id);
		$row['title'] = $row['name'];
		//$row['definition_addition'] = json_decode($row['definition_addition'], true);
		return $row;
	}

	function table($search_term=NULL, $offset=0, $item_id=NULL, $post_data=NULL, $select_columns=NULL) {
		/*$rows = parent::table($search_term, $offset, $item_id, $post_data, $select_columns);
		foreach($rows as $key => $row) {

		}

		return $rows;*/

		$query = "SELECT elements.id, elements.name, element_types.icon, element_types.name as type FROM elements, element_types WHERE elements.element_type_id = element_types.id AND (element_types.content_element = 1 OR element_types.content_element = 3 OR element_types.content_element = 0) AND elements.element_type_id != 9 AND elements.element_type_id != 8 AND page_id = ".$item_id;
		$rows = $this->sql->get_rows($query, 1);
		$rows = $this->_class->get_order($rows, "elements");
		return $rows;
	}

	function list_count($post_data=NULL) {
		return -1;
	}

	function delete($id) {
		$query = "SELECT * FROM elements WHERE id = ".$id;
		$delete_node = $this->sql->get_row($query, 1);

		$page_id = $delete_node['page_id'];
		$query = "SELECT * FROM elements WHERE page_id = ".$page_id;
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