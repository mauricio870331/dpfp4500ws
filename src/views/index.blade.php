@extends('layouts.dpfp_layout')

@section('content')
<table style="border: 1px solid">
    <tr>
        <td style="border: 1px solid">Name</td>
        <td style="border: 1px solid">Email</td>
        <td style="border: 1px solid">Actions</td>
    </tr>
    @foreach($users as $user)
    <tr >
        <td style="border: solid 1px black">{{$user->name}}</td>
        <td style="border: solid 1px black"> {{$user->email}}</td>
        <td style="border: solid 1px black"><label style="cursor: pointer" id="{{$user->id}}" class="add_finger"> add finger </label>|| update || delete || 
           <a href="users/{{$user->id}}/finger-list" style="font-size: 15px;margin-left: 7px;color:#03579f;" >fingerprint list</a>
        </td>
    </tr>  
    @endforeach
</table>
@endsection