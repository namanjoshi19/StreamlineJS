<?

class updates extends _class {
	/*protected $sql;
	protected $statement;
	protected $user_id;*/
	
	private $list_start = 5;
	
	public $items;
	
	public $function_access = array(
		'admin' => array(
			'_*',
			'delete_*'
		)
	);
	
	function __construct($sql, $statement, $user_id) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
		
		$this->items = array();
		$this->items["wallpapers"] = new wallpapers("wallpaper", "wallpapers", $this, false);
	}
	
	function get_state() {
		return array(
		);	
	}
	
	function get_updates() {
		
	}
	
	/*function reference_type($reference_type) {
		switch($reference_type) {
			case 'article':
				$reference_type = 0;
				break;
		}
		return $reference_type;	
	}*/
	
	function software_updates_list($search_term='', $offset=0) {
		$search_query_string = "";
		if($search_term != '') {
			$search_query_string = "AND (app.app.name LIKE '%".$search_term."%' OR software_updates.release_notes LIKE '%".$search_term."%' OR software_updates.version LIKE '%".$search_term."%')";
		}
		
		$query = "SELECT app.apps.name as title, software_updates.* FROM software_updates, app.apps WHERE software_updates.app_id = app.apps.id ".$search_query_string." ORDER BY software_updates.id DESC";
		$rows = $this->sql->get_rows($query, 1);	
		foreach($rows as $key => $row) {
			/*$rows[$key]["mac_download"] = $row['title']."_".$row['version']."_mac.zip";
			$rows[$key]["win_download"] = $row['title']."_".$row['version']."_windows.zip";
			
			if($row['custom_download_link']	!= NULL) {
				$rows[$key]['mac_download'] = $row['custom_download_link'];
				$rows[$key]['win_download'] = $row['custom_download_link'];	
			}*/
			//unset($rows[$key]['win_download']);
			$download_prefix = '';		
			if(strpos($rows[$key]["mac_download"], "http") === false) {
				$download_prefix = '/downloads/';
			}
			if($rows[$key]['win_download'] == '' || $rows[$key]['win_download'] == '-') {
				unset($rows[$key]['win_download']);
			} else {		
				$rows[$key]["win_download"] = "<a href='".$download_prefix.$rows[$key]["win_download"]."'>".$rows[$key]["win_download"]."</a>";
			}

			$rows[$key]["mac_download"] = "<a href='".$download_prefix.$rows[$key]["mac_download"]."'>".$rows[$key]["mac_download"]."</a>";
			//$rows[$key]["win_download"] = "<a href='/downloads/".$rows[$key]["win_download"]."'>".$rows[$key]["win_download"]."</a>";
			/*if($row['win_download'] == NULL) {
				unset($rows[$key]['win_download']);	
			}
			if($row['mac_download'] == NULL) {
				unset($rows[$key]['mac_download']);	
			}*/
			/*if($row['play_store_link'] != NULL) {				
				$rows[$key]["play_store_link"] = "<a href='/downloads/".$rows[$key]["play_store_link"]."'>Play Store</a>";
			}
			if($row['mac_store_link'] != NULL) {
				$rows[$key]['mac_download'] = "<a href='".$row['mac_store_link']."'>App Store</a>";	
			}
			if($row['win_store_link'] != NULL) {
				$rows[$key]['win_download'] = "<a href='".$row['win_store_link']."'>Microsoft Store</a>";	
			}
			unset($rows[$key]['mac_store_link']);
			unset($rows[$key]['win_store_link']);
			unset($rows[$key]['app_id']);
			unset($rows[$key]['custom_download_link']);
			if($row['play_store_link'] == NULL) {
				unset($rows[$key]['play_store_link']);
			}*/
		}
		return $rows;
	}
	
	function get_software_update_item($app_id) {
		$query = "SELECT custom_download_link, mac_store_link, win_store_link, play_store_link FROM software_updates WHERE app_id = ".$app_id." ORDER BY id DESC LIMIT 1";
		return $this->sql->get_row($query, 1);	
	}
	
	function news_list($search_term, $offset) {
		$query = "SELECT * FROM news ORDER BY id DESC";
		return $this->sql->get_rows($query, 1);	
	}
	
	function news_table($search_term, $offset) {
		$query = "SELECT * FROM news ORDER BY id DESC";
		return $this->sql->get_rows($query, 1);	
	}
	
	function get_app_select() {
		$query = "SELECT id as id, name as title FROM app.apps ORDER BY id DESC";
		return $this->sql->get_rows($query, 1);	
	}
	
	function _software_update($v) {
		$this->statement->generate($v, "software_updates");
		$this->sql->execute($this->statement->get());
		$id = $this->sql->last_id($v);	
		return $id;
	}
	
	function _new($v) {
		$this->statement->generate($v, "news");
		$this->sql->execute($this->statement->get());
		$id = $this->sql->last_id($v);	
		return $id;
	}
	
	function get_article($id) {
		$query = "SELECT * FROM news WHERE id = ".$id;
		return $this->sql->get_row($query, 1);	
	}
	
	function get_software_update($id) {
		$query = "SELECT app.apps.name as title, software_updates.* FROM software_updates, app.apps WHERE software_updates.app_id = app.apps.id AND software_updates.id = ".$id;
		$row = $this->sql->get_row($query, 1);
		$row['mac_download'] = "<a href='/downloads/".$row['mac_download']."'>macOS download</a>";
		if($row['win_download'] == '' || $row['win_download'] == '-') {
			unset($row['win_download']);
		} else {
			$row['win_download'] = "<a href='/downloads/".$row['win_download']."'>Windows download</a>";
		}
		return $row;
	}	
	
	/*function top_articles_list($search_term, $offset, $category_id=-1, $source=NULL, $date=NULL) {
		$append = "";
		if($category_id != -1) {
			$append = " AND category_id = ".$category_id;
		}
		if($source != NULL) {
			$append .= " AND source = '".trim($source)."'";	
		}
		if($date != NULL) {
			$append .= " AND created BETWEEN '".$date." 00:00:01' AND '".$date." 23:59:59'";	
		}
		$search_term = strtolower($search_term);
		if(trim($search_term) != "") {
			$append = " AND (articles.title LIKE '%".$search_term."%' OR articles.link LIKE '%".$search_term."%' OR articles.description LIKE '%".$search_term."%')";	
		}
		$query = "SELECT articles.*, categories.title as category, categories.id as category_column_value, app.users.email as user, articles.user_id as user_column_value FROM articles, categories, app.users WHERE articles.user_id = app.users.id AND articles.category_id = categories.id".$append." ORDER BY created DESC";
		$rows = $this->sql->get_rows($query, 1, NULL, true);
		foreach($rows as $key => $row) {
			$rows[$key]['comments'] = "12 comments";
			$rows[$key]['created_column_value'] = explode(" ", $row['created'])[0];	
		}
		
		return $rows;
	}
	
	function get_article($id) {
		$query = "SELECT articles.*, app.users.email as user FROM articles, app.users WHERE articles.user_id = app.users.id AND articles.id = ".$id;
		$row = $this->sql->get_row($query, 1, NULL, true);	
		
		return $row;
	}
	
	function _category($v) {
		$this->statement->generate($v, "categories");
		$this->sql->execute($this->statement->get());
		$category_id = $this->sql->last_id($v);	
		return $category_id;
	}
	
	function categories_options() {
		$query = "SELECT id, title as value FROM categories";	
		return $this->sql->get_rows($query, 1);
	}
	
	function categories_table($search_term, $offset) {
		$query = "SELECT * FROM categories";
		return $this->sql->get_rows($query, 1);	
	}
	
	function category_order_table($search_term, $offset) {
		$query = "SELECT * FROM categories ORDER BY category_order ASC";
		return $this->sql->get_rows($query, 1);
	}
	
	function category_order_set_order($v) {
		foreach($v as $key => $value) {
			if($value != '-1') {
				$query = "UPDATE categories SET category_order = ".$key." WHERE id = ".$value;
				$this->sql->execute($query);
			}
		}
	}
	
	function _article($v) {
		$url_parsed = parse_url($v['link']);
		$v['source'] = $url_parsed['host'];
		$this->statement->generate($v, "articles");
		$this->sql->execute($this->statement->get());
		$id = $this->sql->last_id($v);	
		return $id;
	}
	
	function get_category_select() {
		$query = "SELECT * FROM categories ORDER BY category_order ASC";
		return $this->sql->get_rows($query, 1);
	}
	
	function top_articles_votes($id) {
		$query = "SELECT COUNT(*) as count FROM votes WHERE article_id = ".$id;	
		$votes = $this->sql->get_row($query, 1)['count'];
		$query = "SELECT COUNT(*) as count FROM votes WHERE article_id = ".$id." AND user_id = ".$this->user_id;
		$voted = $this->sql->get_row($query, 1)['count'];
		
		return array(
			'votes' => $votes,
			'voted' => $voted
		);
	}
	
	function top_articles_vote($id) {
		$v = array(
			'article_id' => $id
		);
		$this->statement->generate($v, "votes");
		$this->sql->execute($this->statement->get());
		return true;
	}
	
	function _make_comment($v) {
		$v['reference_type'] = $this->reference_type($v['reference_type']);
		if(!isset($v['parent_id']) || $v['parent_id'] == NULL) {
			$v['parent_id'] = '-1';	
		}
		$this->statement->generate($v, "discussion", NULL, false, true);
		$this->sql->execute($this->statement->get());
		return $this->sql->last_id($v);	
	}
	
	function get_discussion($reference_id, $reference_type, $parent_id=-1) {
		$reference_type = $this->reference_type($reference_type);
		$query = "SELECT discussion.*, app.users.email as email FROM discussion, app.users WHERE discussion.user_id = app.users.id AND reference_id = ".$reference_id." AND reference_type = ".$reference_type." AND parent_id = ".$parent_id;
		$rows = $this->sql->get_rows($query, 1, NULL, true);
		foreach($rows as $key => $row) {
			$rows[$key]['children'] = $this->get_discussion($reference_id, $reference_type, $row['id']);
		}
		return $rows;
	}*/
}

?>