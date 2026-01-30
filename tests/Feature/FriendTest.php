<?php

use App\Models\Friendship;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

test('user can view friends index page', function () {
    $response = $this->actingAs($this->user)
        ->get('/friends');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Friends/Index')
        ->has('friends')
        ->has('pendingReceived')
        ->has('pendingSent')
    );
});

test('user can view add friends page', function () {
    $response = $this->actingAs($this->user)
        ->get('/friends/add');

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Friends/Add')
    );
});

test('user can send a friend request', function () {
    $response = $this->actingAs($this->user)
        ->post('/friends', [
            'receiver_id' => $this->otherUser->id,
        ]);

    $response->assertRedirect('/friends');

    $this->assertDatabaseHas('friendships', [
        'sender_id' => $this->user->id,
        'receiver_id' => $this->otherUser->id,
        'status' => 'pending',
    ]);
});

test('user cannot send duplicate friend request', function () {
    Friendship::create([
        'sender_id' => $this->user->id,
        'receiver_id' => $this->otherUser->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->user)
        ->post('/friends', [
            'receiver_id' => $this->otherUser->id,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
});

test('user cannot send friend request to themselves', function () {
    $response = $this->actingAs($this->user)
        ->post('/friends', [
            'receiver_id' => $this->user->id,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');
});

test('user can accept a friend request', function () {
    $friendship = Friendship::create([
        'sender_id' => $this->otherUser->id,
        'receiver_id' => $this->user->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->user)
        ->patch("/friends/{$friendship->id}/respond", [
            'status' => 'accepted',
        ]);

    $response->assertRedirect('/friends');

    $this->assertDatabaseHas('friendships', [
        'id' => $friendship->id,
        'status' => 'accepted',
    ]);
});

test('user can decline a friend request', function () {
    $friendship = Friendship::create([
        'sender_id' => $this->otherUser->id,
        'receiver_id' => $this->user->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->user)
        ->patch("/friends/{$friendship->id}/respond", [
            'status' => 'declined',
        ]);

    $response->assertRedirect('/friends');

    $this->assertDatabaseHas('friendships', [
        'id' => $friendship->id,
        'status' => 'declined',
    ]);
});

test('user can only respond to their own friend requests', function () {
    $thirdUser = User::factory()->create();
    $friendship = Friendship::create([
        'sender_id' => $this->otherUser->id,
        'receiver_id' => $thirdUser->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->user)
        ->patch("/friends/{$friendship->id}/respond", [
            'status' => 'accepted',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('error');

    // Status should remain pending
    $this->assertDatabaseHas('friendships', [
        'id' => $friendship->id,
        'status' => 'pending',
    ]);
});

test('user can remove a friend', function () {
    $friendship = Friendship::create([
        'sender_id' => $this->user->id,
        'receiver_id' => $this->otherUser->id,
        'status' => 'accepted',
    ]);

    $response = $this->actingAs($this->user)
        ->delete("/friends/{$friendship->id}");

    $response->assertRedirect('/friends');

    $this->assertDatabaseMissing('friendships', [
        'id' => $friendship->id,
    ]);
});

test('user can cancel sent friend request', function () {
    $friendship = Friendship::create([
        'sender_id' => $this->user->id,
        'receiver_id' => $this->otherUser->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($this->user)
        ->delete("/friends/{$friendship->id}");

    $response->assertRedirect('/friends');

    $this->assertDatabaseMissing('friendships', [
        'id' => $friendship->id,
    ]);
});

test('user model returns friends correctly', function () {
    // Create accepted friendship where user is sender
    Friendship::create([
        'sender_id' => $this->user->id,
        'receiver_id' => $this->otherUser->id,
        'status' => 'accepted',
    ]);

    $thirdUser = User::factory()->create();
    // Create accepted friendship where user is receiver
    Friendship::create([
        'sender_id' => $thirdUser->id,
        'receiver_id' => $this->user->id,
        'status' => 'accepted',
    ]);

    $friends = $this->user->friends();

    expect($friends)->toHaveCount(2);
    expect($friends->pluck('id')->toArray())->toContain($this->otherUser->id);
    expect($friends->pluck('id')->toArray())->toContain($thirdUser->id);
});

test('user isFriendsWith returns correct value', function () {
    Friendship::create([
        'sender_id' => $this->user->id,
        'receiver_id' => $this->otherUser->id,
        'status' => 'accepted',
    ]);

    $thirdUser = User::factory()->create();

    expect($this->user->isFriendsWith($this->otherUser->id))->toBeTrue();
    expect($this->user->isFriendsWith($thirdUser->id))->toBeFalse();
});
