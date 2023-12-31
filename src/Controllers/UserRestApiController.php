<?php

namespace App\Http\Controllers\DpfpApi;

date_default_timezone_set("America/Bogota");

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DpfpModels\Fingerprint;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;


class UserRestApiController extends Controller {

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {
        $key = str_replace("Basic ", "", $request->header("Authorization"));
        $api = config("services.mhdpfp.key");
        if ($api == $key) {
            $from = $request->from;
            $query = "SELECT count(*) total FROM users u INNER JOIN fingerprints f on u.id = f.user_id";
            $rs = DB::select($query);
            $count = $rs[0]->total;
            $query2 = "SELECT u.id, f.id fingerId, f.fingerprint, u.name "
                    . " FROM users u INNER JOIN fingerprints f on u.id = f.user_id "
                    . "limit " . $from . ", 10";
            $usuarios = DB::select($query2);
            $array = array("usuarios" => $usuarios, "total" => $count);
            return $array;
        } else {
            return response(array("status" => "No tienes permisos para acceder a este recurso"), 401)
                            ->header("HTTP/1.1 401", "Unauthorized");
        }
    }

    

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) {
        $key = str_replace("Basic ", "", $request->header("Authorization"));
        $api = config("services.mhdpfp.key");
        if ($api == $key) {
            $dedo = explode("_", $request->finger_name);
            $fingerprint = new Fingerprint();
            $fingerprint->user_id = $request->user_id;
            $fingerprint->finger_name = $dedo[0] . " " . $dedo[1];
            $fingerprint->image = $this->saveImage($request->image, $request->finger_name . $request->user_id);
            $fingerprint->fingerprint = $request->fingerprint;           
            $response = $fingerprint->save();
            $arrayResponse = array("response" => $response);
            return $arrayResponse;
        } else {
            return response(array("status" => "No tienes permisos para acceder a este recurso"), 401)
                            ->header("HTTP/1.1 401", "Unauthorized");
        }
    }

    function saveImage($image, $image_name) {
        $rutaDirectorio = public_path('/storage/image_user');
        if (!File::isDirectory($rutaDirectorio)) {
            File::makeDirectory($rutaDirectorio, 0755, true);
        }
        $image = str_replace("data:image/png;base64,", "", $image);
        $image = str_replace(" ", "+", $image);
        $imageName = $image_name . ".png"; //
//        $url = Storage::put('public/image_user', base64_decode($image));
        \File::put(public_path('/storage/image_user/' . $imageName), base64_decode($image));
        return "storage/image_user/" . $imageName;
    }

    //Esta funcion se comenta debido a que no se implementa en este paquete 
    //el registro de entradas y salidas, pero puedes adaptarlo a tu gusto
//    public static function saveRecord($userId) {
//        $typeRecord = "";
//        $text = "";
//        $hoy = date("Y-m-d");
//        $query = "SELECT type_record FROM records_users WHERE user_id = " . $userId . " "
//                . "and date_record like '%" . $hoy . "%' order by date_record desc limit 1";
//        $rs = DB::select($query);
//        if (count($rs) > 0 && $rs[0]->type_record == "chek out") {
//            $text = "Ya registraste salida..!";
//        }
//        if (count($rs) == 0) {
//            $text = "Ingreso Regitrado..!";
//            $typeRecord = "chek in";
//        }
//        if (count($rs) == 1 && $text == "") {
//            $text = "Salida Registrada..!";
//            $typeRecord = "chek out";
//        }
//        if ($text != "Ya registraste salida..!") {
//            $record = new RecordUser();
//            $record->user_id = $userId;
//            $record->date_record = date("Y-m-d H:i:s");
//            $record->type_record = $typeRecord;
//            $record->save();
//        }
//        return $text;
//    }

    public function sincronizar(Request $request) {
        $key = str_replace("Basic ", "", $request->header("Authorization"));
        $api = config("services.mhdpfp.key");
        if ($api == $key) {
            $query = "SELECT u.id user_id, f.fingerprint, f.id finger_id,"
                    . " u.name "
                    . "FROM users u INNER JOIN fingerprints f on u.id = f.user_id "
                    . "WHERE f.id > " . $request->finger_id;
            $usuarios = DB::select($query);
            return $usuarios;
        } else {
            return response(array("status" => "No tienes permisos para acceder a este recurso"), 401)
                            ->header("HTTP/1.1 401", "Unauthorized");
        }
    }

    public function verify_users() {
        return view("dpfp.verify-users");
    }

    
    public function users_list() {
        $users = User::all();
        return view("dpfp.index", compact("users"));
    }    
   

    public function fingerList(User $user) {
        $finger_list = $user->fingerprints;
        return view("dpfp.finger-list", compact("user", "finger_list"));
    }

  
    public function getDataUser($user_id, $fingerId) {
        $user = User::with(['fingerprints' => function ($query) use ($fingerId) {
                        $query->where('id', $fingerId);
                    }])->find($user_id);
        $user["fingerprint"] = $user->fingerprints[0];
        unset($user["fingerprints"]);
        return $user;
    }
}
