<?php

header('Content-Type: application/json; charset=utf-8');

$start = microtime(true); 

if ((($_GET['word'] == "word_rus") or ($_GET['word'] == "word_rus_min")) and
    (($_GET['pril'] == "pril_rus") or ($_GET['pril'] == "pril_rus_min"))) {

    $noun = new Noun($_GET['word'], $_GET['wnum'] ?? false);
    
    $adjective = new Adjective($_GET['pril'], $_GET['pnum'] ?? false,
        $noun->resultType);

    $out = $adjective->result . ' ' . $noun->result;

} else {
    $out = 'неверные атрибуты';
}

$jsonr = [
    "result" => $out,
    "adjective" => $adjective->number,
    "noun" => $noun->number
];

echo json_encode($jsonr, JSON_UNESCAPED_UNICODE);

writeToLog(["../logs/backlog", $out, $adjective->number, $noun->number, $start]);

function writeToLog($parameters) {

    function whatDevice() {
        $strIsTrue = false;
        $strIs = "";
        
        foreach (str_split($_SERVER['HTTP_USER_AGENT']) as $i) {
            if ($i == "(") {
                $strIsTrue = true;
                continue;
            }
            if ($i == ")") break;
            if ($strIsTrue) $strIs .= $i;
        }
        return $strIs;
    }

    require "id.php";

    $resultd = getIndexNumber(false);

    $logstring = $parameters[1]
    . date(" [Y-m-d H:i:s] ")
    . $resultd
    . ' '
    . $_SERVER['HTTP_X_REAL_IP']
    . ' '
    . $_GET['pril']
    . ' '
    . $_GET['word']
    . ' pnum:'
    . $parameters[2]
    . ' wnum:'
    . $parameters[3]
    . ' '
    . (microtime(true) - $parameters[4])
    . " ["
    . whatDevice()
    . "]\n";

    file_put_contents($parameters[0], $logstring, FILE_APPEND | LOCK_EX);
}

class Dictionary {
    public $result;
    public $number;
    public $dictionaryName;
    private $content = [];
    private $length = 0;
    
    private function getFile($name) {
        $this->dictionaryName = $name;
        $this->content = explode("\n", file_get_contents("../dictionaries/" . $name . ".txt"));
        $this->length = count($this->content);
    }
    
    private function getOneWordFromArray($number) {
        if (intval($number)) {
            if ($number < $this->length) {
                $this->number = intval($number);
            } else {
                $this->number = rand(0, $this->length - 1);
            }
        } else {
            $this->number = rand(0, $this->length - 1);
        }
        
        $this->result = $this->content[$this->number];
    }
    
    public function __construct($name, $number) {
        $this->getFile($name);
        $this->getOneWordFromArray($number);
    }
}

class Noun extends Dictionary {
    public $resultType;
    private $resultEnd;
    
    private function getGender() {
        $this->resultEnd = mb_substr($this->result, -1, 1);
        
        switch ($this->resultEnd) {
            case 'и':
            case 'ы':
                $this->resultType = 1;
                break;
                
            case 'а':
            case 'я':
            case 'ь':
                $this->resultType = 2;
                break;
                
            case 'о':
            case 'е':
            case 'ё':
                $this->resultType = 3;
                break;
        }
    }

    public function __construct($name, $number) {
        parent::__construct($name, $number);
        $this->getGender();
    }        
}

class Adjective extends Dictionary {
    private $resultEnd;
    private $resultBeforeEnd;
    private $hissingLetter;

    private function conc($what) {
        $this->result = mb_substr($this->result, 0, -2) . $what;
    }
    
    private function setGender($type) {
        $this->resultEnd = mb_substr($this->result, -2, 2);
        $this->resultBeforeEnd = mb_substr($this->result, -3, -2);
        $this->hissingLetter = 
            (($this->resultBeforeEnd == 'ч') or
            ($this->resultBeforeEnd == 'ш') or
            ($this->resultBeforeEnd == 'щ'));
    
        if (($this->resultEnd == "ый") or
            ($this->resultEnd == "ий") or
            ($this->resultEnd == "ой")) {

            switch ($type) {
                case 1:
                    $this->conc($this->hissingLetter ? 'ие' : 'ые');
                    break;
                    
                case 2:
                    $this->conc('ая');
                    break;
                    
                case 3:
                    $this->conc($this->hissingLetter ? 'ее' : 'ое');
                    break;
            }
        }

        if ($this->resultEnd == "ин") {
            switch ($type) {
                case 1:
                    $this->result .= 'ы';
                    break;
                    
                case 2:
                    $this->result .= 'а';
                    break;
                    
                case 3:
                    $this->result .= 'о';
                    break;                                                
            }
        }
    }

    public function __construct($name, $number, $type) {
        parent::__construct($name, $number);
        $this->setGender($type);
    }
}

?>
