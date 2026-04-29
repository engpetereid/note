<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyReading extends Model
{
    protected $fillable = ['day_number', 'ot_passage_year_1', 'ot_passage_year_2' , 'nt_passage', 'explanation'];
}
