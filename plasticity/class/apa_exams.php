<?

class apa_exams extends _class {	
	public $function_access = array(
		'admin' => array(
		)
	);
	
	function __construct($sql, $statement, $user_id) {
		$this->sql = $sql;
		$this->statement = $statement;
		$this->user_id = $user_id;
		
		$this->items = array();
		$this->items["exam_questions"] = new exam_question("exam_question", "exam_questions", $this, false, $this->language, "exam_id", 100);
		$this->items["exams"] = new exam("exam", "exams", $this, false, $this->language);
		
	}
		
	function get_state() {
		return array(
		);	
	}
	
	
}


?>