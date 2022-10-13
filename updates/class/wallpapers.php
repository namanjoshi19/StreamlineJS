<?

class wallpapers extends item {
	
	function list_($search_term=NULL, $offset=NULL) {
		$query = "SELECT image_name as image FROM wallpapers ORDER BY id DESC";
		return $this->sql->get_rows($query, 1);	
	}

	function images() {
		$result = [];
		$query = "SELECT image_name as image FROM wallpapers ORDER BY id DESC";
		foreach($this->sql->get_rows($query, 1) as $key => $row) {
			$result[] = array('id' => $key, 'image' => $row['image']);
		}
		return $result;
	}
}

?>