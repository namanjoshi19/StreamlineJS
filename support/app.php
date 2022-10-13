<?

include '../base/base.php';

class app extends base {
	
	public $streamline;
	public $about;
	
	public function __construct() {
		parent::__construct('about', "/support");
		
		//if($this->user_id != -1) {
			$this->streamline = new streamline($this->sql, $this->statement, $this->user_id);
			$this->about = new about($this->sql, $this->statement, $this->user_id);
		//}
	}
	
}

?>