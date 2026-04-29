<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrackingLog extends Model
{
    protected $fillable = ['user_id', 'activity_id', 'date', 'status'];

    protected $casts = [
        'date' => 'date',
        'status' => 'boolean',
    ];
}
